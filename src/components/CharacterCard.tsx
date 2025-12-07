import { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EditableNameField } from '@/components/EditableNameField';
import { EditableTextField } from '@/components/EditableTextField';
import { useCharacterData } from '@/hooks/useCharacterData';
import {
  StatsSection,
  InfoSection,
  TraitsSection,
  StatusSection,
  SettingsSection,
  GenresSection,
  ContractSection,
  SinsSection,
} from '@/components/character-sections';
import type { Person, NameSearcher } from '@/lib';

interface CharacterCardProps {
  character: Person;
  personId: string | number;
  currentDate: string;
  nameSearcher: NameSearcher;
  onClick?: () => void;
  isSelected?: boolean;
  onUpdate?: (personId: string | number, field: string, value: number | null) => void;
  onStringFieldUpdate?: (personId: string | number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => void;
  onEditTraits?: (personId: string | number) => void;
  onEditGenres?: (personId: string | number) => void;
  onEditPortrait?: (personId: string | number) => void;
}

export const CharacterCard = memo(function CharacterCard({ 
  character,
  personId,
  currentDate, 
  nameSearcher,
  onClick,
  isSelected = false,
  onUpdate,
  onStringFieldUpdate,
  onEditTraits,
  onEditGenres,
  onEditPortrait,
}: CharacterCardProps) {
  const {
    age,
    birthParsed,
    deathParsed,
    contractDaysLeft,
    isDead,
    isBusy,
    professionName,
    professionValue,
    art,
    com,
    indoor,
    outdoor,
    displayableTraits,
    genres,
    canEditStatus,
    canEditSettings,
    canEditGenres,
    canEditTraits,
  } = useCharacterData(character, currentDate);

  const firstName = nameSearcher.getNameById(parseInt(character.firstNameId || '0', 10)) || character.firstNameId || '';
  const lastName = nameSearcher.getNameById(parseInt(character.lastNameId || '0', 10)) || character.lastNameId || '';

  const handleUpdate = useCallback(
    (field: string, value: number | null) => onUpdate?.(personId, field, value),
    [onUpdate, personId]
  );

  const handleStringFieldUpdate = useCallback(
    (field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => onStringFieldUpdate?.(personId, field, value),
    [onStringFieldUpdate, personId]
  );

  const handleEditTraits = useCallback(
    () => onEditTraits?.(personId),
    [onEditTraits, personId]
  );

  const handleEditGenres = useCallback(
    () => onEditGenres?.(personId),
    [onEditGenres, personId]
  );

  const handleEditPortrait = useCallback(
    () => onEditPortrait?.(personId),
    [onEditPortrait, personId]
  );

  return (
    <Card 
      className={`transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isDead ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <EditableNameField
                value={firstName}
                currentId={character.firstNameId || '0'}
                nameSearcher={nameSearcher}
                onSelect={(nameId) => handleStringFieldUpdate('firstNameId', nameId)}
                placeholder="Search..."
              />
              <EditableNameField
                value={lastName}
                currentId={character.lastNameId || '0'}
                nameSearcher={nameSearcher}
                onSelect={(nameId) => handleStringFieldUpdate('lastNameId', nameId)}
                placeholder="Search..."
              />
            </div>
            <EditableTextField
              value={character.customName}
              onChange={(value) => handleStringFieldUpdate('customName', value)}
              placeholder="Custom Name"
            />
            <div className="text-sm text-muted-foreground">{professionName}</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono">ID: {character.id}</div>
            <div className="text-muted-foreground">Age: {age}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <StatsSection
          mood={Number(character.mood ?? 0)}
          attitude={Number(character.attitude ?? 0)}
          selfEsteem={Number(character.selfEsteem ?? 0)}
          professionValue={professionValue}
          limit={Number(character.limit ?? 1)}
          onUpdate={handleUpdate}
        />

        <InfoSection
          studioId={character.studioId}
          state={character.state}
          isBusy={isBusy}
          gender={character.gender}
          birthParsed={birthParsed}
          isDead={isDead}
          deathParsed={deathParsed}
          professions={character.professions || {}}
          portraitBaseId={character.portraitBaseId}
          onEditPortrait={handleEditPortrait}
        />

        {canEditTraits && (
          <TraitsSection
            labels={character.labels}
            displayableTraits={displayableTraits}
            onEditTraits={handleEditTraits}
          />
        )}

        {canEditStatus && (
          <StatusSection
            art={art}
            com={com}
            professionName={professionName}
            onUpdate={handleUpdate}
          />
        )}

        {canEditSettings && (
          <SettingsSection
            indoor={indoor || 0}
            outdoor={outdoor || 0}
            onUpdate={handleUpdate}
          />
        )}

        {canEditGenres && (
          <GenresSection genres={genres} onEditGenres={handleEditGenres} />
        )}

        {character.contract && (
          <ContractSection
            contract={character.contract}
            contractDaysLeft={contractDaysLeft}
          />
        )}

        {character.aSins && character.aSins.length > 0 && (
          <SinsSection aSins={character.aSins} />
        )}
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  if (prev.isSelected !== next.isSelected) return false;
  if (prev.personId !== next.personId) return false;
  
  const p = prev.character;
  const n = next.character;
  
  if (p.firstNameId !== n.firstNameId) return false;
  if (p.lastNameId !== n.lastNameId) return false;
  if (p.customName !== n.customName) return false;
  if (p.mood !== n.mood) return false;
  if (p.attitude !== n.attitude) return false;
  if (p.selfEsteem !== n.selfEsteem) return false;
  if (p.limit !== n.limit) return false;
  if (p.portraitBaseId !== n.portraitBaseId) return false;
  
  const pProf = p.professions ? Object.values(p.professions)[0] : null;
  const nProf = n.professions ? Object.values(n.professions)[0] : null;
  if (pProf !== nProf) return false;
  
  const pTags = JSON.stringify(p.whiteTagsNEW);
  const nTags = JSON.stringify(n.whiteTagsNEW);
  if (pTags !== nTags) return false;
  
  const pLabels = p.labels?.join(',') ?? '';
  const nLabels = n.labels?.join(',') ?? '';
  if (pLabels !== nLabels) return false;
  
  return true;
});