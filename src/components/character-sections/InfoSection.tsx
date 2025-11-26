import { PortraitCarousel } from '@/components/PortraitCarousel';
import { PersonUtils } from '@/lib/utils';
import type { GameDate } from '@/lib/utils';

interface InfoSectionProps {
  studioId: string | null | undefined;
  state: number | undefined;
  isBusy: boolean;
  gender: number | undefined;
  birthParsed: GameDate | null;
  isDead: boolean;
  deathParsed: GameDate | null;
  professions: { [key: string]: any };
  portraitBaseId: number | undefined;
}

export function InfoSection({
  studioId,
  state,
  isBusy,
  gender,
  birthParsed,
  isDead,
  deathParsed,
  professions,
  portraitBaseId,
}: InfoSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Studio: </span>
          <span className="font-medium">
            {PersonUtils.getStudioDisplay(studioId)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 items-start">
        <div className="flex-1 space-y-1">
          <div className="text-xs text-muted-foreground">
            State: {PersonUtils.getStateLabel(state)}
            {isBusy && ' (On Job)'}
          </div>
          {gender !== undefined && (
            <div className="text-xs text-muted-foreground">
              Gender: {gender === 1 ? 'Female' : 'Male'}
            </div>
          )}
          {birthParsed && (
            <div className="text-xs">
              <span className="text-muted-foreground">Birth: </span>
              <span className="text-muted-foreground">{birthParsed.format()}</span>
            </div>
          )}
          {isDead && deathParsed && (
            <div className="text-xs">
              <span className="text-muted-foreground">Death: </span>
              <span className="text-destructive">{deathParsed.format()}</span>
            </div>
          )}
        </div>
        
        <PortraitCarousel 
          professions={professions}
          gender={gender}
          portraitBaseId={portraitBaseId}
        />
      </div>
    </>
  );
}