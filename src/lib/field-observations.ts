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

/** Columns needed by the dashboard. Omits `payload`, which historically
 *  embeds camera data URLs and times out Postgres (`57014`). */
export const FIELD_OBSERVATION_COLUMNS = [
  'id', 'park_id', 'species_id', 'species_name', 'park_name', 'classification',
  'photo_url', 'lat', 'long', 'accuracy', 'day_of_week', 'period_of_day',
  'male_count', 'female_count', 'unknown_count', 'activity', 'habitat', 'notes',
  'team_leader', 'survey_type', 'transect_id', 'static_site_id',
  'observers', 'young_count', 'sighting_time', 'session_date', 'session_slot',
  'static_site_name', 'temperatures', 'synced_at', 'created_at',
].join(',');

const LEGACY_FIELD_OBSERVATION_COLUMNS = [
  'id', 'park_id', 'species_id', 'species_name', 'park_name', 'classification',
  'photo_url', 'lat', 'long', 'accuracy', 'day_of_week', 'period_of_day',
  'male_count', 'female_count', 'unknown_count', 'activity', 'habitat', 'notes',
  'team_leader', 'survey_type', 'transect_id', 'static_site_id',
  'synced_at', 'created_at',
].join(',');

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === 'PGRST204' || /column .* does not exist/i.test(error.message || '');
}

function isEmbeddedPhoto(value?: string | null) {
  if (!value) return false;
  return value.startsWith('data:') || value.startsWith('file://') || value.includes('ImagePicker');
}

export async function fetchParkFieldObservations(
  client: any,
  options: { parkId: string; surveyType?: string; abortSignal?: AbortSignal }
) {
  const PAGE_SIZE = 1000;
  const all: any[] = [];
  let from = 0;
  let columns = FIELD_OBSERVATION_COLUMNS;

  const run = (selectColumns: string, start: number) => {
    let query = client
      .from('field_observations')
      .select(selectColumns)
      .eq('park_id', options.parkId)
      .order('created_at', { ascending: false })
      .range(start, start + PAGE_SIZE - 1);
    if (options.surveyType) query = query.eq('survey_type', options.surveyType);
    if (options.abortSignal) query = query.abortSignal(options.abortSignal);
    return query;
  };

  while (true) {
    if (options.abortSignal?.aborted) {
      const abortError = new Error('The field data request was aborted.');
      abortError.name = 'AbortError';
      throw abortError;
    }

    let result = await run(columns, from);
    if (result.error && isMissingColumnError(result.error) && columns === FIELD_OBSERVATION_COLUMNS) {
      columns = LEGACY_FIELD_OBSERVATION_COLUMNS;
      result = await run(columns, from);
    }
    if (result.error) throw result.error;

    const rows = (result.data || []) as any[];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

export function stripHeavyPayload(row: any) {
  if (!row?.payload || typeof row.payload !== 'object') return row;
  const { photo_uri, ...rest } = row.payload;
  return { ...row, payload: rest };
}

export function resolvePhotoUrl(url: string | null, payload?: any) {
  if (!url && payload?.photo_uri && !isEmbeddedPhoto(payload.photo_uri)) {
    url = payload.photo_uri;
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

  const columnTotal = male + female + unknown;
  const total = isStatic
    ? (adultSum || columnTotal) + young
    : adultSum + subSum + juvSum || columnTotal;

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
      ? { adult: adultSum || columnTotal, sub: 0, juv: young, young }
      : { adult: adultSum || columnTotal, sub: subSum, juv: juvSum, young: 0 },
  };
}
