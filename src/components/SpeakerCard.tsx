import { SpeakerRole } from '../types/debate';

interface SpeakerCardProps {
  role: SpeakerRole;
  content: string;
  timestamp?: Date;
  type?: 'speech' | 'poi-request' | 'poi-response' | 'transition';
}

// Role full names for display
const ROLE_NAMES: Record<SpeakerRole, string> = {
  PM: 'Prime Minister',
  LO: 'Leader of Opposition',
  MO: 'Member of Opposition',
  PW: "Prime Minister's Whip",
};

// Format timestamp for display
function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SpeakerCard({ role, content, timestamp, type = 'speech' }: SpeakerCardProps) {
  // Handle transition entries differently
  if (type === 'transition') {
    return (
      <div className="text-center py-3 text-gray-500 text-sm italic">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px bg-gray-300 flex-1 max-w-16"></div>
          <span>{content}</span>
          <div className="h-px bg-gray-300 flex-1 max-w-16"></div>
        </div>
        {timestamp && (
          <div className="text-xs text-gray-400 mt-1">
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    );
  }

  // POI entries have distinct styling
  const isPOI = type === 'poi-request' || type === 'poi-response';
  
  return (
    <div className={`speaker-card-${role.toLowerCase()} rounded-lg p-4 shadow-sm mb-3 transition-all duration-200 hover:shadow-md`}>
      {/* Header with role badge and timestamp */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <span className={`role-badge-${role.toLowerCase()} text-xs font-bold px-2 py-1 rounded`}>
            {role}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {ROLE_NAMES[role]}
          </span>
          {isPOI && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
              {type === 'poi-request' ? 'POI Request' : 'POI Response'}
            </span>
          )}
        </div>
        
        {timestamp && (
          <span className="text-xs text-gray-400">
            {formatTimestamp(timestamp)}
          </span>
        )}
      </div>
      
      {/* Content */}
      <div className={`text-gray-800 ${isPOI ? 'italic text-sm' : 'text-base'} leading-relaxed`}>
        {content}
      </div>
    </div>
  );
}

export default SpeakerCard;
