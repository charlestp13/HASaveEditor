import { DISPLAYABLE_TRAITS } from '@/lib/character-traits';
import { toTitleCase } from '@/lib/utils';

interface TraitBadgeProps {
  trait: string;
}

export function TraitBadge({ trait }: TraitBadgeProps) {
  if (!DISPLAYABLE_TRAITS.includes(trait as typeof DISPLAYABLE_TRAITS[number])) {
    return null;
  }

  const color = '#8674B0';

  return (
    <div 
      className="flex items-center gap-2 px-3 py-1 rounded-full border"
      style={{ borderColor: color, backgroundColor: `${color}20` }}
      title={trait}
    >
      <img 
        src={`/traits/${trait}.png`} 
        alt={trait} 
        className="w-4 h-4 object-contain"
      />
      <span 
        className="text-xs font-medium"
        style={{ color }}
      >
        {toTitleCase(trait.replace(/_/g, ' '))}
      </span>
    </div>
  );
}