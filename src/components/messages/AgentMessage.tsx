import { Message } from '../../types/api';
import { formatTime } from '../../utils/date';
import { useChatStore } from '../../stores/chatStore';

interface AgentMessageProps {
  message: Message;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const streamingText = useChatStore(
    (state) => state.streamingMessages[message.message_id]
  );
  const isStreaming = useChatStore((state) => state.isStreaming);

  if (message.content.type !== 'agent') {
    return null;
  }

  // Use streaming text if available, otherwise use stored text
  const displayText = streamingText !== undefined ? streamingText : message.content.text;
  const showCursor = isStreaming && streamingText !== undefined;

  return (
    <div className="flex justify-start mb-4 px-4">
      <div className="flex flex-col items-start max-w-[80%]">
        <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
          <p className="text-sm whitespace-pre-wrap break-words">
            {displayText}
            {showCursor && (
              <span className="inline-block w-1.5 h-4 bg-gray-600 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
