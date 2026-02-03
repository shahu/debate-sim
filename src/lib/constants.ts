/**
 * Constants and configuration for CPDL debate system
 */
import { SpeakerRole } from '../types/debate';

// Array of speaker roles in correct CPDL order
export const SPEAKER_ROLES: SpeakerRole[] = [
  SpeakerRole.PM, 
  SpeakerRole.LO, 
  SpeakerRole.MO, 
  SpeakerRole.PW
];

// Time allocations for each role in seconds (PM: 7min, LO: 8min, MO: 4min, PW: 4min)
export const DEFAULT_TIMERS: Record<SpeakerRole, number> = {
  [SpeakerRole.PM]: 420, // 7 minutes
  [SpeakerRole.LO]: 480, // 8 minutes
  [SpeakerRole.MO]: 240, // 4 minutes
  [SpeakerRole.PW]: 240  // 4 minutes
};

// Protected time constants (in seconds) - first and last minute when POIs not allowed
export const PROTECTED_TIME_START = 60;  // First minute (60 seconds)
export const PROTECTED_TIME_END = 60;    // Last minute (60 seconds)

// Regular expression for validating debate motion format
export const DEBATE_MOTION_REGEX = /^This House believes that\s+.+/i;

// Descriptions of responsibilities for each role
export const ROLE_DESCRIPTIONS: Record<SpeakerRole, string> = {
  [SpeakerRole.PM]: "Prime Minister: Opens the debate, defines the motion, presents government case with major arguments",
  [SpeakerRole.LO]: "Leader of Opposition: Challenges PM's definition, presents opposition case, rebuts PM's arguments",
  [SpeakerRole.MO]: "Member of Opposition: Extends opposition arguments, rebuts government case, cannot introduce new arguments",
  [SpeakerRole.PW]: "Prime Minister's Whip: Defends government position, rebuts opposition, cannot introduce new arguments"
};

// Round structure for CPDL format
export const CPDL_ROUND_STRUCTURE = [
  { speaker: SpeakerRole.PM, description: 'Opening speech' },
  { speaker: SpeakerRole.LO, description: 'Reply speech' },
  { speaker: SpeakerRole.MO, description: 'Extension speech' },
  { speaker: SpeakerRole.PW, description: 'Closing speech' }
];

// Time limits for POI offering (between protected times)
export const POI_ALLOWED_TIME_RANGES: Record<SpeakerRole, { start: number; end: number }> = {
  [SpeakerRole.PM]: { start: PROTECTED_TIME_START, end: DEFAULT_TIMERS[SpeakerRole.PM] - PROTECTED_TIME_END },
  [SpeakerRole.LO]: { start: PROTECTED_TIME_START, end: DEFAULT_TIMERS[SpeakerRole.LO] - PROTECTED_TIME_END },
  [SpeakerRole.MO]: { start: PROTECTED_TIME_START, end: DEFAULT_TIMERS[SpeakerRole.MO] - PROTECTED_TIME_END },
  [SpeakerRole.PW]: { start: PROTECTED_TIME_START, end: DEFAULT_TIMERS[SpeakerRole.PW] - PROTECTED_TIME_END }
};