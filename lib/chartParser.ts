// lib/chartParser.ts

import { ChartContent, ChartData } from './types';

export interface LLMChartResponse {
  viz_choice: string;
  chart_json: {
    title?: {
      text: string;
    };
    tooltip?: Record<string, unknown>;
    legend?: {
      data: string[];
    };
    xAxis?: {
      type: string;
      data: string[];
    };
    yAxis?: {
      type: string;
    };
    series: Array<{
      name: string;
      type: string;
      data: number[] | Array<{ name?: string; value?: number }>;
      [key: string]: unknown;
    }>;
  };
  explain?: string;
}

export function parseLLMChartResponse(response: LLMChartResponse): ChartContent {
  const { chart_json, explain } = response;
  
  const firstSeries = chart_json.series[0];
  const chartType = mapEChartsTypeToChartJS(firstSeries?.type || 'bar');
  
  let labels: string[] = [];
  let datasets: ChartData['datasets'] = [];
  
  // Handle pie/doughnut charts differently
  if (chartType === 'pie' || chartType === 'doughnut') {
    // For pie charts, data is in format [{name: "Revenue", value: 45.2}, ...]
    if (firstSeries && Array.isArray(firstSeries.data)) {
      labels = firstSeries.data.map((item) =>
        typeof item === 'number' ? String(item) : item?.name || ''
      );
      const values = firstSeries.data.map((item) =>
        typeof item === 'number' ? item : item?.value ?? 0
      );
      
      datasets = [{
        label: firstSeries.name || 'Data',
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ],
        borderColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ],
        borderWidth: 2,
      }];
    }
  } else {
    // Handle bar/line charts
    labels = chart_json.xAxis?.data || [];
    datasets = chart_json.series.map((series, index) => ({
      label: series.name,
      data: Array.isArray(series.data)
        ? (typeof series.data[0] === "object"
            ? (series.data as Array<{ name?: string, value?: number }>).map((d) => d.value ?? 0)
            : (series.data as number[]))
        : [],
      backgroundColor: getChartColor(index, series.type),
      borderColor: getChartColor(index, series.type),
      borderWidth: 2,
      fill: series.type === 'line' ? false : undefined,
      tension: series.type === 'line' ? 0.4 : undefined,
    }));
  }

  const chartData: ChartData = {
    labels,
    datasets,
  };

  // Create options based on chart type
  const options: Record<string, unknown> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!chart_json.title?.text,
        text: chart_json.title?.text || '',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      legend: {
        display: true,
        position: (chartType === 'pie' || chartType === 'doughnut') ? 'right' as const : 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: (chartType === 'pie' || chartType === 'doughnut') ? 'point' as const : 'index' as const,
        intersect: false,
      },
    },
  };
  
  // Add scales only for non-pie charts
  if (chartType !== 'pie' && chartType !== 'doughnut') {
    options.scales = {
      x: {
        display: true,
        title: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: false,
        },
        beginAtZero: true,
      },
    };
  }

  return {
    type: 'chart',
    chartType,
    title: chart_json.title?.text,
    data: chartData,
    options,
    interactive: true,
    description: explain,
  };
}

function mapEChartsTypeToChartJS(echartsType: string): ChartContent['chartType'] {
  switch (echartsType) {
    case 'bar':
      return 'bar';
    case 'line':
      return 'line';
    case 'pie':
      return 'pie';
    case 'doughnut':
      return 'doughnut';
    default:
      return 'bar';
  }
}

function getChartColor(index: number, chartType: string): string {
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // yellow
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
  ];

  if (chartType === 'line') {
    return colors[index % colors.length];
  }

  // For bar charts, use different colors for each dataset
  return colors[index % colors.length];
}

export function isLLMChartResponse(obj: unknown): obj is LLMChartResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'viz_choice' in obj &&
    (obj as { viz_choice?: unknown }).viz_choice === 'chart' &&
    'chart_json' in obj &&
    typeof (obj as { chart_json?: unknown }).chart_json === 'object' &&
    (obj as { chart_json?: { series?: unknown } }).chart_json !== null &&
    Array.isArray(
      (obj as { chart_json?: { series?: unknown } }).chart_json!.series
    )
  );
}

export function extractChartFromText(text: string): LLMChartResponse | null {
  // Don't try to parse text that doesn't look like JSON
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  // Only attempt parsing if the text contains chart-like JSON structure
  if (!text.includes('viz_choice') && !text.includes('chart_json')) {
    return null;
  }
  
  try {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (isLLMChartResponse(parsed)) {
        return parsed;
      }
    }
    
    // If no match found, try parsing the entire text (only if it starts with {)
    if (text.trim().startsWith('{')) {
      const parsed = JSON.parse(text);
      if (isLLMChartResponse(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    // Silently fail for non-JSON text - this is expected behavior
    // Only log if it looks like it should be JSON
    if (text.trim().startsWith('{') || text.includes('viz_choice')) {
      console.warn('Failed to extract chart from text:', error);
    }
  }
  
  return null;
} 