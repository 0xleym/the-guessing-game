import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/sessions';
import { addEntry } from '@/lib/leaderboard';
import { getCountryFromIP } from '@/lib/geolocation';
import { GameMode } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, playerName } = body;

    if (!sessionId || !playerName || typeof playerName !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId or playerName' }, { status: 400 });
    }

    const trimmedName = playerName.trim().slice(0, 30);
    if (trimmedName.length === 0) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    if (!session.completed) {
      return NextResponse.json({ error: 'Game not completed yet' }, { status: 400 });
    }

    if (session.submitted) {
      return NextResponse.json({ error: 'Score already submitted' }, { status: 400 });
    }

    // Get country from IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '127.0.0.1';
    const { countryCode, countryName } = await getCountryFromIP(ip);

    const entry = await addEntry(
      trimmedName,
      session.totalScore,
      session.totalRounds,
      session.totalRounds as GameMode,
      countryCode,
      countryName
    );

    session.submitted = true;
    await updateSession(session);

    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
