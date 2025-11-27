import artIcon from '@/assets/status/ART.png';
import comIcon from '@/assets/status/COM.png';

const RANK_COLORS = {
  1: '#E09D94',
  2: '#A8D4E6',
  3: '#E8D8A8',
  4: '#94CCBE',
} as const;

export const ACTOR_LABELS = {
  ART: ['PROMISING TALENT', 'COMMANDING PRESENCE', 'TRUE ARTIST', 'ICON'],
  COM: ['RISING STAR', 'STAR', 'SUPERSTAR', 'LEGEND'],
} as const;

export const DIRECTOR_LABELS = {
  ART: ['FRESH PERSPECTIVE', 'DECISIVE TALENT', 'VISIONARY', 'GENIUS'],
  COM: ['FAN FAVORITE', 'SENSATION', 'PHENOMENON', 'HOLLYWOOD GIANT'],
} as const;

type StatusType = 'ART' | 'COM';

const STATUS_ICONS: Record<StatusType, string> = {
  ART: artIcon,
  COM: comIcon,
};

export function getStatusIcon(type: 'ART' | 'COM'): string {
  return STATUS_ICONS[type];
}

export function getRank(value: number): number {
  if (value === 1.0) return 4;
  if (value >= 0.70) return 3;
  if (value >= 0.30) return 2;
  if (value >= 0.15) return 1;
  return 0;
}

export function getStatusColor(value: number): string | null {
  const rank = getRank(value);
  if (!rank) return null;
  return RANK_COLORS[rank as keyof typeof RANK_COLORS];
}