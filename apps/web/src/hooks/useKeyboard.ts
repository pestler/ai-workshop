import { useEffect, useCallback } from 'react';

interface KeyboardCallbacks {
  onLeft: () => void;
  onRight: () => void;
  onUp?: () => void;
  onSpace?: () => void;
}

/**
 * Hook for keyboard navigation
 * Left arrow = Don't know
 * Right arrow = Know
 * Up arrow / Space = Skip
 */
export function useKeyboard(callbacks: KeyboardCallbacks, enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          callbacks.onLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          callbacks.onRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          callbacks.onUp?.();
          break;
        case ' ': // Space bar
          e.preventDefault();
          callbacks.onSpace?.() ?? callbacks.onUp?.();
          break;
      }
    },
    [callbacks]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}
