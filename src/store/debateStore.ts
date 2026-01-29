import { create } from 'zustand';
import { SpeakerRole } from '../types/debate';
import { DebateTimer } from '../hooks/useDebateTimer';

// Define the structure for debate transcript entries
export interface TranscriptEntry {
  id: string;
  speaker: SpeakerRole;
  content: string;
  timestamp: Date;
  type: 'speech' | 'poi-request' | 'poi-response' | 'transition'; // Different types of entries
  wordCount?: number;
  duration?: number; // Duration in seconds
}

// Define the debate state interface
export interface DebateState {
  // Debate metadata
  motion: string | null;
  status: 'idle' | 'preparing' | 'active' | 'paused' | 'completed';

  // Current speaker and turn information
  currentSpeaker: SpeakerRole | null;
  currentSpeakerIndex: number; // Index in the speaking order
  speakingSequence: SpeakerRole[]; // Order of speakers [PM, LO, MO, PW]

  // Time management
  timer: DebateTimer | null;
  timeRemaining: number; // Seconds remaining for current speaker

  // Debate transcript
  transcript: TranscriptEntry[];

  // Active streaming entry
  streamingEntry: {
    id: string;
    speaker: SpeakerRole;
    streamGenerator: AsyncIterable<string> | null;
  } | null;

  // Debate statistics
  statistics: {
    totalWords: number;
    avgWordsPerSpeaker: number;
    totalSpeakingTime: number; // In seconds
  };
  
  // Actions
  startDebate: (motion: string) => void;
  nextSpeaker: () => void;
  addTranscriptEntry: (entry: Omit<TranscriptEntry, 'id' | 'timestamp'>) => void;
  updateTimer: (timer: DebateTimer) => void;
  setTimeRemaining: (seconds: number) => void;
  resetDebate: () => void;
  pauseDebate: () => void;
  resumeDebate: () => void;
  endDebate: () => void;
  startStreamingEntry: (speaker: SpeakerRole, streamGenerator: AsyncIterable<string>) => void;
  finalizeStreamingEntry: (finalText: string, wordCount: number) => void;
  cancelStreamingEntry: () => void;
}

// Create the debate store
export const useDebateStore = create<DebateState>((set, get) => ({
  // Initial state
  motion: null,
  status: 'idle',
  currentSpeaker: null,
  currentSpeakerIndex: -1,
  speakingSequence: [SpeakerRole.PM, SpeakerRole.LO, SpeakerRole.MO, SpeakerRole.PW],
  timer: null,
  timeRemaining: 0,
  transcript: [],
  streamingEntry: null,
  statistics: {
    totalWords: 0,
    avgWordsPerSpeaker: 0,
    totalSpeakingTime: 0
  },

  // Actions
  startDebate: (motion: string) => set((state) => ({
    ...state,
    motion,
    status: 'active',
    currentSpeaker: state.speakingSequence[0],
    currentSpeakerIndex: 0,
    timeRemaining: state.currentSpeaker === SpeakerRole.PM ? 420 : 0, // 7 min for PM initially
    transcript: [{
      id: `entry-${Date.now()}`,
      speaker: state.speakingSequence[0],
      content: `Starting debate on motion: ${motion}`,
      timestamp: new Date(),
      type: 'transition'
    }]
  })),

  nextSpeaker: () => set((state) => {
    const nextIndex = (state.currentSpeakerIndex + 1) % state.speakingSequence.length;
    const nextSpeaker = state.speakingSequence[nextIndex];
    
    // Calculate time allocation based on role
    let timeAllocation = 0;
    switch(nextSpeaker) {
      case SpeakerRole.PM: timeAllocation = 420; break; // 7 min
      case SpeakerRole.LO: timeAllocation = 480; break; // 8 min
      case SpeakerRole.MO: timeAllocation = 240; break; // 4 min
      case SpeakerRole.PW: timeAllocation = 240; break; // 4 min
      default: timeAllocation = 0;
    }
    
    return {
      ...state,
      currentSpeaker: nextSpeaker,
      currentSpeakerIndex: nextIndex,
      timeRemaining: timeAllocation,
      transcript: [
        ...state.transcript,
        {
          id: `entry-${Date.now()}`,
          speaker: nextSpeaker,
          content: `Transitioning to ${nextSpeaker}`,
          timestamp: new Date(),
          type: 'transition'
        }
      ]
    };
  }),

  addTranscriptEntry: (entry) => set((state) => {
    const newEntry: TranscriptEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Update statistics
    const totalWords = state.statistics.totalWords + (entry.wordCount || 0);
    const avgWordsPerSpeaker = totalWords / state.speakingSequence.length;
    
    return {
      ...state,
      transcript: [...state.transcript, newEntry],
      statistics: {
        ...state.statistics,
        totalWords,
        avgWordsPerSpeaker
      }
    };
  }),

  updateTimer: (timer: DebateTimer) => set((state) => ({
    ...state,
    timer
  })),

  setTimeRemaining: (seconds: number) => set((state) => ({
    ...state,
    timeRemaining: seconds
  })),

  resetDebate: () => set(() => ({
    motion: null,
    status: 'idle',
    currentSpeaker: null,
    currentSpeakerIndex: -1,
    timer: null,
    timeRemaining: 0,
    transcript: [],
    streamingEntry: null,
    statistics: {
      totalWords: 0,
      avgWordsPerSpeaker: 0,
      totalSpeakingTime: 0
    }
  })),

  startStreamingEntry: (speaker: SpeakerRole, streamGenerator: AsyncIterable<string>) => set((state) => ({
    streamingEntry: {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speaker,
      streamGenerator
    }
  })),

  finalizeStreamingEntry: (finalText: string, wordCount: number) => set((state) => {
    if (!state.streamingEntry) return state;

    const newEntry: TranscriptEntry = {
      id: state.streamingEntry.id,
      speaker: state.streamingEntry.speaker,
      content: finalText,
      timestamp: new Date(),
      type: 'speech',
      wordCount
    };

    // Update statistics
    const totalWords = state.statistics.totalWords + wordCount;
    const avgWordsPerSpeaker = totalWords / state.speakingSequence.length;

    return {
      ...state,
      transcript: [...state.transcript, newEntry],
      streamingEntry: null,
      statistics: {
        ...state.statistics,
        totalWords,
        avgWordsPerSpeaker
      }
    };
  }),

  cancelStreamingEntry: () => set(() => ({
    streamingEntry: null
  })),

  pauseDebate: () => set((state) => ({
    ...state,
    status: 'paused'
  })),

  pauseDebate: () => set((state) => ({
    ...state,
    status: 'paused'
  })),

  resumeDebate: () => set((state) => ({
    ...state,
    status: 'active'
  })),

  endDebate: () => set((state) => ({
    ...state,
    status: 'completed'
  }))
}));