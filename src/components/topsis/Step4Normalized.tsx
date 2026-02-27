// ============================================================
// Step 4 — Normalized Matrix
// ============================================================
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  alternatives: string[];
  criteriaNames: string[];
  normalizedMatrix: number[][];
  norms: number[];
}

const COLORS = ['#4F46E5', '#7C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#EC4899'];

function blueIntensity(val: number): string {
  const l = 95 - val * 40;
  return `hsl(230, 70%, ${l}%)`;
}

export default function Step4Normalized({ alternatives, criteriaNames, normalizedMatrix, norms }: Props) {
  const chartData = alternatives.map((alt, i) => {
    const obj: Record<string, string | number> = { name: alt };
    criteriaNames.forEach((c, j) => { obj[c] = +normalizedMatrix[i][j].toFixed(4); });
    return obj;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Normalized Matrix (Vector Normalization)</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alternative</TableHead>
                {criteriaNames.map((c, j) => <TableHead key={j} className="text-center">{c}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{alt}</TableCell>
                  {normalizedMatrix[i].map((v, j) => (
                    <TableCell key={j} className="text-center font-mono" style={{ backgroundColor: blueIntensity(v) }}>
                      {v.toFixed(4)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-semibold text-muted-foreground">Column Norm</TableCell>
                {norms.map((n, j) => (
                  <TableCell key={j} className="text-center font-mono text-muted-foreground">{n.toFixed(4)}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Normalized Values Comparison</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />
              {criteriaNames.map((c, j) => (
                <Bar key={c} dataKey={c} fill={COLORS[j % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
