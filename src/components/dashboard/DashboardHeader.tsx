import React, { useRef } from 'react';
import { DatasetType } from '../../types/spatial';
import { DuckDBStatus } from '../../services/duckdb/duckdb-service';
import {
  Layers,
  Database,
  Terminal,
  Upload,
  Globe,
  Activity,
  Award,
  Zap,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardHeaderProps {
  currentTab: 'map_dashboard' | 'benchmark' | 'c4_docs';
  onTabChange: (tab: 'map_dashboard' | 'benchmark' | 'c4_docs') => void;
  dataset: DatasetType;
  onDatasetChange: (dataset: DatasetType) => void;
  status: DuckDBStatus;
  statusMessage?: string;
  onOpenSqlModal: () => void;
  onUploadParquet: (file: File) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentTab,
  onTabChange,
  dataset,
  onDatasetChange,
  status,
  statusMessage,
  onOpenSqlModal,
  onUploadParquet
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadParquet(e.target.files[0]);
    }
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-4 select-none z-30">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-base font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">
                🦆
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white tracking-wide">GeoDuck</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                OLAP Wasm
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              In-Browser Spatial Parquet Analytics
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden md:block" />

        {/* Dataset Selector Dropdown */}
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={dataset}
            onChange={e => onDatasetChange(e.target.value as DatasetType)}
            className="bg-slate-950 text-xs font-medium text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="nyc_mobility">NYC Taxi Trips (Parquet)</option>
            <option value="sf_mobility">SF Micromobility (Parquet)</option>
            <option value="global_seismic">Global Seismic Events (Parquet)</option>
          </select>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onTabChange('map_dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'map_dashboard'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Spatial Map & Deck.gl</span>
        </button>

        <button
          onClick={() => onTabChange('benchmark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'benchmark'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Multi-Engine Benchmark</span>
        </button>

        <button
          onClick={() => onTabChange('c4_docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'c4_docs'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>C4 Architecture (L1-L4)</span>
        </button>
      </nav>

      {/* Action Controls & Worker Status */}
      <div className="flex items-center gap-2">
        {/* Hidden file input for Parquet upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".parquet,.geoparquet,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Upload local .parquet or .geoparquet file to DuckDB VFS"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Upload Parquet</span>
        </button>

        <button
          onClick={onOpenSqlModal}
          title="Inspect DuckDB SQL query execution plan"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">DuckDB SQL</span>
        </button>

        {/* Worker Telemetry Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'ready'
                ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                : status === 'executing_query'
                ? 'bg-cyan-400 animate-ping'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 hidden md:inline">DuckDB-Wasm</span>
        </div>
      </div>
    </header>
  );
};
