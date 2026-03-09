'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-screen bg-zinc-950 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-zinc-500">Top price guessers from India</p>
        </motion.div>

        {/* Mode Filter */}
        <div className="flex justify-center gap-2 mb-8">
          {[undefined, 5, 10].map((m) => (
            <button
              key={String(m)}
              onClick={() => setMode(m as GameMode | undefined)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${
                  mode === m
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:border-zinc-600'
                }`}
            >
              {m === undefined ? 'All' : `${m} Rounds`}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Leaderboard Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-zinc-500">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-zinc-400">No scores yet. Be the first!</p>
                <Button onClick={() => router.push('/')} className="mt-4" size="sm">
                  Play Now
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Rank</th>
                    <th className="text-left px-4 py-3">Player</th>
                    <th className="text-right px-4 py-3">Score</th>
                    <th className="text-right px-4 py-3 hidden sm:table-cell">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        {entry.rank <= 3 ? (
                          <span className="text-lg">{rankEmoji(entry.rank)}</span>
                        ) : (
                          <span className="text-zinc-500">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white font-medium text-sm">
                        {entry.playerName}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-400 font-bold tabular-nums text-sm">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500 text-sm hidden sm:table-cell">
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
