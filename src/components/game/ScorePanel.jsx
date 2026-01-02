"use client";

import { FiAward } from 'react-icons/fi';

export function ScorePanel({ score, highScore, isPlaying }) {
  return (
    <div className="flex items-center gap-6">
      <div className={`
        transition-transform duration-150
        ${isPlaying ? 'scale-110' : 'scale-100'}
      `}>
        <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Score</p>
        <p className="text-4xl font-bold text-amber-400 tabular-nums">{score}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <FiAward className="w-5 h-5 text-amber-600" />
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Best</p>
          <p className="text-2xl font-semibold text-stone-300 tabular-nums">{highScore}</p>
        </div>
      </div>
    </div>
  );
}
