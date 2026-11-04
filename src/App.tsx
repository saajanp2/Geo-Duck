/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  DatasetType,
  SpatialFilterState,
  AggregationResult,
  QueryTelemetry
} from './types/spatial';
import { duckDBService, DuckDBStatus } from './services/duckdb/duckdb-service';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { FilterSidebar } from './components/dashboard/FilterSidebar';
import { ChartWidgets } from './components/dashboard/ChartWidgets';
import { GeospatialMap } from './components/map/GeospatialMap';
import { ChartBenchmarkStudio } from './components/benchmark/ChartBenchmarkStudio';
import { C4ArchitectureStudio } from './components/c4/C4ArchitectureStudio';
import { SqlQueryModal } from './components/sql/SqlQueryModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'map_dashboard' | 'benchmark' | 'c4_docs'>('map_dashboard');
  const [dataset, setDataset] = useState<DatasetType>('nyc_mobility');
  const [status, setStatus] = useState<DuckDBStatus>('initializing');
  const [statusMessage, setStatusMessage] = useState<string>('Booting DuckDB-Wasm engine...');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [lastExecutionMs, setLastExecutionMs] = useState<number>(14.2);
  const [sqlModalOpen, setSqlModalOpen] = useState<boolean>(false);
  const [telemetry, setTelemetry] = useState<QueryTelemetry | null>(null);

  const [filterState, setFilterState] = useState<SpatialFilterState>({
    dataset: 'nyc_mobility',
    hourRange: [0, 23],
    valueRange: [0, 100],
    categories: [],
    bboxFilterEnabled: false,
    bbox: null,
    radiusFilterEnabled: false,
    radiusCenter: null,
    radiusKm: 10,
    searchQuery: ''
  });

  const [aggregationResult, setAggregationResult] = useState<AggregationResult>({
    temporal: [],
    categories: [],
    histogram: [],
    kpis: {
      totalRecords: 0,
      filteredRecords: 0,
      avgValue: 0,
      maxValue: 0,
      totalValue: 0,
      queryTimeMs: 0
    },
    records: []
  });

  // Query debounce ref
  const debounceTimerRef = useRef<any>(null);

  // Subscribe to DuckDB service status
  useEffect(() => {
    const unsubscribe = duckDBService.subscribeStatus((newStatus, msg) => {
      setStatus(newStatus);
      if (msg) setStatusMessage(msg);
      if (newStatus === 'executing_query') {
        setIsQuerying(true);
      } else if (newStatus === 'ready') {
        setIsQuerying(false);
      }
    });

    // Initialize DuckDB-Wasm
    duckDBService.initialize().then(() => {
      runQuery(filterState);
    });

    return () => unsubscribe();
  }, []);

  // Run spatial query
  const runQuery = useCallback(async (currentFilter: SpatialFilterState) => {
    setIsQuerying(true);
    try {
      const result = await duckDBService.executeSpatialQuery(currentFilter);
      setAggregationResult(result);
      setLastExecutionMs(result.kpis.queryTimeMs);
      setTelemetry(duckDBService.getLastTelemetry());
    } catch (err) {
      console.error('Error executing DuckDB query:', err);
    } finally {
      setIsQuerying(false);
    }
  }, []);

  // Debounced filter change handler
  const handleFilterChange = (newFilter: SpatialFilterState) => {
    setFilterState(newFilter);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      runQuery(newFilter);
    }, 120);
  };

  // Change dataset
  const handleDatasetChange = async (newDataset: DatasetType) => {
    setDataset(newDataset);
    const updatedFilter: SpatialFilterState = {
      ...filterState,
      dataset: newDataset,
      valueRange: newDataset === 'global_seismic' ? [2.5, 9.0] : [0, 100],
      categories: [],
      bboxFilterEnabled: false,
      radiusFilterEnabled: false
    };
    setFilterState(updatedFilter);

    await duckDBService.loadDataset(newDataset);
    runQuery(updatedFilter);
  };

  // Upload local Parquet file
  const handleUploadParquet = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      await duckDBService.loadUserParquetBuffer(file.name, new Uint8Array(buffer));
      runQuery(filterState);
    } catch (err) {
      console.error('Failed to upload Parquet file:', err);
    }
  };

  // Map bounding box change handler
  const handleBboxChange = (bbox: [number, number, number, number]) => {
    if (filterState.bboxFilterEnabled) {
      handleFilterChange({
        ...filterState,
        bbox
      });
    } else {
      // Just keep bbox in state so enabling the toggle immediately uses it
      setFilterState(prev => ({ ...prev, bbox }));
    }
  };

  // Radius center change handler
  const handleRadiusCenterChange = (center: [number, number]) => {
    handleFilterChange({
      ...filterState,
      radiusCenter: center
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Header */}
      <DashboardHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        dataset={dataset}
        onDatasetChange={handleDatasetChange}
        status={status}
        statusMessage={statusMessage}
        onOpenSqlModal={() => setSqlModalOpen(true)}
        onUploadParquet={handleUploadParquet}
      />

      {/* Main Workspace based on Tab */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentTab === 'map_dashboard' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Filter Sidebar */}
            <FilterSidebar
              filter={filterState}
              onFilterChange={handleFilterChange}
              dataset={dataset}
              totalRecordsCount={aggregationResult.kpis.totalRecords}
              filteredCount={aggregationResult.kpis.filteredRecords}
              isQuerying={isQuerying}
            />

            {/* Center + Bottom: Map and Reactive Charts */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Map & Deck.gl Viewport */}
              <div className="flex-1 relative overflow-hidden">
                <GeospatialMap
                  records={aggregationResult.records}
                  dataset={dataset}
                  status={status}
                  statusMessage={statusMessage}
                  isQuerying={isQuerying}
                  lastExecutionMs={lastExecutionMs}
                  bboxFilterEnabled={filterState.bboxFilterEnabled}
                  onBboxChange={handleBboxChange}
                  radiusFilterEnabled={filterState.radiusFilterEnabled}
                  radiusCenter={filterState.radiusCenter}
                  radiusKm={filterState.radiusKm}
                  onRadiusCenterChange={handleRadiusCenterChange}
                />
              </div>

              {/* Reactive Charts Bottom Panel */}
              <ChartWidgets
                data={aggregationResult}
                isQuerying={isQuerying}
                dataset={dataset}
              />
            </div>
          </div>
        )}

        {currentTab === 'benchmark' && (
          <ChartBenchmarkStudio
            records={aggregationResult.records}
            dataset={dataset}
            isQuerying={isQuerying}
          />
        )}

        {currentTab === 'c4_docs' && <C4ArchitectureStudio />}
      </main>

      {/* DuckDB SQL Query Inspector Modal */}
      <SqlQueryModal
        isOpen={sqlModalOpen}
        onClose={() => setSqlModalOpen(false)}
        telemetry={telemetry}
      />
    </div>
  );
}
