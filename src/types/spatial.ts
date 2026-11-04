export type DatasetType = 'nyc_mobility' | 'sf_mobility' | 'global_seismic';

export interface SpatialRecord {
  id: string | number;
  latitude: number;
  longitude: number;
  secondary_lat?: number;
  secondary_lon?: number;
  timestamp: string | number;
  hour: number;
  value: number; // fare or magnitude
  metric2: number; // tip or depth_km
  category: string; // payment_type, seismic_type
  label: string;
}

export interface SpatialFilterState {
  dataset: DatasetType;
  hourRange: [number, number]; // 0 to 23
  valueRange: [number, number];
  categories: string[];
  bboxFilterEnabled: boolean;
  bbox: [number, number, number, number] | null; // [minLon, minLat, maxLon, maxLat]
  radiusFilterEnabled: boolean;
  radiusCenter: [number, number] | null; // [lon, lat]
  radiusKm: number;
  searchQuery: string;
}

export interface QueryTelemetry {
  queryId: string;
  sql: string;
  executionTimeMs: number;
  rowsScanned: number;
  rowsReturned: number;
  timestamp: number;
  source: 'parquet' | 'cache';
}

export interface AggregationResult {
  temporal: { hour: number; count: number; avgValue: number }[];
  categories: { category: string; count: number; percentage: number }[];
  histogram: { binStart: number; binEnd: number; count: number }[];
  kpis: {
    totalRecords: number;
    filteredRecords: number;
    avgValue: number;
    maxValue: number;
    totalValue: number;
    queryTimeMs: number;
  };
  records: SpatialRecord[];
}

export type ChartType = 'bar' | 'line' | 'area';
export type DeckLayerType = 'scatter' | 'hexagon' | 'arcs' | 'heatmap';

export interface C4Node {
  id: string;
  name: string;
  type: 'person' | 'system' | 'container' | 'component' | 'code' | 'external';
  technology?: string;
  description: string;
  details?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface C4Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  technology?: string;
  protocol?: string;
  animated?: boolean;
}

export interface C4LevelData {
  level: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  description: string;
  nodes: C4Node[];
  edges: C4Edge[];
  plantUmlSource: string;
}
