import React, { useState } from 'react';
import { AggregationResult, ChartType, DatasetType } from '../../types/spatial';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
  Clock,
  Sparkles,
  PieChart
} from 'lucide-react';

interface ChartWidgetsProps {
  data: AggregationResult;
  isQuerying: boolean;
  dataset: DatasetType;
}

export const ChartWidgets: React.FC<ChartWidgetsProps> = ({
  data,
  isQuerying,
  dataset
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const { temporal, categories, histogram, kpis } = data;
  const maxTemporal = Math.max(1, ...temporal.map(t => t.count));
  const maxHist = Math.max(1, ...histogram.map(h => h.count));

  // Metric labels
  const metricLabel = dataset === 'global_seismic' ? 'Magnitude' : 'Fare ($)';
  const metricUnit = dataset === 'global_seismic' ? 'M' : '$';

  return (
    <div className="h-72 bg-slate-900/95 border-t border-slate-800 flex flex-col select-none backdrop-blur-md">
      {/* Top KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/40 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Parquet Rows</span>
            <span className="font-bold text-white font-mono text-sm">
              {kpis.totalRecords.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Filtered Active</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {kpis.filteredRecords.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Mean {metricLabel}</span>
            <span className="font-bold text-amber-300 font-mono text-sm">
              {metricUnit} {kpis.avgValue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Max {metricLabel}</span>
            <span className="font-bold text-purple-300 font-mono text-sm">
              {metricUnit} {kpis.maxValue}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">DuckDB Scan Latency</span>
            <div className="flex items-center gap-1.5 font-bold text-rose-300 font-mono text-sm">
              <span>{kpis.queryTimeMs} ms</span>
              {isQuerying && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-slate-800/80 overflow-hidden">
        {/* Chart 1: Temporal Distribution */}
        <div className="relative p-4 flex flex-col justify-between overflow-hidden">
          {/* Skeleton Pulse Overlay during query execution */}
          {isQuerying && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 animate-pulse">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-mono text-cyan-300">Recalculating Temporal Bins...</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200">Temporal Distribution (0-23h)</h4>
            </div>

            {/* Chart Type Toggler */}
            <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setChartType('bar')}
                className={`px-2 py-0.5 rounded ${
                  chartType === 'bar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2 py-0.5 rounded ${
                  chartType === 'area' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2 py-0.5 rounded ${
                  chartType === 'line' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Line
              </button>
            </div>
          </div>

          {/* SVG Visualizer */}
          <div className="flex-1 w-full h-full min-h-[110px] relative flex items-end">
            {chartType === 'bar' ? (
              <div className="w-full h-full flex items-end gap-1 pt-4 pb-1">
                {temporal.map(t => {
                  const heightPercent = maxTemporal > 0 ? (t.count / maxTemporal) * 100 : 0;
                  return (
                    <div
                      key={t.hour}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      <div
                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm transition-all duration-300 hover:brightness-125"
                        style={{ height: `${Math.max(4, heightPercent)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 pointer-events-none whitespace-nowrap z-30 transition-opacity">
                        {t.hour}:00: {t.count} ({metricUnit}{t.avgValue})
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 240 80">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area path */}
                {chartType === 'area' && (
                  <path
                    d={`M 0,80 ${temporal
                      .map((t, idx) => {
                        const x = (idx / 23) * 240;
                        const y = 80 - (maxTemporal > 0 ? (t.count / maxTemporal) * 70 : 0);
                        return `L ${x},${y}`;
                      })
                      .join(' ')} L 240,80 Z`}
                    fill="url(#areaGradient)"
                  />
                )}
                {/* Line path */}
                <path
                  d={`M 0,${80 - (maxTemporal > 0 ? (temporal[0]?.count / maxTemporal) * 70 : 0)} ${temporal
                    .map((t, idx) => {
                      const x = (idx / 23) * 240;
                      const y = 80 - (maxTemporal > 0 ? (t.count / maxTemporal) * 70 : 0);
                      return `L ${x},${y}`;
                    })
                    .join(' ')}`}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-1 mt-1">
            <span>00:00 (Midnight)</span>
            <span>12:00 (Noon)</span>
            <span>23:00 (Night)</span>
          </div>
        </div>

        {/* Chart 2: Metric Histogram Distribution */}
        <div className="relative p-4 flex flex-col justify-between overflow-hidden">
          {/* Skeleton Overlay */}
          {isQuerying && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 animate-pulse">
              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-mono text-emerald-300">Computing Parquet Histogram...</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">{metricLabel} Value Frequency</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">12 Bins</span>
          </div>

          <div className="flex-1 w-full h-full min-h-[110px] flex items-end gap-1.5 pt-4 pb-1">
            {histogram.map((bin, idx) => {
              const heightPercent = maxHist > 0 ? (bin.count / maxHist) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all duration-300 hover:brightness-125"
                    style={{ height: `${Math.max(4, heightPercent)}%` }}
                  />
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-300 pointer-events-none whitespace-nowrap z-30 transition-opacity">
                    {metricUnit}{bin.binStart}–{metricUnit}{bin.binEnd}: {bin.count}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-1 mt-1">
            <span>{metricUnit} {histogram[0]?.binStart || 0}</span>
            <span>{metricUnit} {histogram[Math.floor(histogram.length / 2)]?.binStart || 50}</span>
            <span>{metricUnit} {histogram[histogram.length - 1]?.binEnd || 100}</span>
          </div>
        </div>

        {/* Chart 3: Category Share */}
        <div className="relative p-4 flex flex-col justify-between overflow-hidden">
          {/* Skeleton Overlay */}
          {isQuerying && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2 animate-pulse">
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-mono text-indigo-300">Aggregating Category Metrics...</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200">Category Segmentation</h4>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{categories.length} Segments</span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-2.5 py-1">
            {categories.slice(0, 4).map((cat, idx) => {
              const colors = [
                'from-indigo-500 to-indigo-400',
                'from-cyan-500 to-cyan-400',
                'from-amber-500 to-amber-400',
                'from-purple-500 to-purple-400'
              ];
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium truncate max-w-[170px]">
                      {cat.category}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {cat.count.toLocaleString()} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-300`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800/60 pt-1 mt-1">
            <span>Relative proportion of filtered spatial subset</span>
          </div>
        </div>
      </div>
    </div>
  );
};
