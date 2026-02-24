import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  TextField, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  InputAdornment,
  Collapse,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  PanelLeft, 
  Plus, 
  Search, 
  MessageSquare, 
  LogOut, 
  Moon, 
  Sun,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface Chat {
  id: string;
  title: string;
  timestamp: Date | string;
}

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette?.mode === 'dark' ? '#0d0d0d' : '#f5f5f5',
  borderRight: `1px solid ${theme.palette?.divider ?? '#e0e0e0'}`,
  transition: 'width 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
}));

const GradientAvatar = styled(Avatar)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
});

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  color: '#ffffff',
  fontWeight: 500,
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  },
});

const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive?: boolean }>(({ theme, isActive }) => ({
  borderRadius: 6,
  margin: '0px 8px',
  padding: '10px 12px',
  backgroundColor: isActive 
    ? theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(226, 232, 240, 0.5)'
    : 'transparent',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(148, 163, 184, 0.1)' 
      : 'rgba(226, 232, 240, 0.4)',
  },
}));

export function ChatSidebar({ 
  chats, 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  isCollapsed,
  onToggleCollapse 
}: ChatSidebarProps) {
  const { logout, username } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardsExpanded, setDashboardsExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);

  return (
    <SidebarContainer sx={{ width: isCollapsed ? 64 : 320 }}>
      {/* Expanded Content */}
      <Box 
        sx={{ 
          opacity: isCollapsed ? 0 : 1, 
          pointerEvents: isCollapsed ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GradientAvatar sx={{ width: 32, height: 32 }}>
                <Sparkles size={16} />
              </GradientAvatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                SDM AI
              </Typography>
            </Box>
            <IconButton onClick={onToggleCollapse} size="small">
              <PanelLeft size={20} />
            </IconButton>
          </Box>
          
          <GradientButton 
            fullWidth
            startIcon={<Plus size={18} />}
            onClick={onNewChat}
            sx={{ mb: 2 }}
          >
            New chat
          </GradientButton>

          <TextField
            fullWidth
            size="small"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Divider />

        {/* Chat History with Expandable Sections */}
        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            py: 0,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => 
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.15)',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: (theme) => 
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.25)'
                    : 'rgba(0, 0, 0, 0.25)',
              },
            },
          }}
        >
          {/* Dashboards Section */}
          <Box>
            <ListItemButton
              onClick={() => setDashboardsExpanded(!dashboardsExpanded)}
              sx={{
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {dashboardsExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <Grid2X2 size={16} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  flex: 1,
                }}
              >
                Dashboards
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
              >
                3
              </Typography>
            </ListItemButton>

            <Collapse in={dashboardsExpanded} timeout="auto" unmountOnExit>
              <List sx={{ py: 0, px: 1, margin: 0 }}>
                {/* Prompt Tiles - Placeholder */}
                {['Data Analysis', 'Sales Report', 'Customer Insights'].map((tile, index) => (
                  <StyledListItemButton
                    key={index}
                    sx={{
                      pl: 4,
                      borderRadius: 1,
                      mb: 0.25,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Grid2X2 size={14} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" noWrap>
                          {tile}
                        </Typography>
                      }
                    />
                  </StyledListItemButton>
                ))}
              </List>
            </Collapse>
          </Box>

          {/* Your Chats Section */}
          <Box>
            <ListItemButton
              onClick={() => setChatsExpanded(!chatsExpanded)}
              sx={{
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {chatsExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <MessageCircle size={16} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  flex: 1,
                }}
              >
                Your Chats
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
              >
                {chats.length}
              </Typography>
            </ListItemButton>

            <Collapse in={chatsExpanded} timeout="auto" unmountOnExit>
              {chats.length === 0 ? (
                <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    No chats yet
                  </Typography>
                </Box>
              ) : (() => {
                const filteredChats = chats.filter(chat =>
                  chat.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filteredChats.length === 0 ? (
                  <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      No chats match search
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ py: 0, px: 1, margin: 0 }}>
                    {filteredChats.map((chat) => (
                      <Tooltip key={chat.id} title={chat.title} placement="right">
                        <StyledListItemButton
                          isActive={currentChatId === chat.id}
                          onClick={() => onSelectChat(chat.id)}
                          sx={{
                            pl: 4,
                            borderRadius: 1,
                            mb: 0.25,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <MessageSquare size={14} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{ fontSize: '0.8rem' }}
                              >
                                {chat.title.length > 30
                                  ? `${chat.title.substring(0, 30)}...`
                                  : chat.title}
                              </Typography>
                            }
                          />
                        </StyledListItemButton>
                      </Tooltip>
                    ))}
                  </List>
                );
              })()}
            </Collapse>
          </Box>
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 1.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              p: 1.5, 
              borderRadius: 2,
              backgroundColor: theme === 'dark' 
                ? 'rgba(148, 163, 184, 0.1)' 
                : 'rgba(226, 232, 240, 0.6)',
              mb: 1.5
            }}
          >
            <GradientAvatar sx={{ width: 32, height: 32 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {username.charAt(0).toUpperCase()}
              </Typography>
            </GradientAvatar>
            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }} noWrap>
              {username}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<LogOut size={16} />}
              onClick={logout}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Collapsed Content */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: 64, 
          height: '100%', 
          opacity: isCollapsed ? 1 : 0, 
          pointerEvents: isCollapsed ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '16px 0', 
          gap: '16px',
          backgroundColor: theme === 'dark' ? '#0d0d0d' : '#f5f5f5',
        }}
      >
        <IconButton onClick={onToggleCollapse} color="primary">
          <PanelLeft size={20} />
        </IconButton>
        <IconButton onClick={onNewChat} color="primary">
          <Plus size={20} />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={toggleTheme} color="primary">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
        <GradientAvatar sx={{ width: 24, height: 24 }}>
          <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600 }}>
            {username.charAt(0).toUpperCase()}
          </Typography>
        </GradientAvatar>
        <IconButton onClick={logout} color="primary">
          <LogOut size={20} />
        </IconButton>
      </Box>
    </SidebarContainer>
  );
}
