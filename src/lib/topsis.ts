// ============================================================
// TOPSIS Math Helpers
// All computations follow vector normalization methodology
// ============================================================

export interface CriterionConfig {
  name: string;
  type: 'benefit' | 'cost';
  hasLinguisticScale: boolean;
  linguisticScale: { label: string; value: number }[];
  isPercentage?: boolean;
}

// ---- Step 4: Vector Normalization ----
// r_ij = x_ij / sqrt(Σ x_ij²)
export function normalize(matrix: number[][]): { normalized: number[][]; norms: number[] } {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;
  const norms: number[] = [];

  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < m; i++) sumSq += matrix[i][j] ** 2;
    norms.push(Math.sqrt(sumSq));
  }

  const normalized = matrix.map(row =>
    row.map((val, j) => (norms[j] === 0 ? 0 : val / norms[j]))
  );

  return { normalized, norms };
}

// ---- Step 5: Weighted Normalization ----
// v_ij = w_j × r_ij
export function applyWeights(normalized: number[][], weights: number[]): number[][] {
  return normalized.map(row => row.map((val, j) => val * weights[j]));
}

// ---- Step 6: Ideal Best (V+) and Ideal Worst (V-) ----
export function idealSolutions(
  weighted: number[][],
  types: ('benefit' | 'cost')[]
): { idealBest: number[]; idealWorst: number[] } {
  const n = types.length;
  const idealBest: number[] = [];
  const idealWorst: number[] = [];

  for (let j = 0; j < n; j++) {
    const col = weighted.map(row => row[j]);
    if (types[j] === 'benefit') {
      idealBest.push(Math.max(...col));
      idealWorst.push(Math.min(...col));
    } else {
      idealBest.push(Math.min(...col));
      idealWorst.push(Math.max(...col));
    }
  }

  return { idealBest, idealWorst };
}

// ---- Step 7: Separation Distances (Euclidean) ----
export function separationDistances(
  weighted: number[][],
  idealBest: number[],
  idealWorst: number[]
): { sPlus: number[]; sMinus: number[] } {
  const sPlus = weighted.map(row => {
    const sumSq = row.reduce((acc, v, j) => acc + (v - idealBest[j]) ** 2, 0);
    return Math.sqrt(sumSq);
  });

  const sMinus = weighted.map(row => {
    const sumSq = row.reduce((acc, v, j) => acc + (v - idealWorst[j]) ** 2, 0);
    return Math.sqrt(sumSq);
  });

  return { sPlus, sMinus };
}

// ---- Step 8: TOPSIS Score & Ranking ----
// C_i = S-_i / (S+_i + S-_i)
export function topsisScore(sPlus: number[], sMinus: number[]): number[] {
  return sPlus.map((sp, i) => {
    const denom = sp + sMinus[i];
    return denom === 0 ? 0 : sMinus[i] / denom;
  });
}

export function rankDescending(scores: number[]): number[] {
  const indexed = scores.map((s, i) => ({ s, i }));
  indexed.sort((a, b) => b.s - a.s);
  const ranks = new Array(scores.length);
  indexed.forEach((item, rank) => {
    ranks[item.i] = rank + 1;
  });
  return ranks;
}

// ---- Weight helpers ----
export function rankSumWeights(ranks: number[]): number[] {
  const n = ranks.length;
  const raw = ranks.map(r => n - r + 1);
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map(w => w / sum);
}

export function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 1 / weights.length);
  return weights.map(w => w / sum);
}

// ---- Validation helpers ----
export function validateMatrix(matrix: number[][]): string | null {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (isNaN(matrix[i][j])) return `Cell [${i + 1}, ${j + 1}] is not a valid number`;
    }
  }
  return null;
}

export function checkZeroColumns(matrix: number[][]): number[] {
  const zeroCols: number[] = [];
  const n = matrix[0]?.length ?? 0;
  for (let j = 0; j < n; j++) {
    const allZero = matrix.every(row => row[j] === 0);
    if (allZero) zeroCols.push(j);
  }
  return zeroCols;
}
