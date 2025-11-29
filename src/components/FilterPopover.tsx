import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter } from 'lucide-react';
import { Formatter, Studios } from '@/lib';
import deadIcon from '@/assets/DEAD.png';
import unemployedIcon from '@/assets/UN.png';
import lockedIcon from '@/assets/LOCK.png';
import maleIcon from '@/assets/MALE.png';
import femaleIcon from '@/assets/FEMALE.png';
import shadyIcon from '@/assets/SHADY.png';
import noShadyIcon from '@/assets/NOSHADY.png';

const SELECTED_BORDER_COLOR = '#ff71a9';

const STATUS_OPTIONS = [
  { id: 'Dead', label: 'Deceased', icon: deadIcon },
  { id: 'Locked', label: 'Locked', icon: lockedIcon },
];

interface FilterOption {
  id: string;
  label: string;
  icon: string;
  isDynamic?: boolean;
  isSpecial?: boolean;
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
  genderFilter: 'all' | 'male' | 'female';
  onGenderFilterChange: (filter: 'all' | 'male' | 'female') => void;
  shadyFilter: 'all' | 'shady' | 'notShady';
  onShadyFilterChange: (filter: 'all' | 'shady' | 'notShady') => void;
  className?: string;
}

interface ToggleFilterSectionProps {
  title: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string; icon?: string }>;
}

const ToggleFilterSection = memo(function ToggleFilterSection({ 
  title, 
  value, 
  onValueChange, 
  options 
}: ToggleFilterSectionProps) {
  return (
    <div>
      <div className="pb-1 px-2 text-xs font-semibold text-primary uppercase tracking-wide">{title}</div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={onValueChange}
        className="justify-start px-2"
      >
        {options.map((option) => (
          <ToggleGroupItem 
            key={option.value} 
            value={option.value} 
            className={option.value === 'all' ? 'flex-1' : 'gap-2'}
          >
            {option.icon && <img src={option.icon} alt={option.label} className="w-4 h-4" />}
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
});

export const FilterPopover = memo(function FilterPopover({
  playerStudioName,
  playerLogoId,
  availableStudios,
  selectedFilters,
  onFilterChange,
  genderFilter,
  onGenderFilterChange,
  shadyFilter,
  onShadyFilterChange,
  className,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);

  const opponentStudios = useMemo(() => 
    Studios.OPPONENTS.filter(studio => availableStudios.includes(studio.id)),
    [availableStudios]
  );

  const competitorIds = opponentStudios.map(s => s.id);

  const studioOptions = useMemo((): FilterOption[] => {
    const playerIcon = Studios.getPlayerLogoIcon(playerLogoId);
    
    return [
      { id: 'PL', label: Formatter.toTitleCase(playerStudioName), icon: playerIcon, isDynamic: true },
      { id: 'Unemployed', label: 'Unemployed', icon: unemployedIcon },
      { id: 'ALL_COMPETITORS', label: 'All Competitors', icon: Studios.ALL_COMPETITORS_ICON, isSpecial: true },
      ...opponentStudios.map(studio => ({
        id: studio.id,
        label: studio.name,
        icon: studio.icon,
      })),
    ];
  }, [playerStudioName, playerLogoId, opponentStudios]);

  const allItems = useMemo((): FilterItem[] => [
    { type: 'header', label: 'Studio' },
    ...studioOptions,
    { type: 'separator' },
    { type: 'header', label: 'Status' },
    ...STATUS_OPTIONS,
  ], [studioOptions]);

  const toggleFilter = (filterId: string) => {
    if (filterId === 'ALL_COMPETITORS') {
      const allSelected = competitorIds.every(id => selectedFilters.includes(id));
      
      if (allSelected) {
        onFilterChange(selectedFilters.filter(f => !competitorIds.includes(f)));
      } else {
        const newFilters = [...selectedFilters];
        competitorIds.forEach(id => {
          if (!newFilters.includes(id)) {
            newFilters.push(id);
          }
        });
        onFilterChange(newFilters);
      }
    } else {
      if (selectedFilters.includes(filterId)) {
        onFilterChange(selectedFilters.filter(f => f !== filterId));
      } else {
        onFilterChange([...selectedFilters, filterId]);
      }
    }
  };

  const isAllCompetitorsSelected = useMemo(() => 
    competitorIds.length > 0 && competitorIds.every(id => selectedFilters.includes(id)),
    [competitorIds, selectedFilters]
  );

  const activeCount = selectedFilters.length + 
    (genderFilter !== 'all' ? 1 : 0) + 
    (shadyFilter !== 'all' ? 1 : 0);

  return (
    <div className={className ? `${className} relative` : 'relative'}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </PopoverTrigger>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
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
              }
              if (item.type === 'separator') {
                return <div key={`sep-${index}`} className="my-2 border-t border-border" />;
              }
            }
            return (
              <FilterOptionItem
                key={item.id}
                option={item}
                isSelected={item.isSpecial ? isAllCompetitorsSelected : selectedFilters.includes(item.id)}
                onToggle={() => toggleFilter(item.id)}
              />
            );
          })}

          <div className="my-2 border-t border-border" />

          <div className="pb-2 font-medium text-sm">Show Characters</div>

          <ToggleFilterSection
            title="Gender"
            value={genderFilter}
            onValueChange={(value) => onGenderFilterChange(value as typeof genderFilter)}
            options={[
              { value: 'male', label: 'Male', icon: maleIcon },
              { value: 'all', label: 'All' },
              { value: 'female', label: 'Female', icon: femaleIcon },
            ]}
          />

          <ToggleFilterSection
            title="Shady"
            value={shadyFilter}
            onValueChange={(value) => onShadyFilterChange(value as typeof shadyFilter)}
            options={[
              { value: 'shady', label: 'Shady', icon: shadyIcon },
              { value: 'all', label: 'All' },
              { value: 'notShady', label: 'Clean', icon: noShadyIcon },
            ]}
          />
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
});

interface FilterOptionItemProps {
  option: FilterOption;
  isSelected: boolean;
  onToggle: () => void;
}

const FilterOptionItem = memo(function FilterOptionItem({ option, isSelected, onToggle }: FilterOptionItemProps) {
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
});