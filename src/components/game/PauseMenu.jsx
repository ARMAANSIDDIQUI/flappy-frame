"use client";

import { FiPlay, FiRotateCcw, FiHome } from 'react-icons/fi';

export function PauseMenu({ onResume, onRestart, onHome, isPaused, isGameOver, score }) {
  if (!isPaused && !isGameOver) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm z-10 rounded-2xl">
      <div className="flex flex-col items-center gap-6">
        {isGameOver ? (
          <>
            <h2 className="text-2xl font-bold text-stone-200">Game Over</h2>
            <p className="text-4xl font-bold text-amber-400">{score}</p>
          </>
        ) : (
          <h2 className="text-2xl font-bold text-stone-200">Paused</h2>
        )}
        
        <div className="flex gap-4">
          {!isGameOver && (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 transition-colors"
            >
              <FiPlay className="w-5 h-5" />
              Resume
            </button>
          )}
          
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-800 text-stone-200 font-semibold hover:bg-stone-700 transition-colors border border-stone-700"
          >
            <FiRotateCcw className="w-5 h-5" />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}
