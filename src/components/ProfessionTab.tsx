import { useState, useEffect, useMemo, useCallback } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { saveManager } from '@/lib/tauri-api';
import { normalizeStudioId } from '@/lib/utils';
import { PersonStateUpdater } from '@/lib/person-state-updater';
import { PersonFilters } from '@/lib/person-filters';
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
import type { SortField, SortOrder } from '@/components/SortPopover';

function calculateAge(birthDate: string, currentDate: string): number | null {
  try {
    const [birthDay, birthMonth, birthYear] = birthDate.split('-').map(Number);
    const [currentDay, currentMonth, currentYear] = currentDate.split('-').map(Number);
    
    let age = currentYear - birthYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

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
  onShadyFilterChange
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
  
  const savePerson = useCallback(
    (personId: string, field: string, value: number | null) => {
      // Handle genres specially - convert whiteTag:GENRE to addGenre/removeGenre
      if (field.startsWith('whiteTag:') && field !== 'whiteTag:ART' && field !== 'whiteTag:COM') {
        const genre = field.substring(9); // Strip "whiteTag:" prefix
        if (value === null) {
          return saveManager.updatePerson(profession, personId, { removeGenre: genre });
        } else {
          return saveManager.updatePerson(profession, personId, { addGenre: genre });
        }
      }
      
      // Handle normal fields (ART, COM, etc.)
      const updateField = PersonStateUpdater.normalizeFieldName(field);
      return saveManager.updatePerson(profession, personId, { [updateField]: value });
    },
    [profession]
  );
  
  const { debouncedSave } = useDebouncedSave(savePerson, 300);

  useEffect(() => {
    saveManager.getCurrentDate()
      .then(setCurrentDate)
      .catch(console.error);
  }, []);

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
      const studioId = normalizeStudioId(p.studioId);
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

    // Apply gender and shady filters in single pass
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
    // Schwartzian transform: pre-compute sort values, sort, then extract
    const withSortValues = filteredPersons.map(person => {
      let sortValue: number;

      switch (sortField) {
        case 'skill': {
          const prof = person.professions ? Object.values(person.professions)[0] : '0';
          sortValue = parseFloat(prof);
          break;
        }
        case 'selfEsteem': {
          sortValue = parseFloat(person.selfEsteem || '0');
          break;
        }
        case 'age': {
          if (!person.birthDate || !currentDate) {
            sortValue = 0;
          } else {
            sortValue = calculateAge(person.birthDate, currentDate) || 0;
          }
          break;
        }
        case 'art': {
          const art = person.whiteTagsNEW?.['ART'];
          sortValue = art ? parseFloat(art.value) : 0;
          break;
        }
        case 'com': {
          const com = person.whiteTagsNEW?.['COM'];
          sortValue = com ? parseFloat(com.value) : 0;
          break;
        }
        default:
          sortValue = 0;
      }

      return { person, sortValue };
    });

    withSortValues.sort((a, b) => {
      const comparison = a.sortValue - b.sortValue;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return withSortValues.map(item => item.person);
  }, [filteredPersons, sortField, sortOrder, currentDate]);

  const handlePersonUpdate = useCallback((personId: string | number, field: string, value: number | null) => {
    setAllPersons(prev => prev.map(p => 
      p.id === personId ? PersonStateUpdater.updateField(p, field, value) : p
    ));
    debouncedSave(`${personId}-${field}`, String(personId), field, value);
  }, [debouncedSave]);

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
          nameStrings={nameStrings}
          onUpdate={handlePersonUpdate}
          onTraitAdd={handleTraitAdd}
          onTraitRemove={handleTraitRemove}
        />
      )}
    </div>
  );
}