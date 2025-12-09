import { StatAdjuster } from '@/components/StatAdjuster';
import { SkillAdjuster } from '@/components/SkillAdjuster';

interface StatsSectionProps {
  mood: number;
  attitude: number;
  selfEsteem: number;
  professionValue: number;
  limit: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function StatsSection({ 
  mood, 
  attitude,
  selfEsteem,
  professionValue, 
  limit, 
  onUpdate 
}: StatsSectionProps) {
  return (
    <div className="space-y-2">
      <StatAdjuster
        statId="mood"
        value={mood}
        onChange={(v) => onUpdate?.('mood', v)}
      />
      <StatAdjuster
        statId="attitude"
        value={attitude}
        onChange={(v) => onUpdate?.('attitude', v)}
      />
      <StatAdjuster
        statId="selfEsteem"
        value={selfEsteem}
        onChange={(v) => onUpdate?.('selfEsteem', v)}
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
