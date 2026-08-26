/** Mana Pools 24-hour static pans from the paper sheet. */
export const MANA_24H_PANS = [
  { id: 'mana-mhara', name: 'Mhara', aliases: ['mhara'] },
  { id: 'mana-nyamawani', name: 'Nyamawani', aliases: ['nyamawani'] },
  { id: 'mana-kavinga', name: 'Kavinga', aliases: ['kavinga'] },
  { id: 'mana-kanga', name: 'Kanga', aliases: ['kanga'] },
  { id: 'mana-ingwe', name: 'Ingwe', aliases: ['ingwe'] },
] as const;

export function panDisplayName(idOrName?: string | null): string {
  if (!idOrName) return '';
  const raw = String(idOrName).trim();
  const key = raw.toLowerCase().replace(/[-_]/g, ' ');
  for (const pan of MANA_24H_PANS) {
    if (raw === pan.id || raw.toLowerCase() === pan.name.toLowerCase()) return pan.name;
    if (pan.aliases.some((alias) => key.includes(alias))) return pan.name;
  }
  return raw.replace(/^mana-/, '').replace(/-/g, ' ');
}

export function resolvePhotoUrl(url: string | null, payload?: any) {
  if (!url && payload?.photo_uri) {
    if (payload.photo_uri.includes('ImagePicker') || payload.photo_uri.startsWith('file://')) {
      url = payload.photo_uri.split('/').pop();
    } else {
      url = payload.photo_uri;
    }
  }

  if (!url) return null;
  if (url.startsWith('http')) return url;

  const supabaseUrl = 'https://pqfbcvxisrmtmhmuxbjk.supabase.co';
  let cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  if (cleanUrl.startsWith('photos/')) {
    cleanUrl = cleanUrl.replace('photos/', '');
  }
  return `${supabaseUrl}/storage/v1/object/public/photos/${cleanUrl}`;
}

function num(v: any) {
  return Number(v) || 0;
}

/**
 * Maps a gamecount.field_observations row (plus payload backup) into the
 * dashboard observation shape. Static pans use M/F/U/Y; transects keep adult/sub/juv.
 */
export function normalizeObservation(o: any) {
  const p = o.payload || {};
  const type = o.survey_type || p.survey_type || 'Unknown';
  const isStatic = type === 'Static';

  const adultSum = num(p.adult_m) + num(p.adult_f) + num(p.adult_u);
  const subSum = num(p.sub_adult_m) + num(p.sub_adult_f) + num(p.sub_adult_u);
  const juvSum = num(p.juv_m) + num(p.juv_f) + num(p.juv_u);
  const young = num(o.young_count ?? p.young_count);
  const male = num(o.male_count ?? p.male_count ?? p.adult_m);
  const female = num(o.female_count ?? p.female_count ?? p.adult_f);
  const unknown = num(o.unknown_count ?? p.unknown_count ?? p.adult_u);

  const total = isStatic
    ? (adultSum || male + female + unknown) + young
    : adultSum + subSum + juvSum || male + female + unknown;

  const panName = panDisplayName(o.static_site_name || p.static_site_name || o.static_site_id || p.static_site_id);

  return {
    id: o.id,
    type,
    species:
      (o.species_name && o.species_name !== 'undefined') ? o.species_name :
      (p.species_name && p.species_name !== 'undefined') ? p.species_name :
      (p.other_species && p.other_species !== 'undefined') ? p.other_species :
      (o.species_id && o.species_id !== 'undefined') ? o.species_id : 'Unidentified',
    class: o.classification || p.classification || 'N/A',
    count: total || 0,
    location: isStatic
      ? (panName || 'Pan')
      : (o.transect_id || p.transect_id || 'General'),
    meta: p.session_slot || o.session_slot || o.period_of_day || 'N/A',
    time: p.sighting_time || o.sighting_time || p.session_time || (o.synced_at || o.created_at || '').split('T')[1]?.substring(0, 5) || '',
    sex: 'Mixed',
    age: isStatic ? 'Adult / Young' : 'Mixed',
    date: p.session_date || o.session_date || (o.created_at || '').split('T')[0] || '',
    day_of_week: o.day_of_week || p.day_of_week || '',
    period_of_day: o.period_of_day || p.period_of_day || p.session_slot || '',
    observer: o.observers || p.observers || o.team_leader || p.team_leader_name || 'Field team',
    distance: isStatic ? '' : (p.distance || '0'),
    bearing: isStatic ? '' : (p.bearing || '0'),
    lat: o.lat || p.lat || null,
    lng: o.long || p.long || null,
    accuracy: o.accuracy || p.accuracy || '5',
    habitat: isStatic ? '' : (p.habitat || o.habitat || ''),
    activity: isStatic ? '' : (p.activity || o.activity || ''),
    photo_url: resolvePhotoUrl(o.photo_url, p),
    park_name: o.park_name || p.park_name || o.park_id || '',
    male_count: male,
    female_count: female,
    unknown_count: unknown,
    young_count: young,
    temperatures: o.temperatures || p.temperatures || null,
    matrix: isStatic
      ? { adult: adultSum || male + female + unknown, sub: 0, juv: young, young }
      : { adult: adultSum, sub: subSum, juv: juvSum, young: 0 },
  };
}
