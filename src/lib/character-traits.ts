export const DISPLAYABLE_TRAITS = [
  "ALCOHOLIC",
  "ARROGANT",
  "CALM",
  "CHASTE",
  "CHEERY",
  "DEMANDING",
  "DISCIPLINED",
  "HARDWORKING",
  "HEARTBREAKER",
  "HOTHEADED",
  "INDIFFERENT",
  "JUNKIE",
  "LAZY",
  "LEADER",
  "LUDOMANIAC",
  "MELANCHOLIC",
  "MISOGYNIST",
  "MODEST",
  "OPEN_MINDED",
  "PERFECTIONIST",
  "RACIST",
  "SIMPLE",
  "TEAM_PLAYER",
  "UNDISCIPLINED",
  "UNWANTED_ACTOR",
  "XENOPHOBE"
] as const;

export const HIDDEN_TRAITS = [
  "IMMORTAL",
  "IMAGE_SOPHISTIC",
  "IMAGE_VIVID",
  "MAIN_CHARACTER",
  "STERILE",
  "SUPER_IMMORTAL",
  "UNTOUCHABLE"
] as const;

export const ALL_TRAITS = [...DISPLAYABLE_TRAITS, ...HIDDEN_TRAITS] as const;

export type DisplayableTrait = typeof DISPLAYABLE_TRAITS[number];
export type HiddenTrait = typeof HIDDEN_TRAITS[number];
export type CharacterTrait = typeof ALL_TRAITS[number];

export function isDisplayableTrait(trait: string): trait is DisplayableTrait {
  return DISPLAYABLE_TRAITS.includes(trait as DisplayableTrait);
}

export function isHiddenTrait(trait: string): trait is HiddenTrait {
  return HIDDEN_TRAITS.includes(trait as HiddenTrait);
}

export const TRAIT_CONFLICTS: Record<string, string> = {
  "HARDWORKING": "LAZY",
  "LAZY": "HARDWORKING",
  "DISCIPLINED": "UNDISCIPLINED",
  "UNDISCIPLINED": "DISCIPLINED",
  "PERFECTIONIST": "INDIFFERENT",
  "INDIFFERENT": "PERFECTIONIST",
  "HOTHEADED": "CALM",
  "CALM": "HOTHEADED",
  "DEMANDING": "MODEST",
  "MODEST": "DEMANDING",
  "ARROGANT": "SIMPLE",
  "SIMPLE": "ARROGANT",
  "HEARTBREAKER": "CHASTE",
  "CHASTE": "HEARTBREAKER",
  "CHEERY": "MELANCHOLIC",
  "MELANCHOLIC": "CHEERY"
};

export function getConflictingTrait(trait: string): string | null {
  return TRAIT_CONFLICTS[trait] || null;
}

export function canAddTrait(trait: string, currentTraits: string[]): boolean {
  if (currentTraits.includes(trait)) return false;
  const conflict = TRAIT_CONFLICTS[trait];
  if (conflict && currentTraits.includes(conflict)) return false;
  return true;
}