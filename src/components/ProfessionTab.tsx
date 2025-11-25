import { useState, useEffect, useMemo, useCallback } from 'react';
import { saveManager } from '@/lib/tauri-api';
import { normalizeStudioId, createWhiteTag, PersonUtils } from '@/lib/utils';
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
      let updateField = field;
      if (field === 'whiteTag:ART') updateField = 'art';
      else if (field === 'whiteTag:COM') updateField = 'com';
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
  }, [profession, handleError]);

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
    let filtered = allPersons;

    // Filter by studios
    const studioFilters = selectedFilters.filter(f => ['PL', 'GB', 'EM', 'SU', 'HE', 'MA'].includes(f));
    if (studioFilters.length > 0) {
      filtered = filtered.filter(person => {
        const studioId = normalizeStudioId(person.studioId);
        return !studioFilters.includes(studioId);
      });
    }

    // Filter by status
    if (selectedFilters.includes('Dead')) {
      filtered = filtered.filter(person => !PersonUtils.isDead(person));
    }

    if (selectedFilters.includes('Locked')) {
      filtered = filtered.filter(person => !PersonUtils.isLocked(person));
    }

    if (selectedFilters.includes('Unemployed')) {
      filtered = filtered.filter(person => normalizeStudioId(person.studioId) !== 'N/A');
    }

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(person =>
        getTranslatedName(person).toLowerCase().includes(lowerSearch)
      );
    }

    return [...filtered].sort((a, b) => 
      getTranslatedName(a).localeCompare(getTranslatedName(b))
    );
  }, [allPersons, search, selectedFilters, getTranslatedName]);

  const handlePersonUpdate = (personId: string | number, field: string, value: number | null) => {
    setAllPersons(prev => prev.map(p => {
      if (p.id !== personId) return p;

      const updated = { ...p };
      if (field === 'mood') updated.mood = value ?? 0;
      else if (field === 'attitude') updated.attitude = value ?? 0;
      else if (field === 'skill' && updated.professions) {
        const profName = Object.keys(updated.professions)[0];
        if (profName) {
          updated.professions = { ...updated.professions, [profName]: String(value ?? 0) };
        }
      }
      else if (field === 'limit') {
        updated.limit = value ?? 0;
        updated.Limit = value ?? 0;
      }
      else if (field.startsWith('whiteTag:')) {
        const tagId = field.split(':')[1];
        if (value === null) {
          if (updated.whiteTagsNEW && typeof updated.whiteTagsNEW === 'object') {
            updated.whiteTagsNEW = { ...updated.whiteTagsNEW };
            delete updated.whiteTagsNEW[tagId];
          }
        } else {
          if (!updated.whiteTagsNEW || typeof updated.whiteTagsNEW !== 'object') {
            updated.whiteTagsNEW = {};
          }
          updated.whiteTagsNEW = { ...updated.whiteTagsNEW };
          if (updated.whiteTagsNEW[tagId]) {
            updated.whiteTagsNEW[tagId] = { ...updated.whiteTagsNEW[tagId], value };
          } else {
            updated.whiteTagsNEW[tagId] = createWhiteTag(tagId, value);
          }
        }
      }
      return updated;
    }));

    debouncedSave(`${personId}-${field}`, String(personId), field, value);
  };

  const handleTraitAdd = (personId: string | number, trait: string) => {
    setAllPersons(prev => prev.map(p => {
      if (p.id !== personId) return p;
      const currentLabels = p.labels || [];
      if (currentLabels.includes(trait)) return p;
      return { ...p, labels: [trait, ...currentLabels] };
    }));

    saveManager.updatePerson(profession, String(personId), { addTrait: trait })
      .catch(err => handleError(err, 'Failed to add trait'));
  };

  const handleTraitRemove = (personId: string | number, trait: string) => {
    setAllPersons(prev => prev.map(p => {
      if (p.id !== personId) return p;
      const currentLabels = p.labels || [];
      return { ...p, labels: currentLabels.filter(t => t !== trait) };
    }));

    saveManager.updatePerson(profession, String(personId), { removeTrait: trait })
      .catch(err => handleError(err, 'Failed to remove trait'));
  };

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