import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterPopover } from '@/components/FilterPopover';
import { SortPopover } from '@/components/SortPopover';
import { CharacterList } from '@/components/CharacterList';
import { PortraitEditorDialog } from '@/components/PortraitEditorDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useNameTranslation } from '@/hooks/useNameTranslation';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import { RefreshCw } from 'lucide-react';
import { 
  saveManager, 
  StudioUtils, 
  PersonStateUpdater, 
  PersonFilters, 
  PersonSorter, 
  NameSearcher,
  type SortField, 
  type SortOrder,
  type Person, 
  type SaveInfo,
} from '@/lib';

const PROFESSION_DISPLAY_NAMES: Record<string, string> = {
  Actor: 'Actor',
  Scriptwriter: 'Screenwriter',
  Director: 'Director',
  Producer: 'Producer',
  Cinematographer: 'Cinematographer',
  FilmEditor: 'Editor',
  Composer: 'Composer',
};

function getProfessionDisplayName(profession: string): string {
  return PROFESSION_DISPLAY_NAMES[profession] || profession;
}

interface UsedPortrait {
  characterName: string;
  profession: string;
}

interface ProfessionTabProps {
  profession: string;
  selectedLanguage: string;
  saveInfo: SaveInfo | null;
  fileKey: string | null;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  genderFilter: 'all' | 'male' | 'female';
  onGenderFilterChange: (filter: 'all' | 'male' | 'female') => void;
  shadyFilter: 'all' | 'shady' | 'notShady';
  onShadyFilterChange: (filter: 'all' | 'shady' | 'notShady') => void;
  usedPortraits: Map<number, UsedPortrait>;
  onPortraitUsageChange?: (profession: string, portraits: Map<number, UsedPortrait>) => void;
}

export const ProfessionTab = memo(function ProfessionTab({ 
  profession, 
  selectedLanguage, 
  saveInfo,
  fileKey,
  selectedFilters,
  onFiltersChange,
  sortField,
  sortOrder,
  onSortChange,
  genderFilter,
  onGenderFilterChange,
  shadyFilter,
  onShadyFilterChange,
  usedPortraits,
  onPortraitUsageChange,
}: ProfessionTabProps) {
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPortraitPersonId, setEditingPortraitPersonId] = useState<string | number | null>(null);

  const currentDate = saveInfo?.current_date ?? '';
  const professionLower = profession.toLowerCase();
  
  const isTalentProfession = profession !== 'Agent' && 
    !profession.startsWith('Lieut') && 
    !profession.startsWith('Cpt');
  
  const handleError = useCallback((err: unknown, fallback: string) => 
    setError(err instanceof Error ? err.message : fallback), []);

  const { nameStrings, error: nameError, reload: reloadNames } = useNameTranslation(selectedLanguage);
  
  const nameSearcher = useMemo(() => new NameSearcher(nameStrings), [nameStrings]);

  const editingPerson = useMemo(() => {
    if (!editingPortraitPersonId) return null;
    return allPersons.find(p => p.id === editingPortraitPersonId) || null;
  }, [editingPortraitPersonId, allPersons]);

  useEffect(() => {
    if (!isTalentProfession || !onPortraitUsageChange) return;
    if (allPersons.length === 0) {
      onPortraitUsageChange(profession, new Map());
      return;
    }
    
    const portraits = new Map<number, UsedPortrait>();
    allPersons.forEach(person => {
      if (person.portraitBaseId !== undefined) {
        const firstName = nameSearcher.getNameById(parseInt(person.firstNameId || '0', 10)) || '';
        const lastName = nameSearcher.getNameById(parseInt(person.lastNameId || '0', 10)) || '';
        const rawProfName = person.professions ? Object.keys(person.professions)[0] : profession;
        portraits.set(person.portraitBaseId, {
          characterName: `${firstName} ${lastName}`.trim() || `ID ${person.id}`,
          profession: getProfessionDisplayName(rawProfName),
        });
      }
    });
    onPortraitUsageChange(profession, portraits);
  }, [allPersons, nameSearcher, profession, isTalentProfession, onPortraitUsageChange]);
  
  const savePerson = useCallback(
    (personId: string, field: string, value: number | null) => {
      if (field.startsWith('whiteTag:') && field !== 'whiteTag:ART' && field !== 'whiteTag:COM') {
        const genre = field.substring(9);
        if (value === null) {
          return saveManager.updatePerson(profession, personId, { removeGenre: genre });
        } else {
          return saveManager.updatePerson(profession, personId, { addGenre: genre });
        }
      }
      
      const updateField = PersonStateUpdater.normalizeFieldName(field);
      return saveManager.updatePerson(profession, personId, { [updateField]: value });
    },
    [profession]
  );
  
  const { debouncedSave } = useDebouncedSave(savePerson, 300);

  useEffect(() => {
    if (!fileKey) return;
    if (!saveManager.isLoaded()) return;

    const loadPersons = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await saveManager.getPersons(profession);
        setAllPersons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to load ${professionLower}s`);
      } finally {
        setLoading(false);
      }
    };

    loadPersons();
  }, [profession, professionLower, fileKey]);

  const handleRetry = useCallback(async () => {
    if (!saveManager.isLoaded()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await saveManager.getPersons(profession);
      setAllPersons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${professionLower}s`);
    } finally {
      setLoading(false);
    }
  }, [profession, professionLower]);

  const handleSelectGamePath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Hollywood Animal Installation Folder',
      });

      if (selected && typeof selected === 'string') {
        await saveManager.setGamePath(selected);
        setError(null);
        reloadNames();
      }
    } catch (err) {
      handleError(err, 'Failed to set game path');
    }
  };

  const availableStudios = useMemo(() => {
    const studios = new Set<string>();
    allPersons.forEach(p => {
      const studioId = StudioUtils.normalizeId(p.studioId);
      if (studioId !== 'N/A' && studioId !== 'PL') {
        studios.add(studioId);
      }
    });
    return Array.from(studios).sort();
  }, [allPersons]);

  const filteredPersons = useMemo(() => {
    if (allPersons.length === 0) return [];
    
    const filterConfig = PersonFilters.parseSelectedFilters(selectedFilters);
    let filtered = PersonFilters.applyAll(
      allPersons, 
      { ...filterConfig, search }, 
      nameStrings.length > 0 ? nameStrings : undefined
    );

    if (genderFilter !== 'all' || shadyFilter !== 'all') {
      filtered = filtered.filter(person => {
        if (genderFilter !== 'all') {
          const personGender = person.gender === 1 ? 'female' : 'male';
          if (personGender !== genderFilter) return false;
        }
        
        if (shadyFilter !== 'all') {
          const isShady = person.isShady === true;
          if (shadyFilter === 'shady' && !isShady) return false;
          if (shadyFilter === 'notShady' && isShady) return false;
        }
        
        return true;
      });
    }

    return filtered;
  }, [allPersons, search, selectedFilters, nameStrings, genderFilter, shadyFilter]);

  const persons = useMemo(() => {
    if (allPersons.length === 0) return [];
    return PersonSorter.sort(filteredPersons, sortField, sortOrder, { currentDate });
  }, [allPersons.length, filteredPersons, sortField, sortOrder, currentDate, refreshKey]);

  const handlePersonUpdate = useCallback((personId: string | number, field: string, value: number | null) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.updateField(p, field, value) : p
    ));
    debouncedSave(`${personId}-${field}`, String(personId), field, value);
  }, [debouncedSave]);

  const handleStringFieldUpdate = useCallback((
    personId: string | number, 
    field: 'firstNameId' | 'lastNameId' | 'customName', 
    value: string | null
  ) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.updateStringField(p, field, value) : p
    ));
    const updateValue = field === 'customName' ? (value ?? '') : value;
    saveManager.updatePerson(profession, String(personId), { [field]: updateValue })
      .catch(err => handleError(err, `Failed to update ${field}`));
  }, [profession, handleError]);

  const handleTraitAdd = useCallback((personId: string | number, trait: string) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.addTrait(p, trait) : p
    ));
    saveManager.updatePerson(profession, String(personId), { addTrait: trait })
      .catch(err => handleError(err, 'Failed to add trait'));
  }, [profession, handleError]);

  const handleTraitRemove = useCallback((personId: string | number, trait: string) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.removeTrait(p, trait) : p
    ));
    saveManager.updatePerson(profession, String(personId), { removeTrait: trait })
      .catch(err => handleError(err, 'Failed to remove trait'));
  }, [profession, handleError]);

  const handlePortraitChange = useCallback((personId: string | number, portraitId: number) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? { ...p, portraitBaseId: portraitId } : p
    ));
    setEditingPortraitPersonId(null);
    saveManager.updatePerson(profession, String(personId), { portraitBaseId: portraitId })
      .catch(err => handleError(err, 'Failed to update portrait'));
  }, [profession, handleError]);

  const handleEditPortrait = useCallback((personId: string | number) => {
    setEditingPortraitPersonId(personId);
  }, []);

  const displayError = error || nameError;
  const isGamePathError = displayError?.includes('Game installation not found') ||
                          displayError?.includes('Browse for Game Folder') ||
                          displayError?.includes('verify the game installation path');

  const hasFilters = search || selectedFilters.length > 0;
  const emptyMessage = hasFilters
    ? `No ${professionLower}s found${search ? ` matching "${search}"` : ''}`
    : `No ${professionLower}s in this save file`;

  if (!saveInfo) {
    return <EmptyState message="No save file loaded" />;
  }

  if (displayError) {
    return (
      <ErrorState
        title={isGamePathError ? 'Game Installation Not Found' : `Failed to load ${professionLower}s`}
        message={displayError}
        onRetry={handleRetry}
        onBrowse={isGamePathError ? handleSelectGamePath : undefined}
        browseLabel="Browse for Game Folder"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="text"
          placeholder={`Search ${professionLower}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
          disabled={loading}
        />
        <div className="text-sm text-muted-foreground">
          {loading ? (
            <>Loading...</>
          ) : (
            <>Found: <span className="font-semibold text-foreground">{persons.length}</span> {professionLower}{persons.length !== 1 ? 's' : ''}</>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <div className="flex">
            <SortPopover
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey(k => k + 1)}
              className="rounded-l-none border-l-0"
              title="Re-sort"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <FilterPopover
            playerStudioName={saveInfo.player_studio_name}
            playerLogoId={saveInfo.studio_logo_id}
            availableStudios={availableStudios}
            selectedFilters={selectedFilters}
            onFilterChange={onFiltersChange}
            genderFilter={genderFilter}
            onGenderFilterChange={onGenderFilterChange}
            shadyFilter={shadyFilter}
            onShadyFilterChange={onShadyFilterChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner message={`Loading ${professionLower}s...`} />
        </div>
      ) : persons.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <CharacterList
          persons={persons}
          currentDate={currentDate}
          nameSearcher={nameSearcher}
          onUpdate={handlePersonUpdate}
          onStringFieldUpdate={handleStringFieldUpdate}
          onTraitAdd={handleTraitAdd}
          onTraitRemove={handleTraitRemove}
          onEditPortrait={isTalentProfession ? handleEditPortrait : undefined}
        />
      )}

      {isTalentProfession && editingPerson && (
        <PortraitEditorDialog
          open={!!editingPortraitPersonId}
          onOpenChange={(open) => !open && setEditingPortraitPersonId(null)}
          gender={editingPerson.gender!}
          currentPortraitId={editingPerson.portraitBaseId!}
          usedPortraits={usedPortraits}
          onSelectPortrait={(portraitId) => handlePortraitChange(editingPerson.id, portraitId)}
        />
      )}
    </div>
  );
});