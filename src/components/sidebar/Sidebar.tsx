import { NewThreadButton } from './NewThreadButton';
import { ThreadList } from './ThreadList';
import { useThreadList } from '../../hooks/useThreadList';
import { useUIStore } from '../../stores/uiStore';

export function Sidebar() {
  const { createThread, setActiveThread } = useThreadList();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isMobile = useUIStore((state) => state.isMobile);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  const handleNewThread = () => {
    const newThreadId = createThread();
    setActiveThread(newThreadId);
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-primary-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Threads</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
          </svg>
        </button>
      </div>

      {/* New Thread Button */}
      <div className="px-4 py-3">
        <NewThreadButton onClick={handleNewThread} />
      </div>

      {/* Thread List */}
      <ThreadList />
    </div>
  );
}
