import { Traits, Formatter } from '@/lib';
import { IconBadge } from '@/components/IconBadge';

interface TraitBadgeProps {
  trait: string;
}

export function TraitBadge({ trait }: TraitBadgeProps) {
  if (!Traits.isDisplayable(trait)) {
    return null;
  }

  const icon = Traits.getIcon(trait);
  if (!icon) return null;

  return (
    <IconBadge
      iconPath={icon}
      text={Formatter.toTitleCase(trait)}
      color="#8674B0"
      title={trait}
    />
  );
}