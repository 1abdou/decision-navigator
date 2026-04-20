// ============================================================
// Step 8 — Final Ranking & TOPSIS Scores
// ============================================================
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Trophy, Medal, Award, CheckCircle, AlertTriangle, Percent } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Props {
  alternatives: string[];
  sPlus: number[];
  sMinus: number[];
  scores: number[];
  ranks: number[];
}

const PODIUM_STYLES = [
  { bg: 'bg-yellow-50 border-yellow-400', icon: Trophy, color: 'text-yellow-600', label: '🥇 1st' },
  { bg: 'bg-gray-50 border-gray-400', icon: Medal, color: 'text-gray-500', label: '🥈 2nd' },
  { bg: 'bg-amber-50 border-amber-600', icon: Award, color: 'text-amber-700', label: '🥉 3rd' },
];

function scoreColor(score: number): string {
  if (score > 0.6) return '#059669';
  if (score >= 0.4) return '#D97706';
  return '#DC2626';
}

export default function Step8Ranking({ alternatives, sPlus, sMinus, scores, ranks }: Props) {
  const [showPercent, setShowPercent] = useState(false);

  const sorted = alternatives
    .map((alt, i) => ({ alt, sp: sPlus[i], sm: sMinus[i], score: scores[i], rank: ranks[i] }))
    .sort((a, b) => a.rank - b.rank);

  const chartData = sorted.map(r => ({ name: r.alt, score: showPercent ? +(r.score * 100).toFixed(2) : +r.score.toFixed(4) }));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const formatScore = (val: number) => showPercent ? `${(val * 100).toFixed(2)}%` : val.toFixed(4);

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-2">
        <Switch id="show-percent" checked={showPercent} onCheckedChange={setShowPercent} />
        <Label htmlFor="show-percent" className="font-semibold flex items-center gap-1.5 cursor-pointer">
          <Percent size={14} className="text-muted-foreground" /> Show as Percentage
        </Label>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.slice(0, 3).map((r, idx) => {
          const style = PODIUM_STYLES[idx];
          const Icon = style.icon;
          return (
            <Card key={idx} className={`${style.bg} border-2`}>
              <CardContent className="pt-6 text-center">
                <Icon className={`mx-auto mb-2 ${style.color}`} size={32} />
                <p className="text-sm text-muted-foreground">{style.label}</p>
                <p className="text-xl font-bold mt-1">{r.alt}</p>
                <p className="text-2xl font-mono font-bold mt-2" style={{ color: scoreColor(r.score) }}>
                  {formatScore(r.score)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full ranking table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Full Ranking</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Alternative</TableHead>
                <TableHead className="text-center">S⁺</TableHead>
                <TableHead className="text-center">S⁻</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="w-40">Bar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(r => (
                <TableRow key={r.rank}>
                  <TableCell className="font-bold">{r.rank}</TableCell>
                  <TableCell className="font-medium">{r.alt}</TableCell>
                  <TableCell className="text-center font-mono">{r.sp.toFixed(4)}</TableCell>
                  <TableCell className="text-center font-mono">{r.sm.toFixed(4)}</TableCell>
                  <TableCell className="text-center font-mono font-bold" style={{ color: scoreColor(r.score) }}>
                    {formatScore(r.score)}
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{ width: `${r.score * 100}%`, backgroundColor: scoreColor(r.score) }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card>
        <CardHeader><CardTitle className="text-lg">TOPSIS Scores</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 50)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, showPercent ? 100 : 1]} />
              <YAxis type="category" dataKey="name" width={70} />
              <Tooltip />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={scoreColor(d.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="text-emerald-600 mt-0.5" size={20} />
            <p>
              <strong>Best:</strong> {best.alt} (score: {formatScore(best.score)}) — {best.alt} is the most preferred alternative across all criteria.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
            <p>
              <strong>Worst:</strong> {worst.alt} (score: {formatScore(worst.score)})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
