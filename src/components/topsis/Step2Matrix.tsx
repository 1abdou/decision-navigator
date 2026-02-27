// ============================================================
// Step 2 — Decision Matrix Input
// ============================================================
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CriterionSetup } from '@/lib/topsisTypes';

interface Props {
  alternatives: string[];
  criteria: CriterionSetup[];
  matrixInputs: string[][];
  onUpdateCell: (i: number, j: number, val: string) => void;
  rawMatrix: number[][];
  errors: Record<string, string>;
}

export default function Step2Matrix({ alternatives, criteria, matrixInputs, onUpdateCell, rawMatrix, errors }: Props) {
  return (
    <div className="space-y-6">
      {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

      <Card>
        <CardHeader><CardTitle className="text-lg">Decision Matrix</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Alternative</TableHead>
                {criteria.map((c, j) => (
                  <TableHead key={j} className="text-center">
                    {c.name}
                    <span className={`ml-1 text-xs ${c.type === 'benefit' ? 'text-emerald-600' : 'text-red-500'}`}>
                      ({c.type === 'benefit' ? '+' : '−'})
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{alt}</TableCell>
                  {criteria.map((c, j) => (
                    <TableCell key={j} className="text-center">
                      {c.hasLinguisticScale ? (
                        <Select
                          value={matrixInputs[i]?.[j] || ''}
                          onValueChange={val => onUpdateCell(i, j, val)}
                        >
                          <SelectTrigger className="w-32 mx-auto">
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
                          type="number"
                          className="w-24 mx-auto text-center"
                          value={matrixInputs[i]?.[j] || ''}
                          onChange={e => onUpdateCell(i, j, e.target.value)}
                          placeholder="0"
                        />
                      )}
                      {errors[`cell_${i}_${j}`] && (
                        <p className="text-xs text-destructive mt-1">{errors[`cell_${i}_${j}`]}</p>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Numeric preview */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Numeric Preview</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alternative</TableHead>
                {criteria.map((c, j) => <TableHead key={j} className="text-center">{c.name}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{alt}</TableCell>
                  {criteria.map((_, j) => (
                    <TableCell key={j} className="text-center font-mono">
                      {isNaN(rawMatrix[i]?.[j]) ? '—' : rawMatrix[i][j]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
