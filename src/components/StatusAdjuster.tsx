import { StatusBadge } from '@/components/StatusBadge';
import { Adjuster } from '@/components/Adjuster';

const STATUS_LEVELS = [0.01, 0.15, 0.30, 0.70, 1.00];
const STATUS_BUTTON_COLOR = "#A6AEBF";

const getNextStatusLevel = (current: number): number => {
  for (const level of STATUS_LEVELS) {
    if (level > current) return level;
  }
  return current;
};

const getPrevStatusLevel = (current: number): number => {
  for (let i = STATUS_LEVELS.length - 1; i >= 0; i--) {
    if (STATUS_LEVELS[i] < current) return STATUS_LEVELS[i];
  }
  return 0;
};

interface StatusAdjusterProps {
  type: 'ART' | 'COM';
  value: number | null;
  label: string;
  profession: 'Actor' | 'Director';
  onChange?: (value: number | null) => void;
}

interface StatusButtonProps {
  type: 'ART' | 'COM';
  action: 'Add' | 'Remove';
  onClick: () => void;
}

function StatusButton({ type, action, onClick }: StatusButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1 rounded-full border w-fit hover:opacity-80 transition-opacity"
      style={{ borderColor: STATUS_BUTTON_COLOR, backgroundColor: `${STATUS_BUTTON_COLOR}20` }}
    >
      <img 
        src={`/status/${type}.png`} 
        alt={type} 
        className="w-4 h-4 object-contain"
      />
      <span 
        className="text-xs font-medium"
        style={{ color: STATUS_BUTTON_COLOR }}
      >
        {action}
      </span>
    </button>
  );
}

export function StatusAdjuster({ type, value, label, profession, onChange }: StatusAdjusterProps) {
  const hasValue = value !== null && value > 0;
  const showBadge = hasValue && value >= 0.15;

  const renderContent = () => {
    if (!hasValue) {
      return (
        <>
          <StatusButton type={type} action="Add" onClick={() => onChange?.(STATUS_LEVELS[0])} />
          <div className="w-[88px]" />
        </>
      );
    }

    if (!showBadge) {
      return (
        <>
          <StatusButton type={type} action="Remove" onClick={() => onChange?.(null)} />
          <Adjuster
            value={value.toFixed(2)}
            onDecreaseClick={() => onChange?.(null)}
            onIncreaseClick={() => onChange?.(getNextStatusLevel(value))}
            decreaseDisabled={false}
            increaseDisabled={value >= 1}
          />
        </>
      );
    }

    return (
      <>
        <div className="flex-1">
          <StatusBadge type={type} value={value} profession={profession} />
        </div>
        <Adjuster
          value={value.toFixed(2)}
          onDecreaseClick={() => onChange?.(getPrevStatusLevel(value))}
          onIncreaseClick={() => onChange?.(getNextStatusLevel(value))}
          decreaseDisabled={value <= 0.01}
          increaseDisabled={value >= 1}
        />
      </>
    );
  };

  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between">
        {renderContent()}
      </div>
    </div>
  );
}
