/**
 * Map.tsx - Full-screen Leaflet map component.
 *
 * Tiles:  CartoDB Dark Matter — dark background so the colored markers stand out.
 * Markers: CircleMarker (SVG) — red (High >= 67), yellow (Medium 33-66), green (Low < 33).
 * Popup:  Clicking a marker shows address, score, years_owned, absentee_owner, owner_name.
 * BoundsUpdater: whenever the property list changes, the map view adjusts to fit all markers.
 *
 * Default center: Phoenix metro area [33.45, -112.07], zoom 10.
 * Zoom controls are placed top-right to avoid overlapping the logo.
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '../types';
import { getMarkerColor } from '../types';

interface MapProps {
  properties: Property[];
}

/**
 * Fits the map view to all visible markers whenever the property list changes.
 */
function BoundsUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const latLngs = properties.map((p) => [p.lat, p.lng] as [number, number]);
    map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 14 });
  }, [properties, map]);
  return null;
}

/**
 * Renders all properties as colored CircleMarkers with a click popup.
 */
export function Map({ properties }: MapProps) {
  return (
    <MapContainer
      center={[33.45, -112.07]}
      zoom={10}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Zoom controls moved to top-right so they don't overlap the logo */}
      <ZoomControl position="topright" />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {properties.map((prop) => {
        const color = getMarkerColor(prop.motivation_score);
        return (
          <CircleMarker
            key={prop.apn}
            center={[prop.lat, prop.lng]}
            radius={8}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.82,
              weight: 1.5,
            }}
          >
            <Popup>
              <div style={{ minWidth: 210, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{prop.address}</div>
                <div><b>Score:</b> {prop.motivation_score.toFixed(0)}</div>
                <div><b>Years owned:</b> {prop.years_owned}</div>
                <div><b>Absentee owner:</b> {prop.absentee_owner ? 'Yes' : 'No'}</div>
                <div style={{ color: '#888', marginTop: 4, fontSize: '0.8rem' }}>{prop.owner_name}</div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {properties.length > 0 && <BoundsUpdater properties={properties} />}
    </MapContainer>
  );
}
