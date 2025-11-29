import { useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { saveManager } from '@/lib/tauri-api';
import appBanner from '@/assets/appBanner.png';
import { ProfessionTab } from '@/components/ProfessionTab';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StudioInfoBar } from '@/components/StudioInfoBar';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useTabState } from '@/hooks/useTabState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SaveInfo, CompetitorStudio } from '@/lib/types';
import type { SortField, SortOrder } from '@/lib/person-sorter';

interface UsedPortrait {
  characterName: string;
  profession: string;
}

const LANGUAGES = ['ENG', 'SPA', 'GER', 'FRE', 'PTB', 'RUS', 'CHN', 'JAP', 'BEL', 'UKR'] as const;

const LANGUAGE_NAMES: Record<typeof LANGUAGES[number], string> = {
  ENG: 'English',
  SPA: 'Español',
  GER: 'Deutsch',
  FRE: 'Français',
  PTB: 'Português',
  RUS: 'Русский',
  CHN: '中文',
  JAP: '日本語',
  BEL: 'Беларуская',
  UKR: 'Українська',
};

const TABS = [
  { id: 'actors', label: 'Actors', profession: 'Actor', countKey: 'actors_count' },
  { id: 'screenwriters', label: 'Screenwriters', profession: 'Scriptwriter', countKey: 'writers_count' },
  { id: 'directors', label: 'Directors', profession: 'Director', countKey: 'directors_count' },
  { id: 'producers', label: 'Producers', profession: 'Producer', countKey: 'producers_count' },
  { id: 'cinematographers', label: 'Cinematographers', profession: 'Cinematographer', countKey: 'cinematographers_count' },
  { id: 'editors', label: 'Editors', profession: 'FilmEditor', countKey: 'editors_count' },
  { id: 'composers', label: 'Composers', profession: 'Composer', countKey: 'composers_count' },
  { id: 'agents', label: 'Agents', profession: 'Agent', countKey: 'agents_count' },
] as const;

export default function App() {
  const [saveInfo, setSaveInfo] = useState<SaveInfo | null>(null);
  const [resources, setResources] = useState<Record<string, number>>({});
  const [titans, setTitans] = useState<Record<string, number>>({});
  const [competitors, setCompetitors] = useState<CompetitorStudio[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<typeof LANGUAGES[number]>('ENG');
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [globalFilters, setGlobalFilters] = useState<string[]>(['Dead', 'Locked']);
  const [sortField, setSortField] = useState<SortField>('skill');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [shadyFilter, setShadyFilter] = useState<'all' | 'shady' | 'notShady'>('all');
  const [portraitsByProfession, setPortraitsByProfession] = useState<Map<string, Map<number, UsedPortrait>>>(new Map());
  const { loading, error, execute, clearError } = useAsyncAction();

  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const handlePortraitUsageChange = useCallback((profession: string, portraits: Map<number, UsedPortrait>) => {
    setPortraitsByProfession(prev => {
      const next = new Map(prev);
      next.set(profession, portraits);
      return next;
    });
  }, []);

  const combinedUsedPortraits = useMemo(() => {
    const combined = new Map<number, UsedPortrait>();
    portraitsByProfession.forEach(professionPortraits => {
      professionPortraits.forEach((info, id) => {
        combined.set(id, info);
      });
    });
    return combined;
  }, [portraitsByProfession]);

  const {
    activeTab,
    visitedTabs,
    handleTabClick,
  } = useTabState({
    initialTab: 'actors',
    fileKey,
    selectedLanguage,
  });

  const resetState = () => {
    setSaveInfo(null);
    setResources({});
    setTitans({});
    setCompetitors([]);
    setFileKey(null);
    setPortraitsByProfession(new Map());
  };

  const loadSaveData = async (info: SaveInfo) => {
    const res = await saveManager.getResources();
    const tit = await saveManager.getTitans();
    const comp = await saveManager.getCompetitors();
    
    setSaveInfo(info);
    setResources(res);
    setTitans(tit);
    setCompetitors(comp);
    setFileKey(`${saveManager.getCurrentPath()}-${Date.now()}`);
  };

  const handleOpenFile = () => execute(async () => {
    resetState();
    const result = await saveManager.openSaveFile();
    if (result) {
      await loadSaveData(result.info);
    }
  });

  const handleRefresh = () => execute(async () => {
    resetState();
    const result = await saveManager.reloadSaveFile();
    if (result) {
      await loadSaveData(result.info);
    }
  });

  const handleSaveFile = () => execute(() => saveManager.saveSaveFile());
  const handleSaveFileAs = () => execute(() => saveManager.saveSaveFileAs());

  const handleStudioUpdate = async (field: 'budget' | 'cash' | 'reputation' | 'influence', value: number) => {
    try {
      await saveManager.updateStudio({ [field]: value });
      setSaveInfo(prev => prev ? { ...prev, [field]: value } : null);
    } catch (err) {
      console.error('Failed to update studio:', err);
    }
  };

  const handleResourceUpdate = async (resourceId: string, value: number) => {
    try {
      await saveManager.updateResource(resourceId, value);
      setResources(prev => ({ ...prev, [resourceId]: value }));
    } catch (err) {
      console.error('Failed to update resource:', err);
    }
  };

  const handleTitanUpdate = async (titanId: string, value: number) => {
    try {
      await saveManager.updateTitan(titanId, value);
      setTitans(prev => ({ ...prev, [titanId]: value }));
    } catch (err) {
      console.error('Failed to update titan:', err);
    }
  };

  const handleCompetitorUpdate = async (competitorId: string, field: 'lastBudget' | 'ip' | 'budgetCheatsRemaining', value: number) => {
    try {
      await saveManager.updateCompetitor(competitorId, { [field]: value });
      const fieldMap: Record<string, keyof CompetitorStudio> = {
        lastBudget: 'last_budget',
        ip: 'ip',
        budgetCheatsRemaining: 'budget_cheats_remaining',
      };
      const stateField = fieldMap[field];
      setCompetitors(prev => prev.map(c => 
        c.id === competitorId ? { ...c, [stateField]: value } : c
      ));
    } catch (err) {
      console.error('Failed to update competitor:', err);
    }
  };

  const getFileName = (): string => {
    const path = saveManager.getCurrentPath();
    if (!path) return '';
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-0">
          <div className="flex items-center justify-between">
            <img src={appBanner} alt="Hollywood Animal Save Editor" className="h-20" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>Language:</Label>
                <Select value={selectedLanguage} onValueChange={v => setSelectedLanguage(v as typeof LANGUAGES[number])}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(code => (
                      <SelectItem key={code} value={code}>
                        {LANGUAGE_NAMES[code]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex">
                  <Button 
                    onClick={handleOpenFile} 
                    disabled={loading}
                    className="rounded-r-none"
                  >
                    {loading ? 'Loading...' : 'Open Save File'}
                  </Button>
                  <Button
                    onClick={handleRefresh}
                    disabled={!saveManager.isLoaded() || loading}
                    variant="outline"
                    size="icon"
                    className="rounded-l-none border-l-0"
                    title="Refresh / Reload Save File"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSaveFile}
                  disabled={!saveManager.isLoaded() || loading}
                  variant="secondary"
                >
                  Save
                </Button>
                <Button
                  onClick={handleSaveFileAs}
                  disabled={!saveManager.isLoaded() || loading}
                  variant="outline"
                >
                  Save As
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {saveInfo && (
        <StudioInfoBar
          currentDate={saveInfo.current_date}
          studioName={saveInfo.player_studio_name}
          fileName={getFileName()}
          budget={saveInfo.budget}
          cash={saveInfo.cash}
          reputation={saveInfo.reputation}
          influence={saveInfo.influence}
          resources={resources}
          titans={titans}
          competitors={competitors}
          onStudioUpdate={handleStudioUpdate}
          onResourceUpdate={handleResourceUpdate}
          onTitanUpdate={handleTitanUpdate}
          onCompetitorUpdate={handleCompetitorUpdate}
        />
      )}

      {saveManager.isLoaded() && (
        <>
          <nav className="border-b sticky top-0 z-20 bg-background">
            <div className="container mx-auto px-4">
              <div className="flex gap-1 flex-wrap">
                {TABS.map(tab => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'ghost'}
                    onClick={() => handleTabClick(tab.id)}
                    className="rounded-b-none h-9 px-3 text-sm"
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-6">
            {TABS.map(tab => {
              const isVisited = visitedTabs.has(tab.id);
              if (!isVisited) return null;
              
              return (
                <div
                  key={tab.id}
                  style={{ display: activeTab === tab.id ? 'block' : 'none' }}
                >
                  <ProfessionTab
                    profession={tab.profession}
                    selectedLanguage={selectedLanguage}
                    saveInfo={saveInfo}
                    fileKey={fileKey}
                    selectedFilters={globalFilters}
                    onFiltersChange={setGlobalFilters}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    genderFilter={genderFilter}
                    onGenderFilterChange={setGenderFilter}
                    shadyFilter={shadyFilter}
                    onShadyFilterChange={setShadyFilter}
                    usedPortraits={combinedUsedPortraits}
                    onPortraitUsageChange={handlePortraitUsageChange}
                  />
                </div>
              );
            })}
          </main>
        </>
      )}

      {!saveManager.isLoaded() && (
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">No save file loaded</p>
          <Button onClick={handleOpenFile}>Open Save File</Button>
        </div>
      )}
    </div>
  );
}