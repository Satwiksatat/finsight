// lib/types.ts

export type MessageRole = 'user' | 'assistant' | 'system' | 'function';

// Base content type with common properties
type BaseContent<T extends string> = {
  type: T;
  description?: string;
  metadata?: Record<string, unknown>;
};

// Text content
export type TextContent = BaseContent<'text'> & {
  content: string;
  annotations?: {
    type: 'citation' | 'footnote';
    text: string;
    id?: string;
  }[];
};

// Code content
export type CodeContent = BaseContent<'code'> & {
  language: string;
  content: string;
  executionResult?: {
    success: boolean;
    output?: string;
    error?: string;
  };
};

// Chart data structure
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

// Chart content
export type ChartContent = BaseContent<'chart'> & {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title?: string;
  data: ChartData;
  options?: Record<string, unknown>;
  interactive?: boolean;
};

// Image content
export type ImageContent = BaseContent<'image'> & {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

// File content
export type FileContent = BaseContent<'file'> & {
  name: string;
  url: string;
  mimeType: string;
  size?: number;
  content?: string; // Optional content for text-based files
};

// Audio content
export type AudioContent = BaseContent<'audio'> & {
  url: string;
  duration?: number;
  transcript?: string;
  waveform?: number[];
};

// Video content
export type VideoContent = BaseContent<'video'> & {
  url: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
};

// Function call content
export type FunctionCallContent = BaseContent<'function_call'> & {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
};

// Union type for all content types
export type LLMContent = 
  | TextContent
  | CodeContent
  | ChartContent
  | ImageContent
  | FileContent
  | AudioContent
  | VideoContent
  | FunctionCallContent;

// Type guard helpers
export function isTextContent(content: LLMContent): content is TextContent {
  return content.type === 'text';
}

export function isCodeContent(content: LLMContent): content is CodeContent {
  return content.type === 'code';
}

export function isChartContent(content: LLMContent): content is ChartContent {
  return content.type === 'chart';
}

// Message metadata
export type MessageMetadata = {
  tokens?: number;
  processingTime?: number;
  model?: string;
  temperature?: number;
  skill?: string;
  agent?: string;
} & Record<string, unknown>;

// Chat message structure
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: LLMContent[];
  timestamp: Date;
  metadata?: MessageMetadata;
  isError?: boolean;
  isPending?: boolean;
  isStreaming?: boolean;
}

// Conversation structure
export interface Conversation {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  lastUpdated?: Date;
  lastMessageSnippet: string;
  lastMessageAt?: Date;
  messages: ChatMessage[];
  archived?: boolean;
  pinned?: boolean;
  tags?: string[];
  model?: string;
  tokenCount?: number;
  context?: Record<string, unknown>;
  isTitleGenerated?: boolean;
  isGeneratingTitle?: boolean;
}

// Function definition
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  required?: string[];
}

// Conversation context
export interface ConversationContext {
  currentTopic?: string;
  entities?: Record<string, string>;
  preferences?: Record<string, unknown>;
  summary?: string;
  memory?: Record<string, unknown>;
}

// Chat window props
export interface ChatWindowProps {
  chatId: string;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  updateChatTitle?: (chatId: string, title: string) => void;
  renderMessage?: (message: ChatMessage) => React.ReactNode;
}

// Chat context type
export interface ChatContextType {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  updateChatTitle: (id: string, newTitle: string) => void;
  startNewChat: () => string;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  isGeneratingTitle: boolean;
  generateTitleForChat: (chatId: string, messages: ChatMessage[]) => Promise<boolean>;
  getConversation: (id: string) => Conversation | undefined;
}

// API response type
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  headers?: Record<string, string>;
}

// Title generation response
export interface TitleGenerationResponse {
  title: string;
  success: boolean;
  conversationId: string;
  generatedAt?: Date;
}

// Content extraction type
export type ContentExtractor<T extends LLMContent> = {
  type: T['type'];
  extract: (content: T) => string;
};

// Helper type for message content processing
export type MessageContentProcessor = {
  getTextContent: (content: LLMContent[]) => string;
  getFirstContentOfType: <T extends LLMContent>(contents: LLMContent[], type: T['type']) => T | undefined;
};

export type SeverityLevel = 'info' | 'warning' | 'critical';

export interface DashboardSnapshotKPI {
  id: string;
  label: string;
  value: number;
  target?: number;
  delta?: number;
  color?: string;
  suffix?: string;
  footnote?: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string;
  delta: number;
  trend: number[];
  suffix?: string;
  subLabel?: string;
}

export interface WorkingCapitalPoint {
  label: string;
  value: number;
}

export interface WorkingCapitalData {
  cycleDays: number;
  targetDays: number;
  history: WorkingCapitalPoint[];
}

export interface RevenueChannel {
  label: string;
  data: number[];
  color: string;
}

export interface RevenueSummary {
  label: string;
  value: string;
  delta: number;
}

export interface RevenueBreakdown {
  labels: string[];
  channels: RevenueChannel[];
  summary: RevenueSummary[];
}

export interface HeatMapRow {
  title: string;
  cells: {
    label: string;
    value: number;
    status?: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface WaterfallStep {
  label: string;
  value: number;
  type: 'increase' | 'decrease' | 'total';
}

export interface HealthScoreData {
  score: number;
  commentary: string;
  heatmap: HeatMapRow[];
  waterfall: WaterfallStep[];
}

export interface DashboardKpiPayload {
  snapshot: DashboardSnapshotKPI[];
  cards: DashboardCard[];
  workingCapital: WorkingCapitalData;
  revenue: RevenueBreakdown;
  health: HealthScoreData;
}

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  timestamp?: string;
}