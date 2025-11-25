import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="border-b bg-destructive/10 border-destructive/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-destructive font-semibold">Error:</span>
            <span className="text-destructive">{message}</span>
          </div>
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
