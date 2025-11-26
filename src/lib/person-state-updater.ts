import type { Person } from './types';
import { createWhiteTag } from './utils';

export const PersonStateUpdater = {
  updateField(person: Person, field: string, value: number | null): Person {
    const updated = { ...person };

    switch (field) {
      case 'mood':
        updated.mood = value ?? 0;
        break;
        
      case 'attitude':
        updated.attitude = value ?? 0;
        break;
        
      case 'skill':
        if (updated.professions) {
          const profName = Object.keys(updated.professions)[0];
          if (profName) {
            updated.professions = { ...updated.professions, [profName]: String(value ?? 0) };
          }
        }
        break;
        
      case 'limit':
        updated.limit = value ?? 0;
        updated.Limit = value ?? 0;
        break;
        
      default:
        if (field.startsWith('whiteTag:')) {
          const tagId = field.split(':')[1];
          this.updateWhiteTag(updated, tagId, value);
        }
    }

    return updated;
  },

  updateWhiteTag(person: Person, tagId: string, value: number | null): void {
    // Remove whiteTag
    if (value === null) {
      if (person.whiteTagsNEW && typeof person.whiteTagsNEW === 'object') {
        const newTags = { ...person.whiteTagsNEW };
        delete newTags[tagId];
        person.whiteTagsNEW = newTags;
      }
      return;
    }

    // Add or update whiteTag
    const newTags = person.whiteTagsNEW && typeof person.whiteTagsNEW === 'object' 
      ? { ...person.whiteTagsNEW }
      : {};

    if (newTags[tagId]) {
      // Update existing
      newTags[tagId] = { ...newTags[tagId], value };
    } else {
      // Create new
      newTags[tagId] = createWhiteTag(tagId, value);
    }

    person.whiteTagsNEW = newTags;
  },

  addTrait(person: Person, trait: string): Person {
    const currentLabels = person.labels || [];
    if (currentLabels.includes(trait)) return person;
    return { ...person, labels: [trait, ...currentLabels] };
  },

  removeTrait(person: Person, trait: string): Person {
    const currentLabels = person.labels || [];
    return { ...person, labels: currentLabels.filter(t => t !== trait) };
  },

  normalizeFieldName(field: string): string {
    if (field === 'whiteTag:ART') return 'art';
    if (field === 'whiteTag:COM') return 'com';
    return field;
  }
};