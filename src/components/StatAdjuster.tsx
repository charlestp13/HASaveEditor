import { Adjuster } from '@/components/Adjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';
import { Stats } from '@/lib';

interface StatAdjusterProps {
  statId: string;
  value: number;
  onChange: (value: number) => void;
}

export function StatAdjuster({ statId, value, onChange }: StatAdjusterProps) {
  const stat = Stats.get(statId);
  if (!stat) return null;

  const displayValue = Math.round(value * 100);
  const displayMin = Math.round(stat.min * 100);
  const displayMax = Math.round(stat.max * 100);

  const handleChange = (newDisplayValue: number) => {
    onChange(newDisplayValue / 100);
  };

  const { startHold, stopHold } = useHoldAcceleration(
    displayValue,
    handleChange,
    { initialStep: 1, acceleratedStep: 10, snapToGrid: true, gridSize: 10 },
    displayMin,
    displayMax
  );

  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">{stat.label}</div>
      <Adjuster
        value={`${displayValue}%`}
        onDecreaseMouseDown={() => startHold(-1)}
        onDecreaseMouseUp={stopHold}
        onIncreaseMouseDown={() => startHold(1)}
        onIncreaseMouseUp={stopHold}
        decreaseDisabled={displayValue <= displayMin}
        increaseDisabled={displayValue >= displayMax}
      />
    </div>
  );
}