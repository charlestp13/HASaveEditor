import { PortraitCarousel } from '@/components/PortraitCarousel';
import { EditButton } from '@/components/EditButton';
import { PersonUtils, type DateUtils } from '@/lib';

interface InfoSectionProps {
  studioId: string | null | undefined;
  state: number | undefined;
  isBusy: boolean;
  gender: number | undefined;
  birthParsed: DateUtils | null;
  isDead: boolean;
  deathParsed: DateUtils | null;
  professions: { [key: string]: any };
  portraitBaseId: number | undefined;
  onEditPortrait?: () => void;
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
  onEditPortrait,
}: InfoSectionProps) {
  const professionType = (() => {
    if (!professions) return 'TALENT';
    const professionKeys = Object.keys(professions);
    if (professionKeys.length === 0) return 'TALENT';
    const profession = professionKeys[0];
    if (profession === 'Agent') return 'AGENT';
    if (profession.startsWith('Lieut') || profession.startsWith('Cpt')) return 'LIEUT';
    return 'TALENT';
  })();

  const canEditPortrait = professionType === 'TALENT' && 
    gender !== undefined && 
    portraitBaseId !== undefined &&
    onEditPortrait !== undefined;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">Studio: </span>
          <span className="font-medium">
            {PersonUtils.getStudioDisplay(studioId)}
          </span>
        </div>
        {canEditPortrait && (
          <EditButton onClick={onEditPortrait}>
            Portrait
          </EditButton>
        )}
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