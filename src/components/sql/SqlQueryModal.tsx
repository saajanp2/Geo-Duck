import React, { useState } from 'react';
import { QueryTelemetry } from '../../types/spatial';
import { duckDBService } from '../../services/duckdb/duckdb-service';
import {
  Code,
  Terminal,
  Play,
  Copy,
  Check,
  Clock,
  Database,
  Layers,
  Sparkles,
  X
} from 'lucide-react';

interface SqlQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: QueryTelemetry | null;
}

export const SqlQueryModal: React.FC<SqlQueryModalProps> = ({
  isOpen,
  onClose,
  telemetry
}) => {
  const [customSql, setCustomSql] = useState(
    telemetry?.sql ||
      `SELECT hour, count(*) as total_events, round(avg(value), 2) as avg_metric, round(max(value), 2) as max_metric\nFROM 'active_dataset.parquet'\nGROUP BY hour\nORDER BY hour;`
  );
  const [queryResults, setQueryResults] = useState<{
    columns: string[];
    rows: any[];
    latencyMs: number;
    error?: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCustomSql = async () => {
    setIsRunning(true);
    try {
      const res = await duckDBService.runCustomSql(customSql);
      setQueryResults(res);
    } catch (err: any) {
      setQueryResults({
        columns: [],
        rows: [],
        latencyMs: 0,
        error: err?.message || String(err)
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 rounded-xl border border-cyan-800">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                DuckDB Spatial SQL Query Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Vectorized OLAP execution against in-memory Parquet file system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* Active Query Telemetry Banner */}
          {telemetry && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Execution Latency</span>
                <span className="text-base font-mono font-bold text-cyan-400">
                  {telemetry.executionTimeMs} ms
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Parquet Rows Scanned</span>
                <span className="text-base font-mono font-bold text-white">
                  {telemetry.rowsScanned.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Rows Returned</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {telemetry.rowsReturned.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Storage Format</span>
                <span className="text-base font-mono font-bold text-purple-400">
                  Columnar Parquet
                </span>
              </div>
            </div>
          )}

          {/* SQL Editor Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" /> Interactive DuckDB SQL Statement
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(customSql)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy SQL'}
                </button>
                <button
                  onClick={executeCustomSql}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-md shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  {isRunning ? 'Running...' : 'Run Query'}
                </button>
              </div>
            </div>

            <textarea
              value={customSql}
              onChange={e => setCustomSql(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed"
            />
          </div>

          {/* Quick Query Templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Quick Templates:</span>
            <button
              onClick={() =>
                setCustomSql(
                  `SELECT hour, count(*) as count, round(avg(value), 2) as avg_val\nFROM 'active_dataset.parquet'\nGROUP BY hour\nORDER BY count DESC;`
                )
              }
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              Hourly Aggregation
            </button>
            <button
              onClick={() =>
                setCustomSql(
                  `SELECT category, count(*) as volume, round(sum(value), 2) as total_val\nFROM 'active_dataset.parquet'\nGROUP BY category\nORDER BY volume DESC;`
                )
              }
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              Category Breakdown
            </button>
            <button
              onClick={() =>
                setCustomSql(
                  `SELECT id, latitude, longitude, value, category\nFROM 'active_dataset.parquet'\nWHERE value > 40\nLIMIT 20;`
                )
              }
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono transition-colors"
            >
              High-Value Outliers
            </button>
          </div>

          {/* Results Table */}
          {queryResults && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">
                  Query Results ({queryResults.rows.length} rows returned in {queryResults.latencyMs} ms)
                </span>
                {queryResults.error && (
                  <span className="text-rose-400 font-mono text-[11px]">{queryResults.error}</span>
                )}
              </div>

              {queryResults.rows.length > 0 && (
                <div className="max-h-48 overflow-auto rounded-xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] sticky top-0 border-b border-slate-800">
                      <tr>
                        {queryResults.columns.map((col, idx) => (
                          <th key={idx} className="py-2 px-3">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono text-[11px] text-slate-300">
                      {queryResults.rows.slice(0, 50).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/50">
                          {queryResults.columns.map((col, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
