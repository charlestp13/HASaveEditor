import { CardSection } from '@/components/CardSection';
import { TraitBadge } from '@/components/TraitBadge';
import { TraitAdjuster } from '@/components/TraitAdjuster';

interface TraitsSectionProps {
  labels: string[] | undefined;
  displayableTraits: string[];
  onTraitAdd?: (trait: string) => void;
  onTraitRemove?: (trait: string) => void;
}

export function TraitsSection({
  labels,
  displayableTraits,
  onTraitAdd,
  onTraitRemove,
}: TraitsSectionProps) {
  return (
    <CardSection
      title="Traits"
      action={
        <TraitAdjuster
          traits={labels || []}
          onAdd={(trait) => onTraitAdd?.(trait)}
          onRemove={(trait) => onTraitRemove?.(trait)}
        />
      }
    >
      {displayableTraits.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {displayableTraits.map((trait) => (
            <TraitBadge key={trait} trait={trait} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No traits</div>
      )}
    </CardSection>
  );
}
