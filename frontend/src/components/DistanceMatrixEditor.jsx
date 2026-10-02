import React, { useState } from 'react';
import { Table, ListFilter, Plus, Trash2, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function DistanceMatrixEditor({
  locations,
  distanceMatrix,
  onUpdateMatrix,
  onAddLocation,
  onRemoveLocation,
  onResetToSample
}) {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'pairwise'
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('General');
  const [newLocCapacity, setNewLocCapacity] = useState(400);
  const [isAdding, setIsAdding] = useState(false);
  const [validationError, setValidationError] = useState('');

  const n = locations.length;

  const handleCellChange = (row, col, value) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setValidationError('Distance must be a valid number.');
    } else if (num <= 0 && row !== col) {
      setValidationError('Distance between different locations must be greater than 0 km.');
    } else {
      setValidationError('');
    }

    const updated = distanceMatrix.map(r => [...r]);
    const cleanVal = isNaN(num) ? 0 : Math.max(0, num);
    updated[row][col] = cleanVal;
    updated[col][row] = cleanVal; // Maintain symmetry

    onUpdateMatrix(updated);
  };

  const handleAddLocationSubmit = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) {
      setValidationError('Please enter a location name.');
      return;
    }
    const exists = locations.some(loc => loc.name.toLowerCase() === newLocName.trim().toLowerCase());
    if (exists) {
      setValidationError(`Location "${newLocName.trim()}" already exists. Location names must be unique.`);
      return;
    }

    onAddLocation({
      name: newLocName.trim(),
      binType: newLocType,
      wasteCapacityKg: parseInt(newLocCapacity, 10) || 400
    });

    setNewLocName('');
    setIsAdding(false);
    setValidationError('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header with Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Road Distance Configuration
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure symmetric road travel distances (km) between all municipal nodes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                viewMode === 'matrix' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Matrix View</span>
            </button>
            <button
              onClick={() => setViewMode('pairwise')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                viewMode === 'pairwise' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Pairwise List</span>
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl transition shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Point</span>
          </button>

          <button
            onClick={onResetToSample}
            title="Reset to 6-node sample dataset"
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Location Form Dropdown */}
      {isAdding && (
        <form onSubmit={handleAddLocationSubmit} className="mt-4 p-4 bg-slate-950/70 border border-emerald-900/50 rounded-xl flex flex-wrap items-end gap-3 animate-fadeIn">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Location Name</label>
            <input
              type="text"
              placeholder="e.g. Point F or Market West"
              value={newLocName}
              onChange={(e) => setNewLocName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          <div className="w-36">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Bin Type</label>
            <select
              value={newLocType}
              onChange={(e) => setNewLocType(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Organic">Organic</option>
              <option value="Recyclable">Recyclable</option>
              <option value="Commercial">Commercial</option>
              <option value="General">General</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          <div className="w-28">
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Waste (kg)</label>
            <input
              type="number"
              min="50"
              max="2000"
              value={newLocCapacity}
              onChange={(e) => setNewLocCapacity(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Confirm Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Validation alert */}
      {validationError && (
        <div className="mt-3 p-3 bg-red-950/60 border border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Mode 1: Distance Matrix Grid View */}
      {viewMode === 'matrix' ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-xs font-semibold text-slate-400 bg-slate-950/50 border border-slate-800 rounded-tl-xl">
                  Origin \ Dest
                </th>
                {locations.map((loc, idx) => (
                  <th
                    key={loc.id || idx}
                    className={`p-2 text-xs font-bold border border-slate-800 ${
                      idx === 0 ? 'text-amber-400 bg-amber-950/30' : 'text-slate-200 bg-slate-950/40'
                    }`}
                  >
                    <div className="truncate max-w-[90px] mx-auto" title={loc.name}>
                      {loc.code || loc.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations.map((rowLoc, rowIdx) => (
                <tr key={rowLoc.id || rowIdx} className="hover:bg-slate-800/30 transition">
                  <td className={`p-2 text-xs font-bold text-left border border-slate-800 ${
                    rowIdx === 0 ? 'text-amber-400 bg-amber-950/20' : 'text-slate-300 bg-slate-950/30'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate max-w-[120px]" title={rowLoc.name}>
                        {rowLoc.name}
                      </span>
                      {rowIdx > 0 && locations.length > 3 && (
                        <button
                          onClick={() => onRemoveLocation(rowIdx)}
                          title={`Remove ${rowLoc.name}`}
                          className="opacity-40 hover:opacity-100 text-red-400 p-0.5 rounded transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>

                  {locations.map((colLoc, colIdx) => {
                    const isDiagonal = rowIdx === colIdx;
                    const val = distanceMatrix[rowIdx] ? distanceMatrix[rowIdx][colIdx] : 0;

                    return (
                      <td
                        key={colLoc.id || colIdx}
                        className={`p-1 border border-slate-800/80 ${
                          isDiagonal ? 'bg-slate-950/80 text-slate-600' : 'bg-slate-900/50'
                        }`}
                      >
                        {isDiagonal ? (
                          <span className="text-xs text-slate-600 font-mono">0</span>
                        ) : (
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={val}
                            onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                            className="w-14 text-center py-1 bg-slate-950/70 border border-slate-800 rounded font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500 focus:bg-slate-900"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-500 mt-2 text-right">
            * Diagonal elements are fixed at 0. Distance matrix is automatically kept symmetric: dist(A, B) = dist(B, A).
          </p>
        </div>
      ) : (
        /* Mode 2: Pairwise List View */
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {locations.map((rowLoc, i) =>
            locations.slice(i + 1).map((colLoc, offset) => {
              const j = i + 1 + offset;
              const dist = distanceMatrix[i] ? distanceMatrix[i][j] : 0;

              return (
                <div
                  key={`${i}-${j}`}
                  className="flex items-center justify-between p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl hover:border-slate-700 transition"
                >
                  <div className="text-xs">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className={i === 0 ? 'text-amber-400' : 'text-sky-300'}>{rowLoc.name}</span>
                      <span className="text-slate-500">↔</span>
                      <span className={j === 0 ? 'text-amber-400' : 'text-sky-300'}>{colLoc.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Road travel</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      value={dist}
                      onChange={(e) => handleCellChange(i, j, e.target.value)}
                      className="w-14 text-right px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-400">km</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
