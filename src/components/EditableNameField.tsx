import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { NameSearcher, type NameSearchResult } from '@/lib';

interface EditableNameFieldProps {
  value: string;
  currentId: string;
  nameSearcher: NameSearcher;
  onSelect: (nameId: string) => void;
  placeholder?: string;
}

export function EditableNameField({
  value,
  nameSearcher,
  onSelect,
  placeholder,
}: EditableNameFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    results: NameSearchResult[];
    hasMore: boolean;
  }>({ results: [], hasMore: false });
  const [showPopover, setShowPopover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const results = nameSearcher.search(searchQuery);
      setSearchResults(results);
      setShowPopover(true);
    } else {
      setSearchResults({ results: [], hasMore: false });
      setShowPopover(false);
    }
  }, [searchQuery, nameSearcher]);

  const handleEdit = () => {
    setIsEditing(true);
    setSearchQuery('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSearchQuery('');
    setShowPopover(false);
  };

  const handleSelect = (nameId: number) => {
    onSelect(String(nameId));
    setIsEditing(false);
    setSearchQuery('');
    setShowPopover(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget?.closest('[data-name-popover]')) {
      return;
    }
    handleCancel();
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <span className="font-semibold text-lg select-none pointer-events-none">
          {value}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={handleEdit}
          tabIndex={-1}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Popover open={showPopover && isEditing} modal={false}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="max-w-20 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </PopoverTrigger>
        
        <PopoverContent
          side="right"
          align="start"
          className="w-[280px] p-2"
          data-name-popover
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {searchResults.results.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-2">
              No matches found
            </div>
          )}
          
          {searchResults.results.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {searchResults.results.map((result) => (
                <button
                  key={result.id}
                  className="text-left text-sm px-2 py-1.5 hover:bg-accent rounded transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(result.id);
                  }}
                >
                  {result.name} ({result.id})
                </button>
              ))}
            </div>
          )}
          
          {searchResults.hasMore && (
            <div className="text-xs text-muted-foreground px-2 mt-1 pt-1 border-t">
              Type more to narrow results
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={handleCancel}
        tabIndex={-1}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}