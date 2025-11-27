import type { Person, WhiteTag } from './types';
import { getStudioName } from './studio-data';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string): string {
  return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export class PersonUtils {
  static readonly STATE_FLAGS: Record<number, string> = {
    2: 'Hired by Player',
    4: 'Fired',
    16: 'Dead',
    32: 'Hired by Competitor',
    64: 'Locked',
    128: 'In Hospital',
    256: 'Kidnapped by Player',
    512: 'Vacation',
    1024: 'Tired',
    2048: 'Request Cooldown',
    4096: 'Offended',
    8192: 'Threatening',
    16384: 'Beating',
    32768: 'Killing',
    65536: 'Kidnapping',
    131072: 'Imprisoned',
    262144: 'Kidnapped by Competitor',
    524288: 'Special Vacation',
    1048576: 'Doing Policy Bonuses',
    2097152: 'On The War',
    4194304: 'Compromised by Competitor',
    8388608: 'Selected for Poaching',
  };

  private static getFlag(flagName: string): number {
    const flag = Object.keys(PersonUtils.STATE_FLAGS).find(
      key => PersonUtils.STATE_FLAGS[Number(key)] === flagName
    );
    return flag ? Number(flag) : 0;
  }

  static getDisplayName(person: Person, nameStrings?: string[]): string {
    if (person.customName) return person.customName;
    
    if (nameStrings && person.firstNameId && person.lastNameId) {
      const firstName = nameStrings[parseInt(person.firstNameId, 10)] || person.firstNameId;
      const lastName = nameStrings[parseInt(person.lastNameId, 10)] || person.lastNameId;
      return `${firstName} ${lastName}`;
    }
    
    return `Person ${person.id}`;
  }

  static getProfessionName(person: Person): string {
    if (!person.professions) return 'Unknown';
    const keys = Object.keys(person.professions);
    return keys.length > 0 ? keys[0] : 'Unknown';
  }

  static getProfessionValue(person: Person): number {
    const profession = PersonUtils.getProfessionName(person);
    const value = person.professions?.[profession];
    if (!value) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  static getStudioDisplay(studioId: string | null | undefined): string {
    if (!studioId || studioId === 'NONE') return 'N/A';
    if (studioId === 'PL') return 'Player';
    
    // Use studio-data helper for opponent studios
    const studioName = getStudioName(studioId);
    return studioName || studioId; // Fallback to ID if unknown
  }

  static getSkillEntries(person: Person): WhiteTag[] {
    if (!person.whiteTagsNEW || typeof person.whiteTagsNEW !== 'object') {
      return [];
    }
    if (Array.isArray(person.whiteTagsNEW)) {
      return [];
    }
    return Object.values(person.whiteTagsNEW).filter(
      (skill): skill is WhiteTag => skill && typeof skill === 'object' && 'id' in skill
    );
  }

  static isDead(person: Person): boolean {
    const state = person.state ?? 0;
    return Boolean(state & PersonUtils.getFlag('Dead'));
  }

  static isBusy(person: Person): boolean {
    return Boolean(person.activeOrPlannedMovies && person.activeOrPlannedMovies.length > 0);
  }

  static isLocked(person: Person): boolean {
    const state = person.state ?? 0;
    return Boolean(state & PersonUtils.getFlag('Locked'));
  }

  static isHireableByPlayer(person: Person): boolean {
    const state = person.state ?? 0;
    const HIREABLE_MASK = -4211;
    return (state & HIREABLE_MASK) === state;
  }

  static getGenderLabel(gender?: number): string {
    return gender === 0 ? 'Male' : 'Female';
  }

  static getStateLabel(state?: number): string {
    if (state === undefined || state === 0) return 'None';

    const activeStates: string[] = [];
    for (const [flag, label] of Object.entries(PersonUtils.STATE_FLAGS)) {
      if (state & Number(flag)) {
        activeStates.push(label);
      }
    }

    return activeStates.length > 0 ? activeStates.join(', ') : `Unknown (${state})`;
  }

  static getLimit(person: Person): number {
    const limit = person.limit ?? person.Limit ?? 0;
    return typeof limit === 'number' ? limit : parseFloat(String(limit)) || 0;
  }

  static getWhiteTagValue(person: Person, tagId: string): number {
    if (!person.whiteTagsNEW || typeof person.whiteTagsNEW !== 'object') return 0;
    const tag = person.whiteTagsNEW[tagId];
    if (!tag) return 0;
    return typeof tag.value === 'string' ? parseFloat(tag.value) : tag.value;
  }

  static getSkill(person: Person, profession: string): number {
    const val = person.professions?.[profession];
    if (!val) return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Genre helpers
  static hasGenre(person: Person, genre: string): boolean {
    return person.whiteTagsNEW?.[genre] !== undefined;
  }

  static getGenreValue(person: Person, genre: string): number {
    return PersonUtils.getWhiteTagValue(person, genre);
  }

  static getGenreLevel(person: Person, genre: string): number {
    const value = PersonUtils.getGenreValue(person, genre);
    if (value >= 12.0) return 4;
    if (value >= 8.0) return 3;
    if (value >= 4.0) return 2;
    if (value > 0) return 1;
    return 0;
  }

  static isGenreEstablished(person: Person, genre: string): boolean {
    return PersonUtils.getGenreValue(person, genre) >= 12.0;
  }

  // Status helpers (consolidated from character-status.ts)
  static getRank(value: number): number {
    if (value === 1.0) return 4;
    if (value >= 0.70) return 3;
    if (value >= 0.30) return 2;
    if (value >= 0.15) return 1;
    return 0;
  }

  static getStatusLabel(
    type: 'ART' | 'COM',
    value: number,
    profession: 'Actor' | 'Director'
  ): string | null {
    const rank = PersonUtils.getRank(value);
    if (rank === 0) return null;
    
    const ACTOR_LABELS = {
      ART: ['PROMISING TALENT', 'COMMANDING PRESENCE', 'TRUE ARTIST', 'ICON'],
      COM: ['RISING STAR', 'STAR', 'SUPERSTAR', 'LEGEND'],
    };
    
    const DIRECTOR_LABELS = {
      ART: ['FRESH PERSPECTIVE', 'DECISIVE TALENT', 'VISIONARY', 'GENIUS'],
      COM: ['FAN FAVORITE', 'SENSATION', 'PHENOMENON', 'HOLLYWOOD GIANT'],
    };
    
    const labels = profession === 'Actor' ? ACTOR_LABELS : DIRECTOR_LABELS;
    return labels[type][rank - 1];
  }

  static getStatusColor(value: number): string | null {
    const rank = PersonUtils.getRank(value);
    if (!rank) return null;
    
    const RANK_COLORS: Record<number, string> = {
      1: '#E09D94',
      2: '#A8D4E6',
      3: '#E8D8A8',
      4: '#94CCBE',
    };
    
    return RANK_COLORS[rank];
  }

  // Trait helpers (consolidated from character-traits.ts)
  static readonly DISPLAYABLE_TRAITS = [
    "ALCOHOLIC", "ARROGANT", "CALM", "CHASTE", "CHEERY", "DEMANDING",
    "DISCIPLINED", "HARDWORKING", "HEARTBREAKER", "HOTHEADED", "INDIFFERENT",
    "JUNKIE", "LAZY", "LEADER", "LUDOMANIAC", "MELANCHOLIC", "MISOGYNIST",
    "MODEST", "OPEN_MINDED", "PERFECTIONIST", "RACIST", "SIMPLE", "TEAM_PLAYER",
    "UNDISCIPLINED", "UNWANTED_ACTOR", "XENOPHOBE"
  ] as const;

  static readonly HIDDEN_TRAITS = [
    "IMMORTAL", "IMAGE_SOPHISTIC", "IMAGE_VIVID", "MAIN_CHARACTER",
    "STERILE", "SUPER_IMMORTAL", "UNTOUCHABLE"
  ] as const;

  static readonly TRAIT_CONFLICTS: Record<string, string> = {
    "HARDWORKING": "LAZY", "LAZY": "HARDWORKING",
    "DISCIPLINED": "UNDISCIPLINED", "UNDISCIPLINED": "DISCIPLINED",
    "PERFECTIONIST": "INDIFFERENT", "INDIFFERENT": "PERFECTIONIST",
    "HOTHEADED": "CALM", "CALM": "HOTHEADED",
    "DEMANDING": "MODEST", "MODEST": "DEMANDING",
    "ARROGANT": "SIMPLE", "SIMPLE": "ARROGANT",
    "HEARTBREAKER": "CHASTE", "CHASTE": "HEARTBREAKER",
    "CHEERY": "MELANCHOLIC", "MELANCHOLIC": "CHEERY"
  };

  static isDisplayableTrait(trait: string): boolean {
    return PersonUtils.DISPLAYABLE_TRAITS.includes(trait as any);
  }

  static isHiddenTrait(trait: string): boolean {
    return PersonUtils.HIDDEN_TRAITS.includes(trait as any);
  }

  static getConflictingTrait(trait: string): string | null {
    return PersonUtils.TRAIT_CONFLICTS[trait] || null;
  }

  static canAddTrait(trait: string, currentTraits: string[]): boolean {
    if (currentTraits.includes(trait)) return false;
    const conflict = PersonUtils.TRAIT_CONFLICTS[trait];
    if (conflict && currentTraits.includes(conflict)) return false;
    return true;
  }

  // Genre constants (consolidated from character-genres.ts)
  static readonly GENRES = [
    'ACTION', 'DRAMA', 'HISTORICAL', 'THRILLER',
    'ROMANCE', 'DETECTIVE', 'COMEDY', 'ADVENTURE',
    'HORROR', 'SCIENCE_FICTION'
  ] as const;

  static readonly GENRE_ESTABLISHED_THRESHOLD = 12.0;
  static readonly MAX_ESTABLISHED_GENRES = 3;
}

export class StudioUtils {
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  static formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  static normalizeId(studioId: string | number | null | undefined): string {
    const id = studioId?.toString() || 'NONE';
    return id === 'NONE' ? 'N/A' : id;
  }
}

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export class DateUtils {
  static readonly GAME_START_DATE = '1929-01-01T00:00:00';
  
  readonly year: number;
  readonly month: number;
  readonly day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static parse(dateStr: string): DateUtils | null {
    const match = dateStr.match(/(\w+) (\d+), (\d+)/);
    if (!match) return null;

    const monthIndex = MONTHS_FULL.indexOf(match[1]);
    if (monthIndex === -1) return null;

    return new DateUtils(parseInt(match[3]), monthIndex, parseInt(match[2]));
  }

  static fromDDMMYYYY(dateStr: string): DateUtils | null {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    return new DateUtils(year, month - 1, day);
  }

  static fromDate(date: Date): DateUtils {
    return new DateUtils(date.getFullYear(), date.getMonth(), date.getDate());
  }

  static calculateAge(birthDate: string, currentDate: string): number | null {
    try {
      const birth = DateUtils.fromDDMMYYYY(birthDate);
      const current = DateUtils.parse(currentDate);
      
      if (!birth || !current) return null;
      
      return birth.ageTo(current);
    } catch {
      return null;
    }
  }

  toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }

  format(style: 'short' | 'full' = 'short'): string {
    const months = style === 'short' ? MONTHS_SHORT : MONTHS_FULL;
    return `${months[this.month]} ${this.day}, ${this.year}`;
  }

  ageTo(currentDate: DateUtils): number {
    let age = currentDate.year - this.year;
    const monthDiff = currentDate.month - this.month;

    if (monthDiff < 0 || (monthDiff === 0 && currentDate.day < this.day)) {
      age--;
    }

    return age;
  }

  daysUntil(target: DateUtils): number {
    const from = this.toDate();
    const to = target.toDate();
    const diffTime = to.getTime() - from.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Alias for backward compatibility
export const GameDate = DateUtils;

export function createWhiteTag(tagId: string, value: number): WhiteTag {
  const valueStr = value.toFixed(3);
  return {
    id: tagId,
    value: valueStr,
    dateAdded: DateUtils.GAME_START_DATE,
    movieId: 0,
    IsOverall: false,
    overallValues: [{
      movieId: 0,
      sourceType: 0,
      value: valueStr,
      dateAdded: DateUtils.GAME_START_DATE
    }]
  };
}