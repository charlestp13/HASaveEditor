import { memo } from 'react';
import { CharacterCard } from './CharacterCard';
import type { Person } from '@/lib/types';
import type { NameSearcher } from '@/lib/name-searcher';

interface CharacterListProps {
  persons: Person[];
  currentDate: string;
  nameSearcher: NameSearcher;
  onUpdate: (personId: string | number, field: string, value: number | null) => void;
  onStringFieldUpdate: (personId: string | number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => void;
  onTraitAdd: (personId: string | number, trait: string) => void;
  onTraitRemove: (personId: string | number, trait: string) => void;
}

export const CharacterList = memo(function CharacterList({
  persons,
  currentDate,
  nameSearcher,
  onUpdate,
  onStringFieldUpdate,
  onTraitAdd,
  onTraitRemove,
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
          onTraitAdd={(trait) => onTraitAdd(person.id, trait)}
          onTraitRemove={(trait) => onTraitRemove(person.id, trait)}
        />
      ))}
    </div>
  );
});