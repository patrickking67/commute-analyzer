import { HOURS, formatHour, shortHour } from '../lib/time';
import type { Hour } from '../lib/types';

type Props = {
  areaName: string;
  minutesByHour: number[];
  hour: Hour;
  onHourChange: (hour: Hour) => void;
};

const AXIS_HOURS = new Set([0, 6, 12, 18]);

/** 24 bars, one per departure hour. Picking a bar changes the departure time. */
export function DayProfile({ areaName, minutesByHour, hour, onHourChange }: Props) {
  const longest = Math.max(1, ...minutesByHour);
  const fastest = Math.min(...minutesByHour);
  const fastestHour = minutesByHour.indexOf(fastest);

  return (
    <figure>
      <figcaption className="mb-3 text-sm text-muted">
        Drive time from {areaName} by departure hour. Fastest at {formatHour(fastestHour)} (
        {fastest} min). Pick a bar to change the departure time.
      </figcaption>
      <div
        role="group"
        aria-label={`Departure hours from ${areaName}`}
        className="grid h-36 grid-cols-[repeat(24,minmax(0,1fr))] items-end gap-[2px] border-b border-ink"
      >
        {HOURS.map((h) => {
          const minutes = minutesByHour[h];
          const isCurrent = h === hour;
          return (
            <button
              key={h}
              type="button"
              aria-pressed={isCurrent}
              aria-label={`${formatHour(h)}, ${minutes} minutes`}
              title={`${formatHour(h)}: ${minutes} min`}
              onClick={() => onHourChange(h)}
              className={`group relative flex h-full items-end justify-center rounded-t-sm ${
                isCurrent ? 'bg-lane/30' : 'hover:bg-line/60'
              }`}
            >
              <span
                className={`block w-full rounded-t-sm transition-[height] duration-500 ease-out ${
                  isCurrent ? 'bg-route' : 'bg-bar group-hover:bg-ink'
                }`}
                style={{ height: `${Math.max(3, (minutes / longest) * 100)}%` }}
              />
            </button>
          );
        })}
      </div>
      <div
        className="mt-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-[2px] text-[11px] text-muted"
        aria-hidden="true"
      >
        {HOURS.map((h) => (
          <span key={h} className="text-left">
            {AXIS_HOURS.has(h) ? shortHour(h) : ''}
          </span>
        ))}
      </div>
      <p className="mt-2 text-sm">
        Leaving at <strong>{formatHour(hour)}</strong>: <strong>{minutesByHour[hour]} min</strong>
      </p>
    </figure>
  );
}
