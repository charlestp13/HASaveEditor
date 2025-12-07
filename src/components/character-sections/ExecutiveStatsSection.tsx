import { Adjuster } from '@/components/Adjuster';
import { SelfEsteemAdjuster } from '@/components/SelfEsteemAdjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface ExecutiveStatsSectionProps {
  selfEsteem: number;
  seniority: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function ExecutiveStatsSection({
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