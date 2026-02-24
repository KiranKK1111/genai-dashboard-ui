/**
 * Message Handler Hook
 * 
 * Handles sending messages and receiving responses.
 * Uses the new unified /query endpoint that integrates with the backend DecisionEngine.
 */

import { useCallback } from 'react';
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
import { sendQuery, createNewSession } from '../api';
import type { ClarifyingQuestion, DynamicResponse } from '../api';
import { useAuth } from '../contexts/AuthContext';

export function useMessageHandler(chatId: string, sessionId: string | undefined) {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useAuth();
  const chats = useSelector((state: RootState) => state.chat.chats);

  // Helper function to extract clarifying question text from string or object
  const extractClarifyingQuestionText = (cq: string | ClarifyingQuestion | null | undefined): string | null => {
    if (!cq) return null;
    if (typeof cq === 'string') return cq;
    if (typeof cq === 'object' && cq.question) return cq.question;
    return null;
  };

  const handleSendMessage = useCallback(
    async (content: string, files?: File[]) => {
      if (!token) return;

      // Create a session if one doesn't exist yet
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        try {
          const sessionResponse = await createNewSession(token);
          if (sessionResponse.session_id) {
            currentSessionId = sessionResponse.session_id;
            // Update the chat with the new session ID
            dispatch(setChatSessionId({ chatId, sessionId: currentSessionId }));
          }
        } catch (err) {
          console.error('Failed to create session:', err);
          dispatch(setError('Failed to create chat session'));
          dispatch(setLoading(false));
          return;
        }
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        attachments: files ? files.map(f => f.name) : undefined,
      };
      dispatch(addUserMessage({ chatId, message: userMessage }));
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        // Call the unified /query endpoint
        const responseWrapper = await sendQuery(token, currentSessionId!, content, files);
        const response = responseWrapper.response;

        const messageId = (Date.now() + 1).toString();
        
        // Extract clarifying question text
        const clarifyingQuestionText = extractClarifyingQuestionText(response.clarifying_question);
        
        // Build message content from response
        let messageContent = response.message || '';
        
        // Try to get content from structured response (assistant.content)
        if (!messageContent && response.assistant?.content && Array.isArray(response.assistant.content)) {
          const firstBlock = response.assistant.content[0];
          messageContent = firstBlock?.text || 'Response received';
        }
        
        // If message is empty but clarifying_question exists, use clarifying_question
        if (!messageContent || messageContent.trim() === '') {
          messageContent = clarifyingQuestionText || 'Query processed successfully';
        }

        // Extract followups from the response (can be either followups or related_queries)
        const followups = response.followups?.map((f: any) => f.text) || response.related_queries || [];

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
        };

        dispatch(addAssistantMessage({ chatId, message: assistantMessage }));
        dispatch(
          updateMessageWithMetadata({
            chatId,
            messageId,
            relatedQueries: followups,
            confidence: response.routing?.confidence || response.confidence,
            isRefinement: false,
          })
        );

        if (followups && followups.length > 0) {
          dispatch(
            setFollowUpSuggestions({
              chatId,
              suggestions: followups,
            })
          );
        }
      } catch (err: any) {
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
        dispatch(addAssistantMessage({ chatId, message: assistantMessage }));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [token, sessionId, chatId, dispatch]
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
        const followUpQuery = `${originalQuery} [Clarification: ${confirmation}]`;
        await handleSendMessage(followUpQuery);
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

  return { handleSendMessage, handleRefineResponse, handleClarifyingQuestionConfirm };
}
