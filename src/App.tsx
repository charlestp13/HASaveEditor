import { useState, useCallback, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { saveManager, PersonUtils } from '@/lib';
import appBanner from '@/assets/appBanner.png';
import { ProfessionTab } from '@/components/ProfessionTab';
import { ErrorBanner } from '@/components/ErrorBanner';
import { StudioInfoBar } from '@/components/StudioInfoBar';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useTabState } from '@/hooks/useTabState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SortField, SortOrder, SaveInfo, CompetitorStudio, Person } from '@/lib';

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
  { id: 'executives', label: 'Executives', profession: 'Executive', countKey: 'executives_count' },
] as const;

const TALENT_PROFESSIONS = ['Actor', 'Scriptwriter', 'Director', 'Producer', 'Cinematographer', 'FilmEditor', 'Composer'] as const;

function buildPortraitMap(
  persons: Person[],
  profession: string,
  nameStrings: string[]
): Map<number, UsedPortrait> {
  const portraits = new Map<number, UsedPortrait>();
  
  for (const person of persons) {
    if (person.portraitBaseId === undefined) continue;
    
    const firstName = nameStrings[parseInt(person.firstNameId || '0', 10)] || '';
    const lastName = nameStrings[parseInt(person.lastNameId || '0', 10)] || '';
    const rawProfName = person.professions ? Object.keys(person.professions)[0] : profession;
    
    portraits.set(person.portraitBaseId, {
      characterName: `${firstName} ${lastName}`.trim() || `ID ${person.id}`,
      profession: PersonUtils.PROFESSION_DISPLAY_NAMES[rawProfName] || rawProfName,
    });
  }
  
  return portraits;
}

export default function App() {
  const [saveInfo, setSaveInfo] = useState<SaveInfo | null>(null);
  const [resources, setResources] = useState<Record<string, number>>({});
  const [titans, setTitans] = useState<Record<string, number>>({});
  const [timeBonuses, setTimeBonuses] = useState<Record<string, number>>({});
  const [competitors, setCompetitors] = useState<CompetitorStudio[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<typeof LANGUAGES[number]>('ENG');
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [globalFilters, setGlobalFilters] = useState<string[]>(['Dead', 'Locked', 'Unemployed', 'GB', 'EM', 'SU', 'HE', 'MA']);
  const [sortField, setSortField] = useState<SortField>('skill');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [shadyFilter, setShadyFilter] = useState<'all' | 'shady' | 'notShady'>('all');
  const [talentPortraits, setTalentPortraits] = useState<Map<string, Map<number, UsedPortrait>>>(new Map());
  const [lieutPortraits, setLieutPortraits] = useState<Map<string, Map<number, UsedPortrait>>>(new Map());
  const [agentPortraits, setAgentPortraits] = useState<Map<string, Map<number, UsedPortrait>>>(new Map());
  const { loading, error, execute, clearError } = useAsyncAction();

  const handleSortChange = useCallback((field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const handlePortraitChange = useCallback((
    oldPortraitId: number | undefined,
    newPortraitId: number,
    characterName: string,
    profession: string
  ) => {
    const isExecutive = PersonUtils.EXECUTIVE_PROFESSIONS.includes(profession as typeof PersonUtils.EXECUTIVE_PROFESSIONS[number]);
    const isAgent = profession === 'Agent';
    const setPortraits = isAgent ? setAgentPortraits : isExecutive ? setLieutPortraits : setTalentPortraits;
    
    setPortraits(prev => {
      const next = new Map(prev);
      const professionPortraits = new Map(next.get(profession) || new Map());
      
      if (oldPortraitId !== undefined) {
        professionPortraits.delete(oldPortraitId);
      }
      professionPortraits.set(newPortraitId, {
        characterName,
        profession: PersonUtils.PROFESSION_DISPLAY_NAMES[profession] || profession,
      });
      
      next.set(profession, professionPortraits);
      return next;
    });
  }, []);

  const combinedTalentPortraits = useMemo(() => {
    const combined = new Map<number, UsedPortrait>();
    talentPortraits.forEach(professionPortraits => {
      professionPortraits.forEach((info, id) => {
        combined.set(id, info);
      });
    });
    return combined;
  }, [talentPortraits]);

  const combinedLieutPortraits = useMemo(() => {
    const combined = new Map<number, UsedPortrait>();
    lieutPortraits.forEach(professionPortraits => {
      professionPortraits.forEach((info, id) => {
        combined.set(id, info);
      });
    });
    return combined;
  }, [lieutPortraits]);

  const combinedAgentPortraits = useMemo(() => {
    const combined = new Map<number, UsedPortrait>();
    agentPortraits.forEach(professionPortraits => {
      professionPortraits.forEach((info, id) => {
        combined.set(id, info);
      });
    });
    return combined;
  }, [agentPortraits]);

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
    setTimeBonuses({});
    setCompetitors([]);
    setFileKey(null);
    setTalentPortraits(new Map());
    setLieutPortraits(new Map());
    setAgentPortraits(new Map());
  };

  const loadSaveData = async (info: SaveInfo, nameStrings: string[]) => {
    const res = await saveManager.getResources();
    const tit = await saveManager.getTitans();
    const tb = await saveManager.getTimeBonuses();
    const comp = await saveManager.getCompetitors();
    
    const talentPortraitMap = new Map<string, Map<number, UsedPortrait>>();
    for (const profession of TALENT_PROFESSIONS) {
      const persons = await saveManager.getPersons(profession);
      const portraits = buildPortraitMap(persons, profession, nameStrings);
      talentPortraitMap.set(profession, portraits);
    }

    const lieutPortraitMap = new Map<string, Map<number, UsedPortrait>>();
    const executives = await saveManager.getPersons('Executive');
    for (const person of executives) {
      if (person.portraitBaseId === undefined) continue;
      const rawProfName = person.professions ? Object.keys(person.professions)[0] : 'Executive';
      
      if (!lieutPortraitMap.has(rawProfName)) {
        lieutPortraitMap.set(rawProfName, new Map());
      }
      
      const firstName = nameStrings[parseInt(person.firstNameId || '0', 10)] || '';
      const lastName = nameStrings[parseInt(person.lastNameId || '0', 10)] || '';
      
      lieutPortraitMap.get(rawProfName)!.set(person.portraitBaseId, {
        characterName: `${firstName} ${lastName}`.trim() || `ID ${person.id}`,
        profession: PersonUtils.PROFESSION_DISPLAY_NAMES[rawProfName] || rawProfName,
      });
    }

    const agentPortraitMap = new Map<string, Map<number, UsedPortrait>>();
    const agents = await saveManager.getPersons('Agent');
    const agentInnerMap = new Map<number, UsedPortrait>();
    for (const person of agents) {
      if (person.portraitBaseId === undefined) continue;
      const firstName = nameStrings[parseInt(person.firstNameId || '0', 10)] || '';
      const lastName = nameStrings[parseInt(person.lastNameId || '0', 10)] || '';
      agentInnerMap.set(person.portraitBaseId, {
        characterName: `${firstName} ${lastName}`.trim() || `ID ${person.id}`,
        profession: 'Agent',
      });
    }
    agentPortraitMap.set('Agent', agentInnerMap);
    
    setSaveInfo(info);
    setResources(res);
    setTitans(tit);
    setTimeBonuses(tb);
    setCompetitors(comp);
    setTalentPortraits(talentPortraitMap);
    setLieutPortraits(lieutPortraitMap);
    setAgentPortraits(agentPortraitMap);
    setFileKey(`${saveManager.getCurrentPath()}-${Date.now()}`);
  };

  const handleOpenFile = () => execute(async () => {
    resetState();
    const result = await saveManager.openSaveFile();
    if (result) {
      const nameStrings = await saveManager.getLanguageStrings(selectedLanguage);
      await loadSaveData(result.info, nameStrings);
    }
  });

  const handleRefresh = () => execute(async () => {
    resetState();
    const result = await saveManager.reloadSaveFile();
    if (result) {
      const nameStrings = await saveManager.getLanguageStrings(selectedLanguage);
      await loadSaveData(result.info, nameStrings);
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

  const handleTimeBonusUpdate = async (department: string, value: number) => {
    try {
      await saveManager.updateTimeBonus(department, value);
      setTimeBonuses(prev => {
        const next = { ...prev };
        if (value === 0) {
          delete next[department];
        } else {
          next[department] = value;
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to update time bonus:', err);
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
          timeBonuses={timeBonuses}
          competitors={competitors}
          onStudioUpdate={handleStudioUpdate}
          onResourceUpdate={handleResourceUpdate}
          onTitanUpdate={handleTitanUpdate}
          onTimeBonusUpdate={handleTimeBonusUpdate}
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

          <main className="container mx-auto px-4 py-6 relative">
            {TABS.map(tab => {
              const isVisited = visitedTabs.has(tab.id);
              if (!isVisited) return null;
              
              const isActive = activeTab === tab.id;
              
              return (
                <div
                  key={tab.id}
                  style={isActive ? undefined : {
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  <ProfessionTab
                    profession={tab.profession}
                    selectedLanguage={selectedLanguage}
                    saveInfo={saveInfo}
                    fileKey={fileKey}
                    isActive={isActive}
                    selectedFilters={globalFilters}
                    onFiltersChange={setGlobalFilters}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    genderFilter={genderFilter}
                    onGenderFilterChange={setGenderFilter}
                    shadyFilter={shadyFilter}
                    onShadyFilterChange={setShadyFilter}
                    usedPortraits={
                      tab.profession === 'Executive' ? combinedLieutPortraits :
                      tab.profession === 'Agent' ? combinedAgentPortraits :
                      combinedTalentPortraits
                    }
                    onPortraitChange={handlePortraitChange}
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