import { Badge } from '@/components/ui/badge';

interface SimpleBadgeProps {
  label: string;
  value?: string | number;
}

export function SimpleBadge({ label, value }: SimpleBadgeProps) {
  const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
  
  return (
    <Badge variant="outline" className="text-xs">
      {value !== undefined ? `${label} (${formattedValue})` : label}
    </Badge>
  );
}
