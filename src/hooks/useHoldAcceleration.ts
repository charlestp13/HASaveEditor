import { useRef, useCallback, useEffect } from 'react';

export interface AccelerationConfig {
  initialStep: number;
  acceleratedStep: number;
  holdDelay?: number;
  accelerationInterval?: number;
  snapToGrid?: boolean;
  gridSize?: number;
}

const DEFAULT_CONFIG: Required<Omit<AccelerationConfig, 'initialStep' | 'acceleratedStep'>> = {
  holdDelay: 500,
  accelerationInterval: 100,
  snapToGrid: false,
  gridSize: 10,
};

export function useHoldAcceleration(
  currentValue: number,
  onChange: (value: number) => void,
  config: AccelerationConfig,
  min: number = 0,
  max: number = 100
) {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const valueRef = useRef(currentValue);
  const firstAccelTickRef = useRef(true);

  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    valueRef.current = currentValue;
  }, [currentValue]);

  const clamp = useCallback((val: number) => Math.max(min, Math.min(max, val)), [min, max]);

  const snapToGrid = useCallback((val: number, direction: number): number => {
    if (!fullConfig.snapToGrid) return val;
    
    const { gridSize } = fullConfig;
    if (direction > 0) {
      return val % gridSize === 0 
        ? val + gridSize 
        : Math.ceil(val / gridSize) * gridSize;
    } else {
      return val % gridSize === 0 
        ? val - gridSize 
        : Math.floor(val / gridSize) * gridSize;
    }
  }, [fullConfig]);

  const applyDelta = useCallback((delta: number) => {
    const newValue = clamp(valueRef.current + delta);
    onChange(newValue);
  }, [onChange, clamp]);

  const applyAccelDelta = useCallback((direction: number) => {
    let newValue: number;
    
    if (firstAccelTickRef.current) {
      firstAccelTickRef.current = false;
      newValue = snapToGrid(valueRef.current, direction);
    } else {
      newValue = valueRef.current + (direction > 0 ? fullConfig.acceleratedStep : -fullConfig.acceleratedStep);
    }
    
    onChange(clamp(newValue));
  }, [onChange, clamp, snapToGrid, fullConfig.acceleratedStep]);

  const startHold = useCallback((delta: number) => {
    applyDelta(delta);
    firstAccelTickRef.current = true;
    
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => {
        applyAccelDelta(delta > 0 ? 1 : -1);
      }, fullConfig.accelerationInterval);
    }, fullConfig.holdDelay);
  }, [applyDelta, applyAccelDelta, fullConfig]);

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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { startHold, stopHold };
}
