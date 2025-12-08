import { Adjuster } from '@/components/Adjuster';
import { StatAdjuster } from '@/components/StatAdjuster';
import { SelfEsteemAdjuster } from '@/components/SelfEsteemAdjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface ExecutiveStatsSectionProps {
  mood: number;
  attitude: number;
  selfEsteem: number;
  seniority: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function ExecutiveStatsSection({
  mood,
  attitude,
  selfEsteem,
  seniority,
  onUpdate,
}: ExecutiveStatsSectionProps) {
  const displayValue = Math.round(seniority * 10);
  const min = 0;
  const max = 10;

  const handleSeniorityChange = (newDisplayValue: number) => {
    const newValue = newDisplayValue / 10;
    onUpdate?.('skill', newValue);
    onUpdate?.('limit', newValue);
  };

  const { startHold, stopHold } = useHoldAcceleration(
    displayValue,
    handleSeniorityChange,
    { initialStep: 1, acceleratedStep: 5, snapToGrid: true, gridSize: 5 },
    min,
    max
  );

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
      <SelfEsteemAdjuster
        value={selfEsteem}
        onChange={(v) => onUpdate?.('selfEsteem', v)}
      />
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Seniority</div>
        <Adjuster
          value={displayValue}
          onDecreaseMouseDown={() => startHold(-1)}
          onDecreaseMouseUp={stopHold}
          onIncreaseMouseDown={() => startHold(1)}
          onIncreaseMouseUp={stopHold}
          decreaseDisabled={displayValue <= min}
          increaseDisabled={displayValue >= max}
        />
      </div>
    </div>
  );
}