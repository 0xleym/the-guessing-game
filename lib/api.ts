import {
  StartGameResponse,
  GuessResponse,
  LifelineResponse,
  GameSummary,
  LeaderboardEntry,
  CountryStats,
  GameMode,
} from '@/types';

const BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function startGame(rounds: GameMode): Promise<StartGameResponse> {
  return fetchJSON(`${BASE}/game/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rounds }),
  });
}

export async function submitGuess(sessionId: string, guessedPrice: number): Promise<GuessResponse> {
  return fetchJSON(`${BASE}/game/${sessionId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guessedPrice }),
  });
}

export async function useLifeline(
  sessionId: string,
  type: 'category' | 'range'
): Promise<LifelineResponse> {
  return fetchJSON(`${BASE}/game/${sessionId}/lifeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
}

export async function getGameSummary(sessionId: string): Promise<GameSummary> {
  return fetchJSON(`${BASE}/game/${sessionId}/summary`);
}

export async function submitScore(
  sessionId: string,
  playerName: string
): Promise<{ entry: LeaderboardEntry }> {
  return fetchJSON(`${BASE}/leaderboard/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, playerName }),
  });
}

export async function getLeaderboard(
  mode?: GameMode,
  limit = 50
): Promise<{ entries: LeaderboardEntry[] }> {
  const params = new URLSearchParams();
  if (mode) params.set('mode', String(mode));
  if (limit) params.set('limit', String(limit));
  return fetchJSON(`${BASE}/leaderboard?${params}`);
}

export async function getCountryStats(): Promise<{ countries: CountryStats[] }> {
  return fetchJSON(`${BASE}/leaderboard/countries`);
}
