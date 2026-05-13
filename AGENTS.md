# commute-analyzer

React + Vite + Tailwind app that compares commute times across offices and time slots, with PDF export.

## Build & Run

```bash
npm install          # install deps (Vite 6, React 18, Tailwind 3, lucide-react, jsPDF)
npm run dev          # vite dev server at http://localhost:5173
npm run build        # production build to dist/
npm run preview      # serve the build for local testing
npm run deploy       # publish dist/ to GitHub Pages
```

## Architecture

Single-page React app. The main component lives in `main.tsx` (~440 lines) and contains:

- Office presets (DivergeIT, The Agency, PwC, Camacho Commercial, JOEY) with hardcoded coordinates
- Custom-office text input with address suggestions
- Time slot grid (7am–6pm) and weekday vs weekend toggle
- Commute calculation (currently mocked / heuristic-based)
- Results panel with sortable alternatives and PDF export via jsPDF

`old.tsx` is preserved as a snapshot of an earlier iteration. Safe to delete once superseded permanently.

## Code Conventions

- TypeScript throughout. Function components with hooks.
- Tailwind utility classes only; no separate CSS modules beyond `index.css` for resets.
- Lucide icons (`Clock`, `Car`, `ArrowUpDown`, `MapPin`, `Loader2`).
- No backend; all logic is client-side.
- Office coordinates are hardcoded — adding a new office means editing the `officeCoords` map and `offices` list together.

## Known Limitations

- Commute times are not currently fetched from a live routing API; they're driven by heuristics. Wiring a Google Maps Directions or Mapbox call would be the obvious next step.
- No tests yet.
- 10 npm audit warnings reported by GitHub (3 high, 7 moderate) as of 2026-05. Run `npm audit` and bump packages when convenient.
