import { CardSection } from '@/components/CardSection';
import { GenreBadge } from '@/components/GenreBadge';
import { GenreAdjuster } from '@/components/GenreAdjuster';

interface GenresSectionProps {
  genres: Array<{ id: string; value: number }>;
  onUpdate?: (field: string, value: number | null) => void;
}

export function GenresSection({ genres, onUpdate }: GenresSectionProps) {
  return (
    <CardSection
      title="Genres"
      action={
        <GenreAdjuster
          genres={genres}
          onToggle={(genre, shouldAdd) => {
            onUpdate?.(`whiteTag:${genre}`, shouldAdd ? 12.0 : null);
          }}
        />
      }
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
