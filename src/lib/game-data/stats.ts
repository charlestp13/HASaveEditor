import { Traits } from './traits';
import approveIcon from '@/assets/APPROVE.png';
import disapproveIcon from '@/assets/DISAPPROVE.png';
import happyIcon from '@/assets/HAPPY.png';
import sadIcon from '@/assets/SAD.png';

export interface StatConfig {
  id: string;
  label: string;
  min: number;
  max: number;
  minIcon: string;
  maxIcon: string;
}

const STAT_CONFIGS: Record<string, StatConfig> = {
  mood: {
    id: 'mood',
    label: 'Happiness',
    min: 0,
    max: 1,
    minIcon: sadIcon,
    maxIcon: happyIcon,
  },
  attitude: {
    id: 'attitude',
    label: 'Loyalty',
    min: 0,
    max: 1,
    minIcon: disapproveIcon,
    maxIcon: approveIcon,
  },
  selfEsteem: {
    id: 'selfEsteem',
    label: 'Self-Esteem',
    min: -0.99,
    max: 2,
    minIcon: Traits.getIcon('MODEST')!,
    maxIcon: Traits.getIcon('DEMANDING')!,
  },
};

export class Stats {
  static get(id: string): StatConfig | undefined {
    return STAT_CONFIGS[id];
  }

  static getAll(): StatConfig[] {
    return Object.values(STAT_CONFIGS);
  }

  static readonly MOOD = STAT_CONFIGS.mood;
  static readonly ATTITUDE = STAT_CONFIGS.attitude;
  static readonly SELF_ESTEEM = STAT_CONFIGS.selfEsteem;
}
