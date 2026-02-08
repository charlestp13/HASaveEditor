import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Error',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3 max-w-md">
        <div className="text-destructive text-5xl">⚠</div>
        <div>
          <p className="font-semibold text-destructive">{title}</p>
          <p className="text-label mt-2">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
