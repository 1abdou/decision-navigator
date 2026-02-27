

# TOPSIS Decision-Making Tool

## Overview
A step-by-step interactive web app implementing the TOPSIS multi-criteria decision-making method, guiding users through defining alternatives, building a decision matrix, assigning weights, and viewing computed results with rich visualizations and Excel export.

## Design & Theme
- **Primary color**: Deep indigo (#4F46E5)
- Clean white cards on subtle gray backgrounds
- Stepper sidebar showing progress through all 8 steps with checkmarks for completed steps
- Fully responsive for desktop and tablet
- Lucide icons throughout

## Step-by-Step Features

### Step 1 — Setup: Alternatives & Criteria
- Inputs for number of alternatives (2–10) and criteria (2–8)
- Name each alternative and criterion
- Per criterion: Benefit/Cost toggle (pill style), weight method selector (Direct vs Rank-based), optional linguistic scale with custom label→value pairs

### Step 2 — Decision Matrix Input
- Dynamic table (rows = alternatives, cols = criteria)
- Dropdown selects for linguistic-scale criteria, numeric inputs otherwise
- Live numeric preview table with linguistic labels converted to values
- Validation: no empty cells, valid numbers

### Step 3 — Assign Weights
- **Direct mode**: weight inputs per criterion with live sum indicator and auto-normalize button
- **Rank-based mode**: up/down arrow ranking with auto-computed weights via Rank Sum formula
- Display computed weights beside each criterion

### Step 4 — Normalized Matrix
- Color-coded table (blue gradient by value intensity)
- Column norms displayed below
- Grouped bar chart (Recharts) comparing normalized values across alternatives

### Step 5 — Weighted Normalized Matrix
- Color-coded table (green gradient)
- Stacked bar chart showing each alternative's weighted criteria contributions

### Step 6 — Ideal Best (V⁺) & Ideal Worst (V⁻)
- Table: Criterion | Type | V⁺ | V⁻ with green/red row highlighting
- Radar/Spider chart overlaying V⁺ and V⁻ profiles

### Step 7 — Separation Distances
- Table: Alternative | S⁺ | S⁻ | Closer To (color-coded green/amber)
- Scatter plot (S⁺ vs S⁻) with labeled points and diagonal reference line

### Step 8 — Final Ranking & Scores
- Podium-style cards for top 3 (gold/silver/bronze)
- Full ranking table with inline progress bars (green > 0.6, amber 0.4–0.6, red < 0.4)
- Horizontal bar chart of all scores sorted descending
- Summary insight text for best and worst alternatives
- **Export to Excel** button

## Excel Export (SheetJS)
Exports a multi-sheet .xlsx file with: Input data, Normalized Matrix, Weighted Matrix, Ideal Solutions, Separation Distances, and Final Ranking — with bold headers, auto-fit columns, formatted scores, and highlighted top rank.

## Validation & Error Handling
- Inline red error messages per field (no alerts)
- Cannot advance past a step with invalid inputs
- Guards against division by zero in normalization and score calculation

## Math Implementation
All TOPSIS computations follow vector normalization, weighted normalization, ideal best/worst, Euclidean separation distances, and score calculation (C_i = S⁻ / (S⁺ + S⁻)), ranked descending.

