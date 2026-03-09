interface GeoResult {
  countryCode: string;
  countryName: string;
}

export async function getCountryFromIP(ip: string): Promise<GeoResult> {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,country`);
    if (!res.ok) throw new Error('Geo lookup failed');
    const data = await res.json();
    return {
      countryCode: data.countryCode || 'XX',
      countryName: data.country || 'Unknown',
    };
  } catch {
    return { countryCode: 'XX', countryName: 'Unknown' };
  }
}
