import React from 'react';
import { JudgeFeedback, SpeakerEvaluation } from '../../types/judge';
import { Progress } from '../ui/progress';
import { cn } from '../../lib/utils';
import { SpeakerRole } from '../../types/debate';

interface JudgeScorecardProps {
  feedback: JudgeFeedback;
  className?: string;
}

const getSpeakerColor = (role: SpeakerRole): string => {
  switch (role) {
    case SpeakerRole.PM:
      return 'border-blue-500 bg-blue-50';
    case SpeakerRole.LO:
      return 'border-red-500 bg-red-50';
    case SpeakerRole.MO:
      return 'border-green-500 bg-green-50';
    case SpeakerRole.PW:
      return 'border-purple-500 bg-purple-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

const getSpeakerDisplayName = (role: SpeakerRole): string => {
  switch (role) {
    case SpeakerRole.PM:
      return 'Prime Minister';
    case SpeakerRole.LO:
      return 'Leader of Opposition';
    case SpeakerRole.MO:
      return 'Member of Government';
    case SpeakerRole.PW:
      return 'Press Secretary';
    default:
      return role;
  }
};

const getRankBadge = (rankIndex: number): string => {
  switch (rankIndex) {
    case 0:
      return '1st Place 🏆';
    case 1:
      return '2nd Place 🥈';
    case 2:
      return '3rd Place 🥉';
    case 3:
      return '4th Place';
    default:
      return `${rankIndex + 1}th Place`;
  }
};

const JudgeScorecard: React.FC<JudgeScorecardProps> = ({ 
  feedback, 
  className 
}) => {
  const { scorecard } = feedback;
  const { speakerEvaluations, overallRankings } = scorecard;

  return (
    <div className={cn("w-full max-w-7xl mx-auto p-6", className)}>
      {/* Winner Declaration Banner */}
      <div className="mb-8 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Final Verdict</h2>
        <p className="text-xl font-semibold text-white">{scorecard.winnerDeclaration}</p>
      </div>

      {/* Side-by-side Speaker Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallRankings.map((role, rankIndex) => {
          const evaluation = speakerEvaluations.find(e => e.role === role);
          if (!evaluation) return null;

          return (
            <div 
              key={role} 
              className={cn(
                "rounded-xl border-2 p-4 shadow-md",
                getSpeakerColor(role)
              )}
            >
              {/* Speaker Header with Rank */}
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-800">
                    {getSpeakerDisplayName(role)}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold",
                    rankIndex === 0 ? "bg-yellow-500 text-white" :
                    rankIndex === 1 ? "bg-gray-400 text-white" :
                    rankIndex === 2 ? "bg-amber-800 text-white" :
                    "bg-gray-600 text-white"
                  )}>
                    {getRankBadge(rankIndex)}
                  </span>
                </div>
                
                {/* Overall Score */}
                <div className="mt-2">
                  <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Overall Score</span>
                    <span>{Math.round(evaluation.scores.content * 0.2 + 
                                    evaluation.scores.rebuttal * 0.2 + 
                                    evaluation.scores.poiHandling * 0.2 + 
                                    evaluation.scores.delivery * 0.2 + 
                                    evaluation.scores.teamwork * 0.2)}%</span>
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria with Progress Bars */}
              <div className="space-y-4 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Content</span>
                    <span className="font-medium text-gray-700">{evaluation.scores.content}%</span>
                  </div>
                  <Progress value={evaluation.scores.content} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Rebuttal</span>
                    <span className="font-medium text-gray-700">{evaluation.scores.rebuttal}%</span>
                  </div>
                  <Progress value={evaluation.scores.rebuttal} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">POI Handling</span>
                    <span className="font-medium text-gray-700">{evaluation.scores.poiHandling}%</span>
                  </div>
                  <Progress value={evaluation.scores.poiHandling} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Delivery</span>
                    <span className="font-medium text-gray-700">{evaluation.scores.delivery}%</span>
                  </div>
                  <Progress value={evaluation.scores.delivery} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Teamwork</span>
                    <span className="font-medium text-gray-700">{evaluation.scores.teamwork}%</span>
                  </div>
                  <Progress value={evaluation.scores.teamwork} className="h-2" />
                </div>
              </div>

              {/* Narrative Feedback */}
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Feedback:</h4>
                <p className="text-sm text-gray-700">{evaluation.narrative}</p>
              </div>

              {/* Specific Examples */}
              {evaluation.quotes && evaluation.quotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Examples:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {evaluation.quotes.map((quote, idx) => (
                      <li key={idx} className="italic">"{quote}"</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparative Analysis */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comparative Analysis</h3>
        <div className="whitespace-pre-line text-sm text-gray-700">
          {scorecard.comparativeAnalysis}
        </div>
      </div>

      {/* Recommendations */}
      {feedback.recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {feedback.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export { JudgeScorecard };