import { useState, useCallback, useRef } from 'react';

interface SwipeConfig {
  threshold?: number; // Min distance to trigger swipe (default: 100px)
  velocityThreshold?: number; // Min velocity for quick swipes
}

interface SwipeState {
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  direction: 'left' | 'right' | 'up' | null;
  isExiting: boolean;
  exitDirection: 'left' | 'right' | 'up' | null;
}

interface SwipeCallbacks {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp?: () => void;
}

const defaultConfig: Required<SwipeConfig> = {
  threshold: 100,
  velocityThreshold: 0.5,
};

export function useSwipe(
  callbacks: SwipeCallbacks,
  config: SwipeConfig = {}
) {
  const mergedConfig = { ...defaultConfig, ...config };
  const [swipeState, setSwipeState] = useState<SwipeState>({
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    direction: null,
    isExiting: false,
    exitDirection: null,
  });

  const startPos = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startPos.current = { x: clientX, y: clientY };
    startTime.current = Date.now();
    setSwipeState({
      offsetX: 0,
      offsetY: 0,
      isDragging: true,
      direction: null,
      isExiting: false,
      exitDirection: null,
    });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!startPos.current) return;

    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;

    let direction: 'left' | 'right' | 'up' | null = null;
    if (Math.abs(deltaX) > 20) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (deltaY < -20) {
      direction = 'up';
    }

    setSwipeState({
      offsetX: deltaX,
      offsetY: deltaY,
      isDragging: true,
      direction,
      isExiting: false,
      exitDirection: null,
    });
  }, []);

  const handleEnd = useCallback(() => {
    const deltaX = swipeState.offsetX;
    const deltaY = swipeState.offsetY;
    const elapsed = Date.now() - startTime.current;
    const velocity = Math.abs(deltaX) / elapsed;

    // Check if swipe threshold is met
    const isHorizontalSwipe =
      Math.abs(deltaX) > mergedConfig.threshold ||
      velocity > mergedConfig.velocityThreshold;

    const isUpSwipe = deltaY < -mergedConfig.threshold && callbacks.onSwipeUp;

    if (isHorizontalSwipe || isUpSwipe) {
      // Determine exit direction
      let exitDir: 'left' | 'right' | 'up' | null = null;
      if (isHorizontalSwipe) {
        exitDir = deltaX > 0 ? 'right' : 'left';
      } else if (isUpSwipe) {
        exitDir = 'up';
      }

      // Start exit animation
      setSwipeState({
        offsetX: deltaX,
        offsetY: deltaY,
        isDragging: false,
        direction: null,
        isExiting: true,
        exitDirection: exitDir,
      });

      // Call callback and reset after animation
      setTimeout(() => {
        if (exitDir === 'right') {
          callbacks.onSwipeRight();
        } else if (exitDir === 'left') {
          callbacks.onSwipeLeft();
        } else if (exitDir === 'up' && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        }

        // Reset state after callback
        setSwipeState({
          offsetX: 0,
          offsetY: 0,
          isDragging: false,
          direction: null,
          isExiting: false,
          exitDirection: null,
        });
      }, 300);
    } else {
      // Reset state without swipe
      setSwipeState({
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        direction: null,
        isExiting: false,
        exitDirection: null,
      });
    }
  }, [swipeState, callbacks, mergedConfig]);

  // Mouse event handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    [handleStart]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!swipeState.isDragging) return;
      handleMove(e.clientX, e.clientY);
    },
    [swipeState.isDragging, handleMove]
  );

  const onMouseUp = useCallback(() => {
    if (!swipeState.isDragging) return;
    handleEnd();
  }, [swipeState.isDragging, handleEnd]);

  const onMouseLeave = useCallback(() => {
    if (swipeState.isDragging) {
      handleEnd();
    }
  }, [swipeState.isDragging, handleEnd]);

  // Touch event handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    [handleStart]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swipeState.isDragging) return;
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    [swipeState.isDragging, handleMove]
  );

  const onTouchEnd = useCallback(() => {
    if (!swipeState.isDragging) return;
    handleEnd();
  }, [swipeState.isDragging, handleEnd]);

  // Calculate transform style
  const rotation = swipeState.offsetX * 0.1;

  let transform = '';
  if (swipeState.isExiting) {
    // Exit animation - fly off screen
    const exitX = swipeState.exitDirection === 'right' ? 500 :
                  swipeState.exitDirection === 'left' ? -500 : 0;
    const exitY = swipeState.exitDirection === 'up' ? -500 : 0;
    const exitRotation = swipeState.exitDirection === 'right' ? 30 :
                         swipeState.exitDirection === 'left' ? -30 : 0;
    transform = `translateX(${exitX}px) translateY(${exitY}px) rotate(${exitRotation}deg) scale(0.8)`;
  } else if (swipeState.isDragging) {
    transform = `translateX(${swipeState.offsetX}px) translateY(${swipeState.offsetY}px) rotate(${rotation}deg)`;
  }

  return {
    swipeState,
    transform,
    handlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
