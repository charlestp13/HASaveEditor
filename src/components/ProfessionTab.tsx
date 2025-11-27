import { useState, useEffect, useMemo, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { saveManager } from '@/lib/tauri-api';
import { StudioUtils } from '@/lib/utils';
import { PersonStateUpdater } from '@/lib/person-state-updater';
import { PersonFilters } from '@/lib/person-filters';
import { PersonSorter } from '@/lib/person-sorter';
import { NameSearcher } from '@/lib/name-searcher';
import type { SortField, SortOrder } from '@/lib/person-sorter';
import { Input } from '@/components/ui/input';
import { FilterPopover } from '@/components/FilterPopover';
import { SortPopover } from '@/components/SortPopover';
import { CharacterList } from '@/components/CharacterList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useNameTranslation } from '@/hooks/useNameTranslation';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import type { Person, SaveInfo } from '@/lib/types';

interface ProfessionTabProps {
  profession: string;
  selectedLanguage: string;
  saveInfo: SaveInfo | null;
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  genderFilter: 'all' | 'male' | 'female';
  onGenderFilterChange: (filter: 'all' | 'male' | 'female') => void;
  shadyFilter: 'all' | 'shady' | 'notShady';
  onShadyFilterChange: (filter: 'all' | 'shady' | 'notShady') => void;
  refreshKey?: number;
}

export function ProfessionTab({ 
  profession, 
  selectedLanguage, 
  saveInfo,
  selectedFilters,
  onFiltersChange,
  sortField,
  sortOrder,
  onSortChange,
  genderFilter,
  onGenderFilterChange,
  shadyFilter,
  onShadyFilterChange,
  refreshKey
}: ProfessionTabProps) {
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');

  const professionLower = profession.toLowerCase();
  
  const handleError = useCallback((err: unknown, fallback: string) => 
    setError(err instanceof Error ? err.message : fallback), []);

  const { nameStrings, error: nameError, reload: reloadNames } = useNameTranslation(selectedLanguage);
  
  const nameSearcher = useMemo(() => new NameSearcher(nameStrings), [nameStrings]);
  
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
    saveManager.getCurrentDate()
      .then(setCurrentDate)
      .catch(err => handleError(err, 'Failed to get current date'));
  }, [handleError]);

  const loadAllPersons = useCallback(async () => {
    if (!saveManager.isLoaded()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await saveManager.getPersons(profession);
      setAllPersons(data);
    } catch (err) {
      handleError(err, `Failed to load ${professionLower}s`);
    } finally {
      setLoading(false);
    }
  }, [profession, professionLower, handleError]);

  useEffect(() => {
    loadAllPersons();
  }, [loadAllPersons]);

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

  const sortedPersons = useMemo(() => {
    return PersonSorter.sort(filteredPersons, sortField, sortOrder, { currentDate });
  }, [filteredPersons, sortField, sortOrder, currentDate, refreshKey]);

  const [displayPersons, setDisplayPersons] = useState<Person[]>([]);

  useEffect(() => {
    setDisplayPersons(sortedPersons);
  }, [sortedPersons]);

  const persons = useMemo(() => {
    return displayPersons.map(displayPerson => {
      const updated = filteredPersons.find(p => p.id === displayPerson.id);
      return updated || displayPerson;
    });
  }, [displayPersons, filteredPersons]);

  const handlePersonUpdate = useCallback((personId: string | number, field: string, value: number | null) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.updateField(p, field, value) : p
    ));
    debouncedSave(`${personId}-${field}`, String(personId), field, value);
  }, [debouncedSave]);

  const handleNameUpdate = useCallback((personId: string | number, field: 'firstNameId' | 'lastNameId', nameId: string) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.updateNameField(p, field, nameId) : p
    ));
    saveManager.updatePerson(profession, String(personId), { [field]: nameId })
      .catch(err => handleError(err, 'Failed to update name'));
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
        onRetry={loadAllPersons}
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
          <SortPopover
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
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
          onNameUpdate={handleNameUpdate}
          onTraitAdd={handleTraitAdd}
          onTraitRemove={handleTraitRemove}
        />
      )}
    </div>
  );
}