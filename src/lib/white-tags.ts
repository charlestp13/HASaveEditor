import type { WhiteTag } from './types';

const GAME_START_DATE = '1929-01-01T00:00:00';

export class WhiteTagFactory {
  static create(tagId: string, value: number): WhiteTag {
    const valueStr = value.toFixed(3);
    return {
      id: tagId,
      value: valueStr,
      dateAdded: GAME_START_DATE,
      movieId: 0,
      IsOverall: false,
      overallValues: [
        {
          movieId: 0,
          sourceType: 0,
          value: valueStr,
          dateAdded: GAME_START_DATE,
        },
      ],
    };
  }

  static getValue(tag: WhiteTag | undefined): number {
    if (!tag) return 0;
    return typeof tag.value === 'string' ? parseFloat(tag.value) : tag.value;
  }

  static updateValue(tag: WhiteTag, value: number): WhiteTag {
    return {
      ...tag,
      value: value.toFixed(3),
    };
  }
}
