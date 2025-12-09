import { useState } from 'react';
import { Message } from '../../types/api';
import { formatTime } from '../../utils/date';

interface ToolCallMessageProps {
  message: Message;
}

export function ToolCallMessage({ message }: ToolCallMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (message.content.type !== 'tool_call') {
    return null;
  }

  return (
    <div className="my-3 mx-auto max-w-2xl px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center gap-2 text-left hover:bg-amber-100 transition-colors rounded-lg"
        >
          <svg
            className={`w-4 h-4 text-amber-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
          <svg
            className="w-4 h-4 text-amber-600 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="text-sm font-medium text-amber-900 flex-shrink-0">
            Tool Call: {message.content.tool_name}
          </span>
          {!isExpanded && (
            <span className="text-xs text-amber-600 font-mono overflow-hidden whitespace-nowrap mx-2 flex-1">
              {JSON.stringify(message.content.arguments)}
            </span>
          )}
          <span className="ml-auto text-xs text-amber-700 flex-shrink-0">
            {formatTime(message.timestamp)}
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3">
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto border border-amber-100">
              {JSON.stringify(message.content.arguments, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
