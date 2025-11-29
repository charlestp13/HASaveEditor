import type { Person } from '../types';
import { PersonUtils, StudioUtils } from './person-utils';
import { Studios } from '../game-data/studios';

export interface FilterConfig {
  search?: string;
  excludeStudios?: string[];
  excludeDead?: boolean;
  excludeLocked?: boolean;
  excludeUnemployed?: boolean;
}

export class PersonFilters {
  static applyAll(persons: Person[], filters: FilterConfig, nameStrings?: string[]): Person[] {
    let filtered = persons;

    if (filters.excludeStudios && filters.excludeStudios.length > 0) {
      filtered = filtered.filter((person) => {
        const studioId = StudioUtils.normalizeId(person.studioId);
        return !filters.excludeStudios!.includes(studioId);
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

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      filtered = filtered.filter((person) =>
        PersonUtils.getDisplayName(person, nameStrings).toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  }

  static parseSelectedFilters(selectedFilters: string[]): FilterConfig {
    const studioFilters = selectedFilters.filter((f) => Studios.isValidId(f));

    return {
      excludeStudios: studioFilters.length > 0 ? studioFilters : undefined,
      excludeDead: selectedFilters.includes('Dead'),
      excludeLocked: selectedFilters.includes('Locked'),
      excludeUnemployed: selectedFilters.includes('Unemployed'),
    };
  }
}
