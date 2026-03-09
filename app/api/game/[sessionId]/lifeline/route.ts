import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/sessions';
import { calculateRange } from '@/lib/scoring';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
    }

    if (session.completed) {
      return NextResponse.json({ error: 'Game already completed' }, { status: 400 });
    }

    const body = await req.json();
    const type: 'category' | 'range' = body.type;

    if (type !== 'category' && type !== 'range') {
      return NextResponse.json({ error: 'Invalid lifeline type' }, { status: 400 });
    }

    if (session.lifelinesUsed[type]) {
      return NextResponse.json({ error: 'Lifeline already used' }, { status: 400 });
    }

    session.lifelinesUsed[type] = true;
    session.lifelinesUsedThisRound.push(type);

    await updateSession(session);

    const currentProduct = session.products[session.currentRound];

    if (type === 'category') {
      return NextResponse.json({
        type: 'category',
        category: currentProduct.category,
        subcategory: currentProduct.subcategory,
      });
    } else {
      const range = calculateRange(currentProduct.priceInr);
      return NextResponse.json({
        type: 'range',
        low: range.low,
        high: range.high,
      });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to use lifeline' }, { status: 500 });
  }
}
