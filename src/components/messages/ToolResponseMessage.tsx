import { useState } from 'react';
import { Message } from '../../types/api';
import { formatTime } from '../../utils/date';

interface ToolResponseMessageProps {
  message: Message;
}

export function ToolResponseMessage({ message }: ToolResponseMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (message.content.type !== 'tool_result') {
    return null;
  }

  return (
    <div className="my-3 mx-auto max-w-2xl px-4">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-center gap-2 text-left hover:bg-green-100 transition-colors rounded-lg"
        >
          <svg
            className={`w-4 h-4 text-green-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
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
            className="w-4 h-4 text-green-600 flex-shrink-0"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span className="text-sm font-medium text-green-900 flex-shrink-0">
            Tool Result
          </span>
          {!isExpanded && (
            <span className="text-xs text-green-600 font-mono overflow-hidden whitespace-nowrap mx-2 flex-1">
              {JSON.stringify(message.content.result)}
            </span>
          )}
          <span className="ml-auto text-xs text-green-700 flex-shrink-0">
            {formatTime(message.timestamp)}
          </span>
        </button>
        {isExpanded && (
          <div className="px-3 pb-3">
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto border border-green-100">
              {JSON.stringify(message.content.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
