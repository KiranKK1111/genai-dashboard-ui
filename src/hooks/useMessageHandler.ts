/**
 * Message Handler Hook
 * 
 * Handles sending messages and receiving responses.
 * Uses the new unified /query endpoint that integrates with the backend DecisionEngine.
 */

import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  addUserMessage,
  addAssistantMessage,
  setLoading,
  setError,
  clearError,
  updateMessageWithMetadata,
  setFollowUpSuggestions,
  setRefining,
  replaceClarifyingQuestionWithResponse,
  setChatSessionId,
} from '../features/chatSlice';
import type { ChatMessage } from '../features/chatSlice';
import { sendQuery, createNewSession, openProgressStream, stopMessage } from '../api';
import type { ClarifyingQuestion, DynamicResponse } from '../api';
import { useAuth } from '../contexts/AuthContext';

export function useMessageHandler(
  chatId: string, 
  sessionId: string | undefined,
  refreshSessions?: () => Promise<void>
) {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useAuth();
  const chats = useSelector((state: RootState) => state.chat.chats);

  // Tracks the AbortController for the current in-flight request
  const abortControllerRef = useRef<AbortController | null>(null);

  // Tracks the backend message UUID of the current in-flight request
  const currentBackendMessageIdRef = useRef<string | null>(null);

  // AbortController for the progress SSE stream
  const progressAbortRef = useRef<AbortController | null>(null);

  // Current step label streamed from the backend
  const [currentProgressStep, setCurrentProgressStep] = useState<string>("");

  // Step queue – ensures each label is visible for a minimum duration even when
  // the backend emits multiple steps in rapid succession
  const stepQueueRef = useRef<string[]>([]);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushStepQueue = useCallback(() => {
    const next = stepQueueRef.current.shift();

    if (next === undefined) {
      stepTimerRef.current = null;
      return;
    }

    setCurrentProgressStep(next);
    stepTimerRef.current = setTimeout(flushStepQueue, 700); // each step visible for ~700 ms
  }, []);

  const enqueueStep = useCallback((label: string) => {
    stepQueueRef.current.push(label);

    // Only kick off the timer if it isn’t already running
    if (!stepTimerRef.current) {
      flushStepQueue();
    }
  }, [flushStepQueue]);

  const clearStepQueue = useCallback(() => {
    stepQueueRef.current = [];

    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }

    setCurrentProgressStep("");
  }, []);

  // Helper function to extract clarifying question text from string or object
  // Also checks the metadata.clarification_question path used by the backend
  const extractClarifyingQuestionText = (
    cq: string | ClarifyingQuestion | null | undefined,
    response?: any
  ): string | null => {

    // Prefer metadata.clarification_question (the path the backend uses)
    const metaCq = response?.metadata?.clarification_question;

    if (metaCq) {
      if (typeof metaCq === "string") return metaCq;
      if (typeof metaCq === "object" && metaCq.question) return metaCq.question;
    }

    // Fall back to top-level clarifying_question
    if (cq) {
      if (typeof cq === "string") return cq;
      if (typeof cq === "object" && cq.question) return cq.question;
    }

    return null;
  };

  const handleSendMessage = useCallback(
    async (content: string, files?: File[], overrideChatId?: string) => {
      if (!token) return;

      // Use override chatId if provided, otherwise use the hook's chatId
      const effectiveChatId = overrideChatId || chatId;
      if (!effectiveChatId) {
        console.error('[MessageHandler] No chatId available');
        return;
      }

      abortControllerRef.current?.abort();
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;
      
      // Generate a tracking ID for stop functionality
      // This is separate from the backend database ID used for feedback
      const trackingId = crypto.randomUUID();
      currentBackendMessageIdRef.current = trackingId;
      console.log("[MessageHandler] Generated tracking ID for stop:", trackingId);

      // Add user message IMMEDIATELY for instant visual feedback
      // This ensures WelcomeScreen disappears right away
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        attachments: files ? files.map(f => f.name) : undefined,
      };
      dispatch(addUserMessage({ chatId: effectiveChatId, message: userMessage }));
      dispatch(setLoading(true));
      dispatch(clearError());
      console.log("[MessageHandler] User message added to chat:", effectiveChatId);

      // Create a session if one doesn't exist yet
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        try {
          console.log("[MessageHandler] Creating new session...");
          const sessionResponse = await createNewSession(token);
          if (sessionResponse.session_id) {
            currentSessionId = sessionResponse.session_id;
            // Update the chat with the new session ID
            dispatch(setChatSessionId({ chatId: effectiveChatId, sessionId: currentSessionId }));
            console.log("[MessageHandler] New session created:", currentSessionId);
            
            // Silently refresh sessions to update sidebar (after session is linked to chat)
            if (refreshSessions) {
              refreshSessions().catch(err => 
                console.warn("[MessageHandler] Failed to refresh sessions:", err)
              );
            }
          }
        } catch (err) {
          console.error('[MessageHandler] Failed to create session:', err);
          dispatch(setError('Failed to create chat session'));
          dispatch(setLoading(false));
          return;
        }
      }

      // Fire off the query immediately (do NOT await yet) so the backend
      // registers the progress queue before we open the SSE stream.
      const queryPromise = sendQuery(
        token,
        currentSessionId!,
        content,
        files,
        newAbortController.signal,
        trackingId // Pass tracking ID to backend
      );

      progressAbortRef.current?.abort();
      const progressAbort = new AbortController();
      progressAbortRef.current = progressAbort;
      clearStepQueue();
      
      // Use tracking ID for progress stream
      ; (async () => {
        await new Promise((r) => setTimeout(r, 50));
        try {
          // Use the tracking ID directly for progress stream
          if (trackingId) {
            console.log("[ProgressStream] Opening progress stream for trackingId:", trackingId);
            let eventCount = 0;
            for await (const evt of openProgressStream(
              token,
              trackingId,
              progressAbort.signal
            )) {
              eventCount++;
              console.log(`[ProgressStream] Event #${eventCount}:`, evt);
              if (evt.step !== "done" && evt.step !== "complete") {
                enqueueStep(evt.label);
              } else {
                console.log("[ProgressStream] Received completion event:", evt.step);
              }
            }
            console.log("[ProgressStream] Stream completed. Total events:", eventCount);
          }
        } catch (error) {
          console.log("[ProgressStream] Stream error or aborted:", error);
          // stream closed or aborted — expected
        }
      })();

      try {
        const responseWrapper = await queryPromise;
        const response = responseWrapper.response;

        // Get the database message ID from backend response
        // Check both top-level (responseWrapper.id) and inside response (response.id)
        const databaseMessageId = responseWrapper.id || response?.id;
        
        // Keep tracking ID in ref for stop calls (already set earlier)
        // Database ID will be used for feedback
        
        console.log("[MessageHandler] Response ID Debug:", {
          trackingId: trackingId,
          databaseMessageId: databaseMessageId,
          wrapperLevelId: responseWrapper.id,
          responseLevelId: response?.id,
          currentRefValue: currentBackendMessageIdRef.current,
          hasMissingId: !databaseMessageId,
          responseWrapperKeys: Object.keys(responseWrapper),
          responseKeys: response ? Object.keys(response) : [],
        });
        console.log("[MessageHandler] Full responseWrapper:", responseWrapper);
        
        if (!databaseMessageId) {
          console.error("[MessageHandler] CRITICAL: Backend did not return database message ID! Feedback will not work.");
        }

        const messageId = (Date.now() + 1).toString();

        // Extract clarifying question text (checks both metadata.clarification_question and top-level)
        const clarifyingQuestionText = extractClarifyingQuestionText(
          response.clarifying_question,
          response
        );

        // Build message content for the typewriter animation
        // Prefer the full text from response.assistant.content blocks so the
        // animation matches exactly what ResponseBeautifier will render.

        let messageContent = '';

        if (response.assistant?.content && Array.isArray(response.assistant.content)) {
          const textParts: string[] = response.assistant.content
            .filter((b: any) => b.text && typeof b.text === "string")
            .map((b: any) => {
              if (b.type === "bullets" || b.type === "numbered") {
                return (b.items as string[]).join("\n") ?? b.text;
              }
              return b.text as string;
            });

          messageContent = textParts.join("\n\n");
        }

        // Fallback to response.message for non-structured responses
        if (!messageContent) {
          messageContent = response.message || '';
        }


        // If message is empty but clarifying_question exists, use clarifying_question
        if (!messageContent || messageContent.trim() === '') {
          messageContent = clarifyingQuestionText || 'Query processed successfully';
        }

        // Extract followups: prefer suggested_questions (LLM-generated by QuestionBackEngine),
        // then followups array, then related_queries (legacy)
        const followups: string[] =
          (response.suggested_questions?.length ? response.suggested_questions : null) ??
          response.followups?.map((f: any) => f.text) ??
          response.related_queries ??
          [];

        const assistantMessage: ChatMessage = {
          id: messageId,
          role: 'assistant',
          content: messageContent,
          timestamp: new Date().toISOString(),
          response: response,
          relatedQueries: followups,
          confidence: response.routing?.confidence || response.confidence,
          clarifyingQuestion: clarifyingQuestionText,
          originalQuery: content,
          backendMessageId: databaseMessageId, // Use database ID for feedback
          feedback: null,
        };

        dispatch(addAssistantMessage({ chatId: effectiveChatId, message: assistantMessage }));
        dispatch(
          updateMessageWithMetadata({
            chatId: effectiveChatId,
            messageId,
            relatedQueries: followups,
            confidence: response.routing?.confidence || response.confidence,
            isRefinement: false,
          })
        );

        // Always update follow-up suggestions (clear old ones when empty)
        dispatch(
          setFollowUpSuggestions({
            chatId: effectiveChatId,
            suggestions: followups && followups.length > 0 ? followups : [],
          })
        );
      } catch (err: any) {
        // Check for canceled request - don't show any error or response
        const isCanceled = 
          err.name === 'AbortError' || 
          err.name === 'CanceledError' ||
          err.code === 'ERR_CANCELED' ||
          err.message === 'canceled' ||
          err.message === 'CanceledError' ||
          err.message === 'ERR_CANCELED' ||
          newAbortController.signal.aborted;
        
        if (isCanceled) {
          console.log("[MessageHandler] Request was canceled, no error shown");
          return;
        }
        
        const errorMsg =
          err?.response?.data?.detail ||
          err?.message ||
          'An error occurred while processing your request.';
        dispatch(setError(errorMsg));

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        };
        dispatch(addAssistantMessage({ chatId: effectiveChatId, message: assistantMessage }));
      } finally {
        progressAbortRef.current?.abort();
        clearStepQueue();
        dispatch(setLoading(false));
      }
    },
    [token, sessionId, chatId, dispatch, enqueueStep, clearStepQueue, refreshSessions]
  );

  // Refinement is handled through follow-up queries in the new architecture
  const handleRefineResponse = useCallback(
    async (feedback: string) => {
      // In the new architecture, refinement happens through follow-up queries
      // Just send the feedback as a new query
      await handleSendMessage(feedback);
    },
    [handleSendMessage]
  );

  const handleClarifyingQuestionConfirm = useCallback(
    async (confirmation: string, originalQuery: string) => {
      console.log('handleClarifyingQuestionConfirm called with:', {
        confirmation,
        originalQuery,
        token: token ? 'present' : 'missing',
        sessionId: sessionId ? 'present' : 'missing',
      });

      if (!token || !sessionId) return;

      // For clarifying questions: send the confirmation as a follow-up query
      // This allows the backend to re-process with the clarification
      try {
        await handleSendMessage(confirmation);
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to process clarification';
        dispatch(setError(errorMsg));
      }
    },
    [token, sessionId, chatId, dispatch, handleSendMessage]
  );

  const stopCurrentRequest = useCallback(async () => {
    // Abort the HTTP request
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    // Abort the progress stream
    progressAbortRef.current?.abort();
    progressAbortRef.current = null;

    clearStepQueue();

    // Get the tracking ID (used for stop endpoint)
    const trackingId = currentBackendMessageIdRef.current;
    currentBackendMessageIdRef.current = null;

    dispatch(setLoading(false));

    if (trackingId && token) {
      try {
        console.log("[MessageHandler] Calling stop endpoint with tracking ID:", trackingId);
        await stopMessage(token, trackingId);
        console.log("[MessageHandler] Backend task stopped for trackingId:", trackingId);
      } catch (err) {
        // Best-effort — don't surface stop errors to the user
        console.warn("[MessageHandler] stopMessage API error:", err);
      }
    } else {
      console.warn("[MessageHandler] No tracking ID available for stop request");
    }
  }, [token, dispatch, clearStepQueue]);

  return { 
    handleSendMessage, 
    handleRefineResponse, 
    handleClarifyingQuestionConfirm, 
    stopCurrentRequest, 
    currentProgressStep 
  };
}
