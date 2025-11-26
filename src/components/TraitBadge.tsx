import { DISPLAYABLE_TRAITS, getTraitIcon } from '@/lib/character-traits';
import { toTitleCase } from '@/lib/utils';
import { IconBadge } from '@/components/IconBadge';

interface TraitBadgeProps {
  trait: string;
}

export function TraitBadge({ trait }: TraitBadgeProps) {
  if (!DISPLAYABLE_TRAITS.includes(trait as typeof DISPLAYABLE_TRAITS[number])) {
    return null;
  }

  const icon = getTraitIcon(trait);
  if (!icon) return null;

  return (
    <IconBadge
      iconPath={icon}
      text={toTitleCase(trait)}
      color="#8674B0"
      title={trait}
    />
  );
}