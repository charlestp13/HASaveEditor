import { useState, useCallback } from 'react';

interface AsyncActionState {
  loading: boolean;
  error: string | null;
}

interface UseAsyncActionReturn extends AsyncActionState {
  execute: <T>(action: () => Promise<T>) => Promise<T | undefined>;
  setError: (error: string) => void;
  clearError: () => void;
}

export function useAsyncAction(): UseAsyncActionReturn {
  const [state, setState] = useState<AsyncActionState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setState({ loading: true, error: null });
    try {
      const result = await action();
      setState({ loading: false, error: null });
      return result;
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : typeof err === 'string' ? err : 'An error occurred',
      });
      return undefined;
    }
  }, []);

  const setError = useCallback((error: string) => {
    setState(s => ({ ...s, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return { ...state, execute, setError, clearError };
}
