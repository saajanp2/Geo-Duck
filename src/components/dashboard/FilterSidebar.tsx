import React, { useEffect, useState } from 'react';
import {
  SpatialFilterState,
  DatasetType
} from '../../types/spatial';
import {
  Sliders,
  Play,
  Pause,
  MapPin,
  Maximize2,
  Search,
  RotateCcw,
  Clock,
  DollarSign,
  Activity,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';

interface FilterSidebarProps {
  filter: SpatialFilterState;
  onFilterChange: (newFilter: SpatialFilterState) => void;
  dataset: DatasetType;
  totalRecordsCount: number;
  filteredCount: number;
  isQuerying: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filter,
  onFilterChange,
  dataset,
  totalRecordsCount,
  filteredCount,
  isQuerying
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Playback timer to animate hours of the day (0 to 23)
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        onFilterChange({
          ...filter,
          hourRange: [
            filter.hourRange[0] >= 23 ? 0 : filter.hourRange[0] + 1,
            filter.hourRange[0] >= 23 ? 1 : filter.hourRange[0] + 2
          ]
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [isPlaying, filter, onFilterChange]);

  const categories =
    dataset === 'nyc_mobility'
      ? ['Credit Card', 'Cash', 'Digital Wallet', 'Corporate Account']
      : dataset === 'sf_mobility'
      ? ['Autonomous Robotaxi', 'Electric Rideshare', 'Shared Scooter', 'Courier Transit']
      : ['Tectonic Subduction', 'Volcanic Tremor', 'Transform Fault', 'Deep Intraplate'];

  const toggleCategory = (cat: string) => {
    const active = filter.categories.includes(cat);
    const updated = active
      ? filter.categories.filter(c => c !== cat)
      : [...filter.categories, cat];
    onFilterChange({ ...filter, categories: updated });
  };

  const resetFilters = () => {
    onFilterChange({
      ...filter,
      hourRange: [0, 23],
      valueRange: dataset === 'global_seismic' ? [2.5, 9.0] : [0, 100],
      categories: [],
      bboxFilterEnabled: false,
      radiusFilterEnabled: false,
      searchQuery: ''
    });
  };

  return (
    <aside className="w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full overflow-y-auto select-none backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">Spatial Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          title="Reset all filters"
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Quick Filter Counts Card */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Parquet Scanned Rows:</span>
            <span className="font-mono text-cyan-400 font-bold">
              {filteredCount.toLocaleString()} / {totalRecordsCount.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${totalRecordsCount > 0 ? (filteredCount / totalRecordsCount) * 100 : 100}%`
              }}
            />
          </div>
          {isQuerying && (
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-cyan-300 animate-pulse font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Recalculating DuckDB query...
            </div>
          )}
        </div>

        {/* Time of Day Slider & Playback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Time of Day (24h)
            </label>
            <span className="font-mono text-cyan-300 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {String(filter.hourRange[0]).padStart(2, '0')}:00 –{' '}
              {String(filter.hourRange[1]).padStart(2, '0')}:00
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="23"
                value={filter.hourRange[0]}
                onChange={e => {
                  const val = Number(e.target.value);
                  onFilterChange({
                    ...filter,
                    hourRange: [val, Math.max(val, filter.hourRange[1])]
                  });
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="23"
                value={filter.hourRange[1]}
                onChange={e => {
                  const val = Number(e.target.value);
                  onFilterChange({
                    ...filter,
                    hourRange: [Math.min(val, filter.hourRange[0]), val]
                  });
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isPlaying
                  ? 'bg-rose-950/60 text-rose-300 border-rose-600/60 shadow-lg shadow-rose-950'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-600/60 hover:bg-cyan-900/60'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause 24h Loop' : 'Play 24h Cycle'}
            </button>
            <span className="text-[10px] text-slate-500 font-mono">Simulates Diurnal Shift</span>
          </div>
        </div>

        {/* Value Range Slider (Fare or Magnitude) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="text-slate-200 font-semibold flex items-center gap-1.5">
              {dataset === 'global_seismic' ? (
                <>
                  <Activity className="w-3.5 h-3.5 text-amber-400" /> Magnitude Threshold
                </>
              ) : (
                <>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Fare Amount ($)
                </>
              )}
            </label>
            <span className="font-mono text-emerald-400 text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              {dataset === 'global_seismic'
                ? `M ${filter.valueRange[0].toFixed(1)} – ${filter.valueRange[1].toFixed(1)}`
                : `$${filter.valueRange[0]} – $${filter.valueRange[1]}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min={dataset === 'global_seismic' ? '2.5' : '0'}
              max={dataset === 'global_seismic' ? '9.0' : '100'}
              step={dataset === 'global_seismic' ? '0.1' : '1'}
              value={filter.valueRange[1]}
              onChange={e => {
                const val = Number(e.target.value);
                onFilterChange({
                  ...filter,
                  valueRange: [filter.valueRange[0], val]
                });
              }}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Spatial Bounding Box Filter Toggle */}
        <div className="space-y-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Filter to Map Viewport</span>
                <span className="text-[10px] text-slate-400">DuckDB BBox SQL clause</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filter.bboxFilterEnabled}
                onChange={e =>
                  onFilterChange({ ...filter, bboxFilterEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          {filter.bboxFilterEnabled && filter.bbox && (
            <div className="mt-2 text-[10px] font-mono text-cyan-300/80 bg-slate-900 p-2 rounded border border-slate-800 leading-relaxed truncate">
              BBox: [{filter.bbox.map(n => n.toFixed(2)).join(', ')}]
            </div>
          )}
        </div>

        {/* Spatial Radius Query Toggle */}
        <div className="space-y-2 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs font-semibold text-white block">Haversine Radius Query</span>
                <span className="text-[10px] text-slate-400">Click map to anchor</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filter.radiusFilterEnabled}
                onChange={e =>
                  onFilterChange({ ...filter, radiusFilterEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {filter.radiusFilterEnabled && (
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Radius:</span>
                <span className="font-mono text-purple-300">{filter.radiusKm} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={filter.radiusKm}
                onChange={e =>
                  onFilterChange({ ...filter, radiusKm: Number(e.target.value) })
                }
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 italic block mt-1">
                Tip: Click anywhere on the map to re-center query
              </span>
            </div>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Category Breakdown
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => {
              const active = filter.categories.length === 0 || filter.categories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    active
                      ? 'bg-indigo-950/70 text-indigo-200 border-indigo-700/60 shadow-sm'
                      : 'bg-slate-950/40 text-slate-500 border-slate-800 line-through opacity-60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" /> Search Label / Route
          </label>
          <input
            type="text"
            value={filter.searchQuery}
            onChange={e => onFilterChange({ ...filter, searchQuery: e.target.value })}
            placeholder="e.g. Midtown, SFO, Japan..."
            className="w-full bg-slate-950 px-3 py-1.5 text-xs text-white rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 font-mono"
          />
        </div>
      </div>
    </aside>
  );
};
