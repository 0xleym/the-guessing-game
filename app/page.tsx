'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GameMode } from '@/types';

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<GameMode>(5);
  const router = useRouter();

  const handleStart = () => {
    router.push(`/game?mode=${selectedMode}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg mx-auto"
      >
        {/* Logo */}
        <div className="text-7xl mb-6">🏷️</div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Price <span className="text-orange-500">Guesser</span>
        </h1>

        <p className="text-zinc-400 text-lg mb-10">
          Can you guess the price of Amazon products? Test your pricing instincts and compete
          globally!
        </p>

        {/* Mode Selector */}
        <div className="mb-8">
          <p className="text-zinc-500 text-sm mb-3 uppercase tracking-wider">Choose your mode</p>
          <div className="flex gap-3 justify-center">
            {([5, 10] as GameMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all border cursor-pointer
                  ${
                    selectedMode === mode
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600'
                  }`}
              >
                {mode} Rounds
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button onClick={handleStart} size="lg" className="text-xl px-12">
          Start Game
        </Button>

        {/* How to Play */}
        <div className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-left">
          <h3 className="text-white font-semibold mb-3">How to Play</h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="flex gap-2">
              <span className="text-orange-400">1.</span> See a product from Amazon India
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">2.</span> Guess its price in INR
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">3.</span> The closer you are, the more points you earn
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">4.</span> Use 2 lifelines wisely — Category Reveal & Price Range
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400">5.</span> Submit your score to the global leaderboard!
            </li>
          </ul>
        </div>

        {/* Leaderboard Link */}
        <button
          onClick={() => router.push('/leaderboard')}
          className="mt-6 text-zinc-500 hover:text-orange-400 transition-colors text-sm cursor-pointer"
        >
          View Leaderboard →
        </button>
      </motion.div>
    </div>
  );
}
