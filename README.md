<h1 align="center">commute-analyzer</h1>

<p align="center">
  <strong>Compare commute times across offices and time slots.</strong><br>
  React + Vite + Tailwind, deploys to GitHub Pages.
</p>

<p align="center">
  <a href="https://patrickking67.github.io/commute-analyzer/"><img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-3b82f6?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge" alt="License"></a>
</p>

---

## What it does

Pick a home, pick an office, and pick a time. See the projected commute time per slot across an entire day with PDF export and ranked alternatives. Built for evaluating offices and remote-work tradeoffs.

## Quick Start

```bash
git clone https://github.com/patrickking67/commute-analyzer.git
cd commute-analyzer
npm install
npm run dev      # vite dev server at http://localhost:5173
```

## Deploy

```bash
npm run deploy   # vite build && gh-pages -d dist
```

Output is published to GitHub Pages at https://patrickking67.github.io/commute-analyzer/.

## Tech Stack

- **React 18** + **TypeScript** UI in `main.tsx`
- **Vite 6** dev server and build
- **Tailwind CSS 3** styling
- **lucide-react** icons
- **jsPDF** for "export commute report" output
- **gh-pages** for deploy

## License

MIT — see [LICENSE](LICENSE).
