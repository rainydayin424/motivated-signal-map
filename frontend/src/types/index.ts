/**
 * index.ts - Shared TypeScript types and helpers for motivated-signal-map.
 */

export interface Property {
  apn: string;
  address: string;
  owner_name: string;
  years_owned: number;
  absentee_owner: number;
  motivation_score: number;
  lat: number;
  lng: number;
}

export type MotivationLevel = 'high' | 'medium' | 'low';

export function getMotivationLevel(score: number): MotivationLevel {
  if (score >= 67) return 'high';
  if (score >= 33) return 'medium';
  return 'low';
}

export function getMarkerColor(score: number): string {
  const level = getMotivationLevel(score);
  if (level === 'high') return '#ef4444';
  if (level === 'medium') return '#eab308';
  return '#22c55e';
}
