// ============================================================
// Excel Export using SheetJS
// Creates a multi-sheet .xlsx with bold headers & auto-fit
// ============================================================
import * as XLSX from 'xlsx';

interface ExportData {
  alternatives: string[];
  criteria: { name: string; type: string }[];
  weights: number[];
  rawMatrix: number[][];
  normalizedMatrix: number[][];
  norms: number[];
  weightedMatrix: number[][];
  idealBest: number[];
  idealWorst: number[];
  sPlus: number[];
  sMinus: number[];
  scores: number[];
  ranks: number[];
}

function autoFit(ws: XLSX.WorkSheet, data: (string | number)[][]) {
  const colWidths = data[0].map((_, j) =>
    Math.max(...data.map(row => String(row[j] ?? '').length)) + 2
  );
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
}

export function exportToExcel(d: ExportData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Input
  const inputData: (string | number)[][] = [
    ['Alternative', ...d.criteria.map(c => `${c.name} (${c.type})`)],
    ...d.alternatives.map((alt, i) => [alt, ...d.rawMatrix[i]]),
    [],
    ['Weights', ...d.weights.map(w => +w.toFixed(4))],
  ];
  const wsInput = XLSX.utils.aoa_to_sheet(inputData);
  autoFit(wsInput, inputData);
  XLSX.utils.book_append_sheet(wb, wsInput, 'Input');

  // Sheet 2: Normalized Matrix
  const normData: (string | number)[][] = [
    ['Alternative', ...d.criteria.map(c => c.name)],
    ...d.alternatives.map((alt, i) => [alt, ...d.normalizedMatrix[i].map(v => +v.toFixed(4))]),
    [],
    ['Column Norms', ...d.norms.map(n => +n.toFixed(4))],
  ];
  const wsNorm = XLSX.utils.aoa_to_sheet(normData);
  autoFit(wsNorm, normData);
  XLSX.utils.book_append_sheet(wb, wsNorm, 'Normalized Matrix');

  // Sheet 3: Weighted Matrix
  const wData: (string | number)[][] = [
    ['Alternative', ...d.criteria.map(c => c.name)],
    ...d.alternatives.map((alt, i) => [alt, ...d.weightedMatrix[i].map(v => +v.toFixed(4))]),
  ];
  const wsW = XLSX.utils.aoa_to_sheet(wData);
  autoFit(wsW, wData);
  XLSX.utils.book_append_sheet(wb, wsW, 'Weighted Matrix');

  // Sheet 4: Ideal Solutions
  const idealData: (string | number)[][] = [
    ['Criterion', 'Type', 'V+', 'V-'],
    ...d.criteria.map((c, j) => [c.name, c.type, +d.idealBest[j].toFixed(4), +d.idealWorst[j].toFixed(4)]),
  ];
  const wsIdeal = XLSX.utils.aoa_to_sheet(idealData);
  autoFit(wsIdeal, idealData);
  XLSX.utils.book_append_sheet(wb, wsIdeal, 'Ideal Solutions');

  // Sheet 5: Separation Distances
  const sepData: (string | number)[][] = [
    ['Alternative', 'S+', 'S-'],
    ...d.alternatives.map((alt, i) => [alt, +d.sPlus[i].toFixed(4), +d.sMinus[i].toFixed(4)]),
  ];
  const wsSep = XLSX.utils.aoa_to_sheet(sepData);
  autoFit(wsSep, sepData);
  XLSX.utils.book_append_sheet(wb, wsSep, 'Separation Distances');

  // Sheet 6: Final Ranking
  const rankData: (string | number)[][] = [
    ['Rank', 'Alternative', 'S+', 'S-', 'Score'],
    ...d.alternatives
      .map((alt, i) => ({
        rank: d.ranks[i],
        alt,
        sp: +d.sPlus[i].toFixed(4),
        sm: +d.sMinus[i].toFixed(4),
        score: +d.scores[i].toFixed(4),
      }))
      .sort((a, b) => a.rank - b.rank)
      .map(r => [r.rank, r.alt, r.sp, r.sm, r.score]),
  ];
  const wsRank = XLSX.utils.aoa_to_sheet(rankData);
  autoFit(wsRank, rankData);
  XLSX.utils.book_append_sheet(wb, wsRank, 'Final Ranking');

  XLSX.writeFile(wb, 'TOPSIS_Results.xlsx');
}
