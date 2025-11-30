import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  saveManager,
  StudioUtils,
  PersonFilters,
  PersonSorter,
  PersonStateUpdater,
  NameSearcher,
  type SortField,
  type SortOrder,
  type GenderFilter,
  type ShadyFilter,
  type Person,
} from '@/lib';
import { useNameTranslation } from './useNameTranslation';

interface FilterConfig {
  selectedFilters: string[];
  search: string;
  genderFilter: GenderFilter;
  shadyFilter: ShadyFilter;
}

interface SortConfig {
  sortField: SortField;
  sortOrder: SortOrder;
  currentDate: string;
}

export function useProfessionData(
  profession: string,
  fileKey: string | null,
  selectedLanguage: string,
  filterConfig: FilterConfig,
  sortConfig: SortConfig
) {
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const professionLower = profession.toLowerCase();

  const { nameStrings, error: nameError, reload: reloadNames } = useNameTranslation(selectedLanguage);
  const nameSearcher = useMemo(() => new NameSearcher(nameStrings), [nameStrings]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Loading
  // ─────────────────────────────────────────────────────────────────────────────

  const loadPersons = useCallback(async () => {
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

  useEffect(() => {
    if (fileKey) loadPersons();
  }, [fileKey, loadPersons]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtering & Sorting
  // ─────────────────────────────────────────────────────────────────────────────

  const availableStudios = useMemo(() => {
    const studios = new Set<string>();
    for (const p of allPersons) {
      const studioId = StudioUtils.normalizeId(p.studioId);
      if (studioId !== 'N/A' && studioId !== 'PL') {
        studios.add(studioId);
      }
    }
    return Array.from(studios).sort();
  }, [allPersons]);

  const persons = useMemo(() => {
    if (allPersons.length === 0) return [];

    const config = {
      ...PersonFilters.parseSelectedFilters(filterConfig.selectedFilters),
      search: filterConfig.search,
      gender: filterConfig.genderFilter,
      shady: filterConfig.shadyFilter,
    };

    const filtered = PersonFilters.applyAll(
      allPersons,
      config,
      nameStrings.length > 0 ? nameStrings : undefined
    );

    return PersonSorter.sort(filtered, sortConfig.sortField, sortConfig.sortOrder, {
      currentDate: sortConfig.currentDate,
    });
  }, [allPersons, filterConfig, sortConfig, nameStrings, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Person Updates
  // ─────────────────────────────────────────────────────────────────────────────

  const updatePersonLocal = useCallback(
    (personId: string | number, updater: (person: Person) => Person) => {
      setAllPersons(prev => prev.map(p => (p.id === personId ? updater(p) : p)));
    },
    []
  );

  const handlePersonUpdate = useCallback(
    (personId: string | number, field: string, value: number | null) => {
      updatePersonLocal(personId, p => PersonStateUpdater.updateField(p, field, value));
    },
    [updatePersonLocal]
  );

  const handleStringFieldUpdate = useCallback(
    (personId: string | number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => {
      updatePersonLocal(personId, p => PersonStateUpdater.updateStringField(p, field, value));

      const updateValue = field === 'customName' ? (value ?? '') : value;
      saveManager
        .updatePerson(profession, String(personId), { [field]: updateValue })
        .catch(err => console.error(`Failed to update ${field}:`, err));
    },
    [profession, updatePersonLocal]
  );

  const handleTraitAdd = useCallback(
    (personId: string | number, trait: string) => {
      updatePersonLocal(personId, p => PersonStateUpdater.addTrait(p, trait));

      saveManager
        .updatePerson(profession, String(personId), { addTrait: trait })
        .catch(err => console.error('Failed to add trait:', err));
    },
    [profession, updatePersonLocal]
  );

  const handleTraitRemove = useCallback(
    (personId: string | number, trait: string) => {
      updatePersonLocal(personId, p => PersonStateUpdater.removeTrait(p, trait));

      saveManager
        .updatePerson(profession, String(personId), { removeTrait: trait })
        .catch(err => console.error('Failed to remove trait:', err));
    },
    [profession, updatePersonLocal]
  );

  const handlePortraitUpdate = useCallback(
    (personId: string | number, portraitId: number) => {
      updatePersonLocal(personId, p => ({ ...p, portraitBaseId: portraitId }));

      saveManager
        .updatePerson(profession, String(personId), { portraitBaseId: portraitId })
        .catch(err => console.error('Failed to update portrait:', err));
    },
    [profession, updatePersonLocal]
  );

  return {
    allPersons,
    persons,
    loading,
    error: error || nameError,
    nameSearcher,
    availableStudios,
    reloadNames,
    loadPersons,
    refresh,
    handlePersonUpdate,
    handleStringFieldUpdate,
    handleTraitAdd,
    handleTraitRemove,
    handlePortraitUpdate,
  };
}