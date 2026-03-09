import { NextRequest, NextResponse } from 'next/server';
import { selectProducts } from '@/lib/products';
import { createSession } from '@/lib/sessions';
import { GameMode } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rounds: GameMode = body.rounds === 10 ? 10 : 5;

    const products = selectProducts(rounds);
    const session = await createSession(products, rounds);
    const firstProduct = session.products[0];

    return NextResponse.json({
      sessionId: session.id,
      totalRounds: session.totalRounds,
      round: {
        id: firstProduct.id,
        name: firstProduct.name,
        imageUrl: firstProduct.imageUrl,
        difficulty: firstProduct.difficulty,
        // NO price or category sent
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
