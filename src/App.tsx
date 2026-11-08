import { useId, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, Download, Loader2 } from 'lucide-react';
import { AreaDetail } from './components/AreaDetail';
import { DayProfile } from './components/DayProfile';
import { DestinationField } from './components/DestinationField';
import { RankingChart } from './components/RankingChart';
import { NEIGHBORHOODS } from './data/neighborhoods';
import { dayProfile, rankNeighborhoods, type SortOrder } from './lib/commute';
import { downloadReport } from './lib/report';
import { HOURS, formatHour } from './lib/time';
import type { DayType, Hour, Place } from './lib/types';

const DEFAULT_HOUR: Hour = 8;

/** "200 N Spring St, Los Angeles, ..." -> "200 N Spring St" */
const shortName = (place: Place) => place.name.split(',')[0].trim();

export function App() {
  const id = useId();
  const [choice, setChoice] = useState('');
  const [destination, setDestination] = useState<Place | null>(null);
  const [hour, setHour] = useState<Hour>(DEFAULT_HOUR);
  const [day, setDay] = useState<DayType>('weekday');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [picked, setPicked] = useState<string | null>(null);
  const [reportName, setReportName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const detailHeading = useRef<HTMLHeadingElement>(null);

  const ranked = useMemo(
    () => (destination ? rankNeighborhoods(NEIGHBORHOODS, destination, hour, day, order) : []),
    [destination, hour, day, order],
  );
  const fastest = order === 'asc' ? ranked[0] : ranked[ranked.length - 1];
  const selected = ranked.find((row) => row.area.name === picked) ?? fastest;
  const profile = useMemo(
    () => (destination && selected ? dayProfile(selected.area, destination, day) : []),
    [destination, selected, day],
  );

  const changeDestination = (place: Place | null) => {
    setDestination(place);
    setPicked(null);
  };

  // On narrow screens the detail panel sits below the list, so bring it into view.
  const pickArea = (name: string) => {
    setPicked(name);
    if (!window.matchMedia('(max-width: 1023px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    detailHeading.current?.focus({ preventScroll: true });
    detailHeading.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const reset = () => {
    setChoice('');
    setDestination(null);
    setHour(DEFAULT_HOUR);
    setDay('weekday');
    setOrder('asc');
    setPicked(null);
    setReportName('');
    setSaveError('');
  };

  const save = async () => {
    if (!destination) return;
    setSaving(true);
    setSaveError('');
    try {
      await downloadReport({
        destination: destination.name,
        hour,
        day,
        ranked: rankNeighborhoods(NEIGHBORHOODS, destination, hour, day, 'asc'),
        name: reportName.trim() || undefined,
      });
    } catch {
      setSaveError('The PDF could not be created. Reload the page and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <a
        href="#results"
        className="sr-only-focusable absolute left-4 top-4 z-50 rounded-md bg-white px-4 py-2 font-semibold"
      >
        Skip to results
      </a>

      <header className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="inline-block max-w-full rounded-xl bg-route p-1.5 shadow-sm">
          <div className="rounded-lg border-2 border-white px-4 py-3 text-white sm:px-6 sm:py-4">
            <h1 className="text-3xl font-extrabold leading-none tracking-tight sm:text-5xl">
              LA Commute Analyzer
            </h1>
            <p className="mt-2 text-base font-semibold sm:text-lg">
              Where to live for the drive to work
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-prose text-muted">
          Pick where you work and when you leave. Fifteen Los Angeles and Orange County
          neighborhoods are ranked by estimated drive time, with gas cost and a few facts about
          each.
        </p>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <section aria-labelledby={`${id}-trip`} className="mt-8 border-y border-line py-6">
          <h2 id={`${id}-trip`} className="sr-only">
            Your trip
          </h2>
          <div className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <DestinationField
              choice={choice}
              onChoiceChange={setChoice}
              destination={destination}
              onDestinationChange={changeDestination}
            />
            <div>
              <label className="label" htmlFor={`${id}-hour`}>
                Departure time
              </label>
              <select
                id={`${id}-hour`}
                className="field"
                value={hour}
                onChange={(event) => setHour(Number(event.target.value))}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {formatHour(h)}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">Day</legend>
              <div className="grid grid-cols-2 rounded-md border border-line bg-white p-1">
                {(['weekday', 'weekend'] as const).map((value) => (
                  <label
                    key={value}
                    className={`flex min-h-[40px] cursor-pointer items-center justify-center rounded px-3 text-base font-semibold capitalize has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-route ${
                      day === value ? 'bg-ink text-white' : 'text-ink hover:bg-paper'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${id}-day`}
                      value={value}
                      checked={day === value}
                      onChange={() => setDay(value)}
                      className="sr-only"
                    />
                    {value}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section id="results" aria-labelledby={`${id}-results`} className="mt-8" tabIndex={-1}>
          <h2 id={`${id}-results`} className="sr-only">
            Results
          </h2>

          {!destination || !selected ? (
            <p className="max-w-prose rounded-md border border-dashed border-line bg-white px-4 py-6 text-muted">
              {choice === ''
                ? 'Choose a work destination to rank the neighborhoods.'
                : 'Find and choose the address you commute to, and the ranking appears here.'}
            </p>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold">To {shortName(destination)}</h3>
                    <p className="text-sm text-muted" aria-live="polite">
                      {formatHour(hour)} on a {day}. Fastest from {fastest.area.name} at{' '}
                      {fastest.minutes} min.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-quiet text-sm"
                    onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  >
                    <ArrowDownUp className="h-4 w-4" aria-hidden="true" />
                    {order === 'asc' ? 'Shortest first' : 'Longest first'}
                  </button>
                </div>
                <RankingChart ranked={ranked} selected={selected.area.name} onSelect={pickArea} />
              </div>

              <div className="lg:sticky lg:top-6 lg:self-start">
                <section
                  aria-labelledby={`${id}-area`}
                  className="rounded-lg border border-line bg-white p-4 sm:p-5"
                >
                  <h3 id={`${id}-area`} ref={detailHeading} tabIndex={-1} className="scroll-mt-4 text-xl font-bold">
                    {selected.area.name}
                  </h3>
                  <p className="mb-4 text-sm text-muted">
                    {selected.minutes} min and {selected.miles} mi in a straight line to{' '}
                    {shortName(destination)}.
                  </p>
                  <DayProfile
                    areaName={selected.area.name}
                    minutesByHour={profile}
                    hour={hour}
                    onHourChange={setHour}
                  />
                  <div className="mt-5 border-t border-line pt-4">
                    <AreaDetail row={selected} />
                  </div>
                </section>

                <section aria-labelledby={`${id}-save`} className="mt-4 rounded-lg border border-line bg-white p-4 sm:p-5">
                  <h3 id={`${id}-save`} className="font-bold">
                    Save this ranking
                  </h3>
                  <label className="label mt-3" htmlFor={`${id}-name`}>
                    Name on the report <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input
                    id={`${id}-name`}
                    className="field"
                    type="text"
                    maxLength={60}
                    autoComplete="name"
                    value={reportName}
                    onChange={(event) => setReportName(event.target.value)}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="btn-primary" onClick={save} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Download className="h-4 w-4" aria-hidden="true" />
                      )}
                      Download PDF
                    </button>
                    <button type="button" className="btn-quiet" onClick={reset}>
                      Start over
                    </button>
                  </div>
                  {saveError && (
                    <p role="alert" className="mt-2 text-sm font-semibold text-red-800">
                      {saveError}
                    </p>
                  )}
                </section>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-6 text-sm text-muted sm:px-6">
        <p className="max-w-prose">
          Estimates use straight-line distance and typical Los Angeles traffic by hour. They are
          not live traffic or turn-by-turn routes. Workplace locations are approximate.
        </p>
        <p className="mt-2">
          <a
            className="underline"
            href="https://github.com/patrickking67/commute-analyzer"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
