import { useState } from 'react';
import { saveManager } from '@/lib/tauri-api';
import appBanner from '@/assets/appBanner.png';
import { ProfessionTab } from '@/components/ProfessionTab';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SaveInfoBar } from '@/components/SaveInfoBar';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useTabState } from '@/hooks/useTabState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SaveInfo } from '@/lib/types';
import type { SortField, SortOrder } from '@/lib/person-sorter';

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
  { id: 'directors', label: 'Directors', profession: 'Director', countKey: 'directors_count' },
  { id: 'producers', label: 'Producers', profession: 'Producer', countKey: 'producers_count' },
  { id: 'writers', label: 'Writers', profession: 'Scriptwriter', countKey: 'writers_count' },
  { id: 'editors', label: 'Editors', profession: 'FilmEditor', countKey: 'editors_count' },
  { id: 'composers', label: 'Composers', profession: 'Composer', countKey: 'composers_count' },
  { id: 'cinematographers', label: 'Cinematographers', profession: 'Cinematographer', countKey: 'cinematographers_count' },
  { id: 'agents', label: 'Agents', profession: 'Agent', countKey: 'agents_count' },
] as const;

export default function App() {
  const [saveInfo, setSaveInfo] = useState<SaveInfo | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<typeof LANGUAGES[number]>('ENG');
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [globalFilters, setGlobalFilters] = useState<string[]>(['Dead', 'Locked']);
  const [sortField, setSortField] = useState<SortField>('skill');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [shadyFilter, setShadyFilter] = useState<'all' | 'shady' | 'notShady'>('all');
  const { loading, error, execute, clearError } = useAsyncAction();

  const {
    activeTab,
    visitedTabs,
    handleTabClick,
  } = useTabState({
    initialTab: 'actors',
    fileKey,
    selectedLanguage,
  });

  const handleOpenFile = () => execute(async () => {
    const result = await saveManager.openSaveFile();
    if (result) {
      setSaveInfo(result.info);
      setFileKey(`${saveManager.getCurrentPath()}-${Date.now()}`);
    }
  });

  const handleSaveFile = () => execute(() => saveManager.saveSaveFile());
  const handleSaveFileAs = () => execute(() => saveManager.saveSaveFileAs());

  const handleStudioUpdate = (field: 'budget' | 'cash' | 'reputation' | 'influence', value: number) => {
    execute(async () => {
      await saveManager.updateStudio({ [field]: value });
      setSaveInfo(prev => prev ? { ...prev, [field]: value } : null);
    });
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
                <Button onClick={handleOpenFile} disabled={loading}>
                  {loading ? 'Loading...' : 'Open Save File'}
                </Button>
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
        <SaveInfoBar
          currentDate={saveInfo.current_date}
          studioName={saveInfo.player_studio_name}
          budget={saveInfo.budget}
          cash={saveInfo.cash}
          reputation={saveInfo.reputation}
          influence={saveInfo.influence}
          onUpdate={handleStudioUpdate}
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
                    selectedFilters={globalFilters}
                    onFiltersChange={setGlobalFilters}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortChange={(field, order) => {
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    genderFilter={genderFilter}
                    onGenderFilterChange={setGenderFilter}
                    shadyFilter={shadyFilter}
                    onShadyFilterChange={setShadyFilter}
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