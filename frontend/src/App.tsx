/**
 * App.tsx - Root component for motivated-signal-map.
 *
 * Layout:
 *   - Map fills the full screen except for the bottom filter bar.
 *   - Logo is overlaid at the top center.
 *   - Bottom bar holds all filter controls (Sidebar component).
 *
 * State:
 *   - minScore, absenteeOnly: filter values, re-fetched from the API on every change.
 *   - properties: the list returned by /api/properties.
 *   - loading / error: used to show status messages on the map.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { fetchProperties } from './api/client';
import type { Property } from './types';

/**
 * Owns the filter state and fetches properties from the FastAPI backend
 * whenever minScore or absenteeOnly changes.
 */
export default function App() {
  const [minScore, setMinScore] = useState(0);
  const [absenteeOnly, setAbsenteeOnly] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProperties(minScore, absenteeOnly);
      setProperties(data);
    } catch {
      setError('Could not load properties — is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [minScore, absenteeOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="app-layout">

      {/* Map fills the area above the bottom bar */}
      <div className="map-wrapper">
        <Map properties={properties} />
      </div>

      {/* Logo overlaid at the top center of the map */}
      <div className="logo-overlay">
        <div className="logo-title">Motivated Signal Map</div>
        <div className="logo-sub">for Maricopa County</div>
      </div>

      {/* Status messages (error / loading) */}
      {error && <div className="map-overlay error">{error}</div>}
      {loading && !error && <div className="map-overlay loading">Loading properties…</div>}

      {/* Bottom filter bar */}
      <Sidebar
        minScore={minScore}
        absenteeOnly={absenteeOnly}
        resultCount={properties.length}
        onMinScoreChange={setMinScore}
        onAbsenteeOnlyChange={setAbsenteeOnly}
      />

    </div>
  );
}
