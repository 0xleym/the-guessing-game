export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 5 | 10;
export type GameStatus = 'idle' | 'loading' | 'guessing' | 'revealing' | 'game_over' | 'submitting' | 'submitted';
export type FeedbackTier = 'perfect' | 'close' | 'warm' | 'cold' | 'way_off';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  difficulty: Difficulty;
  // category and price are server-only during gameplay
}

export interface ProductFull extends Product {
  category: string;
  subcategory: string;
  priceInr: number; // in whole rupees
}

export interface RoundResult {
  productName: string;
  imageUrl: string;
  guessedPrice: number;
  actualPrice: number;
  roundScore: number;
  percentError: number;
  feedback: FeedbackTier;
  lifelinesUsed: string[];
}

export interface GameSession {
  sessionId: string;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  lifelines: { category: boolean; range: boolean }; // true = already used
}

export interface GuessResponse {
  actualPrice: number;
  roundScore: number;
  totalScore: number;
  percentError: number;
  feedback: FeedbackTier;
  nextRound: Product | null; // null if game over
}

export interface LifelineCategoryResponse {
  type: 'category';
  category: string;
  subcategory: string;
}

export interface LifelineRangeResponse {
  type: 'range';
  low: number;
  high: number;
}

export type LifelineResponse = LifelineCategoryResponse | LifelineRangeResponse;

export interface LeaderboardEntry {
  id: string;
  rank: number;
  playerName: string;
  score: number;
  roundsPlayed: number;
  gameMode: GameMode;
  countryCode: string;
  countryName: string;
  createdAt: string;
}

export interface CountryStats {
  countryCode: string;
  countryName: string;
  playerCount: number;
  topScore: number;
}

export interface StartGameResponse {
  sessionId: string;
  totalRounds: number;
  round: Product;
}

export interface GameSummary {
  totalScore: number;
  rounds: RoundResult[];
  gameMode: GameMode;
  canSubmit: boolean;
}
