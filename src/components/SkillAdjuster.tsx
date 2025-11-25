import { Adjuster } from '@/components/Adjuster';
import starIcon from '@/assets/STAR.png';
import starGlowIcon from '@/assets/STAR_GLOW.png';

interface SkillAdjusterProps {
  skillValue: number;
  limitValue: number;
  onSkillChange: (value: number) => void;
  onLimitChange: (value: number) => void;
}

export function SkillAdjuster({ 
  skillValue, 
  limitValue, 
  onSkillChange, 
  onLimitChange 
}: SkillAdjusterProps) {
  const skillStars = Math.floor(skillValue * 10);
  const limitStars = Math.floor(limitValue * 10);

  const formatValue = (val: number) => {
    const scaled = val * 10;
    return scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
  };

  const snapUp = (val: number, max: number): number => {
    const current = Math.round(val * 100);
    if (current % 10 === 0) return Math.min((current + 10) / 100, max);
    return Math.min(Math.ceil(current / 10) * 10 / 100, max);
  };

  const snapDown = (val: number): number => {
    const current = Math.round(val * 100);
    if (current % 10 === 0) return Math.max((current - 10) / 100, 0);
    return Math.max(Math.floor(current / 10) * 10 / 100, 0);
  };

  const handleSkillIncrease = () => {
    onSkillChange(snapUp(skillValue, limitValue));
  };

  const handleSkillDecrease = () => {
    onSkillChange(snapDown(skillValue));
  };

  const handleLimitIncrease = () => {
    onLimitChange(snapUp(limitValue, 1));
  };

  const handleLimitDecrease = () => {
    const newLimit = snapDown(limitValue);
    onLimitChange(newLimit);
    if (skillValue > newLimit) {
      onSkillChange(newLimit);
    }
  };

  const renderStars = () => {
    const starElements = [];
    
    for (let i = 0; i < 10; i++) {
      const isGold = i < skillStars;
      const isGray = i >= skillStars && i < limitStars;
      const isRed = i >= limitStars;

      const imgSrc = isGold ? starGlowIcon : starIcon;
      
      let filterStyle = '';
      if (isGold) {
        filterStyle = 'sepia(100%) saturate(300%) brightness(1.1) hue-rotate(-10deg)';
      } else if (isGray) {
        filterStyle = 'grayscale(100%) brightness(0.4) opacity(0.6)';
      } else if (isRed) {
        filterStyle = 'grayscale(100%) brightness(0.3) sepia(100%) hue-rotate(-50deg) saturate(300%) opacity(0.7)';
      }

      starElements.push(
        <img
          key={i}
          src={imgSrc}
          alt=""
          className="w-4 h-4"
          style={{ filter: filterStyle }}
        />
      );
    }
    
    return starElements;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">Skill Level</div>
        <Adjuster
          value={formatValue(skillValue)}
          onDecreaseClick={handleSkillDecrease}
          onIncreaseClick={handleSkillIncrease}
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
          value={formatValue(limitValue)}
          onDecreaseClick={handleLimitDecrease}
          onIncreaseClick={handleLimitIncrease}
          decreaseDisabled={limitValue <= 0}
          increaseDisabled={limitValue >= 1}
        />
      </div>
    </div>
  );
}