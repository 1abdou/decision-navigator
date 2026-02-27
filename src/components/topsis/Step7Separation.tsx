// ============================================================
// Step 7 — Separation Distances
// ============================================================
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label as RLabel, Cell } from 'recharts';

interface Props {
  alternatives: string[];
  sPlus: number[];
  sMinus: number[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-card border rounded-lg p-2 shadow text-sm">
        <p className="font-semibold">{d.name}</p>
        <p>S⁺: {d.x.toFixed(4)}</p>
        <p>S⁻: {d.y.toFixed(4)}</p>
      </div>
    );
  }
  return null;
};

export default function Step7Separation({ alternatives, sPlus, sMinus }: Props) {
  const data = alternatives.map((name, i) => ({
    name,
    x: sPlus[i],
    y: sMinus[i],
    closerTo: sMinus[i] > sPlus[i] ? 'V⁺' : 'V⁻',
  }));

  const maxAxis = Math.max(...sPlus, ...sMinus) * 1.1 || 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Separation Distances</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alternative</TableHead>
                <TableHead className="text-center">S⁺</TableHead>
                <TableHead className="text-center">S⁻</TableHead>
                <TableHead className="text-center">Closer To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alternatives.map((alt, i) => {
                const closer = sMinus[i] > sPlus[i] ? 'V⁺' : 'V⁻';
                return (
                  <TableRow key={i} className={closer === 'V⁺' ? 'bg-emerald-50' : 'bg-amber-50'}>
                    <TableCell className="font-medium">{alt}</TableCell>
                    <TableCell className="text-center font-mono">{sPlus[i].toFixed(4)}</TableCell>
                    <TableCell className="text-center font-mono">{sMinus[i].toFixed(4)}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        closer === 'V⁺' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {closer}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">S⁺ vs S⁻ Scatter Plot</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="S⁺" domain={[0, maxAxis]}>
                <RLabel value="S⁺ (Distance from Ideal Best)" offset={-10} position="insideBottom" />
              </XAxis>
              <YAxis type="number" dataKey="y" name="S⁻" domain={[0, maxAxis]}>
                <RLabel value="S⁻" angle={-90} position="insideLeft" />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxAxis, y: maxAxis }]} stroke="#94a3b8" strokeDasharray="5 5" />
              <Scatter data={data} fill="#4F46E5">
                {data.map((d, i) => (
                  <Cell key={i} fill={d.closerTo === 'V⁺' ? '#059669' : '#D97706'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
