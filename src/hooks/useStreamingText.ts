/**
 * Buffered streaming hook for real-time text display
 * Uses ref-based accumulation with requestAnimationFrame throttling
 * Prevents excessive re-renders during high-frequency token streams
 * 
 * UPDATED: Now uses backend API via streamDebateResponse instead of ai-sdk
 * Supports both legacy AsyncIterable interface and new DebateStreamRequest API
 */

import { useEffect, useRef, useState } from 'react';
import { streamDebateResponse } from '../api/debate';
import type { DebateStreamRequest } from '../api/types';

/**
 * Hook interface for streaming text state
 */
interface StreamingTextResult {
  displayText: string;
  isStreaming: boolean;
  error: Error | null;
}

/**
 * Hook options for streaming
 */
interface UseStreamingTextOptions {
  enabled?: boolean;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Type guard to check if value is a DebateStreamRequest
 */
function isDebateStreamRequest(
  value: DebateStreamRequest | AsyncIterable<string> | null
): value is DebateStreamRequest {
  return value !== null && 
         typeof value === 'object' && 
         'messages' in value;
}

/**
 * Type guard to check if value is an AsyncIterable
 */
function isAsyncIterable(
  value: DebateStreamRequest | AsyncIterable<string> | null
): value is AsyncIterable<string> {
  return value !== null && 
         typeof value === 'object' && 
         typeof (value as AsyncIterable<string>)[Symbol.asyncIterator] === 'function';
}

/**
 * Buffered streaming hook for AI-generated text from backend API
 *
 * @remarks
 * This hook implements Pattern 1 from RESEARCH.md - Buffered State Updates:
 * - Accumulates incoming chunks in a ref (no re-renders)
 * - Syncs to display state via requestAnimationFrame at 60fps max
 * - Provides proper cleanup to prevent memory leaks
 * 
 * UPDATED: Now consumes SSE stream from Python backend instead of ai-sdk.
 * Supports both legacy AsyncIterable<string> and new DebateStreamRequest APIs
 * for backward compatibility.
 *
 * Why refs + rAF? Avoids 20-60 re-renders per second from token stream,
 * maintaining smooth 60fps display updates instead.
 *
 * @param source - Debate stream request OR AsyncIterable<string> (legacy)
 * @param options - Hook options (enabled, callbacks) OR boolean (legacy enabled flag)
 *
 * @returns Object containing displayText, isStreaming status, and any error
 *
 * @example
 * ```typescript
 * // New API
 * const { displayText, isStreaming, error } = useStreamingText(
 *   { messages: [{ role: 'user', content: 'Hello' }] },
 *   { enabled: true }
 * );
 * 
 * // Legacy API (still supported)
 * const { displayText, isStreaming, error } = useStreamingText(
 *   asyncGenerator,
 *   true
 * );
 * ```
 */
export function useStreamingText(
  source: DebateStreamRequest | AsyncIterable<string> | null,
  options?: UseStreamingTextOptions | boolean
): StreamingTextResult {
  // Normalize options
  const normalizedOptions: UseStreamingTextOptions = typeof options === 'boolean' 
    ? { enabled: options }
    : options || {};
  
  const { enabled = true, onComplete, onError } = normalizedOptions;
  
  // High-frequency accumulation in ref - no re-renders
  const accumulatorRef = useRef<string>('');
  
  // AbortController for canceling streams
  const abortControllerRef = useRef<AbortController | null>(null);

  // State for throttled display - updates only at 60fps
  const [displayText, setDisplayText] = useState<string>('');

  // Track streaming state separately
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Track rAF ID for cleanup
  const rafIdRef = useRef<number>();
  
  // Track the current stream for cleanup
  const currentStreamRef = useRef<AsyncIterable<string> | null>(null);

  useEffect(() => {
    // Skip if disabled or no source provided
    if (!enabled || !source) {
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setError(null);
    accumulatorRef.current = '';
    
    // Create abort controller for this stream
    abortControllerRef.current = new AbortController();

    // Throttled sync loop using requestAnimationFrame
    const syncToDisplay = () => {
      if (accumulatorRef.current !== displayText) {
        // CRITICAL: Use functional update to avoid stale closures
        setDisplayText(_prev => accumulatorRef.current);
      }
      rafIdRef.current = requestAnimationFrame(syncToDisplay);
    };

    // Start sync loop
    rafIdRef.current = requestAnimationFrame(syncToDisplay);

    // Consume the stream from backend API
    const consumeStream = async () => {
      try {
        // Determine the stream source
        let stream: AsyncIterable<string>;
        
        if (isDebateStreamRequest(source)) {
          // New API: Create stream from DebateStreamRequest
          stream = streamDebateResponse(source);
        } else if (isAsyncIterable(source)) {
          // Legacy API: Use provided AsyncIterable directly
          stream = source;
        } else {
          throw new Error('Invalid source: must be DebateStreamRequest or AsyncIterable<string>');
        }
        
        currentStreamRef.current = stream;
        
        for await (const chunk of stream) {
          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }
          
          // Accumulate in ref - no re-render triggered
          accumulatorRef.current += chunk;
        }

        // After stream completes, ensure final state sync and stop syncing
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }

        // Final sync to display
        setDisplayText(_prev => accumulatorRef.current);
        setIsStreaming(false);
        
        // Call completion callback
        onComplete?.();
        
      } catch (err) {
        // Handle errors during stream consumption
        const error = err instanceof Error ? err : new Error('Unknown streaming error');
        setError(error);
        setIsStreaming(false);
        
        // Call error callback
        onError?.(error);

        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      }
    };

    consumeStream();

    // Cleanup function - prevents memory leaks
    return () => {
      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Cancel rAF to stop sync loop
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Reset streaming state
      setIsStreaming(false);

      // Note: We don't clear accumulatorRef or displayText on unmount
      // This preserves the final text for display
    };
  }, [source, enabled, onComplete, onError]); // Dependencies

  return {
    displayText,
    isStreaming,
    error
  };
}

/**
 * Standalone function to stream text without React hook lifecycle
 * Useful for streaming outside of components
 * 
 * @param request - Debate stream request
 * @param onChunk - Callback for each text chunk
 * @param onComplete - Callback when streaming completes
 * @param onError - Callback when error occurs
 */
export async function streamText(
  request: DebateStreamRequest,
  onChunk: (chunk: string) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const stream = streamDebateResponse(request);
    
    for await (const chunk of stream) {
      onChunk(chunk);
    }
    
    onComplete?.();
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Streaming failed');
    onError?.(error);
    throw error;
  }
}
