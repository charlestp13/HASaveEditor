import { useState, useEffect, useRef, useCallback } from 'react';
import { saveManager } from '@/lib/tauri-api';
import { PersonUtils } from '@/lib/utils';
import type { Person } from '@/lib/types';

export function useNameTranslation(selectedLanguage: string) {
  const [nameStrings, setNameStrings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    cache.current.clear();
  }, [nameStrings]);

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, [selectedLanguage]);

  const getTranslatedName = useCallback((person: Person): string => {
    const cacheKey = `${person.id}-${selectedLanguage}`;
    const cached = cache.current.get(cacheKey);
    if (cached) return cached;

    let name: string;
    if (person.customName) {
      name = person.customName;
    } else if (nameStrings.length === 0 || !person.firstNameId || !person.lastNameId) {
      name = PersonUtils.getDisplayName(person);
    } else {
      const firstName = nameStrings[person.firstNameId] || '???';
      const lastName = nameStrings[person.lastNameId] || '???';
      name = `${firstName} ${lastName}`;
    }

    cache.current.set(cacheKey, name);
    return name;
  }, [nameStrings, selectedLanguage]);

  const reload = useCallback(async () => {
    try {
      const strings = await saveManager.getLanguageStrings(selectedLanguage);
      setNameStrings(strings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [selectedLanguage]);

  return { nameStrings, getTranslatedName, error, reload };
}
