import { useDebateStore } from '../store/debateStore';
import { ROLE_DESCRIPTIONS } from '../lib/constants';
import { SpeakerRole } from '../types/debate';

// Role-specific colors for the flow indicator
const ROLE_COLORS: Record<SpeakerRole, { bg: string; border: string; text: string }> = {
  PM: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600' },
  LO: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600' },
  MO: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600' },
  PW: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-600' },
};

export function DebateFlowIndicator() {
  const { currentSpeakerIndex, speakingSequence, status } = useDebateStore();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-center">
        {speakingSequence.map((role, index) => {
          const isCompleted = currentSpeakerIndex > index;
          const isCurrent = currentSpeakerIndex === index && status !== 'idle';
          const isUpcoming = currentSpeakerIndex < index || status === 'idle';
          
          const colors = ROLE_COLORS[role as SpeakerRole];
          const roleDesc = ROLE_DESCRIPTIONS[role as SpeakerRole];

          return (
            <div key={role} className="flex items-center">
              {/* Step Circle */}
              <div 
                className="flex flex-col items-center"
                title={roleDesc}
              >
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-300 ease-out
                    ${isCurrent 
                      ? `${colors.bg} text-white scale-110 shadow-lg ring-4 ring-opacity-30 ${colors.border.replace('border', 'ring')}`
                      : isCompleted 
                        ? `${colors.bg} text-white opacity-60`
                        : `bg-gray-100 ${colors.text} border-2 ${colors.border} border-opacity-30`
                    }
                  `}
                >
                  {role}
                </div>
                
                {/* Role Label */}
                <span className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isCurrent ? colors.text : isCompleted ? 'text-gray-500' : 'text-gray-400'}
                `}>
                  {role === 'PM' ? 'Prime Minister' :
                   role === 'LO' ? 'Leader Opp.' :
                   role === 'MO' ? 'Member Opp.' :
                   "PM's Whip"}
                </span>
                
                {/* Current Indicator */}
                {isCurrent && (
                  <div className="mt-1 w-2 h-2 rounded-full bg-current animate-pulse" 
                       style={{ color: colors.bg.replace('bg-', '').includes('blue') ? '#3B82F6' :
                                        colors.bg.includes('red') ? '#EF4444' :
                                        colors.bg.includes('orange') ? '#F97316' : '#22C55E' }}>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < speakingSequence.length - 1 && (
                <div className={`
                  w-8 sm:w-12 md:w-16 h-1 mx-2 rounded-full transition-all duration-300
                  ${isCompleted || isCurrent ? 'bg-gray-300' : 'bg-gray-200'}
                `}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DebateFlowIndicator;
