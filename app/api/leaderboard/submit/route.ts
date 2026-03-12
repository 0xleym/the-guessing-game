import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/sessions';
import { addEntry } from '@/lib/leaderboard';
import { getCountryFromIP } from '@/lib/geolocation';
import { GameMode } from '@/types';
import { checkRateLimit, rateLimitResponse, maybeCleanupRateLimitMap } from '@/lib/rateLimit';

const RATE_LIMIT = { windowMs: 60_000, maxRequests: 5 };

export async function POST(req: NextRequest) {
  maybeCleanupRateLimitMap(RATE_LIMIT.windowMs);
  const rl = checkRateLimit(req, RATE_LIMIT);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  try {
    const body = await req.json();
    const { sessionId, playerName } = body;

    if (!sessionId || !playerName || typeof playerName !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId or playerName' }, { status: 400 });
    }

    // Strip control chars, zero-width chars, RTL/LTR overrides
    const sanitizedName = playerName
      .trim()
      .slice(0, 30)
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F\uFEFF]/g, '')
      .trim();
    if (sanitizedName.length === 0) {
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

    if (!Number.isFinite(session.totalScore) || session.totalScore < 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }

    // Get country from IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || '127.0.0.1';
    const { countryCode, countryName } = await getCountryFromIP(ip);

    const entry = await addEntry(
      sanitizedName,
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
