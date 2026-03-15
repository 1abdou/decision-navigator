// ============================================================
// Step 1 — Setup: Alternatives & Criteria
// ============================================================
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import type { CriterionSetup } from '@/lib/topsisTypes';

interface Props {
  numAlternatives: number;
  numCriteria: number;
  alternativeNames: string[];
  criteria: CriterionSetup[];
  onUpdate: (data: {
    numAlternatives: number;
    numCriteria: number;
    alternativeNames: string[];
    criteria: CriterionSetup[];
  }) => void;
  errors: Record<string, string>;
}

export default function Step1Setup({
  numAlternatives, numCriteria, alternativeNames, criteria, onUpdate, errors,
}: Props) {
  const setNum = (key: 'numAlternatives' | 'numCriteria', val: number) => {
    const clamped = key === 'numAlternatives'
      ? Math.max(2, Math.min(10, val))
      : Math.max(2, Math.min(8, val));

    const newAlts = [...alternativeNames];
    const newCriteria = [...criteria];

    if (key === 'numAlternatives') {
      while (newAlts.length < clamped) newAlts.push(`Alternative ${newAlts.length + 1}`);
      newAlts.length = clamped;
      onUpdate({ numAlternatives: clamped, numCriteria, alternativeNames: newAlts, criteria: newCriteria });
    } else {
      while (newCriteria.length < clamped)
        newCriteria.push({ name: `Criterion ${newCriteria.length + 1}`, type: 'benefit', hasLinguisticScale: false, linguisticScale: [] });
      newCriteria.length = clamped;
      onUpdate({ numAlternatives, numCriteria: clamped, alternativeNames, criteria: newCriteria });
    }
  };

  const updateAlt = (i: number, name: string) => {
    const next = [...alternativeNames];
    next[i] = name;
    onUpdate({ numAlternatives, numCriteria, alternativeNames: next, criteria });
  };

  const updateCriterion = (i: number, patch: Partial<CriterionSetup>) => {
    const next = criteria.map((c, idx) => idx === i ? { ...c, ...patch } : c);
    onUpdate({ numAlternatives, numCriteria, alternativeNames, criteria: next });
  };

  const addScaleEntry = (i: number) => {
    const c = criteria[i];
    updateCriterion(i, { linguisticScale: [...c.linguisticScale, { label: '', value: 0 }] });
  };

  const removeScaleEntry = (ci: number, si: number) => {
    const c = criteria[ci];
    updateCriterion(ci, { linguisticScale: c.linguisticScale.filter((_, idx) => idx !== si) });
  };

  const updateScaleEntry = (ci: number, si: number, field: 'label' | 'value', val: string) => {
    const c = criteria[ci];
    const next = c.linguisticScale.map((e, idx) =>
      idx === si ? { ...e, [field]: field === 'value' ? parseFloat(val) || 0 : val } : e
    );
    updateCriterion(ci, { linguisticScale: next });
  };

  return (
    <div className="space-y-6">
      {/* Number controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Number of Alternatives (2–10)</Label>
          <Input
            type="number" min={2} max={10} value={numAlternatives}
            onChange={e => setNum('numAlternatives', parseInt(e.target.value) || 2)}
          />
          {errors.numAlternatives && <p className="text-sm text-destructive mt-1">{errors.numAlternatives}</p>}
        </div>
        <div>
          <Label>Number of Criteria (2–8)</Label>
          <Input
            type="number" min={2} max={8} value={numCriteria}
            onChange={e => setNum('numCriteria', parseInt(e.target.value) || 2)}
          />
          {errors.numCriteria && <p className="text-sm text-destructive mt-1">{errors.numCriteria}</p>}
        </div>
      </div>

      {/* Alternative names */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Alternatives</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {alternativeNames.slice(0, numAlternatives).map((name, i) => (
            <div key={i}>
              <Input
                placeholder={`Alternative ${i + 1}`}
                value={name}
                onChange={e => updateAlt(i, e.target.value)}
              />
              {errors[`alt_${i}`] && <p className="text-sm text-destructive mt-1">{errors[`alt_${i}`]}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Criteria */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Criteria</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {criteria.slice(0, numCriteria).map((c, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label>Name</Label>
                  <Input
                    placeholder={`Criterion ${i + 1}`}
                    value={c.name}
                    onChange={e => updateCriterion(i, { name: e.target.value })}
                  />
                  {errors[`crit_${i}`] && <p className="text-sm text-destructive mt-1">{errors[`crit_${i}`]}</p>}
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => updateCriterion(i, { type: 'benefit' })}
                      className={`flex items-center gap-1 px-3 py-2 rounded-l-full text-xs font-medium transition-colors ${
                        c.type === 'benefit'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <TrendingUp size={14} /> Benefit
                    </button>
                    <button
                      onClick={() => updateCriterion(i, { type: 'cost' })}
                      className={`flex items-center gap-1 px-3 py-2 rounded-r-full text-xs font-medium transition-colors ${
                        c.type === 'cost'
                          ? 'bg-red-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <TrendingDown size={14} /> Cost
                    </button>
                  </div>
                </div>
              </div>

              {/* Linguistic scale toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={c.hasLinguisticScale}
                  onCheckedChange={v => updateCriterion(i, {
                    hasLinguisticScale: v,
                    linguisticScale: v && c.linguisticScale.length === 0
                      ? [{ label: 'Low', value: 1 }, { label: 'Medium', value: 5 }, { label: 'High', value: 9 }]
                      : c.linguisticScale,
                  })}
                />
                <Label className="text-sm">Use Linguistic Scale</Label>
              </div>

              {c.hasLinguisticScale && (
                <div className="pl-4 space-y-2">
                  {c.linguisticScale.map((entry, si) => (
                    <div key={si} className="flex gap-2 items-center">
                      <Input
                        placeholder="Label" className="w-32"
                        value={entry.label}
                        onChange={e => updateScaleEntry(i, si, 'label', e.target.value)}
                      />
                      <Input
                        type="number" placeholder="Value" className="w-24"
                        value={entry.value}
                        onChange={e => updateScaleEntry(i, si, 'value', e.target.value)}
                      />
                      <button
                        onClick={() => removeScaleEntry(i, si)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addScaleEntry(i)}>
                    <Plus size={14} /> Add Entry
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
