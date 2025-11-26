import { CardSection } from '@/components/CardSection';
import { StatusAdjuster } from '@/components/StatusAdjuster';

const PUBLIC_IMAGE_STATS = [
  { type: 'ART' as const, label: 'Artistic Status' },
  { type: 'COM' as const, label: 'Commercial Status' },
] as const;

interface StatusSectionProps {
  art: number;
  com: number;
  professionName: string;
  onUpdate?: (field: string, value: number | null) => void;
}

export function StatusSection({
  art,
  com,
  professionName,
  onUpdate,
}: StatusSectionProps) {
  return (
    <CardSection title="Public Image">
      <div className="space-y-2">
        {PUBLIC_IMAGE_STATS.map(({ type, label }) => {
          const value = type === 'ART' ? art : com;
          return (
            <StatusAdjuster
              key={type}
              type={type}
              value={value > 0 ? value : null}
              label={label}
              profession={professionName as 'Actor' | 'Director'}
              onChange={(v) => onUpdate?.(`whiteTag:${type}`, v)}
            />
          );
        })}
      </div>
    </CardSection>
  );
}
