import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CardSectionProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function CardSection({ title, children, action, collapsible = false, defaultCollapsed = false }: CardSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="border-t pt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div 
          className={`font-semibold text-sm flex items-center gap-1 ${collapsible ? 'cursor-pointer select-none' : ''}`}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          {collapsible && (
            collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
          {title}
        </div>
        {action}
      </div>
      {!collapsed && children}
    </div>
  );
}