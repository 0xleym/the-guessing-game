'use client';

import { useGameStore } from '@/store/gameStore';
import { formatINR } from '@/lib/format';
import { ThemeToggle } from '@/components/ThemeToggle';

export function GameHeader() {
  const { currentRound, totalRounds, totalScore } = useGameStore();

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-6 gap-3">
      <div className="flex items-center gap-2">
        <span className="text-text-secondary text-sm">Round</span>
        <span className="text-text-primary font-bold text-lg sm:text-xl">
          {currentRound}/{totalRounds}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 bg-surface-input/80 rounded-xl px-3 sm:px-4 py-2 border border-border-input/50">
          <span className="text-text-secondary text-sm hidden sm:inline">Score</span>
          <span className="text-accent font-bold text-lg sm:text-xl tabular-nums">
            {formatINR(totalScore).replace('₹', '')}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
