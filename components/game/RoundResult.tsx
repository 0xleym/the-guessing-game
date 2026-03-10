'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatINR } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { FeedbackTier } from '@/types';

const feedbackConfig: Record<
  FeedbackTier,
  { label: string; emoji: string; color: string; bg: string }
> = {
  perfect: { label: 'NAILED IT!', emoji: '🎯', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  close: { label: 'So close!', emoji: '🔥', color: 'text-green-400', bg: 'bg-green-500/10' },
  warm: { label: 'Not bad!', emoji: '👍', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  cold: { label: 'Could be better', emoji: '❄️', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  way_off: { label: 'Way off!', emoji: '💥', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export function RoundResult() {
  const { lastRoundResult, currentRound, totalRounds, nextRound } = useGameStore();

  if (!lastRoundResult) return null;

  const fb = feedbackConfig[lastRoundResult.feedback];
  const isLastRound = currentRound >= totalRounds;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-surface-overlay backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-surface-card rounded-2xl border border-border p-5 sm:p-6 max-w-sm w-full mx-4 sm:mx-auto"
        >
          {/* Feedback Emoji & Label */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{fb.emoji}</div>
            <h3 className={`text-2xl font-bold ${fb.color}`}>{fb.label}</h3>
          </div>

          {/* Price Comparison */}
          <div className={`${fb.bg} rounded-xl p-4 mb-4 space-y-3`}>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Your guess</span>
              <span className="text-text-primary font-semibold text-lg">
                {formatINR(lastRoundResult.guessedPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Actual price</span>
              <span className="text-accent font-bold text-lg">
                {formatINR(lastRoundResult.actualPrice)}
              </span>
            </div>
            <div className="border-t border-border-input/50 pt-2 flex justify-between items-center">
              <span className="text-text-secondary text-sm">Off by</span>
              <span className="text-text-primary font-medium">{lastRoundResult.percentError}%</span>
            </div>
          </div>

          {/* Score */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 15 }}
              className="inline-flex items-center gap-2 bg-surface-input rounded-xl px-6 py-3"
            >
              <span className="text-text-secondary text-sm">Points</span>
              <span className="text-accent font-bold text-2xl">
                +{lastRoundResult.roundScore}
              </span>
            </motion.div>
          </div>

          {/* Next Button */}
          <Button onClick={nextRound} className="w-full" size="lg">
            {isLastRound ? 'See Results' : 'Next Round →'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
