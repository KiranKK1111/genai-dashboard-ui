/**
 * Markdown Renderer Component
 * Renders markdown content with proper styling
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  isMobile?: boolean;
}

const InlineCode = styled('code')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
  color: theme.palette.mode === 'dark' ? '#4aa6ff' : '#c41e50',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.9em',
  fontFamily: "'Courier New', monospace",
}));

export function MarkdownRenderer({ content, isMobile = false }: MarkdownRendererProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <ReactMarkdown
      components={{
        // Headings
        h1: ({ node, ...props }) => (
          <Typography
            variant="h4"
            sx={{
              mt: 2,
              mb: 1,
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#1a1a1a',
            }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <Typography
            variant="h5"
            sx={{
              mt: 1.5,
              mb: 0.8,
              fontWeight: 600,
              color: isDark ? '#ffffff' : '#1a1a1a',
            }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <Typography
            variant="h6"
            sx={{
              mt: 1,
              mb: 0.5,
              fontWeight: 600,
              color: isDark ? '#ffffff' : '#1a1a1a',
            }}
            {...props}
          />
        ),

        // Paragraphs
        p: ({ node, ...props }) => (
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              lineHeight: 1.6,
              color: isDark ? '#e0e0e0' : '#333333',
              fontSize: isMobile ? '13px' : '14px',
            }}
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }) => (
          <Box
            component="ul"
            sx={{
              mb: 1,
              pl: 2,
              color: isDark ? '#e0e0e0' : '#333333',
              '& li': {
                mb: 0.5,
                lineHeight: 1.5,
                fontSize: isMobile ? '13px' : '14px',
              },
            }}
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <Box
            component="ol"
            sx={{
              mb: 1,
              pl: 2,
              color: isDark ? '#e0e0e0' : '#333333',
              '& li': {
                mb: 0.5,
                lineHeight: 1.5,
                fontSize: isMobile ? '13px' : '14px',
              },
            }}
            {...props}
          />
        ),

        // Bold and Italic
        strong: ({ node, ...props }) => (
          <Typography
            component="strong"
            sx={{ fontWeight: 700, color: isDark ? '#ffffff' : '#1a1a1a' }}
            {...props}
          />
        ),
        em: ({ node, ...props }) => (
          <Typography
            component="em"
            sx={{ fontStyle: 'italic', color: isDark ? '#e0e0e0' : '#333333' }}
            {...props}
          />
        ),

        // Code blocks
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : 'text';

          if (!inline) {
            return (
              <Box
                sx={{
                  my: 1,
                  borderRadius: 1,
                  overflow: 'auto',
                  backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
                  border: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`,
                }}
              >
                <SyntaxHighlighter
                  language={language}
                  style={isDark ? darcula : vs}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </Box>
            );
          }

          // Inline code
          return (
            <InlineCode>
              {children}
            </InlineCode>
          );
        },

        // Links
        a: ({ node, ...props }) => (
          <Typography
            component="a"
            sx={{
              color: '#3b82f6',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: '#2563eb',
              },
            }}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }: any) => (
          <Box
            sx={{
              pl: 2,
              py: 1,
              pr: 2,
              my: 1,
              borderLeft: `4px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              fontStyle: 'italic',
              color: isDark ? '#b3d9ff' : '#1e40af',
            }}
            {...props}
          />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <Box
            sx={{
              overflowX: 'auto',
              my: 1,
              borderRadius: 1,
              border: `1px solid ${isDark ? '#333333' : '#e0e0e0'}`,
            }}
          >
            <Table
              sx={{
                minWidth: 300,
                backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              }}
            >
              {props.children}
            </Table>
          </Box>
        ),
        thead: ({ node, ...props }) => (
          <TableHead sx={{ backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }} {...props} />
        ),
        tbody: ({ node, ...props }) => <TableBody {...props} />,
        tr: ({ node, ...props }) => (
          <TableRow sx={{ borderBottom: `1px solid ${isDark ? '#333333' : '#e0e0e0'}` }} {...props} />
        ),
        th: ({ node, align, ...props }: any) => (
          <TableCell
            sx={{
              fontWeight: 700,
              backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
              color: isDark ? '#ffffff' : '#1a1a1a',
              borderBottom: `2px solid ${isDark ? '#444444' : '#d0d0d0'}`,
              padding: '12px 8px',
              textAlign: align && ['left', 'center', 'right'].includes(align) ? (align as 'left' | 'center' | 'right') : 'left',
            }}
            {...props}
          />
        ),
        td: ({ node, align, ...props }: any) => (
          <TableCell
            sx={{
              color: isDark ? '#e0e0e0' : '#333333',
              padding: '10px 8px',
              fontSize: isMobile ? '12px' : '13px',
              textAlign: align && ['left', 'center', 'right'].includes(align) ? (align as 'left' | 'center' | 'right') : 'left',
            }}
            {...props}
          />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => (
          <Box
            sx={{
              my: 2,
              height: '1px',
              backgroundColor: isDark ? '#333333' : '#e0e0e0',
            }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
