# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Preview production build
npm run preview

# Lint TypeScript files
npm run lint
```

## Architecture Overview

This is a React + TypeScript chat UI for an AI agent API that uses Server-Sent Events (SSE) for real-time streaming responses.

### State Management - Zustand Stores

The application uses two Zustand stores with different persistence strategies:

1. **chatStore** (`src/stores/chatStore.ts`) - Persisted to localStorage
   - Manages threads, messages, and streaming state
   - Thread metadata is persisted via Zustand's persist middleware
   - Full message content is saved separately via custom storage utility (see below)
   - Critical: Messages are stored per-thread using `storage.saveMessages(threadId, messages)`

2. **uiStore** (`src/stores/uiStore.ts`) - Ephemeral
   - Manages UI state like sidebar visibility
   - Not persisted across sessions

### SSE Streaming Architecture

**Critical**: The SSE implementation uses a custom buffering strategy to handle partial chunks.

- **SSEConnection class** (`src/api/sse.ts`) maintains an internal buffer to accumulate partial event data
- Network chunks may contain incomplete SSE events, so the class keeps a `buffer` string and only processes complete `event:` + `data:` pairs
- The last potentially incomplete line is always retained in the buffer for the next read
- This prevents JSON parsing errors from partial event data

### Message Flow

1. User sends message → Optimistically added to UI via `addMessage()`
2. API call initiated → `sendMessage()` returns SSE stream response
3. SSEConnection established → Processes events in `useSendMessage` hook
4. Agent text chunks → Accumulated in `streamingMessages` state (messageId → text)
5. Tool calls/results → Added as separate messages immediately
6. Stream completion (`done` event) → `finalizeStreamingMessage()` moves text from streaming buffer to final message
7. All changes auto-saved to localStorage via `storage.saveMessages()`

### Storage Pattern

Messages are stored separately from thread metadata:
- Thread metadata: Stored via Zustand persist middleware under key `agent-ui-chat`
- Messages: Stored per-thread under keys like `agent-ui-messages-{threadId}` via `utils/storage.ts`
- When switching threads, messages are lazy-loaded from localStorage if not in memory

### Type System

API types (`src/types/api.ts`) match the backend schema exactly:
- `MessageContent` is a discriminated union (type: "user" | "agent" | "tool_call" | "tool_result")
- SSE events are also discriminated unions with type field
- TypeScript strict mode is enabled

### Component Structure

- Components are organized by domain: `chat/`, `messages/`, `sidebar/`, `layout/`, `ui/`
- Message rendering uses type-specific components (UserMessage, AgentMessage, ToolCallMessage, ToolResponseMessage)
- MessageList uses `@tanstack/react-virtual` for efficient rendering of 1000+ messages
- All components are functional components with TypeScript

### API Integration

Backend API endpoints (defined in `src/api/threads.ts`):
- `GET /api/v1/threads/{threadId}` - Fetch thread history
- `POST /api/v1/threads/{threadId}` - Send message, returns SSE stream

API base URL is configured via `VITE_API_BASE_URL` environment variable (defaults to `http://localhost:3030`).

### Critical Implementation Details

1. **Message IDs**: Client-side UUIDs are generated for all messages (server doesn't provide IDs)
2. **Streaming state**: The `streamingMessages` map is separate from the final `messages` array
3. **Thread titles**: Auto-generated from first user message (first 50 chars)
4. **Timestamp format**: ISO 8601 strings via `getCurrentTimestamp()` utility
5. **Optimistic updates**: User messages appear immediately, before API response

### Build Configuration

- **Vite**: Fast dev server with HMR on port 5173
- **TypeScript**: Strict mode, ES2020 target, bundler module resolution
- **Tailwind CSS**: Configured via `tailwind.config.js`, PostCSS processing
- No test framework is currently configured
