import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, IconButton, Tooltip, Badge } from '@mui/material';
import { ChatSidebar } from './ChatSidebar';
import { ChatInterface } from './ChatInterface';
import { SessionDebugPanel } from './SessionDebugPanel';
import { Bug } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  newChat,
  selectChat,
  setLoading,
  setError,
  clearError,
  setChatSessionId,
  hydrateChatHistory,
} from '../features/chatSlice';
import { useSessionManagement } from '../hooks/useSessionManagement';
import { useMessageHandler } from '../hooks/useMessageHandler';

export function Dashboard() {
  const chats = useSelector((state: RootState) => state.chat.chats);
  const currentChatId = useSelector((state: RootState) => state.chat.currentChatId);
  const isLoading = useSelector((state: RootState) => state.chat.isLoading);
  const error = useSelector((state: RootState) => state.chat.error);
  const dispatch = useDispatch<AppDispatch>();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const { isInitializing, createNewChat, loadChatHistory } = useSessionManagement();
  
  const currentChat = chats.find((c) => c.id === currentChatId) || null;
  const { handleSendMessage, handleRefineResponse, handleClarifyingQuestionConfirm } = useMessageHandler(
    currentChatId || '',
    currentChat?.sessionId
  );

  // Get the latest message's session metadata
  const latestSessionMetadata = currentChat?.messages && currentChat.messages.length > 0
    ? currentChat.messages.filter((m) => m.role === 'assistant' && m.sessionMetadata)[
        currentChat.messages.filter((m) => m.role === 'assistant' && m.sessionMetadata).length - 1
      ]?.sessionMetadata || currentChat?.sessionMetadata
    : currentChat?.sessionMetadata;

  const handleNewChat = async (): Promise<{ chatId: string; sessionId: string } | null> => {
    try {
      dispatch(clearError());
      dispatch(setLoading(true));

      const result = await createNewChat();
      if (!result) return null;

      dispatch(newChat({ title: 'New Chat', id: result.chatId }));
      dispatch(selectChat(result.chatId));
      dispatch(setChatSessionId({ chatId: result.chatId, sessionId: result.sessionId }));

      return result;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        'Failed to create new chat session';
      dispatch(setError(errorMsg));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSelectChat = async (chatId: string) => {
    console.log('[Dashboard] handleSelectChat called with chatId:', chatId);
    dispatch(selectChat(chatId));

    const chat = chats.find((c) => c.id === chatId);
    console.log('[Dashboard] Found chat:', chat?.id, 'sessionId:', chat?.sessionId, 'messages:', chat?.messages?.length);
    
    if (chat?.sessionId && (!chat.messages || chat.messages.length === 0)) {
      try {
        console.log('[Dashboard] Loading chat history for session:', chat.sessionId);
        dispatch(setLoading(true));
        const messages = await loadChatHistory(chatId, chat.sessionId);
        console.log('[Dashboard] Loaded messages:', messages?.length);
        if (messages && messages.length > 0) {
          dispatch(
            hydrateChatHistory({
              sessionId: chat.sessionId,
              title: chat.title,
              messages,
            })
          );
          console.log('[Dashboard] Hydrated chat history');
        }
      } catch (err: any) {
        console.error('[Dashboard] Error loading chat history:', err);
        dispatch(
          setError(
            err?.response?.data?.detail ||
              'Failed to load chat history'
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    } else {
      console.log('[Dashboard] Chat already has messages or no sessionId, skipping history load');
    }
  };

  // Initialize with a new chat if no chats exist
  useEffect(() => {
    if (!isInitializing && chats.length === 0 && !currentChatId) {
      console.log('[Dashboard] No chats exist, creating a new one on mount');
      handleNewChat();
    }
  }, [isInitializing, chats.length, currentChatId]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', flexDirection: 'column' }}>
      {error && (
        <Alert
          severity="error"
          onClose={() => dispatch(clearError())}
          sx={{ margin: 1, zIndex: 100 }}
        >
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <ChatSidebar
          chats={chats.map((c) => ({
            id: c.id,
            title: c.title,
            timestamp: new Date(c.createdAt),
          }))}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {/* Debug Panel Toggle Button */}
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
            <Tooltip title={latestSessionMetadata ? "View session debug info" : "No session data"}>
              <span>
                <Badge
                  badgeContent={latestSessionMetadata?.ambiguity_events?.filter((e) => !e.resolved).length || 0}
                  color="error"
                >
                  <IconButton
                    onClick={() => setIsDebugPanelOpen(true)}
                    disabled={!latestSessionMetadata}
                    sx={{
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <Bug size={20} />
                  </IconButton>
                </Badge>
              </span>
            </Tooltip>
          </Box>

          <ChatInterface
            key={currentChatId} // Force remount when switching chats
            messages={currentChat?.messages || []}
            onSendMessage={handleSendMessage}
            onRefineResponse={handleRefineResponse}
            followUpSuggestions={currentChat?.followUpSuggestions}
            isRefining={currentChat?.isRefining || false}
            isLoading={isLoading}
            onStopRequest={() => {
              dispatch(setLoading(false));
            }}
            onClarifyingQuestionConfirm={handleClarifyingQuestionConfirm}
          />
        </Box>
      </Box>

      {/* Debug Panel Drawer */}
      <SessionDebugPanel
        sessionMetadata={latestSessionMetadata}
        isOpen={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
      />
    </Box>
  );
}