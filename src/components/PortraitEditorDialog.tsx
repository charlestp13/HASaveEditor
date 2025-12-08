import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type PortraitType } from '@/lib';

interface UsedPortrait {
  characterName: string;
  profession: string;
}

interface PortraitEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gender: number;
  currentPortraitId: number;
  usedPortraits: Map<number, UsedPortrait>;
  onSelectPortrait: (portraitId: number) => void;
  portraitType?: PortraitType;
}

let manifestCache: Record<string, string[]> | null = null;
let manifestPromise: Promise<Record<string, string[]>> | null = null;

async function loadManifest(): Promise<Record<string, string[]>> {
  if (manifestCache) return manifestCache;
  if (manifestPromise) return manifestPromise;
  
  manifestPromise = fetch('/media-manifest.json')
    .then(r => r.json())
    .then(data => {
      manifestCache = data.portraits;
      return data.portraits;
    })
    .catch(err => {
      console.warn('Failed to load portrait manifest:', err);
      return {};
    });
  
  return manifestPromise;
}

const PORTRAITS_PER_PAGE = 9;

function PortraitThumbnail({ 
  id, 
  sex, 
  ages,
  portraitType,
}: { 
  id: number; 
  sex: string; 
  ages: string[];
  portraitType: PortraitType;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const getPortraitPath = (age: string) => {
    return `/portraits/${portraitType}_${sex}_${age}_${id}.png`;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ages.length) % ages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ages.length);
  };

  return (
    <div className="relative w-32 h-24 mx-auto pt-5">
      <img
        src={getPortraitPath(ages[currentIndex])}
        alt={`Portrait ${id}`}
        className="object-contain rounded max-h-16 mx-auto"
        style={{ transform: 'scaleX(-1)' }}
      />
      {ages.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-0 -bottom-6 h-8 w-8 bg-background/80 hover:bg-background rounded flex items-center justify-center"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="absolute right-0 -bottom-6 h-8 w-8 bg-background/80 hover:bg-background rounded flex items-center justify-center"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

export function PortraitEditorDialog({
  open,
  onOpenChange,
  gender,
  currentPortraitId,
  usedPortraits,
  onSelectPortrait,
  portraitType = 'TALENT',
}: PortraitEditorDialogProps) {
  const [allPortraitIds, setAllPortraitIds] = useState<number[]>([]);
  const [portraitAges, setPortraitAges] = useState<Record<number, string[]>>({});
  const [currentPage, setCurrentPage] = useState(0);

  const sex = gender === 1 ? 'F' : 'M';

  useEffect(() => {
    if (!open) return;
    
    loadManifest().then(manifest => {
      const prefix = `${portraitType}_${sex}_`;
      const idsWithAges: Record<number, string[]> = {};
      
      Object.entries(manifest).forEach(([key, ages]) => {
        if (key.startsWith(prefix)) {
          const id = parseInt(key.replace(prefix, ''), 10);
          idsWithAges[id] = ages;
        }
      });
      
      const ids = Object.keys(idsWithAges).map(Number).sort((a, b) => a - b);
      setAllPortraitIds(ids);
      setPortraitAges(idsWithAges);
      
      const currentIndex = ids.indexOf(currentPortraitId);
      if (currentIndex >= 0) {
        setCurrentPage(Math.floor(currentIndex / PORTRAITS_PER_PAGE));
      } else {
        setCurrentPage(0);
      }
    });
  }, [open, sex, currentPortraitId, portraitType]);

  const totalPages = Math.ceil(allPortraitIds.length / PORTRAITS_PER_PAGE);
  
  const visiblePortraits = useMemo(() => {
    const start = currentPage * PORTRAITS_PER_PAGE;
    return allPortraitIds.slice(start, start + PORTRAITS_PER_PAGE);
  }, [allPortraitIds, currentPage]);

  const handleSelectPortrait = (portraitId: number) => {
    const usedBy = usedPortraits.get(portraitId);
    if (usedBy && portraitId !== currentPortraitId) {
      return;
    }
    onSelectPortrait(portraitId);
    onOpenChange(false);
  };

  const typeLabel = portraitType === 'TALENT' ? 'Talent' : 'Lieutenant';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            Select {typeLabel} Portrait ({gender === 1 ? 'Female' : 'Male'}) - {allPortraitIds.length} available
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 p-2">
            {visiblePortraits.map(id => {
              const isUsed = usedPortraits.has(id);
              const isCurrent = id === currentPortraitId;
              const usedBy = usedPortraits.get(id);
              const ages = portraitAges[id] || ['Y', 'M', 'O'];
              
              return (
                <div
                  key={id}
                  onClick={() => handleSelectPortrait(id)}
                  className={`
                    relative rounded-lg overflow-hidden border-2 transition-all p-2 bg-muted/30 cursor-pointer
                    ${isCurrent ? 'border-primary ring-2 ring-primary/50' : 'border-transparent'}
                    ${isUsed && !isCurrent ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
                  `}
                >
                  <PortraitThumbnail id={id} sex={sex} ages={ages} portraitType={portraitType} />
                  
                  <div className="mt-1 text-xs text-center font-medium">
                    #{id}
                  </div>
                  
                  {isUsed && !isCurrent && usedBy && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                      <div className="text-white text-xs text-center px-2">
                        <div className="font-medium truncate max-w-[120px]">{usedBy.characterName}</div>
                        <div className="text-white/70">{usedBy.profession}</div>
                      </div>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                      Current
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}