// API types matching the backend schema from API.md

export type MessageType = "user" | "agent" | "tool_call" | "tool_result";

export type MessageContent =
  | { type: "user"; text: string }
  | { type: "agent"; text: string }
  | { type: "tool_call"; tool_call_id: string; tool_name: string; arguments: object }
  | { type: "tool_result"; tool_result_id: string; tool_call_id: string; result: object };

export interface Message {
  message_id: string;
  message_type: MessageType;
  timestamp: string; // ISO 8601 datetime
  content: MessageContent;
}

export interface ThreadResponse {
  thread_id: string;
  messages: Message[];
}

export interface SendMessageRequest {
  text: string;
}

// SSE event types
export type SSEEvent =
  | { type: "agent_text"; thread_id: string; message_id: string; chunk: string }
  | { type: "tool_call"; tool_call_id: string; tool_name: string; arguments: object }
  | { type: "tool_result"; tool_result_id: string; tool_call_id: string; result: object }
  | { type: "done" }
  | { type: "error"; error: string };

export type SSECallback = (event: SSEEvent) => void;
