import { useId, useState, type FormEvent } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { OFFICES } from '../data/offices';
import { GeocodeError, searchAddress } from '../lib/geocode';
import type { Place } from '../lib/types';

export const CUSTOM = '__custom__';

type Props = {
  choice: string;
  onChoiceChange: (choice: string) => void;
  destination: Place | null;
  onDestinationChange: (place: Place | null) => void;
  search?: (query: string) => Promise<Place[]>;
};

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: Place[] }
  | { status: 'error'; message: string };

export function DestinationField({
  choice,
  onChoiceChange,
  destination,
  onDestinationChange,
  search = searchAddress,
}: Props) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  const handleSelect = (value: string) => {
    onChoiceChange(value);
    setState({ status: 'idle' });
    if (value === CUSTOM || value === '') {
      onDestinationChange(null);
      return;
    }
    onDestinationChange(OFFICES.find((office) => office.name === value) ?? null);
  };

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault();
    setState({ status: 'loading' });
    onDestinationChange(null);
    try {
      const results = await search(query);
      setState({ status: 'done', results });
      if (results.length === 1) onDestinationChange(results[0]);
    } catch (error) {
      const message =
        error instanceof GeocodeError ? error.message : 'Address search failed. Try again.';
      setState({ status: 'error', message });
    }
  };

  return (
    <div>
      <label className="label" htmlFor={`${id}-select`}>
        Work destination
      </label>
      <select
        id={`${id}-select`}
        className="field"
        value={choice}
        onChange={(event) => handleSelect(event.target.value)}
      >
        <option value="">Choose a workplace</option>
        <optgroup label="Workplaces">
          {OFFICES.map((office) => (
            <option key={office.name} value={office.name}>
              {office.name}
            </option>
          ))}
        </optgroup>
        <option value={CUSTOM}>Another address</option>
      </select>

      {choice === CUSTOM && (
        <form className="mt-3" onSubmit={handleSearch} role="search" aria-label="Address search">
          <label className="label" htmlFor={`${id}-query`}>
            Street address or place
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-query`}
              className="field min-w-0 flex-1"
              type="text"
              autoComplete="street-address"
              maxLength={200}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. 200 N Spring St"
              aria-describedby={`${id}-status`}
            />
            <button type="submit" className="btn-quiet shrink-0" disabled={state.status === 'loading'}>
              {state.status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              Find
            </button>
          </div>

          <div id={`${id}-status`} aria-live="polite" className="mt-2 text-sm">
            {state.status === 'loading' && <p className="text-muted">Searching…</p>}
            {state.status === 'error' && (
              <p role="alert" className="font-semibold text-red-800">
                {state.message}
              </p>
            )}
            {state.status === 'done' && state.results.length === 0 && (
              <p className="text-muted">
                No matches in the Los Angeles area. Add a city or ZIP code, or pick a listed
                workplace.
              </p>
            )}
            {state.status === 'done' && state.results.length > 1 && (
              <p className="text-muted">{state.results.length} matches. Choose one.</p>
            )}
          </div>

          {state.status === 'done' && state.results.length > 0 && (
            <fieldset className="mt-1">
              <legend className="sr-only">Matching addresses</legend>
              <ul className="divide-y divide-line rounded-md border border-line bg-white">
                {state.results.map((place) => {
                  const checked =
                    destination?.lat === place.lat &&
                    destination?.lon === place.lon &&
                    destination?.name === place.name;
                  return (
                    <li key={`${place.lat},${place.lon},${place.name}`}>
                      <label className="flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm hover:bg-paper">
                        <input
                          type="radio"
                          name={`${id}-match`}
                          className="mt-1 accent-route"
                          checked={checked}
                          onChange={() => onDestinationChange(place)}
                        />
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        <span>{place.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          )}
          <p className="mt-2 text-xs text-muted">
            Address search by{' '}
            <a
              className="underline"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}
