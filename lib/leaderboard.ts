import { v4 as uuidv4 } from 'uuid';
import { LeaderboardEntry, GameMode } from '@/types';

// In-memory leaderboard store (replace with Supabase for production)
const entries: LeaderboardEntry[] = [];

export function addEntry(
  playerName: string,
  score: number,
  roundsPlayed: number,
  gameMode: GameMode,
  countryCode: string,
  countryName: string
): LeaderboardEntry {
  const entry: LeaderboardEntry = {
    id: uuidv4(),
    rank: 0, // calculated on read
    playerName,
    score,
    roundsPlayed,
    gameMode,
    countryCode,
    countryName,
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);

  // Calculate rank (how many entries have a higher score + 1)
  const rank = entries.filter((e) => e.score > score).length + 1;
  entry.rank = rank;

  return entry;
}

export function getTopEntries(mode?: GameMode, limit = 50): LeaderboardEntry[] {
  let filtered = mode ? entries.filter((e) => e.gameMode === mode) : entries;
  filtered = filtered.sort((a, b) => b.score - a.score).slice(0, limit);
  return filtered.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getCountryStats(): { countryCode: string; countryName: string; playerCount: number; topScore: number }[] {
  const countryMap = new Map<string, { countryName: string; playerCount: number; topScore: number }>();

  for (const entry of entries) {
    const existing = countryMap.get(entry.countryCode);
    if (existing) {
      existing.playerCount += 1;
      existing.topScore = Math.max(existing.topScore, entry.score);
    } else {
      countryMap.set(entry.countryCode, {
        countryName: entry.countryName,
        playerCount: 1,
        topScore: entry.score,
      });
    }
  }

  return Array.from(countryMap.entries()).map(([code, stats]) => ({
    countryCode: code,
    ...stats,
  }));
}
