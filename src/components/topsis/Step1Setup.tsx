import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, TrendingUp, TrendingDown, ClipboardPaste, Save, Download, RefreshCw, BarChart2, Star, Target, Info } from 'lucide-react';
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

const PRESETS = {
  basic: {
    label: '3x3 Basic', icon: BarChart2,
    alts: ['Alternative A', 'Alternative B', 'Alternative C'],
    crits: [
      { name: 'Cost', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] },
      { name: 'Quality', type: 'benefit' as const, hasLinguisticScale: true, linguisticScale: [{label:'Low', value:1},{label:'Med', value:5},{label:'High', value:9}] },
      { name: 'Time', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] }
    ]
  },
  advanced: {
    label: '5x4 Advanced', icon: Target,
    alts: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
    crits: [
      { name: 'Initial Price', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] },
      { name: 'Durability', type: 'benefit' as const, hasLinguisticScale: true, linguisticScale: [{label:'Poor', value:1},{label:'Fair', value:3},{label:'Good', value:5},{label:'Excel', value:7},{label:'Best', value:9}] },
      { name: 'Maintenance', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] },
      { name: 'Aesthetics', type: 'benefit' as const, hasLinguisticScale: true, linguisticScale: [{label:'Low', value:1},{label:'High', value:5}] }
    ]
  },
  supplier: {
    label: 'Supplier Selection', icon: Star,
    alts: ['Supplier A', 'Supplier B', 'Supplier C'],
    crits: [
      { name: 'Unit Cost', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] },
      { name: 'Delivery Speed', type: 'benefit' as const, hasLinguisticScale: false, linguisticScale: [] },
      { name: 'Reliability', type: 'benefit' as const, hasLinguisticScale: true, linguisticScale: [{label:'Very Low', value:1},{label:'Low', value:3},{label:'Medium', value:5},{label:'High', value:7},{label:'Very High', value:9}] },
      { name: 'Defect Rate', type: 'cost' as const, hasLinguisticScale: false, linguisticScale: [] }
    ]
  }
};

const LINGUISTIC_TEMPLATES = {
  lowMidHigh: [{label:'Low', value:1}, {label:'Medium', value:3}, {label:'High', value:5}],
  likert5: [{label:'Very Poor', value:1}, {label:'Poor', value:2}, {label:'Average', value:3}, {label:'Good', value:4}, {label:'Excellent', value:5}]
};

export default function Step1Setup({
  numAlternatives, numCriteria, alternativeNames, criteria, onUpdate, errors: globalErrors,
}: Props) {

  const [bulkModeAlts, setBulkModeAlts] = useState(false);
  const [bulkAltsText, setBulkAltsText] = useState('');
  
  const [bulkModeCrits, setBulkModeCrits] = useState(false);
  const [bulkCritsText, setBulkCritsText] = useState('');

  // Combine parent empty-checks with our local duplicate checks
  const localErrors = useMemo(() => {
    const errs: Record<string, string> = { ...globalErrors };
    const altLower = alternativeNames.slice(0, numAlternatives).map(n => n.trim().toLowerCase());
    const critLower = criteria.slice(0, numCriteria).map(c => c.name.trim().toLowerCase());

    altLower.forEach((n, i) => {
      if (!n) errs[`alt_${i}`] = 'Name required';
      else if (altLower.indexOf(n) !== i) errs[`alt_${i}`] = 'Duplicate Alternative';
    });

    critLower.forEach((n, i) => {
      if (!n) errs[`crit_${i}`] = 'Name required';
      else if (critLower.indexOf(n) !== i) errs[`crit_${i}`] = 'Duplicate Criterion';
      
      const c = criteria[i];
      if (c.hasLinguisticScale) {
        if (c.linguisticScale.length < 2) errs[`crit_${i}_scale`] = 'At least 2 entries required';
        const labels = c.linguisticScale.map(l => l.label.trim().toLowerCase());
        labels.forEach((l, si) => {
          if (!l) errs[`crit_${i}_scale_${si}`] = 'Label required';
          else if (labels.indexOf(l) !== si) errs[`crit_${i}_scale_${si}`] = 'Duplicate label';
        });
      }
    });

    return errs;
  }, [alternativeNames, criteria, numAlternatives, numCriteria, globalErrors]);

  const applyPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    onUpdate({
      numAlternatives: preset.alts.length,
      numCriteria: preset.crits.length,
      alternativeNames: [...preset.alts, ...Array(10).fill('Option')],
      criteria: [...preset.crits, ...Array(8).fill({name: 'Crit', type: 'benefit', hasLinguisticScale: false, linguisticScale: []})],
    });
  };

  const handleStepperChange = (key: 'numAlternatives' | 'numCriteria', val: number) => {
    const min = 2, max = key === 'numAlternatives' ? 10 : 8;
    const clamped = Math.max(min, Math.min(max, typeof val === 'number' && !isNaN(val) ? val : min));

    const newAlts = [...alternativeNames];
    const newCriteria = [...criteria];

    if (key === 'numAlternatives') {
      while (newAlts.length < clamped) newAlts.push(`Alternative ${newAlts.length + 1}`);
      onUpdate({ numAlternatives: clamped, numCriteria, alternativeNames: newAlts, criteria: newCriteria });
    } else {
      while (newCriteria.length < clamped)
        newCriteria.push({ name: `Criterion ${newCriteria.length + 1}`, type: 'benefit', hasLinguisticScale: false, linguisticScale: [] });
      onUpdate({ numAlternatives, numCriteria: clamped, alternativeNames: newAlts, criteria: newCriteria });
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

  const handleAltKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (i + 1 < numAlternatives) {
        document.getElementById(`alt-input-${i + 1}`)?.focus();
      }
    }
  };

  const applyBulkAlts = () => {
    const lines = bulkAltsText.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length >= 2) {
      const clampedCount = Math.min(10, lines.length);
      const newNames = [...alternativeNames];
      lines.slice(0, clampedCount).forEach((l, i) => newNames[i] = l);
      onUpdate({ numAlternatives: clampedCount, numCriteria, alternativeNames: newNames, criteria });
    }
    setBulkModeAlts(false);
  };

  const saveTemplate = () => {
    const name = window.prompt("Enter a name for this layout template:");
    if (!name) return;
    const template = { numAlternatives, numCriteria, alternativeNames: alternativeNames.slice(0, numAlternatives), criteria: criteria.slice(0, numCriteria) };
    localStorage.setItem(`topsis_template_${name.replace(/\s+/g, '_')}`, JSON.stringify(template));
    alert('Template saved!');
  };

  const loadTemplate = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('topsis_template_'));
    if (keys.length === 0) return alert('No saved templates found.');
    const map = keys.map(k => k.replace('topsis_template_', ''));
    const selection = window.prompt(`Available templates:\n${map.join('\n')}\n\nEnter template name to load:`);
    if (selection) {
      const data = localStorage.getItem(`topsis_template_${selection.replace(/\s+/g, '_')}`);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          onUpdate({
            numAlternatives: parsed.numAlternatives,
            numCriteria: parsed.numCriteria,
            alternativeNames: [...parsed.alternativeNames, ...Array(10).fill('')],
            criteria: [...parsed.criteria, ...Array(8).fill({name: '', type: 'benefit', hasLinguisticScale: false, linguisticScale: []})],
          });
        } catch (e) {
          alert('Failed to parse template');
        }
      } else {
        alert('Template not found');
      }
    }
  };

  const lingCount = criteria.slice(0, numCriteria).filter(c => c.hasLinguisticScale).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Setup Content */}
      <div className="lg:col-span-3 space-y-8">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-muted/40 p-4 rounded-xl border">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Quick-Start Presets</h3>
            <p className="text-xs text-muted-foreground">Load a standard scenario to start faster.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, p]) => (
              <Button key={key} size="sm" variant="outline" className="text-xs h-8" onClick={() => applyPreset(key as any)}>
                <p.icon className="mr-1.5 h-3.5 w-3.5"/> {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Global Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-base font-semibold">Number of Alternatives</Label>
            <p className="text-sm text-muted-foreground mb-2">Options you are choosing between (max 10).</p>
            <div className="flex items-center gap-1 border rounded-md w-fit bg-background p-1 shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => handleStepperChange('numAlternatives', numAlternatives - 1)} disabled={numAlternatives <= 2}>
                <Minus size={16} />
              </Button>
              <Input 
                type="number" min={2} max={10} value={numAlternatives} 
                onChange={e => handleStepperChange('numAlternatives', parseInt(e.target.value))}
                className="w-16 h-8 text-center border-none shadow-none focus-visible:ring-0 text-base font-medium"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => handleStepperChange('numAlternatives', numAlternatives + 1)} disabled={numAlternatives >= 10}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-base font-semibold">Number of Criteria</Label>
            <p className="text-sm text-muted-foreground mb-2">Factors you are evaluating against (max 8).</p>
            <div className="flex items-center gap-1 border rounded-md w-fit bg-background p-1 shadow-sm">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => handleStepperChange('numCriteria', numCriteria - 1)} disabled={numCriteria <= 2}>
                <Minus size={16} />
              </Button>
              <Input 
                type="number" min={2} max={8} value={numCriteria} 
                onChange={e => handleStepperChange('numCriteria', parseInt(e.target.value))}
                className="w-16 h-8 text-center border-none shadow-none focus-visible:ring-0 text-base font-medium"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => handleStepperChange('numCriteria', numCriteria + 1)} disabled={numCriteria >= 8}>
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Alternatives Section */}
        <Card className="shadow-sm border-muted">
          <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">Alternatives</CardTitle>
              <CardDescription>Name the items you want to rank. Press Enter to move to the next.</CardDescription>
            </div>
            <Button size="sm" variant={bulkModeAlts ? "default" : "outline"} onClick={() => setBulkModeAlts(!bulkModeAlts)} className="h-8">
              <ClipboardPaste className="mr-1.5 h-3.5 w-3.5" />
              {bulkModeAlts ? "Cancel Paste" : "Bulk Paste"}
            </Button>
          </CardHeader>
          <CardContent>
            {bulkModeAlts ? (
              <div className="space-y-3">
                <Textarea 
                  placeholder="Paste multiple lines here (e.g. from Excel)&#10;Alternative 1&#10;Alternative 2"
                  value={bulkAltsText} onChange={e => setBulkAltsText(e.target.value)}
                  className="min-h-[150px]"
                />
                <Button onClick={applyBulkAlts}>Apply Lines</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {alternativeNames.slice(0, numAlternatives).map((name, i) => (
                  <div key={i} className="space-y-1">
                    <Input
                      id={`alt-input-${i}`}
                      placeholder={`Alternative ${i + 1}`}
                      value={name}
                      onChange={e => updateAlt(i, e.target.value)}
                      onKeyDown={e => handleAltKeyDown(e, i)}
                      className={localErrors[`alt_${i}`] ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {localErrors[`alt_${i}`] && <p className="text-xs text-red-500 flex items-center"><Info size={12} className="mr-1"/>{localErrors[`alt_${i}`]}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Criteria Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">Evaluation Criteria</h3>
            <p className="text-sm text-muted-foreground">Define what metrics matter. A "Benefit" criterion means higher values are better (e.g. Profit), while a "Cost" criterion means lower values are better (e.g. Price).</p>
          </div>
          
          <div className="space-y-4">
            {criteria.slice(0, numCriteria).map((c, i) => (
              <Card key={i} className="shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
                  
                  {/* Left Column: Name & Type */}
                  <div className="flex-1 space-y-4 min-w-[240px]">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Name</Label>
                      <Input
                        placeholder={`Criterion ${i + 1}`}
                        value={c.name}
                        onChange={e => updateCriterion(i, { name: e.target.value })}
                        className={localErrors[`crit_${i}`] ? "border-red-500" : ""}
                      />
                      {localErrors[`crit_${i}`] && <p className="text-xs text-red-500 flex items-center"><Info size={12} className="mr-1"/>{localErrors[`crit_${i}`]}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Type Focus</Label>
                      <div className="flex bg-muted/60 p-1 rounded-lg w-fit border">
                        <button
                          onClick={() => updateCriterion(i, { type: 'benefit' })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            c.type === 'benefit'
                              ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-600'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          title="Benefit: Higher values improve the rank."
                        >
                          <TrendingUp size={14} /> Benefit
                        </button>
                        <button
                          onClick={() => updateCriterion(i, { type: 'cost' })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            c.type === 'cost'
                              ? 'bg-red-500 text-white shadow-sm ring-1 ring-red-600'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          title="Cost: Lower values improve the rank."
                        >
                          <TrendingDown size={14} /> Cost
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-px bg-border hidden md:block" />

                  {/* Right Column: Linguistic Scales */}
                  <div className="flex-[1.5] space-y-3">
                    <div className="flex items-center gap-2 pt-1">
                      <Switch
                        checked={c.hasLinguisticScale}
                        onCheckedChange={v => updateCriterion(i, {
                          hasLinguisticScale: v,
                          linguisticScale: v && c.linguisticScale.length === 0
                            ? LINGUISTIC_TEMPLATES.lowMidHigh
                            : c.linguisticScale,
                          isPercentage: v ? false : c.isPercentage,
                        })}
                      />
                      <div>
                        <Label className="text-sm font-semibold leading-none cursor-pointer">Use Linguistic Scale</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">Use descriptive words instead of raw numbers</p>
                      </div>
                    </div>

                    {!c.hasLinguisticScale && (
                      <div className="flex items-center gap-2 pt-3">
                        <Switch
                          checked={!!c.isPercentage}
                          onCheckedChange={v => updateCriterion(i, { isPercentage: v })}
                        />
                        <div>
                          <Label className="text-sm font-semibold leading-none cursor-pointer">Is Percentage</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">Format as a % value (e.g., 50%)</p>
                        </div>
                      </div>
                    )}

                    {c.hasLinguisticScale && (
                      <div className="pl-0 sm:pl-4 space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {localErrors[`crit_${i}_scale`] && <p className="text-xs text-red-500">{localErrors[`crit_${i}_scale`]}</p>}
                        
                        <div className="flex flex-col gap-2">
                          {c.linguisticScale.map((entry, si) => (
                            <div key={si} className="flex gap-2 items-start">
                              <div className="flex-1 space-y-1">
                                <Input
                                  placeholder="E.g., Very High"
                                  value={entry.label}
                                  onChange={e => {
                                    const next = [...c.linguisticScale];
                                    next[si] = { ...next[si], label: e.target.value };
                                    updateCriterion(i, { linguisticScale: next });
                                  }}
                                  className={`h-8 text-sm ${localErrors[`crit_${i}_scale_${si}`] ? "border-red-500" : ""}`}
                                />
                                {localErrors[`crit_${i}_scale_${si}`] && <p className="text-[10px] text-red-500 leading-tight">{localErrors[`crit_${i}_scale_${si}`]}</p>}
                              </div>
                              <div className="w-20">
                                <Input
                                  type="number" placeholder="Val"
                                  value={entry.value}
                                  onChange={e => {
                                    const next = [...c.linguisticScale];
                                    next[si] = { ...next[si], value: parseFloat(e.target.value) || 0 };
                                    updateCriterion(i, { linguisticScale: next });
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <Button
                                size="icon" variant="ghost"
                                onClick={() => updateCriterion(i, { linguisticScale: c.linguisticScale.filter((_, idx) => idx !== si) })}
                                className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600 shrink-0"
                              >
                                <Minus size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-muted/60 mt-3 pt-3">
                          <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => {
                            updateCriterion(i, { linguisticScale: [...c.linguisticScale, { label: '', value: 0 }] });
                          }}>
                            <Plus size={14} className="mr-1" /> Add
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                            updateCriterion(i, { linguisticScale: [...c.linguisticScale].sort((a,b)=>a.value - b.value) });
                          }}>
                            Sort
                          </Button>
                          <div className="h-4 w-px bg-border mx-1" />
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => updateCriterion(i, { linguisticScale: LINGUISTIC_TEMPLATES.lowMidHigh })}>
                            Low/Mid/High
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => updateCriterion(i, { linguisticScale: LINGUISTIC_TEMPLATES.likert5 })}>
                            1-5 Likert
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar Summary */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <Card className="shadow-sm border-primary/10 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-primary/10">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Target size={18} className="text-primary"/> Setup Summary</h3>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Alternatives</span>
                  <span className="font-semibold text-base">{numAlternatives} <span className="text-xs font-normal text-muted-foreground mr-1">/ 10</span></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Criteria</span>
                  <span className="font-semibold text-base">{numCriteria} <span className="text-xs font-normal text-muted-foreground mr-1">/ 8</span></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Using Scales</span>
                  <span className={`font-semibold text-base ${lingCount > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {lingCount} <span className="text-xs font-normal text-muted-foreground mr-1">/ {numCriteria}</span>
                  </span>
                </div>
              </div>
              
              {/* Errors Block */}
              {Object.keys(localErrors).length > 0 && (
                <div className="p-3 bg-red-50 rounded-md border border-red-100">
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1.5"><Info size={14}/> {Object.keys(localErrors).length} issues to resolve</p>
                </div>
              )}
              {Object.keys(localErrors).length === 0 && (
                <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5"><RefreshCw size={14}/> All clear to proceed</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm bg-muted/30">
            <CardContent className="p-4 space-y-3 text-sm">
              <p className="font-semibold mb-2">Templating</p>
              <Button variant="outline" className="w-full justify-start h-9" onClick={saveTemplate}>
                <Save className="mr-2 h-4 w-4" /> Save Layout
              </Button>
              <Button variant="outline" className="w-full justify-start h-9" onClick={loadTemplate}>
                <Download className="mr-2 h-4 w-4" /> Load Layout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
