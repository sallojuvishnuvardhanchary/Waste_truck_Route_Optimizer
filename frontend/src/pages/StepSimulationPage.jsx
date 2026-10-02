import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  FastForward
} from 'lucide-react';
import GraphCanvas from '../components/GraphCanvas';
import { optimizeWithBranchAndBound } from '../services/api';

export default function StepSimulationPage({
  locations,
  distanceMatrix
}) {
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800); // Step interval in ms
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const timerRef = useRef(null);

  // Fetch simulation steps
  const loadSimulationSteps = async () => {
    setLoading(true);
    setIsPlaying(false);
    try {
      const result = await optimizeWithBranchAndBound(locations, distanceMatrix, true);
      if (result.steps && result.steps.length > 0) {
        setSteps(result.steps);
        setCurrentStepIndex(0);
        setStats({
          optimalDistance: result.optimalDistance,
          nodesExplored: result.nodesExplored,
          branchesPruned: result.branchesPruned,
          totalSteps: result.steps.length
        });
      }
    } catch (err) {
      console.error('Failed to load simulation steps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulationSteps();
  }, [locations, distanceMatrix]);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMs, steps.length]);

  const activeStep = steps[currentStepIndex] || null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-300 mb-2">
            <Zap className="w-3.5 h-3.5" />
            Interactive Branch & Bound Visual Simulation
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Step-by-Step Bounding & Pruning Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch the State-Space Tree unfold in real-time as branches are explored or pruned based on Lower Bound vs Current Best.
          </p>
        </div>

        <button
          onClick={loadSimulationSteps}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reload Simulation</span>
        </button>
      </div>

      {/* Main Simulation Viewport: Canvas + Live Decision Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dynamic Canvas */}
        <div className="lg:col-span-2 space-y-3">
          <GraphCanvas
            locations={locations}
            distanceMatrix={distanceMatrix}
            optimalRoute={null}
            activeStep={activeStep}
            height={480}
            showControls={true}
          />

          {/* Playback Controls Toolbar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
            {/* Playback action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Jump to beginning"
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 rounded-xl border border-slate-800 transition"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex >= steps.length - 1}
                className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 disabled:opacity-40 rounded-xl border border-slate-800 transition"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Step scrubber & indicator */}
            <div className="flex-1 min-w-[200px] flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={Math.max(0, steps.length - 1)}
                value={currentStepIndex}
                onChange={(e) => setCurrentStepIndex(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono text-xs text-emerald-400 whitespace-nowrap font-bold">
                Step {currentStepIndex + 1} / {steps.length}
              </span>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sliders className="w-3.5 h-3.5" />
              <select
                value={speedMs}
                onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="1500">Slow (1.5s)</option>
                <option value="800">Normal (0.8s)</option>
                <option value="400">Fast (0.4s)</option>
                <option value="150">Ultra (0.15s)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Step Decision & Pruning Inspector */}
        <div className="space-y-4">
          {/* Active Step Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Step Analysis #{activeStep ? activeStep.stepNumber : 0}
              </span>

              {activeStep && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  activeStep.decision === 'PRUNE'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : activeStep.decision === 'EXPLORE'
                    ? 'bg-sky-950 text-sky-300 border border-sky-800'
                    : activeStep.decision === 'UPDATE_BEST'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {activeStep.decision === 'PRUNE' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {activeStep.decision === 'EXPLORE' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  {activeStep.decision === 'UPDATE_BEST' && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{activeStep.decision}</span>
                </span>
              )}
            </div>

            {activeStep ? (
              <div className="space-y-3 text-xs">
                {/* Partial Route Sequence */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Current Partial Path:</span>
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono">
                    {activeStep.pathNames.map((name, i) => (
                      <React.Fragment key={i}>
                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                          i === 0 ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-200'
                        }`}>
                          {name}
                        </span>
                        {i < activeStep.pathNames.length - 1 && (
                          <span className="text-slate-600">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Lower Bound vs Current Best Metrics Box */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className={`p-3 rounded-xl border ${
                    activeStep.decision === 'PRUNE'
                      ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}>
                    <span className="text-[10px] text-slate-400 block">Calculated Lower Bound</span>
                    <span className="font-mono text-base font-bold">
                      {activeStep.lowerBound} km
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200">
                    <span className="text-[10px] text-slate-400 block">Current Best Solution</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {activeStep.currentBest === null || activeStep.currentBest === Infinity ? '∞ (None yet)' : `${activeStep.currentBest} km`}
                    </span>
                  </div>
                </div>

                {/* Mathematical Explanation Text */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-slate-300 text-[11px] leading-relaxed">
                  <span className="font-semibold text-white block mb-1">Algorithmic Decision:</span>
                  {activeStep.explanation}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading simulation steps...
              </div>
            )}
          </div>

          {/* Quick Step History Log */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs shadow-xl">
            <span className="font-bold text-white text-xs block mb-2">
              Decision History Log (Jump to any step)
            </span>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIndex(idx);
                  }}
                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition flex items-center justify-between ${
                    idx === currentStepIndex
                      ? 'bg-emerald-950/80 border-emerald-600 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">#{step.stepNumber}</span>
                    <span className="truncate">{step.decision}: {step.candidateNodeName || step.currentNodeName}</span>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    step.decision === 'PRUNE'
                      ? 'bg-rose-950 text-rose-300'
                      : step.decision === 'EXPLORE'
                      ? 'bg-sky-950 text-sky-300'
                      : 'bg-emerald-950 text-emerald-300'
                  }`}>
                    {step.lowerBound} km
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
