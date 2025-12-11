import { CardSection } from '@/components/CardSection';
import { SettingsAdjuster } from '@/components/SettingsAdjuster';

interface SettingsSectionProps {
  indoor: number;
  outdoor: number;
  onUpdate?: (field: string, value: number | null) => void;
}

export function SettingsSection({
  indoor,
  outdoor,
  onUpdate,
}: SettingsSectionProps) {
  return (
    <CardSection title="Settings" collapsible defaultCollapsed>
      <SettingsAdjuster
        outdoorValue={outdoor}
        indoorValue={indoor}
        onOutdoorChange={(v) => onUpdate?.('whiteTag:OUTDOOR', v)}
        onIndoorChange={(v) => onUpdate?.('whiteTag:INDOOR', v)}
      />
    </CardSection>
  );
}