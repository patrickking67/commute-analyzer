# AGENTS.md

LA Commute Analyzer: a client-side React app that ranks 15 Los Angeles and Orange County
neighborhoods by estimated drive time to a workplace at a chosen hour. No backend, no API keys.
Live at https://patrickking67.github.io/commute-analyzer/.

## Stack

React 18, TypeScript (strict), Vite 6, Tailwind CSS 3, lucide-react icons, jsPDF (loaded on
demand), Vitest, ESLint. Node 24 locally and in CI. npm with a committed lockfile.

## Commands

| Task | Command | Notes |
| --- | --- | --- |
| Install | `npm ci` | |
| Dev server | `npm run dev` | http://localhost:4107/commute-analyzer/ (port is strict) |
| All checks | `npm run check` | Lint, typecheck, tests, build. CI runs exactly this |
| Lint | `npm run lint` | ESLint over the repo |
| Typecheck | `npm run typecheck` | `tsc` with `strict`, no emit |
| Tests | `npm run test` | Vitest, `src/**/*.test.{ts,tsx}` |
| Build | `npm run build` | Output in `dist/` |
| Preview build | `npm run preview` | Serves `dist/` at http://localhost:4107/commute-analyzer/ |
| Deploy | `npm run deploy` | **Production.** Builds and pushes `dist/` to the `gh-pages` branch. Only when the owner asks |

`.claude/launch.json` starts `npm run dev` on port 4107.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Entry page: meta, Open Graph tags, font link, loads `src/main.tsx` |
| `src/main.tsx` | Mounts `<App />` |
| `src/App.tsx` | Page layout and state: destination, hour, day, sort, selected area, PDF |
| `src/components/` | `DestinationField` (presets and address search), `RankingChart`, `DayProfile`, `AreaDetail` |
| `src/lib/commute.ts` | Estimate math: traffic by hour, speed by distance, gas cost, bands, ranking |
| `src/lib/geo.ts` | Haversine distance, coordinate validation |
| `src/lib/geocode.ts` | Nominatim address search with validation and error kinds |
| `src/lib/report.ts` | PDF export (dynamic `import('jspdf')`) and file naming |
| `src/lib/time.ts` | Hour formatting |
| `src/data/offices.ts` | Preset workplaces with approximate coordinates |
| `src/data/neighborhoods.ts` | The 15 neighborhoods with coordinates and facts |
| `public/` | Favicon, Open Graph image (`og-image.svg` is the source for `og-image.png`), `llms.txt` |
| `vite.config.ts` | `base: '/commute-analyzer/'` for GitHub Pages, dev and preview port 4107 |

## How the estimate works

`estimateCommute` in `src/lib/commute.ts`: straight-line miles, divided by a free-flow speed
that rises with distance (25 to 40 mph), times an hourly traffic multiplier (`HOURLY_TRAFFIC`,
index 0 is midnight), times 0.7 on weekends. It is a heuristic, not live traffic. Say so in
any UI or docs you touch.

## External services

- Address search calls `https://nominatim.openstreetmap.org/search` from the browser. No key.
  The usage policy forbids search-as-you-type, so only search on an explicit submit. Keep the
  OpenStreetMap credit next to the search.
- Fonts load from Google Fonts. The app still works with system fonts if that fails.
- There is no travel-time API. If you add one, never commit a key; read it from a `VITE_`
  environment variable at build time, document it in README, and keep the heuristic as the
  fallback when the key is missing or the call fails.

## Conventions

- TypeScript strict, function components and hooks. Put logic in `src/lib` as pure functions
  with tests; components stay thin.
- Tailwind utilities with the tokens in `tailwind.config.js` (`ink`, `muted`, `paper`, `line`,
  `route`, `violet`, `lane`, `bar`). Shared classes (`field`, `label`, `btn-*`) live in
  `src/index.css`.
- Accessibility floor: labelled native controls, visible focus, 44 px targets, WCAG AA
  contrast, reduced motion respected, no horizontal scroll at 375 px.
- Data lists stay public places only. Do not add personal, employer or client locations.
- Conventional Commits, one logical change per commit, each passing `npm run check`.
- Plain text in docs and UI: no em dashes, no emojis.

## Do not

- Run `npm run deploy`, change GitHub settings or Pages config, or push to `main`.
- Upgrade major dependencies without the owner's OK. `npm audit` reports advisories in
  jsPDF and build tooling that need major upgrades; they are tracked, not ignored.
- Commit `.env` files, keys or tokens.

## Definition of done

1. `npm run check` passes.
2. The change works in `npm run dev` at http://localhost:4107/commute-analyzer/, including at
   375 px width and with the keyboard.
3. Tests cover any logic you changed.
4. README, AGENTS.md and CHANGELOG `[Unreleased]` are updated if behavior or commands changed.
