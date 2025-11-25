import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter } from 'lucide-react';
import { toTitleCase } from '@/lib/utils';
import deadIcon from '@/assets/DEAD.png';
import unemployedIcon from '@/assets/UN.png';
import lockedIcon from '@/assets/LOCK.png';

const SELECTED_BORDER_COLOR = '#ff71a9';

const OPPONENT_STUDIOS = [
  { id: 'GB', name: 'Gerstein Brothers', icon: 'GB.png' },
  { id: 'EM', name: 'Evergreen Movies', icon: 'EM.png' },
  { id: 'SU', name: 'Supreme', icon: 'SU.png' },
  { id: 'HE', name: 'Hephaestus', icon: 'HE.png' },
  { id: 'MA', name: 'Marginese', icon: 'MA.png' },
];

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  isDynamic?: boolean;
}

interface SectionHeader {
  type: 'header';
  label: string;
}

interface SectionSeparator {
  type: 'separator';
}

type FilterItem = FilterOption | SectionHeader | SectionSeparator;

interface FilterPopoverProps {
  playerStudioName: string;
  playerLogoId: number;
  availableStudios: string[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  className?: string;
}

export function FilterPopover({
  playerStudioName,
  playerLogoId,
  availableStudios,
  selectedFilters,
  onFilterChange,
  className,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const playerIcon = `/src/assets/PL${playerLogoId}.png`;

  const studioOptions: FilterOption[] = [
    { id: 'PL', label: toTitleCase(playerStudioName), icon: playerIcon, isDynamic: true },
    ...OPPONENT_STUDIOS
      .filter(studio => availableStudios.includes(studio.id))
      .map(studio => ({
        id: studio.id,
        label: studio.name,
        icon: `/src/assets/${studio.icon}`,
      })),
    { id: 'Unemployed', label: 'Unemployed', icon: unemployedIcon },
  ];

  const statusOptions: FilterOption[] = [
    { id: 'Dead', label: 'Deceased', icon: deadIcon },
    { id: 'Locked', label: 'Locked', icon: lockedIcon },
  ];

  const allItems: FilterItem[] = [
    { type: 'header', label: 'Studio' },
    ...studioOptions,
    { type: 'separator' },
    { type: 'header', label: 'Status' },
    ...statusOptions,
  ];

  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      onFilterChange(selectedFilters.filter(f => f !== filterId));
    } else {
      onFilterChange([...selectedFilters, filterId]);
    }
  };

  const activeCount = selectedFilters.length;

  return (
    <div className={`${className} relative`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground z-50">
            {activeCount}
          </span>
        )}
        <PopoverContent className="w-auto min-w-[240px] max-w-sm" align="end">
        <div className="space-y-1">
          <div className="pb-2 font-medium text-sm">Hide Characters</div>
          {allItems.map((item, index) => {
            if ('type' in item) {
              if (item.type === 'header') {
                return (
                  <div key={`header-${index}`} className="pt-2 pb-1 px-2 text-xs font-semibold text-primary uppercase tracking-wide">
                    {item.label}
                  </div>
                );
              } else {
                return <div key={`sep-${index}`} className="my-2 border-t border-border" />;
              }
            }
            return (
              <FilterOptionItem
                key={item.id}
                option={item}
                isSelected={selectedFilters.includes(item.id)}
                onToggle={() => toggleFilter(item.id)}
              />
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}

interface FilterOptionItemProps {
  option: FilterOption;
  isSelected: boolean;
  onToggle: () => void;
}

function FilterOptionItem({ option, isSelected, onToggle }: FilterOptionItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-2 py-1.5 rounded hover:bg-accent transition-colors ${
        isSelected ? 'border-l-4' : ''
      }`}
      style={isSelected ? { borderLeftColor: SELECTED_BORDER_COLOR } : undefined}
    >
      <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
        <img
          src={option.icon}
          alt={option.label}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            if (option.isDynamic) {
              const img = e.target as HTMLImageElement;
              img.src = '/src/assets/PL0.png';
            }
          }}
        />
      </div>
      <span className="flex-1 text-left text-sm">{option.label}</span>
    </button>
  );
}