/**
 * Welcome Screen Component
 * Displays welcome message and suggested prompts when no messages exist
 */

import React from 'react';
import { Box, Avatar, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Sparkles } from 'lucide-react';
import { WelcomeCard } from './ChatInterface.styles';
import type { WelcomeCardItem } from './ChatInterface.types';

interface WelcomeScreenProps {
  onSendMessage: (prompt: string) => void;
}

const welcomeCards: WelcomeCardItem[] = [
  {
    title: 'Annual Maintenance Report',
    description: 'View pie charts and bar graphs',
    prompt: 'Give SDM PIE chart and bar graph for last annual maintenance',
  },
  {
    title: 'Incident Trends',
    description: 'Analyze incident patterns',
    prompt: 'Show me incident trends',
  },
  {
    title: 'Top Issues',
    description: 'Identify common problems',
    prompt: 'What are the top issues?',
  },
  {
    title: 'Resolution Report',
    description: 'Review performance metrics',
    prompt: 'Generate resolution report',
  },
];

export function WelcomeScreen({ onSendMessage }: WelcomeScreenProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <Avatar
        sx={{
          width: isMobile ? 60 : 80,
          height: isMobile ? 60 : 80,
          marginBottom: 3,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
        }}
      >
        <Sparkles size={isMobile ? 30 : 40} />
      </Avatar>

      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Welcome to SDM GEN-AI
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          maxWidth: 500,
          marginBottom: isMobile ? 3 : 4,
          fontSize: isMobile ? '14px' : '16px',
        }}
      >
        Your intelligent assistant for Service Desk Management analytics and insights.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
          maxWidth: 800,
          width: '100%',
        }}
      >
        {welcomeCards.map((card) => (
          <WelcomeCard
            key={card.title}
            elevation={0}
            onClick={() => onSendMessage(card.prompt)}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, marginBottom: 0.5, fontSize: isMobile ? '13px' : '14px' }}
            >
              {card.title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: isMobile ? '12px' : '13px' }}
            >
              {card.description}
            </Typography>
          </WelcomeCard>
        ))}
      </Box>
    </Box>
  );
}
