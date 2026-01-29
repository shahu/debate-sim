import * as React from 'react';

import { useStreamingText } from '../hooks/useStreamingText';
import { SpeakerRole } from '../types/debate';

interface StreamingTranscriptEntryProps {
  speaker: SpeakerRole;
  streamGenerator: AsyncIterable<string> | null;
  onComplete: (finalText: string) => void;
}

// Role full names for display
const ROLE_NAMES: Record<SpeakerRole, string> = {
  PM: 'Prime Minister',
  LO: 'Leader of Opposition',
  MO: 'Member of Opposition',
  PW: "Prime Minister's Whip",
};

export function StreamingTranscriptEntry({
  speaker,
  streamGenerator,
  onComplete
}: StreamingTranscriptEntryProps) {
  const { displayText, isStreaming, error } = useStreamingText(streamGenerator, !!streamGenerator);

  // Call onComplete when streaming finishes
  // We use a ref to track if we've already called it to avoid duplicate calls
  const completedRef = React.useRef(false);
  const prevStreamingRef = React.useRef(isStreaming);

  React.useEffect(() => {
    // Transition from streaming to not streaming -> completion
    if (prevStreamingRef.current && !isStreaming && !completedRef.current && !error) {
      completedRef.current = true;
      onComplete(displayText);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, displayText, error, onComplete]);

  // Handle error state
  if (error) {
    return (
      <div className={`speaker-card-${speaker.toLowerCase()} rounded-lg p-4 shadow-sm mb-3 bg-red-50 border-red-300 animate-fade-in`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`role-badge-${speaker.toLowerCase()} text-xs font-bold px-2 py-1 rounded`}>
              {speaker}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {ROLE_NAMES[speaker]}
            </span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              Error
            </span>
          </div>
        </div>
        <div className="text-red-700 text-sm">
          Failed to load content: {error.message}
        </div>
      </div>
    );
  }

  // Streaming state with pulsing border and dimmer background
  const streamingClass = isStreaming ? 'animate-pulse opacity-90' : '';

  return (
    <div
      className={`speaker-card-${speaker.toLowerCase()} rounded-lg p-4 shadow-sm mb-3 transition-all duration-200 hover:shadow-md animate-fade-in ${streamingClass}`}
    >
      {/* Header with role badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`role-badge-${speaker.toLowerCase()} text-xs font-bold px-2 py-1 rounded`}>
            {speaker}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {ROLE_NAMES[speaker]}
          </span>
          {isStreaming && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full animate-pulse">
              Speaking...
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-gray-800 text-base leading-relaxed">
        {displayText || <span className="text-gray-400 italic">Generating response...</span>}
      </div>
    </div>
  );
}

export default StreamingTranscriptEntry;
