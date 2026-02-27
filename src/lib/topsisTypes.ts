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
  weightMethod: 'direct' | 'rank';

  // Step 2
  matrixInputs: string[][];  // raw string inputs (or linguistic labels)
  rawMatrix: number[][];     // numeric matrix

  // Step 3
  directWeights: number[];
  ranks: number[];           // for rank-based
  weights: number[];         // final computed weights

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
