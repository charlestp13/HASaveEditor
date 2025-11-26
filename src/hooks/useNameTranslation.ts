import { useState, useEffect, useCallback } from 'react';
import { saveManager } from '@/lib/tauri-api';

export function useNameTranslation(selectedLanguage: string) {
  const [nameStrings, setNameStrings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

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
    loadLanguageStrings();
  }, [loadLanguageStrings]);

  return { nameStrings, error, reload: loadLanguageStrings };
}