import React, { useState } from 'react';
import { C4_LEVELS } from '../../data/c4-data';
import { C4Node, C4LevelData } from '../../types/spatial';
import {
  Layers,
  Cpu,
  Database,
  Globe,
  User,
  Box,
  Code2,
  Copy,
  Check,
  Play,
  Info,
  Maximize2,
  ArrowRight
} from 'lucide-react';

export const C4ArchitectureStudio: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4>(1);
  const [selectedNode, setSelectedNode] = useState<C4Node | null>(null);
  const [activeTab, setActiveTab] = useState<'diagram' | 'plantuml' | 'architecture_notes'>('diagram');
  const [copied, setCopied] = useState(false);
  const [simulatingStep, setSimulatingStep] = useState<number | null>(null);

  const currentLevelData: C4LevelData = C4_LEVELS.find(l => l.level === activeLevel) || C4_LEVELS[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    if (activeLevel !== 4) setActiveLevel(4);
    let step = 1;
    setSimulatingStep(1);
    const interval = setInterval(() => {
      step++;
      if (step > 6) {
        clearInterval(interval);
        setSimulatingStep(null);
      } else {
        setSimulatingStep(step);
      }
    }, 1200);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'person':
        return <User className="w-5 h-5 text-emerald-400" />;
      case 'system':
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 'container':
        return <Box className="w-5 h-5 text-indigo-400" />;
      case 'component':
        return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-purple-400" />;
      case 'external':
        return <Database className="w-5 h-5 text-rose-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeBorder = (type: string) => {
    switch (type) {
      case 'person':
        return 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20';
      case 'system':
        return 'border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/25 shadow-cyan-950/50';
      case 'container':
        return 'border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20 shadow-indigo-950/50';
      case 'component':
        return 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20 shadow-amber-950/50';
      case 'code':
        return 'border-purple-500/40 hover:border-purple-400 bg-purple-950/20 shadow-purple-950/50';
      case 'external':
        return 'border-rose-500/40 hover:border-rose-400 bg-rose-950/20 shadow-rose-950/50';
      default:
        return 'border-slate-700 hover:border-slate-600 bg-slate-900/60';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Level Nav */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 rounded">
              C4 Model Architecture
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{currentLevelData.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{currentLevelData.subtitle}</p>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          {[1, 2, 3, 4].map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setActiveLevel(lvl as 1 | 2 | 3 | 4);
                setSelectedNode(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeLevel === lvl
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Level {lvl}: {lvl === 1 ? 'Context' : lvl === 2 ? 'Container' : lvl === 3 ? 'Component' : 'Code Flow'}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeLevel === 4 && (
            <button
              onClick={runSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-medium transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-purple-300" />
              {simulatingStep ? `Simulating Step ${simulatingStep}/6...` : 'Simulate Query Lifecycle'}
            </button>
          )}

          <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'diagram' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveTab('plantuml')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'plantuml' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C4-PlantUML Code
            </button>
            <button
              onClick={() => setActiveTab('architecture_notes')}
              className={`px-2.5 py-1 text-xs font-medium rounded ${
                activeTab === 'architecture_notes' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Design Notes
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'diagram' && (
          <div className="flex-1 flex flex-col relative overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
            {/* Visual Canvas */}
            <div className="min-w-[950px] min-h-[540px] flex-1 p-8 relative">
              {/* SVG Edge Connectors */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                </defs>

                {currentLevelData.edges.map(edge => {
                  const sourceNode = currentLevelData.nodes.find(n => n.id === edge.source);
                  const targetNode = currentLevelData.nodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const sWidth = sourceNode.width || 200;
                  const sHeight = sourceNode.height || 120;
                  const tWidth = targetNode.width || 200;
                  const tHeight = targetNode.height || 120;

                  const sx = sourceNode.x + sWidth / 2;
                  const sy = sourceNode.y + sHeight / 2;
                  const tx = targetNode.x + tWidth / 2;
                  const ty = targetNode.y + tHeight / 2;

                  const isSimulated =
                    simulatingStep !== null &&
                    activeLevel === 4 &&
                    edge.id === `seq${simulatingStep - 1}`;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sx}
                        y1={sy}
                        x2={tx}
                        y2={ty}
                        stroke={isSimulated ? '#38bdf8' : '#334155'}
                        strokeWidth={isSimulated ? 3 : 1.5}
                        strokeDasharray={isSimulated ? '4 4' : 'none'}
                        markerEnd={isSimulated ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                        className={isSimulated ? 'animate-pulse' : ''}
                      />
                      {edge.label && (
                        <foreignObject
                          x={(sx + tx) / 2 - 100}
                          y={(sy + ty) / 2 - 14}
                          width="200"
                          height="28"
                          className="overflow-visible"
                        >
                          <div className="flex items-center justify-center">
                            <span
                              className={`px-2 py-0.5 text-[10px] rounded-full border shadow-sm backdrop-blur whitespace-nowrap ${
                                isSimulated
                                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 font-semibold'
                                  : 'bg-slate-900/80 text-slate-400 border-slate-700/60'
                              }`}
                            >
                              {edge.label}
                            </span>
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Node Cards */}
              {currentLevelData.nodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isSimActive =
                  simulatingStep !== null &&
                  activeLevel === 4 &&
                  node.id === `step${simulatingStep}`;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      width: `${node.width || 210}px`,
                      height: `${node.height || 130}px`
                    }}
                    className={`absolute z-10 cursor-pointer rounded-xl border p-4 shadow-lg backdrop-blur-sm transition-all duration-200 flex flex-col justify-between ${getNodeBorder(
                      node.type
                    )} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 shadow-cyan-500/20 scale-[1.02]'
                        : ''
                    } ${
                      isSimActive
                        ? 'ring-4 ring-purple-400 shadow-purple-500/50 scale-105 animate-pulse'
                        : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 truncate">
                          {getNodeIcon(node.type)}
                          <span className="text-xs font-bold text-white tracking-wide truncate">
                            {node.name}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40">
                          {node.type}
                        </span>
                      </div>

                      {node.technology && (
                        <div className="text-[11px] font-mono text-cyan-300/90 truncate mb-1">
                          [{node.technology}]
                        </div>
                      )}

                      <p className="text-[11px] text-slate-300 line-clamp-3 leading-snug">
                        {node.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2 mt-2">
                      <span className="hover:text-cyan-300 flex items-center gap-1">
                        Inspect Node <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Status bar */}
            <div className="bg-slate-900/70 border-t border-slate-800/80 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> System Boundary
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Container
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Component
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> Code Step
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> External Storage
                </span>
              </div>
              <div>Click any element to inspect architectural contracts and technical rationale</div>
            </div>
          </div>
        )}

        {activeTab === 'plantuml' && (
          <div className="flex-1 p-6 flex flex-col bg-slate-950 overflow-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  C4-PlantUML Declarative Specification (Level {activeLevel})
                </h3>
                <p className="text-xs text-slate-400">
                  Standard format compliant with the C4 model for automated documentation.
                </p>
              </div>
              <button
                onClick={() => handleCopy(currentLevelData.plantUmlSource)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy PlantUML'}
              </button>
            </div>
            <pre className="flex-1 bg-slate-900 p-4 rounded-xl border border-slate-800 text-cyan-300 font-mono text-xs overflow-auto leading-relaxed">
              {currentLevelData.plantUmlSource}
            </pre>
          </div>
        )}

        {activeTab === 'architecture_notes' && (
          <div className="flex-1 p-8 overflow-auto max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" /> Architectural Rationale & Why DuckDB-Wasm in a Web Worker?
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional geospatial web dashboards send bounding box coordinates to backend PostGIS servers. While standard, this introduces network latency (150ms–800ms) on every camera zoom/pan, server hosting costs, and rate limits.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wide mb-1">
                    Worker Thread Separation
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Parquet decompression and columnar filtering are CPU-intensive. By running DuckDB-Wasm in a Dedicated Web Worker, the main UI thread maintains an uninterrupted 60 FPS for smooth MapLibre camera panning and Deck.gl WebGL rendering.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-1">
                    Visual Loading Indicators
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Querying large Parquet files takes 10ms–80ms. The visual loading HUD (radar sweep, scanning line, and chart pulse skeletons) provides immediate tactile feedback so analysts know spatial queries are executing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Layer Stack & Technology Blueprint
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="font-mono text-xs px-2 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                    Rendering
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">Deck.gl + MapLibre GL JS</h5>
                    <p className="text-xs text-slate-400">
                      WebGL2-accelerated data layers (Scatterplot, Hexagon, Arcs, Heatmap) overlaid on high-contrast CartoDB Dark Matter vector basemaps.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="font-mono text-xs px-2 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded">
                    Compute
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">DuckDB-Wasm (SIMD / MVP)</h5>
                    <p className="text-xs text-slate-400">
                      Vectorized SQL query engine compiled to WebAssembly. Scans Parquet row groups and calculates Haversine spatial distances in microseconds.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="font-mono text-xs px-2 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded">
                    IPC & Memory
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-200">Apache Arrow & Transferables</h5>
                    <p className="text-xs text-slate-400">
                      Zero-copy memory sharing between Web Worker thread and main UI thread, avoiding serialization overhead.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-semibold uppercase text-slate-400">Node Inspector</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  {getNodeIcon(selectedNode.type)}
                  <h4 className="text-sm font-bold text-white">{selectedNode.name}</h4>
                </div>
                <span className="inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700/60 mb-3">
                  {selectedNode.type}
                </span>

                {selectedNode.technology && (
                  <div className="mb-3">
                    <span className="text-[11px] text-slate-400 block font-medium">Technology:</span>
                    <span className="text-xs font-mono text-indigo-300">{selectedNode.technology}</span>
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-[11px] text-slate-400 block font-medium mb-1">Description:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
                </div>

                {selectedNode.details && selectedNode.details.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium mb-1.5">
                      Key Responsibilities & Interfaces:
                    </span>
                    <ul className="space-y-1.5">
                      {selectedNode.details.map((detail, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
              Part of {currentLevelData.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
