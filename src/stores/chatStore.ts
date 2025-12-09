import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message } from '../types/api';
import { ThreadMetadata } from '../types/thread';
import { generateUUID } from '../utils/uuid';
import { getCurrentTimestamp } from '../utils/date';
import { storage } from '../utils/storage';

interface ChatState {
  // Thread management
  threads: Record<string, ThreadMetadata>;
  activeThreadId: string | null;

  // Message management (threadId -> Message[])
  messages: Record<string, Message[]>;

  // Streaming state (messageId -> accumulated text chunks)
  streamingMessages: Record<string, string>;
  isStreaming: boolean;
  streamingThreadId: string | null;

  // Actions
  setActiveThread: (threadId: string) => void;
  createThread: () => string;
  addMessage: (threadId: string, message: Message) => void;
  loadThreadHistory: (threadId: string, messages: Message[]) => void;
  appendStreamChunk: (messageId: string, chunk: string) => void;
  finalizeStreamingMessage: (messageId: string) => void;
  setIsStreaming: (isStreaming: boolean, threadId?: string) => void;
  clearThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  updateThreadMetadata: (threadId: string, updates: Partial<ThreadMetadata>) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: {},
      activeThreadId: null,
      messages: {},
      streamingMessages: {},
      isStreaming: false,
      streamingThreadId: null,

      setActiveThread: (threadId: string) => {
        set({ activeThreadId: threadId });

        // Load messages from localStorage if not already in memory
        const state = get();
        if (!state.messages[threadId]) {
          const storedMessages = storage.getMessages(threadId);
          if (storedMessages.length > 0) {
            set((state) => ({
              messages: {
                ...state.messages,
                [threadId]: storedMessages,
              },
            }));
          }
        }
      },

      createThread: () => {
        const threadId = generateUUID();
        const now = getCurrentTimestamp();

        const newThread: ThreadMetadata = {
          id: threadId,
          createdAt: now,
          lastMessageAt: now,
          title: 'New Thread',
          preview: '',
          messageCount: 0,
        };

        set((state) => ({
          threads: {
            ...state.threads,
            [threadId]: newThread,
          },
          activeThreadId: threadId,
          messages: {
            ...state.messages,
            [threadId]: [],
          },
        }));

        return threadId;
      },

      addMessage: (threadId: string, message: Message) => {
        set((state) => {
          const threadMessages = state.messages[threadId] || [];
          const updatedMessages = [...threadMessages, message];

          // Update thread metadata
          const thread = state.threads[threadId];
          if (thread) {
            const title =
              thread.title === 'New Thread' && message.message_type === 'user'
                ? message.content.type === 'user'
                  ? message.content.text.substring(0, 50) + (message.content.text.length > 50 ? '...' : '')
                  : thread.title
                : thread.title;

            const preview =
              message.content.type === 'user' || message.content.type === 'agent'
                ? message.content.text.substring(0, 100)
                : thread.preview;

            thread.title = title;
            thread.preview = preview;
            thread.lastMessageAt = message.timestamp;
            thread.messageCount = updatedMessages.length;
          }

          // Save to localStorage
          storage.saveMessages(threadId, updatedMessages);

          return {
            messages: {
              ...state.messages,
              [threadId]: updatedMessages,
            },
            threads: {
              ...state.threads,
              [threadId]: thread!,
            },
          };
        });
      },

      loadThreadHistory: (threadId: string, messages: Message[]) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: messages,
          },
        }));

        // Update thread metadata
        if (messages.length > 0) {
          const firstUserMsg = messages.find((m) => m.message_type === 'user');
          const lastMsg = messages[messages.length - 1];

          const title = firstUserMsg?.content.type === 'user'
            ? firstUserMsg.content.text.substring(0, 50) + (firstUserMsg.content.text.length > 50 ? '...' : '')
            : 'New Thread';

          const preview =
            lastMsg?.content.type === 'user' || lastMsg?.content.type === 'agent'
              ? lastMsg.content.text.substring(0, 100)
              : '';

          get().updateThreadMetadata(threadId, {
            title,
            preview,
            lastMessageAt: lastMsg.timestamp,
            messageCount: messages.length,
          });
        }

        // Save to localStorage
        storage.saveMessages(threadId, messages);
      },

      appendStreamChunk: (messageId: string, chunk: string) => {
        set((state) => {
          const current = state.streamingMessages[messageId] || '';
          return {
            streamingMessages: {
              ...state.streamingMessages,
              [messageId]: current + chunk,
            },
          };
        });
      },

      finalizeStreamingMessage: (messageId: string) => {
        set((state) => {
          const streamedText = state.streamingMessages[messageId];
          const { [messageId]: _, ...remaining } = state.streamingMessages;

          // Find and update the message with the streamed text
          const updatedMessages = { ...state.messages };
          for (const threadId in updatedMessages) {
            const messages = updatedMessages[threadId];
            const messageIndex = messages.findIndex((m) => m.message_id === messageId);

            if (messageIndex !== -1 && streamedText) {
              const message = messages[messageIndex];
              if (message.content.type === 'agent') {
                updatedMessages[threadId] = [
                  ...messages.slice(0, messageIndex),
                  {
                    ...message,
                    content: {
                      ...message.content,
                      text: streamedText,
                    },
                  },
                  ...messages.slice(messageIndex + 1),
                ];

                // Save updated messages to localStorage
                storage.saveMessages(threadId, updatedMessages[threadId]);
              }
            }
          }

          return {
            streamingMessages: remaining,
            messages: updatedMessages,
          };
        });
      },

      setIsStreaming: (isStreaming: boolean, threadId?: string) => {
        set({
          isStreaming,
          streamingThreadId: isStreaming ? threadId || null : null,
        });
      },

      clearThread: (threadId: string) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [threadId]: [],
          },
        }));
        storage.clearThread(threadId);
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const { [threadId]: _, ...remainingThreads } = state.threads;
          const { [threadId]: __, ...remainingMessages } = state.messages;

          return {
            threads: remainingThreads,
            messages: remainingMessages,
            activeThreadId:
              state.activeThreadId === threadId ? null : state.activeThreadId,
          };
        });

        storage.clearThread(threadId);
      },

      updateThreadMetadata: (threadId: string, updates: Partial<ThreadMetadata>) => {
        set((state) => {
          const thread = state.threads[threadId];
          if (!thread) return state;

          return {
            threads: {
              ...state.threads,
              [threadId]: {
                ...thread,
                ...updates,
              },
            },
          };
        });
      },
    }),
    {
      name: 'agent-ui-chat',
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
