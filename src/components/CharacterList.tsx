import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useState, useEffect } from 'react';
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

const VIRTUALIZATION_THRESHOLD = 150;

export function CharacterList({
  persons,
  currentDate,
  nameSearcher,
  onUpdate,
  onStringFieldUpdate,
  onTraitAdd,
  onTraitRemove,
}: CharacterListProps) {
  if (persons.length < VIRTUALIZATION_THRESHOLD) {
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
  }

  return (
    <VirtualizedGrid
      persons={persons}
      currentDate={currentDate}
      nameSearcher={nameSearcher}
      onUpdate={onUpdate}
      onStringFieldUpdate={onStringFieldUpdate}
      onTraitAdd={onTraitAdd}
      onTraitRemove={onTraitRemove}
    />
  );
}

function VirtualizedGrid({
  persons,
  currentDate,
  nameSearcher,
  onUpdate,
  onStringFieldUpdate,
  onTraitAdd,
  onTraitRemove,
}: CharacterListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setContainerWidth(parentRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const columns = useMemo(() => {
    const CARD_MIN_WIDTH = 270;
    const GAP = 8;
    const availableWidth = containerWidth - (GAP * 2);
    const cols = Math.max(1, Math.floor(availableWidth / (CARD_MIN_WIDTH + GAP)));
    return Math.min(cols, 4);
  }, [containerWidth]);

  const rows = useMemo(() => {
    const rowsData: Person[][] = [];
    for (let i = 0; i < persons.length; i += columns) {
      rowsData.push(persons.slice(i, i + columns));
    }
    return rowsData;
  }, [persons, columns]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current?.parentElement || null,
    estimateSize: () => 450,
    overscan: 1,
  });

  return (
    <div ref={parentRef} className="w-full">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowPersons = rows[virtualRow.index];
          
          return (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gap: '8px',
                  padding: '4px 8px',
                }}
              >
                {rowPersons.map((person) => (
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
            </div>
          );
        })}
      </div>
    </div>
  );
}