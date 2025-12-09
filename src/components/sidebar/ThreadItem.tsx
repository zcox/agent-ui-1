import { ThreadMetadata } from '../../types/thread';
import { formatRelativeTime } from '../../utils/date';

interface ThreadItemProps {
  thread: ThreadMetadata;
  isActive: boolean;
  onClick: () => void;
}

export function ThreadItem({ thread, isActive, onClick }: ThreadItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 border-l-4 border-primary-600'
          : 'hover:bg-gray-100 border-l-4 border-transparent'
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-medium text-sm line-clamp-1 ${
              isActive ? 'text-primary-900' : 'text-gray-900'
            }`}
          >
            {thread.title}
          </h3>
          <span className="text-xs text-gray-500 shrink-0">
            {formatRelativeTime(thread.lastMessageAt)}
          </span>
        </div>
        {thread.preview && (
          <p className="text-xs text-gray-600 line-clamp-2">{thread.preview}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <svg
            className="w-3 h-3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span>{thread.messageCount || 0} messages</span>
        </div>
      </div>
    </button>
  );
}
