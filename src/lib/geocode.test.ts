import { describe, expect, it, vi } from 'vitest';
import { GeocodeError, LA_VIEWBOX, buildSearchUrl, parseResults, searchAddress } from './geocode';

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

describe('buildSearchUrl', () => {
  it('encodes the query and bounds the search to the region', () => {
    const url = new URL(buildSearchUrl('100 Main St & 2nd'));
    expect(url.origin + url.pathname).toBe('https://nominatim.openstreetmap.org/search');
    expect(url.searchParams.get('q')).toBe('100 Main St & 2nd');
    expect(url.searchParams.get('viewbox')).toBe(LA_VIEWBOX);
    expect(url.searchParams.get('bounded')).toBe('1');
    expect(url.searchParams.get('format')).toBe('jsonv2');
  });
});

describe('parseResults', () => {
  it('keeps valid rows and converts coordinates to numbers', () => {
    expect(
      parseResults([{ display_name: ' Example Plaza ', lat: '34.05', lon: '-118.25' }]),
    ).toEqual([{ name: 'Example Plaza', lat: 34.05, lon: -118.25 }]);
  });

  it('drops rows with missing names or bad coordinates', () => {
    expect(
      parseResults([
        null,
        'text',
        { display_name: '', lat: '34', lon: '-118' },
        { display_name: 'No coords' },
        { display_name: 'Bad lat', lat: '999', lon: '-118' },
        { display_name: 'Not a number', lat: 'abc', lon: '-118' },
      ]),
    ).toEqual([]);
  });

  it('rejects a body that is not a list', () => {
    expect(() => parseResults({ error: 'nope' })).toThrow(GeocodeError);
  });
});

describe('searchAddress', () => {
  it('validates the query before calling the network', async () => {
    const fetchImpl = vi.fn();
    await expect(searchAddress('  a ', fetchImpl)).rejects.toMatchObject({ kind: 'too-short' });
    await expect(searchAddress('x'.repeat(201), fetchImpl)).rejects.toMatchObject({
      kind: 'too-long',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('normalizes whitespace and returns parsed places', async () => {
    const fetchImpl = vi.fn(async () =>
      okResponse([{ display_name: 'Example Plaza', lat: '34.05', lon: '-118.25' }]),
    );
    const places = await searchAddress('  Example   Plaza ', fetchImpl);
    expect(places).toEqual([{ name: 'Example Plaza', lat: 34.05, lon: -118.25 }]);
    const [url] = fetchImpl.mock.calls[0] as unknown as [string];
    expect(new URL(url).searchParams.get('q')).toBe('Example Plaza');
  });

  it('reports network failures', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(searchAddress('Example Plaza', fetchImpl)).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('reports HTTP errors with the status', async () => {
    const fetchImpl = vi.fn(
      async () => ({ ok: false, status: 429, json: async () => [] }) as unknown as Response,
    );
    await expect(searchAddress('Example Plaza', fetchImpl)).rejects.toMatchObject({
      kind: 'http',
      message: expect.stringContaining('429'),
    });
  });

  it('reports a body that is not JSON', async () => {
    const fetchImpl = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('bad json');
          },
        }) as unknown as Response,
    );
    await expect(searchAddress('Example Plaza', fetchImpl)).rejects.toMatchObject({
      kind: 'bad-response',
    });
  });
});
