'use client';

import { useGameStore } from '@/store/gameStore';
import { formatINR } from '@/lib/format';

export function GameHeader() {
  const { currentRound, totalRounds, totalScore } = useGameStore();

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-6">
      <div className="flex items-center gap-2">
        <span className="text-zinc-400 text-sm">Round</span>
        <span className="text-white font-bold text-xl">
          {currentRound}/{totalRounds}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-zinc-800/80 rounded-xl px-4 py-2 border border-zinc-700/50">
          <span className="text-zinc-400 text-sm">Score</span>
          <span className="text-orange-400 font-bold text-xl tabular-nums">
            {formatINR(totalScore).replace('₹', '')}
          </span>
        </div>
      </div>
    </div>
  );
}
