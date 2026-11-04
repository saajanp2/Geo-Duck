import React, { useEffect, useState } from 'react';
import { Cpu, Zap, Activity, Clock } from 'lucide-react';
import { DuckDBStatus } from '../../services/duckdb/duckdb-service';

interface MapLoadingOverlayProps {
  status: DuckDBStatus;
  statusMessage?: string;
  isQuerying: boolean;
  lastExecutionMs?: number;
}

export const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({
  status,
  statusMessage,
  isQuerying,
  lastExecutionMs
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isQuerying) {
      setElapsed(0);
      const start = performance.now();
      timer = setInterval(() => {
        setElapsed(Math.round(performance.now() - start));
      }, 16);
    }
    return () => clearInterval(timer);
  }, [isQuerying]);

  return (
    <>
      {/* Visual Scanning Line across the map when query is active */}
      {isQuerying && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-[0_0_15px_#22d3ee] animate-[scan_1.4s_ease-in-out_infinite]" />
          <style>{`
            @keyframes scan {
              0% { transform: translateY(-10px); }
              100% { transform: translateY(100vh); }
            }
          `}</style>
        </div>
      )}

      {/* Floating Tactical Query HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-2">
        {/* Live Query State Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 pointer-events-auto ${
            isQuerying
              ? 'bg-slate-900/95 border-cyan-500/70 text-cyan-300 shadow-cyan-500/20 ring-1 ring-cyan-500/40'
              : status === 'ready'
              ? 'bg-slate-900/80 border-slate-800 text-slate-300'
              : 'bg-slate-900/90 border-amber-500/50 text-amber-300'
          }`}
        >
          {isQuerying ? (
            <div className="relative flex items-center justify-center w-4 h-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            </div>
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide">
              <span>
                {isQuerying
                  ? 'DuckDB Spatial Query Active'
                  : status === 'ready'
                  ? 'Spatial Index Ready'
                  : 'DuckDB Engine Busy'}
              </span>
              {isQuerying && (
                <span className="font-mono text-[11px] px-1.5 py-0.2 bg-cyan-950/80 text-cyan-300 rounded border border-cyan-800">
                  {elapsed}ms
                </span>
              )}
            </div>
            {statusMessage && (
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[260px]">
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Sonar Radar indicator when running deep spatial scans */}
        {isQuerying && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/90 border border-cyan-500/40 rounded-xl text-slate-200 shadow-lg backdrop-blur-md animate-pulse">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/50 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="text-[11px] leading-tight font-mono text-cyan-200">
              Vectorized Parquet scan in progress...
            </div>
          </div>
        )}

        {/* Telemetry quick badge after query finishes */}
        {!isQuerying && lastExecutionMs !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/70 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono backdrop-blur-sm">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Last query:</span>
            <span className="text-cyan-300 font-semibold">{lastExecutionMs} ms</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">Zero Main-Thread Block</span>
          </div>
        )}
      </div>
    </>
  );
};
