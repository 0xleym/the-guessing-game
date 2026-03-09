'use client';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden max-w-md mx-auto w-full"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-white flex items-center justify-center p-8">
        <div className="w-full h-full flex items-center justify-center text-zinc-400">
          {/* Placeholder since we don't have real images yet */}
          <div className="text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-sm text-zinc-500">Product Image</p>
          </div>
        </div>

        {/* Difficulty Badge */}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[product.difficulty]}`}
        >
          {product.difficulty}
        </span>
      </div>

      {/* Product Name */}
      <div className="p-5">
        <h2 className="text-white font-semibold text-lg leading-snug">{product.name}</h2>
      </div>
    </motion.div>
  );
}
