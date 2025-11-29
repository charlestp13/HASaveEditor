import { useMemo } from 'react';
import { PersonUtils } from '@/lib/utils';
import { isDisplayableTrait } from '@/lib/character-traits';
import { isGenre } from '@/lib/character-genres';
import type { Person } from '@/lib/types';

export function useCharacterComputed(character: Person) {
  return useMemo(() => {
    const isDead = PersonUtils.isDead(character);
    const isBusy = PersonUtils.isBusy(character);
    const professionName = PersonUtils.getProfessionName(character);
    const professionValue = PersonUtils.getProfessionValue(character);
    
    const displayableTraits = character.labels?.filter(isDisplayableTrait) || [];
    
    const art = PersonUtils.getWhiteTagValue(character, 'ART');
    const com = PersonUtils.getWhiteTagValue(character, 'COM');
    const indoor = PersonUtils.getWhiteTagValue(character, 'INDOOR');
    const outdoor = PersonUtils.getWhiteTagValue(character, 'OUTDOOR');
    
    const canEditStatus = professionName === 'Actor' || professionName === 'Director';
    const canEditSettings = professionName === 'Cinematographer';
    const canEditGenres = ['Screenwriter', 'Producer', 'Director', 'Actor'].includes(professionName);
    const canEditTraits = professionName !== 'Agent' && professionName !== 'Executive';
    
    const genres = PersonUtils.getSkillEntries(character)
      .filter(s => isGenre(s.id))
      .map(s => ({
        id: s.id,
        value: typeof s.value === 'string' ? parseFloat(s.value) : s.value
      }));

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
      canEditStatus,
      canEditSettings,
      canEditGenres,
      canEditTraits,
      genres,
    };
  }, [
    character.state,
    character.activeOrPlannedMovies,
    character.professions,
    character.labels,
    character.whiteTagsNEW,
  ]);
}