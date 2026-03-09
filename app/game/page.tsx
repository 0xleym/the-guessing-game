'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { GameHeader } from '@/components/game/GameHeader';
import { ProductCard } from '@/components/game/ProductCard';
import { PriceInput } from '@/components/game/PriceInput';
import { LifelineBar } from '@/components/game/LifelineBar';
import { RoundResult } from '@/components/game/RoundResult';
import { GameMode } from '@/types';

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, currentProduct, startGame, error } = useGameStore();

  useEffect(() => {
    if (status === 'idle') {
      const mode = searchParams.get('mode') === '10' ? 10 : 5;
      startGame(mode as GameMode);
    }
  }, [status, searchParams, startGame]);

  useEffect(() => {
    if (status === 'game_over') {
      router.push('/game-over');
    }
  }, [status, router]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎯</div>
          <p className="text-zinc-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="text-orange-400 hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 pt-8 pb-16">
      <GameHeader />

      {currentProduct && (
        <>
          <ProductCard product={currentProduct} />
          {status === 'guessing' && (
            <>
              <PriceInput />
              <LifelineBar />
            </>
          )}
        </>
      )}

      {status === 'revealing' && <RoundResult />}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎯</div>
            <p className="text-zinc-400">Loading game...</p>
          </div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
