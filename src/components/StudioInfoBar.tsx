import { useState, useEffect, memo } from 'react';
import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ResearchBonusAdjuster } from '@/components/ResearchBonusAdjuster';
import { GoldIcon } from '@/components/GoldIcon';
import { Studios, Departments, Formatter, type CompetitorStudio } from '@/lib';
import budgetIcon from '@/assets/BUDGET.png';
import cashIcon from '@/assets/CASH.png';
import reputationIcon from '@/assets/REPUTATION.png';
import influenceIcon from '@/assets/IP.png';
import deadIcon from '@/assets/DEAD.png';

const LEGAL_GIFTS = [
  { id: 'ALCOHOL', name: 'Whiskey Glennafola 50 Cask Strength' },
  { id: 'EUROPEAN_SPORTCAR', name: 'Lussuria Atlantic Sports Car' },
  { id: 'SIGARS', name: 'Alexandre Dumas Siglo VI Cigars' },
  { id: 'WARDROBE_COUTURE', name: 'Wardrobe by Christo Duvalier' },
  { id: 'WATCH', name: 'Silvermoon Kronos Watch' },
] as const;

const ILLEGAL_GIFTS = [
  { id: 'ANIMAL_MURDER', name: 'Safari' },
  { id: 'CANNIBAL_DINNER', name: 'Human Flesh' },
  { id: 'COCAINE', name: 'Cocaine' },
  { id: 'EVENING_WITH_UNDERAGED', name: 'Time with a Minor' },
  { id: 'HEROIN', name: 'Heroin' },
  { id: 'ILLEGAL_SAFARI', name: 'Pilgrim-Style Hunt' },
  { id: 'METH', name: 'Methamphetamines' },
  { id: 'MONKEY_BRAINS', name: 'Monkey Brains' },
  { id: 'PORNO_TAPE', name: 'A Spicy Film Strip' },
] as const;

const TITAN_FACTIONS = [
  { icon: 'BUSINESS', titanIds: ['BUSINESS_SIMMONS'], name: 'Business' },
  { icon: 'JOURNALIST', titanIds: ['JOURNALIST_RITA'], name: 'Journalist' },
  { icon: 'KKK', titanIds: ['KKK_OLBERICH'], name: 'KKK' },
  { icon: 'BOOTLEG', titanIds: ['IRELAND_DOYLE'], name: 'Bootleggers' },
  { icon: 'ITALIAN', titanIds: ['ITALIAN_ALBERTO', 'ITALIAN_ARMANDO'], name: 'Italian Mafia' },
  { icon: 'REICH', titanIds: ['REICH_ZIBBELE', 'REICH_STELM'], name: 'Reich' },
  { icon: 'POLICE', titanIds: ['POLICE_WALLIS'], name: 'Police' },
  { icon: 'CARPENTER', titanIds: ['MAYOR_CARPENTER'], name: 'Mayor Carpenter' },
  { icon: 'STRIPE', titanIds: ['MAYOR_STRIPES', 'PROSECUTOR_STRIPES'], name: 'Stripes' },
] as const;

type GiftId = typeof LEGAL_GIFTS[number]['id'] | typeof ILLEGAL_GIFTS[number]['id'];
type TitanIcon = typeof TITAN_FACTIONS[number]['icon'];
type ViewMode = '' | 'resources' | 'opponents' | 'departments';

const giftIcons: Record<GiftId, string> = {} as Record<GiftId, string>;
const importGiftIcon = (name: string) => {
  try {
    return new URL(`../assets/gifts/${name}.png`, import.meta.url).href;
  } catch {
    return '';
  }
};

[...LEGAL_GIFTS, ...ILLEGAL_GIFTS].forEach((gift) => {
  giftIcons[gift.id] = importGiftIcon(gift.id);
});

const titanIcons: Record<TitanIcon, string> = {} as Record<TitanIcon, string>;
const importTitanIcon = (name: string) => {
  try {
    return new URL(`../assets/titans/${name}.png`, import.meta.url).href;
  } catch {
    return '';
  }
};

TITAN_FACTIONS.forEach((faction) => {
  titanIcons[faction.icon] = importTitanIcon(faction.icon);
});

interface StudioInfoBarProps {
  currentDate: string;
  studioName: string;
  fileName: string;
  budget: number;
  cash: number;
  reputation: number;
  influence: number;
  resources: Record<string, number>;
  titans: Record<string, number>;
  timeBonuses: Record<string, number>;
  competitors: CompetitorStudio[];
  onStudioUpdate?: (field: 'budget' | 'cash' | 'reputation' | 'influence', value: number) => void;
  onResourceUpdate?: (resourceId: string, value: number) => void;
  onTitanUpdate?: (titanId: string, value: number) => void;
  onTimeBonusUpdate?: (department: string, value: number) => void;
  onCompetitorUpdate?: (competitorId: string, field: 'lastBudget' | 'ip' | 'budgetCheatsRemaining', value: number) => void;
}

export const StudioInfoBar = memo(function StudioInfoBar({
  currentDate,
  studioName,
  fileName,
  budget,
  cash,
  reputation,
  influence,
  resources,
  titans,
  timeBonuses,
  competitors,
  onStudioUpdate,
  onResourceUpdate,
  onTitanUpdate,
  onTimeBonusUpdate,
  onCompetitorUpdate,
}: StudioInfoBarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('');

  const getActiveTitan = (faction: typeof TITAN_FACTIONS[number]): { titanId: string; value: number } | null => {
    for (const titanId of faction.titanIds) {
      if (titanId in titans) {
        return { titanId, value: titans[titanId] };
      }
    }
    return null;
  };

  const getStudioInfo = (id: string) => {
    return Studios.OPPONENTS.find(s => s.id === id);
  };

  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4 py-3 space-y-2">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm items-center justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
            <div>
              <span className="text-muted-foreground">Date:</span>{' '}
              <span className="font-medium">{currentDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Studio:</span>{' '}
              <span className="font-medium">{studioName}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Save File:</span>{' '}
            <span className="font-medium">{fileName}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <NumericInput
              icon={budgetIcon}
              alt="Budget"
              value={budget}
              onChange={(v) => onStudioUpdate?.('budget', v)}
              formatDisplay={Formatter.formatDollar}
              width="w-32"
              goldTint
            />
            <NumericInput
              icon={cashIcon}
              alt="Cash"
              value={cash}
              onChange={(v) => onStudioUpdate?.('cash', v)}
              formatDisplay={Formatter.formatDollar}
              width="w-32"
              goldTint
            />
            <NumericInput
              icon={reputationIcon}
              alt="Reputation"
              value={reputation}
              onChange={(v) => onStudioUpdate?.('reputation', v)}
              integer={false}
              width="w-32"
              goldTint
            />
            <NumericInput
              icon={influenceIcon}
              alt="Influence"
              value={influence}
              onChange={(v) => onStudioUpdate?.('influence', v)}
              width="w-32"
              goldTint
            />
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="h-7"
          >
            <ToggleGroupItem value="resources" className="h-7 px-3 text-xs">
              Resources
            </ToggleGroupItem>
            <ToggleGroupItem value="opponents" className="h-7 px-3 text-xs">
              Opponents
            </ToggleGroupItem>
            <ToggleGroupItem value="departments" className="h-7 px-3 text-xs">
              Departments
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            viewMode === 'resources' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-3 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Titans Goodwill</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
                {TITAN_FACTIONS.map((faction) => {
                  const active = getActiveTitan(faction);
                  if (!active) return null;
                  return (
                    <NumericInput
                      key={faction.icon}
                      icon={titanIcons[faction.icon]}
                      alt={faction.name}
                      value={active.value}
                      width="w-16"
                      onChange={(v) => onTitanUpdate?.(active.titanId, v)}
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Gifts</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
                {LEGAL_GIFTS.map((gift) => (
                  <NumericInput
                    key={gift.id}
                    icon={giftIcons[gift.id]}
                    alt={gift.name}
                    value={resources[gift.id] ?? 0}
                    width="w-16"
                    onChange={(v) => onResourceUpdate?.(gift.id, v)}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Illegal Gifts</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
                {ILLEGAL_GIFTS.map((gift) => (
                  <NumericInput
                    key={gift.id}
                    icon={giftIcons[gift.id]}
                    alt={gift.name}
                    value={resources[gift.id] ?? 0}
                    width="w-16"
                    onChange={(v) => onResourceUpdate?.(gift.id, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            viewMode === 'opponents' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t">
            <div className="grid gap-3">
              {competitors.map((competitor) => {
                const studioInfo = getStudioInfo(competitor.id);
                if (!studioInfo) return null;
                const currentBudget = competitor.last_budget + competitor.income_this_month;
                
                return (
                  <div key={competitor.id} className="flex items-center gap-3 text-sm">
                    <img
                      src={studioInfo.icon}
                      alt={studioInfo.name}
                      title={studioInfo.name}
                      className="h-6 w-6"
                      style={{ filter: 'brightness(0) saturate(100%) invert(76%) sepia(29%) saturate(616%) hue-rotate(357deg) brightness(95%) contrast(89%) drop-shadow(0 0 3px rgba(212, 168, 85, 0.8))' }}
                    />
                    <span className="font-medium w-32">{studioInfo.name}</span>
                    <div className="flex items-center gap-1 w-16">
                      {competitor.is_dead ? (
                        <span className="flex items-center gap-1 text-destructive">
                          <img src={deadIcon} alt="Bankrupt" className="h-4 w-4" />
                          <span className="text-xs">Bankrupt</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-4 w-4" />
                          <span className="text-xs">Active</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <GoldIcon src={budgetIcon} alt="Budget" className="h-4 w-4" />
                      <span className="text-muted-foreground text-xs">Current:</span>
                      <span className="font-mono text-xs w-20 inline-block truncate" title={Formatter.formatDollar(currentBudget)}>{Formatter.formatDollar(currentBudget)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GoldIcon src={budgetIcon} alt="Budget" className="h-4 w-4" />
                      <span className="text-muted-foreground text-xs">Last:</span>
                      <NumericInput
                        alt={`${studioInfo.name} Last Budget`}
                        value={competitor.last_budget}
                        onChange={(v) => onCompetitorUpdate?.(competitor.id, 'lastBudget', v)}
                        formatDisplay={Formatter.formatDollar}
                        width="w-28"
                        inputClassName="text-xs truncate"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <GoldIcon src={influenceIcon} alt="IP" className="h-4 w-4" />
                      <NumericInput
                        alt={`${studioInfo.name} IP`}
                        value={competitor.ip}
                        onChange={(v) => onCompetitorUpdate?.(competitor.id, 'ip', v)}
                        width="w-16"
                        inputClassName="text-xs truncate"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground text-xs">Cheats:</span>
                      <NumericInput
                        alt={`${studioInfo.name} Cheats`}
                        value={competitor.budget_cheats_remaining}
                        onChange={(v) => onCompetitorUpdate?.(competitor.id, 'budgetCheatsRemaining', v)}
                        width="w-16"
                        inputClassName="text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            viewMode === 'departments' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-2 font-medium">Department Wide Research Bonus</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
              {Departments.ALL.map((dept) => (
                <ResearchBonusAdjuster
                  key={dept.id}
                  icon={dept.icon}
                  alt={dept.name}
                  value={timeBonuses[dept.id] ?? 0}
                  onChange={(v) => onTimeBonusUpdate?.(dept.id, v)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

interface NumericInputProps {
  icon?: string;
  alt: string;
  value: number;
  onChange?: (value: number) => void;
  formatDisplay?: (value: number) => string;
  integer?: boolean;
  width?: string;
  inputClassName?: string;
  goldTint?: boolean;
}

const NumericInput = memo(function NumericInput({
  icon,
  alt,
  value,
  onChange,
  formatDisplay = (v) => v.toLocaleString('en-US'),
  integer = true,
  width = 'w-24',
  inputClassName = 'text-sm',
  goldTint = false,
}: NumericInputProps) {
  const [localValue, setLocalValue] = useState(formatDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatDisplay(value));
    }
  }, [value, isFocused, formatDisplay]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = integer ? parseInt(localValue, 10) : parseFloat(localValue);
    if (!isNaN(parsed) && parsed !== value) {
      onChange?.(parsed);
    }
    setLocalValue(formatDisplay(!isNaN(parsed) ? parsed : value));
  };

  const input = (
    <Input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={alt}
      title={localValue}
      className={`h-6 ${width} px-2 py-0 font-mono ${inputClassName}`}
    />
  );

  if (!icon) return input;

  return (
    <div className="flex items-center gap-1">
      {goldTint ? (
        <GoldIcon src={icon} alt={alt} />
      ) : (
        <img src={icon} alt={alt} title={alt} className="h-5 w-5" />
      )}
      {input}
    </div>
  );
});