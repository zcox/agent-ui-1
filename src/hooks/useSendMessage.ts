import { useCallback, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import { sendMessage } from '../api/threads';
import { SSEConnection } from '../api/sse';
import { Message } from '../types/api';
import { generateMessageId } from '../utils/uuid';
import { getCurrentTimestamp } from '../utils/date';

export function useSendMessage() {
  const addMessage = useChatStore((state) => state.addMessage);
  const appendStreamChunk = useChatStore((state) => state.appendStreamChunk);
  const finalizeStreamingMessage = useChatStore((state) => state.finalizeStreamingMessage);
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);

  const connectionRef = useRef<SSEConnection | null>(null);

  const send = useCallback(
    async (threadId: string, text: string) => {
      if (!text.trim()) {
        return;
      }

      // Create and add user message immediately (optimistic update)
      const userMessage: Message = {
        message_id: generateMessageId(),
        message_type: 'user',
        timestamp: getCurrentTimestamp(),
        content: {
          type: 'user',
          text: text.trim(),
        },
      };

      addMessage(threadId, userMessage);

      try {
        // Send message to API and get SSE stream
        setIsStreaming(true, threadId);
        const response = await sendMessage(threadId, text.trim());

        // Create SSE connection
        const connection = new SSEConnection();
        connectionRef.current = connection;

        let agentMessageId: string | null = null;

        // Handle SSE events
        await connection.connect(response, (event) => {
          switch (event.type) {
            case 'agent_text':
              // First chunk: create agent message with unique client-side ID
              if (!agentMessageId) {
                agentMessageId = generateMessageId();
                const agentMessage: Message = {
                  message_id: agentMessageId,
                  message_type: 'agent',
                  timestamp: getCurrentTimestamp(),
                  content: {
                    type: 'agent',
                    text: '',
                  },
                };
                addMessage(threadId, agentMessage);
              }

              // Append text chunk to streaming buffer
              appendStreamChunk(agentMessageId, event.chunk);
              break;

            case 'tool_call':
              const toolCallMessage: Message = {
                message_id: generateMessageId(),
                message_type: 'tool_call',
                timestamp: getCurrentTimestamp(),
                content: {
                  type: 'tool_call',
                  tool_call_id: event.tool_call_id,
                  tool_name: event.tool_name,
                  arguments: event.arguments,
                },
              };
              addMessage(threadId, toolCallMessage);
              break;

            case 'tool_result':
              const toolResultMessage: Message = {
                message_id: generateMessageId(),
                message_type: 'tool_result',
                timestamp: getCurrentTimestamp(),
                content: {
                  type: 'tool_result',
                  tool_result_id: event.tool_result_id,
                  tool_call_id: event.tool_call_id,
                  result: event.result,
                },
              };
              addMessage(threadId, toolResultMessage);
              break;

            case 'done':
              // Finalize streaming
              if (agentMessageId) {
                finalizeStreamingMessage(agentMessageId);
              }
              setIsStreaming(false);
              break;

            case 'error':
              console.error('SSE error:', event.error);
              setIsStreaming(false);
              if (agentMessageId) {
                finalizeStreamingMessage(agentMessageId);
              }
              break;
          }
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsStreaming(false);

        // Add error message
        const errorMessage: Message = {
          message_id: generateMessageId(),
          message_type: 'agent',
          timestamp: getCurrentTimestamp(),
          content: {
            type: 'agent',
            text: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
          },
        };
        addMessage(threadId, errorMessage);
      } finally {
        connectionRef.current = null;
      }
    },
    [addMessage, appendStreamChunk, finalizeStreamingMessage, setIsStreaming]
  );

  const cancelStream = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
      setIsStreaming(false);
    }
  }, [setIsStreaming]);

  return { send, cancelStream };
}
