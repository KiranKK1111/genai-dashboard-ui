/**
 * Session Management Hook
 * Handles chat session initialization and loading from backend
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { useAuth } from '../contexts/AuthContext';
import {
  loadSessions,
  hydrateChatHistory,
  selectChat,
  deleteChat,
  renameSessionTitle,
  setError,
} from '../features/chatSlice';
import type { ChatMessage } from '../features/chatSlice';
import {
  createNewSession,
  listSessions,
  getSessionHistory,
  deleteSession as apiDeleteSession,
  renameSession as apiRenameSession,
} from '../api';
import type { SessionMetadata } from '../types/sessionState';

const isDev = process.env.NODE_ENV === 'development';
const log = (...args: any[]) => { if (isDev) console.log(...args); };

export function useSessionManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  const extractSessionMetadata = (msg: any): SessionMetadata | undefined => {
    if (!msg.session_state && !msg.tool_calls_log) return undefined;
    return {
      session_state: msg.session_state || null,
      tool_calls_log: msg.tool_calls_log || [],
      ambiguity_events: msg.ambiguity_events || [],
      state_updated_at: msg.state_updated_at,
      confidence_threshold: msg.confidence_threshold || 0.6,
    };
  };

  const mapHistoryToMessages = (
    sessionId: string,
    history: Awaited<ReturnType<typeof getSessionHistory>>
  ): { messages: ChatMessage[]; title: string } => {
    const messages: ChatMessage[] = [];

    for (let i = 0; i < history.messages.length; i++) {
      const msg = history.messages[i];
      if (!msg.query) continue;

      messages.push({
        id: `${sessionId}-user-${i}`,
        role: 'user',
        content: msg.query,
        timestamp: msg.queried_at || msg.updated_at || '',
        backendMessageId: msg.id || undefined,
      });

      if (msg.response && Object.keys(msg.response).length > 0) {
        const filesUsed = msg?.response?.artifacts?.files_used;
        if (Array.isArray(filesUsed) && filesUsed.length > 0) {
          const lastUser = messages[messages.length - 1];
          if (lastUser?.role === 'user') {
            lastUser.attachments = filesUsed.map(
              (f: any) => f.filename || f.file_id || 'file'
            );
          }
        }

        let messageContent = '';
        if (msg.response.assistant?.content && Array.isArray(msg.response.assistant.content)) {
          messageContent = msg.response.assistant.content[0]?.text || 'Response received';
        } else if (msg.response.message) {
          messageContent = msg.response.message;
        } else {
          messageContent = 'Response received';
        }

        const stopped =
          messageContent.toLowerCase().includes('stopped by user') ||
          messageContent.toLowerCase().includes('was stopped') ||
          messageContent.toLowerCase().includes('execution was stopped');

        if (stopped) {
          messages.pop();
          continue;
        }

        messages.push({
          id: `${sessionId}-assistant-${i}`,
          role: 'assistant',
          content: messageContent,
          timestamp: msg.responded_at || msg.updated_at || '',
          response: msg.response,
          relatedQueries:
            msg.response.followups?.map((f: any) => f.text) ||
            msg.response.related_queries ||
            [],
          confidence: msg.response.routing?.confidence,
          sessionMetadata: extractSessionMetadata(msg),
          backendMessageId: msg.id || msg.response?.id || undefined,
          feedback: msg.feedback || null,
        });
      }
    }

    const firstMsg = history.messages[0];
    let title = 'New Chat';
    if (firstMsg?.query && typeof firstMsg.query === 'string' && firstMsg.query.length > 0) {
      title = firstMsg.query.slice(0, 50);
    }

    return { messages, title };
  };

  // Initialize sessions on mount
  useEffect(() => {
    if (!token) return;

    const initializeSessions = async () => {
      try {
        log('[SessionManagement] Initializing sessions');
        const sessionsData = await listSessions(token, 1, 20);

        // Backend returns newest first; keep that order
        const sessions = sessionsData.sessions;
        dispatch(
          loadSessions(
            sessions.map((s) => ({
              sessionId: s.session_id,
              createdAt: s.created_at,
              title: s.title || undefined,
              messageCount: s.message_count,
              lastUpdated: s.last_updated || undefined,
            }))
          )
        );

        if (sessions.length > 0) {
          // Load history for all sessions in parallel (first 10 to avoid overwhelming)
          const sessionsToLoad = sessions.slice(0, 10);
          await Promise.allSettled(
            sessionsToLoad.map(async (session) => {
              try {
                const history = await getSessionHistory(token, session.session_id);
                if (!history.messages || history.messages.length === 0) {
                  dispatch(
                    hydrateChatHistory({
                      sessionId: session.session_id,
                      title: session.title || 'New Chat',
                      messages: [],
                    })
                  );
                  return;
                }
                const { messages, title } = mapHistoryToMessages(session.session_id, history);
                dispatch(
                  hydrateChatHistory({
                    sessionId: session.session_id,
                    title: session.title || title,
                    messages,
                  })
                );
              } catch (historyErr) {
                log('[SessionManagement] Failed to load history for session', session.session_id);
              }
            })
          );

          dispatch(selectChat(sessions[0].session_id));
        }
      } catch (err: any) {
        console.error('[SessionManagement] Failed to load sessions:', err);
        if (err?.response?.status === 401) {
          logout();
        } else {
          dispatch(
            setError(
              err?.response?.data?.detail ||
                'Failed to load chat sessions: ' + (err?.message || 'Unknown error')
            )
          );
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const createNewChat = useCallback(async () => {
    if (!token) return null;
    const sessionData = await createNewSession(token);
    return {
      chatId: crypto.randomUUID(),
      sessionId: sessionData.session_id,
    };
  }, [token]);

  const refreshSessions = useCallback(async () => {
    if (!token) return;
    try {
      const sessionsData = await listSessions(token, 1, 20);
      dispatch(
        loadSessions(
          sessionsData.sessions.map((s) => ({
            sessionId: s.session_id,
            createdAt: s.created_at,
            title: s.title || undefined,
            messageCount: s.message_count,
            lastUpdated: s.last_updated || undefined,
          }))
        )
      );
    } catch (err: any) {
      log('[SessionManagement] Failed to refresh sessions:', err?.message);
    }
  }, [token, dispatch]);

  const deleteChatSession = useCallback(
    async (chatId: string, sessionId: string) => {
      if (!token) return;
      // Optimistic: remove from Redux immediately
      dispatch(deleteChat(chatId));
      try {
        await apiDeleteSession(token, sessionId);
      } catch (err: any) {
        console.error('[SessionManagement] Failed to delete session:', err?.message);
        // Re-fetch to restore actual state
        await refreshSessions();
      }
    },
    [token, dispatch, refreshSessions]
  );

  const renameChatSession = useCallback(
    async (chatId: string, sessionId: string, title: string) => {
      if (!token || !title.trim()) return;
      // Optimistic update
      dispatch(renameSessionTitle({ chatId, title: title.trim() }));
      try {
        await apiRenameSession(token, sessionId, title.trim());
      } catch (err: any) {
        console.error('[SessionManagement] Failed to rename session:', err?.message);
        // Re-fetch to restore actual title
        await refreshSessions();
      }
    },
    [token, dispatch, refreshSessions]
  );

  const loadChatHistory = useCallback(
    async (_chatId: string, sessionId: string) => {
      if (!token) return;
      const history = await getSessionHistory(token, sessionId);
      const { messages } = mapHistoryToMessages(sessionId, history);
      return messages;
    },
    [token]
  );

  return {
    isInitializing,
    createNewChat,
    loadChatHistory,
    refreshSessions,
    deleteChatSession,
    renameChatSession,
  };
}
