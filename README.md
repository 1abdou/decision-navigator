# TOPSIS Decision Navigator

An interactive web app for multi-criteria decision-making using the **TOPSIS** method (Technique for Order of Preference by Similarity to Ideal Solution). Define alternatives and criteria, fill the decision matrix (numeric or linguistic scales), set weights, and view the vector-normalized matrix, weighted matrix, ideal solutions, separation distances, and final ranking. Export results to a styled Excel workbook.

## Features

- **Step-by-step wizard**: Setup → Matrix → Weights → Normalized → Weighted → Ideal → Separation → Ranking
- **Benefit/cost criteria** with optional linguistic scales per criterion
- **Direct or rank-based** weight assignment
- **Excel export** (.xlsx) with multiple sheets and basic styling (bold headers, auto-fit columns, score format, top-rank highlight)

## Tech stack

- **Frontend**: React 18, TypeScript, Vite 5
- **UI**: Tailwind CSS, shadcn/ui (Radix), Lucide icons, Recharts
- **Other**: React Router, React Hook Form + Zod, xlsx-js-style for Excel export
- **Testing**: Vitest, Testing Library

## Prerequisites

- [Node.js](https://nodejs.org/) and npm (or [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) for installation)

## Getting started

```sh
git clone <repo-url>
cd decision-navigator
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Available scripts

| Script               | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start Vite dev server with HMR   |
| `npm run build`      | Production build to `dist/`      |
| `npm run preview`    | Preview production build locally |
| `npm run lint`       | Run ESLint                       |
| `npm run test`       | Run Vitest once                  |
| `npm run test:watch` | Run Vitest in watch mode         |

## Project structure

- **`src/pages/`** — `Index.tsx` (main TOPSIS stepper and state), `NotFound.tsx`
- **`src/components/topsis/`** — Step components (Step1Setup through Step8Ranking)
- **`src/lib/`** — `topsis.ts` (TOPSIS math), `topsisTypes.ts` (types), `exportExcel.ts` (Excel export)
- **`src/components/ui/`** — shadcn components
- **`public/`** — Static assets (e.g. favicon)

## TOPSIS workflow

1. **Setup**: Enter the number and names of alternatives and criteria; mark each criterion as benefit or cost and optionally attach a linguistic scale (label → value).
2. **Matrix**: Fill the decision matrix (numeric values or linguistic labels where a scale is defined).
3. **Weights**: Assign criterion weights (direct values or by ranking; weights are normalized).
4. **Computation**: The app computes vector normalization (and column norms), the weighted normalized matrix, ideal best and worst (V+, V−) per criterion, separation distances (S+, S−) per alternative, and the TOPSIS score and rank.
5. **Export**: Download a multi-sheet .xlsx with Input (alternatives, criteria, types, weights, linguistic scales, raw matrix), Normalized Matrix, Weighted Matrix, Ideal Solutions, Separation Distances, and Final Ranking.

## Deployment

Run `npm run build` and deploy the generated `dist/` folder to any static host (e.g. Vercel, Netlify, GitHub Pages).
