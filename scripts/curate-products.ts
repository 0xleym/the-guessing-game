import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import crypto from 'crypto';

// Load .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// ─── Config ──────────────────────────────────────────────
const BUCKET_NAME = 'product-images';
const MAX_IMAGE_DIM = 600;
const IMAGE_QUALITY = 80;
const CONCURRENCY = 5;
const MAX_RETRIES = 3;

const PRICE_TIERS = {
  easy: { min: 1, max: 600 },
  medium: { min: 601, max: 7000 },
  hard: { min: 7001, max: Infinity },
} as const;

type Difficulty = 'easy' | 'medium' | 'hard';

interface RawProduct {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  priceInr: number;
  originalImageUrl: string;
  imageUrl: string;
  difficulty: Difficulty;
}

// ─── Helpers ─────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join('-');
}

function shortHash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 4);
}

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num);
}

function getDifficulty(price: number): Difficulty {
  if (price <= PRICE_TIERS.easy.max) return 'easy';
  if (price <= PRICE_TIERS.medium.max) return 'medium';
  return 'hard';
}

function parseCategory(raw: string | undefined): { category: string; subcategory: string } | null {
  if (!raw || raw.trim().length === 0) return null;
  // Categories in the Kaggle dataset use | as separator
  const parts = raw.split(/[|>]/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return {
    category: parts[0],
    subcategory: parts.length > 1 ? parts[1] : parts[0],
  };
}

function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' && parsed.hostname.includes('amazon');
  } catch {
    return false;
  }
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  throw new Error('Exhausted retries');
}

async function processInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<(R | null)[]> {
  const results: (R | null)[] = new Array(items.length).fill(null);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch {
        results[idx] = null;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

// ─── Main ────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: npx tsx scripts/curate-products.ts <path-to-csv>');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Step 1: Parse CSV
  console.log(`\n📄 Reading CSV: ${csvPath}`);
  const csvContent = fs.readFileSync(path.resolve(csvPath), 'utf-8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];
  console.log(`   Parsed ${rows.length} rows`);

  // Step 2: Clean & Filter
  console.log('\n🧹 Cleaning and filtering...');
  const seenNames = new Set<string>();
  const candidates: RawProduct[] = [];

  for (const row of rows) {
    const name = (row.product_name || '').trim();
    if (!name || name.length < 5 || name.length > 120) continue;

    // Deduplicate by normalized name
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenNames.has(normalizedName)) continue;
    seenNames.add(normalizedName);

    // Parse price (prefer discounted, fallback to actual)
    const price = parsePrice(row.discounted_price) || parsePrice(row.actual_price);
    if (!price || price < 50 || price > 100000) continue;

    // Validate image URL
    const imgUrl = (row.img_link || '').trim();
    if (!isValidImageUrl(imgUrl)) continue;

    // Parse category
    const cat = parseCategory(row.category);
    if (!cat) continue;

    const slug = slugify(name);
    const id = `p-${slug}-${shortHash(name)}`;

    candidates.push({
      id,
      name,
      category: cat.category,
      subcategory: cat.subcategory,
      priceInr: price,
      originalImageUrl: imgUrl,
      imageUrl: '', // set after upload
      difficulty: getDifficulty(price),
    });
  }

  console.log(`   ${candidates.length} valid products after filtering`);

  // Step 3: Show difficulty distribution
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  for (const p of candidates) byDifficulty[p.difficulty]++;
  console.log(`   Easy: ${byDifficulty.easy} | Medium: ${byDifficulty.medium} | Hard: ${byDifficulty.hard}`);

  // Step 4: Ensure bucket exists
  console.log(`\n🪣 Ensuring Supabase bucket "${BUCKET_NAME}" exists...`);
  const { data: bucket } = await supabase.storage.getBucket(BUCKET_NAME);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    if (error) {
      console.error(`   Failed to create bucket: ${error.message}`);
      process.exit(1);
    }
    console.log('   Created new public bucket');
  } else {
    console.log('   Bucket already exists');
  }

  // Step 5: Download, optimize, and upload images
  console.log(`\n🖼️  Processing images (concurrency: ${CONCURRENCY})...`);
  let successCount = 0;
  let failCount = 0;

  const results = await processInBatches(candidates, CONCURRENCY, async (product, idx) => {
    try {
      // Download
      const rawBuffer = await fetchWithRetry(product.originalImageUrl);

      // Optimize with sharp
      const optimized = await sharp(rawBuffer)
        .resize(MAX_IMAGE_DIM, MAX_IMAGE_DIM, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: IMAGE_QUALITY })
        .toBuffer();

      // Upload to Supabase Storage
      const filePath = `${product.id}.webp`;
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, optimized, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) throw new Error(error.message);

      // Set public URL
      product.imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;

      successCount++;
      if (successCount % 25 === 0 || successCount === 1) {
        console.log(`   ✅ ${successCount}/${candidates.length}: ${product.name.slice(0, 50)}`);
      }

      return product;
    } catch (err) {
      failCount++;
      console.log(`   ❌ Failed: ${product.name.slice(0, 40)} — ${(err as Error).message}`);
      return null;
    }
  });

  // Filter out failed products
  const finalProducts = results.filter((p): p is RawProduct => p !== null && p.imageUrl !== '');

  console.log(`\n   Processed: ${successCount} succeeded, ${failCount} failed`);

  // Step 6: Write products.json
  const output = finalProducts
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      priceInr: p.priceInr,
      imageUrl: p.imageUrl,
      difficulty: p.difficulty,
    }));

  const outputPath = path.resolve(process.cwd(), 'data/products.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Step 7: Summary
  const finalByDifficulty = { easy: 0, medium: 0, hard: 0 };
  const categories = new Set<string>();
  for (const p of output) {
    finalByDifficulty[p.difficulty as Difficulty]++;
    categories.add(p.category);
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ Written ${output.length} products to data/products.json`);
  console.log(`   Easy: ${finalByDifficulty.easy} | Medium: ${finalByDifficulty.medium} | Hard: ${finalByDifficulty.hard}`);
  console.log(`   Categories: ${categories.size} — ${[...categories].join(', ')}`);
  console.log(`   Failed downloads: ${failCount}`);
  console.log('══════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
