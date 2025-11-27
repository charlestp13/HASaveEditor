import { PersonUtils, StudioUtils } from './utils';
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
    nameStrings?: string[]
  ): Person[] {
    let filtered = persons;

    if (filters.excludeStudios && filters.excludeStudios.length > 0) {
      filtered = filtered.filter(person => {
        const studioId = StudioUtils.normalizeId(person.studioId);
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
      filtered = filtered.filter(person => StudioUtils.normalizeId(person.studioId) !== 'N/A');
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      filtered = filtered.filter(person =>
        PersonUtils.getDisplayName(person, nameStrings).toLowerCase().includes(lowerSearch)
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
  }
};
