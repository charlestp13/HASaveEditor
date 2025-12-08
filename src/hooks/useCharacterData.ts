import { useMemo } from 'react';
import { PersonUtils, DateUtils, Traits, Genres, type Person } from '@/lib';

export function useCharacterData(character: Person, currentDate: string) {
  return useMemo(() => {
    // ─────────────────────────────────────────────────────────────
    // Date Calculations
    // ─────────────────────────────────────────────────────────────
    const birthParsed = character.birthDate 
      ? DateUtils.fromDDMMYYYY(character.birthDate) 
      : null;
    
    const deathParsed = character.deathDate 
      ? DateUtils.fromDDMMYYYY(character.deathDate) 
      : null;

    const currentParsed = currentDate ? DateUtils.parse(currentDate) : null;

    const age = (birthParsed && currentParsed)
      ? birthParsed.ageTo(currentParsed)
      : null;

    const birthYear = birthParsed?.year ?? null;

    const contractDaysLeft = calculateContractDaysLeft(character, currentParsed);

    // ─────────────────────────────────────────────────────────────
    // Character State
    // ─────────────────────────────────────────────────────────────
    const isDead = PersonUtils.isDead(character);
    const isBusy = PersonUtils.isBusy(character);

    // ─────────────────────────────────────────────────────────────
    // Profession Info
    // ─────────────────────────────────────────────────────────────
    const professionName = PersonUtils.getProfessionName(character);
    const professionValue = PersonUtils.getProfessionValue(character);

    // ─────────────────────────────────────────────────────────────
    // White Tags (Status/Location Specialties)
    // ─────────────────────────────────────────────────────────────
    const art = PersonUtils.getWhiteTagValue(character, 'ART');
    const com = PersonUtils.getWhiteTagValue(character, 'COM');
    const indoor = PersonUtils.getWhiteTagValue(character, 'INDOOR');
    const outdoor = PersonUtils.getWhiteTagValue(character, 'OUTDOOR');

    // ─────────────────────────────────────────────────────────────
    // Traits & Genres
    // ─────────────────────────────────────────────────────────────
    const displayableTraits = character.labels?.filter(Traits.isDisplayable) || [];

    const genres = PersonUtils.getWhiteTagEntries(character)
      .filter(s => Genres.isValid(s.id))
      .map(s => ({
        id: s.id,
        value: typeof s.value === 'string' ? parseFloat(s.value) : s.value
      }));

    // ─────────────────────────────────────────────────────────────
    // Edit Permissions (based on profession)
    // ─────────────────────────────────────────────────────────────
    const isExecutive = PersonUtils.isExecutive(character);
    const isDeptHead = PersonUtils.isDeptHead(character);
    const canEditStatus = professionName === 'Actor' || professionName === 'Director';
    const canEditSettings = professionName === 'Cinematographer';
    const canEditGenres = ['Screenwriter', 'Producer', 'Director', 'Actor'].includes(professionName);
    const canEditTraits = professionName !== 'Agent' && !isExecutive && !isDeptHead;

    return {
      age,
      birthYear,
      birthParsed,
      deathParsed,
      contractDaysLeft,
      isDead,
      isBusy,
      isExecutive,
      isDeptHead,
      professionName,
      professionValue,
      art,
      com,
      indoor,
      outdoor,
      genres,
      displayableTraits,
      canEditStatus,
      canEditSettings,
      canEditGenres,
      canEditTraits,
    };
  }, [
    character.birthDate,
    character.deathDate,
    character.contract,
    character.state,
    character.activeOrPlannedMovies,
    character.professions,
    character.labels,
    character.whiteTagsNEW,
    currentDate,
  ]);
}

function calculateContractDaysLeft(
  character: Person, 
  currentParsed: DateUtils | null
): number | null {
  if (!character.contract || !currentParsed) return null;

  const signing = new Date(character.contract.dateOfSigning);
  const ending = new Date(signing);
  ending.setFullYear(ending.getFullYear() + character.contract.amount);

  return currentParsed.daysUntil(DateUtils.fromDate(ending));
}