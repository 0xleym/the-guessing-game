import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    return NextResponse.json({
      totalScore: session.totalScore,
      rounds: session.roundsData,
      gameMode: session.totalRounds,
      canSubmit: session.completed && !session.submitted,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get summary' }, { status: 500 });
  }
}
