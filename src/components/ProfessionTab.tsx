import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { RefreshCw } from 'lucide-react';
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
import { usePersonUpdates } from '@/hooks/usePersonUpdates';
import {
  saveManager,
  StudioUtils,
  PersonStateUpdater,
  PersonFilters,
  PersonSorter,
  NameSearcher,
  type SortField,
  type SortOrder,
  type GenderFilter,
  type ShadyFilter,
  type Person,
  type SaveInfo,
} from '@/lib';

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Types
// ─────────────────────────────────────────────────────────────────────────────

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
  genderFilter: GenderFilter;
  onGenderFilterChange: (filter: GenderFilter) => void;
  shadyFilter: ShadyFilter;
  onShadyFilterChange: (filter: ShadyFilter) => void;
  usedPortraits: Map<number, UsedPortrait>;
  onPortraitChange?: (oldPortraitId: number | undefined, newPortraitId: number, characterName: string, profession: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function isTalentProfession(profession: string): boolean {
  return profession !== 'Agent' && 
    !profession.startsWith('Lieut') && 
    !profession.startsWith('Cpt');
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

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
  onPortraitChange,
}: ProfessionTabProps) {
  // ───────────────────────────────────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────────────────────────────────
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPortraitPersonId, setEditingPortraitPersonId] = useState<string | number | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // Derived Values
  // ───────────────────────────────────────────────────────────────────────────
  const currentDate = saveInfo?.current_date ?? '';
  const professionLower = profession.toLowerCase();
  const canEditPortraits = isTalentProfession(profession);

  // ───────────────────────────────────────────────────────────────────────────
  // Hooks
  // ───────────────────────────────────────────────────────────────────────────
  const handleError = useCallback(
    (err: unknown, fallback: string) => setError(err instanceof Error ? err.message : fallback),
    []
  );

  const { nameStrings, error: nameError, reload: reloadNames } = useNameTranslation(selectedLanguage);
  const nameSearcher = useMemo(() => new NameSearcher(nameStrings), [nameStrings]);

  const {
    handlePersonUpdate: handlePersonUpdateBase,
    handleStringFieldUpdate,
    handleTraitAdd,
    handleTraitRemove,
    handlePortraitChange: handlePortraitChangeBase,
  } = usePersonUpdates({ profession, setAllPersons, onError: handleError });

  const savePerson = useCallback(
    (personId: string, field: string, value: number | null) => {
      if (field.startsWith('whiteTag:') && field !== 'whiteTag:ART' && field !== 'whiteTag:COM') {
        const genre = field.substring(9);
        return saveManager.updatePerson(profession, personId, 
          value === null ? { removeGenre: genre } : { addGenre: genre }
        );
      }
      const updateField = PersonStateUpdater.normalizeFieldName(field);
      return saveManager.updatePerson(profession, personId, { [updateField]: value });
    },
    [profession]
  );

  const { debouncedSave } = useDebouncedSave(savePerson, 300);

  // ───────────────────────────────────────────────────────────────────────────
  // Data Loading
  // ───────────────────────────────────────────────────────────────────────────
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

  // ───────────────────────────────────────────────────────────────────────────
  // Filtering & Sorting
  // ───────────────────────────────────────────────────────────────────────────
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

    const filterConfig = {
      ...PersonFilters.parseSelectedFilters(selectedFilters),
      search,
      gender: genderFilter,
      shady: shadyFilter,
    };

    const filtered = PersonFilters.applyAll(
      allPersons,
      filterConfig,
      nameStrings.length > 0 ? nameStrings : undefined
    );

    return PersonSorter.sort(filtered, sortField, sortOrder, { currentDate });
  }, [allPersons, search, selectedFilters, nameStrings, genderFilter, shadyFilter, sortField, sortOrder, currentDate, refreshKey]);

  // ───────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ───────────────────────────────────────────────────────────────────────────
  const handlePersonUpdate = useCallback(
    (personId: string | number, field: string, value: number | null) => {
      handlePersonUpdateBase(personId, field, value);
      debouncedSave(`${personId}-${field}`, String(personId), field, value);
    },
    [handlePersonUpdateBase, debouncedSave]
  );

  const handlePortraitChange = useCallback(
    (personId: string | number, portraitId: number) => {
      const person = allPersons.find(p => p.id === personId);
      if (person) {
        const firstName = nameSearcher.getNameById(parseInt(person.firstNameId || '0', 10)) || '';
        const lastName = nameSearcher.getNameById(parseInt(person.lastNameId || '0', 10)) || '';
        const characterName = `${firstName} ${lastName}`.trim() || `ID ${person.id}`;
        onPortraitChange?.(person.portraitBaseId, portraitId, characterName, profession);
      }
      handlePortraitChangeBase(personId, portraitId);
      setEditingPortraitPersonId(null);
    },
    [handlePortraitChangeBase, allPersons, nameSearcher, onPortraitChange, profession]
  );

  const handleSelectGamePath = useCallback(async () => {
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
  }, [reloadNames, handleError]);

  // ───────────────────────────────────────────────────────────────────────────
  // Derived Display Values
  // ───────────────────────────────────────────────────────────────────────────
  const editingPerson = useMemo(
    () => (editingPortraitPersonId ? allPersons.find(p => p.id === editingPortraitPersonId) ?? null : null),
    [editingPortraitPersonId, allPersons]
  );

  const displayError = error || nameError;
  const isGamePathError = displayError?.includes('Game installation not found') ||
    displayError?.includes('Browse for Game Folder') ||
    displayError?.includes('verify the game installation path');

  const hasFilters = search || selectedFilters.length > 0;
  const emptyMessage = hasFilters
    ? `No ${professionLower}s found${search ? ` matching "${search}"` : ''}`
    : `No ${professionLower}s in this save file`;

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────
  if (!saveInfo) {
    return <EmptyState message="No save file loaded" />;
  }

  if (displayError) {
    return (
      <ErrorState
        title={isGamePathError ? 'Game Installation Not Found' : `Failed to load ${professionLower}s`}
        message={displayError}
        onRetry={loadPersons}
        onBrowse={isGamePathError ? handleSelectGamePath : undefined}
        browseLabel="Browse for Game Folder"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        professionLower={professionLower}
        loading={loading}
        personCount={persons.length}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
        onRefresh={() => setRefreshKey(k => k + 1)}
        saveInfo={saveInfo}
        availableStudios={availableStudios}
        selectedFilters={selectedFilters}
        onFiltersChange={onFiltersChange}
        genderFilter={genderFilter}
        onGenderFilterChange={onGenderFilterChange}
        shadyFilter={shadyFilter}
        onShadyFilterChange={onShadyFilterChange}
      />

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
          onEditPortrait={canEditPortraits ? (id) => setEditingPortraitPersonId(id) : undefined}
        />
      )}

      {canEditPortraits && editingPerson && (
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

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar Subcomponent
// ─────────────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  professionLower: string;
  loading: boolean;
  personCount: number;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onRefresh: () => void;
  saveInfo: SaveInfo;
  availableStudios: string[];
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  genderFilter: GenderFilter;
  onGenderFilterChange: (filter: GenderFilter) => void;
  shadyFilter: ShadyFilter;
  onShadyFilterChange: (filter: ShadyFilter) => void;
}

const Toolbar = memo(function Toolbar({
  search,
  onSearchChange,
  professionLower,
  loading,
  personCount,
  sortField,
  sortOrder,
  onSortChange,
  onRefresh,
  saveInfo,
  availableStudios,
  selectedFilters,
  onFiltersChange,
  genderFilter,
  onGenderFilterChange,
  shadyFilter,
  onShadyFilterChange,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        type="text"
        placeholder={`Search ${professionLower}s...`}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
        disabled={loading}
      />
      
      <div className="text-sm text-muted-foreground">
        {loading ? (
          <>Loading...</>
        ) : (
          <>
            Found: <span className="font-semibold text-foreground">{personCount}</span>{' '}
            {professionLower}{personCount !== 1 ? 's' : ''}
          </>
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
            onClick={onRefresh}
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
  );
});