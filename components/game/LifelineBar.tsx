'use client';

import { useGameStore } from '@/store/gameStore';
import { formatINR } from '@/lib/format';

export function LifelineBar() {
  const { lifelines, categoryHint, rangeHint, useLifeline, status } = useGameStore();
  const isGuessing = status === 'guessing';

  return (
    <div className="w-full max-w-md mx-auto mt-4 space-y-3">
      <div className="flex gap-3">
        {/* Category Lifeline */}
        <button
          onClick={() => useLifeline('category')}
          disabled={lifelines.category || !isGuessing}
          className={`flex-1 px-3 sm:px-4 py-3 rounded-xl text-sm font-medium transition-all border min-h-[44px]
            ${
              lifelines.category
                ? 'bg-surface-input/50 border-border-input/50 text-text-tertiary cursor-not-allowed'
                : 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 cursor-pointer'
            }`}
        >
          {lifelines.category ? '✓ Category Used' : '🏷️ Reveal Category'}
        </button>

        {/* Range Lifeline */}
        <button
          onClick={() => useLifeline('range')}
          disabled={lifelines.range || !isGuessing}
          className={`flex-1 px-3 sm:px-4 py-3 rounded-xl text-sm font-medium transition-all border min-h-[44px]
            ${
              lifelines.range
                ? 'bg-surface-input/50 border-border-input/50 text-text-tertiary cursor-not-allowed'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 cursor-pointer'
            }`}
        >
          {lifelines.range ? '✓ Range Used' : '📊 Price Range'}
        </button>
      </div>

      {/* Hints display */}
      {categoryHint && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-purple-300">
            {categoryHint.category} &rsaquo; {categoryHint.subcategory}
          </span>
        </div>
      )}

      {rangeHint && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-blue-300">
            Price range: {formatINR(rangeHint.low)} – {formatINR(rangeHint.high)}
          </span>
        </div>
      )}
    </div>
  );
}
