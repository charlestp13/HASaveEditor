import { Adjuster } from '@/components/Adjuster';
import { ValueSteppers } from '@/lib';
import starIcon from '@/assets/STAR.png';
import starGlowIcon from '@/assets/STAR_GLOW.png';

const MAX_STARS = 4;

const STAR_FILTERS = {
  gold: 'sepia(100%) saturate(300%) brightness(1.1) hue-rotate(-10deg)',
  gray: 'grayscale(100%) brightness(0.4) opacity(0.6)',
} as const;

interface SettingRowProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function SettingRow({ label, value, onChange }: SettingRowProps) {
  const filledStars = Math.round(value / 0.1);

  const handleIncrease = () => {
    onChange(ValueSteppers.snapUp(value, 10, 0.4));
  };

  const handleDecrease = () => {
    onChange(ValueSteppers.snapDown(value, 10));
  };

  const renderStars = () => {
    const stars = [];
    
    for (let i = 0; i < MAX_STARS; i++) {
      const isFilled = i < filledStars;
      const imgSrc = isFilled ? starGlowIcon : starIcon;
      const filter = isFilled ? STAR_FILTERS.gold : STAR_FILTERS.gray;

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
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5 flex-1">
          {renderStars()}
        </div>
        <Adjuster
          value={value.toFixed(1)}
          onDecreaseClick={handleDecrease}
          onIncreaseClick={handleIncrease}
          decreaseDisabled={value <= 0.0}
          increaseDisabled={value >= 0.4}
        />
      </div>
    </div>
  );
}

interface SettingsAdjusterProps {
  outdoorValue: number;
  indoorValue: number;
  onOutdoorChange: (value: number) => void;
  onIndoorChange: (value: number) => void;
}

export function SettingsAdjuster({
  outdoorValue,
  indoorValue,
  onOutdoorChange,
  onIndoorChange,
}: SettingsAdjusterProps) {
  return (
    <div className="space-y-3">
      <SettingRow
        label="Filming on locations:"
        value={outdoorValue}
        onChange={onOutdoorChange}
      />
      <SettingRow
        label="Filming on soundstages:"
        value={indoorValue}
        onChange={onIndoorChange}
      />
    </div>
  );
}
