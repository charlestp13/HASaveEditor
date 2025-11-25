import { useRef, useCallback } from 'react';

export function useDebouncedSave(saveFn: (...args: any[]) => Promise<any>, delay: number = 300) {
  const timers = useRef<Map<string, number>>(new Map());

  const debouncedSave = useCallback((key: string, ...args: any[]) => {
    const existingTimer = timers.current.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    const newTimer = window.setTimeout(() => {
      saveFn(...args).catch(console.error);
      timers.current.delete(key);
    }, delay);
    
    timers.current.set(key, newTimer);
  }, [saveFn, delay]);

  const flush = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  return { debouncedSave, flush };
}