export const GENRES = [
  'ACTION',
  'DRAMA',
  'HISTORICAL',
  'THRILLER',
  'ROMANCE',
  'DETECTIVE',
  'COMEDY',
  'ADVENTURE',
  'HORROR',
  'SCIENCE_FICTION',
] as const;

export type Genre = typeof GENRES[number];
export const GENRE_ESTABLISHED_THRESHOLD = 12.0;
export const MAX_ESTABLISHED_GENRES = 3;