import { useState, useMemo, useCallback, memo } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterPopover } from '@/components/FilterPopover';
import { SortPopover } from '@/components/SortPopover';
import { CharacterList } from '@/components/CharacterList';
import { PortraitEditorDialog } from '@/components/PortraitEditorDialog';
import { TraitAdjuster } from '@/components/TraitAdjuster';
import { GenreAdjuster } from '@/components/GenreAdjuster';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useProfessionData } from '@/hooks/useProfessionData';
import { useDebouncedSave } from '@/hooks/useDebouncedSave';
import {
  saveManager,
  PersonStateUpdater,
  PersonUtils,
  type SortField,
  type SortOrder,
  type GenderFilter,
  type ShadyFilter,
  type SaveInfo,
} from '@/lib';

interface UsedPortrait {
  characterName: string;
  profession: string;
}

interface ProfessionTabProps {
  profession: string;
  selectedLanguage: string;
  saveInfo: SaveInfo | null;
  fileKey: string | null;
  isActive?: boolean;
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

export const ProfessionTab = memo(function ProfessionTab({
  profession,
  selectedLanguage,
  saveInfo,
  fileKey,
  isActive = true,
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
  const [search, setSearch] = useState('');
  const [editingPortraitPersonId, setEditingPortraitPersonId] = useState<string | number | null>(null);
  const [editingTraitsPersonId, setEditingTraitsPersonId] = useState<string | number | null>(null);
  const [editingGenresPersonId, setEditingGenresPersonId] = useState<string | number | null>(null);

  const currentDate = saveInfo?.current_date ?? '';
  const professionLower = profession.toLowerCase();

  const {
    allPersons,
    persons,
    loading,
    error,
    nameSearcher,
    availableStudios,
    reloadNames,
    loadPersons,
    refresh,
    handlePersonUpdate: handlePersonUpdateBase,
    handleStringFieldUpdate,
    handleTraitAdd,
    handleTraitRemove,
    handlePortraitUpdate,
  } = useProfessionData(
    profession,
    fileKey,
    selectedLanguage,
    { selectedFilters, search, genderFilter, shadyFilter },
    { sortField, sortOrder, currentDate }
  );

  const savePerson = useCallback(
    (personId: string, field: string, value: number | null) => {
      if (field.startsWith('whiteTag:') && field !== 'whiteTag:ART' && field !== 'whiteTag:COM') {
        const genre = field.substring(9);
        return saveManager.updatePerson(profession, personId, 
          value === null ? { removeGenre: genre } : { addGenre: genre }
        );
      }
      if (field === 'isShady') {
        return saveManager.updatePerson(profession, personId, { isShady: value === 1 });
      }
      const updateField = PersonStateUpdater.normalizeFieldName(field);
      return saveManager.updatePerson(profession, personId, { [updateField]: value });
    },
    [profession]
  );

  const { debouncedSave } = useDebouncedSave(savePerson, 300);

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
      handlePortraitUpdate(personId, portraitId);
      setEditingPortraitPersonId(null);
    },
    [handlePortraitUpdate, allPersons, nameSearcher, onPortraitChange, profession]
  );

  const openTraitsEditor = useCallback(
    (personId: string | number) => setEditingTraitsPersonId(personId),
    []
  );

  const openGenresEditor = useCallback(
    (personId: string | number) => setEditingGenresPersonId(personId),
    []
  );

  const openPortraitEditor = useCallback(
    (personId: string | number) => setEditingPortraitPersonId(personId),
    []
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
        reloadNames();
      }
    } catch (err) {
      console.error('Failed to set game path:', err);
    }
  }, [reloadNames]);

  const editingPerson = useMemo(
    () => (editingPortraitPersonId ? allPersons.find(p => p.id === editingPortraitPersonId) ?? null : null),
    [editingPortraitPersonId, allPersons]
  );

  const editingTraitsPerson = useMemo(
    () => (editingTraitsPersonId ? allPersons.find(p => p.id === editingTraitsPersonId) ?? null : null),
    [editingTraitsPersonId, allPersons]
  );

  const editingGenresPerson = useMemo(
    () => (editingGenresPersonId ? allPersons.find(p => p.id === editingGenresPersonId) ?? null : null),
    [editingGenresPersonId, allPersons]
  );

  const isGamePathError = error?.includes('Game installation not found') ||
    error?.includes('Browse for Game Folder') ||
    error?.includes('verify the game installation path');

  const hasFilters = search || selectedFilters.length > 0;
  const emptyMessage = hasFilters
    ? `No ${professionLower}s found${search ? ` matching "${search}"` : ''}`
    : `No ${professionLower}s in this save file`;

  if (!saveInfo) {
    return <EmptyState message="No save file loaded" />;
  }

  if (error) {
    return (
      <ErrorState
        title={isGamePathError ? 'Game Installation Not Found' : `Failed to load ${professionLower}s`}
        message={error}
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
        onRefresh={refresh}
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
          isActive={isActive}
          onUpdate={handlePersonUpdate}
          onStringFieldUpdate={handleStringFieldUpdate}
          onEditTraits={openTraitsEditor}
          onEditGenres={openGenresEditor}
          onEditPortrait={openPortraitEditor}
        />
      )}

      {editingTraitsPerson && (
        <TraitAdjuster
          open={!!editingTraitsPersonId}
          onOpenChange={(open) => !open && setEditingTraitsPersonId(null)}
          traits={editingTraitsPerson.labels || []}
          onAdd={(trait) => handleTraitAdd(editingTraitsPerson.id, trait)}
          onRemove={(trait) => handleTraitRemove(editingTraitsPerson.id, trait)}
        />
      )}

      {editingGenresPerson && (
        <GenreAdjuster
          open={!!editingGenresPersonId}
          onOpenChange={(open) => !open && setEditingGenresPersonId(null)}
          genres={PersonUtils.getGenresWithValues(editingGenresPerson)}
          onToggle={(genre, shouldAdd) => {
            handlePersonUpdate(editingGenresPerson.id, `whiteTag:${genre}`, shouldAdd ? 12.0 : null);
          }}
        />
      )}

      {editingPerson && (
        <PortraitEditorDialog
          open={!!editingPortraitPersonId}
          onOpenChange={(open) => !open && setEditingPortraitPersonId(null)}
          gender={editingPerson.gender!}
          currentPortraitId={editingPerson.portraitBaseId!}
          usedPortraits={usedPortraits}
          onSelectPortrait={(portraitId) => handlePortraitChange(editingPerson.id, portraitId)}
          portraitType={PersonUtils.getPortraitType(editingPerson.professions)}
        />
      )}
    </div>
  );
});

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