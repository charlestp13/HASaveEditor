import type { Person, WhiteTag } from '../types';
import { WhiteTagFactory } from '../white-tags';

export class PersonStateUpdater {
  static updateField(person: Person, field: string, value: number | null): Person {
    const updated = { ...person };

    switch (field) {
      case 'isShady':
        updated.isShady = value === 1;
        break;
        
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

      case 'selfEsteem':
        updated.selfEsteem = String(value ?? 0);
        break;

      case 'birthYear':
        if (updated.birthDate && value !== null) {
          const parts = updated.birthDate.split('-');
          if (parts.length === 3) {
            updated.birthDate = `${parts[0]}-${parts[1]}-${value}`;
          }
        }
        break;

      default:
        if (field.startsWith('whiteTag:')) {
          const tagId = field.split(':')[1];
          updated.whiteTagsNEW = PersonStateUpdater.updateWhiteTags(updated, tagId, value);
        }
    }

    return updated;
  }

  static updateStringField(
    person: Person,
    field: 'firstNameId' | 'lastNameId' | 'customName',
    value: string | null
  ): Person {
    return {
      ...person,
      [field]: value,
    };
  }

  static addTrait(person: Person, trait: string): Person {
    const currentLabels = person.labels || [];
    if (currentLabels.includes(trait)) return person;
    return { ...person, labels: [trait, ...currentLabels] };
  }

  static removeTrait(person: Person, trait: string): Person {
    const currentLabels = person.labels || [];
    return { ...person, labels: currentLabels.filter((t) => t !== trait) };
  }

  static normalizeFieldName(field: string): string {
    if (field === 'whiteTag:ART') return 'art';
    if (field === 'whiteTag:COM') return 'com';
    return field;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ───────────────────────────────────────────────────────────────────────────

  private static updateWhiteTags(
    person: Person,
    tagId: string,
    value: number | null
  ): Record<string, WhiteTag> | undefined {
    if (value === null) {
      if (!person.whiteTagsNEW) return undefined;
      const newTags = { ...person.whiteTagsNEW };
      delete newTags[tagId];
      return Object.keys(newTags).length > 0 ? newTags : undefined;
    }

    const newTags = person.whiteTagsNEW ? { ...person.whiteTagsNEW } : {};

    if (newTags[tagId]) {
      newTags[tagId] = { ...newTags[tagId], value: value.toFixed(3) };
    } else {
      newTags[tagId] = WhiteTagFactory.create(tagId, value);
    }

    return newTags;
  }
}