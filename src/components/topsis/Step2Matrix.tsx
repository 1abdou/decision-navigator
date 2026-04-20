// ============================================================
// Step 2 — Decision Matrix Input
// ============================================================
import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, ChevronDown, Trash2 } from 'lucide-react';
import type { CriterionSetup } from '@/lib/topsisTypes';
import { checkZeroColumns } from '@/lib/topsis';
import { Badge } from '@/components/ui/badge';

interface Props {
  alternatives: string[];
  criteria: CriterionSetup[];
  matrixInputs: string[][];
  onUpdateCell: (i: number, j: number, val: string) => void;
  onUpdateMatrix?: (matrix: string[][]) => void;
  rawMatrix: number[][];
  errors: Record<string, string>;
}

export default function Step2Matrix({ alternatives, criteria, matrixInputs, onUpdateCell, onUpdateMatrix, rawMatrix, errors }: Props) {
  const m = alternatives.length;
  const n = criteria.length;
  const totalCells = m * n;

  // Stats
  const { filledCount, invalidCount, zeroCols, criteriaStats } = useMemo(() => {
    let filled = 0;
    let invalid = 0;
    const stats = criteria.map((c, j) => {
      let min = Infinity;
      let max = -Infinity;
      let count = 0;
      for (let i = 0; i < m; i++) {
        const val = matrixInputs[i]?.[j];
        if (val !== undefined && val !== '') filled++;
        const raw = rawMatrix[i]?.[j];
        if (isNaN(raw)) {
            // Count missing numeric data or unselected linguistic as invalid for math purposes, 
            // but empty check is handled by filledCount. We'll only count non-empty invalids here.
            if (val !== undefined && val !== '') invalid++;
        }
        else {
          count++;
          if (raw < min) min = raw;
          if (raw > max) max = raw;
        }
      }
      return { min: min === Infinity ? '-' : min, max: max === -Infinity ? '-' : max, count };
    });
    const zCols = checkZeroColumns(rawMatrix);
    return { filledCount: filled, invalidCount: invalid, zeroCols: zCols, criteriaStats: stats };
  }, [matrixInputs, rawMatrix, m, criteria]);

  const emptyCount = totalCells - filledCount;

  // Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number, j: number) => {
    let newI = i;
    let newJ = j;
    if (e.key === 'ArrowUp') newI = Math.max(0, i - 1);
    else if (e.key === 'ArrowDown' || e.key === 'Enter') newI = Math.min(m - 1, i + 1);
    else if (e.key === 'ArrowLeft') newJ = Math.max(0, j - 1);
    else if (e.key === 'ArrowRight') newJ = Math.min(n - 1, j + 1);
    else return;

    if (newI !== i || newJ !== j) {
      e.preventDefault();
      const el = document.getElementById(`cell-${newI}-${newJ}`);
      if (el) el.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, startI: number, startJ: number) => {
    if (!onUpdateMatrix) return;
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;

    const rows = pasted.trim().split(/\r?\n/).map(r => r.split('\t'));
    if (rows.length === 0 || rows[0].length === 0) return;

    e.preventDefault();
    const nextMatrix = matrixInputs.map(row => [...row]);
    
    for (let i = 0; i < rows.length; i++) {
      if (startI + i >= m) break;
      if (!nextMatrix[startI + i]) nextMatrix[startI + i] = [];
      for (let j = 0; j < rows[i].length; j++) {
        if (startJ + j >= n) break;
        const val = rows[i][j].trim();
        const c = criteria[startJ + j];
        if (c.hasLinguisticScale) {
          const valid = c.linguisticScale.some(s => s.label === val);
          if (valid) nextMatrix[startI + i][startJ + j] = val;
        } else {
          nextMatrix[startI + i][startJ + j] = val;
        }
      }
    }
    onUpdateMatrix(nextMatrix);
  };

  const handleClearColumn = (j: number) => {
    if (!onUpdateMatrix) return;
    const next = matrixInputs.map(r => [...r]);
    for (let i = 0; i < m; i++) {
      if (!next[i]) next[i] = [];
      next[i][j] = '';
    }
    onUpdateMatrix(next);
  };

  const handleFillColumn = (j: number) => {
    if (!onUpdateMatrix) return;
    let fillVal = '';
    for (let i = 0; i < m; i++) {
      if (matrixInputs[i]?.[j]) {
        fillVal = matrixInputs[i][j];
        break;
      }
    }
    if (!fillVal) return;

    const next = matrixInputs.map(r => [...r]);
    for (let i = 0; i < m; i++) {
      if (!next[i]) next[i] = [];
      next[i][j] = fillVal;
    }
    onUpdateMatrix(next);
  };

  const handleClearRow = (i: number) => {
    if (!onUpdateMatrix) return;
    const next = matrixInputs.map(r => [...r]);
    if (!next[i]) next[i] = [];
    for (let j = 0; j < n; j++) next[i][j] = '';
    onUpdateMatrix(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/40 p-4 rounded-lg border">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            {emptyCount === 0 && invalidCount === 0 ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <AlertCircle className="text-amber-500" size={20} />
            )}
            <span className="font-medium">
              {filledCount} / {totalCells} cells filled
            </span>
          </div>
          {emptyCount > 0 && <span className="text-muted-foreground">{emptyCount} empty</span>}
          {invalidCount > 0 && <span className="text-destructive font-medium">{invalidCount} invalid</span>}
        </div>
        
        {zeroCols.length > 0 && (
          <div className="text-sm font-medium text-destructive flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-md">
            <AlertCircle size={16} />
            Warning: Column(s) {zeroCols.map(c => criteria[c]?.name).join(', ')} are all zeros.
          </div>
        )}
      </div>

      {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

      <Card>
        <CardHeader><CardTitle className="text-lg">Decision Matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Alternative</TableHead>
                {criteria.map((c, j) => (
                  <TableHead key={j} className="text-center min-w-[140px] align-bottom pb-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1 justify-center w-full">
                        <span className="truncate max-w-[100px]">{c.name}</span>
                        <span className={`text-xs flex-shrink-0 ${c.type === 'benefit' ? 'text-emerald-600' : 'text-red-500'}`}>
                          ({c.type === 'benefit' ? '+' : '−'})
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 flex-shrink-0"><ChevronDown size={14} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFillColumn(j)}>Fill Down (1st val)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClearColumn(j)} className="text-destructive">Clear Column</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => {
                const rowIncomplete = criteria.some((_, j) => !matrixInputs[i]?.[j]);
                return (
                  <TableRow key={i} className={rowIncomplete ? "bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/50 dark:hover:bg-amber-950/30" : ""}>
                    <TableCell className="font-medium sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] bg-inherit">
                      {alt}
                    </TableCell>
                    {criteria.map((c, j) => {
                      const isErr = !!errors[`cell_${i}_${j}`];
                      return (
                        <TableCell key={j} className="text-center">
                          {c.hasLinguisticScale ? (
                            <Select
                              value={matrixInputs[i]?.[j] || ''}
                              onValueChange={val => onUpdateCell(i, j, val)}
                            >
                              <SelectTrigger className={`w-36 mx-auto ${isErr ? 'border-destructive' : ''}`}>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {c.linguisticScale.map(s => (
                                  <SelectItem key={s.label} value={s.label}>
                                    {s.label} ({s.value})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={`cell-${i}-${j}`}
                              type="number"
                              className={`w-28 mx-auto text-center ${isErr ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                              value={matrixInputs[i]?.[j] || ''}
                              onChange={e => onUpdateCell(i, j, e.target.value)}
                              onKeyDown={e => handleKeyDown(e, i, j)}
                              onPaste={e => handlePaste(e, i, j)}
                              placeholder="0"
                            />
                          )}
                          {isErr && (
                            <p className="text-xs text-destructive mt-1">{errors[`cell_${i}_${j}`]}</p>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleClearRow(i)} title="Clear Row">
                        <Trash2 size={16} className="text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Numeric Preview & Diagnostics</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto relative">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] align-bottom pb-3">Alternative</TableHead>
                {criteria.map((c, j) => (
                  <TableHead key={j} className="text-center min-w-[120px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="font-semibold truncate max-w-[120px]">{c.name}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${c.type === 'benefit' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800' : 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'}`}>
                        {c.type}
                      </Badge>
                      {c.hasLinguisticScale && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[120px] truncate" title={c.linguisticScale.map(l => `${l.label}(${l.value})`).join(', ')}>
                          {c.linguisticScale.length > 0 ? `${c.linguisticScale[0].label}(${c.linguisticScale[0].value})...` : 'Scale'}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium sticky left-0 z-10 bg-background shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">{alt}</TableCell>
                  {criteria.map((_, j) => (
                    <TableCell key={j} className="text-center font-mono">
                      {isNaN(rawMatrix[i]?.[j]) ? '—' : parseFloat(rawMatrix[i][j].toFixed(4))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableCell className="font-semibold text-xs uppercase text-muted-foreground sticky left-0 z-10 bg-muted/30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">Diagnostics</TableCell>
                {criteriaStats.map((s, j) => (
                  <TableCell key={j} className="text-center text-xs text-muted-foreground p-2">
                    <div className="flex flex-col gap-0.5 items-center">
                      <span className="bg-background/50 px-2 py-0.5 rounded">n = {s.count}</span>
                      <span className="text-[10px] mt-1">Min: {typeof s.min === 'number' ? parseFloat(s.min.toFixed(4)) : '-'}</span>
                      <span className="text-[10px]">Max: {typeof s.max === 'number' ? parseFloat(s.max.toFixed(4)) : '-'}</span>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
