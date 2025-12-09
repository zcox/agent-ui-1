import { useMemo } from 'react';
import { useChatStore } from '../stores/chatStore';
import { ThreadMetadata } from '../types/thread';

/**
 * Hook to get sorted thread list.
 * Threads are sorted by last message time (most recent first).
 */
export function useThreadList() {
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const createThread = useChatStore((state) => state.createThread);
  const setActiveThread = useChatStore((state) => state.setActiveThread);
  const deleteThread = useChatStore((state) => state.deleteThread);

  const sortedThreads = useMemo(() => {
    const threadArray: ThreadMetadata[] = Object.values(threads);

    return threadArray.sort((a, b) => {
      const aTime = new Date(a.lastMessageAt).getTime();
      const bTime = new Date(b.lastMessageAt).getTime();
      return bTime - aTime; // Most recent first
    });
  }, [threads]);

  return {
    threads: sortedThreads,
    activeThreadId,
    createThread,
    setActiveThread,
    deleteThread,
  };
}
