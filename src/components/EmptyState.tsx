interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  );
}
