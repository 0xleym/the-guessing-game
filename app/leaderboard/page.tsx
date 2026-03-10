'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LeaderboardEntry, GameMode } from '@/types';
import * as api from '@/lib/api';

export default function LeaderboardPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mode, setMode] = useState<GameMode | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const lb = await api.getLeaderboard(mode);
        setEntries(lb.entries);
      } catch {
        // silent
      }
      setLoading(false);
    }
    load();
  }, [mode]);

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-[100dvh] bg-surface px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Top bar with theme toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-2">Leaderboard</h1>
          <p className="text-text-tertiary">Top price guessers</p>
        </motion.div>

        {/* Mode Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {[undefined, 5, 10].map((m) => (
            <button
              key={String(m)}
              onClick={() => setMode(m as GameMode | undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer min-h-[40px]
                ${
                  mode === m
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-surface-input/50 text-text-secondary border border-border-input/50 hover:border-border-input'
                }`}
            >
              {m === undefined ? 'All' : `${m} Rounds`}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Leaderboard Table */}
          <div className="bg-surface-card border border-border rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-text-tertiary">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-text-secondary">No scores yet. Be the first!</p>
                <Button onClick={() => router.push('/')} className="mt-4" size="sm">
                  Play Now
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-text-tertiary text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Rank</th>
                    <th className="text-left px-4 py-3">Player</th>
                    <th className="text-right px-4 py-3">Score</th>
                    <th className="text-right px-4 py-3 hidden sm:table-cell">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface-input/30 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        {entry.rank <= 3 ? (
                          <span className="text-lg">{rankEmoji(entry.rank)}</span>
                        ) : (
                          <span className="text-text-tertiary">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-primary font-medium text-sm">
                        {entry.playerName}
                      </td>
                      <td className="px-4 py-3 text-right text-accent font-bold tabular-nums text-sm">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-text-tertiary text-sm hidden sm:table-cell">
                        {entry.gameMode}R
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button onClick={() => router.push('/')} variant="secondary">
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
