import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
} from '@mui/material';
import { Sparkles } from 'lucide-react';
import { MoreMenu } from './MoreMenu';

interface ChatHeaderProps {
  title?: string;
  showIcon?: boolean;
  onCopy?: () => void;
  onRefresh?: () => void;
  onShare?: () => void;
  isLoading?: boolean;
}

export function ChatHeader({
  title = 'SDM AI Assistant',
  showIcon = true,
  onCopy,
  onRefresh,
  onShare,
  isLoading = false,
}: ChatHeaderProps) {
  const theme = useTheme();

  const customItems = [];
  if (onRefresh) {
    customItems.push({
      label: 'Refresh',
      onClick: onRefresh,
    });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(15, 23, 42, 0.5)'
            : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Left side: Icon and Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {showIcon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            }}
          >
            <Sparkles size={20} color="white" />
          </Box>
        )}
      </Box>

      {/* Right side: 3-dot menu */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MoreMenu
          onCopy={onCopy}
          onShare={onShare}
          customItems={customItems}
        />
      </Box>
    </Box>
  );
}
