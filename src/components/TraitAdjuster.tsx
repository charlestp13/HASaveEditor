import { useMemo } from 'react';
import {
  Dialog,
  NonModalDialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { IconButton } from '@/components/IconButton';
import { Traits, Formatter } from '@/lib';

const MAX_TRAITS = 2;
const SELECTED_BORDER_COLOR = '#caff96';
const TAB_CONTENT_MIN_HEIGHT = 'min-h-[400px]';
const TRAIT_GRID_CLASSES = 'grid grid-cols-2 gap-2';

interface TraitAdjusterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traits: string[];
  onAdd: (trait: string) => void;
  onRemove: (trait: string) => void;
}

export function TraitAdjuster({ open, onOpenChange, traits, onAdd, onRemove }: TraitAdjusterProps) {
  const displayableCurrentTraits = useMemo(
    () => traits.filter(Traits.isDisplayable),
    [traits]
  );

  const atMaxTraits = displayableCurrentTraits.length >= MAX_TRAITS;

  const { conflictPairs, nonConflictingTraits } = useMemo(() => {
    const seenTraits = new Set<string>();
    const pairs: Array<[string, string]> = [];
    const nonConflicting: string[] = [];

    Traits.LIST.forEach(trait => {
      if (seenTraits.has(trait)) return;
      
      const conflictTrait = Traits.CONFLICTS[trait];
      if (conflictTrait && Traits.isDisplayable(conflictTrait)) {
        pairs.push([trait, conflictTrait]);
        seenTraits.add(trait);
        seenTraits.add(conflictTrait);
      } else {
        nonConflicting.push(trait);
      }
    });

    return { conflictPairs: pairs, nonConflictingTraits: nonConflicting };
  }, []);

  const handleTraitClick = (trait: string) => {
    if (traits.includes(trait)) {
      onRemove(trait);
    } else if (!isTraitDisabled(trait)) {
      onAdd(trait);
    }
  };

  const isTraitDisabled = (trait: string): boolean => {
    if (traits.includes(trait)) return false;
    const conflictTrait = Traits.CONFLICTS[trait];
    if (conflictTrait && traits.includes(conflictTrait)) return true;
    return atMaxTraits;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <NonModalDialogContent className="max-w-2xl" onClose={() => onOpenChange(false)} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            Edit Character Traits ({displayableCurrentTraits.length}/{MAX_TRAITS})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="conflicting" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conflicting">Conflicting</TabsTrigger>
            <TabsTrigger value="non-conflicting">Non-Conflicting</TabsTrigger>
          </TabsList>

          <TabsContent value="conflicting" className={`space-y-2 mt-4 ${TAB_CONTENT_MIN_HEIGHT}`}>
            {conflictPairs.length > 0 ? (
              conflictPairs.map(([trait1, trait2]) => (
                <div key={`${trait1}-${trait2}`} className={TRAIT_GRID_CLASSES}>
                  <TraitButton
                    trait={trait1}
                    isSelected={traits.includes(trait1)}
                    isDisabled={isTraitDisabled(trait1)}
                    onClick={() => handleTraitClick(trait1)}
                  />
                  <TraitButton
                    trait={trait2}
                    isSelected={traits.includes(trait2)}
                    isDisabled={isTraitDisabled(trait2)}
                    onClick={() => handleTraitClick(trait2)}
                  />
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No conflicting traits available
              </div>
            )}
          </TabsContent>

          <TabsContent value="non-conflicting" className={`mt-4 ${TAB_CONTENT_MIN_HEIGHT}`}>
            {nonConflictingTraits.length > 0 ? (
              <div className={TRAIT_GRID_CLASSES}>
                {nonConflictingTraits.map(trait => (
                  <TraitButton
                    key={trait}
                    trait={trait}
                    isSelected={traits.includes(trait)}
                    isDisabled={isTraitDisabled(trait)}
                    onClick={() => handleTraitClick(trait)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No non-conflicting traits available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </NonModalDialogContent>
    </Dialog>
  );
}

interface TraitButtonProps {
  trait: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function TraitButton({ trait, isSelected, isDisabled, onClick }: TraitButtonProps) {
  const icon = Traits.getIcon(trait);
  const label = Formatter.toTitleCase(trait);
  
  return (
    <IconButton
      icon={icon}
      label={label}
      isSelected={isSelected}
      isDisabled={isDisabled}
      selectedBorderColor={SELECTED_BORDER_COLOR}
      onClick={onClick}
      iconSize="md"
      textAlign="left"
    />
  );
}