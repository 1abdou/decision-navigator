// ============================================================
// TOPSIS Types — shared across all step components
// ============================================================

export interface CriterionSetup {
  name: string;
  type: 'benefit' | 'cost';
  hasLinguisticScale: boolean;
  linguisticScale: { label: string; value: number }[];
}

export interface TopsisState {
  // Step 1
  numAlternatives: number;
  numCriteria: number;
  alternativeNames: string[];
  criteria: CriterionSetup[];

  // Step 2
  matrixInputs: string[][];  // raw string inputs (or linguistic labels)
  rawMatrix: number[][];     // numeric matrix

  // Step 3 (priority level per criterion 1..N, weights from rank-sum)
  ranks: number[];
  weights: number[];

  // Computed results (steps 4-8)
  normalizedMatrix: number[][];
  norms: number[];
  weightedMatrix: number[][];
  idealBest: number[];
  idealWorst: number[];
  sPlus: number[];
  sMinus: number[];
  scores: number[];
  finalRanks: number[];
}
