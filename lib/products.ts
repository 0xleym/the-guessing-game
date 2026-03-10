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
  if (count !== 5 && count !== 10) {
    throw new Error(`Invalid round count: ${count}. Must be 5 or 10.`);
  }

  const easy = products.filter((p) => p.difficulty === 'easy');
  const medium = products.filter((p) => p.difficulty === 'medium');
  const hard = products.filter((p) => p.difficulty === 'hard');

  const required = count === 5
    ? { easy: 1, medium: 3, hard: 1 }
    : { easy: 2, medium: 5, hard: 3 };

  if (easy.length < required.easy) {
    throw new Error(`Not enough easy products: need ${required.easy}, have ${easy.length}`);
  }
  if (medium.length < required.medium) {
    throw new Error(`Not enough medium products: need ${required.medium}, have ${medium.length}`);
  }
  if (hard.length < required.hard) {
    throw new Error(`Not enough hard products: need ${required.hard}, have ${hard.length}`);
  }

  const shuffledEasy = shuffleArray(easy);
  const shuffledMedium = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);

  const selected: ProductFull[] = [];

  if (count === 5) {
    selected.push(...shuffledEasy.slice(0, 1));
    selected.push(...shuffledMedium.slice(0, 3));
    selected.push(...shuffledHard.slice(0, 1));
  } else {
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
