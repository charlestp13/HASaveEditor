interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
