// lib/types.ts

export type MessageRole = 'user' | 'assistant' | 'system';

// Define the structure for different types of content your LLM might return
export type TextContent = {
  type: 'text';
  content: string; // Markdown formatted text
};

export type CodeContent = {
  type: 'code';
  language: string;
  content: string; // Raw code string
};

export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
};

export type ChartContent = {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie'; // Extend as needed
  title?: string;
  data: ChartData;
  options?: any; // Chart.js options
};

export type ImageContent = {
  type: 'image';
  url: string;
  alt: string;
};

// Union type for all possible content types
export type LLMContent = TextContent | CodeContent | ChartContent | ImageContent;

// A message can contain one or more content blocks
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: LLMContent[];
  timestamp: Date;
}

// For chat history in the sidebar
export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageSnippet: string;
  timestamp: Date | string;
  messages: Conversation | undefined; // Adjust as needed
  archived?: boolean; // Add this line
}