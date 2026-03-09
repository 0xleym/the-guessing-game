import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/sessions';
import { calculateScore } from '@/lib/scoring';
import { RoundResult } from '@/types';

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
    const guessedPrice = Number(body.guessedPrice);

    if (isNaN(guessedPrice) || guessedPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const currentProduct = session.products[session.currentRound];
    const { score, percentError, feedback } = calculateScore(
      guessedPrice,
      currentProduct.priceInr,
      currentProduct.difficulty,
      session.lifelinesUsedThisRound.length
    );

    const roundResult: RoundResult = {
      productName: currentProduct.name,
      imageUrl: currentProduct.imageUrl,
      guessedPrice,
      actualPrice: currentProduct.priceInr,
      roundScore: score,
      percentError,
      feedback,
      lifelinesUsed: [...session.lifelinesUsedThisRound],
    };

    session.roundsData.push(roundResult);
    session.totalScore += score;
    session.currentRound += 1;
    session.lifelinesUsedThisRound = [];

    const isLastRound = session.currentRound >= session.totalRounds;
    if (isLastRound) {
      session.completed = true;
    }

    await updateSession(session);

    const nextProduct = isLastRound ? null : session.products[session.currentRound];

    return NextResponse.json({
      actualPrice: currentProduct.priceInr,
      roundScore: score,
      totalScore: session.totalScore,
      percentError,
      feedback,
      nextRound: nextProduct
        ? {
            id: nextProduct.id,
            name: nextProduct.name,
            imageUrl: nextProduct.imageUrl,
            difficulty: nextProduct.difficulty,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to process guess' }, { status: 500 });
  }
}
