import { DatasetType, SpatialRecord } from '../../types/spatial';

// Pseudo-random deterministic generator for consistent reproducibility
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateDataset(type: DatasetType, count: number = 8000): SpatialRecord[] {
  const rng = createRng(type === 'nyc_mobility' ? 42 : type === 'sf_mobility' ? 108 : 999);
  const records: SpatialRecord[] = [];

  if (type === 'nyc_mobility') {
    // NYC Centers: Midtown (40.7580, -73.9855), Lower Manhattan (40.7128, -74.0060),
    // Brooklyn (40.6782, -73.9442), JFK Airport (40.6413, -73.7781), LaGuardia (40.7769, -73.8740)
    const hubs = [
      { lat: 40.7580, lon: -73.9855, weight: 0.45, name: 'Midtown' },
      { lat: 40.7128, lon: -74.0060, weight: 0.25, name: 'Downtown' },
      { lat: 40.6782, lon: -73.9442, weight: 0.15, name: 'Brooklyn' },
      { lat: 40.6413, lon: -73.7781, weight: 0.08, name: 'JFK' },
      { lat: 40.7769, lon: -73.8740, weight: 0.07, name: 'LaGuardia' }
    ];

    const paymentTypes = ['Credit Card', 'Cash', 'Digital Wallet', 'Corporate Account'];

    for (let i = 0; i < count; i++) {
      // Pick pickup hub
      const r = rng();
      let acc = 0;
      let hub = hubs[0];
      for (const h of hubs) {
        acc += h.weight;
        if (r <= acc) {
          hub = h;
          break;
        }
      }

      // Add Gaussian-like scatter
      const latOffset = (rng() - 0.5 + rng() - 0.5) * 0.04;
      const lonOffset = (rng() - 0.5 + rng() - 0.5) * 0.05;
      const pLat = hub.lat + latOffset;
      const pLon = hub.lon + lonOffset;

      // Dropoff hub
      const destHub = hubs[Math.floor(rng() * hubs.length)];
      const dLat = destHub.lat + (rng() - 0.5 + rng() - 0.5) * 0.04;
      const dLon = destHub.lon + (rng() - 0.5 + rng() - 0.5) * 0.05;

      const hour = Math.floor(rng() * 24);
      // Realistic trip distance in miles
      const approxDist = Math.max(0.5, Math.sqrt(Math.pow((dLat - pLat) * 69, 2) + Math.pow((dLon - pLon) * 53, 2)));
      const baseFare = 3.5 + approxDist * 2.8 + (hour >= 16 && hour <= 19 ? 4.5 : 0);
      const fare = Math.round((baseFare + rng() * 6) * 100) / 100;
      const tip = Math.round((fare * (rng() > 0.3 ? 0.15 + rng() * 0.15 : 0)) * 100) / 100;
      const category = paymentTypes[Math.floor(rng() * paymentTypes.length)];

      records.push({
        id: `nyc_${i + 1}`,
        latitude: Math.round(pLat * 100000) / 100000,
        longitude: Math.round(pLon * 100000) / 100000,
        secondary_lat: Math.round(dLat * 100000) / 100000,
        secondary_lon: Math.round(dLon * 100000) / 100000,
        timestamp: `2026-11-04T${String(hour).padStart(2, '0')}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00Z`,
        hour,
        value: fare,
        metric2: tip,
        category,
        label: `${hub.name} → ${destHub.name} ($${fare})`
      });
    }
  } else if (type === 'sf_mobility') {
    // SF Hubs: Financial District (37.7946, -122.3999), SoMa (37.7785, -122.4056),
    // Mission (37.7599, -122.4148), SFO Airport (37.6213, -122.3790), Marina (37.8037, -122.4368)
    const hubs = [
      { lat: 37.7946, lon: -122.3999, weight: 0.35, name: 'FiDi' },
      { lat: 37.7785, lon: -122.4056, weight: 0.30, name: 'SoMa' },
      { lat: 37.7599, lon: -122.4148, weight: 0.18, name: 'Mission' },
      { lat: 37.6213, lon: -122.3790, weight: 0.10, name: 'SFO' },
      { lat: 37.8037, lon: -122.4368, weight: 0.07, name: 'Marina' }
    ];

    const vehicleTypes = ['Autonomous Robotaxi', 'Electric Rideshare', 'Shared Scooter', 'Courier Transit'];

    for (let i = 0; i < count; i++) {
      const hub = hubs[Math.floor(rng() * hubs.length)];
      const pLat = hub.lat + (rng() - 0.5) * 0.035;
      const pLon = hub.lon + (rng() - 0.5) * 0.045;

      const destHub = hubs[Math.floor(rng() * hubs.length)];
      const dLat = destHub.lat + (rng() - 0.5) * 0.035;
      const dLon = destHub.lon + (rng() - 0.5) * 0.045;

      const hour = Math.floor(rng() * 24);
      const dist = Math.max(0.4, Math.sqrt(Math.pow((dLat - pLat) * 69, 2) + Math.pow((dLon - pLon) * 54, 2)));
      const fare = Math.round((5 + dist * 3.2 + rng() * 8) * 100) / 100;
      const speedMph = Math.round((12 + rng() * 22) * 10) / 10;
      const category = vehicleTypes[Math.floor(rng() * vehicleTypes.length)];

      records.push({
        id: `sf_${i + 1}`,
        latitude: Math.round(pLat * 100000) / 100000,
        longitude: Math.round(pLon * 100000) / 100000,
        secondary_lat: Math.round(dLat * 100000) / 100000,
        secondary_lon: Math.round(dLon * 100000) / 100000,
        timestamp: `2026-11-04T${String(hour).padStart(2, '0')}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00Z`,
        hour,
        value: fare,
        metric2: speedMph,
        category,
        label: `${category} ($${fare})`
      });
    }
  } else {
    // Global Seismic Events
    // Ring of fire subduction zones: Japan (35, 140), Indonesia (-2, 120), Chile (-30, -71),
    // California (36, -120), Alaska (60, -150), Mid-Atlantic (0, -25)
    const seismicZones = [
      { lat: 35.6, lon: 139.6, name: 'Japan Trench', weight: 0.25 },
      { lat: -2.5, lon: 121.0, name: 'Sunda Arc', weight: 0.25 },
      { lat: -32.0, lon: -71.5, name: 'Chile Subduction', weight: 0.18 },
      { lat: 36.5, lon: -121.0, name: 'San Andreas Fault', weight: 0.14 },
      { lat: 61.2, lon: -149.8, name: 'Aleutian Arc', weight: 0.10 },
      { lat: 0.0, lon: -25.0, name: 'Mid-Atlantic Ridge', weight: 0.08 }
    ];

    const eventTypes = ['Tectonic Subduction', 'Volcanic Tremor', 'Transform Fault', 'Deep Intraplate'];

    for (let i = 0; i < count; i++) {
      const zone = seismicZones[Math.floor(rng() * seismicZones.length)];
      const lat = Math.max(-85, Math.min(85, zone.lat + (rng() - 0.5 + rng() - 0.5) * 6));
      const lon = Math.max(-180, Math.min(180, zone.lon + (rng() - 0.5 + rng() - 0.5) * 8));

      // Gutenberg-Richter distribution for magnitude: mostly 2.5 - 4.5, rarely 6.0 - 8.5
      const magBase = 2.5 + Math.pow(rng(), 3) * 5.8;
      const magnitude = Math.round(magBase * 10) / 10;
      const depthKm = Math.round(5 + Math.pow(rng(), 1.5) * 450);
      const hour = Math.floor(rng() * 24);
      const category = eventTypes[Math.floor(rng() * eventTypes.length)];

      records.push({
        id: `quake_${i + 1}`,
        latitude: Math.round(lat * 10000) / 10000,
        longitude: Math.round(lon * 10000) / 10000,
        timestamp: `2026-11-04T${String(hour).padStart(2, '0')}:${String(Math.floor(rng() * 60)).padStart(2, '0')}:00Z`,
        hour,
        value: magnitude,
        metric2: depthKm,
        category,
        label: `M ${magnitude} - ${zone.name} (${depthKm}km depth)`
      });
    }
  }

  return records;
}
