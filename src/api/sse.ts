import { SSEEvent, SSECallback } from '../types/api';

/**
 * SSE Connection handler with proper buffering for partial chunks.
 * Critical: SSE events can span multiple network chunks, so we must
 * buffer incomplete lines and only process complete event+data pairs.
 */
export class SSEConnection {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private decoder = new TextDecoder();
  private buffer = '';
  private abortController: AbortController | null = null;

  /**
   * Connect to SSE stream and process events.
   * @param response The fetch response with SSE stream
   * @param callback Callback function for each SSE event
   */
  async connect(response: Response, callback: SSECallback): Promise<void> {
    if (!response.body) {
      throw new Error('No response body available for SSE stream');
    }

    this.abortController = new AbortController();
    this.reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await this.reader.read();

        if (done) {
          break;
        }

        // Decode the chunk but preserve stream continuity
        this.buffer += this.decoder.decode(value, { stream: true });

        // Process any complete events in the buffer
        this.processBuffer(callback);
      }
    } catch (error) {
      // Only throw if not aborted intentionally
      if (error instanceof Error && error.name !== 'AbortError') {
        throw error;
      }
    } finally {
      this.cleanup();
    }
  }

  /**
   * Process buffered SSE data and extract complete events.
   * Handles partial chunks by keeping incomplete lines in buffer.
   */
  private processBuffer(callback: SSECallback): void {
    const lines = this.buffer.split('\n');

    // Keep the last potentially incomplete line in the buffer
    this.buffer = lines.pop() || '';

    let currentEvent: string | null = null;

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        const dataStr = line.substring(5).trim();

        if (currentEvent && dataStr) {
          try {
            const data = JSON.parse(dataStr);

            // Create typed event based on the event type
            const event: SSEEvent = {
              type: currentEvent,
              ...data,
            } as SSEEvent;

            callback(event);
          } catch (e) {
            console.error('Failed to parse SSE data:', dataStr, e);
            callback({
              type: 'error',
              error: `Failed to parse SSE data: ${e instanceof Error ? e.message : 'Unknown error'}`,
            });
          }
        }

        currentEvent = null;
      } else if (line === '') {
        // Empty line separates events (SSE spec)
        currentEvent = null;
      }
    }
  }

  /**
   * Disconnect and clean up the SSE connection.
   */
  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort();
    }

    if (this.reader) {
      this.reader.cancel().catch(() => {
        // Ignore cancellation errors
      });
    }

    this.cleanup();
  }

  /**
   * Clean up resources.
   */
  private cleanup(): void {
    this.reader = null;
    this.buffer = '';
    this.abortController = null;
  }
}
