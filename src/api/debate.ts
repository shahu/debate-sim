/**
 * Debate API module for streaming and generating debate responses.
 * Provides functions to interact with the backend debate endpoints.
 */

import { apiClient } from './client';
import type {
  ChatMessage,
  DebateStreamRequest,
  DebateGenerateRequest,
  DebateGenerateResponse,
  DebateStreamChunk,
} from './types';

/**
 * Parse SSE (Server-Sent Events) formatted data
 * @param line - Raw SSE line from stream
 * @returns Parsed data or null if not a data line
 */
function parseSSELine(line: string): DebateStreamChunk | null {
  if (line.startsWith('data: ')) {
    try {
      const data = JSON.parse(line.slice(6));
      return data as DebateStreamChunk;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Stream debate responses from the backend.
 * 
 * This is an async generator that yields text chunks as they arrive
 * from the DeepSeek LLM via the backend's SSE endpoint.
 * 
 * @param request - Debate stream request with messages and optional model
 * @returns AsyncGenerator yielding text chunks
 * 
 * @example
 * ```typescript
 * const messages: ChatMessage[] = [
 *   { role: 'system', content: 'You are debating...' },
 *   { role: 'user', content: 'Argue for this motion...' }
 * ];
 * 
 * for await (const chunk of streamDebateResponse({ messages })) {
 *   console.log(chunk); // "The", " government", " should..."
 * }
 * ```
 */
export async function* streamDebateResponse(
  request: DebateStreamRequest
): AsyncGenerator<string, void, unknown> {
  let response: Response | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  
  try {
    // Make streaming POST request
    response = await apiClient.postStream('/api/debate/stream', request);
    reader = response.body!.getReader();
    
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete lines from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        const data = parseSSELine(line.trim());
        
        if (data) {
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (data.done) {
            return;
          }
          
          if (data.content) {
            yield data.content;
          }
        }
      }
    }
    
    // Process any remaining data in buffer
    if (buffer.trim()) {
      const data = parseSSELine(buffer.trim());
      if (data?.content) {
        yield data.content;
      }
    }
    
  } finally {
    // Clean up reader
    if (reader) {
      reader.releaseLock();
    }
  }
}

/**
 * Generate a complete debate response (non-streaming).
 * 
 * Use this when you need the full response immediately rather than
 * streaming it word-by-word.
 * 
 * @param request - Debate generation request
 * @returns Promise with the complete response content
 * 
 * @example
 * ```typescript
 * const response = await generateDebateResponse({
 *   messages: [{ role: 'user', content: 'Argue for...' }]
 * });
 * console.log(response.content); // Full text
 * ```
 */
export async function generateDebateResponse(
  request: DebateGenerateRequest
): Promise<string> {
  const response = await apiClient.post<DebateGenerateResponse>(
    '/api/debate/generate',
    request
  );
  return response.content;
}

/**
 * Check if the backend API is available.
 * 
 * @returns Promise that resolves to true if backend is healthy
 */
export async function isBackendHealthy(): Promise<boolean> {
  try {
    const response = await apiClient.get<{ status: string }>('/api/health');
    return response.status === 'ok';
  } catch {
    return false;
  }
}
