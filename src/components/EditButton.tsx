import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface EditButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const EditButton = React.forwardRef<HTMLButtonElement, EditButtonProps>(
  ({ onClick, children, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }} 
        className="w-[88px] h-7 gap-1 py-0 [&_svg]:size-3"
        {...props}
      >
        <Pencil />
        {children}
      </Button>
    );
  }
);

EditButton.displayName = 'EditButton';