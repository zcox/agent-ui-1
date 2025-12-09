// UI-specific message types

import { Message } from './api';

export type { Message };

// Extended message type with UI-specific properties
export interface UIMessage extends Message {
  isStreaming?: boolean;
  error?: string;
}

// Message display helpers
export interface MessageGroup {
  date: string;
  messages: Message[];
}
