// lib/types.ts

export type MessageRole = 'user' | 'assistant' | 'system' | 'function'; // Added 'function' role for function calling

// Define the structure for different types of content your LLM might return
export type TextContent = {
  type: 'text';
  content: string; // Markdown formatted text
  annotations?: { // For citations/references
    type: 'citation' | 'footnote';
    text: string;
    id?: string;
  }[];
};

export type CodeContent = {
  type: 'code';
  language: string;
  content: string; // Raw code string
  executionResult?: { // For code execution results
    success: boolean;
    output?: string;
    error?: string;
  };
};

export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
};

export type ChartContent = {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title?: string;
  description?: string; // For accessibility
  data: ChartData;
  options?: Record<string, any>; // Better than 'any'
  interactive?: boolean; // Whether the chart should be interactive
};

export type ImageContent = {
  type: 'image';
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type FileContent = {
  type: 'file';
  name: string;
  url: string;
  mimeType: string;
  size?: number;
};

export type AudioContent = {
  type: 'audio';
  url: string;
  duration?: number;
  transcript?: string;
};

export type VideoContent = {
  type: 'video';
  url: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
};

// For function calling
export type FunctionCallContent = {
  type: 'function_call';
  name: string;
  arguments: Record<string, any>;
  result?: any; // For displaying function results
};

// Union type for all possible content types
export type LLMContent = 
  | TextContent
  | CodeContent
  | ChartContent
  | ImageContent
  | FileContent
  | AudioContent
  | VideoContent
  | FunctionCallContent;

// Message metadata
export interface MessageMetadata {
  tokens?: number;
  processingTime?: number;
  model?: string;
  temperature?: number;
  [key: string]: any; // For additional custom metadata
}

// A message can contain one or more content blocks
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: LLMContent[];
  timestamp: Date;
  metadata?: MessageMetadata;
  isError?: boolean; // For error states
  isPending?: boolean; // For streaming states
}

// For chat history in the sidebar
export interface Conversation {
  id: string;
  title: string;
  description?: string; // Optional longer description
  createdAt: Date;
  updatedAt?: Date; // Last modification time
  lastMessageSnippet: string;
  lastMessageAt?: Date; // More specific than timestamp
  messages: ChatMessage[];
  archived?: boolean;
  pinned?: boolean;
  tags?: string[]; // For categorization
  model?: string; // Which model was used
  tokenCount?: number; // Total tokens in conversation
  context?: Record<string, any>; // Additional context
}

// For function definitions (if using function calling)
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// For tracking conversation context
export interface ConversationContext {
  currentTopic?: string;
  entities?: Record<string, string>;
  preferences?: Record<string, any>;
  summary?: string;
}