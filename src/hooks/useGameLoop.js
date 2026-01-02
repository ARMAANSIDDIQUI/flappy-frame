import { useRef, useCallback, useEffect } from 'react';

export function useGameLoop(callback, isRunning) {
  const frameRef = useRef(null);
  const lastTimeRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((timestamp) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    callbackRef.current(deltaTime);

    if (isRunning) {
      frameRef.current = requestAnimationFrame(loop);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, loop]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  return { stop };
}
