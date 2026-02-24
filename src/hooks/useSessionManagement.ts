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
  setChatSessionId,
  setError,
} from '../features/chatSlice';
import type { ChatMessage } from '../features/chatSlice';
import { createNewSession, listSessions, getSessionHistory } from '../api';
import type { SessionMetadata } from '../types/sessionState';

export function useSessionManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, logout } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * Extract session metadata from backend response
   */
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

  // Initialize sessions on mount
  useEffect(() => {
    if (!token) return;

    const initializeSessions = async () => {
      try {
        console.log('[SessionManagement] Initializing sessions with token');
        const sessionsData = await listSessions(token);
        console.log('[SessionManagement] Received sessions:', sessionsData.sessions);
        
        dispatch(
          loadSessions(
            sessionsData.sessions.map((s) => ({
              sessionId: s.session_id,
              createdAt: s.created_at,
            }))
          )
        );

        // Load full history for all sessions
        if (sessionsData.sessions.length > 0) {
          console.log('[SessionManagement] Loading history for', sessionsData.sessions.length, 'sessions');
          for (const session of sessionsData.sessions) {
            try {
              console.log('[SessionManagement] Loading history for session:', session.session_id);
              const history = await getSessionHistory(token, session.session_id);
              console.log('[SessionManagement] Loaded', history.messages.length, 'messages for session:', session.session_id);
              
              if (!history.messages || history.messages.length === 0) {
                console.log('[SessionManagement] No messages in history for session:', session.session_id);
                dispatch(
                  hydrateChatHistory({
                    sessionId: session.session_id,
                    title: 'Chat',
                    messages: [],
                  })
                );
                continue;
              }
              
              const messages: ChatMessage[] = [];
              
              // Map backend message structure to frontend chat messages
              // Each backend message contains either a user query or assistant response
              history.messages.forEach((msg, index) => {
                // Handle user query messages
                if (msg.response_type === 'user_query' && msg.query) {
                  messages.push({
                    id: `${session.session_id}-user-${index}`,
                    role: 'user',
                    content: msg.query,
                    timestamp: msg.queried_at || msg.created_at,
                  });
                }
                
                // Handle assistant response messages
                if (msg.response_type === 'standard' && msg.response) {
                  let messageContent = '';
                  
                  // Try to get content from structured response
                  if (msg.response.assistant?.content && Array.isArray(msg.response.assistant.content)) {
                    const firstBlock = msg.response.assistant.content[0];
                    messageContent = firstBlock?.text || 'Response received';
                  } else if (msg.response.message) {
                    messageContent = msg.response.message;
                  } else {
                    messageContent = 'Response received';
                  }
                  
                  const assistantMessage: ChatMessage = {
                    id: `${session.session_id}-assistant-${index}`,
                    role: 'assistant',
                    content: messageContent,
                    timestamp: msg.responded_at || msg.created_at,
                    response: msg.response, // Attach full response for rendering with visualizations
                    relatedQueries: msg.response.followups?.map((f: any) => f.text) || [],
                    confidence: msg.response.routing?.confidence,
                    sessionMetadata: extractSessionMetadata(msg), // Extract session state
                  };
                  
                  messages.push(assistantMessage);
                }
              });
              
              const firstMessage = history.messages[0];
              let title = 'Chat';
              if (firstMessage) {
                const messageText = firstMessage.query || firstMessage.content;
                if (messageText && typeof messageText === 'string' && messageText.length > 0) {
                  title = messageText.slice(0, 50);
                }
              }
              
              console.log('[SessionManagement] Hydrating chat history with title:', title, 'messages:', messages.length);
              dispatch(
                hydrateChatHistory({
                  sessionId: session.session_id,
                  title,
                  messages,
                })
              );
            } catch (historyErr: any) {
              console.error('[SessionManagement] Failed to load history for session', session.session_id, historyErr);
            }
          }
          
          if (sessionsData.sessions.length > 0) {
            const firstSessionId = sessionsData.sessions[0].session_id;
            console.log('[SessionManagement] Selecting first session:', firstSessionId);
            dispatch(selectChat(firstSessionId));
          }
        } else {
          console.log('[SessionManagement] No sessions found');
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
  }, [token, dispatch, logout]);

  const createNewChat = useCallback(async () => {
    if (!token) return null;

    try {
      const sessionData = await createNewSession(token);
      return {
        chatId: Date.now().toString(),
        sessionId: sessionData.session_id,
      };
    } catch (err: any) {
      throw err;
    }
  }, [token]);

  const loadChatHistory = useCallback(
    async (chatId: string, sessionId: string) => {
      if (!token) return;

      try {
        const history = await getSessionHistory(token, sessionId);
        const messages: ChatMessage[] = [];
        
        // Map backend message structure to frontend chat messages
        history.messages.forEach((msg, index) => {
          // Handle user query messages
          if (msg.response_type === 'user_query' && msg.query) {
            messages.push({
              id: `${sessionId}-user-${index}`,
              role: 'user',
              content: msg.query,
              timestamp: msg.queried_at || msg.created_at,
            });
          }
          
          // Handle assistant response messages
          if (msg.response_type === 'standard' && msg.response) {
            let messageContent = '';
            
            // Try to get content from structured response
            if (msg.response.assistant?.content && Array.isArray(msg.response.assistant.content)) {
              const firstBlock = msg.response.assistant.content[0];
              messageContent = firstBlock?.text || 'Response received';
            } else if (msg.response.message) {
              messageContent = msg.response.message;
            } else {
              messageContent = 'Response received';
            }
            
            const assistantMessage: ChatMessage = {
              id: `${sessionId}-assistant-${index}`,
              role: 'assistant',
              content: messageContent,
              timestamp: msg.responded_at || msg.created_at,
              response: msg.response, // Attach full response with visualizations
              relatedQueries: msg.response.followups?.map((f: any) => f.text) || [],
              confidence: msg.response.routing?.confidence,
              sessionMetadata: extractSessionMetadata(msg), // Extract session state
            };
            
            messages.push(assistantMessage);
          }
        });
        
        return messages;
      } catch (err: any) {
        console.error('[SessionManagement] Failed to load chat history:', err);
        throw err;
      }
    },
    [token]
  );

  return {
    isInitializing,
    createNewChat,
    loadChatHistory,
  };
}
