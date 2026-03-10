'use client';

import { Suspense, useEffect, useRef } from 'react';
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
  const { status, currentProduct, startGame, error, reset } = useGameStore();
  const gameStarted = useRef(false);

  useEffect(() => {
    // On mount, always start a fresh game (clears stale game_over state)
    if (!gameStarted.current) {
      gameStarted.current = true;
      const mode = searchParams.get('mode') === '10' ? 10 : 5;
      reset();
      startGame(mode as GameMode);
      return;
    }
    // After game has started, redirect when it naturally ends
    if (status === 'game_over') {
      router.push('/game-over');
    }
  }, [status, searchParams, startGame, reset, router]);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎯</div>
          <p className="text-text-secondary">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="text-accent hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface flex flex-col items-center px-4 pt-6 sm:pt-8 pb-8 sm:pb-16">
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
        <div className="min-h-[100dvh] bg-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎯</div>
            <p className="text-text-secondary">Loading game...</p>
          </div>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
