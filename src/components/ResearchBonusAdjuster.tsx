import { Adjuster } from '@/components/Adjuster';
import { GoldIcon } from '@/components/GoldIcon';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface ResearchBonusAdjusterProps {
  icon: string;
  alt: string;
  value: number;
  onChange: (value: number) => void;
}

export function ResearchBonusAdjuster({ icon, alt, value, onChange }: ResearchBonusAdjusterProps) {
  const { startHold, stopHold } = useHoldAcceleration(
    value,
    onChange,
    { initialStep: 1, acceleratedStep: 5, snapToGrid: true, gridSize: 5 },
    0,
    5
  );

  return (
    <div className="flex items-center gap-1">
      <GoldIcon src={icon} alt={alt} />
      <Adjuster
        value={`${value}%`}
        onDecreaseMouseDown={() => startHold(-1)}
        onDecreaseMouseUp={stopHold}
        onIncreaseMouseDown={() => startHold(1)}
        onIncreaseMouseUp={stopHold}
        decreaseDisabled={value <= 0}
        increaseDisabled={value >= 5}
      />
    </div>
  );
}