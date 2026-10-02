import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Trash2,
  Dices,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Building,
  Info
} from 'lucide-react';
import DistanceMatrixEditor from '../components/DistanceMatrixEditor';
import GraphCanvas from '../components/GraphCanvas';
import {
  SAMPLE_MUNICIPAL_DATASET,
  SAMPLE_4_NODE_DATASET,
  SAMPLE_8_NODE_DATASET,
  generateRandomGraph,
  validateGraph
} from '../data/defaultGraph';

export default function RoutePlanner({
  locations,
  distanceMatrix,
  onUpdateGraph,
  onOptimize,
  isOptimizing,
  currentResult
}) {
  const [selectedPreset, setSelectedPreset] = useState('sample-6');
  const [randomCount, setRandomCount] = useState(6);
  const [validationError, setValidationError] = useState('');

  const n = locations.length;

  // Preset loader
  const handleLoadPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    setValidationError('');

    if (presetKey === 'sample-6') {
      onUpdateGraph(SAMPLE_MUNICIPAL_DATASET.locations, SAMPLE_MUNICIPAL_DATASET.distanceMatrix);
    } else if (presetKey === 'small-4') {
      onUpdateGraph(SAMPLE_4_NODE_DATASET.locations, SAMPLE_4_NODE_DATASET.distanceMatrix);
    } else if (presetKey === 'large-8') {
      onUpdateGraph(SAMPLE_8_NODE_DATASET.locations, SAMPLE_8_NODE_DATASET.distanceMatrix);
    }
  };

  // Generate procedural random graph
  const handleGenerateRandom = () => {
    const randomGraph = generateRandomGraph(randomCount);
    onUpdateGraph(randomGraph.locations, randomGraph.distanceMatrix);
    setValidationError('');
  };

  // Add new location
  const handleAddLocation = (newLocData) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextCode = letters[locations.length - 1] || `${locations.length}`;

    // Place new location in an unoccupied spot
    const newLoc = {
      id: locations.length,
      name: newLocData.name,
      code: nextCode,
      isOffice: false,
      x: Math.round(200 + Math.random() * 450),
      y: Math.round(150 + Math.random() * 300),
      wasteCapacityKg: newLocData.wasteCapacityKg || 400,
      binType: newLocData.binType || 'General'
    };

    const newLocations = [...locations, newLoc];
    const newN = newLocations.length;

    // Expand distance matrix with realistic positive road values
    const newMatrix = Array.from({ length: newN }, () => Array(newN).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        newMatrix[i][j] = distanceMatrix[i][j];
      }
    }

    // Default connections for new node
    for (let i = 0; i < n; i++) {
      const dx = newLoc.x - locations[i].x;
      const dy = newLoc.y - locations[i].y;
      const km = Math.max(3, Math.round(Math.sqrt(dx * dx + dy * dy) / 28));
      newMatrix[i][newN - 1] = km;
      newMatrix[newN - 1][i] = km;
    }

    onUpdateGraph(newLocations, newMatrix);
  };

  // Remove non-office location
  const handleRemoveLocation = (removeIndex) => {
    if (removeIndex === 0) {
      setValidationError('Cannot remove the Municipal Office! It is the mandatory starting and ending depot.');
      return;
    }
    if (locations.length <= 3) {
      setValidationError('A valid garbage collection graph requires at least 1 Municipal Office + 2 collection points.');
      return;
    }

    const newLocations = locations
      .filter((_, idx) => idx !== removeIndex)
      .map((loc, idx) => ({ ...loc, id: idx }));

    const newMatrix = [];
    for (let i = 0; i < locations.length; i++) {
      if (i === removeIndex) continue;
      const newRow = [];
      for (let j = 0; j < locations.length; j++) {
        if (j === removeIndex) continue;
        newRow.push(distanceMatrix[i][j]);
      }
      newMatrix.push(newRow);
    }

    onUpdateGraph(newLocations, newMatrix);
    setValidationError('');
  };

  // Trigger optimization after validation
  const handleCalculateRoute = () => {
    const val = validateGraph(locations, distanceMatrix);
    if (!val.isValid) {
      setValidationError(val.error);
      return;
    }
    setValidationError('');
    onOptimize('branch-and-bound');
  };

  return (
    <div className="space-y-6">
      {/* Header controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Route Planner & Ward Graph Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Specify collection points and road distances. The vehicle starts and finishes at Municipal Office (HQ).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCalculateRoute}
            disabled={isOptimizing}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{isOptimizing ? 'Computing Route...' : 'Generate Optimal Route'}</span>
          </button>
        </div>
      </div>

      {/* Safety warning if n > 9 */}
      {n >= 10 && (
        <div className="p-4 bg-amber-950/50 border border-amber-800/80 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-amber-300">Factorial Complexity Notice</span>
            <span>
              Graph currently has {n} locations. Brute Force would require ({n} - 1)! = {factorial(n - 1).toLocaleString()} route evaluations.
              Branch and Bound will automatically prune large portions of this search space.
            </span>
          </div>
        </div>
      )}

      {/* Validation error display */}
      {validationError && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl flex items-center gap-3 text-xs text-red-300">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Preset & Generator Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preset Selector */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            1. Select Graph Preset
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleLoadPreset('sample-6')}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                selectedPreset === 'sample-6'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold">Sample Benchmark</div>
              <div className="text-[10px] text-slate-500">6 Nodes (Official Matrix)</div>
            </button>

            <button
              onClick={() => handleLoadPreset('small-4')}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                selectedPreset === 'small-4'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold">Small Sector</div>
              <div className="text-[10px] text-slate-500">4 Nodes (Quick Viva)</div>
            </button>

            <button
              onClick={() => handleLoadPreset('large-8')}
              className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                selectedPreset === 'large-8'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold">Metro District</div>
              <div className="text-[10px] text-slate-500">8 Nodes (High Prune)</div>
            </button>
          </div>
        </div>

        {/* Procedural Generator */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            2. Generate Random Test Ward
          </span>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Number of Locations:</span>
                <span className="font-bold text-emerald-400">{randomCount} Nodes</span>
              </div>
              <input
                type="range"
                min="4"
                max="10"
                value={randomCount}
                onChange={(e) => setRandomCount(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleGenerateRandom}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
            >
              <Dices className="w-4 h-4" />
              <span>Generate Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* Distance Matrix Editor Component */}
      <DistanceMatrixEditor
        locations={locations}
        distanceMatrix={distanceMatrix}
        onUpdateMatrix={(updated) => onUpdateGraph(locations, updated)}
        onAddLocation={handleAddLocation}
        onRemoveLocation={handleRemoveLocation}
        onResetToSample={() => handleLoadPreset('sample-6')}
      />

      {/* Graph Visualizer Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-400" />
            Interactive Ward Layout
          </span>
          <span className="text-slate-400">Drag points to customize road positions</span>
        </div>

        <GraphCanvas
          locations={locations}
          distanceMatrix={distanceMatrix}
          optimalRoute={currentResult ? currentResult.routeIndices : null}
          height={420}
        />
      </div>
    </div>
  );
}

function factorial(n) {
  let val = 1;
  for (let i = 2; i <= n; i++) val *= i;
  return val;
}
