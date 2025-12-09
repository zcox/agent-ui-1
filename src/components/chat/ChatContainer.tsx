import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useChatStore } from '../../stores/chatStore';
import { useUIStore } from '../../stores/uiStore';
import { useThread } from '../../hooks/useThread';
import { useSendMessage } from '../../hooks/useSendMessage';

export function ChatContainer() {
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const threads = useChatStore((state) => state.threads);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isMobile = useUIStore((state) => state.isMobile);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  const { messages, loading } = useThread(activeThreadId);
  const { send } = useSendMessage();

  const handleSend = (text: string) => {
    if (activeThreadId) {
      send(activeThreadId, text);
    }
  };

  const activeThread = activeThreadId ? threads[activeThreadId] : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              {activeThread?.title || 'Select a thread'}
            </h1>
            {activeThread && (
              <p className="text-sm text-gray-500">
                {activeThread.messageCount || 0} messages
              </p>
            )}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <LoadingSpinner size="sm" />
              <span>Agent is typing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeThreadId ? (
        <MessageList messages={messages} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <p className="text-xl font-medium">Welcome to AI Agent Chat</p>
            <p className="text-sm mt-2">Create a new thread to get started</p>
          </div>
        </div>
      )}

      {/* Input */}
      {activeThreadId && (
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      )}
    </div>
  );
}
