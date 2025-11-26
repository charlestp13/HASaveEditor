import { useState, useEffect, useMemo, useCallback } from 'react';
import { saveManager } from '@/lib/tauri-api';
import { normalizeStudioId } from '@/lib/utils';
import { PersonStateUpdater } from '@/lib/person-state-updater';
import { PersonFilters } from '@/lib/person-filters';
import { Input } from '@/components/ui/input';
import { FilterPopover } from '@/components/FilterPopover';
import { CharacterCard } from '@/components/CharacterCard';
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
}

export function ProfessionTab({ profession, selectedLanguage, saveInfo }: ProfessionTabProps) {
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['Dead', 'Locked']);

  const professionLower = profession.toLowerCase();
  
  const handleError = useCallback((err: unknown, fallback: string) => 
    setError(err instanceof Error ? err.message : fallback), []);

  const { nameStrings, getTranslatedName, error: nameError, reload: reloadNames } = useNameTranslation(selectedLanguage);
  
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
      const { open } = await import('@tauri-apps/plugin-dialog');
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

  const persons = useMemo(() => {
    const filterConfig = PersonFilters.parseSelectedFilters(selectedFilters);
    const filtered = PersonFilters.applyAll(
      allPersons, 
      { ...filterConfig, search }, 
      getTranslatedName
    );
    return PersonFilters.sortByName(filtered, getTranslatedName);
  }, [allPersons, search, selectedFilters, getTranslatedName]);

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

  if (loading) {
    return <LoadingSpinner message={`Loading ${professionLower}s...`} />;
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

  const hasFilters = search || selectedFilters.length > 0;
  const emptyMessage = hasFilters
    ? `No ${professionLower}s found${search ? ` matching "${search}"` : ''}`
    : `No ${professionLower}s in this save file`;

  if (!saveInfo) {
    return <EmptyState message="No save file loaded" />;
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
        />
        <FilterPopover
          playerStudioName={saveInfo.player_studio_name}
          playerLogoId={saveInfo.studio_logo_id}
          availableStudios={availableStudios}
          selectedFilters={selectedFilters}
          onFilterChange={setSelectedFilters}
          className="ml-auto"
        />
      </div>

      {persons.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {persons.map((person) => (
            <CharacterCard
              key={person.id}
              character={person}
              currentDate={currentDate}
              nameStrings={nameStrings}
              onUpdate={(field, value) => handlePersonUpdate(person.id, field, value)}
              onTraitAdd={(trait) => handleTraitAdd(person.id, trait)}
              onTraitRemove={(trait) => handleTraitRemove(person.id, trait)}
            />
          ))}
        </div>
      )}
    </div>
  );
}