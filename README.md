# TOPSIS Decision Navigator

An interactive web app for multi-criteria decision-making using the **TOPSIS** method (Technique for Order of Preference by Similarity to Ideal Solution). Define alternatives and criteria, fill the decision matrix (numeric or linguistic scales), set weights by priority level, and view the final ranking. Normalization, weighted matrix, ideal solutions, and separation distances are computed under the hood.

## Features

- **Step-by-step wizard**: Setup → Matrix → Weights → Ranking (4 steps)
- **Benefit/cost criteria** with optional linguistic scales per criterion
- **Priority-level weights**: assign criteria to levels 1..N; weights sum to 1 (rank-sum method)
- **Ranking results**: podium, full table, bar chart, and best/worst summary

## Tech stack

- **Frontend**: React 18, TypeScript, Vite 5
- **UI**: Tailwind CSS, shadcn/ui (Radix), Lucide icons, Recharts
- **Other**: React Router, React Hook Form + Zod
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
- **`src/lib/`** — `topsis.ts` (TOPSIS math), `topsisTypes.ts` (types)
- **`src/components/ui/`** — shadcn components
- **`public/`** — Static assets (e.g. favicon)

## TOPSIS workflow

1. **Setup**: Enter the number and names of alternatives and criteria; mark each criterion as benefit or cost and optionally attach a linguistic scale (label → value).
2. **Matrix**: Fill the decision matrix (numeric values or linguistic labels where a scale is defined).
3. **Weights**: Assign each criterion to a priority level (1 = highest, N = lowest); criteria in the same level share equal weight; weights are normalized to sum to 1.
4. **Ranking**: Click "Calculate & Next" to run TOPSIS (normalization, weighted matrix, ideal solutions, separation distances) and see the final ranking with podium, table, and chart.

## Deployment

Run `npm run build` and deploy the generated `dist/` folder to any static host (e.g. Vercel, Netlify, GitHub Pages).
