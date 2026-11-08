# LA Commute Analyzer

Rank Los Angeles neighborhoods by estimated drive time to where you work, at any hour.

[![CI](https://github.com/patrickking67/commute-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/patrickking67/commute-analyzer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Live: https://patrickking67.github.io/commute-analyzer/

## Features

- Pick a workplace from a list of well-known LA employers, or search any address.
- See 15 LA and Orange County neighborhoods ranked by drive time, with distance and a length
  band (quick to over an hour).
- A 24-hour profile for the selected neighborhood shows the best time to leave. Picking a bar
  changes the departure time.
- Weekday or weekend traffic.
- Monthly and yearly gas cost, plus rent, safety, walkability and nightlife ratings.
- Download the ranking as a PDF.
- Works on a phone, with a keyboard and with reduced motion.

Estimates are a heuristic: straight-line distance, a speed that rises with trip length, and a
typical traffic multiplier for each hour. They are not live traffic.

## Quickstart

Needs Node 20.19 or later (CI uses Node 24).

```bash
git clone git@github.com:patrickking67/commute-analyzer.git
cd commute-analyzer
npm ci
npm run dev
```

Open http://localhost:4107/commute-analyzer/.

## Checks

```bash
npm run check   # lint, typecheck, tests, build (the same command CI runs)
npm run test    # tests only
```

## How it works

Everything runs in the browser; there is no backend and no API key.

- `src/lib/commute.ts` holds the estimate math and ranking. It is pure and unit tested.
- `src/lib/geocode.ts` searches addresses with the public
  [OpenStreetMap Nominatim](https://nominatim.org/) API when you press Find. If the service is
  down, the app says so and the preset workplaces still work.
- `src/data/` holds the workplace and neighborhood coordinates. Workplace locations are
  approximate.
- `src/lib/report.ts` builds the PDF with jsPDF, loaded only when you ask for one.

See [AGENTS.md](AGENTS.md) for the full layout.

## Deploy

GitHub Pages serves the `gh-pages` branch. `npm run deploy` builds with the
`/commute-analyzer/` base path and publishes `dist/` to that branch.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
