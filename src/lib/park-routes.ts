/** Canonical park slug used in dashboard query strings. */
export function normalizeParkId(raw: string | null | undefined, fallback = 'mana-pools-national-park'): string {
  if (!raw) return fallback;
  try {
    return decodeURIComponent(raw).trim().toLowerCase().replace(/\s+/g, '-');
  } catch {
    return raw.trim().toLowerCase().replace(/\s+/g, '-');
  }
}

/** Build a park dashboard path with a safely encoded parkId query. */
export function parkPath(path: string, parkId: string): string {
  const params = new URLSearchParams({ parkId: normalizeParkId(parkId) });
  return `${path}?${params.toString()}`;
}

/** Slug from a display name (e.g. "Mana Pools National Park"). */
export function slugFromParkName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}
