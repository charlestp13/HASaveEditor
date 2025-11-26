import { PersonUtils, normalizeStudioId } from './utils';
import type { Person } from './types';

export const STUDIO_IDS = ['PL', 'GB', 'EM', 'SU', 'HE', 'MA'] as const;
export type StudioId = typeof STUDIO_IDS[number];

export interface FilterConfig {
  search?: string;
  excludeStudios?: string[];
  excludeDead?: boolean;
  excludeLocked?: boolean;
  excludeUnemployed?: boolean;
}

export const PersonFilters = {
  applyAll(
    persons: Person[], 
    filters: FilterConfig,
    getTranslatedName: (person: Person) => string
  ): Person[] {
    let filtered = persons;

    if (filters.excludeStudios && filters.excludeStudios.length > 0) {
      filtered = filtered.filter(person => {
        const studioId = normalizeStudioId(person.studioId);
        return !filters.excludeStudios!.includes(studioId);
      });
    }

    if (filters.excludeDead) {
      filtered = filtered.filter(person => !PersonUtils.isDead(person));
    }

    if (filters.excludeLocked) {
      filtered = filtered.filter(person => !PersonUtils.isLocked(person));
    }

    if (filters.excludeUnemployed) {
      filtered = filtered.filter(person => normalizeStudioId(person.studioId) !== 'N/A');
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      filtered = filtered.filter(person =>
        getTranslatedName(person).toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  },

  parseSelectedFilters(selectedFilters: string[]): FilterConfig {
    const studioFilters = selectedFilters.filter(f => STUDIO_IDS.includes(f as StudioId));
    
    return {
      excludeStudios: studioFilters.length > 0 ? studioFilters : undefined,
      excludeDead: selectedFilters.includes('Dead'),
      excludeLocked: selectedFilters.includes('Locked'),
      excludeUnemployed: selectedFilters.includes('Unemployed'),
    };
  },

  sortByName(persons: Person[], getTranslatedName: (person: Person) => string): Person[] {
    return [...persons].sort((a, b) => 
      getTranslatedName(a).localeCompare(getTranslatedName(b))
    );
  }
};
