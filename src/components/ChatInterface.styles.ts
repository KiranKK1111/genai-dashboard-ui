/**
 * ChatInterface Styled Components
 * Contains all Material-UI styled components for ChatInterface
 */

import { Box, Paper, Avatar, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ChatContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  backgroundColor: theme.palette.mode === 'dark' ? '#0d0d0d' : '#f5f5f5',
  flex: 1,
  overflow: 'hidden',
  padding: '16px',
  gap: '16px',
}));

export const ChatInnerBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  borderRadius: '12px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
}));

export const MessagesWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.mode === 'dark' ? '#0d0d0d' : '#f5f5f5',
  alignItems: 'center',
  paddingTop: '20px',
  paddingBottom: '20px',
}));

export const VirtuosoContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  scrollbarWidth: 'thin',
  scrollbarColor: theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.2) transparent'
    : 'rgba(0, 0, 0, 0.2) transparent',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(0, 0, 0, 0.15)',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.25)'
        : 'rgba(0, 0, 0, 0.25)',
    },
  },
  '& .virtuoso-scroller': {
    scrollbarWidth: 'thin',
    scrollbarColor: theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2) transparent'
      : 'rgba(0, 0, 0, 0.2) transparent',
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.15)',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(0, 0, 0, 0.25)',
      },
    },
  },
}));

export const VirtuosoListWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxWidth: '1000px',
  margin: '0 auto',
  width: '100%',
  paddingTop: '32px',
  paddingBottom: '24px',
  paddingLeft: '20px',
  paddingRight: '20px',
  boxSizing: 'border-box',
  [theme.breakpoints.down('md')]: {
    maxWidth: '900px',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    paddingTop: '24px',
    paddingBottom: '16px',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
}));

export const MessageRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: '8px',
  animation: 'fadeInUp 0.3s ease-out',
  width: '100%',
  boxSizing: 'border-box',
  '@keyframes fadeInUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: '6px',
  },
}));

export const UserMessageGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  width: '100%',
  gap: 8,
}));

export const UserMessageBubble = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  color: '#ffffff',
  borderRadius: '18px',
  padding: '12px 16px',
  maxWidth: '70%',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    padding: '10px 14px',
    fontSize: '14px',
  },
}));

export const AssistantMessageGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  gap: 8,
}));

export const AssistantHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginLeft: 0,
  width: '100%',
  justifyContent: 'space-between',
}));

export const AssistantMessageBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? '#1a1a1a'
    : '#f7f7f7',
  borderRadius: '18px',
  padding: '12px 16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: theme.palette.mode === 'dark'
    ? 'none'
    : '0 1px 3px rgba(0, 0, 0, 0.05)',
  maxWidth: '70%',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  transition: 'all 0.2s ease',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%',
    padding: '10px 14px',
    fontSize: '14px',
  },
}));

export const AssistantContentBubble = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark'
    ? '#1a1a1a'
    : '#f7f7f7',
  borderRadius: '18px',
  padding: '16px 16px 8px 16px',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: theme.palette.mode === 'dark'
    ? 'none'
    : '0 1px 3px rgba(0, 0, 0, 0.05)',
  width: '100%',
  maxWidth: '100%',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  transition: 'all 0.2s ease',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    padding: '14px',
    fontSize: '14px',
  },
}));

export const GradientAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  width: 36,
  height: 36,
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

export const WelcomeCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)',
    transform: 'translateY(-2px)',
    border: theme.palette.mode === 'dark'
      ? '1px solid rgba(59, 130, 246, 0.3)'
      : '1px solid rgba(59, 130, 246, 0.2)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 16px rgba(0, 0, 0, 0.5)'
      : '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

export const InputContainer = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#0d0d0d' : '#ffffff',
  padding: '8px 8px 8px 8px',
}));

export const InputBox = styled(Box)(({ theme }) => ({
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
}));

export const FileChipsContainer = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
}));
