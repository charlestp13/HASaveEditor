import { useState, useEffect, useCallback } from 'react';

export type TabId = 'actors' | 'screenwriters' | 'directors' | 'producers' | 'cinematographers' | 'editors' | 'composers' | 'agents' | 'executives';

interface UseTabStateOptions {
  initialTab?: TabId;
  fileKey?: string | null;
  selectedLanguage?: string;
}

export function useTabState(options: UseTabStateOptions = {}) {
  const { initialTab = 'actors', fileKey, selectedLanguage } = options;

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set([initialTab]));

  useEffect(() => {
    setActiveTab(initialTab);
    setVisitedTabs(new Set([initialTab]));
  }, [fileKey, selectedLanguage, initialTab]);

  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
      setVisitedTabs(prev => new Set([...prev, tabId]));
    }
  }, [activeTab]);

  return {
    activeTab,
    visitedTabs,
    handleTabClick,
  };
}