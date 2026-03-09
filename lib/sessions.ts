import { v4 as uuidv4 } from 'uuid';
import { GameMode, RoundResult, ProductFull } from '@/types';

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

// In-memory store (replace with Supabase for production)
const sessions = new Map<string, ServerSession>();

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

export function createSession(products: ProductFull[], totalRounds: GameMode): ServerSession {
  const id = uuidv4();
  const now = Date.now();
  const session: ServerSession = {
    id,
    totalRounds,
    products,
    currentRound: 0,
    roundsData: [],
    totalScore: 0,
    lifelinesUsed: { category: false, range: false },
    lifelinesUsedThisRound: [],
    completed: false,
    submitted: false,
    createdAt: now,
    expiresAt: now + SESSION_TTL,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): ServerSession | null {
  const session = sessions.get(id);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(id);
    return null;
  }
  return session;
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now > session.expiresAt) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000); // every 5 minutes
