interface GeoResult {
  countryCode: string;
  countryName: string;
}

export async function getCountryFromIP(ip: string): Promise<GeoResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Geo lookup failed');
    const data = await res.json();

    if (!data.country_code || data.error) {
      throw new Error('Invalid geo response');
    }

    return {
      countryCode: data.country_code,
      countryName: data.country_name || 'Unknown',
    };
  } catch {
    return { countryCode: 'XX', countryName: 'Unknown' };
  }
}
