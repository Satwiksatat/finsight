// lib/chartParser.ts

import { ChartContent, ChartData } from './types';

export interface LLMChartResponse {
  viz_choice: string;
  chart_json: {
    title?: {
      text: string;
    };
    tooltip?: any;
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
      data: number[];
      [key: string]: any;
    }>;
  };
  explain?: string;
}

export function parseLLMChartResponse(response: LLMChartResponse): ChartContent {
  const { chart_json, explain } = response;
  
  // Convert ECharts format to Chart.js format
  const labels = chart_json.xAxis?.data || [];
  const datasets = chart_json.series.map((series, index) => ({
    label: series.name,
    data: series.data,
    backgroundColor: getChartColor(index, series.type),
    borderColor: getChartColor(index, series.type),
    borderWidth: 2,
    fill: series.type === 'line' ? false : undefined,
    tension: series.type === 'line' ? 0.4 : undefined,
  }));

  const chartData: ChartData = {
    labels,
    datasets,
  };

  const chartType = mapEChartsTypeToChartJS(chart_json.series[0]?.type || 'bar');

  const options = {
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
        display: !!chart_json.legend?.data,
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
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
    },
  };

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

export function isLLMChartResponse(obj: any): obj is LLMChartResponse {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.viz_choice === 'chart' &&
    obj.chart_json &&
    typeof obj.chart_json === 'object' &&
    Array.isArray(obj.chart_json.series)
  );
}

export function extractChartFromText(text: string): LLMChartResponse | null {
  try {
    // Try to find JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (isLLMChartResponse(parsed)) {
        return parsed;
      }
    }
    
    // If no match found, try parsing the entire text
    const parsed = JSON.parse(text);
    if (isLLMChartResponse(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to extract chart from text:', error);
  }
  
  return null;
} 