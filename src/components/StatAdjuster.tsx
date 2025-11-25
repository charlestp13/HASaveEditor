import { useRef, useCallback, useEffect } from 'react';
import { Adjuster } from '@/components/Adjuster';

interface StatAdjusterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function StatAdjuster({ label, value, onChange, min = 0, max = 100 }: StatAdjusterProps) {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const valueRef = useRef(value);
  const firstAccelTickRef = useRef(true);

  const displayValue = Math.round(value * 100);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const clamp = (val: number) => Math.max(min, Math.min(max, val));

  const applyDelta = useCallback((delta: number) => {
    const currentDisplay = Math.round(valueRef.current * 100);
    const newDisplayValue = clamp(currentDisplay + delta);
    onChange(newDisplayValue / 100);
  }, [onChange, min, max]);

  const applyAccelDelta = useCallback((direction: number) => {
    const currentDisplay = Math.round(valueRef.current * 100);
    let newDisplayValue: number;
    
    if (firstAccelTickRef.current) {
      firstAccelTickRef.current = false;
      if (direction > 0) {
        newDisplayValue = currentDisplay % 10 === 0 
          ? currentDisplay + 10 
          : Math.ceil(currentDisplay / 10) * 10;
      } else {
        newDisplayValue = currentDisplay % 10 === 0 
          ? currentDisplay - 10 
          : Math.floor(currentDisplay / 10) * 10;
      }
    } else {
      newDisplayValue = currentDisplay + (direction > 0 ? 10 : -10);
    }
    
    onChange(clamp(newDisplayValue) / 100);
  }, [onChange, min, max]);

  const startHold = useCallback((delta: number) => {
    applyDelta(delta);
    firstAccelTickRef.current = true;
    
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        applyAccelDelta(delta);
      }, 100);
    }, 500);
  }, [applyDelta, applyAccelDelta]);

  const stopHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    firstAccelTickRef.current = true;
  }, []);

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