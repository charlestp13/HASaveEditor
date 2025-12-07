import { Adjuster } from '@/components/Adjuster';
import { useHoldAcceleration } from '@/hooks/useHoldAcceleration';
import { ValueSteppers } from '@/lib';
import starIcon from '@/assets/STAR.png';
import starGlowIcon from '@/assets/STAR_GLOW.png';

interface SkillAdjusterProps {
  skillValue: number;
  limitValue: number;
  onSkillChange: (value: number) => void;
  onLimitChange: (value: number) => void;
}

const STAR_FILTERS = {
  gold: 'sepia(100%) saturate(300%) brightness(1.1) hue-rotate(-10deg)',
  gray: 'grayscale(100%) brightness(0.4) opacity(0.6)',
  red: 'grayscale(100%) brightness(0.3) sepia(100%) hue-rotate(-50deg) saturate(300%) opacity(0.7)',
} as const;

export function SkillAdjuster({ 
  skillValue, 
  limitValue, 
  onSkillChange, 
  onLimitChange 
}: SkillAdjusterProps) {
  const skillStars = Math.floor(skillValue * 10);
  const limitStars = Math.floor(limitValue * 10);

  const skillDisplay = Math.round(skillValue * 100);
  const limitDisplay = Math.round(limitValue * 100);

  const handleSkillChange = (newDisplay: number) => {
    const newValue = Math.min(newDisplay / 100, limitValue);
    onSkillChange(newValue);
  };

  const handleLimitChange = (newDisplay: number) => {
    const newValue = newDisplay / 100;
    onLimitChange(newValue);
    if (skillValue > newValue) {
      onSkillChange(newValue);
    }
  };

  const { startHold: startSkillHold, stopHold: stopSkillHold } = useHoldAcceleration(
    skillDisplay,
    handleSkillChange,
    { initialStep: 1, acceleratedStep: 10, snapToGrid: true, gridSize: 10 },
    0,
    limitDisplay
  );

  const { startHold: startLimitHold, stopHold: stopLimitHold } = useHoldAcceleration(
    limitDisplay,
    handleLimitChange,
    { initialStep: 1, acceleratedStep: 10, snapToGrid: true, gridSize: 10 },
    0,
    100
  );

  const renderStars = () => {
    const stars = [];
    
    for (let i = 0; i < 10; i++) {
      const isGold = i < skillStars;
      const isGray = i >= skillStars && i < limitStars;

      const imgSrc = isGold ? starGlowIcon : starIcon;
      const filter = isGold ? STAR_FILTERS.gold : isGray ? STAR_FILTERS.gray : STAR_FILTERS.red;

      stars.push(
        <img
          key={i}
          src={imgSrc}
          alt=""
          className="w-4 h-4"
          style={{ filter }}
        />
      );
    }
    
    return stars;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Skill Level</div>
        <Adjuster
          value={ValueSteppers.formatScaled(skillValue, 10)}
          onDecreaseMouseDown={() => startSkillHold(-1)}
          onDecreaseMouseUp={stopSkillHold}
          onIncreaseMouseDown={() => startSkillHold(1)}
          onIncreaseMouseUp={stopSkillHold}
          decreaseDisabled={skillValue <= 0}
          increaseDisabled={skillValue >= limitValue}
        />
      </div>
      
      <div className="flex gap-0.5 justify-center">
        {renderStars()}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Skill Limit</div>
        <Adjuster
          value={ValueSteppers.formatScaled(limitValue, 10)}
          onDecreaseMouseDown={() => startLimitHold(-1)}
          onDecreaseMouseUp={stopLimitHold}
          onIncreaseMouseDown={() => startLimitHold(1)}
          onIncreaseMouseUp={stopLimitHold}
          decreaseDisabled={limitValue <= 0}
          increaseDisabled={limitValue >= 1}
        />
      </div>
    </div>
  );
}