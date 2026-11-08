import { isValidCoordinate } from './geo';
import type { Place } from './types';

/**
 * Address search through the public OpenStreetMap Nominatim API. No key is
 * needed. Its usage policy allows light, user-triggered searches only (no
 * search-as-you-type), so callers should search on an explicit action.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

/** Greater Los Angeles and coastal Orange County: west, north, east, south. */
export const LA_VIEWBOX = '-118.95,34.45,-117.60,33.40';

export const MIN_QUERY_LENGTH = 3;
export const MAX_QUERY_LENGTH = 200;
const MAX_RESULTS = 5;
const TIMEOUT_MS = 10_000;

export type GeocodeErrorKind = 'too-short' | 'too-long' | 'network' | 'http' | 'bad-response';

export class GeocodeError extends Error {
  constructor(
    readonly kind: GeocodeErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'GeocodeError';
  }
}

export function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: String(MAX_RESULTS),
    countrycodes: 'us',
    viewbox: LA_VIEWBOX,
    bounded: '1',
  });
  return `${NOMINATIM_URL}?${params.toString()}`;
}

/** Turns an untrusted Nominatim response body into places, dropping bad rows. */
export function parseResults(body: unknown): Place[] {
  if (!Array.isArray(body)) {
    throw new GeocodeError('bad-response', 'The address service sent an unexpected response.');
  }
  const places: Place[] = [];
  for (const row of body) {
    if (typeof row !== 'object' || row === null) continue;
    const { display_name: name, lat, lon } = row as Record<string, unknown>;
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (typeof name !== 'string' || name.trim() === '') continue;
    if (!isValidCoordinate(latNum, lonNum)) continue;
    places.push({ name: name.trim(), lat: latNum, lon: lonNum });
  }
  return places;
}

export async function searchAddress(
  rawQuery: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Place[]> {
  const query = rawQuery.trim().replace(/\s+/g, ' ');
  if (query.length < MIN_QUERY_LENGTH) {
    throw new GeocodeError('too-short', `Enter at least ${MIN_QUERY_LENGTH} characters.`);
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw new GeocodeError('too-long', `Keep the address under ${MAX_QUERY_LENGTH} characters.`);
  }

  let response: Response;
  try {
    response = await fetchImpl(buildSearchUrl(query), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new GeocodeError(
      'network',
      'Could not reach the address service. Check your connection, or pick a listed destination.',
    );
  }
  if (!response.ok) {
    throw new GeocodeError(
      'http',
      `The address service returned ${response.status}. Try again in a minute, or pick a listed destination.`,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new GeocodeError('bad-response', 'The address service sent an unexpected response.');
  }
  return parseResults(body);
}
