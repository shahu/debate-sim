/**
 * AI Agent configuration for CPDL debate roles
 * Creates AI agents with role-specific behavioral patterns and instructions
 */

import { SpeakerRole } from '../types/debate';
import { enforceRoleRules } from './debateRules';

interface SpeakerAgentConfig {
  role: SpeakerRole;
  systemPrompt: string;
  behavioralPatterns: string[];
  argumentationStyle: string;
}

// Base system prompt for all debate agents
const BASE_DEBATE_SYSTEM_PROMPT = `
You are participating in a Canadian Parliamentary Debate League (CPDL) format debate.
Follow all CPDL rules and format requirements. Maintain respectful, academic tone.
Focus on logical argumentation, evidence-based reasoning, and effective rhetoric.
`;

// Role-specific system prompts with their behavioral patterns
const ROLE_CONFIGURATIONS: Record<SpeakerRole, SpeakerAgentConfig> = {
  PM: {
    role: 'PM',
    systemPrompt: BASE_DEBATE_SYSTEM_PROMPT + `
You are the Prime Minister (PM), opening the debate for the Government side.
Your responsibilities:
- Define the motion clearly and precisely
- Outline the government's case with major arguments
- Establish the framework for the debate
- Provide strong foundational arguments for your position

CRITICAL RULES:
- Define the motion in a way that is fair but advantageous to your side
- Present 2-3 strong main arguments with supporting evidence
- Address potential opposition arguments preemptively
- Stay within your allocated time (7 minutes)
`,
    behavioralPatterns: [
      'Open with clear motion definition',
      'Present structured arguments with logical flow',
      'Establish burden of proof framework',
      'Preempt counterarguments',
      'Maintain confident, leading tone'
    ],
    argumentationStyle: 'Constructive and definitional - build up the government case from first principles'
  },
  
  LO: {
    role: 'LO',
    systemPrompt: BASE_DEBATE_SYSTEM_PROMPT + `
You are the Leader of Opposition (LO), opposing the motion and the PM's definition.
Your responsibilities:
- Challenge the PM's definition if it's unreasonable or overly narrow/broad
- Present the opposition's main case against the motion
- Rebut the PM's arguments comprehensively
- Offer alternative perspectives to the PM's framework

CRITICAL RULES:
- If the PM's definition is unfair, challenge it and propose a reasonable alternative
- Present strong counter-arguments to the motion
- Rebut all major PM arguments with evidence and logic
- Stay within your allocated time (8 minutes)
- Do NOT introduce new arguments that the MO will need to address
`,
    behavioralPatterns: [
      'Analyze and challenge PM\'s definition if necessary',
      'Present comprehensive opposition case',
      'Directly rebut PM arguments',
      'Establish alternative framework',
      'Maintain aggressive but respectful opposition tone'
    ],
    argumentationStyle: 'Challenging and rebuttal-focused - tear down government arguments while building opposition case'
  },
  
  MO: {
    role: 'MO',
    systemPrompt: BASE_DEBATE_SYSTEM_PROMPT + `
You are the Member of Opposition (MO), extending the opposition case.
Your responsibilities:
- Extend and develop the arguments made by the LO
- Provide additional rebuttals to the government case
- Synthesize the opposition position

CRITICAL RULES:
- DO NOT introduce new arguments that weren't mentioned by PM or LO
- Only extend existing arguments or provide new rebuttals to existing government arguments
- Support and strengthen the LO's case framework
- Stay within your allocated time (4 minutes)
`,
    behavioralPatterns: [
      'Extend LO\'s arguments with additional detail',
      'Provide deeper rebuttals to PM\'s points',
      'Synthesize opposition position',
      'Avoid introducing new arguments',
      'Maintain consistent opposition stance'
    ],
    argumentationStyle: 'Extension and synthesis - deepen existing opposition arguments without introducing new ones'
  },
  
  PW: {
    role: 'PW',
    systemPrompt: BASE_DEBATE_SYSTEM_PROMPT + `
You are the Prime Minister's Whip (PW), defending the government case and closing the debate.
Your responsibilities:
- Defend the PM's position against opposition attacks
- Provide final rebuttals to LO and MO arguments
- Summarize and reinforce the government's strongest points
- Close the debate strongly on your side's favor

CRITICAL RULES:
- DO NOT introduce new arguments that weren't mentioned by PM
- Only defend existing government arguments and rebut opposition points
- Provide comprehensive defense of government position
- Stay within your allocated time (4 minutes)
`,
    behavioralPatterns: [
      'Defend PM\'s arguments against opposition attacks',
      'Provide final comprehensive rebuttals',
      'Summarize government position effectively',
      'Avoid introducing new arguments',
      'Close debate with strong government position'
    ],
    argumentationStyle: 'Defensive and consolidating - protect government arguments and provide final rebuttals'
  }
};

/**
 * Creates an AI agent configured for a specific CPDL debate role
 * @param role The speaker role to configure the agent for
 * @returns Configuration object containing system prompt and behavioral guidelines
 */
export const createSpeakerAgent = (role: SpeakerRole): SpeakerAgentConfig => {
  const config = ROLE_CONFIGURATIONS[role];
  
  if (!config) {
    throw new Error(`Invalid speaker role: ${role}. Valid roles are: PM, LO, MO, PW`);
  }
  
  return config;
};

/**
 * Gets the system prompt for a specific role
 * @param role The speaker role
 * @returns The system prompt for the specified role
 */
export const getSpeakerSystemPrompt = (role: SpeakerRole): string => {
  return createSpeakerAgent(role).systemPrompt;
};

/**
 * Validates that the agent's output complies with role-specific requirements
 * @param role The speaker role
 * @param content The content to validate
 * @param context Additional context for validation (PM definition, previous arguments, etc.)
 * @returns Validation result with compliance status and feedback
 */
export const validateAgentOutput = (
  role: SpeakerRole, 
  content: string,
  context?: {
    pmDefinition?: string;
    previousArguments?: string[];
  }
): { isValid: boolean; feedback: string[]; violations: string[] } => {
  // Use the enforceRoleRules function from debateRules for comprehensive validation
  const { isValid, suggestions, violations } = enforceRoleRules(role, content, context);
  
  // Combine suggestions and violations as feedback
  const feedback = [...suggestions, ...violations];
  
  return { 
    isValid, 
    feedback,
    violations
  };
};

/**
 * Gets behavioral patterns for a specific role
 * @param role The speaker role
 * @returns Array of behavioral patterns for the role
 */
export const getRoleBehavioralPatterns = (role: SpeakerRole): string[] => {
  return createSpeakerAgent(role).behavioralPatterns;
};

/**
 * Gets argumentation style for a specific role
 * @param role The speaker role
 * @returns The argumentation style description
 */
export const getRoleArgumentationStyle = (role: SpeakerRole): string => {
  return createSpeakerAgent(role).argumentationStyle;
};