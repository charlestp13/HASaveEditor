import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EditableNameField } from '@/components/EditableNameField';
import { useCharacterDates } from '@/hooks/useCharacterDates';
import { useCharacterComputed } from '@/hooks/useCharacterComputed';
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
import type { Person } from '@/lib/types';
import type { NameSearcher } from '@/lib/name-searcher';

interface CharacterCardProps {
  character: Person;
  currentDate: string;
  nameSearcher: NameSearcher;
  onClick?: () => void;
  isSelected?: boolean;
  onUpdate?: (field: string, value: number | null) => void;
  onNameUpdate?: (field: 'firstNameId' | 'lastNameId', nameId: string) => void;
  onTraitAdd?: (trait: string) => void;
  onTraitRemove?: (trait: string) => void;
}

export const CharacterCard = memo(function CharacterCard({ 
  character, 
  currentDate, 
  nameSearcher,
  onClick,
  isSelected = false,
  onUpdate,
  onNameUpdate,
  onTraitAdd,
  onTraitRemove
}: CharacterCardProps) {
  const { age, birthParsed, deathParsed, contractDaysLeft } = useCharacterDates(character, currentDate);
  const {
    isDead,
    isBusy,
    professionName,
    professionValue,
    displayableTraits,
    art,
    com,
    indoor,
    outdoor,
    canEditStatus,
    canEditSettings,
    canEditGenres,
    canEditTraits,
    genres,
  } = useCharacterComputed(character);

  const firstName = nameSearcher.getNameById(parseInt(character.firstNameId || '0', 10)) || character.firstNameId || '';
  const lastName = nameSearcher.getNameById(parseInt(character.lastNameId || '0', 10)) || character.lastNameId || '';

  return (
    <Card 
      className={`cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isDead ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <EditableNameField
                value={firstName}
                currentId={character.firstNameId || '0'}
                nameSearcher={nameSearcher}
                onSelect={(nameId) => {
                  onNameUpdate?.('firstNameId', nameId);
                }}
                placeholder="Search..."
              />
              <EditableNameField
                value={lastName}
                currentId={character.lastNameId || '0'}
                nameSearcher={nameSearcher}
                onSelect={(nameId) => {
                  onNameUpdate?.('lastNameId', nameId);
                }}
                placeholder="Search..."
              />
            </div>
            <p className="text-sm text-muted-foreground">{professionName}</p>
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
          professionValue={professionValue}
          limit={Number(character.limit ?? 1)}
          onUpdate={onUpdate}
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
        />

        {canEditTraits && (
          <TraitsSection
            labels={character.labels}
            displayableTraits={displayableTraits}
            onTraitAdd={onTraitAdd}
            onTraitRemove={onTraitRemove}
          />
        )}

        {canEditStatus && (
          <StatusSection
            art={art}
            com={com}
            professionName={professionName}
            onUpdate={onUpdate}
          />
        )}

        {canEditSettings && (
          <SettingsSection
            indoor={indoor || 0}
            outdoor={outdoor || 0}
            onUpdate={onUpdate}
          />
        )}

        {canEditGenres && (
          <GenresSection genres={genres} onUpdate={onUpdate} />
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
  
  const p = prev.character;
  const n = next.character;
  
  if (p.firstNameId !== n.firstNameId) return false;
  if (p.lastNameId !== n.lastNameId) return false;
  if (p.mood !== n.mood) return false;
  if (p.attitude !== n.attitude) return false;
  if (p.limit !== n.limit) return false;
  
  const pProf = p.professions ? Object.values(p.professions)[0] : null;
  const nProf = n.professions ? Object.values(n.professions)[0] : null;
  if (pProf !== nProf) return false;
  
  // Check all whiteTagsNEW (ART, COM, and all genres)
  const pTags = JSON.stringify(p.whiteTagsNEW);
  const nTags = JSON.stringify(n.whiteTagsNEW);
  if (pTags !== nTags) return false;
  
  const pLabels = p.labels?.join(',') ?? '';
  const nLabels = n.labels?.join(',') ?? '';
  if (pLabels !== nLabels) return false;
  
  return true;
});