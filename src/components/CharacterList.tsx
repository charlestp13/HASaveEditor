import { memo, forwardRef, useMemo } from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { CharacterCard } from './CharacterCard';
import type { Person, NameSearcher } from '@/lib';

interface CharacterListProps {
  persons: Person[];
  currentDate: string;
  nameSearcher: NameSearcher;
  onUpdate: (personId: number, field: string, value: number | null) => void;
  onStringFieldUpdate: (personId: number, field: 'firstNameId' | 'lastNameId' | 'customName', value: string | null) => void;
  onEditTraits?: (personId: number) => void;
  onEditGenres?: (personId: number) => void;
  onEditPortrait?: (personId: number) => void;
}

const gridComponents = {
  List: forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ style, children, ...props }, ref) => (
      <div
        ref={ref}
        {...props}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
          gap: '0.5rem',
          padding: '0.5rem',
          ...style,
        }}
        className="sm:grid-cols-2! lg:grid-cols-3! xl:grid-cols-4!"
      >
        {children}
      </div>
    )
  ),
  Item: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>
      {children}
    </div>
  ),
  Footer: () => <div style={{ height: 100 }} />,
};

gridComponents.List.displayName = 'GridList';

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
  const itemContent = useMemo(() => {
    return (index: number) => {
      const person = persons[index];
      if (!person) return null;
      
      return (
        <CharacterCard
          key={person.id}
          character={person}
          personId={person.id}
          currentDate={currentDate}
          nameSearcher={nameSearcher}
          onUpdate={onUpdate}
          onStringFieldUpdate={onStringFieldUpdate}
          onEditTraits={onEditTraits}
          onEditGenres={onEditGenres}
          onEditPortrait={onEditPortrait}
        />
      );
    };
  }, [persons, currentDate, nameSearcher, onUpdate, onStringFieldUpdate, onEditTraits, onEditGenres, onEditPortrait]);

  if (persons.length === 0) {
    return null;
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      totalCount={persons.length}
      overscan={200}
      components={gridComponents}
      itemContent={itemContent}
    />
  );
});