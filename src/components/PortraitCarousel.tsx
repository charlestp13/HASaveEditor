import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortraitCarouselProps {
  professions: { [key: string]: any };
  gender: number | undefined;
  portraitBaseId: number | undefined;
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

export function PortraitCarousel({ professions, gender, portraitBaseId }: PortraitCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availablePortraits, setAvailablePortraits] = useState<string[]>([]);

  useEffect(() => {
    loadPortraits();
  }, [professions, gender, portraitBaseId]);

  const getProfessionType = (): string => {
    if (!professions) return 'TALENT';
    
    const professionKeys = Object.keys(professions);
    if (professionKeys.length === 0) return 'TALENT';
    
    const profession = professionKeys[0];
    
    if (profession === 'Agent') return 'AGENT';
    if (profession.startsWith('Lieut') || profession.startsWith('Cpt')) return 'LIEUT';
    
    return 'TALENT';
  };

  const loadPortraits = async () => {
    if (portraitBaseId === undefined || gender === undefined) {
      setAvailablePortraits([]);
      return;
    }

    const manifest = await loadManifest();
    
    const professionType = getProfessionType();
    const sex = gender === 1 ? 'F' : 'M';
    const key = `${professionType}_${sex}_${portraitBaseId}`;
    
    const ageVariants = manifest[key] || [];
    const portraits = ageVariants.map(age => 
      `/portraits/${professionType}_${sex}_${age}_${portraitBaseId}.png`
    );
    
    setAvailablePortraits(portraits);
    setCurrentIndex(0);
  };

  const nextPortrait = () => {
    setCurrentIndex((prev) => (prev + 1) % availablePortraits.length);
  };

  const prevPortrait = () => {
    setCurrentIndex((prev) => (prev - 1 + availablePortraits.length) % availablePortraits.length);
  };

  if (availablePortraits.length === 0) {
    return null;
  }

  return (
    <div className="relative w-32 h-24 flex-shrink-0 rounded">
      <img
        src={availablePortraits[currentIndex]}
        alt="Character portrait"
        className="object-contain rounded max-h-16 mx-auto"
        style={{ transform: 'scaleX(-1)' }}
      />
      
      {availablePortraits.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 bottom-0 h-8 w-8 p-0 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              prevPortrait();
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 bottom-0 h-8 w-8 p-0 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              nextPortrait();
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {availablePortraits.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}