import { useRef, useEffect, useState } from 'react';
import { useDebateStore } from '../store/debateStore';
import { SpeakerCard } from './SpeakerCard';
import { StreamingTranscriptEntry } from './StreamingTranscriptEntry';
import { SpeakerRole } from '../types/debate';

export function TranscriptPanel() {
  const { transcript, streamingEntry, finalizeStreamingEntry } = useDebateStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new entries are added or streaming changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript.length, streamingEntry?.id]);

  // Handle scroll to detect if user has scrolled up
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Scroll to bottom button click
  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Debate Transcript</h2>
        <p className="text-sm text-gray-500">
          {transcript.length === 0 
            ? 'No entries yet. Start a debate to see the transcript.'
            : `${transcript.length} ${transcript.length === 1 ? 'entry' : 'entries'}`
          }
        </p>
      </div>
      
      {/* Scrollable Content */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="p-4 h-96 overflow-y-auto scroll-smooth"
      >
        {transcript.length === 0 && !streamingEntry ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-lg">The debate transcript will appear here</p>
            <p className="text-sm mt-1">Enter a motion and start the debate to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transcript.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-slide-in"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
              >
                <SpeakerCard
                  role={entry.speaker as SpeakerRole}
                  content={entry.content}
                  timestamp={entry.timestamp}
                  type={entry.type}
                />
              </div>
            ))}
            {/* Streaming entry - appears after completed entries */}
            {streamingEntry && (
              <div className="animate-fade-in">
                <StreamingTranscriptEntry
                  speaker={streamingEntry.speaker}
                  streamGenerator={streamingEntry.streamGenerator}
                  onComplete={(finalText) => {
                    const wordCount = finalText.split(/\s+/).filter(w => w.length > 0).length;
                    finalizeStreamingEntry(finalText, wordCount);
                  }}
                />
              </div>
            )}
            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && transcript.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 animate-bounce-attention"
          aria-label="Scroll to latest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default TranscriptPanel;
