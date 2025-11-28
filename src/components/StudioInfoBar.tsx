import { useState, useEffect, useRef, memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import budgetIcon from '@/assets/BUDGET.png';
import cashIcon from '@/assets/CASH.png';
import reputationIcon from '@/assets/REPUTATION.png';
import influenceIcon from '@/assets/IP.png';

const formatDollar = (value: number): string => '$' + value.toLocaleString('en-US');
const formatNumber = (value: number): string => value.toLocaleString('en-US');

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
  onStudioUpdate?: (field: 'budget' | 'cash' | 'reputation' | 'influence', value: number) => void;
  onResourceUpdate?: (resourceId: string, value: number) => void;
  onTitanUpdate?: (titanId: string, value: number) => void;
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
  onStudioUpdate,
  onResourceUpdate,
  onTitanUpdate,
}: StudioInfoBarProps) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, resources, titans]);

  const getActiveTitan = (faction: typeof TITAN_FACTIONS[number]): { titanId: string; value: number } | null => {
    for (const titanId of faction.titanIds) {
      if (titanId in titans) {
        return { titanId, value: titans[titanId] };
      }
    }
    return null;
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
            <CurrencyInput
              icon={budgetIcon}
              alt="Budget"
              value={budget}
              onChange={(v) => onStudioUpdate?.('budget', v)}
              formatDisplay={formatDollar}
              integer
            />
            <CurrencyInput
              icon={cashIcon}
              alt="Cash"
              value={cash}
              onChange={(v) => onStudioUpdate?.('cash', v)}
              formatDisplay={formatDollar}
              integer
            />
            <CurrencyInput
              icon={reputationIcon}
              alt="Reputation"
              value={reputation}
              onChange={(v) => onStudioUpdate?.('reputation', v)}
              formatDisplay={formatNumber}
            />
            <CurrencyInput
              icon={influenceIcon}
              alt="Influence"
              value={influence}
              onChange={(v) => onStudioUpdate?.('influence', v)}
              formatDisplay={formatNumber}
              integer
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 px-2"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Resources
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Resources
              </>
            )}
          </Button>
        </div>

        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: expanded ? contentHeight : 0 }}
        >
          <div ref={contentRef} className="space-y-3 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Titans Goodwill</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
                {TITAN_FACTIONS.map((faction) => {
                  const active = getActiveTitan(faction);
                  if (!active) return null;
                  return (
                    <ResourceInput
                      key={faction.icon}
                      icon={titanIcons[faction.icon]}
                      alt={faction.name}
                      value={active.value}
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
                  <ResourceInput
                    key={gift.id}
                    icon={giftIcons[gift.id]}
                    alt={gift.name}
                    value={resources[gift.id] ?? 0}
                    onChange={(v) => onResourceUpdate?.(gift.id, v)}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2 font-medium">Illegal Gifts</div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm items-center">
                {ILLEGAL_GIFTS.map((gift) => (
                  <ResourceInput
                    key={gift.id}
                    icon={giftIcons[gift.id]}
                    alt={gift.name}
                    value={resources[gift.id] ?? 0}
                    onChange={(v) => onResourceUpdate?.(gift.id, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

interface CurrencyInputProps {
  icon: string;
  alt: string;
  value: number;
  onChange?: (value: number) => void;
  formatDisplay: (value: number) => string;
  integer?: boolean;
}

const CurrencyInput = memo(function CurrencyInput({
  icon,
  alt,
  value,
  onChange,
  formatDisplay,
  integer = false,
}: CurrencyInputProps) {
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

  return (
    <div className="flex items-center gap-1">
      <img src={icon} alt={alt} title={alt} className="h-5 w-5" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={alt}
        className="h-6 w-32 px-2 py-0 text-sm font-mono"
      />
    </div>
  );
});

interface ResourceInputProps {
  icon: string;
  alt: string;
  value: number;
  onChange?: (value: number) => void;
}

const ResourceInput = memo(function ResourceInput({
  icon,
  alt,
  value,
  onChange,
}: ResourceInputProps) {
  const [localValue, setLocalValue] = useState(value.toLocaleString('en-US'));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toLocaleString('en-US'));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setLocalValue(value.toString());
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseInt(localValue, 10);
    if (!isNaN(parsed) && parsed !== value) {
      onChange?.(parsed);
    }
    setLocalValue((!isNaN(parsed) ? parsed : value).toLocaleString('en-US'));
  };

  return (
    <div className="flex items-center gap-1">
      {icon ? (
        <img src={icon} alt={alt} title={alt} className="h-5 w-5" />
      ) : (
        <div className="h-5 w-5 bg-muted rounded text-[8px] flex items-center justify-center" title={alt}>
          {alt.slice(0, 2)}
        </div>
      )}
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-label={alt}
        className="h-6 w-24 px-2 py-0 text-sm font-mono"
      />
    </div>
  );
});