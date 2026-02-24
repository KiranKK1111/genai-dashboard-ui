import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Sparkles, ChevronDown } from 'lucide-react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { ChatInputArea } from './ChatInputArea';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageRow } from './MessageRow';
import { LoadingDots } from './LoadingDots';
import { ChatHeader } from './ChatHeader';
import {
  ChatContainer,
  MessagesWrapper,
  VirtuosoContainer,
  VirtuosoListWrapper,
  InputContainer,
  GradientAvatar,
  ChatInnerBox,
} from './ChatInterface.styles';
import type { ChatInterfaceProps, Message } from './ChatInterface.types';

export type { Message, ChatInterfaceProps };


export function ChatInterface({
  messages,
  onSendMessage,
  onRefineResponse,
  onClarifyingQuestionConfirm,
  followUpSuggestions,
  isRefining,
  isLoading,
  onStopRequest,
}: ChatInterfaceProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Simple debounced scroll handler to prevent stack overflow
  const handleScroll = useCallback((isAtBottomState: boolean) => {
    setIsAtBottom(isAtBottomState);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => Math.max(0, prev - 1));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    // Handle dropped files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Dispatch custom event to ChatInputArea with files
      const files = Array.from(e.dataTransfer.files);
      const event = new CustomEvent('filesDropped', { detail: { files } });
      window.dispatchEvent(event);
    }
  }, []);

  // Scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    if (virtuosoRef.current && messages.length > 0) {
      try {
        virtuosoRef.current.scrollToIndex({
          index: messages.length - 1,
          align: 'end',
          behavior: 'smooth',
        });
      } catch (e) {
        // Silently ignore errors
      }
    }
  }, [messages.length]);

  // Render individual message rows
  const renderMessageRow = useMemo(() => {
    return (index: number) => {
      const message = messages[index];
      if (!message) return null;

      const isLastMessage = index === messages.length - 1;

      return (
        <>
          <MessageRow
            key={message.id}
            message={message}
            index={index}
            totalMessages={messages.length}
            isLoading={isLastMessage ? isLoading : false}
            isRefining={isLastMessage ? isRefining : false}
            followUpSuggestions={isLastMessage ? followUpSuggestions : undefined}
            onSendMessage={onSendMessage}
            onRefineResponse={isLastMessage ? onRefineResponse : undefined}
            onClarifyingQuestionConfirm={
              isLastMessage && message.clarifyingQuestion
                ? (confirmation) =>
                    onClarifyingQuestionConfirm?.(confirmation, message.originalQuery || message.content)
                : undefined
            }
          />

          {/* Loading Indicator - rendered after last message */}
          {isLastMessage && isLoading && (
            <Box
              sx={{
                padding: '16px 0 0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                animation: 'fadeIn 0.3s ease-in',
              }}
            >
              <LoadingDots size={5} color="#3b82f6" />
            </Box>
          )}
        </>
      );
    };
  }, [messages, isLoading, isRefining, followUpSuggestions, onRefineResponse, onSendMessage, onClarifyingQuestionConfirm]);

  return (
    <ChatContainer
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{ position: 'relative' }}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && dragCounter > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(4px)',
            border: '2px dashed #3b82f6',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              mb: 2,
            }}
          >
            <Sparkles size={40} color="#3b82f6" />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#3b82f6',
                mb: 1,
              }}
            >
              Add anything
            </Box>
            <Box
              sx={{
                fontSize: '14px',
                color: 'text.secondary',
              }}
            >
              Drop any file here to add it to the conversation
            </Box>
          </Box>
        </Box>
      )}
      <ChatInnerBox>
        {/* Enhanced Header */}
        <ChatHeader
          title="SDM AI Assistant"
          showIcon={true}
          onCopy={() => console.log('copy')}
          onShare={() => console.log('share')}
        />

        {/* Messages Area */}
        <MessagesWrapper sx={{ position: 'relative' }}>
          {messages.length === 0 ? (
            <WelcomeScreen onSendMessage={onSendMessage} />
          ) : (
            <>
              <VirtuosoContainer>
                <Virtuoso
                  ref={virtuosoRef}
                  style={{ height: '100%' }}
                  data={messages}
                  itemContent={(index) => renderMessageRow(index)}
                  atBottomStateChange={handleScroll}
                  components={{
                    List: React.forwardRef((props: any, ref: any) => (
                      <VirtuosoListWrapper {...props} ref={ref} />
                    ))
                  }}
                  increaseViewportBy={{
                    top: 100,
                    bottom: 100,
                  }}
                  overscan={3}
                />

              </VirtuosoContainer>

              {/* Scroll to Bottom Button */}
              {!isAtBottom && messages.length > 0 && (
                <Box
                  onClick={scrollToBottom}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s ease',
                    zIndex: 101,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.5)',
                      transform: 'translateX(-50%) translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateX(-50%) translateY(0)',
                    },
                  }}
                >
                  <ChevronDown size={24} color="white" />
                </Box>
              )}
            </>
          )}
        </MessagesWrapper>

        {/* Input Area */}
        <ChatInputArea 
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onStopRequest={onStopRequest}
        />
      </ChatInnerBox>

      {/* Footer Text */}
      <InputContainer>
        <Box sx={{ textAlign: 'center', fontSize: isMobile ? '11px' : '12px', color: 'text.secondary' }}>
          AI-powered insights for Service Desk Management
        </Box>
      </InputContainer>
    </ChatContainer>
  );
}
