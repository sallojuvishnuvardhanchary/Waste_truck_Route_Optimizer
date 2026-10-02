import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Truck, RefreshCw, ZoomIn, ZoomOut, Compass } from 'lucide-react';

/**
 * Interactive HTML5 Canvas Graph Visualizer for Smart City Route Optimization
 */
export default function GraphCanvas({
  locations = [],
  distanceMatrix = [],
  optimalRoute = null,
  activeStep = null, // From step-by-step simulator
  height = 520,
  showControls = true,
  onNodeDrag = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Display toggles
  const [showAllEdges, setShowAllEdges] = useState(true);
  const [showDistances, setShowDistances] = useState(true);
  const [animateTruck, setAnimateTruck] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggingNodeIndex, setDraggingNodeIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Truck animation progress along optimal route (0 to 1)
  const truckProgressRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Compute tour edge list from route indices
  const optimalEdges = React.useMemo(() => {
    if (!optimalRoute || optimalRoute.length < 2) return [];
    const edges = [];
    for (let i = 0; i < optimalRoute.length - 1; i++) {
      edges.push({
        from: optimalRoute[i],
        to: optimalRoute[i + 1],
        key: `${optimalRoute[i]}-${optimalRoute[i + 1]}`
      });
    }
    return edges;
  }, [optimalRoute]);

  // Main canvas draw loop
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.save();
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // 1. Clear background
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, width, h);

    // Draw subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const n = locations.length;
    if (n === 0) {
      ctx.restore();
      return;
    }

    // Set of optimal edge pairs for quick lookup
    const optimalEdgeSet = new Set();
    optimalEdges.forEach(e => {
      optimalEdgeSet.add(`${e.from}-${e.to}`);
      optimalEdgeSet.add(`${e.to}-${e.from}`);
    });

    // 2. Draw standard roads (background network)
    if (showAllEdges) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const isOptimal = optimalEdgeSet.has(`${i}-${j}`);
          if (!isOptimal) {
            const p1 = locations[i];
            const p2 = locations[j];
            if (!p1 || !p2) continue;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw road distance tag if enabled
            if (showDistances && distanceMatrix[i] && distanceMatrix[i][j] !== undefined) {
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              const dist = distanceMatrix[i][j];

              ctx.font = '10px Inter, system-ui, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
              ctx.fillText(`${dist}km`, mx, my);
            }
          }
        }
      }
    }

    // 3. Draw active simulation state (if in Step Simulation mode)
    if (activeStep) {
      // Draw partial path in green
      if (activeStep.path && activeStep.path.length > 1) {
        ctx.beginPath();
        for (let k = 0; k < activeStep.path.length; k++) {
          const nodeIdx = activeStep.path[k];
          const pt = locations[nodeIdx];
          if (pt) {
            if (k === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = '#10b981'; // Green for active partial tour
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Draw candidate branch being evaluated
      if (activeStep.candidateNode !== null && activeStep.currentNode !== null) {
        const fromPt = locations[activeStep.currentNode];
        const toPt = locations[activeStep.candidateNode];
        if (fromPt && toPt) {
          ctx.beginPath();
          ctx.moveTo(fromPt.x, fromPt.y);
          ctx.lineTo(toPt.x, toPt.y);
          if (activeStep.decision === 'PRUNE') {
            ctx.strokeStyle = '#ef4444'; // Red for pruned branch
            ctx.lineWidth = 3.5;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
            // Draw pruning cross
            const mx = (fromPt.x + toPt.x) / 2;
            const my = (fromPt.y + toPt.y) / 2;
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('✖ PRUNED', mx, my - 10);
          } else {
            ctx.strokeStyle = '#38bdf8'; // Cyan for exploring
            ctx.lineWidth = 3.5;
            ctx.stroke();
          }
        }
      }
    }

    // 4. Draw optimal route (if calculated and not actively overwritten by step sim)
    if (optimalEdges.length > 0 && !activeStep) {
      // Glow underlay
      ctx.beginPath();
      optimalEdges.forEach((edge, idx) => {
        const p1 = locations[edge.from];
        const p2 = locations[edge.to];
        if (!p1 || !p2) return;
        if (idx === 0) ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Sharp primary route line
      ctx.beginPath();
      optimalEdges.forEach((edge, idx) => {
        const p1 = locations[edge.from];
        const p2 = locations[edge.to];
        if (!p1 || !p2) return;
        if (idx === 0) ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Directional arrows & distance labels along the optimal route
      optimalEdges.forEach((edge, idx) => {
        const p1 = locations[edge.from];
        const p2 = locations[edge.to];
        if (!p1 || !p2) return;

        // Draw directional arrow midway
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        drawArrowHead(ctx, mx, my, angle, '#10b981');

        // Distance label along optimal route
        if (distanceMatrix[edge.from] && distanceMatrix[edge.from][edge.to] !== undefined) {
          const dist = distanceMatrix[edge.from][edge.to];
          const badgeX = mx + Math.cos(angle + Math.PI / 2) * 14;
          const badgeY = my + Math.sin(angle + Math.PI / 2) * 14;

          // Draw pill background
          ctx.fillStyle = '#064e3b';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          const label = `${dist} km (#${idx + 1})`;
          ctx.font = 'bold 11px Inter, sans-serif';
          const textWidth = ctx.measureText(label).width;

          ctx.beginPath();
          ctx.roundRect(badgeX - textWidth / 2 - 5, badgeY - 8, textWidth + 10, 16, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#a7f3d0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, badgeX, badgeY);
        }
      });

      // 5. Draw animated Garbage Truck moving along optimal route
      if (animateTruck && optimalEdges.length > 0) {
        drawAnimatedTruck(ctx, locations, optimalEdges, truckProgressRef.current);
      }
    }

    // 6. Draw location nodes
    locations.forEach((loc, idx) => {
      const isOffice = idx === 0 || loc.isOffice;
      const isHovered = hoveredNode === idx;
      const isDragging = draggingNodeIndex === idx;

      // Pulse ring for office
      if (isOffice) {
        const time = Date.now() / 600;
        const pulse = 4 * Math.sin(time);
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, 28 + pulse, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Outer glow for hovered/selected
      if (isHovered || isDragging) {
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, 26, 0, 2 * Math.PI);
        ctx.fillStyle = isOffice ? 'rgba(234, 179, 8, 0.25)' : 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
      }

      // Node base circle
      ctx.beginPath();
      ctx.arc(loc.x, loc.y, isOffice ? 22 : 18, 0, 2 * Math.PI);
      ctx.fillStyle = isOffice ? '#ca8a04' : '#0284c7';
      ctx.fill();
      ctx.strokeStyle = isOffice ? '#fef08a' : '#bae6fd';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      // Node label inside
      ctx.fillStyle = '#ffffff';
      ctx.font = isOffice ? 'bold 12px Inter, sans-serif' : 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isOffice ? 'HQ' : (loc.code || loc.name.slice(0, 2)), loc.x, loc.y);

      // Node title text below
      ctx.font = '600 12px Inter, sans-serif';
      ctx.fillStyle = isOffice ? '#fde047' : '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(loc.name, loc.x, loc.y + (isOffice ? 36 : 30));

      // Node capacity or role below title
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const subtitle = isOffice ? 'Municipal Office (Start)' : `${loc.wasteCapacityKg || 400} kg • ${loc.binType || 'Bin'}`;
      ctx.fillText(subtitle, loc.x, loc.y + (isOffice ? 49 : 43));
    });

    ctx.restore();
  }, [
    locations,
    distanceMatrix,
    optimalEdges,
    activeStep,
    showAllEdges,
    showDistances,
    animateTruck,
    hoveredNode,
    draggingNodeIndex
  ]);

  // Truck animation loop
  useEffect(() => {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (animateTruck && optimalEdges.length > 0) {
        // Full loop takes ~ 8 seconds
        truckProgressRef.current = (truckProgressRef.current + dt * 0.12) % 1.0;
      }
      drawGraph();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [drawGraph, animateTruck, optimalEdges.length]);

  // Setup canvas high-DPI scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width || 800;

    canvas.width = w * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${height}px`;

    drawGraph();
  }, [height, drawGraph]);

  // Mouse drag and hover interaction
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicked inside any node
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const dist = Math.hypot(loc.x - mouseX, loc.y - mouseY);
      if (dist <= 26) {
        setDraggingNodeIndex(i);
        setDragOffset({ x: loc.x - mouseX, y: loc.y - mouseY });
        return;
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggingNodeIndex !== null) {
      // Reposition node
      const newX = Math.max(40, Math.min(canvas.width / (window.devicePixelRatio || 1) - 40, mouseX + dragOffset.x));
      const newY = Math.max(40, Math.min(canvas.height / (window.devicePixelRatio || 1) - 40, mouseY + dragOffset.y));

      locations[draggingNodeIndex].x = Math.round(newX);
      locations[draggingNodeIndex].y = Math.round(newY);
      if (onNodeDrag) onNodeDrag(draggingNodeIndex, newX, newY);
      drawGraph();
      return;
    }

    // Check hover
    let found = null;
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const dist = Math.hypot(loc.x - mouseX, loc.y - mouseY);
      if (dist <= 26) {
        found = i;
        break;
      }
    }
    setHoveredNode(found);
  };

  const handleMouseUp = () => {
    setDraggingNodeIndex(null);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900/90 shadow-2xl" ref={containerRef}>
      {showControls && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 pointer-events-auto shadow-md">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              City Ward Graph Canvas
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{locations.length} Locations</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-slate-700 pointer-events-auto shadow-md">
            <button
              onClick={() => setShowAllEdges(!showAllEdges)}
              title={showAllEdges ? "Hide non-optimal roads" : "Show all roads"}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                showAllEdges ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              {showAllEdges ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>All Roads</span>
            </button>

            <button
              onClick={() => setShowDistances(!showDistances)}
              title="Toggle distance labels on roads"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                showDistances ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Distances</span>
            </button>

            <button
              onClick={() => setAnimateTruck(!animateTruck)}
              title="Toggle moving vehicle animation"
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition ${
                animateTruck ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Truck Sim</span>
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full block cursor-grab active:cursor-grabbing"
      />

      <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-4 text-[11px] text-slate-400 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-200"></span> Municipal Office (HQ)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-200"></span> Collection Point
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-emerald-500 rounded"></span> Optimal Route
        </span>
        <span className="text-slate-500">💡 Drag nodes to rearrange visually</span>
      </div>
    </div>
  );
}

/**
 * Draws arrow on line segment
 */
function drawArrowHead(ctx, x, y, angle, color) {
  const headLen = 9;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(headLen, 0);
  ctx.lineTo(-headLen, -headLen * 0.6);
  ctx.lineTo(-headLen * 0.4, 0);
  ctx.lineTo(-headLen, headLen * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Renders moving garbage truck along optimal route
 */
function drawAnimatedTruck(ctx, locations, edges, progress) {
  const totalEdges = edges.length;
  if (totalEdges === 0) return;

  const scaledProgress = progress * totalEdges;
  const currentEdgeIndex = Math.min(totalEdges - 1, Math.floor(scaledProgress));
  const t = scaledProgress - currentEdgeIndex;

  const edge = edges[currentEdgeIndex];
  const p1 = locations[edge.from];
  const p2 = locations[edge.to];
  if (!p1 || !p2) return;

  const curX = p1.x + (p2.x - p1.x) * t;
  const curY = p1.y + (p2.y - p1.y) * t;
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

  ctx.save();
  ctx.translate(curX, curY);
  ctx.rotate(angle);

  // Truck body (green garbage truck)
  ctx.fillStyle = '#059669';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-14, -7, 28, 14, 3);
  ctx.fill();
  ctx.stroke();

  // Truck cab
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.roundRect(4, -5, 8, 10, 2);
  ctx.fill();

  // Wheels
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-10, -9, 5, 2);
  ctx.fillRect(5, -9, 5, 2);
  ctx.fillRect(-10, 7, 5, 2);
  ctx.fillRect(5, 7, 5, 2);

  ctx.restore();
}
