import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Ensure MapLibre GL uses the self-hosted worker script
if (typeof window !== 'undefined') {
  try {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch (err) {
    console.warn('MapLibre worker setup note:', err);
  }
}

import { Deck, ScatterplotLayer, ArcLayer, HexagonLayer, HeatmapLayer } from 'deck.gl';
import { SpatialRecord, DeckLayerType, DatasetType } from '../../types/spatial';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import { DuckDBStatus } from '../../services/duckdb/duckdb-service';
import {
  Layers,
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  Navigation,
  Sliders,
  Flame,
  GitCommit,
  Hexagon,
  CircleDot
} from 'lucide-react';

interface GeospatialMapProps {
  records: SpatialRecord[];
  dataset: DatasetType;
  status: DuckDBStatus;
  statusMessage?: string;
  isQuerying: boolean;
  lastExecutionMs?: number;
  bboxFilterEnabled: boolean;
  onBboxChange: (bbox: [number, number, number, number]) => void;
  radiusFilterEnabled: boolean;
  radiusCenter: [number, number] | null;
  radiusKm: number;
  onRadiusCenterChange: (center: [number, number]) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  records,
  dataset,
  status,
  statusMessage,
  isQuerying,
  lastExecutionMs,
  bboxFilterEnabled,
  onBboxChange,
  radiusFilterEnabled,
  radiusCenter,
  radiusKm,
  onRadiusCenterChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const deckCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const deckRef = useRef<Deck | null>(null);

  const [activeLayer, setActiveLayer] = useState<DeckLayerType>('scatter');
  const [pitch3D, setPitch3D] = useState(false);
  const [hoveredRecord, setHoveredRecord] = useState<{ record: SpatialRecord; x: number; y: number } | null>(null);
  const [pointRadius, setPointRadius] = useState(35);
  const [opacity, setOpacity] = useState(0.85);

  // Set default center based on dataset
  const getDatasetView = (type: DatasetType) => {
    switch (type) {
      case 'nyc_mobility':
        return { center: [-73.9851, 40.7484] as [number, number], zoom: 11.8, pitch: pitch3D ? 45 : 0 };
      case 'sf_mobility':
        return { center: [-122.4194, 37.7749] as [number, number], zoom: 12.2, pitch: pitch3D ? 45 : 0 };
      case 'global_seismic':
        return { center: [130, 20] as [number, number], zoom: 2.2, pitch: pitch3D ? 40 : 0 };
    }
  };

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialView = getDatasetView(dataset);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors, &copy; CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: initialView.center,
      zoom: initialView.zoom,
      pitch: initialView.pitch,
      bearing: pitch3D ? -15 : 0,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

    map.on('error', (err) => {
      console.warn('MapLibre GL non-fatal warning/event:', err);
    });

    map.on('load', () => {
      mapRef.current = map;

      // Initialize Deck.gl
      if (deckCanvasRef.current) {
        const deck = new Deck({
          canvas: deckCanvasRef.current,
          width: '100%',
          height: '100%',
          initialViewState: {
            longitude: map.getCenter().lng,
            latitude: map.getCenter().lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
          },
          controller: false
        });
        deckRef.current = deck;
      }
    });

    // Synchronize MapLibre movements with Deck.gl
    map.on('move', () => {
      if (deckRef.current) {
        deckRef.current.setProps({
          viewState: {
            longitude: map.getCenter().lng,
            latitude: map.getCenter().lat,
            zoom: map.getZoom(),
            pitch: map.getPitch(),
            bearing: map.getBearing()
          }
        });
      }
    });

    // Report bounding box when camera moves
    map.on('moveend', () => {
      const bounds = map.getBounds();
      onBboxChange([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()]);
    });

    // Handle click for radius center
    map.on('click', e => {
      if (radiusFilterEnabled) {
        onRadiusCenterChange([e.lngLat.lng, e.lngLat.lat]);
      }
    });

    return () => {
      map.remove();
      if (deckRef.current) deckRef.current.finalize();
    };
  }, []);

  // Fly to dataset center when dataset changes
  useEffect(() => {
    if (mapRef.current) {
      const view = getDatasetView(dataset);
      mapRef.current.flyTo({
        center: view.center,
        zoom: view.zoom,
        pitch: pitch3D ? 45 : 0,
        essential: true,
        duration: 1600
      });
    }
  }, [dataset]);

  // Handle 3D pitch toggle
  const togglePitch = () => {
    const newPitch = !pitch3D;
    setPitch3D(newPitch);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: newPitch ? 48 : 0,
        bearing: newPitch ? -18 : 0,
        duration: 800
      });
    }
  };

  // Update Deck.gl layers whenever records, layer type, or style settings change
  useEffect(() => {
    if (!deckRef.current) return;

    const layers = [];

    // Helper to get color by value
    const getColor = (val: number): [number, number, number, number] => {
      const a = Math.round(opacity * 255);
      if (dataset === 'global_seismic') {
        if (val > 6.5) return [239, 68, 68, a]; // red
        if (val > 4.5) return [249, 115, 22, a]; // orange
        if (val > 3.5) return [234, 179, 8, a]; // yellow
        return [34, 211, 238, a]; // cyan
      } else {
        // Taxi / mobility fare
        if (val > 50) return [244, 63, 94, a]; // rose
        if (val > 30) return [168, 85, 247, a]; // purple
        if (val > 15) return [56, 189, 248, a]; // sky
        return [52, 211, 153, a]; // emerald
      }
    };

    if (activeLayer === 'scatter') {
      layers.push(
        new ScatterplotLayer({
          id: 'scatter-layer',
          data: records,
          pickable: true,
          opacity: opacity,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 2.5,
          radiusMaxPixels: 24,
          lineWidthMinPixels: 1,
          getPosition: (d: SpatialRecord) => [d.longitude, d.latitude],
          getRadius: (d: SpatialRecord) => {
            if (dataset === 'global_seismic') return Math.max(3000, Math.pow(d.value, 3.2) * 80);
            return Math.max(pointRadius, d.value * 2.5);
          },
          getFillColor: (d: SpatialRecord) => getColor(d.value),
          getLineColor: [255, 255, 255, 80],
          onHover: (info: any) => {
            if (info.object) {
              setHoveredRecord({
                record: info.object as SpatialRecord,
                x: info.x,
                y: info.y
              });
            } else {
              setHoveredRecord(null);
            }
            return false;
          }
        })
      );
    } else if (activeLayer === 'hexagon') {
      layers.push(
        new HexagonLayer({
          id: 'hex-layer',
          data: records,
          pickable: true,
          extruded: pitch3D,
          radius: dataset === 'global_seismic' ? 120000 : 180,
          elevationScale: dataset === 'global_seismic' ? 200 : 25,
          getPosition: (d: SpatialRecord) => [d.longitude, d.latitude],
          opacity: opacity,
          colorRange: [
            [15, 23, 42],
            [30, 58, 138],
            [2, 132, 199],
            [6, 182, 212],
            [244, 63, 94]
          ],
          onHover: (info: any) => {
            if (info.object && info.object.points?.[0]?.source) {
              setHoveredRecord({
                record: info.object.points[0].source as SpatialRecord,
                x: info.x,
                y: info.y
              });
            } else {
              setHoveredRecord(null);
            }
            return false;
          }
        })
      );
    } else if (activeLayer === 'arcs') {
      const arcData = records.filter(r => r.secondary_lat && r.secondary_lon);
      layers.push(
        new ArcLayer({
          id: 'arc-layer',
          data: arcData,
          pickable: true,
          getWidth: 2.5,
          getSourcePosition: (d: SpatialRecord) => [d.longitude, d.latitude],
          getTargetPosition: (d: SpatialRecord) => [d.secondary_lon!, d.secondary_lat!],
          getSourceColor: [34, 211, 238, 220],
          getTargetColor: [244, 63, 94, 220],
          onHover: (info: any) => {
            if (info.object) {
              setHoveredRecord({
                record: info.object as SpatialRecord,
                x: info.x,
                y: info.y
              });
            } else {
              setHoveredRecord(null);
            }
            return false;
          }
        })
      );
    } else if (activeLayer === 'heatmap') {
      layers.push(
        new HeatmapLayer({
          id: 'heat-layer',
          data: records,
          getPosition: (d: SpatialRecord) => [d.longitude, d.latitude],
          getWeight: (d: SpatialRecord) => d.value,
          radiusPixels: 45,
          intensity: 1.2,
          threshold: 0.05
        })
      );
    }

    deckRef.current.setProps({ layers });
  }, [records, activeLayer, pointRadius, opacity, pitch3D, dataset]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* MapLibre Basemap Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Deck.gl WebGL Canvas */}
      <canvas
        ref={deckCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-10"
      />

      {/* Visual Loading Indicator HUD */}
      <MapLoadingOverlay
        status={status}
        statusMessage={statusMessage}
        isQuerying={isQuerying}
        lastExecutionMs={lastExecutionMs}
      />

      {/* Interactive Floating Hover Tooltip */}
      {hoveredRecord && (
        <div
          style={{
            left: `${hoveredRecord.x + 16}px`,
            top: `${hoveredRecord.y + 16}px`
          }}
          className="absolute z-30 pointer-events-none bg-slate-900/95 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs text-white max-w-xs animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-cyan-300 truncate">{hoveredRecord.record.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {hoveredRecord.record.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 block">
                {dataset === 'global_seismic' ? 'Magnitude' : 'Fare Amount'}
              </span>
              <span className="font-bold text-emerald-400">
                {dataset === 'global_seismic'
                  ? `M ${hoveredRecord.record.value}`
                  : `$${hoveredRecord.record.value.toFixed(2)}`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">
                {dataset === 'global_seismic' ? 'Depth' : 'Tip / Extra'}
              </span>
              <span className="font-bold text-amber-300">
                {dataset === 'global_seismic'
                  ? `${hoveredRecord.record.metric2} km`
                  : `$${hoveredRecord.record.metric2.toFixed(2)}`}
              </span>
            </div>
            <div className="col-span-2 text-[10px] text-slate-400 font-mono">
              Coords: {hoveredRecord.record.latitude.toFixed(4)}, {hoveredRecord.record.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      )}

      {/* Floating Tactical Layer & Camera Toolbar */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md">
        {/* Layer Type Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveLayer('scatter')}
            title="Scatterplot Points"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'scatter'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Points</span>
          </button>

          <button
            onClick={() => setActiveLayer('hexagon')}
            title="3D Hexagonal Aggregation"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'hexagon'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
            <span>Hex 3D</span>
          </button>

          {dataset !== 'global_seismic' && (
            <button
              onClick={() => setActiveLayer('arcs')}
              title="Origin-Destination Arcs"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLayer === 'arcs'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Flow Arcs</span>
            </button>
          )}

          <button
            onClick={() => setActiveLayer('heatmap')}
            title="Continuous Spatial Density"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeLayer === 'heatmap'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* 3D Perspective Toggle */}
        <button
          onClick={togglePitch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            pitch3D
              ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 shadow-lg shadow-indigo-950'
              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${pitch3D ? 'text-indigo-400 rotate-45' : ''}`} />
          <span>{pitch3D ? '3D Perspective (45°)' : '2D Ortho'}</span>
        </button>

        {/* BBox Filter Indicator Badge */}
        {bboxFilterEnabled && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-600/50 rounded-xl text-amber-300 text-[11px] font-mono animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Viewport Spatial BBox Synced
          </div>
        )}
      </div>

      {/* Records Count Watermark */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-slate-400 text-xs font-mono backdrop-blur-sm">
        <span className="text-cyan-400 font-semibold">{records.length.toLocaleString()}</span>
        <span>geometries rendered @ 60 FPS</span>
      </div>
    </div>
  );
};
