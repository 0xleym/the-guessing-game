import { v4 as uuidv4 } from 'uuid';
import { LeaderboardEntry, GameMode } from '@/types';
import { getSupabase } from '@/lib/supabase';

export async function addEntry(
  playerName: string,
  score: number,
  roundsPlayed: number,
  gameMode: GameMode,
  countryCode: string,
  countryName: string
): Promise<LeaderboardEntry> {
  const id = uuidv4();

  const { data, error } = await getSupabase()
    .from('leaderboard')
    .insert({
      id,
      player_name: playerName,
      score,
      rounds_played: roundsPlayed,
      game_mode: gameMode,
      country_code: countryCode,
      country_name: countryName,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to add leaderboard entry: ${error?.message}`);
  }

  // Compute rank: count entries with higher score + 1
  const { count } = await getSupabase()
    .from('leaderboard')
    .select('*', { count: 'exact', head: true })
    .gt('score', score);

  return {
    id: data.id,
    rank: (count ?? 0) + 1,
    playerName: data.player_name,
    score: data.score,
    roundsPlayed: data.rounds_played,
    gameMode: data.game_mode,
    countryCode: data.country_code,
    countryName: data.country_name,
    createdAt: data.created_at,
  };
}

export async function getTopEntries(
  mode?: GameMode,
  limit = 50
): Promise<LeaderboardEntry[]> {
  let query = getSupabase()
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (mode !== undefined) {
    query = query.eq('game_mode', mode);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(`Failed to fetch leaderboard: ${error?.message}`);
  }

  return data.map((row, index) => ({
    id: row.id as string,
    rank: index + 1,
    playerName: row.player_name as string,
    score: row.score as number,
    roundsPlayed: row.rounds_played as number,
    gameMode: row.game_mode as GameMode,
    countryCode: row.country_code as string,
    countryName: row.country_name as string,
    createdAt: row.created_at as string,
  }));
}

export async function getCountryStats(): Promise<
  { countryCode: string; countryName: string; playerCount: number; topScore: number }[]
> {
  // TODO: Replace JS aggregation with a Supabase RPC using SQL GROUP BY at scale
  const { data, error } = await getSupabase()
    .from('leaderboard')
    .select('country_code, country_name, score')
    .limit(10000);

  if (error || !data) {
    throw new Error(`Failed to fetch country stats: ${error?.message}`);
  }

  const countryMap = new Map<
    string,
    { countryName: string; playerCount: number; topScore: number }
  >();

  for (const row of data) {
    const code = row.country_code as string;
    const existing = countryMap.get(code);
    if (existing) {
      existing.playerCount += 1;
      existing.topScore = Math.max(existing.topScore, row.score as number);
    } else {
      countryMap.set(code, {
        countryName: row.country_name as string,
        playerCount: 1,
        topScore: row.score as number,
      });
    }
  }

  return Array.from(countryMap.entries()).map(([code, stats]) => ({
    countryCode: code,
    ...stats,
  }));
}
