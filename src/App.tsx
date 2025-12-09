import { useEffect } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { useChatStore } from './stores/chatStore';

function App() {
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const threads = useChatStore((state) => state.threads);
  const createThread = useChatStore((state) => state.createThread);
  const setActiveThread = useChatStore((state) => state.setActiveThread);

  // Initialize: create a thread if none exist
  useEffect(() => {
    const threadIds = Object.keys(threads);

    // If no threads exist, create one
    if (threadIds.length === 0) {
      const newThreadId = createThread();
      setActiveThread(newThreadId);
    } else if (!activeThreadId) {
      // If threads exist but none is active, activate the most recent one
      const sortedThreads = Object.values(threads).sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );
      if (sortedThreads[0]) {
        setActiveThread(sortedThreads[0].id);
      }
    }
  }, [activeThreadId, threads, createThread, setActiveThread]);

  return (
    <ErrorBoundary>
      <AppLayout sidebar={<Sidebar />}>
        <ChatContainer />
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
