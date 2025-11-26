import { Adjuster } from '@/components/Adjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface StatAdjusterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function StatAdjuster({ label, value, onChange, min = 0, max = 100 }: StatAdjusterProps) {
  const displayValue = Math.round(value * 100);

  const handleChange = (newDisplayValue: number) => {
    onChange(newDisplayValue / 100);
  };

  const { startHold, stopHold } = useHoldAcceleration(
    displayValue,
    handleChange,
    { initialStep: 1, acceleratedStep: 10, snapToGrid: true, gridSize: 10 },
    min,
    max
  );

  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">{label}</div>
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
  );
}