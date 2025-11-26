import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EditButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function EditButton({ onClick, children }: EditButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="w-[88px] gap-1">
      <Plus className="h-3 w-3" />
      {children}
    </Button>
  );
}