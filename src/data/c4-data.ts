import { C4LevelData } from '../types/spatial';

export const C4_LEVELS: C4LevelData[] = [
  {
    level: 1,
    title: 'Level 1: System Context Diagram',
    subtitle: 'High-level context showing users and external system boundaries',
    description:
      'Illustrates how geospatial analysts and researchers interact with GeoDuck Spatial Analytics, and its external dependencies including Basemap tile servers, external Parquet data lakes, and the client browser WebAssembly/WebGL runtime.',
    nodes: [
      {
        id: 'user',
        name: 'Geospatial Data Analyst',
        type: 'person',
        description: 'Analyzes massive mobility, transit, and seismic geospatial datasets in real time.',
        details: [
          'Applies spatial filters & bounding box viewports',
          'Toggles Deck.gl 3D visualizations and layer types',
          'Inspects DuckDB SQL plans and query execution times'
        ],
        x: 60,
        y: 180,
        width: 180,
        height: 120
      },
      {
        id: 'system',
        name: 'GeoDuck Spatial Analytics',
        type: 'system',
        technology: 'Next-gen React 19 + DuckDB-Wasm + Deck.gl',
        description:
          'Client-side serverless OLAP platform executing spatial SQL queries directly on Parquet files in the browser without server roundtrips.',
        details: [
          'DuckDB WebAssembly OLAP vectorized engine',
          'Zero-copy Apache Arrow memory buffers',
          'Deck.gl 60 FPS GPU-accelerated rendering layer',
          'MapLibre GL vector cartography'
        ],
        x: 320,
        y: 140,
        width: 260,
        height: 190
      },
      {
        id: 'parquet_lake',
        name: 'External Parquet Lakes',
        type: 'external',
        technology: 'S3 / HTTP / Drag & Drop',
        description: 'Columnar Parquet & GeoParquet files hosted remotely or provided locally by the user.',
        details: [
          'Column-oriented data format with dictionary encoding',
          'Selective byte-range requests (HTTP Range)',
          'Local virtual file system (DuckDB VFS)'
        ],
        x: 650,
        y: 50,
        width: 200,
        height: 110
      },
      {
        id: 'basemap_cdn',
        name: 'Basemap Tile CDN',
        type: 'external',
        technology: 'CartoDB / OpenStreetMap',
        description: 'Provides high-contrast dark vector & raster cartography tiles for geographical orientation.',
        details: ['Dark Matter GL raster/vector tiles', 'Cached at global edge nodes'],
        x: 650,
        y: 190,
        width: 200,
        height: 110
      },
      {
        id: 'browser_gpu',
        name: 'Browser GPU & WebAssembly',
        type: 'external',
        technology: 'WebGL 2.0 / WebAssembly SIMD',
        description: 'Hardware acceleration environment inside modern Chromium/WebKit/Gecko browsers.',
        details: [
          'Multi-threaded Web Worker isolation',
          'SIMD vector instructions for DuckDB math',
          'Vertex and fragment shader pipelines in WebGL'
        ],
        x: 650,
        y: 330,
        width: 200,
        height: 110
      }
    ],
    edges: [
      {
        id: 'e1',
        source: 'user',
        target: 'system',
        label: 'Filters spatial data, queries bounding box, views 3D maps',
        protocol: 'HTTPS / DOM'
      },
      {
        id: 'e2',
        source: 'system',
        target: 'parquet_lake',
        label: 'Fetches byte ranges or registers Parquet buffers',
        protocol: 'HTTP Range / ArrayBuffer'
      },
      {
        id: 'e3',
        source: 'system',
        target: 'basemap_cdn',
        label: 'Streams base map vector tiles',
        protocol: 'HTTPS / PNG'
      },
      {
        id: 'e4',
        source: 'system',
        target: 'browser_gpu',
        label: 'Dispatches compute to WASM threads and GPU draws',
        protocol: 'WASM / WebGL'
      }
    ],
    plantUmlSource: `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

Person(analyst, "Geospatial Analyst", "Analyzes urban mobility and seismic spatial datasets in real-time.")
System(geoduck, "GeoDuck Spatial Analytics", "In-browser OLAP spatial analytics powered by DuckDB-Wasm and Deck.gl.")
System_Ext(parquet, "Parquet Lakes & Local Files", "Columnar Parquet datasets.")
System_Ext(tiles, "Basemap Tile CDN", "CartoDB Dark Matter tile provider.")
System_Ext(hardware, "Browser GPU & WASM", "WebGL2 and SIMD WebAssembly runtime.")

Rel(analyst, geoduck, "Interacts with interactive filters & 3D maps")
Rel(geoduck, parquet, "Fetches & streams columnar chunks")
Rel(geoduck, tiles, "Fetches dark matter map tiles")
Rel(geoduck, hardware, "Compiles WASM SIMD & WebGL shaders")
@enduml`
  },
  {
    level: 2,
    title: 'Level 2: Container Diagram',
    subtitle: 'Zooming inside the GeoDuck Spatial Analytics platform',
    description:
      'Shows the high-level boundary containers inside the application: Main Thread React UI, Dedicated DuckDB Web Worker, Deck.gl WebGL rendering layer, and MapLibre GL basemap canvas.',
    nodes: [
      {
        id: 'c_ui',
        name: 'Main Thread React SPA',
        type: 'container',
        technology: 'React 19, TypeScript, Tailwind CSS',
        description: 'Hosts the reactive dashboard layout, filter controls, KPI cards, and visual loading HUD.',
        details: [
          'State management for spatial filters & viewport',
          'Responsive chart toggles (Bar, Line, Area)',
          'Visual loading radar and shimmer indicators'
        ],
        x: 60,
        y: 120,
        width: 210,
        height: 150
      },
      {
        id: 'c_deck',
        name: 'Deck.gl Rendering Layer',
        type: 'container',
        technology: 'deck.gl / WebGL2',
        description: 'GPU-accelerated geospatial visualization rendering hundreds of thousands of dynamic geometries.',
        details: [
          'ScatterplotLayer for granular point events',
          'HexagonLayer with 3D elevation extrusion',
          'ArcLayer for origin-destination transit flows',
          'HeatmapLayer with dynamic radius gaussian kernel'
        ],
        x: 340,
        y: 40,
        width: 220,
        height: 150
      },
      {
        id: 'c_maplibre',
        name: 'MapLibre GL JS Basemap',
        type: 'container',
        technology: 'MapLibre GL JS',
        description: 'Manages camera viewport, pitch, bearing, projection matrix, and high-contrast dark tiles.',
        details: [
          'CartoDB Dark Matter styling',
          'Synchronized camera matrix with Deck.gl',
          'Viewport bounds listener for spatial BBox filtering'
        ],
        x: 340,
        y: 230,
        width: 220,
        height: 140
      },
      {
        id: 'c_worker',
        name: 'Dedicated DuckDB Web Worker',
        type: 'container',
        technology: 'Web Worker / DuckDB-Wasm',
        description: 'Isolated background thread executing heavy spatial SQL without blocking 60 FPS UI rendering.',
        details: [
          'Asynchronous RPC messaging over postMessage',
          'Apache Arrow zero-copy memory transfers',
          'Vectorized column chunk filtering'
        ],
        x: 630,
        y: 120,
        width: 220,
        height: 150
      },
      {
        id: 'c_vfs',
        name: 'DuckDB In-Memory VFS',
        type: 'container',
        technology: 'WASM Virtual File System',
        description: 'Virtual filesystem storing registered Parquet files and memory buffers.',
        details: ['Stores active_dataset.parquet', 'Supports random byte offset reads'],
        x: 630,
        y: 310,
        width: 220,
        height: 110
      }
    ],
    edges: [
      {
        id: 'ce1',
        source: 'c_ui',
        target: 'c_worker',
        label: 'Dispatches spatial queries & filter state',
        protocol: 'postMessage / RPC'
      },
      {
        id: 'ce2',
        source: 'c_worker',
        target: 'c_ui',
        label: 'Returns Arrow record batches & execution telemetry',
        protocol: 'Zero-copy Transferable'
      },
      {
        id: 'ce3',
        source: 'c_ui',
        target: 'c_deck',
        label: 'Updates layer data props & visual styles',
        protocol: 'React Props / WebGL Buffers'
      },
      {
        id: 'ce4',
        source: 'c_ui',
        target: 'c_maplibre',
        label: 'Syncs viewport camera, center & pitch',
        protocol: 'Imperative API'
      },
      {
        id: 'ce5',
        source: 'c_worker',
        target: 'c_vfs',
        label: 'Direct Parquet reader scans',
        protocol: 'Internal C++ WASM Memory'
      }
    ],
    plantUmlSource: `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Container(ui, "Main Thread React SPA", "React 19, Tailwind", "Reactive UI, controls, and loading HUD.")
Container(deck, "Deck.gl Rendering Layer", "Deck.gl, WebGL2", "GPU-accelerated spatial layer rendering.")
Container(maplibre, "MapLibre GL Basemap", "MapLibre GL JS", "Camera matrix and CartoDB Dark Matter basemap.")
Container(worker, "DuckDB Web Worker", "Web Worker, DuckDB-Wasm", "Executes spatial SQL in background.")
Container(vfs, "DuckDB VFS", "WASM Virtual Memory", "Holds active_dataset.parquet.")

Rel(ui, worker, "Dispatches query", "postMessage")
Rel(worker, ui, "Returns record batches & telemetry", "Transferable ArrayBuffer")
Rel(ui, deck, "Feeds geometric data", "WebGL Buffers")
Rel(ui, maplibre, "Syncs camera matrix")
Rel(worker, vfs, "Vectorized Parquet scan")
@enduml`
  },
  {
    level: 3,
    title: 'Level 3: Component Diagram',
    subtitle: 'Internal component architecture inside the React Dashboard and Worker',
    description:
      'Details the individual components and services: FilterSidebar, ChartWidgets, MapLoadingOverlay, DuckDBService, LayerControls, and SpatialQueryBuilder.',
    nodes: [
      {
        id: 'comp_filter',
        name: 'FilterSidebar',
        type: 'component',
        technology: 'React Component',
        description: 'Manages interactive time slider, category chips, magnitude/fare range, and viewport sync toggle.',
        x: 40,
        y: 40,
        width: 190,
        height: 120
      },
      {
        id: 'comp_hud',
        name: 'MapLoadingOverlay & HUD',
        type: 'component',
        technology: 'React Component / Motion',
        description: 'Pulsing sonar sweep, scanline animation, live query stopwatch (ms), and phase progress pill.',
        x: 40,
        y: 190,
        width: 190,
        height: 120
      },
      {
        id: 'comp_charts',
        name: 'ChartWidgets & Skeletons',
        type: 'component',
        technology: 'SVG / Canvas Reactive Engine',
        description: 'Interactive temporal distributions, metric histograms, and category donut/bar breakdowns.',
        x: 40,
        y: 340,
        width: 190,
        height: 120
      },
      {
        id: 'comp_bridge',
        name: 'DuckDBService (Client Bridge)',
        type: 'component',
        technology: 'TypeScript Singleton',
        description: 'Coordinates query queueing, telemetry timing, sample generation, and user Parquet registration.',
        x: 290,
        y: 190,
        width: 230,
        height: 140
      },
      {
        id: 'comp_layers',
        name: 'GeospatialMap & DeckManager',
        type: 'component',
        technology: 'deck.gl / MapLibre GL JS',
        description: 'Generates Deck.gl ScatterplotLayer, HexagonLayer, ArcLayer, and HeatmapLayer instances.',
        x: 290,
        y: 40,
        width: 230,
        height: 120
      },
      {
        id: 'comp_sql_engine',
        name: 'Spatial SQL Query Builder',
        type: 'component',
        technology: 'DuckDB SQL / Haversine',
        description: 'Constructs parameterized SQL queries with bounding boxes, radius formulas, and GROUP BY aggregations.',
        x: 580,
        y: 80,
        width: 230,
        height: 120
      },
      {
        id: 'comp_parquet_reader',
        name: 'Vectorized Parquet Reader',
        type: 'component',
        technology: 'DuckDB C++ WASM',
        description: 'Reads Parquet metadata, skips row groups, decompresses Snappy/ZSTD pages into Arrow columns.',
        x: 580,
        y: 240,
        width: 230,
        height: 120
      }
    ],
    edges: [
      {
        id: 'cpe1',
        source: 'comp_filter',
        target: 'comp_bridge',
        label: 'Emits onFilterChange(filters)',
        protocol: 'Event Callback'
      },
      {
        id: 'cpe2',
        source: 'comp_bridge',
        target: 'comp_hud',
        label: 'Triggers loading state (executing_query) + timer',
        protocol: 'Status Subscription'
      },
      {
        id: 'cpe3',
        source: 'comp_bridge',
        target: 'comp_sql_engine',
        label: 'Generates spatial SQL statement',
        protocol: 'Function Call'
      },
      {
        id: 'cpe4',
        source: 'comp_sql_engine',
        target: 'comp_parquet_reader',
        label: 'Executes scan on active_dataset.parquet',
        protocol: 'DuckDB Engine'
      },
      {
        id: 'cpe5',
        source: 'comp_bridge',
        target: 'comp_layers',
        label: 'Updates spatial points & arc coordinates',
        protocol: 'State Flow'
      },
      {
        id: 'cpe6',
        source: 'comp_bridge',
        target: 'comp_charts',
        label: 'Updates temporal bins & histograms',
        protocol: 'State Flow'
      }
    ],
    plantUmlSource: `@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

Component(filter, "FilterSidebar", "React", "Interactive filter controls.")
Component(hud, "MapLoadingOverlay", "React", "Visual loading radar & query timer.")
Component(charts, "ChartWidgets", "SVG/React", "Temporal & histogram charts.")
Component(bridge, "DuckDBService", "TS Bridge", "Coordinates queries & telemetry.")
Component(layers, "GeospatialMap", "Deck.gl", "Manages WebGL layer lifecycle.")
Component(sql, "SQL Query Builder", "DuckDB SQL", "Generates BBox & Haversine SQL.")
Component(reader, "Parquet Reader", "WASM C++", "Vectorized scan of Parquet row groups.")

Rel(filter, bridge, "Filter changes")
Rel(bridge, hud, "Toggle loading & timer")
Rel(bridge, sql, "Build query")
Rel(sql, reader, "Scan Parquet")
Rel(bridge, layers, "Push geometry data")
Rel(bridge, charts, "Push aggregated metrics")
@enduml`
  },
  {
    level: 4,
    title: 'Level 4: Code & Runtime Workflow',
    subtitle: 'Sequence execution & method call workflow during spatial queries',
    description:
      'Traces the exact microsecond execution lifecycle when a user adjusts a spatial control, through the Web Worker DuckDB Parquet scan, to the GPU rendering pipeline with visual feedback indicators.',
    nodes: [
      {
        id: 'step1',
        name: '1. User Interaction Event',
        type: 'code',
        technology: 'DOM Event / onChange',
        description: 'User moves Time Slider to 18:00 (Rush Hour) or pans the map.',
        details: ['Debounced event (150ms)', 'Emits SpatialFilterState with updated ranges'],
        x: 40,
        y: 40,
        width: 220,
        height: 100
      },
      {
        id: 'step2',
        name: '2. Loading Indicators Activated',
        type: 'code',
        technology: 'React State Update',
        description: 'MapLoadingOverlay triggers radar sweep; charts display shimmer pulse skeletons.',
        details: [
          'status: "executing_query"',
          'performance.now() timer starts',
          'Radar scanning beam initiates'
        ],
        x: 40,
        y: 180,
        width: 220,
        height: 110
      },
      {
        id: 'step3',
        name: '3. Spatial SQL Construction',
        type: 'code',
        technology: 'SQL Query Synthesis',
        description: 'Builds SQL statement with BBox and Haversine distance predicates.',
        details: [
          "SELECT * FROM 'active_dataset.parquet'",
          'WHERE hour = 18 AND value >= 10',
          'AND longitude BETWEEN minX AND maxX'
        ],
        x: 310,
        y: 40,
        width: 240,
        height: 120
      },
      {
        id: 'step4',
        name: '4. DuckDB-Wasm Vectorized Scan',
        type: 'code',
        technology: 'WebAssembly SIMD',
        description: 'Scans Parquet file row groups using columnar projection and vector filters.',
        details: [
          'Evaluates dictionary encoded statistics',
          'Pushes filter down into Parquet decoder',
          'Generates Apache Arrow record batch'
        ],
        x: 310,
        y: 200,
        width: 240,
        height: 120
      },
      {
        id: 'step5',
        name: '5. Arrow → WebGL Buffer Transfer',
        type: 'code',
        technology: 'Deck.gl Layer Diffing',
        description: 'Directly maps columnar coordinates into Float32Array WebGL vertex buffers.',
        details: [
          'ScatterplotLayer updates getPosition & getColor',
          'ArcLayer updates getSourcePosition / getTargetPosition',
          'Zero garbage collection spike'
        ],
        x: 600,
        y: 40,
        width: 230,
        height: 120
      },
      {
        id: 'step6',
        name: '6. Telemetry & Indicator Teardown',
        type: 'code',
        technology: 'Telemetry Completion',
        description: 'Records query duration (e.g. 18.4ms), updates KPI metrics, and fades out loading radar.',
        details: [
          'Records QueryTelemetry { latencyMs, rowsScanned }',
          'Status transitions to "ready"',
          'HUD shows green confirmation flash'
        ],
        x: 600,
        y: 200,
        width: 230,
        height: 120
      }
    ],
    edges: [
      { id: 'seq1', source: 'step1', target: 'step2', label: 'Triggers setStatus("executing_query")' },
      { id: 'seq2', source: 'step2', target: 'step3', label: 'Calls executeSpatialQuery(filter)' },
      { id: 'seq3', source: 'step3', target: 'step4', label: 'Sends SQL to DuckDB Web Worker' },
      { id: 'seq4', source: 'step4', target: 'step5', label: 'Streams Arrow vectors to Deck.gl' },
      { id: 'seq5', source: 'step5', target: 'step6', label: 'Completes render and logs query latency' }
    ],
    plantUmlSource: `@startuml
autonumber
actor User
boundary "UI Controls" as UI
control "Loading HUD" as HUD
control "DuckDB Service" as Bridge
database "DuckDB Worker" as Worker
entity "active_dataset.parquet" as Parquet
boundary "Deck.gl WebGL" as Deck

User -> UI: Adjusts Time Slider (18:00)
UI -> HUD: Set loading state = active
HUD -> User: Show radar scan & stopwatch
UI -> Bridge: executeSpatialQuery(filterState)
Bridge -> Worker: postMessage(sqlQuery)
Worker -> Parquet: Vectorized filter down & scan
Parquet --> Worker: Columnar Arrow record batches
Worker --> Bridge: Results + Telemetry (ms, rows)
Bridge -> Deck: Update WebGL vertex attributes
Deck -> User: Re-renders 60 FPS spatial layers
Bridge -> HUD: Set status = ready (elapsed 18.4ms)
HUD -> User: Fade loading radar, show latency badge
@enduml`
  }
];
