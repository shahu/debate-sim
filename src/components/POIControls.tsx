import { useDebateStore } from '../store/debateStore';
import { DEFAULT_TIMERS, PROTECTED_TIME_START, PROTECTED_TIME_END } from '../lib/constants';
import { SpeakerRole } from '../types/debate';

export function POIControls() {
  const { 
    currentSpeaker, 
    status, 
    timeRemaining 
  } = useDebateStore();

  // Don't show controls when not active
  if (status !== 'active' || !currentSpeaker) {
    return null;
  }

  const speaker = currentSpeaker as SpeakerRole;
  const totalTime = DEFAULT_TIMERS[speaker] || 0;
  const elapsedTime = totalTime - timeRemaining;

  // Calculate if we're in protected time
  const isFirstMinuteProtected = elapsedTime < PROTECTED_TIME_START;
  const isLastMinuteProtected = timeRemaining < PROTECTED_TIME_END;
  const isProtectedTime = isFirstMinuteProtected || isLastMinuteProtected;

  // Determine who can offer POI (opposing team)
  const isGovernment = speaker === 'PM' || speaker === 'PW';
  const opposingTeam = isGovernment ? 'Opposition' : 'Government';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        {/* POI Status */}
        <div className="flex items-center gap-3">
          <div className={`
            w-3 h-3 rounded-full
            ${isProtectedTime ? 'bg-red-400' : 'bg-green-400 animate-pulse'}
          `}></div>
          
          <div>
            <div className="text-sm font-medium text-gray-700">
              Points of Information
            </div>
            <div className={`text-xs ${isProtectedTime ? 'text-red-600' : 'text-green-600'}`}>
              {isProtectedTime 
                ? isFirstMinuteProtected 
                  ? `Protected (first minute: ${PROTECTED_TIME_START - elapsedTime}s remaining)`
                  : `Protected (last minute: ${timeRemaining}s remaining)`
                : `Open for ${opposingTeam}`
              }
            </div>
          </div>
        </div>

        {/* POI Action Buttons */}
        <div className="flex items-center gap-2">
          {isProtectedTime ? (
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-lg">🔒</span>
              <span className="text-sm">POI Not Allowed</span>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 animate-glow-pulse"
              aria-label="Offer Point of Information"
              onClick={() => {
                // In a real implementation, this would trigger POI flow
                console.log('POI offered by', opposingTeam);
              }}
            >
              <span>🙋</span>
              <span>Offer POI</span>
            </button>
          )}
        </div>
      </div>

      {/* POI Progress Bar */}
      <div className="mt-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 ease-linear"
            style={{
              width: `${(elapsedTime / totalTime) * 100}%`,
              background: isProtectedTime 
                ? 'linear-gradient(90deg, #FCA5A5, #EF4444)' 
                : 'linear-gradient(90deg, #86EFAC, #22C55E)'
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>0:00</span>
          <span className="text-purple-500 font-medium">POI Window</span>
          <span>{Math.floor(totalTime / 60)}:{String(totalTime % 60).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
}

export default POIControls;
