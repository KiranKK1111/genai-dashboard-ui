/**
 * Structured Response Renderer
 * Renders LLM responses with structured content (paragraphs, tables, lists, callouts)
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MarkdownRenderer } from './MarkdownRenderer';
import { VisualizationRouter } from './visualizations/VisualizationRouter';
import type { Visualization } from '../api';

interface ContentBlock {
  type: 'paragraph' | 'table' | 'bullets' | 'numbered' | 'callout' | 'code';
  text?: string;
  items?: string[];
  emoji?: string;
  variant?: string;
  headers?: string[];
  rows?: (string | number)[][];
  language?: string;
}

interface ResponseBeautifierProps {
  content: ContentBlock[];
  isMobile?: boolean;
  selectedVizType?: string;
  response?: any; // Full response object with visualizations data
}

const CalloutBox = styled(Paper)(({ theme }) => ({
  padding: '12px 16px',
  marginBottom: '12px',
  borderLeft: `4px solid #3b82f6`,
  borderRadius: '4px',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)',
  '&.warning': {
    borderLeftColor: '#f59e0b',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(245, 158, 11, 0.1)'
      : 'rgba(245, 158, 11, 0.05)',
  },
  '&.success': {
    borderLeftColor: '#10b981',
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(16, 185, 129, 0.05)',
  },
}));



const BulletList = styled(Box)(({ theme }) => ({
  '& li': {
    marginBottom: '6px',
    lineHeight: 1.6,
    fontSize: '14px',
    color: theme.palette.mode === 'dark'
      ? '#e0e0e0'
      : '#333333',
  },
}));

export function ResponseBeautifier({
  content,
  isMobile = false,
  selectedVizType,
  response,
}: ResponseBeautifierProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderContent = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Typography
            key={index}
            variant="body2"
            sx={{
              mb: 1,
              lineHeight: 1.6,
              color: isDark ? '#e0e0e0' : '#333333',
              fontSize: isMobile ? '13px' : '14px',
            }}
          >
            {block.text}
          </Typography>
        );

      case 'table':
        // Convert headers and rows to array of objects
        // Format: [{header1: value1, header2: value2}, ...]
        let tableData: Record<string, any>[] = [];
        
        if (block.rows && block.headers) {
          tableData = block.rows.map((row) => {
            const obj: Record<string, any> = {};
            block.headers?.forEach((header, idx) => {
              obj[header] = row[idx];
            });
            return obj;
          });
        }

        const tableVisualization: Visualization = {
          chart_id: `table-${index}`, 
          type: 'table',
          title: 'Data Table',
          data: tableData,
          config: { available_views: ['table'] },
        };

        return (
          <Box key={index} sx={{ mb: 2 }}>
            <VisualizationRouter visualization={tableVisualization} selectedType={selectedVizType} />
          </Box>
        );

      case 'bullets':
        return (
          <Box key={index} sx={{ mb: 1.5, ml: 2 }}>
            <Box component="ul" sx={{ pl: 2, '& li': { marginBottom: '6px', lineHeight: 1.6, fontSize: '14px', color: isDark ? '#e0e0e0' : '#333333' } }}>
              {block.items?.map((item, idx) => (
                <Box component="li" key={idx} sx={{ display: 'flex', gap: 1 }}>
                  <span style={{ color: isDark ? '#a0aec0' : '#666666', marginRight: '8px' }}>•</span> {item}
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 'numbered':
        return (
          <Box key={index} sx={{ mb: 1.5, ml: 2 }}>
            <Box component="ol" sx={{ pl: 2, listStyleType: 'decimal', '& li': { marginBottom: '6px', lineHeight: 1.6, fontSize: '14px', color: isDark ? '#e0e0e0' : '#333333' } }}>
              {block.items?.map((item, idx) => (
                <Box component="li" key={idx}>{item}</Box>
              ))}
            </Box>
          </Box>
        );

      case 'callout':
        const calloutClass = block.variant === 'warning' ? 'warning' : block.variant === 'success' ? 'success' : '';
        return (
          <CalloutBox key={index} elevation={0} className={calloutClass}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isMobile ? '12px' : '13px',
                  lineHeight: 1.5,
                  color: isDark ? '#c7d2e0' : '#374151',
                  flex: 1,
                }}
              >
                {block.text}
              </Typography>
            </Box>
          </CalloutBox>
        );

      case 'code':
        return (
          <Box
            key={index}
            sx={{
              mb: 1.5,
              backgroundColor: isDark ? '#1a202c' : '#f7f7f7',
              padding: '12px',
              borderRadius: '6px',
              overflowX: 'auto',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            }}
          >
            <Typography
              component="code"
              sx={{
                fontSize: '12px',
                fontFamily: "'Courier New', monospace",
                color: isDark ? '#4aa6ff' : '#c41e50',
                lineHeight: 1.5,
              }}
            >
              {block.text}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {content.map((block, index) => renderContent(block, index))}
    </Box>
  );
}
