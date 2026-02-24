/**
 * Line Chart Visualization Component
 */

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import { VisualizationWrapper } from '../VisualizationWrapper';

interface LineChartVisualizationProps {
  data: Record<string, any>[];
}

export function LineChartVisualization({
  data,
}: LineChartVisualizationProps) {
  const theme = useTheme();
  const height = 400;

  const option = useMemo(() => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);
    if (columns.length < 2) return null;

    const categoryKey = columns[0];
    const valueKey = columns[1];
    const categories = data.map((row) => String(row[categoryKey]));
    const values = data.map((row) => Number(row[valueKey]) || 0);

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderColor: 'rgba(59, 130, 246, 0.5)',
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: categories.length > 5 ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: values,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#3b82f6',
          },
          lineStyle: {
            color: '#3b82f6',
            width: 3,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' },
            ]),
          },
          emphasis: {
            itemStyle: {
              borderColor: '#1e40af',
              borderWidth: 2,
            },
          },
        },
      ],
      grid: {
        containLabel: true,
      },
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <VisualizationWrapper>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No data available to display
        </Typography>
      </VisualizationWrapper>
    );
  }

  if (!option) {
    return (
      <VisualizationWrapper>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Unable to render line chart with this data
        </Typography>
      </VisualizationWrapper>
    );
  }

  return (
    <VisualizationWrapper>
      <Box sx={{ width: '100%' }}>
        <ReactECharts option={option} style={{ height, width: '100%' }} />
      </Box>
    </VisualizationWrapper>
  );
}
