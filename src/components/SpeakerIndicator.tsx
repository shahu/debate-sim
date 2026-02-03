import { SpeakerRole } from '../types/debate';
import { ROLE_DESCRIPTIONS } from '../lib/constants';

interface SpeakerIndicatorProps {
  speaker: SpeakerRole | null;
  speakerName?: string;
}

// Role-specific background colors
const ROLE_COLORS: Record<SpeakerRole, string> = {
  PM: 'bg-blue-500',
  LO: 'bg-red-500',
  MO: 'bg-orange-500',
  PW: 'bg-green-500',
};

// Role full names
const ROLE_NAMES: Record<SpeakerRole, string> = {
  PM: 'Prime Minister',
  LO: 'Leader of Opposition',
  MO: 'Member of Opposition',
  PW: "Prime Minister's Whip",
};

export function SpeakerIndicator({ speaker, speakerName }: SpeakerIndicatorProps) {
  if (!speaker) {
    return (
      <div className="bg-gray-400 text-white rounded-xl p-6 text-center shadow-lg">
        <div className="text-3xl font-bold mb-2">Waiting to start...</div>
        <div className="text-lg opacity-80">Enter a motion to begin the debate</div>
      </div>
    );
  }

  const bgColor = ROLE_COLORS[speaker];
  const roleName = ROLE_NAMES[speaker];
  const roleDescription = ROLE_DESCRIPTIONS[speaker];

  return (
    <div className={`${bgColor} text-white rounded-xl p-6 text-center shadow-lg transition-all duration-300`}>
      {/* Role Badge */}
      <div className="inline-block bg-white/20 rounded-full px-4 py-1 mb-3">
        <span className="text-sm font-semibold tracking-wider">{speaker}</span>
      </div>
      
      {/* Speaker Name */}
      <div className="text-3xl font-bold mb-2">
        {speakerName || roleName}
      </div>
      
      {/* Role Description */}
      <div className="text-sm opacity-80 max-w-md mx-auto">
        {roleDescription}
      </div>
    </div>
  );
}

export default SpeakerIndicator;
