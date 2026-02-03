/**
 * Core algorithms for calculating judge scores and feedback
 */

import { 
  SpeakerEvaluation,
  Scorecard,
  JudgeFeedback,
  JudgeEvaluation,
  EvaluationCriterion,
  EvaluationCriteria,
  SubCriteriaScores
} from '../types/judge';

import { 
  SpeakerRole, 
  DebateTranscriptEntry
} from '../types/debate';

/**
 * Calculates scores for a single speaker based on transcript analysis
 */
export function calculateSpeakerScore(
  transcript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole,
  debateMotion?: string
): SpeakerEvaluation {
  const speakerEntries = transcript.filter(entry => entry.speaker === speakerRole);
  
  // Initialize scores
  const scores: EvaluationCriteria = {
    content: 0,
    rebuttal: 0,
    poiHandling: 0,
    delivery: 0,
    teamwork: 0
  };
  
  // Initialize sub-scores
  const subScores: SubCriteriaScores = {};
  
  // Content evaluation
  const contentScore = evaluateContent(speakerEntries, debateMotion);
  scores.content = contentScore.score;
  subScores.content = contentScore.subScores;
  
  // Rebuttal evaluation
  const rebuttalScore = evaluateRebuttal(speakerEntries, transcript, speakerRole);
  scores.rebuttal = rebuttalScore.score;
  subScores.rebuttal = rebuttalScore.subScores;
  
  // POI handling evaluation
  const poiScore = evaluatePoiHandling(speakerEntries, transcript);
  scores.poiHandling = poiScore.score;
  subScores.poiHandling = poiScore.subScores;
  
  // Delivery evaluation
  const deliveryScore = evaluateDelivery(speakerEntries);
  scores.delivery = deliveryScore.score;
  subScores.delivery = deliveryScore.subScores;
  
  // Teamwork evaluation (for MO and PW roles)
  if (speakerRole === SpeakerRole.MO || speakerRole === SpeakerRole.PW) {
    const teamworkScore = evaluateTeamwork(speakerEntries, transcript, speakerRole);
    scores.teamwork = teamworkScore.score;
    subScores.teamwork = teamworkScore.subScores;
  } else {
    // PM and LO have less emphasis on teamwork, so give higher base scores
    scores.teamwork = 85; // Higher score for PM/LO as they lead their respective sides
  }
  
  // Generate narrative feedback
  const narrative = generateNarrativeFeedback(speakerRole, scores, subScores);
  
  // Extract relevant quotes from transcript
  const quotes = extractQuotes(speakerEntries);
  
  return {
    role: speakerRole,
    scores,
    subScores,
    narrative,
    quotes
  };
}

/**
 * Evaluates content quality (arguments, evidence, logical consistency)
 */
function evaluateContent(
  entries: DebateTranscriptEntry[],
  debateMotion?: string
): { score: number; subScores: Record<string, number> } {
  let totalContentScore = 0;
  const contentSubScores: Record<string, number> = {};
  
  // Argument strength evaluation
  let argStrengthSum = 0;
  let argCount = 0;
  for (const entry of entries) {
    const argStrength = estimateArgumentStrength(entry.content, debateMotion);
    argStrengthSum += argStrength;
    argCount++;
  }
  const avgArgStrength = argCount > 0 ? argStrengthSum / argCount : 50;
  contentSubScores.argumentStrength = Math.min(100, Math.max(0, avgArgStrength));
  
  // Evidence quality evaluation
  let evidenceQualitySum = 0;
  let evidenceCount = 0;
  for (const entry of entries) {
    const evidenceQuality = estimateEvidenceQuality(entry.content);
    evidenceQualitySum += evidenceQuality;
    evidenceCount++;
  }
  const avgEvidenceQuality = evidenceCount > 0 ? evidenceQualitySum / evidenceCount : 50;
  contentSubScores.evidenceQuality = Math.min(100, Math.max(0, avgEvidenceQuality));
  
  // Logical consistency evaluation
  let logicalConsistencyScore = 50; // Base score
  if (entries.length > 0) {
    logicalConsistencyScore = estimateLogicalConsistency(entries);
  }
  contentSubScores.logicalConsistency = Math.min(100, Math.max(0, logicalConsistencyScore));
  
  // Calculate overall content score as average of sub-scores
  totalContentScore = (contentSubScores.argumentStrength + 
                      contentSubScores.evidenceQuality + 
                      contentSubScores.logicalConsistency) / 3;
  
  return {
    score: Math.round(totalContentScore),
    subScores: contentSubScores
  };
}

/**
 * Estimates argument strength based on content analysis
 */
function estimateArgumentStrength(content: string, motion?: string): number {
  // Analyze the content for strong argument patterns
  let score = 50; // Base score
  
  // Look for evidence of strong argumentation
  if (content.toLowerCase().includes('because')) score += 5;
  if (content.toLowerCase().includes('therefore')) score += 5;
  if (content.toLowerCase().includes('consequently')) score += 5;
  
  // Look for counter-argumentation (important for rebuttals)
  if (content.toLowerCase().includes('however')) score += 3;
  if (content.toLowerCase().includes('although')) score += 3;
  if (content.toLowerCase().includes('but')) score += 3;
  
  // Length factor (very short responses may lack substance)
  if (content.length > 200) score += 10;
  else if (content.length > 100) score += 5;
  else if (content.length < 50) score -= 10;
  
  // Check for relevance to motion if provided
  if (motion && content.toLowerCase().includes(motion.toLowerCase().replace('this house believes that', '').trim())) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Estimates evidence quality based on content analysis
 */
function estimateEvidenceQuality(content: string): number {
  let score = 50; // Base score
  
  // Look for evidence indicators
  if (content.toLowerCase().includes('study') || content.toLowerCase().includes('research')) score += 10;
  if (content.toLowerCase().includes('statistic') || content.toLowerCase().includes('data')) score += 10;
  if (content.toLowerCase().includes('expert') || content.toLowerCase().includes('authority')) score += 8;
  if (content.toLowerCase().includes('according to') || content.toLowerCase().includes('as shown by')) score += 8;
  
  // Look for weak evidence indicators
  if (content.toLowerCase().includes('i think') || content.toLowerCase().includes('maybe')) score -= 5;
  if (content.toLowerCase().includes('probably') || content.toLowerCase().includes('possibly')) score -= 5;
  
  // Length factor for evidence depth
  if (content.length > 300) score += 5; // More space for detailed evidence
  else if (content.length < 80) score -= 5; // Less space for detailed evidence
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Estimates logical consistency based on multiple entries
 */
function estimateLogicalConsistency(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  // For this implementation, we'll do a simple consistency check
  // In a real implementation, this would be more sophisticated
  if (entries.length > 1) {
    // If there are multiple entries, assume some level of consistency
    score += 10;
  }
  
  // Check for contradicting terms (very basic)
  const allContent = entries.map(e => e.content).join(' ').toLowerCase();
  if (allContent.includes('contradict') || allContent.includes('but wait')) {
    score -= 10;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Evaluates rebuttal effectiveness
 */
function evaluateRebuttal(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): { score: number; subScores: Record<string, number> } {
  const rebuttalSubScores: Record<string, number> = {};
  
  // Effectiveness of rebuttals
  const effectiveness = calculateRebuttalEffectiveness(entries, fullTranscript, speakerRole);
  rebuttalSubScores.effectiveness = effectiveness;
  
  // Accuracy of rebuttals
  const accuracy = calculateRebuttalAccuracy(entries, fullTranscript, speakerRole);
  rebuttalSubScores.accuracy = accuracy;
  
  // Timing of rebuttals (only relevant for roles that do rebuttals)
  const timing = calculateRebuttalTiming(entries);
  rebuttalSubScores.timing = timing;
  
  // Calculate overall rebuttal score
  const totalRebuttalScore = (rebuttalSubScores.effectiveness + 
                              rebuttalSubScores.accuracy + 
                              rebuttalSubScores.timing) / 3;
  
  return {
    score: Math.round(totalRebuttalScore),
    subScores: rebuttalSubScores
  };
}

/**
 * Calculates how effective the rebuttals were
 */
function calculateRebuttalEffectiveness(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Different roles have different rebuttal expectations
  if (speakerRole === SpeakerRole.LO || speakerRole === SpeakerRole.MO) {
    // LO and MO have stronger rebuttal expectations
    score += 10;
  } else if (speakerRole === SpeakerRole.PW) {
    // PW should defend arguments rather than directly rebut
    score -= 5;
  }
  
  // Look for rebuttal indicators in content
  for (const entry of entries) {
    if (entry.content.toLowerCase().includes('you said') || 
        entry.content.toLowerCase().includes('your argument') ||
        entry.content.toLowerCase().includes('that is incorrect') ||
        entry.content.toLowerCase().includes('on the contrary')) {
      score += 10;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates accuracy of rebuttals
 */
function calculateRebuttalAccuracy(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Check for accurate referencing of opponent arguments
  // This is a simplified version - in reality would need more sophisticated NLP
  for (const entry of entries) {
    if (entry.content.toLowerCase().includes('according to') && 
        entry.content.toLowerCase().includes('they claimed')) {
      score += 8; // Indicates accurate referencing
    }
    
    // Look for straw man indicators (misrepresenting opponent)
    if (entry.content.toLowerCase().includes('you said') && 
        !fullTranscript.some(t => t.speaker !== speakerRole && 
                                t.content.toLowerCase().includes(
                                  entry.content.toLowerCase().split('you said')[1]?.split('.')[0] || ''))) {
      score -= 10; // Possible misrepresentation
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates timing appropriateness of rebuttals
 */
function calculateRebuttalTiming(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  // Longer entries suggest more developed rebuttals
  const avgLength = entries.reduce((sum, entry) => sum + entry.content.length, 0) / entries.length;
  if (avgLength > 150) score += 10;
  else if (avgLength > 80) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Evaluates POI handling
 */
function evaluatePoiHandling(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[]
): { score: number; subScores: Record<string, number> } {
  const poiSubScores: Record<string, number> = {};
  
  // POI acceptance rate
  const acceptanceRate = calculatePoiAcceptanceRate(entries, fullTranscript);
  poiSubScores.acceptanceRate = acceptanceRate;
  
  // Response quality to POIs
  const responseQuality = calculatePoiResponseQuality(entries);
  poiSubScores.responseQuality = responseQuality;
  
  // Strategic use of POIs
  const strategicUse = calculatePoiStrategicUse(fullTranscript, entries[0]?.speaker);
  poiSubScores.strategicUse = strategicUse;
  
  // Calculate overall POI handling score
  const totalPoiScore = (poiSubScores.acceptanceRate + 
                         poiSubScores.responseQuality + 
                         poiSubScores.strategicUse) / 3;
  
  return {
    score: Math.round(totalPoiScore),
    subScores: poiSubScores
  };
}

/**
 * Calculates POI acceptance rate
 */
function calculatePoiAcceptanceRate(
  speakerEntries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[]
): number {
  let score = 50; // Base score
  
  // Find POI offers directed at this speaker
  const poiOffersToSpeaker = fullTranscript.filter(entry => 
    entry.hasPOI && 
    entry.poiAccepted === false && 
    entry.speaker !== speakerEntries[0]?.speaker
  ).length;
  
  // Find POI accepts by this speaker
  const poiAcceptsBySpeaker = fullTranscript.filter(entry => 
    entry.hasPOI && 
    entry.poiAccepted === true && 
    entry.speaker === speakerEntries[0]?.speaker
  ).length;
  
  // Calculate acceptance rate
  if (poiOffersToSpeaker > 0) {
    const acceptanceRate = (poiAcceptsBySpeaker / poiOffersToSpeaker) * 100;
    // Ideal rate is around 30-50% (not too low, not too high)
    if (acceptanceRate >= 20 && acceptanceRate <= 60) {
      score = 80; // High score for appropriate rate
    } else if (acceptanceRate > 60) {
      score = 60; // Too high might show weakness
    } else {
      score = 40; // Too low shows arrogance or fear
    }
  } else if (poiAcceptsBySpeaker > 0) {
    score = 70; // Accepting POIs when offered shows confidence
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates quality of responses to POIs
 */
function calculatePoiResponseQuality(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  // Look for effective POI responses in content
  for (const entry of entries) {
    if (entry.hasPOI && entry.poiAccepted) {
      // If they accepted a POI, they should address it effectively
      if (entry.content.toLowerCase().includes('good question') || 
          entry.content.toLowerCase().includes('fair point') ||
          entry.content.toLowerCase().includes('that raises')) {
        score += 15; // Positive acknowledgment of POI
      } else {
        score += 8; // Just accepting it is positive
      }
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates strategic use of POIs
 */
function calculatePoiStrategicUse(
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Count POI offers by this speaker
  const poiOffersBySpeaker = fullTranscript.filter(entry => 
    entry.hasPOI && 
    entry.speaker === speakerRole
  ).length;
  
  // Different roles have different POI expectations
  if (speakerRole === SpeakerRole.MO || speakerRole === SpeakerRole.PW) {
    // MO and PW are expected to offer more POIs for engagement
    if (poiOffersBySpeaker >= 3) score += 15;
    else if (poiOffersBySpeaker >= 1) score += 8;
  } else if (speakerRole === SpeakerRole.LO) {
    // LO should also offer POIs but focus more on rebuttal
    if (poiOffersBySpeaker >= 2) score += 10;
    else if (poiOffersBySpeaker >= 1) score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Evaluates delivery quality
 */
function evaluateDelivery(entries: DebateTranscriptEntry[]): { score: number; subScores: Record<string, number> } {
  const deliverySubScores: Record<string, number> = {};
  
  // Clarity of delivery
  const clarity = calculateClarity(entries);
  deliverySubScores.clarity = clarity;
  
  // Confidence in delivery
  const confidence = calculateConfidence(entries);
  deliverySubScores.confidence = confidence;
  
  // Pace of delivery
  const pace = calculatePace(entries);
  deliverySubScores.pace = pace;
  
  // Calculate overall delivery score
  const totalDeliveryScore = (deliverySubScores.clarity + 
                              deliverySubScores.confidence + 
                              deliverySubScores.pace) / 3;
  
  return {
    score: Math.round(totalDeliveryScore),
    subScores: deliverySubScores
  };
}

/**
 * Calculates clarity of delivery
 */
function calculateClarity(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  for (const entry of entries) {
    // Long, complex sentences might reduce clarity
    const sentences = entry.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = entry.content.split(/\s+/).length / sentences.length;
    
    if (avgSentenceLength < 15) {
      score += 5; // Shorter sentences tend to be clearer
    } else if (avgSentenceLength > 25) {
      score -= 5; // Very long sentences may hurt clarity
    }
    
    // Look for filler words that reduce clarity
    if (entry.content.toLowerCase().includes('um') || 
        entry.content.toLowerCase().includes('uh')) {
      score -= 3;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates confidence in delivery
 */
function calculateConfidence(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  for (const entry of entries) {
    // Look for uncertain language
    if (entry.content.toLowerCase().includes('i think') || 
        entry.content.toLowerCase().includes('maybe') ||
        entry.content.toLowerCase().includes('perhaps') ||
        entry.content.toLowerCase().includes('possibly')) {
      score -= 5;
    }
    
    // Look for confident language
    if (entry.content.toLowerCase().includes('clearly') || 
        entry.content.toLowerCase().includes('obviously') ||
        entry.content.toLowerCase().includes('undeniably')) {
      score += 5;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates appropriate pacing
 */
function calculatePace(entries: DebateTranscriptEntry[]): number {
  let score = 50; // Base score
  
  // Consider the length of entries for appropriate pacing
  if (entries.length > 0) {
    const avgLength = entries.reduce((sum, entry) => sum + entry.content.length, 0) / entries.length;
    
    if (avgLength > 200) {
      score += 10; // Longer entries suggest thorough development
    } else if (avgLength > 100) {
      score += 5;  // Moderate length is acceptable
    } else {
      score -= 5;  // Very short entries might seem rushed
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Evaluates teamwork quality
 */
function evaluateTeamwork(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): { score: number; subScores: Record<string, number> } {
  const teamworkSubScores: Record<string, number> = {};
  
  // Coordination with team
  const coordination = calculateCoordination(entries, fullTranscript, speakerRole);
  teamworkSubScores.coordination = coordination;
  
  // Support for team arguments
  const support = calculateSupport(entries, fullTranscript, speakerRole);
  teamworkSubScores.support = support;
  
  // Role fulfillment within team strategy
  const roleFulfillment = calculateRoleFulfillment(entries, fullTranscript, speakerRole);
  teamworkSubScores.roleFulfillment = roleFulfillment;
  
  // Calculate overall teamwork score
  const totalTeamworkScore = (teamworkSubScores.coordination + 
                              teamworkSubScores.support + 
                              teamworkSubScores.roleFulfillment) / 3;
  
  return {
    score: Math.round(totalTeamworkScore),
    subScores: teamworkSubScores
  };
}

/**
 * Calculates how well the speaker coordinated with their team
 */
function calculateCoordination(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Find entries from teammates
  const teammateRole = speakerRole === SpeakerRole.MO ? SpeakerRole.LO : 
                      speakerRole === SpeakerRole.PW ? SpeakerRole.PM : null;
                      
  if (teammateRole) {
    const teammateEntries = fullTranscript.filter(entry => entry.speaker === teammateRole);
    
    // Look for references to teammate's points
    for (const entry of entries) {
      teammateEntries.forEach(teammateEntry => {
        // This is a simplified check - in reality would need semantic analysis
        if (entry.content.toLowerCase().includes('as my colleague') ||
            entry.content.toLowerCase().includes('building on') ||
            entry.content.toLowerCase().includes('agreeing with')) {
          score += 10;
        }
      });
    }
  }
  
  // MO and PW have different coordination requirements
  if (speakerRole === SpeakerRole.MO) {
    // MO should support LO's arguments while developing their own case
    score += 5;
  } else if (speakerRole === SpeakerRole.PW) {
    // PW should consolidate PM's arguments and defend against opposition
    score += 8;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates how well the speaker supported team arguments
 */
function calculateSupport(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Different roles support differently
  if (speakerRole === SpeakerRole.MO) {
    // MO supports LO by extending arguments and defending team position
    if (entries.some(e => e.content.toLowerCase().includes('our position') ||
                        e.content.toLowerCase().includes('we argue'))) {
      score += 10;
    }
  } else if (speakerRole === SpeakerRole.PW) {
    // PW supports PM by defending and consolidating
    if (entries.some(e => e.content.toLowerCase().includes('as established') ||
                        e.content.toLowerCase().includes('defending the fact'))) {
      score += 12;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates how well the speaker fulfilled their role within team strategy
 */
function calculateRoleFulfillment(
  entries: DebateTranscriptEntry[],
  fullTranscript: DebateTranscriptEntry[],
  speakerRole: SpeakerRole
): number {
  let score = 50; // Base score
  
  // Check if speaker is fulfilling their role appropriately
  switch (speakerRole) {
    case SpeakerRole.MO:
      // MO should extend opposition arguments and respond to government
      if (entries.some(e => e.content.toLowerCase().includes('extending') ||
                          e.content.toLowerCase().includes('furthermore we')) &&
          entries.some(e => e.content.toLowerCase().includes('responding to') ||
                          e.content.toLowerCase().includes('counter to'))) {
        score += 15;
      }
      break;
    case SpeakerRole.PW:
      // PW should consolidate and defend without introducing new arguments
      if (entries.every(e => !e.content.toLowerCase().includes('new argument') &&
                            !e.content.toLowerCase().includes('finally we bring'))) {
        score += 15; // Good adherence to whip role
      }
      break;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Generates narrative feedback based on scores
 */
function generateNarrativeFeedback(
  role: SpeakerRole,
  scores: EvaluationCriteria,
  subScores?: SubCriteriaScores
): string {
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  
  let narrative = `As the ${role}, `;
  
  // Content performance
  if (scores.content >= 80) {
    narrative += "your content was exceptionally strong, featuring well-developed arguments with solid evidence and logical coherence. ";
  } else if (scores.content >= 60) {
    narrative += "your content was solid, with good argument development and adequate evidence to support your points. ";
  } else if (scores.content >= 40) {
    narrative += "your content had some strengths but could benefit from stronger evidence and more logical consistency. ";
  } else {
    narrative += "your content needs significant improvement, particularly in argument development and evidence quality. ";
  }
  
  // Rebuttal performance
  if (scores.rebuttal >= 80) {
    narrative += "Your rebuttals were highly effective, directly addressing opponent arguments with precision and accuracy. ";
  } else if (scores.rebuttal >= 60) {
    narrative += "Your rebuttals were adequate, addressing most key opponent points. ";
  } else if (scores.rebuttal >= 40) {
    narrative += "Your rebuttals could be more targeted and effective in addressing opponent arguments. ";
  } else {
    narrative += "Your rebuttal skills need significant work, with many opponent arguments going unaddressed. ";
  }
  
  // POI handling
  if (scores.poiHandling >= 80) {
    narrative += "You handled Points of Information excellently, accepting appropriate POIs and responding confidently. ";
  } else if (scores.poiHandling >= 60) {
    narrative += "You managed Points of Information reasonably well. ";
  } else if (scores.poiHandling >= 40) {
    narrative += "Your POI handling could be improved for better audience engagement. ";
  } else {
    narrative += "Your POI handling needs attention to meet debate standards. ";
  }
  
  // Delivery
  if (scores.delivery >= 80) {
    narrative += "Your delivery was clear and confident throughout your speech. ";
  } else if (scores.delivery >= 60) {
    narrative += "Your delivery was generally clear and appropriate. ";
  } else if (scores.delivery >= 40) {
    narrative += "Your delivery could use some improvement for better audience comprehension. ";
  } else {
    narrative += "Your delivery needs work to ensure your arguments are heard effectively. ";
  }
  
  // Teamwork (for MO and PW)
  if ((role === SpeakerRole.MO || role === SpeakerRole.PW) && scores.teamwork >= 80) {
    narrative += "Your teamwork was exemplary, supporting your partner effectively while maintaining your own role. ";
  } else if ((role === SpeakerRole.MO || role === SpeakerRole.PW) && scores.teamwork >= 60) {
    narrative += "Your teamwork was satisfactory, with reasonable coordination with your partner. ";
  } else if ((role === SpeakerRole.MO || role === SpeakerRole.PW) && scores.teamwork >= 40) {
    narrative += "Your teamwork could be strengthened with better coordination with your partner. ";
  } else if (role === SpeakerRole.MO || role === SpeakerRole.PW) {
    narrative += "Your teamwork needs significant improvement to support your team's position. ";
  }
  
  // Overall assessment
  if (avgScore >= 80) {
    narrative += "Overall, this was an outstanding performance that demonstrated mastery of debate skills.";
  } else if (avgScore >= 60) {
    narrative += "Overall, this was a solid performance with several strengths worth building upon.";
  } else if (avgScore >= 40) {
    narrative += "Overall, this performance had some positive elements but needs significant improvement in several areas.";
  } else {
    narrative += "Overall, this performance fell short of expectations and requires substantial work to meet debate standards.";
  }
  
  return narrative;
}

/**
 * Extracts quotes from speaker entries for feedback justification
 */
function extractQuotes(entries: DebateTranscriptEntry[]): string[] {
  const quotes: string[] = [];
  
  for (const entry of entries) {
    // Extract meaningful segments as potential quotes
    const content = entry.content;
    if (content.length > 50) {
      // Take first 100 characters as a representative quote
      const quote = content.substring(0, 100) + (content.length > 100 ? '...' : '');
      quotes.push(quote);
      
      // If there's more content, maybe take a middle portion too
      if (content.length > 200) {
        const middleStart = Math.floor(content.length / 2) - 50;
        const middleQuote = content.substring(middleStart, middleStart + 100) + '...';
        quotes.push(middleQuote);
      }
    }
  }
  
  return quotes.slice(0, 3); // Limit to 3 quotes max
}

/**
 * Generates complete judge feedback for the debate
 */
export function generateJudgeFeedback(
  speakerEvaluations: SpeakerEvaluation[],
  transcript: DebateTranscriptEntry[],
  debateMotion: string
): JudgeFeedback {
  const overallRankings = generateRankings(speakerEvaluations);
  
  const comparativeAnalysis = generateComparativeAnalysis(speakerEvaluations, transcript);
  
  const winnerDeclaration = determineWinner(speakerEvaluations);
  
  const scorecard: Scorecard = {
    speakerEvaluations,
    overallRankings,
    comparativeAnalysis,
    winnerDeclaration
  };
  
  const finalVerdict = `After careful consideration of all ${overallRankings.length} speakers, the ${overallRankings[0]} emerges victorious based on superior performance across all evaluation criteria. The detailed breakdown follows.`;
  
  const recommendations: string[] = [];
  
  // Generate recommendations based on the evaluation
  for (const evaluation of speakerEvaluations) {
    if (evaluation.scores.content < 60) {
      recommendations.push(`${evaluation.role} should focus on strengthening argument development and evidence quality.`);
    }
    if (evaluation.scores.rebuttal < 60) {
      recommendations.push(`${evaluation.role} should work on developing more effective rebuttal techniques.`);
    }
    if (evaluation.scores.delivery < 60) {
      recommendations.push(`${evaluation.role} should practice clearer and more confident delivery.`);
    }
  }
  
  return {
    scorecard,
    finalVerdict,
    recommendations
  };
}

/**
 * Generates rankings based on speaker evaluations
 */
export function generateRankings(speakerEvaluations: SpeakerEvaluation[]): SpeakerRole[] {
  // Calculate overall scores for each speaker
  const speakerScores = speakerEvaluations.map(evaluation => ({
    role: evaluation.role,
    overallScore: calculateOverallScore(evaluation)
  }));
  
  // Sort by overall score (descending)
  speakerScores.sort((a, b) => b.overallScore - a.overallScore);
  
  // Handle ties - if scores are very close (within 2%), mark as tied
  const rankings: SpeakerRole[] = [];
  let currentPosition = 0;
  
  while (currentPosition < speakerScores.length) {
    const currentScore = speakerScores[currentPosition].overallScore;
    const tiedSpeakers: SpeakerRole[] = [speakerScores[currentPosition].role];
    
    // Check for ties
    let nextPos = currentPosition + 1;
    while (nextPos < speakerScores.length && 
           isTie(currentScore, speakerScores[nextPos].overallScore, 2)) {
      tiedSpeakers.push(speakerScores[nextPos].role);
      nextPos++;
    }
    
    // Add tied speakers to rankings
    for (const role of tiedSpeakers) {
      rankings.push(role);
    }
    
    currentPosition = nextPos;
  }
  
  return rankings;
}

/**
 * Generates comparative analysis between speakers
 */
function generateComparativeAnalysis(
  speakerEvaluations: SpeakerEvaluation[],
  transcript: DebateTranscriptEntry[]
): string {
  let analysis = "Comparative Analysis:\n\n";
  
  // Compare each pair of speakers
  for (let i = 0; i < speakerEvaluations.length; i++) {
    for (let j = i + 1; j < speakerEvaluations.length; j++) {
      const speaker1 = speakerEvaluations[i];
      const speaker2 = speakerEvaluations[j];
      
      // Compare content
      if (speaker1.scores.content > speaker2.scores.content + 5) {
        analysis += `${speaker1.role} outperformed ${speaker2.role} in content quality (${speaker1.scores.content}% vs ${speaker2.scores.content}%).\n`;
      } else if (speaker2.scores.content > speaker1.scores.content + 5) {
        analysis += `${speaker2.role} outperformed ${speaker1.role} in content quality (${speaker2.scores.content}% vs ${speaker1.scores.content}%).\n`;
      }
      
      // Compare rebuttal
      if (speaker1.scores.rebuttal > speaker2.scores.rebuttal + 5) {
        analysis += `${speaker1.role} showed superior rebuttal skills (${speaker1.scores.rebuttal}% vs ${speaker2.scores.rebuttal}%).\n`;
      } else if (speaker2.scores.rebuttal > speaker1.scores.rebuttal + 5) {
        analysis += `${speaker2.role} showed superior rebuttal skills (${speaker2.scores.rebuttal}% vs ${speaker1.scores.rebuttal}%).\n`;
      }
      
      // Compare POI handling
      if (speaker1.scores.poiHandling > speaker2.scores.poiHandling + 5) {
        analysis += `${speaker1.role} demonstrated better POI handling (${speaker1.scores.poiHandling}% vs ${speaker2.scores.poiHandling}%).\n`;
      } else if (speaker2.scores.poiHandling > speaker1.scores.poiHandling + 5) {
        analysis += `${speaker2.role} demonstrated better POI handling (${speaker2.scores.poiHandling}% vs ${speaker1.scores.poiHandling}%).\n`;
      }
    }
  }
  
  analysis += "\nThe rankings reflect the cumulative performance across all criteria, with the winner demonstrating excellence in multiple areas.\n";
  
  return analysis;
}

/**
 * Determines the debate winner
 */
function determineWinner(speakerEvaluations: SpeakerEvaluation[]): string {
  // Get the speaker with the highest overall score
  const winner = speakerEvaluations.reduce((prevEval, currentEval) => 
    calculateOverallScore(prevEval) > calculateOverallScore(currentEval) ? prevEval : currentEval
  );
  
  const winnerScore = calculateOverallScore(winner);
  
  return `${winner.role} wins the debate with an overall score of ${winnerScore}%.`;
}

/**
 * Compares speakers to identify relative strengths and weaknesses
 */
export function compareSpeakers(speakerEvaluations: SpeakerEvaluation[]): string {
  let comparison = "Speaker Comparisons:\n";
  
  for (let i = 0; i < speakerEvaluations.length; i++) {
    for (let j = i + 1; j < speakerEvaluations.length; j++) {
      const speaker1 = speakerEvaluations[i];
      const speaker2 = speakerEvaluations[j];
      
      comparison += `\n${speaker1.role} vs ${speaker2.role}:\n`;
      
      // Compare each criterion
      for (const criterion of ['content', 'rebuttal', 'poiHandling', 'delivery', 'teamwork'] as const) {
        if (criterion === 'teamwork' && 
            ![SpeakerRole.MO, SpeakerRole.PW].includes(speaker1.role) && 
            ![SpeakerRole.MO, SpeakerRole.PW].includes(speaker2.role)) {
          continue; // Skip teamwork for PM and LO
        }
        
        if (speaker1.scores[criterion] > speaker2.scores[criterion]) {
          comparison += `  - ${criterion}: ${speaker1.role} leads (${speaker1.scores[criterion]}% vs ${speaker2.scores[criterion]}%)\n`;
        } else if (speaker2.scores[criterion] > speaker1.scores[criterion]) {
          comparison += `  - ${criterion}: ${speaker2.role} leads (${speaker2.scores[criterion]}% vs ${speaker1.scores[criterion]}%)\n`;
        } else {
          comparison += `  - ${criterion}: Even (${speaker1.scores[criterion]}% each)\n`;
        }
      }
    }
  }
  
  return comparison;
}

/**
 * Calculates the overall score for a speaker evaluation
 */
export function calculateOverallScore(speakerEvaluation: SpeakerEvaluation): number {
  // Calculate average of all criteria scores
  const allScores = Object.values(speakerEvaluation.scores);
  const sum = allScores.reduce((acc, score) => acc + score, 0);
  const avg = sum / allScores.length;
  
  // Apply holistic adjustment based on narrative quality (simplified)
  // In a real implementation, this might consider other factors
  const holisticAdjustment = 0; // For now, no adjustment
  
  return Math.round(avg + holisticAdjustment);
}

/**
 * Normalizes a raw score to the 0-100% scale
 */
export function normalizeScore(rawScore: number, minPossible: number, maxPossible: number): number {
  if (maxPossible === minPossible) return 50; // Avoid division by zero
  
  // Normalize to 0-100 scale
  const normalized = ((rawScore - minPossible) / (maxPossible - minPossible)) * 100;
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Checks if two scores are considered tied based on a threshold
 */
export function isTie(score1: number, score2: number, tolerance: number = 2): boolean {
  return Math.abs(score1 - score2) <= tolerance;
}

/**
 * Main function to analyze a complete debate transcript and generate evaluation
 */
export function analyzeDebateTranscript(
  transcript: DebateTranscriptEntry[],
  debateMotion?: string
): JudgeEvaluation {
  // Get unique speaker roles from the transcript
  const uniqueRoles = new Set(transcript.map(entry => entry.speaker));
  const speakerRoles = Array.from(uniqueRoles) as SpeakerRole[];
  
  // Evaluate each speaker
  const speakerEvaluations = speakerRoles.map(role => 
    calculateSpeakerScore(transcript, role, debateMotion)
  );
  
  // Generate comprehensive feedback
  const feedback = generateJudgeFeedback(speakerEvaluations, transcript, debateMotion || '');
  
  // Create the complete evaluation
  const evaluation: JudgeEvaluation = {
    debateId: 'debate-' + Date.now(), // In a real system, this would be the actual debate ID
    scorecard: feedback.scorecard,
    feedback,
    createdAt: new Date()
  };
  
  return evaluation;
}