import type { Person } from '../types';
import { PersonUtils, StudioUtils } from './person-utils';
import { Studios } from '../game-data/studios';

export type GenderFilter = 'all' | 'male' | 'female';
export type ShadyFilter = 'all' | 'shady' | 'notShady';

export interface FilterConfig {
  search?: string;
  excludeStudios?: string[];
  excludeDead?: boolean;
  excludeLocked?: boolean;
  excludeUnemployed?: boolean;
  gender?: GenderFilter;
  shady?: ShadyFilter;
}

export class PersonFilters {
  static applyAll(persons: Person[], filters: FilterConfig, nameStrings?: string[]): Person[] {
    let filtered = persons;

    if (filters.excludeStudios && filters.excludeStudios.length > 0) {
      const excludeStudios = filters.excludeStudios;
      filtered = filtered.filter((person) => {
        const studioId = StudioUtils.normalizeId(person.studioId);
        return !excludeStudios.includes(studioId);
      });
    }

    if (filters.excludeDead) {
      filtered = filtered.filter((person) => !PersonUtils.isDead(person));
    }

    if (filters.excludeLocked) {
      filtered = filtered.filter((person) => !PersonUtils.isLocked(person));
    }

    if (filters.excludeUnemployed) {
      filtered = filtered.filter((person) => StudioUtils.normalizeId(person.studioId) !== 'N/A');
    }

    if (filters.gender && filters.gender !== 'all') {
      filtered = filtered.filter((person) => {
        return filters.gender === 'female' ? person.gender === 1 : person.gender !== 1;
      });
    }

    if (filters.shady && filters.shady !== 'all') {
      filtered = filtered.filter((person) => {
        const isShady = person.isShady === true;
        return filters.shady === 'shady' ? isShady : !isShady;
      });
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      filtered = filtered.filter((person) =>
        PersonUtils.getDisplayName(person, nameStrings).toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }

  static parseSelectedFilters(selectedFilters: string[]): FilterConfig {
    const studioFilters = selectedFilters.filter((f) => Studios.isValid(f));

    return {
      excludeStudios: studioFilters.length > 0 ? studioFilters : undefined,
      excludeDead: selectedFilters.includes('Dead'),
      excludeLocked: selectedFilters.includes('Locked'),
      excludeUnemployed: selectedFilters.includes('Unemployed'),
    };
  }
}
