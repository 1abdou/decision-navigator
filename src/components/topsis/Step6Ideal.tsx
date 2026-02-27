// ============================================================
// Step 6 — Ideal Best (V+) & Ideal Worst (V-)
// ============================================================
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  criteriaNames: string[];
  types: ('benefit' | 'cost')[];
  idealBest: number[];
  idealWorst: number[];
}

export default function Step6Ideal({ criteriaNames, types, idealBest, idealWorst }: Props) {
  const radarData = criteriaNames.map((name, j) => ({
    criterion: name,
    'V⁺ (Ideal Best)': +idealBest[j].toFixed(4),
    'V⁻ (Ideal Worst)': +idealWorst[j].toFixed(4),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Ideal Solutions</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criterion</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">V⁺ (Ideal Best)</TableHead>
                <TableHead className="text-center">V⁻ (Ideal Worst)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {criteriaNames.map((name, j) => (
                <TableRow
                  key={j}
                  className={types[j] === 'benefit' ? 'bg-emerald-50' : 'bg-red-50'}
                >
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      types[j] === 'benefit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {types[j] === 'benefit' ? 'Benefit (+)' : 'Cost (−)'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-mono">{idealBest[j].toFixed(4)}</TableCell>
                  <TableCell className="text-center font-mono">{idealWorst[j].toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ideal Solutions Radar</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criterion" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              <Radar name="V⁺ (Ideal Best)" dataKey="V⁺ (Ideal Best)" stroke="#059669" fill="#059669" fillOpacity={0.2} />
              <Radar name="V⁻ (Ideal Worst)" dataKey="V⁻ (Ideal Worst)" stroke="#DC2626" fill="#DC2626" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
