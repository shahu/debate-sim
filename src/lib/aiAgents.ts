/**
 * AI Agent implementation for CPDL debate roles
 * Creates AI agents with role-specific behavioral patterns and instructions
 * Uses Backend API for content generation (previously used Vercel AI SDK)
 */

import { SpeakerRole } from '../types/debate';
import { enforceRoleRules } from './debateRules';
import { streamDebateResponse, generateDebateResponse } from '../api/debate';
import type { ChatMessage } from '../api/types';

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
  [SpeakerRole.PM]: {
    role: SpeakerRole.PM,
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
  
  [SpeakerRole.LO]: {
    role: SpeakerRole.LO,
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
  
  [SpeakerRole.MO]: {
    role: SpeakerRole.MO,
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
  
  [SpeakerRole.PW]: {
    role: SpeakerRole.PW,
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

/**
 * Interface for debate content generated by AI agents
 */
interface DebateContent {
  content: string;
  role: SpeakerRole;
  wordCount: number;
}

/**
 * Builds the messages array for the LLM API
 * @param systemPrompt - The system prompt for the role
 * @param contextHistory - The debate context and history
 * @returns Array of ChatMessage for the API
 */
function buildMessages(systemPrompt: string, contextHistory: string): ChatMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextHistory }
  ];
}

/**
 * Generates content for the specified role using backend API
 * @param role The speaker role
 * @param motion The debate motion
 * @param previousStatements Previous statements in the debate
 * @param povRequest Optional POI request to respond to
 * @returns Generated debate content
 */
export const generateSpeakerContent = async (
  role: SpeakerRole,
  motion: string,
  previousStatements: Array<{ role: SpeakerRole; content: string }> = [],
  povRequest?: { requester: SpeakerRole; content: string }
): Promise<DebateContent> => {
  try {
    // Format conversation history for context
    let contextHistory = `DEBATE MOTION: ${motion}\n\n`;

    if (previousStatements.length > 0) {
      contextHistory += "PREVIOUS STATEMENTS:\n";
      previousStatements.forEach((statement, index) => {
        contextHistory += `${index + 1}. ${statement.role}: ${statement.content}\n`;
      });
      contextHistory += "\n";
    }

    if (povRequest) {
      contextHistory += `POINT OF INFORMATION REQUEST from ${povRequest.requester}: ${povRequest.content}\n`;
      contextHistory += "Respond briefly to accept or reject the POI, then continue with your main points.\n\n";
    }

    // Get the role-specific system prompt
    const rolePrompt = getSpeakerSystemPrompt(role);

    // Build messages for API
    const messages = buildMessages(rolePrompt, contextHistory);

    // Generate text using backend API
    const generatedContent = await generateDebateResponse({ messages });
    const wordCount = generatedContent.split(/\s+/).length;

    return {
      content: generatedContent,
      role,
      wordCount
    };
  } catch (error) {
    console.error(`Error generating content for ${role}:`, error);
    throw new Error(`Failed to generate content for ${role} role: ${(error as Error).message}`);
  }
};

/**
 * Streams content for specified role using backend API
 * @param role The speaker role
 * @param motion The debate motion
 * @param previousStatements Previous statements in debate
 * @param povRequest Optional POI request to respond to
 * @returns Async generator yielding text chunks as they arrive from the backend
 *
 * @remarks
 * This function provides real-time streaming of AI-generated content for a more natural debate experience.
 * Use this when you want to display content as it's generated, instead of waiting for full completion.
 * 
 * NOTE: Now uses backend API instead of direct ai-sdk calls for security (API keys are server-side only).
 *
 * @example
 * ```typescript
 * for await (const chunk of streamSpeakerContent(role, motion, previousStatements)) {
 *   displayText += chunk; // Update UI incrementally
 * }
 * ```
 */
export async function* streamSpeakerContent(
  role: SpeakerRole,
  motion: string,
  previousStatements: Array<{ role: SpeakerRole; content: string }> = [],
  povRequest?: { requester: SpeakerRole; content: string }
): AsyncIterable<string> {
  try {
    // Format conversation history for context (same as generateSpeakerContent)
    let contextHistory = `DEBATE MOTION: ${motion}\n\n`;

    if (previousStatements.length > 0) {
      contextHistory += "PREVIOUS STATEMENTS:\n";
      previousStatements.forEach((statement, index) => {
        contextHistory += `${index + 1}. ${statement.role}: ${statement.content}\n`;
      });
      contextHistory += "\n";
    }

    if (povRequest) {
      contextHistory += `POINT OF INFORMATION REQUEST from ${povRequest.requester}: ${povRequest.content}\n`;
      contextHistory += "Respond briefly to accept or reject the POI, then continue with your main points.\n\n";
    }

    // Get the role-specific system prompt
    const rolePrompt = getSpeakerSystemPrompt(role);

    // Build messages for API
    const messages = buildMessages(rolePrompt, contextHistory);

    // Stream text using backend API via SSE
    const stream = streamDebateResponse({ messages });

    // Yield chunks as they arrive from the stream
    for await (const chunk of stream) {
      yield chunk;
    }
  } catch (error) {
    console.error(`Error streaming content for ${role}:`, error);
    throw new Error(`Failed to stream content for ${role} role: ${(error as Error).message}`);
  }
}
