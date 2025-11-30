import { memo } from 'react';
import { CharacterCard } from './CharacterCard';
import type { Person, NameSearcher } from '@/lib';

interface CharacterListProps {
  persons: Person[];
  currentDate: string;
  nameSearcher: NameSearcher;
  onUpdate: (personId: string | number, field: string, value: number | null) => void;
  onStringFieldUpdate: (personId: string | number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => void;
  onEditTraits?: (personId: string | number) => void;
  onEditGenres?: (personId: string | number) => void;
  onEditPortrait?: (personId: string | number) => void;
}

export const CharacterList = memo(function CharacterList({
  persons,
  currentDate,
  nameSearcher,
  onUpdate,
  onStringFieldUpdate,
  onEditTraits,
  onEditGenres,
  onEditPortrait,
}: CharacterListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2">
      {persons.map((person) => (
        <CharacterCard
          key={person.id}
          character={person}
          currentDate={currentDate}
          nameSearcher={nameSearcher}
          onUpdate={(field, value) => onUpdate(person.id, field, value)}
          onStringFieldUpdate={(field, value) => onStringFieldUpdate(person.id, field, value)}
          onEditTraits={onEditTraits ? () => onEditTraits(person.id) : undefined}
          onEditGenres={onEditGenres ? () => onEditGenres(person.id) : undefined}
          onEditPortrait={onEditPortrait ? () => onEditPortrait(person.id) : undefined}
        />
      ))}
    </div>
  );
});