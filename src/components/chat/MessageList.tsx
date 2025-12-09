import { useVirtualizer } from '@tanstack/react-virtual';
import { Message } from '../../types/api';
import { UserMessage } from '../messages/UserMessage';
import { AgentMessage } from '../messages/AgentMessage';
import { ToolCallMessage } from '../messages/ToolCallMessage';
import { ToolResponseMessage } from '../messages/ToolResponseMessage';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useChatStore } from '../../stores/chatStore';

interface MessageListProps {
  messages: Message[];
}

function MessageComponent({ message }: { message: Message }) {
  switch (message.message_type) {
    case 'user':
      return <UserMessage message={message} />;
    case 'agent':
      return <AgentMessage message={message} />;
    case 'tool_call':
      return <ToolCallMessage message={message} />;
    case 'tool_result':
      return <ToolResponseMessage message={message} />;
    default:
      return null;
  }
}

export function MessageList({ messages }: MessageListProps) {
  const isStreaming = useChatStore((state) => state.isStreaming);
  const streamingMessages = useChatStore((state) => state.streamingMessages);

  const { scrollRef, showScrollButton, scrollToBottom, handleScroll } =
    useAutoScroll<HTMLDivElement>([messages.length, isStreaming, Object.keys(streamingMessages).length]);

  const parentRef = scrollRef;

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm mt-1">Start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                ref={virtualizer.measureElement}
                data-index={virtualItem.index}
              >
                <MessageComponent message={message} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-4 right-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Scroll to bottom"
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
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
