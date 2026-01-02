"use client";

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useGameLoop } from '@/hooks/useGameLoop';
import { usePlayerPhysics } from '@/hooks/usePlayerPhysics';
import { checkCollision, checkBoundaryCollision, checkPipePass } from '@/lib/game/collision';
import { calculatePipeGap, calculateGameSpeed } from '@/lib/game/scaling';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_RADIUS = 25;
const PIPE_WIDTH = 60;
const PIPE_SPAWN_INTERVAL = 2000;

const THEME_COLORS = [
  { pipe: '#78716c', accent: '#fbbf24' },
  { pipe: '#059669', accent: '#34d399' },
  { pipe: '#7c3aed', accent: '#a78bfa' },
  { pipe: '#dc2626', accent: '#f87171' },
  { pipe: '#0891b2', accent: '#22d3ee' },
];

/**
 * @typedef {Object} GameCanvasProps
 * @property {string | null} playerImage
 * @property {(score: number) => void} onScoreChange
 * @property {(score: number) => void} onGameOver
 * @property {boolean} isPlaying
 * @property {boolean} isPaused
 */

/**
 * @type {import('react').ForwardRefExoticComponent<GameCanvasProps & import('react').RefAttributes<any>>}
 */
export const GameCanvas = forwardRef(function GameCanvas({ 
  playerImage, 
  onScoreChange, 
  onGameOver,
  isPlaying,
  isPaused 
}, ref) {
  const canvasRef = useRef(null);
  const playerRef = useRef({
    x: CANVAS_WIDTH * 0.25,
    y: CANVAS_HEIGHT * 0.35,
    radius: PLAYER_RADIUS,
    rotation: 0
  });
  const pipesRef = useRef([]);
  const scoreRef = useRef(0);
  const lastPipeSpawnRef = useRef(0);
  const imageRef = useRef(null);
  const bgOffsetRef = useRef(0);
  const themeIndexRef = useRef(0);

  const physics = usePlayerPhysics();

  useEffect(() => {
    if (playerImage) {
      const img = new Image();
      img.src = playerImage;
      img.onload = () => {
        imageRef.current = img;
      };
    }
  }, [playerImage]);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: CANVAS_WIDTH * 0.25,
      y: CANVAS_HEIGHT / 2,
      radius: PLAYER_RADIUS,
      rotation: 0
    };
    pipesRef.current = [];
    scoreRef.current = 0;
    lastPipeSpawnRef.current = 0;
    themeIndexRef.current = 0;
    physics.reset();
    onScoreChange(0);
  }, [physics, onScoreChange]);

  useImperativeHandle(ref, () => ({
    reset: resetGame
  }));

  const spawnPipe = useCallback(() => {
    const gap = calculatePipeGap(scoreRef.current);
    const minTopHeight = 80;
    const maxTopHeight = CANVAS_HEIGHT - gap - 80;
    const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;
    
    const hasMomentumZone = Math.random() > 0.7;
    
    pipesRef.current.push({
      x: CANVAS_WIDTH,
      width: PIPE_WIDTH,
      topHeight,
      bottomY: topHeight + gap,
      passed: false,
      momentumModifier: hasMomentumZone ? (Math.random() > 0.5 ? 1.15 : 0.85) : 1
    });
  }, []);

  const jump = useCallback(() => {
    if (!isPlaying || isPaused) return;
    
    const nearestPipe = pipesRef.current.find(p => p.x + p.width > playerRef.current.x);
    const modifier = nearestPipe?.momentumModifier || 1;
    physics.jump(modifier);
  }, [isPlaying, isPaused, physics]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const drawBackground = useCallback((ctx, score) => {
    const hueShift = (score * 2) % 360;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, `hsl(${220 + hueShift * 0.1}, 20%, 8%)`);
    gradient.addColorStop(0.5, `hsl(${230 + hueShift * 0.1}, 25%, 12%)`);
    gradient.addColorStop(1, `hsl(${210 + hueShift * 0.1}, 30%, 6%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    const parallaxOffset = bgOffsetRef.current * 0.5;
    for (let i = 0; i < 5; i++) {
      const x = ((i * 100 - parallaxOffset) % (CANVAS_WIDTH + 100)) - 50;
      const y = 100 + i * 80;
      ctx.beginPath();
      ctx.arc(x, y, 30 + i * 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawPipe = useCallback((ctx, pipe, themeColor) => {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, themeColor.pipe);
    gradient.addColorStop(0.5, themeColor.accent);
    gradient.addColorStop(1, themeColor.pipe);

    ctx.fillStyle = gradient;
    
    ctx.beginPath();
    ctx.roundRect(pipe.x, 0, pipe.width, pipe.topHeight, [0, 0, 8, 8]);
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(pipe.x, pipe.bottomY, pipe.width, CANVAS_HEIGHT - pipe.bottomY, [8, 8, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
    ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, CANVAS_HEIGHT - pipe.bottomY);

    if (pipe.momentumModifier !== 1) {
      const zoneY = pipe.topHeight + (pipe.bottomY - pipe.topHeight) / 2;
      ctx.fillStyle = pipe.momentumModifier > 1 
        ? 'rgba(251, 191, 36, 0.1)' 
        : 'rgba(96, 165, 250, 0.1)';
      ctx.beginPath();
      ctx.arc(pipe.x + pipe.width / 2, zoneY, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawPlayer = useCallback((ctx, player) => {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate((player.rotation * Math.PI) / 180);

    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (imageRef.current) {
      const size = player.radius * 2;
      ctx.drawImage(imageRef.current, -player.radius, -player.radius, size, size);
    } else {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, player.radius);
      gradient.addColorStop(0, '#fbbf24');
      gradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.stroke();
  }, []);

  const gameLoop = useCallback((deltaTime) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const speed = calculateGameSpeed(scoreRef.current);
    bgOffsetRef.current += speed * 0.5;

    playerRef.current = physics.update(playerRef.current);

    pipesRef.current = pipesRef.current.filter(pipe => pipe.x + pipe.width > -50);
    pipesRef.current.forEach(pipe => {
      pipe.x -= speed;
    });

    const now = Date.now();
    if (now - lastPipeSpawnRef.current > PIPE_SPAWN_INTERVAL) {
      spawnPipe();
      lastPipeSpawnRef.current = now;
    }

    for (const pipe of pipesRef.current) {
      if (checkPipePass(playerRef.current, pipe)) {
        pipe.passed = true;
        scoreRef.current += 1;
        onScoreChange(scoreRef.current);
        
        if (scoreRef.current % 5 === 0) {
          themeIndexRef.current = (themeIndexRef.current + 1) % THEME_COLORS.length;
        }
      }
    }

    if (checkBoundaryCollision(playerRef.current, CANVAS_HEIGHT)) {
      onGameOver(scoreRef.current);
      return;
    }

    for (const pipe of pipesRef.current) {
      if (checkCollision(playerRef.current, pipe)) {
        onGameOver(scoreRef.current);
        return;
      }
    }

    drawBackground(ctx, scoreRef.current);

    const currentTheme = THEME_COLORS[themeIndexRef.current];
    pipesRef.current.forEach(pipe => drawPipe(ctx, pipe, currentTheme));

    drawPlayer(ctx, playerRef.current);
  }, [physics, spawnPipe, onScoreChange, onGameOver, drawBackground, drawPipe, drawPlayer]);

  useGameLoop(gameLoop, isPlaying && !isPaused);

  useEffect(() => {
    if (!isPlaying) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawBackground(ctx, 0);
        drawPlayer(ctx, playerRef.current);
      }
    }
  }, [isPlaying, drawBackground, drawPlayer]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={jump}
      className="rounded-2xl cursor-pointer shadow-2xl shadow-black/50"
      style={{ touchAction: 'none' }}
    />
  );
});
