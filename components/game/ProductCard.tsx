'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/types';

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-card rounded-2xl border border-border overflow-hidden max-w-md mx-auto w-full"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-surface-card flex items-center justify-center">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            <div className="text-center">
              <div className="text-6xl mb-4">🛍️</div>
              <p className="text-sm text-text-tertiary">Product Image</p>
            </div>
          </div>
        ) : (
          <>
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-card z-10">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-orange-500 rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 448px) 100vw, 448px"
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgError(true);
                setImgLoading(false);
              }}
            />
          </>
        )}

        {/* Difficulty Badge */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border z-20 ${difficultyColors[product.difficulty]}`}
        >
          {product.difficulty}
        </span>
      </div>

      {/* Product Name */}
      <div className="p-4 sm:p-5">
        <h2 className="text-text-primary font-semibold text-base sm:text-lg leading-snug">{product.name}</h2>
      </div>
    </motion.div>
  );
}
