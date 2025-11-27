import { useState, useEffect, memo } from 'react';
import { Input } from '@/components/ui/input';
import budgetIcon from '@/assets/BUDGET.png';
import cashIcon from '@/assets/CASH.png';
import reputationIcon from '@/assets/REPUTATION.png';
import influenceIcon from '@/assets/IP.png';

const formatDollar = (value: number): string => '$' + value.toLocaleString('en-US');
const formatNumber = (value: number): string => value.toLocaleString('en-US');

interface SaveInfoBarProps {
  currentDate: string;
  studioName: string;
  budget: number;
  cash: number;
  reputation: number;
  influence: number;
  onUpdate?: (field: 'budget' | 'cash' | 'reputation' | 'influence', value: number) => void;
}

export const SaveInfoBar = memo(function SaveInfoBar({ 
  currentDate, 
  studioName, 
  budget, 
  cash, 
  reputation, 
  influence,
  onUpdate 
}: SaveInfoBarProps) {
  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4 py-3 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center">
          <div>
            <span className="text-muted-foreground">Date:</span>{' '}
            <span className="font-medium">{currentDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Studio:</span>{' '}
            <span className="font-medium">{studioName}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
          <CurrencyInput 
            icon={budgetIcon}
            alt="Budget"
            value={budget} 
            onChange={(v) => onUpdate?.('budget', v)}
            formatDisplay={formatDollar}
            integer
          />
          <CurrencyInput 
            icon={cashIcon}
            alt="Cash"
            value={cash} 
            onChange={(v) => onUpdate?.('cash', v)}
            formatDisplay={formatDollar}
            integer
          />
          <CurrencyInput 
            icon={reputationIcon}
            alt="Reputation"
            value={reputation} 
            onChange={(v) => onUpdate?.('reputation', v)}
            formatDisplay={formatNumber}
          />
          <CurrencyInput 
            icon={influenceIcon}
            alt="Influence"
            value={influence} 
            onChange={(v) => onUpdate?.('influence', v)}
            formatDisplay={formatNumber}
            integer
          />
        </div>
      </div>
    </div>
  );
});

interface CurrencyInputProps {
  icon: string;
  alt: string;
  value: number;
  onChange?: (value: number) => void;
  formatDisplay: (value: number) => string;
  integer?: boolean;
}

const CurrencyInput = memo(function CurrencyInput({ 
  icon, 
  alt, 
  value, 
  onChange, 
  formatDisplay, 
  integer = false 
}: CurrencyInputProps) {
  const [localValue, setLocalValue] = useState(formatDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatDisplay(value));
    }
  }, [value, isFocused, formatDisplay]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = integer ? parseInt(localValue, 10) : parseFloat(localValue);
    if (!isNaN(parsed) && parsed !== value) {
      onChange?.(parsed);
    }
    setLocalValue(formatDisplay(!isNaN(parsed) ? parsed : value));
  };

  return (
    <div className="flex items-center gap-1">
      <img src={icon} alt={alt} title={alt} className="h-5 w-5" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={alt}
        className="h-6 w-32 px-2 py-0 text-sm font-mono"
      />
    </div>
  );
});