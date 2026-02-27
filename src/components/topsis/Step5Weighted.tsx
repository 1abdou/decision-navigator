// ============================================================
// Step 5 — Weighted Normalized Matrix
// ============================================================
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  alternatives: string[];
  criteriaNames: string[];
  weightedMatrix: number[][];
}

const COLORS = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5', '#047857'];

function greenIntensity(val: number, max: number): string {
  const ratio = max === 0 ? 0 : val / max;
  const l = 95 - ratio * 40;
  return `hsl(150, 60%, ${l}%)`;
}

export default function Step5Weighted({ alternatives, criteriaNames, weightedMatrix }: Props) {
  const allVals = weightedMatrix.flat();
  const maxVal = Math.max(...allVals, 0.001);

  const chartData = alternatives.map((alt, i) => {
    const obj: Record<string, string | number> = { name: alt };
    criteriaNames.forEach((c, j) => { obj[c] = +weightedMatrix[i][j].toFixed(4); });
    return obj;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Weighted Normalized Matrix</CardTitle></CardHeader>
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
                  {weightedMatrix[i].map((v, j) => (
                    <TableCell key={j} className="text-center font-mono" style={{ backgroundColor: greenIntensity(v, maxVal) }}>
                      {v.toFixed(4)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Weighted Criteria Contributions</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {criteriaNames.map((c, j) => (
                <Bar key={c} dataKey={c} stackId="a" fill={COLORS[j % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
