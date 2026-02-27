// ============================================================
// Step 3 — Assign Weights
// ============================================================
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { rankSumWeights, normalizeWeights } from '@/lib/topsis';
import type { CriterionSetup } from '@/lib/topsisTypes';

interface Props {
  criteria: CriterionSetup[];
  weightMethod: 'direct' | 'rank';
  directWeights: number[];
  ranks: number[];
  weights: number[];
  onUpdateDirectWeight: (i: number, val: number) => void;
  onNormalize: () => void;
  onSwapRanks: (i: number, j: number) => void;
  errors: Record<string, string>;
}

export default function Step3Weights({
  criteria, weightMethod, directWeights, ranks, weights,
  onUpdateDirectWeight, onNormalize, onSwapRanks, errors,
}: Props) {
  const sum = directWeights.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {weightMethod === 'direct' ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Direct Weights
              <span className={`text-sm font-normal ${Math.abs(sum - 1) < 0.001 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Sum: {sum.toFixed(4)} {Math.abs(sum - 1) < 0.001 ? '✓' : '(should be 1.0)'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <Label className="w-40 truncate">{c.name}</Label>
                <Input
                  type="number" step="0.01" min="0" max="1"
                  className="w-28"
                  value={directWeights[i] ?? 0}
                  onChange={e => onUpdateDirectWeight(i, parseFloat(e.target.value) || 0)}
                />
                <span className="text-sm text-muted-foreground font-mono w-16">
                  {(weights[i] ?? 0).toFixed(4)}
                </span>
              </div>
            ))}
            {errors.weights && <p className="text-sm text-destructive">{errors.weights}</p>}
            <Button variant="outline" size="sm" onClick={onNormalize}>
              Auto-Normalize to 1.0
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rank Criteria (1 = most important)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criteria
              .map((c, i) => ({ c, i, rank: ranks[i] }))
              .sort((a, b) => a.rank - b.rank)
              .map(({ c, i, rank }, sortIdx) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <span className="w-8 text-center font-bold text-primary">{rank}</span>
                  <span className="flex-1">{c.name}</span>
                  <div className="flex gap-1">
                    <button
                      disabled={sortIdx === 0}
                      onClick={() => {
                        const above = criteria.findIndex((_, ci) => ranks[ci] === rank - 1);
                        if (above >= 0) onSwapRanks(i, above);
                      }}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      disabled={sortIdx === criteria.length - 1}
                      onClick={() => {
                        const below = criteria.findIndex((_, ci) => ranks[ci] === rank + 1);
                        if (below >= 0) onSwapRanks(i, below);
                      }}
                      className="p-1 rounded hover:bg-muted disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground font-mono w-16">
                    w = {(weights[i] ?? 0).toFixed(4)}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
