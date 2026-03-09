'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/format';
import * as api from '@/lib/api';

export default function GameOverPage() {
  const router = useRouter();
  const { totalScore, rounds, sessionId, gameMode, reset } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sessionId || !playerName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { entry } = await api.submitScore(sessionId, playerName.trim());
      setSubmitted(true);
      setRank(entry.rank);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    reset();
    router.push('/');
  };

  // If no rounds data, redirect home
  if (rounds.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No game data found.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const bestRound = rounds.reduce((best, r) => (r.roundScore > best.roundScore ? r : best));
  const avgError = rounds.reduce((sum, r) => sum + r.percentError, 0) / rounds.length;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full mx-auto"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏁</div>
          <h1 className="text-3xl font-bold text-white mb-1">Game Over!</h1>
          <p className="text-zinc-500">{gameMode} rounds completed</p>
        </div>

        {/* Total Score */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mb-6"
        >
          <p className="text-zinc-400 text-sm mb-1">Total Score</p>
          <p className="text-5xl font-bold text-orange-400 tabular-nums">{totalScore}</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div>
              <span className="text-zinc-500">Best Round</span>
              <p className="text-white font-semibold">+{bestRound.roundScore}</p>
            </div>
            <div>
              <span className="text-zinc-500">Avg Error</span>
              <p className="text-white font-semibold">{avgError.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>

        {/* Round Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-sm">Round Breakdown</h3>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {rounds.map((round, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{round.productName}</p>
                  <p className="text-zinc-500 text-xs">
                    {formatINR(round.guessedPrice)} → {formatINR(round.actualPrice)}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-orange-400 font-semibold text-sm">+{round.roundScore}</p>
                  <p className="text-zinc-500 text-xs">{round.percentError}% off</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Score */}
        {!submitted ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
            <h3 className="text-white font-semibold mb-3">Submit to Leaderboard</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                maxLength={30}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white
                           placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <Button
                onClick={handleSubmit}
                disabled={!playerName.trim() || submitting}
              >
                {submitting ? '...' : 'Submit'}
              </Button>
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center mb-6"
          >
            <p className="text-green-400 font-semibold">Score submitted!</p>
            {rank && <p className="text-zinc-400 text-sm mt-1">You ranked #{rank}</p>}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handlePlayAgain} variant="secondary" className="flex-1">
            Play Again
          </Button>
          <Button onClick={() => router.push('/leaderboard')} className="flex-1">
            Leaderboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
