'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';

export function PriceInput() {
  const [input, setInput] = useState('');
  const { submitGuess, status } = useGameStore();
  const isLoading = status === 'loading';

  const formatWithCommas = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('en-IN');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInput(raw ? formatWithCommas(raw) : '');
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const price = Number(input.replace(/,/g, ''));
      if (price > 0) {
        submitGuess(price);
        setInput('');
      }
    },
    [input, submitGuess]
  );

  const price = Number(input.replace(/,/g, ''));

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mt-6">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold text-lg">
            ₹
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={input}
            onChange={handleChange}
            placeholder="Enter your guess"
            className="w-full bg-surface-input border border-border-input rounded-xl pl-10 pr-4 py-3.5 text-text-primary text-[16px] sm:text-lg font-medium
                       placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                       transition-colors"
            autoFocus
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={price <= 0 || isLoading} size="lg">
          {isLoading ? '...' : 'Guess!'}
        </Button>
      </div>
    </form>
  );
}
