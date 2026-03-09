'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryStats } from '@/types';

interface Props {
  countries: CountryStats[];
}

export default function WorldMapInner({ countries }: Props) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/countries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(() => {});
  }, []);

  if (!geoData) {
    return (
      <div className="aspect-[4/3] bg-zinc-800 rounded-xl flex items-center justify-center animate-pulse">
        <p className="text-zinc-600 text-sm">Loading map...</p>
      </div>
    );
  }

  const countryMap = new Map(countries.map((c) => [c.countryCode, c]));

  const getColor = (playerCount: number) => {
    if (playerCount > 100) return '#c2410c';
    if (playerCount > 50) return '#ea580c';
    if (playerCount > 20) return '#f97316';
    if (playerCount > 10) return '#fb923c';
    if (playerCount > 5) return '#fdba74';
    if (playerCount > 0) return '#fed7aa';
    return 'transparent';
  };

  const style = (feature: GeoJSON.Feature | undefined) => {
    const iso = feature?.properties?.ISO_A2;
    const stats = iso ? countryMap.get(iso) : undefined;
    const hasPlayers = stats && stats.playerCount > 0;

    return {
      fillColor: hasPlayers ? getColor(stats.playerCount) : 'transparent',
      weight: hasPlayers ? 2 : 0.5,
      opacity: 1,
      color: hasPlayers ? '#ea580c' : '#3f3f46',
      fillOpacity: hasPlayers ? 0.7 : 0,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const iso = feature.properties?.ISO_A2;
    const name = feature.properties?.name;
    const stats = iso ? countryMap.get(iso) : undefined;

    if (stats) {
      (layer as L.Path).bindPopup(
        `<div style="text-align:center">
          <strong>${name}</strong><br/>
          <span>${stats.playerCount} player${stats.playerCount > 1 ? 's' : ''}</span><br/>
          <span>Top: ${stats.topScore.toLocaleString()} pts</span>
        </div>`
      );
    }
  };

  return (
    <MapContainer
      center={[20, 0]}
      zoom={1}
      minZoom={1}
      maxZoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      attributionControl={false}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
    </MapContainer>
  );
}
