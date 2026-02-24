import React from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Paperclip } from 'lucide-react';
import { AnalysisInsights } from './AnalysisInsights';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResponseBeautifier } from './ResponseBeautifier';
import { ClarifyingQuestionHandler } from './ClarifyingQuestionHandler';
import { DecisionRouting } from './DecisionRouting';
import {
  MessageRow as MessageRowStyled,
  UserMessageGroup,
  UserMessageBubble,
  AssistantMessageGroup,
  AssistantHeaderBox,
  AssistantContentBubble,
  GradientAvatar,
} from './ChatInterface.styles';
import { Sparkles, BarChart3, LineChart, PieChart, Table2 } from 'lucide-react';
import type { Message } from './ChatInterface.types';
import type { IntelligentModalResponse, ClarifyingQuestion } from '../api';
import { BarChartConfig, type BarChartConfig as BarChartConfigType } from './visualizations/BarChartConfig';

interface MessageRowProps {
  message: Message;
  index: number;
  totalMessages: number;
  isLoading: boolean;
  isRefining?: boolean;
  followUpSuggestions?: string[];
  onSendMessage: (content: string) => void;
  onRefineResponse?: (feedback: string) => void;
  onClarifyingQuestionConfirm?: (confirmation: string) => void;
}

export function MessageRow({
  message,
  index,
  totalMessages,
  isLoading,
  isRefining,
  followUpSuggestions,
  onSendMessage,
  onRefineResponse,
  onClarifyingQuestionConfirm,
}: MessageRowProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const isLastAssistantMessage =
    index === totalMessages - 1 && message.role === 'assistant' && !isLoading;
  const [selectedVizType, setSelectedVizType] = React.useState<string>('table');
  const [barChartConfig, setBarChartConfig] = React.useState<BarChartConfigType | null>(null);

  // Initialize selectedVizType from primary_view when response changes
  React.useEffect(() => {
    const primaryView = message.response?.visualizations?.config?.primary_view;
    if (primaryView) {
      setSelectedVizType(primaryView);
    } else if (message.response?.visualizations) {
      setSelectedVizType('table');
    }
  }, [message.response?.visualizations]);

  // Visualizations type icons mapping
  const vizIcons: Record<string, any> = {
    bar: BarChart3,
    line: LineChart,
    pie: PieChart,
    table: Table2,
  };

  // Get available visualization types from response
  const availableVizTypes = message.response?.visualizations?.config?.available_views || [];

  return (
    <MessageRowStyled>
      {message.role === 'user' ? (
        <UserMessageGroup>
          <UserMessageBubble elevation={0}>
            <Typography
              variant="body2"
              sx={{
                fontSize: isMobile ? '13px' : '14px',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {message.content}
            </Typography>
          </UserMessageBubble>
          {message.attachments && message.attachments.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                paddingRight: '8px',
              }}
            >
              {message.attachments.map((fileName: string, idx: number) => (
                <Chip
                  key={idx}
                  icon={<Paperclip size={14} />}
                  label={fileName}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '20px',
                    border: `1.5px solid ${theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(59, 130, 246, 0.08)' 
                      : 'rgba(59, 130, 246, 0.06)',
                    color: '#3b82f6',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(59, 130, 246, 0.12)',
                      borderColor: '#3b82f6',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(59, 130, 246, 0.2)'
                        : '0 2px 8px rgba(59, 130, 246, 0.15)',
                    },
                    '& .MuiChip-icon': {
                      marginLeft: '4px !important',
                      color: '#3b82f6',
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </UserMessageGroup>
      ) : (
        <AssistantMessageGroup>
          <AssistantHeaderBox>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <GradientAvatar sx={{ width: 32, height: 32 }}>
                <Sparkles size={16} />
              </GradientAvatar>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'text.secondary',
                }}
              >
                SDM AI Assistant
              </Typography>
            </Box>

            {/* Visualization Type Icons */}
            {message.response?.visualizations && availableVizTypes.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {availableVizTypes.map((type: string) => {
                  const IconComponent = vizIcons[type] || Table2;
                  const isActive = selectedVizType === type;
                  return (
                    <Box
                      key={type}
                      onClick={() => setSelectedVizType(type)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: isActive
                          ? '#3b82f6'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)',
                        color: isActive
                          ? '#ffffff'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.7)'
                          : 'rgba(0, 0, 0, 0.6)',
                        '&:hover': {
                          backgroundColor: isActive ? '#3b82f6' : isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                        },
                      }}
                      title={type}
                    >
                      <IconComponent size={16} />
                    </Box>
                  );
                })}
              </Box>
            )}
          </AssistantHeaderBox>

          <AssistantContentBubble elevation={0} sx={{ position: 'relative' }}>
            {/* Analysis Insights */}
            {message.response && (message.response as IntelligentModalResponse).confidence_score !== undefined && (
              <Box sx={{ mb: 2 }}>
                <AnalysisInsights response={message.response as IntelligentModalResponse} />
              </Box>
            )}

            {/* Decision Routing - New Architecture Feature */}
            {message.response && message.response.decision_routing && (
              <Box sx={{ mb: 2 }}>
                <DecisionRouting
                  decision={message.response.decision_routing}
                  isLoading={false}
                  onError={!message.response.success}
                />
              </Box>
            )}

            {/* Assistant Title/Header - from structured response */}
            {message.response?.assistant?.title && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {message.response.assistant.title}
                </Typography>
              </Box>
            )}

            {/* Structured Response Content - if available */}
            {message.response?.assistant?.content && Array.isArray(message.response.assistant.content) ? (
              <ResponseBeautifier
                content={message.response.assistant.content}
                isMobile={isMobile}
                selectedVizType={selectedVizType}
                response={message.response}
              />
            ) : (
              /* Fallback to Markdown for plain text content */
              message.response?.clarifying_question ? null : (
                <MarkdownRenderer
                  content={message.content}
                  isMobile={isMobile}
                />
              )
            )}

            {/* Clarifying Question */}
            {message.response?.clarifying_question && (
              <ClarifyingQuestionHandler
                clarifyingQuestion={message.response.clarifying_question as ClarifyingQuestion}
                originalQuery={message.originalQuery || message.content}
                isLoading={isLoading}
                onConfirm={onClarifyingQuestionConfirm || (() => { })}
              />
            )}

            {/* Follow-up Suggestions */}
            {isLastAssistantMessage && followUpSuggestions && followUpSuggestions.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '11px',
                    color: 'text.secondary',
                    display: 'block',
                    marginBottom: 1,
                  }}
                >
                  💡 Suggested follow-ups
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {followUpSuggestions.map((suggestion: string, idx: number) => (
                    <Chip
                      key={idx}
                      label={suggestion}
                      onClick={() => onSendMessage(suggestion)}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '11px',
                        height: '28px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : 'rgba(59, 130, 246, 0.08)',
                          borderColor: '#3b82f6',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

          </AssistantContentBubble>
        </AssistantMessageGroup>
      )}
    </MessageRowStyled>
  );
}
