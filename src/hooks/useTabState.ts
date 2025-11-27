import { useState, useEffect, useCallback } from 'react';

export type TabId = 'actors' | 'directors' | 'producers' | 'writers' | 'editors' | 'composers' | 'cinematographers' | 'agents';

interface UseTabStateOptions {
  initialTab?: TabId;
  fileKey?: string | null;
  selectedLanguage?: string;
}

export function useTabState(options: UseTabStateOptions = {}) {
  const { initialTab = 'actors', fileKey, selectedLanguage } = options;

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set([initialTab]));
  const [refreshKeys, setRefreshKeys] = useState<Partial<Record<TabId, number>>>({});

  // Reset tabs when file or language changes
  useEffect(() => {
    setVisitedTabs(new Set([initialTab]));
    setRefreshKeys({});
  }, [fileKey, selectedLanguage, initialTab]);

  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId === activeTab) {
      // Clicking active tab = refresh sort
      setRefreshKeys(prev => ({
        ...prev,
        [tabId]: (prev[tabId] || 0) + 1
      }));
    } else {
      // Switch to new tab
      setActiveTab(tabId);
      setVisitedTabs(prev => new Set([...prev, tabId]));
    }
  }, [activeTab]);

  const resetTabs = useCallback(() => {
    setVisitedTabs(new Set([initialTab]));
    setRefreshKeys({});
    setActiveTab(initialTab);
  }, [initialTab]);

  const refreshCurrentTab = useCallback(() => {
    setRefreshKeys(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] || 0) + 1
    }));
  }, [activeTab]);

  return {
    activeTab,
    visitedTabs,
    refreshKeys,
    handleTabClick,
    resetTabs,
    refreshCurrentTab,
    setActiveTab,
  };
}
