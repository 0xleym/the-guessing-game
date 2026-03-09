import { v4 as uuidv4 } from 'uuid';
import { GameMode, RoundResult, ProductFull } from '@/types';
import { getSupabase } from '@/lib/supabase';

export interface ServerSession {
  id: string;
  totalRounds: number;
  products: ProductFull[];
  currentRound: number;
  roundsData: RoundResult[];
  totalScore: number;
  lifelinesUsed: { category: boolean; range: boolean };
  lifelinesUsedThisRound: string[];
  completed: boolean;
  submitted: boolean;
  createdAt: number;
  expiresAt: number;
}

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// Map snake_case DB row to camelCase ServerSession
function rowToSession(row: Record<string, unknown>): ServerSession {
  return {
    id: row.id as string,
    totalRounds: row.total_rounds as number,
    products: row.products as ProductFull[],
    currentRound: row.current_round as number,
    roundsData: row.rounds_data as RoundResult[],
    totalScore: row.total_score as number,
    lifelinesUsed: row.lifelines_used as { category: boolean; range: boolean },
    lifelinesUsedThisRound: row.lifelines_used_this_round as string[],
    completed: row.completed as boolean,
    submitted: row.submitted as boolean,
    createdAt: new Date(row.created_at as string).getTime(),
    expiresAt: new Date(row.expires_at as string).getTime(),
  };
}

export async function createSession(
  products: ProductFull[],
  totalRounds: GameMode
): Promise<ServerSession> {
  const id = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL);

  const { data, error } = await getSupabase()
    .from('game_sessions')
    .insert({
      id,
      total_rounds: totalRounds,
      products,
      current_round: 0,
      rounds_data: [],
      total_score: 0,
      lifelines_used: { category: false, range: false },
      lifelines_used_this_round: [],
      completed: false,
      submitted: false,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create session: ${error?.message}`);
  }

  return rowToSession(data);
}

export async function getSession(id: string): Promise<ServerSession | null> {
  const { data, error } = await getSupabase()
    .from('game_sessions')
    .select('*')
    .eq('id', id)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return rowToSession(data);
}

export async function updateSession(session: ServerSession): Promise<void> {
  const { error } = await getSupabase()
    .from('game_sessions')
    .update({
      current_round: session.currentRound,
      rounds_data: session.roundsData,
      total_score: session.totalScore,
      lifelines_used: session.lifelinesUsed,
      lifelines_used_this_round: session.lifelinesUsedThisRound,
      completed: session.completed,
      submitted: session.submitted,
    })
    .eq('id', session.id);

  if (error) {
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

export async function deleteSession(id: string): Promise<void> {
  await getSupabase().from('game_sessions').delete().eq('id', id);
}
