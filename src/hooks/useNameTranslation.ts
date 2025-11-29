import { useEffect, useCallback, useRef } from 'react';
import { saveManager } from '@/lib';
import { useAsyncAction } from './useAsyncAction';

export function useNameTranslation(selectedLanguage: string) {
  const { loading, error, execute } = useAsyncAction();
  const nameStringsRef = useRef<string[]>([]);
  const loadedLanguageRef = useRef<string | null>(null);

  const loadStrings = useCallback(async (language: string, force = false) => {
    if (!force && loadedLanguageRef.current === language) return;

    const result = await execute(async () => {
      const strings = await saveManager.getLanguageStrings(language);
      nameStringsRef.current = strings;
      loadedLanguageRef.current = language;
      return strings;
    });

    if (!result) {
      nameStringsRef.current = [];
    }
  }, [execute]);

  useEffect(() => {
    loadStrings(selectedLanguage);
  }, [selectedLanguage, loadStrings]);

  const reload = useCallback(() => {
    loadedLanguageRef.current = null;
    loadStrings(selectedLanguage, true);
  }, [selectedLanguage, loadStrings]);

  return { 
    nameStrings: nameStringsRef.current, 
    loading,
    error, 
    reload,
  };
}