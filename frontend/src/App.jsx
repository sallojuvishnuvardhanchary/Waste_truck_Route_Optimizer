import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import AlgorithmComparison from './pages/AlgorithmComparison';
import GraphVisualizationPage from './pages/GraphVisualizationPage';
import StepSimulationPage from './pages/StepSimulationPage';
import AlgorithmExplanation from './pages/AlgorithmExplanation';
import ResultsPage from './pages/ResultsPage';

import { SAMPLE_MUNICIPAL_DATASET } from './data/defaultGraph';
import {
  checkBackendHealth,
  optimizeWithBranchAndBound,
  optimizeWithBruteForce
} from './services/api';

export default function App() {
  const [locations, setLocations] = useState(SAMPLE_MUNICIPAL_DATASET.locations);
  const [distanceMatrix, setDistanceMatrix] = useState(SAMPLE_MUNICIPAL_DATASET.distanceMatrix);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAlgorithm, setActiveAlgorithm] = useState('branch-and-bound');
  const [currentResult, setCurrentResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Probe backend on mount
  useEffect(() => {
    checkBackendHealth().then((isOnline) => setBackendOnline(isOnline));
    const interval = setInterval(() => {
      checkBackendHealth().then((isOnline) => setBackendOnline(isOnline));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Run optimization
  const handleOptimize = useCallback(async (algoToUse = activeAlgorithm) => {
    setIsOptimizing(true);
    try {
      let result;
      if (algoToUse === 'bruteforce') {
        result = await optimizeWithBruteForce(locations, distanceMatrix);
      } else {
        result = await optimizeWithBranchAndBound(locations, distanceMatrix, true);
      }
      setCurrentResult(result);

      // Celebrate optimization complete with subtle confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#06b6d4', '#3b82f6']
        });
      } catch (e) {
        // ignore if confetti fails
      }
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  }, [locations, distanceMatrix, activeAlgorithm]);

  // Optimize default sample on initial load so dashboard is immediately rich with data
  useEffect(() => {
    handleOptimize('branch-and-bound');
  }, []);

  // Graph update handler
  const handleUpdateGraph = (newLocations, newMatrix) => {
    setLocations(newLocations);
    setDistanceMatrix(newMatrix);
    // Recalculate with active algorithm
    setTimeout(() => {
      handleOptimize(activeAlgorithm);
    }, 50);
  };

  const handleResetToSample = () => {
    setLocations(SAMPLE_MUNICIPAL_DATASET.locations);
    setDistanceMatrix(SAMPLE_MUNICIPAL_DATASET.distanceMatrix);
    handleOptimize('branch-and-bound');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        backendOnline={backendOnline}
        activeAlgorithm={activeAlgorithm}
        onAlgorithmChange={(algo) => {
          setActiveAlgorithm(algo);
          handleOptimize(algo);
        }}
        onQuickOptimize={() => handleOptimize(activeAlgorithm)}
        isOptimizing={isOptimizing}
        nodeCount={locations.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          nodeCount={locations.length}
          hasResult={!!currentResult}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              locations={locations}
              distanceMatrix={distanceMatrix}
              activeAlgorithm={activeAlgorithm}
              currentResult={currentResult}
              onAlgorithmChange={setActiveAlgorithm}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              onNavigateTab={setActiveTab}
              onResetToSample={handleResetToSample}
            />
          )}

          {activeTab === 'planner' && (
            <RoutePlanner
              locations={locations}
              distanceMatrix={distanceMatrix}
              onUpdateGraph={handleUpdateGraph}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              currentResult={currentResult}
            />
          )}

          {activeTab === 'comparison' && (
            <AlgorithmComparison
              locations={locations}
              distanceMatrix={distanceMatrix}
              onRunOptimization={handleOptimize}
            />
          )}

          {activeTab === 'graph' && (
            <GraphVisualizationPage
              locations={locations}
              distanceMatrix={distanceMatrix}
              currentResult={currentResult}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              onResetToSample={handleResetToSample}
            />
          )}

          {activeTab === 'simulation' && (
            <StepSimulationPage
              locations={locations}
              distanceMatrix={distanceMatrix}
            />
          )}

          {activeTab === 'education' && (
            <AlgorithmExplanation />
          )}

          {activeTab === 'results' && (
            <ResultsPage
              locations={locations}
              distanceMatrix={distanceMatrix}
              currentResult={currentResult}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart City Garbage Collection Route Optimization System • B.Tech DAA Project</span>
          <span className="font-mono text-slate-400">NP-Hard TSP • Brute Force O((n-1)!) vs Branch & Bound Pruning</span>
        </div>
      </footer>
    </div>
  );
}
