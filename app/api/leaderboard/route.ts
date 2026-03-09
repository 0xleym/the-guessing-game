import { NextRequest, NextResponse } from 'next/server';
import { getTopEntries } from '@/lib/leaderboard';
import { GameMode } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modeParam = searchParams.get('mode');
  const limitParam = searchParams.get('limit');

  const mode = modeParam === '5' ? 5 : modeParam === '10' ? 10 : undefined;
  const limit = limitParam ? Math.min(Number(limitParam), 100) : 50;

  const entries = getTopEntries(mode as GameMode | undefined, limit);

  return NextResponse.json({ entries });
}
