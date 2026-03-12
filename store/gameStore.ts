'use client';

import { create } from 'zustand';
import {
  GameStatus,
  GameMode,
  Product,
  RoundResult,
  LifelineCategoryResponse,
  LifelineRangeResponse,
} from '@/types';
import * as api from '@/lib/api';

interface GameState {
  // Game state
  status: GameStatus;
  sessionId: string | null;
  gameMode: GameMode;
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  currentProduct: Product | null;
  lifelines: { category: boolean; range: boolean };
  categoryHint: LifelineCategoryResponse | null;
  rangeHint: LifelineRangeResponse | null;
  lifelinesUsedThisRound: string[];
  rounds: RoundResult[];
  lastRoundResult: RoundResult | null;
  error: string | null;

  // Actions
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (price: number) => Promise<void>;
  useLifeline: (type: 'category' | 'range') => Promise<void>;
  nextRound: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as GameStatus,
  sessionId: null as string | null,
  gameMode: 5 as GameMode,
  currentRound: 1,
  totalRounds: 5,
  totalScore: 0,
  currentProduct: null as Product | null,
  lifelines: { category: false, range: false },
  categoryHint: null as LifelineCategoryResponse | null,
  rangeHint: null as LifelineRangeResponse | null,
  lifelinesUsedThisRound: [] as string[],
  rounds: [] as RoundResult[],
  lastRoundResult: null as RoundResult | null,
  error: null as string | null,
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  startGame: async (mode: GameMode) => {
    set({ status: 'loading', error: null, gameMode: mode });
    try {
      const data = await api.startGame(mode);
      set({
        status: 'guessing',
        sessionId: data.sessionId,
        totalRounds: data.totalRounds,
        currentRound: 1,
        currentProduct: data.round,
        totalScore: 0,
        lifelines: { category: false, range: false },
        categoryHint: null,
        rangeHint: null,
        rounds: [],
        lastRoundResult: null,
      });
    } catch (e) {
      set({ status: 'idle', error: e instanceof Error ? e.message : 'Failed to start game' });
    }
  },

  submitGuess: async (price: number) => {
    const { sessionId } = get();
    if (!sessionId) return;

    set({ status: 'loading', error: null });
    try {
      const data = await api.submitGuess(sessionId, price);
      const roundResult: RoundResult = {
        productName: get().currentProduct?.name || '',
        imageUrl: get().currentProduct?.imageUrl || '',
        guessedPrice: price,
        actualPrice: data.actualPrice,
        roundScore: data.roundScore,
        percentError: data.percentError,
        feedback: data.feedback,
        lifelinesUsed: get().lifelinesUsedThisRound,
      };

      set((state) => ({
        status: 'revealing',
        totalScore: data.totalScore,
        lastRoundResult: roundResult,
        rounds: [...state.rounds, roundResult],
        // Store next product for when player clicks "Next"
        currentProduct: data.nextRound || state.currentProduct,
      }));
    } catch (e) {
      set({
        status: 'guessing',
        error: e instanceof Error ? e.message : 'Failed to submit guess',
      });
    }
  },

  useLifeline: async (type: 'category' | 'range') => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const data = await api.useLifeline(sessionId, type);
      if (data.type === 'category') {
        set((state) => ({
          lifelines: { ...state.lifelines, category: true },
          categoryHint: data as LifelineCategoryResponse,
          lifelinesUsedThisRound: [...state.lifelinesUsedThisRound, type],
        }));
      } else {
        set((state) => ({
          lifelines: { ...state.lifelines, range: true },
          rangeHint: data as LifelineRangeResponse,
          lifelinesUsedThisRound: [...state.lifelinesUsedThisRound, type],
        }));
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to use lifeline' });
    }
  },

  nextRound: () => {
    const { currentRound, totalRounds } = get();
    if (currentRound >= totalRounds) {
      set({ status: 'game_over' });
    } else {
      set({
        status: 'guessing',
        currentRound: currentRound + 1,
        lastRoundResult: null,
        categoryHint: null,
        rangeHint: null,
        lifelinesUsedThisRound: [],
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
