import actionIcon from '@/assets/genres/ACTION.png';
import dramaIcon from '@/assets/genres/DRAMA.png';
import historicalIcon from '@/assets/genres/HISTORICAL.png';
import thrillerIcon from '@/assets/genres/THRILLER.png';
import romanceIcon from '@/assets/genres/ROMANCE.png';
import detectiveIcon from '@/assets/genres/DETECTIVE.png';
import comedyIcon from '@/assets/genres/COMEDY.png';
import adventureIcon from '@/assets/genres/ADVENTURE.png';
import horrorIcon from '@/assets/genres/HORROR.png';
import scifiIcon from '@/assets/genres/SCIENCE_FICTION.png';

const GENRES = [
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

export type Genre = (typeof GENRES)[number];

const GENRE_ICONS: Record<Genre, string> = {
  ACTION: actionIcon,
  DRAMA: dramaIcon,
  HISTORICAL: historicalIcon,
  THRILLER: thrillerIcon,
  ROMANCE: romanceIcon,
  DETECTIVE: detectiveIcon,
  COMEDY: comedyIcon,
  ADVENTURE: adventureIcon,
  HORROR: horrorIcon,
  SCIENCE_FICTION: scifiIcon,
};

export class Genres {
  static readonly LIST = GENRES;
  static readonly ESTABLISHED_THRESHOLD = 12.0;
  static readonly MAX_ESTABLISHED = 3;

  static getIcon(genre: string): string | undefined {
    return GENRE_ICONS[genre as Genre];
  }

  static isValid(value: string): value is Genre {
    return (GENRES as readonly string[]).includes(value);
  }

  static getAll(): readonly Genre[] {
    return GENRES;
  }
}
