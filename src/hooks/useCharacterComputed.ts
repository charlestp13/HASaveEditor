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
    
    // Determine which sections can be edited
    const canEditStatus = professionName === 'Actor' || professionName === 'Director';
    const canEditSettings = professionName === 'Cinematographer';
    const canEditGenres = ['Scriptwriter', 'Producer', 'Director', 'Actor'].includes(professionName);
    const canEditTraits = professionName !== 'Agent' && professionName !== 'Executive';
    
    // Pre-compute genres (filter once instead of 3 times in CharacterCard)
    const genres = PersonUtils.getSkillEntries(character)
      .filter(s => (GENRES as readonly string[]).includes(s.id))
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
    character.deathDate,
    character.activeOrPlannedMovies,
    character.professions,
    character.labels,
    character.whiteTagsNEW,
  ]);
}