import { ACTOR_LABELS, DIRECTOR_LABELS, getRank, getStatusColor } from '@/lib/character-status';
import { toTitleCase } from '@/lib/utils';

interface StatusBadgeProps {
  type: 'ART' | 'COM';
  value: number;
  profession: 'Actor' | 'Director';
}

export function StatusBadge({ type, value, profession }: StatusBadgeProps) {
  const rank = getRank(value);
  const color = getStatusColor(value);
  
  if (rank === 0 || !color) return null;

  const labels = profession === 'Actor' ? ACTOR_LABELS : DIRECTOR_LABELS;
  const label = toTitleCase(labels[type][rank - 1]);

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1 rounded-full border w-fit"
      style={{ borderColor: color, backgroundColor: `${color}20` }}
    >
      <img 
        src={`/status/${type}.png`} 
        alt={type} 
        className="w-4 h-4 object-contain"
      />
      <span 
        className="text-xs font-medium"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}