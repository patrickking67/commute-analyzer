import { ExternalLink } from 'lucide-react';
import type { RankedArea } from '../lib/commute';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function AreaDetail({ row }: { row: RankedArea }) {
  const { area, cost } = row;
  const facts: [string, string][] = [
    ['Rent', area.rent],
    ['Safety', area.safety],
    ['Walkability', area.walkability],
    ['Nightlife', area.nightlife],
    ['Gas per month', money.format(cost.monthly)],
    ['Gas per year', money.format(cost.annual)],
  ];

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {facts.map(([term, value]) => (
          <div key={term}>
            <dt className="text-muted">{term}</dt>
            <dd className="text-base font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm">
        <span className="text-muted">Known for </span>
        {area.amenities.join(', ').toLowerCase()}.
      </p>
      <a
        href={area.zillowUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-route underline underline-offset-2"
      >
        Homes in {area.name} on Zillow
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  );
}
