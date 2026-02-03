import { create } from 'zustand';
import { SpeakerRole } from '../types/debate';
import { DebateTimer } from '../hooks/useDebateTimer';
import { debateEngine } from '../lib/debateEngine';
import { JudgeEvaluation } from '../types/judge';
import { analyzeDebateTranscript } from '../lib/scoringSystem';

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

  // Judge evaluation
  judgeEvaluation: JudgeEvaluation | null;

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
  generateJudgeEvaluation: () => void;
  resetJudgeEvaluation: () => void;
}

// Create the debate store
export const useDebateStore = create<DebateState>((set) => ({
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
  judgeEvaluation: null,
  statistics: {
    totalWords: 0,
    avgWordsPerSpeaker: 0,
    totalSpeakingTime: 0
  },

  // Actions
  startDebate: (motion: string) => {
    set((state) => ({
      ...state,
      motion,
      status: 'active',
      currentSpeaker: state.speakingSequence[0],
      currentSpeakerIndex: 0,
      timeRemaining: 420, // 7 min for PM initially
      transcript: [{
        id: `entry-${Date.now()}`,
        speaker: state.speakingSequence[0],
        content: `Starting debate on motion: ${motion}`,
        timestamp: new Date(),
        type: 'transition'
      }]
    }));

    // Engine initialization and streaming is handled by the component
    // to avoid circular dependencies
  },

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
    judgeEvaluation: null,
    statistics: {
      totalWords: 0,
      avgWordsPerSpeaker: 0,
      totalSpeakingTime: 0
    }
  })),

  startStreamingEntry: (speaker: SpeakerRole, streamGenerator: AsyncIterable<string>) => set(() => ({
    streamingEntry: {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      speaker,
      streamGenerator
    }
  })),

  finalizeStreamingEntry: (finalText: string, wordCount: number) => {
    console.log(`[Store] Finalizing streaming entry for speaker, text length: ${finalText.length}, words: ${wordCount}`);
    
    set((state) => {
      if (!state.streamingEntry) {
        console.log('[Store] No streaming entry to finalize');
        return state;
      }

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

      console.log(`[Store] Adding entry to transcript, current count: ${state.transcript.length}`);

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
    });
    
    // After finalizing, trigger next speaker if debate is still active
    // Use setTimeout to avoid circular dependency issues
    setTimeout(() => {
      const { debateEngine } = require('../lib/debateEngine');
      const state = useDebateStore.getState();
      console.log(`[Store] Checking if should advance: status=${state.status}, index=${state.currentSpeakerIndex}, total=${state.speakingSequence.length}`);
      if (state.status === 'active') {
        const { currentSpeakerIndex, speakingSequence } = state;
        if (currentSpeakerIndex < speakingSequence.length - 1) {
          console.log('[Store] Auto-advancing to next speaker after streaming completion');
          debateEngine.nextSpeaker();
        } else {
          console.log('[Store] Last speaker finished, ending debate');
          useDebateStore.getState().endDebate();
        }
      }
    }, 1000); // Small delay to allow UI to update
  },

  cancelStreamingEntry: () => set(() => ({
    streamingEntry: null
  })),

  pauseDebate: () => set((state) => ({
    ...state,
    status: 'paused'
  })),

  resumeDebate: () => set((state) => ({
    ...state,
    status: 'active'
  })),

  endDebate: () => {
    set((state) => ({
      ...state,
      status: 'completed'
    }));
    
    // Generate judge evaluation after state update 
    setTimeout(() => {
      useDebateStore.getState().generateJudgeEvaluation();
    }, 0);
  },
  
  generateJudgeEvaluation: () => set((state) => {
    if (state.transcript.length > 0) {
      const evaluation = analyzeDebateTranscript(state.transcript, state.motion || undefined);
      return {
        ...state,
        judgeEvaluation: evaluation
      };
    }
    return state;
  }),
  
  resetJudgeEvaluation: () => set(() => ({
    judgeEvaluation: null
  }))
}));

// Initialize debate engine with store actions after store creation
// This breaks the circular dependency
debateEngine.setStore({
  getState: () => useDebateStore.getState(),
  startDebate: () => { /* no-op - handled by component */ },
  nextSpeaker: () => useDebateStore.getState().nextSpeaker(),
  addTranscriptEntry: (entry) => useDebateStore.getState().addTranscriptEntry(entry),
  startStreamingEntry: (speaker, streamGenerator) => 
    useDebateStore.getState().startStreamingEntry(speaker, streamGenerator),
  cancelStreamingEntry: () => useDebateStore.getState().cancelStreamingEntry(),
  endDebate: () => useDebateStore.getState().endDebate(),
  pauseDebate: () => useDebateStore.getState().pauseDebate(),
  resumeDebate: () => useDebateStore.getState().resumeDebate(),
  resetDebate: () => useDebateStore.getState().resetDebate()
});