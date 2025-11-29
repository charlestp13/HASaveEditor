import { Status, Formatter } from '@/lib';
import { IconBadge } from '@/components/IconBadge';

interface StatusBadgeProps {
  type: 'ART' | 'COM';
  value: number;
  profession: 'Actor' | 'Director';
}

export function StatusBadge({ type, value, profession }: StatusBadgeProps) {
  const rank = Status.getRank(value);
  const color = Status.getColor(value);
  
  if (rank === 0 || !color) return null;

  const labels = profession === 'Actor' ? Status.ACTOR_LABELS : Status.DIRECTOR_LABELS;
  const label = Formatter.toTitleCase(labels[type][rank - 1]);
  const icon = Status.getIcon(type);

  return (
    <IconBadge
      iconPath={icon}
      text={label}
      color={color}
    />
  );
}