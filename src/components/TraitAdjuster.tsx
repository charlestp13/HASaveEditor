import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DISPLAYABLE_TRAITS, TRAIT_CONFLICTS, type DisplayableTrait } from '@/lib/character-traits';
import { toTitleCase } from '@/lib/utils';

const MAX_TRAITS = 2;
const SELECTED_BORDER_COLOR = '#caff96';
const TAB_CONTENT_MIN_HEIGHT = 'min-h-[400px]';
const TRAIT_GRID_CLASSES = 'grid grid-cols-2 gap-2';

interface TraitAdjusterProps {
  traits: string[];
  onAdd: (trait: string) => void;
  onRemove: (trait: string) => void;
}

export function TraitAdjuster({ traits, onAdd, onRemove }: TraitAdjusterProps) {
  const displayableCurrentTraits = useMemo(
    () => traits.filter(t => DISPLAYABLE_TRAITS.includes(t as DisplayableTrait)),
    [traits]
  );

  const atMaxTraits = useMemo(
    () => displayableCurrentTraits.length >= MAX_TRAITS,
    [displayableCurrentTraits]
  );

  const { conflictPairs, nonConflictingTraits } = useMemo(() => {
    const seenTraits = new Set<string>();
    const pairs: Array<[string, string]> = [];
    const nonConflicting: string[] = [];

    DISPLAYABLE_TRAITS.forEach(trait => {
      if (seenTraits.has(trait)) return;
      
      const conflictTrait = TRAIT_CONFLICTS[trait];
      if (conflictTrait && DISPLAYABLE_TRAITS.includes(conflictTrait as DisplayableTrait)) {
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
    const conflictTrait = TRAIT_CONFLICTS[trait];
    if (conflictTrait && traits.includes(conflictTrait)) return true;
    return atMaxTraits;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit Traits</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
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
      </DialogContent>
    </Dialog>
  );
}

const SELECTED_BORDER_STYLE = { borderLeftColor: SELECTED_BORDER_COLOR };

interface TraitButtonProps {
  trait: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function TraitButton({ trait, isSelected, isDisabled, onClick }: TraitButtonProps) {
  const isClickable = isSelected || !isDisabled;
  
  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`flex items-center gap-2 px-3 py-2 rounded border bg-card hover:bg-accent transition-colors text-left ${
        isSelected ? 'border-l-4' : ''
      } ${!isClickable ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={isSelected ? SELECTED_BORDER_STYLE : undefined}
    >
      <img 
        src={`/traits/${trait}.png`} 
        alt={trait} 
        className="w-5 h-5 object-contain flex-shrink-0"
      />
      <span className="text-sm font-medium flex-1">
        {toTitleCase(trait.replace(/_/g, ' '))}
      </span>
    </button>
  );
}