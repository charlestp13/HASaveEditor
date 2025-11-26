import { toTitleCase } from '@/lib/utils';
import { IconBadge } from '@/components/IconBadge';
import { GENRE_ESTABLISHED_THRESHOLD } from '@/lib/character-genres';

interface GenreBadgeProps {
  genre: string;
  value: number;
}

export function GenreBadge({ genre, value }: GenreBadgeProps) {
  const isEstablished = value >= GENRE_ESTABLISHED_THRESHOLD;
  
  return (
    <IconBadge
      iconPath={`/genres/${genre}.png`}
      text={toTitleCase(genre)}
      color="#ffd779"
      title={`Value: ${value.toFixed(1)}`}
      variant="rounded"
      size="sm"
      inactive={!isEstablished}
    />
  );
}