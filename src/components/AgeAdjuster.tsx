import { Adjuster } from '@/components/Adjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';

interface AgeAdjusterProps {
  age: number;
  birthYear: number;
  onBirthYearChange: (birthYear: number) => void;
}

export function AgeAdjuster({ age, birthYear, onBirthYearChange }: AgeAdjusterProps) {
  const handleAgeChange = (newAge: number) => {
    const ageDelta = newAge - age;
    const newBirthYear = birthYear - ageDelta;
    onBirthYearChange(newBirthYear);
  };

  const { startHold, stopHold } = useHoldAcceleration(
    age,
    handleAgeChange,
    { initialStep: 1, acceleratedStep: 5, snapToGrid: true, gridSize: 5 },
    18,
    100
  );

  return (
    <Adjuster
      value={age}
      onDecreaseMouseDown={() => startHold(-1)}
      onDecreaseMouseUp={stopHold}
      onIncreaseMouseDown={() => startHold(1)}
      onIncreaseMouseUp={stopHold}
      decreaseDisabled={age <= 18}
      increaseDisabled={age >= 100}
    />
  );
}