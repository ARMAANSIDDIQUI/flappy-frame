import { useRef, useCallback } from 'react';

export function usePlayerPhysics(config = {}) {
  const {
    gravity = 0.5,
    jumpForce = -9,
    maxVelocity = 12,
    gravityIncrease = 0.001
  } = config;

  const velocityRef = useRef(0);
  const currentGravityRef = useRef(gravity);

  const update = useCallback((player) => {
    currentGravityRef.current = Math.min(
      currentGravityRef.current + gravityIncrease,
      gravity * 1.5
    );

    velocityRef.current += currentGravityRef.current;
    velocityRef.current = Math.min(velocityRef.current, maxVelocity);

    const rotation = Math.min(Math.max(velocityRef.current * 3, -30), 90);

    return {
      ...player,
      y: player.y + velocityRef.current,
      rotation
    };
  }, [gravity, gravityIncrease, maxVelocity]);

  const jump = useCallback((momentumModifier = 1) => {
    velocityRef.current = jumpForce * momentumModifier;
  }, [jumpForce]);

  const reset = useCallback(() => {
    velocityRef.current = 0;
    currentGravityRef.current = gravity;
  }, [gravity]);

  const getVelocity = useCallback(() => velocityRef.current, []);

  return { update, jump, reset, getVelocity };
}
