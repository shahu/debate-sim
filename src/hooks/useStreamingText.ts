/**
 * Buffered streaming hook for real-time text display
 * Uses ref-based accumulation with requestAnimationFrame throttling
 * Prevents excessive re-renders during high-frequency token streams
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Hook interface for streaming text state
 */
interface StreamingTextResult {
  displayText: string;
  isStreaming: boolean;
  error: Error | null;
}

/**
 * Buffered streaming hook for AI-generated text
 *
 * @remarks
 * This hook implements Pattern 1 from RESEARCH.md - Buffered State Updates:
 * - Accumulates incoming chunks in a ref (no re-renders)
 * - Syncs to display state via requestAnimationFrame at 60fps max
 * - Provides proper cleanup to prevent memory leaks
 *
 * Why refs + rAF? Avoids 20-60 re-renders per second from token stream,
 * maintaining smooth 60fps display updates instead.
 *
 * @param streamGenerator - Async iterable of text chunks to consume
 * @param enabled - Whether streaming should be active (allows conditional streaming)
 *
 * @returns Object containing displayText, isStreaming status, and any error
 *
 * @example
 * ```typescript
 * const { displayText, isStreaming, error } = useStreamingText(stream, true);
 * <div>{displayText}</div>
 * ```
 */
export function useStreamingText(
  streamGenerator: AsyncIterable<string> | null,
  enabled: boolean = true
): StreamingTextResult {
  // High-frequency accumulation in ref - no re-renders
  const accumulatorRef = useRef<string>('');

  // State for throttled display - updates only at 60fps
  const [displayText, setDisplayText] = useState<string>('');

  // Track streaming state separately
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Track rAF ID for cleanup
  const rafIdRef = useRef<number>();

  useEffect(() => {
    // Skip if disabled or no stream provided
    if (!enabled || !streamGenerator) {
      setIsStreaming(false);
      return;
    }

    setIsStreaming(true);
    setError(null);
    accumulatorRef.current = '';

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

    // Consume the async iterable
    const consumeStream = async () => {
      try {
        for await (const chunk of streamGenerator) {
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
      } catch (err) {
        // Handle errors during stream consumption
        const error = err instanceof Error ? err : new Error('Unknown streaming error');
        setError(error);
        setIsStreaming(false);

        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }
      }
    };

    consumeStream();

    // Cleanup function - prevents memory leaks
    return () => {
      // Cancel rAF to stop sync loop
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // Reset streaming state
      setIsStreaming(false);

      // Note: We don't clear accumulatorRef or displayText on unmount
      // This preserves the final text for display
    };
  }, [streamGenerator, enabled]); // Dependencies

  return {
    displayText,
    isStreaming,
    error
  };
}
