// ============================================================
// Excel Export using SheetJS
// Creates a multi-sheet .xlsx with bold headers & auto-fit
// ============================================================
import * as XLSX from 'xlsx-js-style';

interface CriterionExport {
  name: string;
  type: string;
  hasLinguisticScale?: boolean;
  linguisticScale?: { label: string; value: number }[];
}

interface ExportData {
  alternatives: string[];
  criteria: CriterionExport[];
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
  if (data.length === 0) return;
  const numCols = Math.max(...data.map(row => row.length));
  const colWidths = Array.from({ length: numCols }, (_, j) =>
    Math.max(...data.map(row => String(row[j] ?? '').length)) + 2
  );
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
}

const BOLD_HEADER = { font: { bold: true } };
const LIGHT_GREEN_FILL = { patternType: 'solid' as const, fgColor: { rgb: 'FF90EE90' } };
const SCORE_NUMFMT = { numFmt: '0.0000' };

function applyBoldHeader(ws: XLSX.WorkSheet, colCount: number) {
  for (let c = 0; c < colCount; c++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[ref]) ws[ref].s = { ...(ws[ref].s as object || {}), ...BOLD_HEADER };
  }
}

export function exportToExcel(d: ExportData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Input — alternatives, criteria, types, weights, linguistic scales, raw matrix
  const inputData: (string | number)[][] = [
    ['Alternative', ...d.criteria.map(c => `${c.name} (${c.type})`)],
    ...d.alternatives.map((alt, i) => [alt, ...d.rawMatrix[i]]),
    [],
    ['Weights', ...d.weights.map(w => +w.toFixed(4))],
  ];
  const hasAnyLinguistic = d.criteria.some(c => c.hasLinguisticScale && c.linguisticScale?.length);
  if (hasAnyLinguistic) {
    inputData.push([]);
    inputData.push(['Linguistic scales']);
    inputData.push(['Criterion', 'Label', 'Value']);
    for (const c of d.criteria) {
      if (c.hasLinguisticScale && c.linguisticScale?.length) {
        for (const s of c.linguisticScale) {
          inputData.push([c.name, s.label, s.value]);
        }
      }
    }
  }
  const wsInput = XLSX.utils.aoa_to_sheet(inputData);
  autoFit(wsInput, inputData);
  applyBoldHeader(wsInput, inputData[0]?.length ?? 0);
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
  applyBoldHeader(wsNorm, normData[0]?.length ?? 0);
  XLSX.utils.book_append_sheet(wb, wsNorm, 'Normalized Matrix');

  // Sheet 3: Weighted Matrix
  const wData: (string | number)[][] = [
    ['Alternative', ...d.criteria.map(c => c.name)],
    ...d.alternatives.map((alt, i) => [alt, ...d.weightedMatrix[i].map(v => +v.toFixed(4))]),
  ];
  const wsW = XLSX.utils.aoa_to_sheet(wData);
  autoFit(wsW, wData);
  applyBoldHeader(wsW, wData[0]?.length ?? 0);
  XLSX.utils.book_append_sheet(wb, wsW, 'Weighted Matrix');

  // Sheet 4: Ideal Solutions
  const idealData: (string | number)[][] = [
    ['Criterion', 'Type', 'V+', 'V-'],
    ...d.criteria.map((c, j) => [c.name, c.type, +d.idealBest[j].toFixed(4), +d.idealWorst[j].toFixed(4)]),
  ];
  const wsIdeal = XLSX.utils.aoa_to_sheet(idealData);
  autoFit(wsIdeal, idealData);
  applyBoldHeader(wsIdeal, idealData[0]?.length ?? 0);
  XLSX.utils.book_append_sheet(wb, wsIdeal, 'Ideal Solutions');

  // Sheet 5: Separation Distances
  const sepData: (string | number)[][] = [
    ['Alternative', 'S+', 'S-'],
    ...d.alternatives.map((alt, i) => [alt, +d.sPlus[i].toFixed(4), +d.sMinus[i].toFixed(4)]),
  ];
  const wsSep = XLSX.utils.aoa_to_sheet(sepData);
  autoFit(wsSep, sepData);
  applyBoldHeader(wsSep, sepData[0]?.length ?? 0);
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
  applyBoldHeader(wsRank, rankData[0]?.length ?? 0);
  // Score column (5th column, index 4) — 4 decimal places
  const scoreColIndex = 4;
  for (let r = 1; r < rankData.length; r++) {
    const ref = XLSX.utils.encode_cell({ r, c: scoreColIndex });
    if (wsRank[ref]) wsRank[ref].s = { ...(wsRank[ref].s as object || {}), ...SCORE_NUMFMT };
  }
  // Top-ranked row (row 1) — light green highlight
  for (let c = 0; c < (rankData[0]?.length ?? 0); c++) {
    const ref = XLSX.utils.encode_cell({ r: 1, c });
    if (wsRank[ref]) wsRank[ref].s = { ...(wsRank[ref].s as object || {}), fill: LIGHT_GREEN_FILL };
  }
  XLSX.utils.book_append_sheet(wb, wsRank, 'Final Ranking');

  XLSX.writeFile(wb, 'TOPSIS_Results.xlsx');
}
