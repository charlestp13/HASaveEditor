import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PortraitCarousel } from '@/components/PortraitCarousel';
import { TraitBadge } from '@/components/TraitBadge';
import { SimpleBadge } from '@/components/SimpleBadge';
import { GenreBadge } from '@/components/GenreBadge';
import { TraitAdjuster } from '@/components/TraitAdjuster';
import { GenreAdjuster } from '@/components/GenreAdjuster';
import { StatAdjuster } from '@/components/StatAdjuster';
import { SkillAdjuster } from '@/components/SkillAdjuster';
import { StatusAdjuster } from '@/components/StatusAdjuster';
import { CardSection } from '@/components/CardSection';
import { PersonUtils, GameDate } from '@/lib/utils';
import { GENRES } from '@/lib/character-genres';
import { useCharacterDates } from '@/hooks/useCharacterDates';
import { useCharacterComputed } from '@/hooks/useCharacterComputed';
import type { Person } from '@/lib/types';

interface CharacterCardProps {
  character: Person;
  currentDate: string;
  nameStrings: string[];
  onClick?: () => void;
  isSelected?: boolean;
  onUpdate?: (field: string, value: number | null) => void;
  onTraitAdd?: (trait: string) => void;
  onTraitRemove?: (trait: string) => void;
}

const PUBLIC_IMAGE_STATS = [
  { type: 'ART' as const, label: 'Artistic Status' },
  { type: 'COM' as const, label: 'Commercial Status' },
] as const;

export const CharacterCard = memo(function CharacterCard({ 
  character, 
  currentDate, 
  nameStrings,
  onClick,
  isSelected = false,
  onUpdate,
  onTraitAdd,
  onTraitRemove
}: CharacterCardProps) {
  const { age, birthParsed, deathParsed, contractDaysLeft } = useCharacterDates(character, currentDate);
  const {
    isDead,
    isBusy,
    professionName,
    professionValue,
    displayableTraits,
    art,
    com,
    isActorOrDirector,
    skillEntries,
    canEditTraits,
  } = useCharacterComputed(character);

  return (
    <Card 
      className={`cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isDead ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{PersonUtils.getDisplayName(character, nameStrings)}</h3>
            <p className="text-sm text-muted-foreground">{professionName}</p>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono">ID: {character.id}</div>
            <div className="text-muted-foreground">Age: {age}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <StatAdjuster
            label="Happiness"
            value={Number(character.mood ?? 0)}
            onChange={(v) => onUpdate?.('mood', v)}
          />
          <StatAdjuster
            label="Loyalty"
            value={Number(character.attitude ?? 0)}
            onChange={(v) => onUpdate?.('attitude', v)}
          />
          <SkillAdjuster
            skillValue={professionValue}
            limitValue={Number(character.limit ?? 1)}
            onSkillChange={(v) => onUpdate?.('skill', v)}
            onLimitChange={(v) => onUpdate?.('limit', v)}
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Studio: </span>
            <span className="font-medium">
              {PersonUtils.getStudioDisplay(character.studioId)}
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-1">
            <div className="text-xs text-muted-foreground">
              State: {PersonUtils.getStateLabel(character.state)}
              {isBusy && ' (On Job)'}
            </div>
            {character.gender !== undefined && (
              <div className="text-xs text-muted-foreground">
                Gender: {character.gender === 1 ? 'Female' : 'Male'}
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
            professions={character.professions || {}}
            gender={character.gender}
            portraitBaseId={character.portraitBaseId}
          />
        </div>

        

        {isActorOrDirector && (
          <CardSection title="Public Image">
            <div className="space-y-2">
              {PUBLIC_IMAGE_STATS.map(({ type, label }) => {
                const value = type === 'ART' ? art : com;
                return (
                  <StatusAdjuster
                    key={type}
                    type={type}
                    value={value > 0 ? value : null}
                    label={label}
                    profession={professionName as 'Actor' | 'Director'}
                    onChange={(v) => onUpdate?.(`whiteTag:${type}`, v)}
                  />
                );
              })}
            </div>
          </CardSection>
        )}

        {canEditTraits && (
          <CardSection title="Traits" action={
            <TraitAdjuster
              traits={character.labels || []}
              onAdd={(trait) => onTraitAdd?.(trait)}
              onRemove={(trait) => onTraitRemove?.(trait)}
            />
          }>
            {displayableTraits.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {displayableTraits.map((trait) => (
                  <TraitBadge key={trait} trait={trait} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No traits</div>
            )}
          </CardSection>
        )}

        {['Scriptwriter', 'Producer', 'Director', 'Actor'].includes(professionName) && (
          <CardSection 
            title="Genres" 
            action={
              <GenreAdjuster
                genres={skillEntries
                  .filter(s => (GENRES as readonly string[]).includes(s.id))
                  .map(s => ({
                    id: s.id,
                    value: typeof s.value === 'string' ? parseFloat(s.value) : s.value
                  }))}
                onToggle={(genre, shouldAdd) => {
                  onUpdate?.(`whiteTag:${genre}`, shouldAdd ? 12.0 : null);
                }}
              />
            }
            collapsible 
            defaultCollapsed
          >
            {skillEntries.filter(s => (GENRES as readonly string[]).includes(s.id)).length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {skillEntries
                  .filter(s => (GENRES as readonly string[]).includes(s.id))
                  .map((genre) => (
                    <GenreBadge 
                      key={genre.id} 
                      genre={genre.id}
                      value={typeof genre.value === 'string' ? parseFloat(genre.value) : genre.value} 
                    />
                  ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No genres</div>
            )}
          </CardSection>
        )}

        {character.contract && (
          <CardSection title="Contract" collapsible defaultCollapsed>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Years</div>
                <div className="font-mono">{character.contract.amount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Days Left</div>
                <div className="font-mono">
                  {character.contract.contractType === 2 
                    ? '∞' 
                    : contractDaysLeft}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Initial Fee</div>
                <div className="font-mono">${character.contract.initialFee}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Monthly</div>
                <div className="font-mono">${character.contract.monthlySalary}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Signed</div>
                <div className="font-mono text-xs">{GameDate.fromDate(new Date(character.contract.dateOfSigning)).format()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Weight/Salary</div>
                <div className="font-mono">{character.contract.weightToSalary}</div>
              </div>
            </div>
          </CardSection>
        )}

        {character.aSins && character.aSins.length > 0 && (
          <CardSection title="Advanced Sins" collapsible defaultCollapsed>
            <div className="flex flex-wrap gap-1">
              {character.aSins.map((sin) => (
                <SimpleBadge key={sin} label={sin} />
              ))}
            </div>
          </CardSection>
        )}
      </CardContent>
    </Card>
  );
}, (prev, next) => {
  if (prev.isSelected !== next.isSelected) return false;
  
  const p = prev.character;
  const n = next.character;
  
  if (p.mood !== n.mood) return false;
  if (p.attitude !== n.attitude) return false;
  if (p.limit !== n.limit) return false;
  
  const pProf = p.professions ? Object.values(p.professions)[0] : null;
  const nProf = n.professions ? Object.values(n.professions)[0] : null;
  if (pProf !== nProf) return false;
  
  // Check all whiteTagsNEW (ART, COM, and all genres)
  const pTags = JSON.stringify(p.whiteTagsNEW);
  const nTags = JSON.stringify(n.whiteTagsNEW);
  if (pTags !== nTags) return false;
  
  const pLabels = p.labels?.join(',') ?? '';
  const nLabels = n.labels?.join(',') ?? '';
  if (pLabels !== nLabels) return false;
  
  return true;
});