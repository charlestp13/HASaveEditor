import { useMemo } from 'react';
import { PersonUtils } from '@/lib/utils';
import { DISPLAYABLE_TRAITS } from '@/lib/character-traits';
import type { Person } from '@/lib/types';

export function useCharacterComputed(character: Person) {
  return useMemo(() => {
    const isDead = PersonUtils.isDead(character);
    const isBusy = PersonUtils.isBusy(character);
    const professionName = PersonUtils.getProfessionName(character);
    const professionValue = PersonUtils.getProfessionValue(character);
    
    const displayableTraits = character.labels?.filter(
      trait => DISPLAYABLE_TRAITS.includes(trait as typeof DISPLAYABLE_TRAITS[number])
    ) || [];
    
    const art = PersonUtils.getArt(character);
    const com = PersonUtils.getCom(character);
    const isActorOrDirector = professionName === 'Actor' || professionName === 'Director';
    
    const skillEntries = PersonUtils.getSkillEntries(character).filter(
      s => s.id !== 'ART' && s.id !== 'COM'
    );
    
    const canEditTraits = professionName !== 'Agent' && professionName !== 'Executive';

    return {
      isDead,
      isBusy,
      professionName,
      professionValue,
      displayableTraits,
      art,
      com,
      isActorOrDirector,
      skillEntries,
      canEditTraits,
    };
  }, [
    character.deathDate,
    character.activeOrPlannedMovies,
    character.professions,
    character.labels,
    character.whiteTagsNEW,
  ]);
}
