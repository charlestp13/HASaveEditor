import { useState, useEffect, useCallback } from 'react';

export type TabId = 'actors' | 'screenwriters' | 'directors' | 'producers' | 'cinematographers' | 'editors' | 'composers' | 'agents' | 'deptHeads' | 'executives';

interface UseTabStateOptions {
  initialTab?: TabId;
  fileKey?: string | null;
  selectedLanguage?: string;
}

export function useTabState(options: UseTabStateOptions = {}) {
  const { initialTab = 'actors', fileKey, selectedLanguage } = options;

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [fileKey, selectedLanguage, initialTab]);

  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  }, [activeTab]);

  return {
    activeTab,
    handleTabClick,
  };
}