import { IconBadge } from '@/components/IconBadge';
import { Formatter, Genres } from '@/lib';

interface GenreBadgeProps {
  genre: string;
  value: number;
}

export function GenreBadge({ genre, value }: GenreBadgeProps) {
  const isEstablished = value >= Genres.ESTABLISHED_THRESHOLD;

  const icon = Genres.getIcon(genre);
  if (!icon) return null;
  
  return (
    <IconBadge
      iconPath={icon}
      text={Formatter.toTitleCase(genre)}
      color="#ffd779"
      title={`Value: ${value.toFixed(1)}`}
      size="sm"
      inactive={!isEstablished}
    />
  );
}