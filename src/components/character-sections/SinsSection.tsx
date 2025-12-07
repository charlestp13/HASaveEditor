import { CardSection } from '@/components/CardSection';
import { SimpleBadge } from '@/components/SimpleBadge';

interface SinsSectionProps {
  aSins: string[];
}

export function SinsSection({ aSins }: SinsSectionProps) {
  return (
    <CardSection title="Sins" collapsible defaultCollapsed>
      <div className="flex flex-wrap gap-1">
        {aSins.map((sin) => (
          <SimpleBadge key={sin} label={sin} />
        ))}
      </div>
    </CardSection>
  );
}
