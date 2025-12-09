# AI Agent Chat UI

A modern, responsive browser-based chat interface for the AI Agent Chat API. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Real-time Streaming**: Server-Sent Events (SSE) for streaming agent responses
- **Thread Management**: Create, view, and switch between multiple conversation threads
- **Local Persistence**: Automatic saving of threads and messages to localStorage
- **Message Types**: Support for user messages, agent messages, tool calls, and tool responses
- **Responsive Design**: Mobile-friendly with collapsible sidebar drawer
- **Virtualized Lists**: Efficient rendering of 1000+ messages using @tanstack/react-virtual
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- Backend API server running on `http://localhost:3030` (or configure with environment variable)

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file (or use the existing `.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:3030
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173)

## Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and SSE handler
├── components/       # React components
│   ├── chat/        # Chat container, message list, input
│   ├── layout/      # App layout and responsive grid
│   ├── messages/    # Message type components
│   ├── sidebar/     # Thread list and management
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── constants/       # Configuration constants
```

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **@tanstack/react-virtual** - List virtualization
- **uuid** - UUID generation

## Architecture Highlights

### SSE Streaming
The application uses a custom `SSEConnection` class with proper buffering to handle partial chunks from the server. This ensures reliable streaming of agent responses.

### State Management
Zustand stores manage all application state:
- `chatStore`: Threads, messages, and streaming state (persisted)
- `uiStore`: UI state like sidebar visibility (ephemeral)

### Message Flow
1. User sends message → Optimistically added to UI
2. API call initiated → SSE stream established
3. Agent responses streamed → Real-time updates
4. Tool calls/responses → Displayed with syntax highlighting
5. Completion → State finalized, saved to localStorage

## Usage

1. **Create a Thread**: Click "New Thread" in the sidebar
2. **Send a Message**: Type in the input field and press Enter
3. **View Responses**: Agent messages stream in real-time
4. **Switch Threads**: Click any thread in the sidebar to view its history
5. **Mobile**: Tap the menu icon to open/close the sidebar

## API Integration

The app communicates with the backend API using:
- `GET /api/v1/threads/{threadId}` - Fetch thread history
- `POST /api/v1/threads/{threadId}` - Send message (returns SSE stream)

SSE event types:
- `agent_text` - Streaming text chunks
- `tool_call` - Tool invocation
- `tool_response` - Tool result
- `done` - Stream completion
- `error` - Error notification

## Browser Support

- Modern browsers with ES2020+ support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- TypeScript types are properly defined
- Components follow the existing patterns
- Code is formatted and linted
- Build passes without errors
