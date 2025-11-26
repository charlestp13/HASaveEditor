import { useMemo } from 'react';
import { GameDate } from '@/lib/utils';
import type { Person } from '@/lib/types';

export function useCharacterDates(character: Person, currentDate: string) {
  return useMemo(() => {
    const birthParsed = character.birthDate ? GameDate.fromDDMMYYYY(character.birthDate) : null;
    const deathParsed = character.deathDate ? GameDate.fromDDMMYYYY(character.deathDate) : null;
    
    let age: number | null = null;
    if (birthParsed && currentDate) {
      const current = GameDate.parse(currentDate);
      if (current) {
        age = birthParsed.ageTo(current);
      }
    }

    let contractDaysLeft: number | null = null;
    if (character.contract && currentDate) {
      const current = GameDate.parse(currentDate);
      if (current) {
        const signing = new Date(character.contract.dateOfSigning);
        const ending = new Date(signing);
        ending.setFullYear(ending.getFullYear() + character.contract.amount);
        contractDaysLeft = current.daysUntil(GameDate.fromDate(ending));
      }
    }

    return { age, birthParsed, deathParsed, contractDaysLeft };
  }, [character.birthDate, character.deathDate, character.contract, currentDate]);
}
