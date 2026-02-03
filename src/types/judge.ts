/**
 * Judge-specific type definitions for the CPDL debate system
 */

import { SpeakerRole, DebateTranscriptEntry } from './debate';

// Evaluation criteria constants
export const EVALUATION_CRITERIA = [
  'content',
  'rebuttal',
  'poiHandling',
  'delivery',
  'teamwork'
] as const;

export const CONTENT_CRITERIA_SUB = [
  'argumentStrength',
  'evidenceQuality',
  'logicalConsistency'
] as const;

export const REBUTTAL_CRITERIA_SUB = [
  'effectiveness',
  'accuracy',
  'timing'
] as const;

export const POI_HANDLING_CRITERIA_SUB = [
  'acceptanceRate',
  'responseQuality',
  'strategicUse'
] as const;

export const DELIVERY_CRITERIA_SUB = [
  'clarity',
  'confidence',
  'pace'
] as const;

export const TEAMWORK_CRITERIA_SUB = [
  'coordination',
  'support',
  'roleFulfillment'
] as const;

// Type aliases for criteria
export type EvaluationCriterion = typeof EVALUATION_CRITERIA[number];
export type ContentSubCriterion = typeof CONTENT_CRITERIA_SUB[number];
export type RebuttalSubCriterion = typeof REBUTTAL_CRITERIA_SUB[number];
export type PoiHandlingSubCriterion = typeof POI_HANDLING_CRITERIA_SUB[number];
export type DeliverySubCriterion = typeof DELIVERY_CRITERIA_SUB[number];
export type TeamworkSubCriterion = typeof TEAMWORK_CRITERIA_SUB[number];

// Interface for evaluation criteria scores
export interface EvaluationCriteria {
  content: number; // 0-100%
  rebuttal: number; // 0-100%
  poiHandling: number; // 0-100%
  delivery: number; // 0-100%
  teamwork: number; // 0-100%
}

// Interface for sub-criteria scores
export interface SubCriteriaScores {
  content?: Record<ContentSubCriterion, number>; // 0-100%
  rebuttal?: Record<RebuttalSubCriterion, number>; // 0-100%
  poiHandling?: Record<PoiHandlingSubCriterion, number>; // 0-100%
  delivery?: Record<DeliverySubCriterion, number>; // 0-100%
  teamwork?: Record<TeamworkSubCriterion, number>; // 0-100%
}

// Interface for individual speaker evaluation
export interface SpeakerEvaluation {
  role: SpeakerRole;
  scores: EvaluationCriteria;
  subScores?: SubCriteriaScores;
  narrative: string; // Feedback for this speaker
  quotes?: string[]; // Specific examples from debate transcript
}

// Interface for scorecard
export interface Scorecard {
  speakerEvaluations: SpeakerEvaluation[];
  overallRankings: SpeakerRole[]; // Ordered from 1st to 4th place
  comparativeAnalysis: string; // Comparison between speakers
  winnerDeclaration: string; // Final verdict
}

// Interface for judge feedback
export interface JudgeFeedback {
  scorecard: Scorecard;
  finalVerdict: string;
  recommendations: string[];
}

// Interface for complete judge evaluation
export interface JudgeEvaluation {
  debateId: string;
  scorecard: Scorecard;
  feedback: JudgeFeedback;
  createdAt: Date;
}

// Export all types that are used in the scoring system
export type {
  SpeakerRole,
  DebateTranscriptEntry
};