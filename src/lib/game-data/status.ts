import artIcon from '@/assets/status/ART.png';
import comIcon from '@/assets/status/COM.png';

export type StatusType = 'ART' | 'COM';

const STATUS_ICONS: Record<StatusType, string> = {
  ART: artIcon,
  COM: comIcon,
};

const RANK_COLORS: Record<number, string> = {
  1: '#E09D94',
  2: '#A8D4E6',
  3: '#E8D8A8',
  4: '#94CCBE',
};

const ACTOR_LABELS = {
  ART: ['PROMISING TALENT', 'COMMANDING PRESENCE', 'TRUE ARTIST', 'ICON'],
  COM: ['RISING STAR', 'STAR', 'SUPERSTAR', 'LEGEND'],
} as const;

const DIRECTOR_LABELS = {
  ART: ['FRESH PERSPECTIVE', 'DECISIVE TALENT', 'VISIONARY', 'GENIUS'],
  COM: ['FAN FAVORITE', 'SENSATION', 'PHENOMENON', 'HOLLYWOOD GIANT'],
} as const;

export class Status {
  static readonly ACTOR_LABELS = ACTOR_LABELS;
  static readonly DIRECTOR_LABELS = DIRECTOR_LABELS;

  static getIcon(type: StatusType): string {
    return STATUS_ICONS[type];
  }

  static getRank(value: number): number {
    if (value === 1.0) return 4;
    if (value >= 0.7) return 3;
    if (value >= 0.3) return 2;
    if (value >= 0.15) return 1;
    return 0;
  }

  static getColor(value: number): string | null {
    const rank = Status.getRank(value);
    if (!rank) return null;
    return RANK_COLORS[rank];
  }

  static getLabel(
    type: StatusType,
    profession: 'Actor' | 'Director',
    value: number
  ): string | null {
    const rank = Status.getRank(value);
    if (!rank) return null;

    const labels = profession === 'Actor' ? ACTOR_LABELS : DIRECTOR_LABELS;
    return labels[type][rank - 1];
  }
}
