import productsData from '@/data/products.json';
import { ProductFull } from '@/types';

const products: ProductFull[] = productsData as ProductFull[];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectProducts(count: number): ProductFull[] {
  // Try to get a balanced mix of difficulties
  const easy = products.filter((p) => p.difficulty === 'easy');
  const medium = products.filter((p) => p.difficulty === 'medium');
  const hard = products.filter((p) => p.difficulty === 'hard');

  const shuffledEasy = shuffleArray(easy);
  const shuffledMedium = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);

  const selected: ProductFull[] = [];

  if (count === 5) {
    // 1 easy, 3 medium, 1 hard
    selected.push(...shuffledEasy.slice(0, 1));
    selected.push(...shuffledMedium.slice(0, 3));
    selected.push(...shuffledHard.slice(0, 1));
  } else {
    // 10 rounds: 2 easy, 5 medium, 3 hard
    selected.push(...shuffledEasy.slice(0, 2));
    selected.push(...shuffledMedium.slice(0, 5));
    selected.push(...shuffledHard.slice(0, 3));
  }

  // Shuffle the final selection so difficulties are mixed
  return shuffleArray(selected);
}

export function getProductById(id: string): ProductFull | undefined {
  return products.find((p) => p.id === id);
}
