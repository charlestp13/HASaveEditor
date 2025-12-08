import type { Person, WhiteTag } from '../types';
import { Studios } from '../game-data/studios';
import { Genres } from '../game-data/genres';

export type PortraitType = 'TALENT' | 'LIEUT' | 'AGENT';

export class PersonUtils {
  // ───────────────────────────────────────────────────────────────────────────
  // State Flags
  // ───────────────────────────────────────────────────────────────────────────

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

  static readonly PROFESSION_DISPLAY_NAMES: Record<string, string> = {
    Actor: 'Actor',
    Scriptwriter: 'Screenwriter',
    Director: 'Director',
    Producer: 'Producer',
    Cinematographer: 'Cinematographer',
    FilmEditor: 'Editor',
    Composer: 'Composer',
    Agent: 'Agent',
    CptHR: 'HR Executive',
    CptLawyer: 'Legal Executive',
    CptFinancier: 'Financial Executive',
    CptPR: 'PR Executive',
    LieutScript: 'Scriptwriting Head',
    LieutPrep: 'Pre-Production Head',
    LieutProd: 'Production Head',
    LieutPost: 'Post-Production Head',
    LieutRelease: 'Distribution Head',
    LieutSecurity: 'Security Head',
    LieutProducers: 'Producers Office Head',
    LieutInfrastructure: 'Maintenance Head',
    LieutTech: 'Engineering Head',
    LieutMuseum: 'Museum Head',
    LieutEscort: 'Services Head',
  };

  static readonly EXECUTIVE_PROFESSIONS = ['CptHR', 'CptLawyer', 'CptFinancier', 'CptPR'] as const;

  static readonly LIEUTENANT_PROFESSIONS = [
    'LieutScript', 'LieutPrep', 'LieutProd', 'LieutPost', 'LieutRelease',
    'LieutSecurity', 'LieutProducers', 'LieutInfrastructure', 'LieutTech',
    'LieutMuseum', 'LieutEscort'
  ] as const;

  // ───────────────────────────────────────────────────────────────────────────
  // Portrait Type
  // ───────────────────────────────────────────────────────────────────────────

  static getPortraitType(professions: Record<string, unknown> | undefined): PortraitType {
    const profession = professions ? Object.keys(professions)[0] : null;
    if (!profession) return 'TALENT';
    if (profession === 'Agent') return 'AGENT';
    if (profession.startsWith('Cpt') || profession.startsWith('Lieut')) return 'LIEUT';
    return 'TALENT';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // State Checks
  // ───────────────────────────────────────────────────────────────────────────

  static isDead(person: Person): boolean {
    return PersonUtils.hasFlag(person, 'Dead');
  }

  static isLocked(person: Person): boolean {
    return PersonUtils.hasFlag(person, 'Locked');
  }

  static isExecutive(person: Person): boolean {
    const profName = PersonUtils.getRawProfessionName(person);
    return PersonUtils.EXECUTIVE_PROFESSIONS.includes(profName as typeof PersonUtils.EXECUTIVE_PROFESSIONS[number]);
  }

  static isDeptHead(person: Person): boolean {
    const profName = PersonUtils.getRawProfessionName(person);
    return PersonUtils.LIEUTENANT_PROFESSIONS.includes(profName as typeof PersonUtils.LIEUTENANT_PROFESSIONS[number]);
  }

  static isBusy(person: Person): boolean {
    return Boolean(person.activeOrPlannedMovies && person.activeOrPlannedMovies.length > 0);
  }

  static hasFlag(person: Person, flagName: string): boolean {
    const state = person.state ?? 0;
    const flag = PersonUtils.getFlag(flagName);
    return Boolean(state & flag);
  }

  private static getFlag(flagName: string): number {
    const entry = Object.entries(PersonUtils.STATE_FLAGS).find(
      ([, label]) => label === flagName
    );
    return entry ? Number(entry[0]) : 0;
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

  // ───────────────────────────────────────────────────────────────────────────
  // Display Helpers
  // ───────────────────────────────────────────────────────────────────────────

  static getDisplayName(person: Person, nameStrings?: string[]): string {
    if (person.customName) return person.customName;

    if (nameStrings && person.firstNameId && person.lastNameId) {
      const firstName = nameStrings[parseInt(person.firstNameId, 10)] || person.firstNameId;
      const lastName = nameStrings[parseInt(person.lastNameId, 10)] || person.lastNameId;
      return `${firstName} ${lastName}`;
    }

    return `Person ${person.id}`;
  }

  static getStudioDisplay(studioId: string | null | undefined): string {
    if (!studioId || studioId === 'NONE') return 'N/A';
    if (studioId === 'PL') return 'Player';
    return Studios.getName(studioId) || studioId;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Profession Helpers
  // ───────────────────────────────────────────────────────────────────────────

  static getRawProfessionName(person: Person): string {
    if (!person.professions) return 'Unknown';
    const keys = Object.keys(person.professions);
    return keys.length > 0 ? keys[0] : 'Unknown';
  }

  static getProfessionName(person: Person): string {
    const rawName = PersonUtils.getRawProfessionName(person);
    if (rawName === 'Unknown') return rawName;
    return PersonUtils.PROFESSION_DISPLAY_NAMES[rawName] || rawName;
  }

  static getProfessionValue(person: Person): number {
    const profession = PersonUtils.getRawProfessionName(person);
    const value = person.professions?.[profession];
    if (!value) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // White Tag Helpers
  // ───────────────────────────────────────────────────────────────────────────

  static getWhiteTagValue(person: Person, tagId: string): number {
    if (!person.whiteTagsNEW || typeof person.whiteTagsNEW !== 'object') return 0;
    const tag = person.whiteTagsNEW[tagId];
    if (!tag) return 0;
    return typeof tag.value === 'string' ? parseFloat(tag.value) : tag.value;
  }

  static getWhiteTagEntries(person: Person): WhiteTag[] {
    if (!person.whiteTagsNEW || typeof person.whiteTagsNEW !== 'object') {
      return [];
    }
    if (Array.isArray(person.whiteTagsNEW)) {
      return [];
    }
    return Object.values(person.whiteTagsNEW).filter(
      (tag): tag is WhiteTag => tag && typeof tag === 'object' && 'id' in tag
    );
  }

  static getGenresWithValues(person: Person): Array<{ id: string; value: number }> {
    return PersonUtils.getWhiteTagEntries(person)
      .filter(s => Genres.isValid(s.id))
      .map(s => ({
        id: s.id,
        value: typeof s.value === 'string' ? parseFloat(s.value) : s.value
      }));
  }
}

export class StudioUtils {
  static normalizeId(studioId: string | number | null | undefined): string {
    const id = studioId?.toString() || 'NONE';
    return id === 'NONE' ? 'N/A' : id;
  }
}