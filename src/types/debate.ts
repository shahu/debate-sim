/**
 * Core type definitions for the CPDL debate system
 */

// Enum for speaker roles in CPDL format
export enum SpeakerRole {
  PM = 'PM', // Prime Minister
  LO = 'LO', // Leader of Opposition
  MO = 'MO', // Member of Opposition
  PW = 'PW'  // Prime Minister's Whip
}

// Interface for individual speaker
export interface Speaker {
  id: string;
  name: string;
  role: SpeakerRole;
  speakingTime: number; // Time allocated in seconds
}

// Interface for debate transcript entries
export interface DebateTranscriptEntry {
  speaker: SpeakerRole;
  content: string;
  timestamp: Date;
  hasPOI?: boolean; // Flag indicating if Point of Information was offered
  poiAccepted?: boolean; // Whether the POI was accepted (if offered)
}

// Interface for debate timer functionality
export interface DebateTimer {
  timeRemaining: number; // Time remaining in seconds
  isRunning: boolean;
  startTime?: Date;
  currentTime?: Date;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}

// Main interface for debate state
export interface DebateState {
  id?: string;
  motion: string; // The debate motion in "This House believes that..." format
  currentSpeaker: SpeakerRole | null;
  timeRemaining: number; // Current speaker's remaining time in seconds
  speakers: Speaker[];
  transcript: DebateTranscriptEntry[];
  isRunning: boolean;
  isPaused: boolean;
  currentRound?: number; // Current round in the debate (1-4 for CPDL)
  debateStartTime?: Date;
  debateEndTime?: Date;
  winner?: SpeakerRole | 'tie'; // Debate winner or tie
  timer: DebateTimer;
  currentPOIOfferer?: SpeakerRole; // Current speaker offering POI (if any)
  canOfferPOI: boolean; // Whether POI can currently be offered
  protectedTime: boolean; // Whether current time is protected (first/last minute)
}