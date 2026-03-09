import { Difficulty, FeedbackTier } from '@/types';

const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

const BASE_POINTS = 1000;
const PERFECT_BONUS = 500;
const PERFECT_THRESHOLD = 0.01; // 1%
const LIFELINE_PENALTY = 0.8;
const DECAY_RATE = 3;

export function calculateScore(
  guessedPrice: number,
  actualPrice: number,
  difficulty: Difficulty,
  lifelinesUsedCount: number
): { score: number; percentError: number; feedback: FeedbackTier } {
  const percentError = Math.abs(guessedPrice - actualPrice) / actualPrice;
  const accuracyMultiplier = Math.max(0, Math.exp(-DECAY_RATE * percentError));
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const lifelinePenalty = Math.pow(LIFELINE_PENALTY, lifelinesUsedCount);
  const exactMatchBonus = percentError <= PERFECT_THRESHOLD ? PERFECT_BONUS : 0;

  const score = Math.round(
    BASE_POINTS * accuracyMultiplier * difficultyMultiplier * lifelinePenalty + exactMatchBonus
  );

  return {
    score,
    percentError: Math.round(percentError * 10000) / 100, // e.g., 12.34%
    feedback: getFeedback(percentError),
  };
}

function getFeedback(percentError: number): FeedbackTier {
  if (percentError <= 0.01) return 'perfect';
  if (percentError <= 0.1) return 'close';
  if (percentError <= 0.25) return 'warm';
  if (percentError <= 0.5) return 'cold';
  return 'way_off';
}

export function calculateRange(actualPrice: number): { low: number; high: number } {
  const rawLow = actualPrice * 0.5;
  const rawHigh = actualPrice * 1.5;

  const roundTo =
    actualPrice > 10000 ? 500 : actualPrice > 1000 ? 100 : actualPrice > 100 ? 50 : 10;

  return {
    low: Math.floor(rawLow / roundTo) * roundTo,
    high: Math.ceil(rawHigh / roundTo) * roundTo,
  };
}
