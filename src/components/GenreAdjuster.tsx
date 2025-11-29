import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EditButton } from '@/components/EditButton';
import { IconButton } from '@/components/IconButton';
import { GENRES, GENRE_ESTABLISHED_THRESHOLD, MAX_ESTABLISHED_GENRES, getGenreIcon } from '@/lib/character-genres';
import { toTitleCase } from '@/lib/utils';

const SELECTED_BORDER_COLOR = '#ffd779';

interface GenreWithValue {
  id: string;
  value: number;
}

interface GenreAdjusterProps {
  genres: GenreWithValue[];
  onToggle: (genre: string, shouldAdd: boolean) => void;
}

export function GenreAdjuster({ genres, onToggle }: GenreAdjusterProps) {
  const establishedGenres = useMemo(
    () => genres.filter(g => g.value >= GENRE_ESTABLISHED_THRESHOLD),
    [genres]
  );

  const atMaxGenres = establishedGenres.length >= MAX_ESTABLISHED_GENRES;

  const genreMap = useMemo(
    () => new Map(genres.map(g => [g.id, g.value])),
    [genres]
  );

  const handleGenreClick = (genre: string) => {
    const currentValue = genreMap.get(genre);
    const isEstablished = currentValue !== undefined && currentValue >= GENRE_ESTABLISHED_THRESHOLD;
    
    if (isEstablished) {
      onToggle(genre, false);
    } else if (!isGenreDisabled(genre)) {
      onToggle(genre, true);
    }
  };

  const isGenreDisabled = (genre: string): boolean => {
    const currentValue = genreMap.get(genre);
    const isEstablished = currentValue !== undefined && currentValue >= GENRE_ESTABLISHED_THRESHOLD;
    
    if (isEstablished) return false;
    
    return atMaxGenres;
  };

  const isGenreSelected = (genre: string): boolean => {
    const currentValue = genreMap.get(genre);
    return currentValue !== undefined && currentValue >= GENRE_ESTABLISHED_THRESHOLD;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <EditButton>Genres</EditButton>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Established Genres ({establishedGenres.length}/{MAX_ESTABLISHED_GENRES})
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {GENRES.map(genre => (
            <GenreButton
              key={genre}
              genre={genre}
              isSelected={isGenreSelected(genre)}
              isDisabled={isGenreDisabled(genre)}
              onClick={() => handleGenreClick(genre)}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GenreButtonProps {
  genre: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function GenreButton({ genre, isSelected, isDisabled, onClick }: GenreButtonProps) {
  const icon = getGenreIcon(genre);
  const label = toTitleCase(genre);
  
  return (
    <IconButton
      icon={icon}
      label={label}
      isSelected={isSelected}
      isDisabled={isDisabled}
      selectedBorderColor={SELECTED_BORDER_COLOR}
      onClick={onClick}
      iconSize="sm"
      textAlign="center"
    />
  );
}