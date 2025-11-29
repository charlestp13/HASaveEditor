import { useState, useEffect, useCallback, useRef } from 'react';
import { saveManager } from '@/lib/tauri-api';

export function useNameTranslation(selectedLanguage: string) {
  const [nameStrings, setNameStrings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const loadedLanguageRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedLanguageRef.current === selectedLanguage) {
      return;
    }

    const loadStrings = async () => {
      try {
        const strings = await saveManager.getLanguageStrings(selectedLanguage);
        setNameStrings(strings);
        setError(null);
        loadedLanguageRef.current = selectedLanguage;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        if (errorMsg.includes('Game installation not found') || errorMsg.includes('Browse for Game Folder')) {
          setError(errorMsg);
        } else {
          setNameStrings([]);
        }
      }
    };

    loadStrings();
  }, [selectedLanguage]);

  const reload = useCallback(async () => {
    loadedLanguageRef.current = null;
    try {
      const strings = await saveManager.getLanguageStrings(selectedLanguage);
      setNameStrings(strings);
      setError(null);
      loadedLanguageRef.current = selectedLanguage;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('Game installation not found') || errorMsg.includes('Browse for Game Folder')) {
        setError(errorMsg);
      } else {
        setNameStrings([]);
      }
    }
  }, [selectedLanguage]);

  return { nameStrings, error, reload };
}