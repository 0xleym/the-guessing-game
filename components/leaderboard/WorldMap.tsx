'use client';

import { useEffect, useState } from 'react';
import { CountryStats } from '@/types';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const MapInner = dynamic(() => import('./WorldMapInner'), {
  ssr: false,
  loading: () => (
    <div className="aspect-[4/3] bg-surface-input rounded-xl flex items-center justify-center animate-pulse">
      <p className="text-text-tertiary text-sm">Loading map...</p>
    </div>
  ),
});

export function WorldMap({ countries }: { countries: CountryStats[] }) {
  return (
    <div className="aspect-[4/3] rounded-xl overflow-hidden">
      <MapInner countries={countries} />
    </div>
  );
}
