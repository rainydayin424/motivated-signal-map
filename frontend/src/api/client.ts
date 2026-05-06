/**
 * client.ts - Fetches property data from FastAPI backend.
 * Requests go through Vite dev proxy (/api -> http://localhost:8000).
 */
import type { Property } from '../types';

export async function fetchProperties(minScore: number, absenteeOnly: boolean): Promise<Property[]> {
  const params = new URLSearchParams({
    min_score: String(minScore),
    absentee_only: String(absenteeOnly),
  });
  const res = await fetch(`/api/properties?${params}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<Property[]>;
}
