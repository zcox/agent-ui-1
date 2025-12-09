import { ThreadItem } from './ThreadItem';
import { useThreadList } from '../../hooks/useThreadList';
import { useUIStore } from '../../stores/uiStore';

export function ThreadList() {
  const { threads, activeThreadId, setActiveThread } = useThreadList();
  const isMobile = useUIStore((state) => state.isMobile);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  const handleThreadClick = (threadId: string) => {
    setActiveThread(threadId);
    if (isMobile) {
      closeSidebar();
    }
  };

  if (threads.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 px-4">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <p className="text-sm">No threads yet</p>
          <p className="text-xs mt-1">Create one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      <div className="space-y-1">
        {threads.map((thread) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            onClick={() => handleThreadClick(thread.id)}
          />
        ))}
      </div>
    </div>
  );
}
