import { DISPLAYABLE_TRAITS } from '@/lib/character-traits';
import { toTitleCase } from '@/lib/utils';
import { IconBadge } from '@/components/IconBadge';

interface TraitBadgeProps {
  trait: string;
}

export function TraitBadge({ trait }: TraitBadgeProps) {
  if (!DISPLAYABLE_TRAITS.includes(trait as typeof DISPLAYABLE_TRAITS[number])) {
    return null;
  }

  return (
    <IconBadge
      iconPath={`/traits/${trait}.png`}
      text={toTitleCase(trait.replace(/_/g, ' '))}
      color="#8674B0"
      title={trait}
    />
  );
}