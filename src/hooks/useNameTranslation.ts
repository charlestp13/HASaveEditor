import { useState, useEffect, useRef, useCallback } from 'react';
import { saveManager } from '@/lib/tauri-api';
import { PersonUtils } from '@/lib/utils';
import type { Person } from '@/lib/types';

export function useNameTranslation(selectedLanguage: string) {
  const [nameStrings, setNameStrings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, string>>(new Map());

  const loadLanguageStrings = useCallback(async () => {
    try {
      const strings = await saveManager.getLanguageStrings(selectedLanguage);
      setNameStrings(strings);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('Game installation not found') || errorMsg.includes('Browse for Game Folder')) {
        setError(errorMsg);
      } else {
        setNameStrings([]);
      }
    }
  }, [selectedLanguage]);

  useEffect(() => {
    cache.current.clear();
  }, [nameStrings]);

  useEffect(() => {
    loadLanguageStrings();
  }, [loadLanguageStrings]);

  const getTranslatedName = useCallback((person: Person): string => {
    const cacheKey = `${person.id}`;
    const cached = cache.current.get(cacheKey);
    if (cached) return cached;

    const name = PersonUtils.getDisplayName(person, nameStrings.length > 0 ? nameStrings : undefined);
    cache.current.set(cacheKey, name);
    return name;
  }, [nameStrings]);

  return { nameStrings, getTranslatedName, error, reload: loadLanguageStrings };
}