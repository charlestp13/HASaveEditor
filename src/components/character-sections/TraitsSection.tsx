import { CardSection } from '@/components/CardSection';
import { TraitBadge } from '@/components/TraitBadge';
import { EditButton } from '@/components/EditButton';

interface TraitsSectionProps {
  labels: string[] | undefined;
  displayableTraits: string[];
  onEditTraits?: () => void;
}

export function TraitsSection({
  displayableTraits,
  onEditTraits,
}: TraitsSectionProps) {
  return (
    <CardSection
      title="Traits"
      action={onEditTraits && <EditButton onClick={onEditTraits}>Traits</EditButton>}
      collapsible
      defaultCollapsed
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
