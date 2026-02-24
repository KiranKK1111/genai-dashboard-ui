import React, { useState, useRef, useCallback, memo } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Send, Paperclip, X, Square } from 'lucide-react';

// Styled Components
const InputContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#0d0d0d' : '#ffffff',
  padding: '16px 16px 24px 16px',
}));

const FileChipsContainer = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
}));

interface ChatInputAreaProps {
  onSendMessage: (content: string, files?: File[]) => void;
  isLoading: boolean;
  onStopRequest?: () => void;
}

export const ChatInputArea = memo(({
  onSendMessage,
  isLoading,
  onStopRequest,
}: ChatInputAreaProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for files dropped in ChatInterface
  React.useEffect(() => {
    const handleFilesDropped = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.files) {
        setAttachedFiles(customEvent.detail.files);
      }
    };

    window.addEventListener('filesDropped', handleFilesDropped);
    return () => {
      window.removeEventListener('filesDropped', handleFilesDropped);
    };
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), attachedFiles);
      setInput('');
      setAttachedFiles([]);
    }
  }, [input, isLoading, attachedFiles, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }, [isMobile, handleSubmit]);

  const handleFileAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
      // Reset the input value so the same file can be selected again
      e.target.value = '';
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <InputContainer>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Box sx={{ maxWidth: 900, margin: '0 auto' }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f7f7f7',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            '&:focus-within': {
              borderColor: '#3b82f6',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
                : '0 0 0 3px rgba(59, 130, 246, 0.08)',
              backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            },
          }}
        >
          {/* File Attachments Bar */}
          {attachedFiles.length > 0 && (
            <FileChipsContainer>
              <Paperclip size={14} style={{ color: '#64748b', flexShrink: 0 }} />
              {attachedFiles.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  size="small"
                  onDelete={() => handleRemoveFile(index)}
                  deleteIcon={<X size={14} />}
                  sx={{
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    fontSize: '12px',
                    height: '24px',
                    '& .MuiChip-deleteIcon': {
                      color: '#64748b',
                      marginLeft: '4px',
                      '&:hover': {
                        color: '#3b82f6',
                      },
                    },
                  }}
                />
              ))}
            </FileChipsContainer>
          )}

          {/* Text Input */}
          <TextField
            fullWidth
            multiline
            maxRows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about SDM analytics, reports, incidents..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              '& .MuiInputBase-root': {
                padding: '14px 16px',
                fontSize: isMobile ? '13px' : '14px',
                minHeight: isMobile ? '40px' : '52px',
                alignItems: 'flex-start',
              },
              '& .MuiInputBase-input': {
                padding: 0,
                fontFamily: 'inherit',
                '&::placeholder': {
                  color: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.4)'
                    : 'rgba(0, 0, 0, 0.4)',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Action Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingX: '12px',
              paddingY: '8px',
              borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            }}
          >
            <Tooltip title="Attach files">
              <IconButton
                size="small"
                onClick={handleFileAttachmentClick}
                sx={{
                  color: 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(59, 130, 246, 0.05)',
                  },
                }}
              >
                <Paperclip size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {isLoading && onStopRequest && (
                <Tooltip title="Stop (Esc)">
                  <IconButton
                    onClick={onStopRequest}
                    sx={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      width: 36,
                      height: 36,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        transform: 'scale(1.05)',
                      },
                    }}
                  >
                    <Square size={16} />
                  </IconButton>
                </Tooltip>
              )}

              {!isLoading && (
                <Tooltip title="Send (Enter)">
                  <IconButton
                    type="submit"
                    disabled={!input.trim()}
                    sx={{
                      background: input.trim()
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : 'rgba(59, 130, 246, 0.3)',
                      color: 'white',
                      width: 36,
                      height: 36,
                      transition: 'all 0.2s ease',
                      '&:hover:not(:disabled)': {
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        transform: 'scale(1.05)',
                      },
                      '&:disabled': {
                        cursor: 'not-allowed',
                      },
                    }}
                  >
                    <Send size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </InputContainer>
  );
});

ChatInputArea.displayName = 'ChatInputArea';
