import gbIcon from '@/assets/studios/GB.png';
import emIcon from '@/assets/studios/EM.png';
import suIcon from '@/assets/studios/SU.png';
import heIcon from '@/assets/studios/HE.png';
import maIcon from '@/assets/studios/MA.png';
import allIcon from '@/assets/studios/ALL.png';
import pl0Icon from '@/assets/studios/PL0.png';
import pl1Icon from '@/assets/studios/PL1.png';
import pl2Icon from '@/assets/studios/PL2.png';
import pl3Icon from '@/assets/studios/PL3.png';
import pl4Icon from '@/assets/studios/PL4.png';
import pl5Icon from '@/assets/studios/PL5.png';
import pl6Icon from '@/assets/studios/PL6.png';
import pl7Icon from '@/assets/studios/PL7.png';
import pl8Icon from '@/assets/studios/PL8.png';
import pl9Icon from '@/assets/studios/PL9.png';
import pl10Icon from '@/assets/studios/PL10.png';
import pl11Icon from '@/assets/studios/PL11.png';
import pl12Icon from '@/assets/studios/PL12.png';

export interface Studio {
  id: string;
  name: string;
  icon: string;
}

const OPPONENT_STUDIOS: Studio[] = [
  { id: 'GB', name: 'Gerstein Brothers', icon: gbIcon },
  { id: 'EM', name: 'Evergreen Movies', icon: emIcon },
  { id: 'SU', name: 'Supreme', icon: suIcon },
  { id: 'HE', name: 'Hephaestus', icon: heIcon },
  { id: 'MA', name: 'Marginese', icon: maIcon },
];

const PLAYER_LOGO_ICONS: Record<number, string> = {
  0: pl0Icon,
  1: pl1Icon,
  2: pl2Icon,
  3: pl3Icon,
  4: pl4Icon,
  5: pl5Icon,
  6: pl6Icon,
  7: pl7Icon,
  8: pl8Icon,
  9: pl9Icon,
  10: pl10Icon,
  11: pl11Icon,
  12: pl12Icon,
};

const ALL_STUDIO_IDS = ['PL', ...OPPONENT_STUDIOS.map((s) => s.id)] as const;
export type StudioId = (typeof ALL_STUDIO_IDS)[number];

export class Studios {
  static readonly OPPONENTS = OPPONENT_STUDIOS;
  static readonly ALL_COMPETITORS_ICON = allIcon;

  static getPlayerLogoIcon(logoId: number): string {
    return PLAYER_LOGO_ICONS[logoId] || pl0Icon;
  }

  static getName(studioId: string | null | undefined): string | undefined {
    if (!studioId) return undefined;
    return OPPONENT_STUDIOS.find((s) => s.id === studioId)?.name;
  }

  static get(studioId: string | null | undefined): Studio | undefined {
    if (!studioId) return undefined;
    return OPPONENT_STUDIOS.find((s) => s.id === studioId);
  }

  static isValidId(value: string): value is StudioId {
    return (ALL_STUDIO_IDS as readonly string[]).includes(value);
  }

  static getOpponentIds(): string[] {
    return OPPONENT_STUDIOS.map((s) => s.id);
  }
}
