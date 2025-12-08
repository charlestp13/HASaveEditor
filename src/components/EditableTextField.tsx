import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface EditableTextFieldProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

export function EditableTextField({
  value,
  onChange,
  placeholder = 'Custom Name',
  className = '',
}: EditableTextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(value || '');
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    onChange(trimmed || null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue(value || '');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (!isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-muted-foreground select-none pointer-events-none">
          {value || placeholder}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 [&_svg]:size-3"
          onClick={handleEdit}
          tabIndex={-1}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`} onClick={(e) => e.stopPropagation()}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="h-7 text-sm max-w-[140px] focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}