import { StatAdjuster } from '@/components/StatAdjuster';
import { SkillAdjuster } from '@/components/SkillAdjuster';

interface StatsSectionProps {
  mood: number;
  attitude: number;
  professionValue: number;
  limit: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function StatsSection({ 
  mood, 
  attitude, 
  professionValue, 
  limit, 
  onUpdate 
}: StatsSectionProps) {
  return (
    <div className="space-y-2">
      <StatAdjuster
        label="Happiness"
        value={mood}
        onChange={(v) => onUpdate?.('mood', v)}
      />
      <StatAdjuster
        label="Loyalty"
        value={attitude}
        onChange={(v) => onUpdate?.('attitude', v)}
      />
      <SkillAdjuster
        skillValue={professionValue}
        limitValue={limit}
        onSkillChange={(v) => onUpdate?.('skill', v)}
        onLimitChange={(v) => onUpdate?.('limit', v)}
      />
    </div>
  );
}
