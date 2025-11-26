import { useMemo } from 'react';
import { PersonUtils } from '@/lib/utils';
import { DISPLAYABLE_TRAITS } from '@/lib/character-traits';
import { GENRES } from '@/lib/character-genres';
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
    
    // Use getWhiteTagValue consistently for all whiteTags
    const art = PersonUtils.getWhiteTagValue(character, 'ART');
    const com = PersonUtils.getWhiteTagValue(character, 'COM');
    const indoor = PersonUtils.getWhiteTagValue(character, 'INDOOR');
    const outdoor = PersonUtils.getWhiteTagValue(character, 'OUTDOOR');
    
    const isActorOrDirector = professionName === 'Actor' || professionName === 'Director';
    const isCinematographer = professionName === 'Cinematographer';
    
    // Pre-compute genres (filter once instead of 3 times in CharacterCard)
    const genres = PersonUtils.getSkillEntries(character)
      .filter(s => (GENRES as readonly string[]).includes(s.id))
      .map(s => ({
        id: s.id,
        value: typeof s.value === 'string' ? parseFloat(s.value) : s.value
      }));
    
    const canEditTraits = professionName !== 'Agent' && professionName !== 'Executive';

    return {
      isDead,
      isBusy,
      professionName,
      professionValue,
      displayableTraits,
      art,
      com,
      indoor,
      outdoor,
      isActorOrDirector,
      isCinematographer,
      genres,
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