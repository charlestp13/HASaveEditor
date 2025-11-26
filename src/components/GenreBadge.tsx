import { toTitleCase } from '@/lib/utils';
import { IconBadge } from '@/components/IconBadge';
import { GENRE_ESTABLISHED_THRESHOLD, getGenreIcon } from '@/lib/character-genres';

interface GenreBadgeProps {
  genre: string;
  value: number;
}

export function GenreBadge({ genre, value }: GenreBadgeProps) {
  const isEstablished = value >= GENRE_ESTABLISHED_THRESHOLD;

  const icon = getGenreIcon(genre);
  if (!icon) return null;
  
  return (
    <IconBadge
      iconPath={icon}
      text={toTitleCase(genre)}
      color="#ffd779"
      title={`Value: ${value.toFixed(1)}`}
      size="sm"
      inactive={!isEstablished}
    />
  );
}