import { ACTOR_LABELS, DIRECTOR_LABELS, getRank, getStatusColor } from '@/lib/character-status';
import { toTitleCase } from '@/lib/utils';
import { IconBadge } from '@/components/IconBadge';

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
    <IconBadge
      iconPath={`/status/${type}.png`}
      text={label}
      color={color}
    />
  );
}