import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GoldIcon } from '@/components/GoldIcon';
import { Layers } from 'lucide-react';
import { Studios, Formatter, Stats } from '@/lib';

interface BatchPopoverProps {
  playerStudioName: string;
  playerLogoId: number;
  availableStudios: string[];
  onBatchUpdate?: (studioId: string, field: string, value: number) => void;
}

interface StudioButtonProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const StudioButton = memo(function StudioButton({ icon, label, isSelected, onClick }: StudioButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        isSelected ? 'bg-primary/20 ring-2 ring-offset-1 ring-[#ff71a9]' : 'hover:bg-muted'
      }`}
      title={label}
    >
      <GoldIcon src={icon} alt={label} className="w-6 h-6" />
    </button>
  );
});

interface StatBatchRowProps {
  label: string;
  minIcon: string;
  maxIcon: string;
  onMin: () => void;
  onMax: () => void;
}

const StatBatchRow = memo(function StatBatchRow({ label, minIcon, maxIcon, onMin, onMax }: StatBatchRowProps) {
  return (
    <div className="relative flex border border-border rounded overflow-hidden">
      <button
        onClick={onMin}
        className="flex-1 flex items-center py-1.5 px-2 transition-colors hover:bg-[linear-gradient(to_right,rgba(239,68,68,0.2),transparent)] active:bg-[linear-gradient(to_right,rgba(239,68,68,0.3),transparent)]"
        title={`Set all ${label} to 0%`}
      >
        <GoldIcon src={minIcon} alt="Min" className="w-5 h-5" />
      </button>
      <button
        onClick={onMax}
        className="flex-1 flex items-center justify-end py-1.5 px-2 transition-colors hover:bg-[linear-gradient(to_left,rgba(34,197,94,0.2),transparent)] active:bg-[linear-gradient(to_left,rgba(34,197,94,0.3),transparent)]"
        title={`Set all ${label} to 100%`}
      >
        <GoldIcon src={maxIcon} alt="Max" className="w-5 h-5" />
      </button>
      <span className="absolute inset-0 flex items-center justify-center text-sm pointer-events-none">{label}</span>
    </div>
  );
});

export const BatchPopover = memo(function BatchPopover({
  playerStudioName,
  playerLogoId,
  availableStudios,
  onBatchUpdate,
}: BatchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<string>('PL');

  const studioOptions = useMemo(() => {
    const playerIcon = Studios.getPlayerLogoIcon(playerLogoId);
    
    const options = [
      { id: 'PL', label: Formatter.toTitleCase(playerStudioName), icon: playerIcon },
    ];
    
    const opponentStudios = Studios.OPPONENTS.filter(studio => 
      availableStudios.includes(studio.id)
    );
    
    options.push(...opponentStudios.map(studio => ({
      id: studio.id,
      label: studio.name,
      icon: studio.icon,
    })));
    
    return options;
  }, [playerStudioName, playerLogoId, availableStudios]);

  const handleBatchUpdate = (field: string, value: number) => {
    onBatchUpdate?.(selectedStudio, field, value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Layers className="h-4 w-4" />
          Batch
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">Select Studio</h4>
            <div className="flex flex-wrap gap-1">
              {studioOptions.map((studio) => (
                <StudioButton
                  key={studio.id}
                  icon={studio.icon}
                  label={studio.label}
                  isSelected={selectedStudio === studio.id}
                  onClick={() => setSelectedStudio(studio.id)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-3">
            <h4 className="font-medium text-sm mb-2">Batch Actions</h4>
            <div className="space-y-2">
              {Stats.getAll().map((stat) => (
                <StatBatchRow
                  key={stat.id}
                  label={stat.label}
                  minIcon={stat.minIcon}
                  maxIcon={stat.maxIcon}
                  onMin={() => handleBatchUpdate(stat.id, stat.min)}
                  onMax={() => handleBatchUpdate(stat.id, stat.max)}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});