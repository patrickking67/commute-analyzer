# commute-analyzer

React + Vite + Tailwind app that compares commute times across offices and time slots, with PDF export. Client-side only, no backend.

## Commands

| Task | Command | Notes |
| --- | --- | --- |
| Install | `npm ci` | |
| Dev server | `npm run dev` | http://localhost:5173/commute-analyzer (`npm start` is the same) |
| Build | `npm run build` | Output in `dist/` |
| Preview build | `npm run preview` | Serves `dist/` locally |
| Deploy | `npm run deploy` | **Production.** Builds and pushes `dist/` to the `gh-pages` branch, live at https://patrickking67.github.io/commute-analyzer/. Only when PK asks |

No test, lint or type-check scripts. `npm run build` is the only automated check (Vite does not type-check).

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | Loads `src/main.tsx` |
| `src/main.tsx` | The live app (about 1,080 lines): office presets with hardcoded coordinates, custom office address input, time slot grid, weekday or weekend toggle, neighborhood results, PDF export |
| `src/index.css` | Tailwind directives and resets |
| `main.tsx`, `old.tsx` | Earlier versions at the repo root. Not loaded by `index.html` |
| `vite.config.ts` | `base` is `commute-analyzer` for GitHub Pages |

## Conventions

- TypeScript, function components with hooks.
- Tailwind utility classes; no CSS modules beyond `src/index.css`.
- Icons from `lucide-react`.
- Adding an office means editing the `offices` list and the `officeCoords` map in `src/main.tsx` together.

## Known limitations

- Commute times come from heuristics and traffic multipliers, not a live routing API.
- No tests.
- `npm audit` reports open advisories (20 on 2026-11-03). Upgrades need PK's OK.

## Verifying a change

1. `npm run build`
2. `npm run dev` and check the change at `/commute-analyzer` in the browser.
