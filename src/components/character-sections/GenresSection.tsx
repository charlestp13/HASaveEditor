import { CardSection } from '@/components/CardSection';
import { GenreBadge } from '@/components/GenreBadge';
import { EditButton } from '@/components/EditButton';

interface GenresSectionProps {
  genres: Array<{ id: string; value: number }>;
  onEditGenres?: () => void;
}

export function GenresSection({ genres, onEditGenres }: GenresSectionProps) {
  return (
    <CardSection
      title="Genres"
      action={onEditGenres && <EditButton onClick={onEditGenres}>Genres</EditButton>}
      collapsible
      defaultCollapsed
    >
      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {genres.map((genre) => (
            <GenreBadge key={genre.id} genre={genre.id} value={genre.value} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No genres</div>
      )}
    </CardSection>
  );
}
