import { commuteBand, type RankedArea } from '../lib/commute';

type Props = {
  ranked: RankedArea[];
  selected: string;
  onSelect: (name: string) => void;
};

/** One row per neighborhood; bar length is drive time against the longest. */
export function RankingChart({ ranked, selected, onSelect }: Props) {
  const longest = Math.max(1, ...ranked.map((row) => row.minutes));

  return (
    <ol className="divide-y divide-line" aria-label="Neighborhoods ranked by drive time">
      {ranked.map((row, index) => {
        const isSelected = row.area.name === selected;
        const width = Math.max(2, (row.minutes / longest) * 100);
        return (
          <li key={row.area.name}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(row.area.name)}
              className={`grid w-full grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 gap-y-1 px-2 py-2.5 text-left hover:bg-white ${
                isSelected ? 'bg-white shadow-[inset_4px_0_0_#5B21B6]' : ''
              }`}
            >
              <span className="text-sm text-muted" aria-hidden="true">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{row.area.name}</span>
                <span className="block text-sm text-muted">
                  {commuteBand(row.minutes).label}, {row.miles} mi
                </span>
              </span>
              <span className="text-right text-lg font-bold">
                {row.minutes}
                <span className="ml-0.5 text-sm font-semibold text-muted">min</span>
              </span>
              <span className="col-start-2 col-end-4 h-2 rounded-full bg-line" aria-hidden="true">
                <span
                  className={`block h-2 rounded-full transition-[width] duration-500 ease-out ${
                    isSelected ? 'bg-violet' : 'bg-route'
                  }`}
                  style={{ width: `${width}%` }}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
