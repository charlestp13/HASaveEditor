import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBrowse?: () => void;
  browseLabel?: string;
}

export function ErrorState({ 
  title = 'Error', 
  message, 
  onRetry, 
  onBrowse,
  browseLabel = 'Browse'
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3 max-w-md">
        <div className="text-destructive text-5xl">⚠</div>
        <div>
          <p className="font-semibold text-destructive">{title}</p>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
        </div>
        <div className="flex gap-2 justify-center">
          {onBrowse && (
            <Button onClick={onBrowse} variant="default" size="sm">
              {browseLabel}
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
