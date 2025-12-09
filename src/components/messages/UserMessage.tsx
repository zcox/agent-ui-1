import { Message } from '../../types/api';
import { formatTime } from '../../utils/date';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  if (message.content.type !== 'user') {
    return null;
  }

  return (
    <div className="flex justify-end mb-4 px-4">
      <div className="flex flex-col items-end max-w-[80%]">
        <div className="bg-primary-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm">
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content.text}
          </p>
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
