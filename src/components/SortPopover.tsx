import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowUpDown } from 'lucide-react';
import type { SortField, SortOrder } from '@/lib/person-sorter';

const SELECTED_BORDER_COLOR = '#ff71a9';

interface SortPopoverProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'skill', label: 'Skill' },
  { value: 'selfEsteem', label: 'Self-Esteem' },
  { value: 'age', label: 'Age' },
  { value: 'art', label: 'Artistic Value' },
  { value: 'com', label: 'Commercial Value' },
];

interface SortButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const SortButton = memo(function SortButton({ label, isSelected, onClick }: SortButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
        isSelected ? 'bg-primary text-primary-foreground border-l-4' : 'hover:bg-muted'
      }`}
      style={isSelected ? { borderLeftColor: SELECTED_BORDER_COLOR } : undefined}
    >
      {label}
    </button>
  );
});

export function SortPopover({ sortField, sortOrder, onSortChange }: SortPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSortFieldChange = (field: SortField) => {
    onSortChange(field, sortOrder);
    setOpen(false);
  };

  const handleSortOrderChange = (value: string | undefined) => {
    if (value) onSortChange(sortField, value as SortOrder);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-r-none">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Sort Order</h4>
            <ToggleGroup type="single" value={sortOrder} onValueChange={handleSortOrderChange}>
              <ToggleGroupItem value="asc" className="w-12">
                ASC
              </ToggleGroupItem>
              <ToggleGroupItem value="desc" className="w-12">
                DSC
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">Sort By</h4>
            <div className="space-y-1">
              {SORT_OPTIONS.map((option) => (
                <SortButton
                  key={option.value}
                  label={option.label}
                  isSelected={sortField === option.value}
                  onClick={() => handleSortFieldChange(option.value)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}