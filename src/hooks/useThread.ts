import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { getThreadHistory } from '../api/threads';
import { storage } from '../utils/storage';

/**
 * Hook to load thread history from server or localStorage.
 * Automatically loads when threadId changes.
 */
export function useThread(threadId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreadHistory = useChatStore((state) => state.loadThreadHistory);
  const messages = useChatStore((state) =>
    threadId ? state.messages[threadId] || [] : []
  );

  useEffect(() => {
    if (!threadId) {
      return;
    }

    // Check if messages are already loaded
    if (messages.length > 0) {
      return;
    }

    // Try loading from localStorage first
    const localMessages = storage.getMessages(threadId);
    if (localMessages.length > 0) {
      loadThreadHistory(threadId, localMessages);
      return;
    }

    // Load from server as fallback
    const loadFromServer = async () => {
      setLoading(true);
      setError(null);

      try {
        const threadData = await getThreadHistory(threadId);
        loadThreadHistory(threadId, threadData.messages);
      } catch (err) {
        console.error('Failed to load thread history:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load thread history'
        );
      } finally {
        setLoading(false);
      }
    };

    loadFromServer();
  }, [threadId, messages.length, loadThreadHistory]);

  return { messages, loading, error };
}
