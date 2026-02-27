// ============================================================
// TOPSIS Decision-Making Tool — Main Page
// Full stepper with state management for all 8 steps
// ============================================================
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Settings, Table as TableIcon,
  Weight, Grid3X3, Layers, Target, GitFork, Trophy, Download,
} from 'lucide-react';
import Step1Setup from '@/components/topsis/Step1Setup';
import Step2Matrix from '@/components/topsis/Step2Matrix';
import Step3Weights from '@/components/topsis/Step3Weights';
import Step4Normalized from '@/components/topsis/Step4Normalized';
import Step5Weighted from '@/components/topsis/Step5Weighted';
import Step6Ideal from '@/components/topsis/Step6Ideal';
import Step7Separation from '@/components/topsis/Step7Separation';
import Step8Ranking from '@/components/topsis/Step8Ranking';
import {
  normalize, applyWeights, idealSolutions, separationDistances,
  topsisScore, rankDescending, rankSumWeights, normalizeWeights,
  checkZeroColumns,
} from '@/lib/topsis';
import { exportToExcel } from '@/lib/exportExcel';
import type { CriterionSetup } from '@/lib/topsisTypes';

const STEPS = [
  { label: 'Setup', icon: Settings },
  { label: 'Matrix', icon: TableIcon },
  { label: 'Weights', icon: Weight },
  { label: 'Normalized', icon: Grid3X3 },
  { label: 'Weighted', icon: Layers },
  { label: 'Ideal', icon: Target },
  { label: 'Distances', icon: GitFork },
  { label: 'Ranking', icon: Trophy },
];

export default function Index() {
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1 state
  const [numAlternatives, setNumAlternatives] = useState(3);
  const [numCriteria, setNumCriteria] = useState(3);
  const [alternativeNames, setAlternativeNames] = useState<string[]>(
    () => Array.from({ length: 3 }, (_, i) => `Alternative ${i + 1}`)
  );
  const [criteria, setCriteria] = useState<CriterionSetup[]>(
    () => Array.from({ length: 3 }, (_, i) => ({
      name: `Criterion ${i + 1}`, type: 'benefit' as const,
      hasLinguisticScale: false, linguisticScale: [],
    }))
  );
  const [weightMethod, setWeightMethod] = useState<'direct' | 'rank'>('direct');

  // Step 2 state
  const [matrixInputs, setMatrixInputs] = useState<string[][]>([]);

  // Step 3 state
  const [directWeights, setDirectWeights] = useState<number[]>([]);
  const [rankValues, setRankValues] = useState<number[]>([]);

  // Computed results
  const [computedNorm, setComputedNorm] = useState<{ normalized: number[][]; norms: number[] } | null>(null);
  const [computedWeighted, setComputedWeighted] = useState<number[][] | null>(null);
  const [computedIdeal, setComputedIdeal] = useState<{ idealBest: number[]; idealWorst: number[] } | null>(null);
  const [computedSep, setComputedSep] = useState<{ sPlus: number[]; sMinus: number[] } | null>(null);
  const [computedScores, setComputedScores] = useState<number[] | null>(null);
  const [computedRanks, setComputedRanks] = useState<number[] | null>(null);

  // Derived raw matrix
  const rawMatrix = useMemo(() => {
    const m: number[][] = [];
    for (let i = 0; i < numAlternatives; i++) {
      const row: number[] = [];
      for (let j = 0; j < numCriteria; j++) {
        const val = matrixInputs[i]?.[j] || '';
        const crit = criteria[j];
        if (crit?.hasLinguisticScale) {
          const found = crit.linguisticScale.find(s => s.label === val);
          row.push(found ? found.value : NaN);
        } else {
          row.push(val === '' ? NaN : parseFloat(val));
        }
      }
      m.push(row);
    }
    return m;
  }, [matrixInputs, numAlternatives, numCriteria, criteria]);

  // Weights
  const weights = useMemo(() => {
    if (weightMethod === 'rank') {
      return rankSumWeights(rankValues.length === numCriteria ? rankValues : Array.from({ length: numCriteria }, (_, i) => i + 1));
    }
    const dw = directWeights.length === numCriteria ? directWeights : Array(numCriteria).fill(1 / numCriteria);
    const sum = dw.reduce((a, b) => a + b, 0);
    return sum === 0 ? dw.map(() => 1 / numCriteria) : dw.map(w => w / sum);
  }, [weightMethod, directWeights, rankValues, numCriteria]);

  // Initialize matrix inputs when moving from step 0 to step 1
  const initMatrix = useCallback(() => {
    setMatrixInputs(prev => {
      const next: string[][] = [];
      for (let i = 0; i < numAlternatives; i++) {
        const row: string[] = [];
        for (let j = 0; j < numCriteria; j++) {
          row.push(prev[i]?.[j] || '');
        }
        next.push(row);
      }
      return next;
    });
  }, [numAlternatives, numCriteria]);

  const initWeights = useCallback(() => {
    if (directWeights.length !== numCriteria) {
      setDirectWeights(Array(numCriteria).fill(+(1 / numCriteria).toFixed(4)));
    }
    if (rankValues.length !== numCriteria) {
      setRankValues(Array.from({ length: numCriteria }, (_, i) => i + 1));
    }
  }, [numCriteria, directWeights.length, rankValues.length]);

  // Validation per step
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 0) {
      alternativeNames.slice(0, numAlternatives).forEach((n, i) => {
        if (!n.trim()) errs[`alt_${i}`] = 'Name required';
      });
      criteria.slice(0, numCriteria).forEach((c, i) => {
        if (!c.name.trim()) errs[`crit_${i}`] = 'Name required';
        if (c.hasLinguisticScale && c.linguisticScale.length < 2)
          errs[`crit_${i}`] = 'Need at least 2 scale entries';
      });
    }

    if (s === 1) {
      for (let i = 0; i < numAlternatives; i++) {
        for (let j = 0; j < numCriteria; j++) {
          const val = matrixInputs[i]?.[j];
          if (!val && val !== '0') errs[`cell_${i}_${j}`] = 'Required';
          else if (isNaN(rawMatrix[i][j])) errs[`cell_${i}_${j}`] = 'Invalid';
        }
      }
    }

    if (s === 2) {
      if (weightMethod === 'direct') {
        const sum = directWeights.reduce((a, b) => a + b, 0);
        if (directWeights.some(w => w < 0)) errs.weights = 'Weights must be non-negative';
        if (sum === 0) errs.weights = 'Weights cannot all be zero';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const computeStep = (s: number) => {
    if (s === 3) {
      // Check zero columns
      const zeroCols = checkZeroColumns(rawMatrix);
      if (zeroCols.length > 0) {
        setErrors({ general: `Column(s) ${zeroCols.map(c => criteria[c]?.name).join(', ')} are all zeros — cannot normalize.` });
        return false;
      }
      const result = normalize(rawMatrix);
      setComputedNorm(result);
    }
    if (s === 4) {
      setComputedWeighted(applyWeights(computedNorm!.normalized, weights));
    }
    if (s === 5) {
      const types = criteria.slice(0, numCriteria).map(c => c.type);
      setComputedIdeal(idealSolutions(computedWeighted!, types));
    }
    if (s === 6) {
      setComputedSep(separationDistances(computedWeighted!, computedIdeal!.idealBest, computedIdeal!.idealWorst));
    }
    if (s === 7) {
      const sc = topsisScore(computedSep!.sPlus, computedSep!.sMinus);
      setComputedScores(sc);
      setComputedRanks(rankDescending(sc));
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(step)) return;

    // Init next step data
    if (step === 0) initMatrix();
    if (step === 1) initWeights();

    // Compute results for display steps
    if (step >= 2) {
      if (!computeStep(step + 1)) return;
    }

    const next = step + 1;
    setStep(next);
    setMaxStep(m => Math.max(m, next));
    setErrors({});
  };

  const goBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleExport = () => {
    if (!computedNorm || !computedWeighted || !computedIdeal || !computedSep || !computedScores || !computedRanks) return;
    exportToExcel({
      alternatives: alternativeNames.slice(0, numAlternatives),
      criteria: criteria.slice(0, numCriteria).map(c => ({
        name: c.name,
        type: c.type,
        hasLinguisticScale: c.hasLinguisticScale,
        linguisticScale: c.linguisticScale,
      })),
      weights,
      rawMatrix,
      normalizedMatrix: computedNorm.normalized,
      norms: computedNorm.norms,
      weightedMatrix: computedWeighted,
      idealBest: computedIdeal.idealBest,
      idealWorst: computedIdeal.idealWorst,
      sPlus: computedSep.sPlus,
      sMinus: computedSep.sMinus,
      scores: computedScores,
      ranks: computedRanks,
    });
  };

  const alts = alternativeNames.slice(0, numAlternatives);
  const crits = criteria.slice(0, numCriteria);
  const critNames = crits.map(c => c.name);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar stepper */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground p-6 gap-1 shrink-0">
        <h1 className="text-xl font-bold mb-6">TOPSIS Tool</h1>
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={i}
              disabled={i > maxStep}
              onClick={() => { if (i <= maxStep) { setStep(i); setErrors({}); } }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/20 shadow-sm'
                  : isDone
                    ? 'opacity-80 hover:bg-white/10'
                    : 'opacity-40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={18} />
              ) : (
                <Icon size={18} />
              )}
              <span>{s.label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto" />}
            </button>
          );
        })}

        {/* Export button visible after step 4 */}
        {maxStep >= 4 && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-auto"
            onClick={handleExport}
          >
            <Download size={16} className="mr-1" /> Export Excel
          </Button>
        )}
      </aside>

      {/* Mobile top stepper */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={i}
            disabled={i > maxStep}
            onClick={() => { if (i <= maxStep) { setStep(i); setErrors({}); } }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium shrink-0 ${
              i === step ? 'bg-white/20' : i < step ? 'opacity-70' : 'opacity-40'
            }`}
          >
            {i < step ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
            {s.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 md:pt-8 mt-12 md:mt-0 max-w-5xl mx-auto w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Step {step + 1}: {STEPS[step].label}
          </h2>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {step === 0 && (
          <Step1Setup
            numAlternatives={numAlternatives} numCriteria={numCriteria}
            alternativeNames={alternativeNames} criteria={criteria}
            weightMethod={weightMethod}
            onUpdate={d => {
              setNumAlternatives(d.numAlternatives);
              setNumCriteria(d.numCriteria);
              setAlternativeNames(d.alternativeNames);
              setCriteria(d.criteria);
              setWeightMethod(d.weightMethod);
            }}
            errors={errors}
          />
        )}

        {step === 1 && (
          <Step2Matrix
            alternatives={alts} criteria={crits}
            matrixInputs={matrixInputs}
            onUpdateCell={(i, j, val) => {
              setMatrixInputs(prev => {
                const next = prev.map(r => [...r]);
                if (!next[i]) next[i] = [];
                next[i][j] = val;
                return next;
              });
            }}
            rawMatrix={rawMatrix}
            errors={errors}
          />
        )}

        {step === 2 && (
          <Step3Weights
            criteria={crits} weightMethod={weightMethod}
            directWeights={directWeights} ranks={rankValues}
            weights={weights}
            onUpdateDirectWeight={(i, val) => {
              setDirectWeights(prev => { const n = [...prev]; n[i] = val; return n; });
            }}
            onNormalize={() => setDirectWeights(normalizeWeights(directWeights))}
            onSwapRanks={(a, b) => {
              setRankValues(prev => {
                const n = [...prev];
                [n[a], n[b]] = [n[b], n[a]];
                return n;
              });
            }}
            errors={errors}
          />
        )}

        {step === 3 && computedNorm && (
          <Step4Normalized
            alternatives={alts} criteriaNames={critNames}
            normalizedMatrix={computedNorm.normalized} norms={computedNorm.norms}
          />
        )}

        {step === 4 && computedWeighted && (
          <Step5Weighted
            alternatives={alts} criteriaNames={critNames}
            weightedMatrix={computedWeighted}
          />
        )}

        {step === 5 && computedIdeal && (
          <Step6Ideal
            criteriaNames={critNames}
            types={crits.map(c => c.type)}
            idealBest={computedIdeal.idealBest}
            idealWorst={computedIdeal.idealWorst}
          />
        )}

        {step === 6 && computedSep && (
          <Step7Separation
            alternatives={alts}
            sPlus={computedSep.sPlus}
            sMinus={computedSep.sMinus}
          />
        )}

        {step === 7 && computedScores && computedRanks && computedSep && (
          <Step8Ranking
            alternatives={alts}
            sPlus={computedSep.sPlus}
            sMinus={computedSep.sMinus}
            scores={computedScores}
            ranks={computedRanks}
            onExport={handleExport}
          />
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={goBack} disabled={step === 0}>
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
          {step < STEPS.length - 1 && (
            <Button onClick={goNext}>
              {step >= 2 ? 'Calculate & Next' : 'Next'} <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
