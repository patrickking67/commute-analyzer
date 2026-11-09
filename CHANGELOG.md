# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Ranked drive-time chart with a detail panel and a 24-hour profile per neighborhood.
- Address search with clear error messages when the service fails or finds nothing.
- Unit tests for the estimate math, address search, PDF report and page render.
- `npm run check` (lint, typecheck, tests, build) and a CI workflow that runs it.
- Open Graph and description meta tags, favicon and social image.
- AGENTS.md, CONTRIBUTING.md, SECURITY.md, llms.txt, issue and PR templates, Dependabot.
- `.claude/launch.json`; dev and preview servers use port 4107.

### Changed

- Results update as you change inputs instead of after a fake delay.
- Address search runs when you press Find instead of on every keystroke, per the Nominatim
  usage policy.
- jsPDF loads only when you download a PDF; the main bundle went from 527 kB to 172 kB.
- Vite `base` is now the absolute `/commute-analyzer/`.

### Fixed

- The departure time had no effect for most hours: picker values like `5:00 PM` did not match
  the traffic table keys like `5pm`, so every hour but the default used one fallback value.
- A custom address showed 0 minutes for every neighborhood because its coordinates were
  dropped.

### Removed

- Unused root `main.tsx` and `old.tsx`, an unused random alternate-route generator, share
  handler and address table.
- Four workplace presets that were not public company offices.

### Security

- jsPDF 2.5.2 to 4.2.1, which drops the vulnerable DOMPurify 2.x and canvg 3.0.10. The PDF
  export needed no code change.
- Vitest 3.2.7 to 4.1.12, which drops tinypool and ships a patched `@vitest/mocker`.
- Build tooling updated within current ranges: vite 6.4.6, rollup, esbuild, postcss and
  related packages.
- Still open: one moderate minimatch advisory (GHSA-g3hv-75wg-m249) through ESLint and
  typescript-eslint. Only minimatch 11 has the fix, and neither tool accepts it yet.

## [1.0.0] - 2026-05-13

### Changed

- Stopped tracking `node_modules/` and `dist/`, added the MIT license, fixed the homepage URL
  and added a README and agent docs.

## Earlier history (2024-12-21 to 2024-12-22, untagged)

- Commits titled "Version 1.0" to "Version 5.0" built the first app: office presets, custom
  address input, time and day pickers, neighborhood stats, gas cost and PDF export.

[Unreleased]: https://github.com/patrickking67/commute-analyzer/compare/main...improve/ship-ultimate
