// ============================================================
// Step 3 — Assign Weights (Priority level)
// ============================================================
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CriterionSetup } from '@/lib/topsisTypes';

interface Props {
  criteria: CriterionSetup[];
  ranks: number[];
  weights: number[];
  onSetCriterionLevel: (criterionIndex: number, level: number) => void;
  errors: Record<string, string>;
}

export default function Step3Weights({
  criteria, ranks, weights, onSetCriterionLevel, errors,
}: Props) {
  const n = criteria.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority level</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Level 1 = highest priority, Level {n} = lowest. Assign each criterion to a level; criteria in the same level share equal weight. Weights are computed so their sum equals 1.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: n }, (_, k) => k + 1).map((level) => {
            const inLevel = criteria
              .map((c, i) => ({ c, i, rank: ranks[i] ?? i + 1 }))
              .filter(({ rank }) => rank === level);
            return (
              <div key={level} className="border rounded-lg p-3 space-y-2">
                <Label className="text-sm font-semibold">Level {level}</Label>
                {inLevel.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No criteria in this level</p>
                ) : (
                  <ul className="space-y-2">
                    {inLevel.map(({ c, i }) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-md flex-wrap"
                      >
                        <span className="flex-1 min-w-[120px] truncate">{c.name}</span>
                        <Select
                          value={String(ranks[i] ?? level)}
                          onValueChange={(val) => onSetCriterionLevel(i, parseInt(val, 10))}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: n }, (_, j) => j + 1).map((l) => (
                              <SelectItem key={l} value={String(l)}>
                                Level {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground font-mono w-16">
                          w = {(weights[i] ?? 0).toFixed(4)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          {errors.weights && <p className="text-sm text-destructive">{errors.weights}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
