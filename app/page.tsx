'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GameMode } from '@/types';

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(5);
  const router = useRouter();

  const handleStart = () => {
    router.push(`/game?mode=${selectedMode}`);
  };

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg mx-auto w-full"
      >
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="text-6xl sm:text-7xl mb-6">🏷️</div>

        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">
          Price <span className="text-accent">Guesser</span>
        </h1>

        <p className="text-text-secondary text-base sm:text-lg mb-10">
          Can you guess the price of everyday products? Test your pricing instincts and
          compete!
        </p>

        {/* Mode Selector */}
        <div className="mb-8">
          <p className="text-text-tertiary text-sm mb-3 uppercase tracking-wider">Choose your mode</p>
          <div className="flex gap-3 justify-center">
            {([5, 10] as GameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all border cursor-pointer min-h-[44px]
                  ${
                    selectedMode === mode
                      ? 'bg-accent/20 border-accent/50 text-accent'
                      : 'bg-surface-input/50 border-border-input/50 text-text-secondary hover:border-border-input'
                  }`}
              >
                {mode} Rounds
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button onClick={handleStart} size="lg" className="text-xl px-12 w-full sm:w-auto">
          Start Game
        </Button>

        {/* How to Play */}
        <div className="mt-12 bg-surface-card/50 border border-border rounded-2xl p-5 sm:p-6 text-left">
          <h3 className="text-text-primary font-semibold mb-3">How to Play</h3>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li className="flex gap-2">
              <span className="text-accent">1.</span> See a product and its details
            </li>
            <li className="flex gap-2">
              <span className="text-accent">2.</span> Guess its price
            </li>
            <li className="flex gap-2">
              <span className="text-accent">3.</span> The closer you are, the more points you earn
            </li>
            <li className="flex gap-2">
              <span className="text-accent">4.</span> Use 2 lifelines wisely — Category Reveal & Price Range
            </li>
            <li className="flex gap-2">
              <span className="text-accent">5.</span> Submit your score to the leaderboard!
            </li>
          </ul>
        </div>

        {/* Leaderboard Link */}
        <button
          onClick={() => router.push('/leaderboard')}
          className="mt-6 text-text-tertiary hover:text-accent transition-colors text-sm cursor-pointer"
        >
          View Leaderboard →
        </button>
      </motion.div>
    </div>
  );
}
