// Thread metadata types for UI

export interface ThreadMetadata {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  title: string; // Generated from first user message or "New Thread"
  preview: string; // Last message preview text
  messageCount?: number;
}

export interface StoredThreads {
  version: 1;
  threads: Record<string, ThreadMetadata>;
  activeThreadId: string | null;
  lastSyncedAt: string;
}

export interface StoredMessages {
  threadId: string;
  messages: import('./api').Message[];
  lastUpdated: string;
}
