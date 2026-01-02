"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { GameCanvas } from '@/components/game/GameCanvas';
import { UploadPanel } from '@/components/game/UploadPanel';
import { ScorePanel } from '@/components/game/ScorePanel';
import { PauseMenu } from '@/components/game/PauseMenu';

export default function Home() {
  const [playerImage, setPlayerImage] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameRef = useRef<{ reset: () => void } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('flappyFramesHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const handleImageSelect = useCallback((image: string | null) => {
    setPlayerImage(image);
  }, []);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('gameover');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('flappyFramesHighScore', finalScore.toString());
    }
  }, [highScore]);

  const startGame = useCallback(() => {
    gameRef.current?.reset();
    setScore(0);
    setGameState('playing');
  }, []);

  const pauseGame = useCallback(() => {
    setGameState('paused');
  }, []);

  const resumeGame = useCallback(() => {
    setGameState('playing');
  }, []);

  const restartGame = useCallback(() => {
    gameRef.current?.reset();
    setScore(0);
    setGameState('playing');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && gameState === 'playing') {
        pauseGame();
      } else if (e.code === 'Escape' && gameState === 'paused') {
        resumeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, pauseGame, resumeGame]);

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 font-sans">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(120, 113, 108, 0.1) 0%, transparent 40%)'
        }}
      />

      <header className="relative z-10 mb-8 text-center">
        <h1 className="text-4xl font-bold text-stone-100 tracking-tight">
          Flappy<span className="text-amber-400">Frames</span>
        </h1>
        <p className="text-stone-500 text-sm mt-1">Upload your image. Fly through the frames.</p>
      </header>

      <main className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-6">
          <ScorePanel 
            score={score} 
            highScore={highScore} 
            isPlaying={gameState === 'playing'} 
          />

          <div className="relative">
            <GameCanvas
              ref={gameRef}
              playerImage={playerImage}
              onScoreChange={handleScoreChange}
              onGameOver={handleGameOver}
              isPlaying={gameState === 'playing'}
              isPaused={gameState === 'paused'}
            />
            
            <PauseMenu
              isPaused={gameState === 'paused'}
              isGameOver={gameState === 'gameover'}
              score={score}
              onResume={resumeGame}
              onRestart={restartGame}
              onHome={() => setGameState('idle')}
            />

            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm rounded-2xl">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-stone-400 text-sm">Click or press Space to fly</p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-stone-900 font-bold text-lg hover:bg-amber-400 transition-all hover:scale-105"
                  >
                    <FiPlay className="w-6 h-6" />
                    Start Game
                  </button>
                </div>
              </div>
            )}
          </div>

          {gameState === 'playing' && (
            <button
              onClick={pauseGame}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/50 text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors border border-stone-700/50"
            >
              <FiPause className="w-4 h-4" />
              Pause (Esc)
            </button>
          )}
        </div>

        <aside className="flex flex-col items-center gap-6 p-6 rounded-2xl bg-stone-900/50 border border-stone-800">
          <div>
            <h2 className="text-lg font-semibold text-stone-200 mb-1">Your Character</h2>
            <p className="text-xs text-stone-500">Upload an image to play as</p>
          </div>
          
          <UploadPanel 
            onImageSelect={handleImageSelect} 
            selectedImage={playerImage}
          />

          <div className="w-full pt-4 border-t border-stone-800">
            <h3 className="text-sm font-medium text-stone-300 mb-3">How to Play</h3>
            <ul className="text-xs text-stone-500 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-400">1.</span>
                Upload an image (optional)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">2.</span>
                Click or press Space/Up to fly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">3.</span>
                Avoid the pipes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400">4.</span>
                Score 5+ to unlock new themes
              </li>
            </ul>
          </div>

          <div className="w-full pt-4 border-t border-stone-800">
            <h3 className="text-sm font-medium text-stone-300 mb-3">Momentum Zones</h3>
            <div className="flex gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400/30"></span>
                <span className="text-stone-500">Boost</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400/30"></span>
                <span className="text-stone-500">Float</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="relative z-10 mt-8 text-center">
        <p className="text-xs text-stone-600">Press Esc to pause during game</p>
      </footer>
    </div>
  );
}
