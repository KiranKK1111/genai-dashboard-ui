/**
 * Clarifying Question Handler Component
 * Handles interactive clarifying questions of different types
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import type { ClarifyingQuestion } from '../api';

interface ClarifyingQuestionHandlerProps {
  clarifyingQuestion: ClarifyingQuestion;
  originalQuery: string;
  isLoading?: boolean;
  onConfirm: (confirmation: string) => void;
}

export function ClarifyingQuestionHandler({
  clarifyingQuestion,
  originalQuery,
  isLoading = false,
  onConfirm,
}: ClarifyingQuestionHandlerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState('');

  const handleBinaryChoice = (choice: string) => {
    onConfirm(choice);
  };

  const handleMultipleChoice = (option: string) => {
    onConfirm(option);
  };

  const handleValueInput = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue);
      setInputValue('');
    }
  };

  const renderBinary = () => (
    <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
      <Button
        onClick={() => handleBinaryChoice('yes')}
        disabled={isLoading}
        variant="outlined"
        sx={{
          background: 'transparent',
          color: '#9ca3af',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderRadius: '6px',
          border: '1.5px solid #d1d5db',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: '#3b82f6',
            borderColor: '#3b82f6',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          },
          '&:active': {
            background: '#2563eb',
            borderColor: '#2563eb',
            color: '#ffffff',
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        YES
      </Button>
      <Button
        onClick={() => handleBinaryChoice('no')}
        disabled={isLoading}
        variant="outlined"
        sx={{
          background: 'transparent',
          color: '#9ca3af',
          padding: '6px 14px',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          borderRadius: '6px',
          border: '1.5px solid #d1d5db',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: '#3b82f6',
            borderColor: '#3b82f6',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          },
          '&:active': {
            background: '#2563eb',
            borderColor: '#2563eb',
            color: '#ffffff',
          },
          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }}
      >
        NO
      </Button>
    </Box>
  );

  const renderMultipleChoice = () => (
    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
      {clarifyingQuestion.options?.map((option) => (
        <Chip
          key={option}
          label={option}
          onClick={() => handleMultipleChoice(option)}
          variant="outlined"
          sx={{
            cursor: 'pointer',
            borderColor: '#3b82f6',
            color: '#3b82f6',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: '#2563eb',
            },
          }}
          disabled={isLoading}
        />
      ))}
    </Box>
  );

  const renderValueInput = () => (
    <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <TextField
        size="small"
        type={clarifyingQuestion.input_type === 'number' ? 'number' : 'text'}
        placeholder={`Enter ${clarifyingQuestion.input_type || 'value'}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        sx={{
          flex: 1,
          minWidth: '200px',
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleValueInput();
          }
        }}
      />
      <Button
        onClick={handleValueInput}
        disabled={!inputValue.trim() || isLoading}
        size="small"
        variant="outlined"
        sx={{
          textTransform: 'none',
          borderColor: '#3b82f6',
          color: '#3b82f6',
          '&:hover': {
            borderColor: '#2563eb',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        }}
      >
        Confirm
      </Button>
    </Box>
  );

  const renderEntityDisambiguation = () => (
    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
      {clarifyingQuestion.options?.map((option) => (
        <Chip
          key={option}
          label={option}
          onClick={() => handleMultipleChoice(option)}
          variant="outlined"
          sx={{
            cursor: 'pointer',
            borderColor: '#f59e0b',
            color: '#f59e0b',
            '&:hover': {
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: '#d97706',
            },
          }}
          disabled={isLoading}
        />
      ))}
    </Box>
  );

  const renderMissingParameter = () => (
    <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <TextField
        size="small"
        placeholder="Enter required parameter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        sx={{
          flex: 1,
          minWidth: '200px',
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleValueInput();
          }
        }}
      />
      <Button
        onClick={handleValueInput}
        disabled={!inputValue.trim() || isLoading}
        size="small"
        variant="outlined"
        sx={{
          textTransform: 'none',
          borderColor: '#3b82f6',
          color: '#3b82f6',
          '&:hover': {
            borderColor: '#2563eb',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          },
        }}
      >
        Provide
      </Button>
    </Box>
  );

  const renderContent = () => {
    switch (clarifyingQuestion.type) {
      case 'binary':
        return renderBinary();
      case 'multiple_choice':
        return renderMultipleChoice();
      case 'value_input':
        return renderValueInput();
      case 'entity_disambiguation':
        return renderEntityDisambiguation();
      case 'missing_parameter':
        return renderMissingParameter();
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 600,
          color: '#3b82f6',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 1,
        }}
      >
        ❓ CLARIFYING QUESTION
      </Typography>
      <Typography
        sx={{
          fontSize: isMobile ? '13px' : '14px',
          lineHeight: 1.5,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {clarifyingQuestion.question}
      </Typography>
      {renderContent()}
    </Box>
  );
}
