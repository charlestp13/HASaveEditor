import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PortraitCarousel } from '@/components/PortraitCarousel';
import { TraitBadge } from '@/components/TraitBadge';
import { SimpleBadge } from '@/components/SimpleBadge';
import { TraitAdjuster } from '@/components/TraitAdjuster';
import { StatAdjuster } from '@/components/StatAdjuster';
import { SkillAdjuster } from '@/components/SkillAdjuster';
import { StatusAdjuster } from '@/components/StatusAdjuster';
import { CardSection } from '@/components/CardSection';
import { 
  PersonUtils, 
  GameDate
} from '@/lib/utils';
import { DISPLAYABLE_TRAITS } from '@/lib/character-traits';
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
  const calculateAge = (): number | null => {
    if (!character.birthDate || !currentDate) return null;
    
    const birth = GameDate.fromDDMMYYYY(character.birthDate);
    const current = GameDate.parse(currentDate);
    if (!birth || !current) return null;
    
    return birth.ageTo(current);
  };

  const calculateContractDaysLeft = (): number | null => {
    if (!character.contract || !currentDate) return null;
    
    const current = GameDate.parse(currentDate);
    if (!current) return null;
    
    const signing = new Date(character.contract.dateOfSigning);
    const ending = new Date(signing);
    ending.setFullYear(ending.getFullYear() + character.contract.amount);
    
    return current.daysUntil(GameDate.fromDate(ending));
  };

  const isDead = PersonUtils.isDead(character);
  const isBusy = PersonUtils.isBusy(character);
  const age = calculateAge();
  const professionName = PersonUtils.getProfessionName(character);
  const professionValue = PersonUtils.getProfessionValue(character);
  const contractDaysLeft = calculateContractDaysLeft();
  
  const displayableTraits = character.labels?.filter(
    trait => DISPLAYABLE_TRAITS.includes(trait as typeof DISPLAYABLE_TRAITS[number])
  ) || [];
  
  const art = PersonUtils.getArt(character);
  const com = PersonUtils.getCom(character);
  const isActorOrDirector = professionName === 'Actor' || professionName === 'Director';
  
  const skillEntries = PersonUtils.getSkillEntries(character).filter(s => s.id !== 'ART' && s.id !== 'COM');
  const canEditTraits = professionName !== 'Agent' && professionName !== 'Executive';

  const birthParsed = character.birthDate ? GameDate.fromDDMMYYYY(character.birthDate) : null;
  const deathParsed = character.deathDate ? GameDate.fromDDMMYYYY(character.deathDate) : null;

  const publicImageStats = [
    { type: 'ART' as const, value: art > 0 ? art : null, label: 'Artistic Status' },
    { type: 'COM' as const, value: com > 0 ? com : null, label: 'Commercial Status' },
  ];

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

        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Studio: </span>
              <span className="font-medium">
                {PersonUtils.getStudioDisplay(character.studioId)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              State: {PersonUtils.getStateLabel(character.state)}
              {isBusy && ' (On Job)'}
              {isDead && ' (Dead)'}
            </div>
            {character.gender !== undefined && (
              <div className="text-xs text-muted-foreground">
                Gender: {character.gender === 1 ? 'Female' : 'Male'}
              </div>
            )}
          </div>
          
          <PortraitCarousel 
            professions={character.professions || {}}
            gender={character.gender}
            portraitBaseId={character.portraitBaseId}
          />
        </div>

        {birthParsed && (
          <div className="space-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Birth: </span>
              <span className="font-mono">{birthParsed.format()}</span>
            </div>
            {isDead && deathParsed && (
              <div className="text-destructive">
                <span className="text-muted-foreground">Death: </span>
                <span className="font-mono">{deathParsed.format()}</span>
                <span className="ml-2">(Cause: {character.causeOfDeath})</span>
              </div>
            )}
          </div>
        )}

        {isActorOrDirector && (
          <CardSection title="Public Image">
            <div className="space-y-2">
              {publicImageStats.map(({ type, value, label }) => (
                <StatusAdjuster
                  key={type}
                  type={type}
                  value={value}
                  label={label}
                  profession={professionName as 'Actor' | 'Director'}
                  onChange={(v) => onUpdate?.(`whiteTag:${type}`, v)}
                />
              ))}
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

        {skillEntries.length > 0 && (
          <CardSection title="Skills" collapsible defaultCollapsed>
            <div className="flex flex-wrap gap-1">
              {skillEntries.map((skill) => (
                <SimpleBadge 
                  key={skill.id} 
                  label={skill.id} 
                  value={typeof skill.value === 'string' ? parseFloat(skill.value) : skill.value} 
                />
              ))}
            </div>
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
  
  const pArt = p.whiteTagsNEW?.['ART']?.value;
  const nArt = n.whiteTagsNEW?.['ART']?.value;
  if (pArt !== nArt) return false;
  
  const pCom = p.whiteTagsNEW?.['COM']?.value;
  const nCom = n.whiteTagsNEW?.['COM']?.value;
  if (pCom !== nCom) return false;
  
  const pLabels = p.labels?.join(',') ?? '';
  const nLabels = n.labels?.join(',') ?? '';
  if (pLabels !== nLabels) return false;
  
  return true;
});