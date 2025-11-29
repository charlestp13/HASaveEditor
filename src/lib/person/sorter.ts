import type { Person } from '../types';
import { DateUtils } from '../utils/date';
import { PersonUtils } from './person-utils';

export type SortField = 'skill' | 'selfEsteem' | 'age' | 'art' | 'com';
export type SortOrder = 'asc' | 'desc';

export interface SortContext {
  currentDate?: string;
}

export class PersonSorter {
  static sort(
    persons: Person[],
    field: SortField,
    order: SortOrder,
    context: SortContext = {}
  ): Person[] {
    const withSortValues = persons.map((person) => ({
      person,
      sortValue: PersonSorter.getSortValue(person, field, context),
    }));

    withSortValues.sort((a, b) => {
      const comparison = a.sortValue - b.sortValue;
      return order === 'asc' ? comparison : -comparison;
    });

    return withSortValues.map((item) => item.person);
  }

  static getSortValue(person: Person, field: SortField, context: SortContext): number {
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
  }
}
