import alcoholicIcon from '@/assets/traits/ALCOHOLIC.png';
import arrogantIcon from '@/assets/traits/ARROGANT.png';
import calmIcon from '@/assets/traits/CALM.png';
import chasteIcon from '@/assets/traits/CHASTE.png';
import cheeryIcon from '@/assets/traits/CHEERY.png';
import demandingIcon from '@/assets/traits/DEMANDING.png';
import disciplinedIcon from '@/assets/traits/DISCIPLINED.png';
import hardworkingIcon from '@/assets/traits/HARDWORKING.png';
import heartbreakerIcon from '@/assets/traits/HEARTBREAKER.png';
import hotheadedIcon from '@/assets/traits/HOTHEADED.png';
import indifferentIcon from '@/assets/traits/INDIFFERENT.png';
import junkieIcon from '@/assets/traits/JUNKIE.png';
import lazyIcon from '@/assets/traits/LAZY.png';
import leaderIcon from '@/assets/traits/LEADER.png';
import ludomaniacIcon from '@/assets/traits/LUDOMANIAC.png';
import melancholicIcon from '@/assets/traits/MELANCHOLIC.png';
import misogynistIcon from '@/assets/traits/MISOGYNIST.png';
import modestIcon from '@/assets/traits/MODEST.png';
import openMindedIcon from '@/assets/traits/OPEN_MINDED.png';
import perfectionistIcon from '@/assets/traits/PERFECTIONIST.png';
import racistIcon from '@/assets/traits/RACIST.png';
import simpleIcon from '@/assets/traits/SIMPLE.png';
import teamPlayerIcon from '@/assets/traits/TEAM_PLAYER.png';
import undisciplinedIcon from '@/assets/traits/UNDISCIPLINED.png';
import unwantedActorIcon from '@/assets/traits/UNWANTED_ACTOR.png';
import xenophobeIcon from '@/assets/traits/XENOPHOBE.png';

export const DISPLAYABLE_TRAITS = [
  "ALCOHOLIC",
  "ARROGANT",
  "CALM",
  "CHASTE",
  "CHEERY",
  "DEMANDING",
  "DISCIPLINED",
  "HARDWORKING",
  "HEARTBREAKER",
  "HOTHEADED",
  "INDIFFERENT",
  "JUNKIE",
  "LAZY",
  "LEADER",
  "LUDOMANIAC",
  "MELANCHOLIC",
  "MISOGYNIST",
  "MODEST",
  "OPEN_MINDED",
  "PERFECTIONIST",
  "RACIST",
  "SIMPLE",
  "TEAM_PLAYER",
  "UNDISCIPLINED",
  "UNWANTED_ACTOR",
  "XENOPHOBE"
] as const;

export type DisplayableTrait = typeof DISPLAYABLE_TRAITS[number];

const TRAIT_ICONS: Record<DisplayableTrait, string> = {
  ALCOHOLIC: alcoholicIcon,
  ARROGANT: arrogantIcon,
  CALM: calmIcon,
  CHASTE: chasteIcon,
  CHEERY: cheeryIcon,
  DEMANDING: demandingIcon,
  DISCIPLINED: disciplinedIcon,
  HARDWORKING: hardworkingIcon,
  HEARTBREAKER: heartbreakerIcon,
  HOTHEADED: hotheadedIcon,
  INDIFFERENT: indifferentIcon,
  JUNKIE: junkieIcon,
  LAZY: lazyIcon,
  LEADER: leaderIcon,
  LUDOMANIAC: ludomaniacIcon,
  MELANCHOLIC: melancholicIcon,
  MISOGYNIST: misogynistIcon,
  MODEST: modestIcon,
  OPEN_MINDED: openMindedIcon,
  PERFECTIONIST: perfectionistIcon,
  RACIST: racistIcon,
  SIMPLE: simpleIcon,
  TEAM_PLAYER: teamPlayerIcon,
  UNDISCIPLINED: undisciplinedIcon,
  UNWANTED_ACTOR: unwantedActorIcon,
  XENOPHOBE: xenophobeIcon,
};

export function getTraitIcon(trait: string): string | undefined {
  return TRAIT_ICONS[trait as DisplayableTrait];
}

export function isDisplayableTrait(trait: string): trait is DisplayableTrait {
  return (DISPLAYABLE_TRAITS as readonly string[]).includes(trait);
}

export const TRAIT_CONFLICTS: Record<string, string> = {
  "HARDWORKING": "LAZY",
  "LAZY": "HARDWORKING",
  "DISCIPLINED": "UNDISCIPLINED",
  "UNDISCIPLINED": "DISCIPLINED",
  "PERFECTIONIST": "INDIFFERENT",
  "INDIFFERENT": "PERFECTIONIST",
  "HOTHEADED": "CALM",
  "CALM": "HOTHEADED",
  "DEMANDING": "MODEST",
  "MODEST": "DEMANDING",
  "ARROGANT": "SIMPLE",
  "SIMPLE": "ARROGANT",
  "HEARTBREAKER": "CHASTE",
  "CHASTE": "HEARTBREAKER",
  "CHEERY": "MELANCHOLIC",
  "MELANCHOLIC": "CHEERY"
};