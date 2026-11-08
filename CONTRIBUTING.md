# Contributing

## Setup

```bash
npm ci
npm run dev     # http://localhost:4107/commute-analyzer/
```

## Branches

Branch from `main` and name it by type: `feat/`, `fix/`, `docs/` or `chore/`, for example
`fix/weekend-multiplier`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`,
`chore:`, `ci:`, `test:`, `refactor:`. Keep one logical change per commit, and make sure each
commit passes `npm run check`.

## Checks

```bash
npm run check
```

This runs ESLint, the TypeScript typecheck, the Vitest suite and the production build. CI runs
the same command on every push and pull request.

## Pull request checklist

- [ ] `npm run check` passes
- [ ] New or changed logic in `src/lib` has tests
- [ ] Checked in the browser, including at 375 px wide and with the keyboard
- [ ] README, AGENTS.md and the `[Unreleased]` section of CHANGELOG.md are updated if needed
- [ ] No keys, tokens or personal data in code, fixtures or commits
