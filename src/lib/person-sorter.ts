import { DateUtils, PersonUtils } from './utils';
import type { Person } from './types';

export type SortField = 'skill' | 'selfEsteem' | 'age' | 'art' | 'com';
export type SortOrder = 'asc' | 'desc';

export interface SortContext {
  currentDate?: string;
}

export const PersonSorter = {
  /**
   * Sort persons by the specified field and order using Schwartzian transform
   */
  sort(
    persons: Person[],
    field: SortField,
    order: SortOrder,
    context: SortContext = {}
  ): Person[] {
    const withSortValues = persons.map(person => ({
      person,
      sortValue: PersonSorter.getSortValue(person, field, context)
    }));

    withSortValues.sort((a, b) => {
      const comparison = a.sortValue - b.sortValue;
      return order === 'asc' ? comparison : -comparison;
    });

    return withSortValues.map(item => item.person);
  },

  /**
   * Get the numeric sort value for a person based on the sort field
   */
  getSortValue(person: Person, field: SortField, context: SortContext): number {
    switch (field) {
      case 'skill': {
        const prof = person.professions ? Object.values(person.professions)[0] : '0';
        return parseFloat(prof);
      }
      case 'selfEsteem': {
        return parseFloat(person.selfEsteem || '0');
      }
      case 'age': {
        if (!person.birthDate || !context.currentDate) return 0;
        return DateUtils.calculateAge(person.birthDate, context.currentDate) || 0;
      }
      case 'art': {
        return PersonUtils.getWhiteTagValue(person, 'ART');
      }
      case 'com': {
        return PersonUtils.getWhiteTagValue(person, 'COM');
      }
      default:
        return 0;
    }
  },

  /**
   * Sort by skill level
   */
  sortBySkill(persons: Person[], order: SortOrder = 'desc'): Person[] {
    return PersonSorter.sort(persons, 'skill', order);
  },

  /**
   * Sort by self esteem
   */
  sortBySelfEsteem(persons: Person[], order: SortOrder = 'desc'): Person[] {
    return PersonSorter.sort(persons, 'selfEsteem', order);
  },

  /**
   * Sort by age (requires current date)
   */
  sortByAge(persons: Person[], currentDate: string, order: SortOrder = 'asc'): Person[] {
    return PersonSorter.sort(persons, 'age', order, { currentDate });
  },

  /**
   * Sort by ART stat
   */
  sortByArt(persons: Person[], order: SortOrder = 'desc'): Person[] {
    return PersonSorter.sort(persons, 'art', order);
  },

  /**
   * Sort by COM stat
   */
  sortByCom(persons: Person[], order: SortOrder = 'desc'): Person[] {
    return PersonSorter.sort(persons, 'com', order);
  }
};
