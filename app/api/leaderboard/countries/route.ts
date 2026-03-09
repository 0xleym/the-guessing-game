import { NextResponse } from 'next/server';
import { getCountryStats } from '@/lib/leaderboard';

export async function GET() {
  const countries = await getCountryStats();
  return NextResponse.json({ countries });
}
