/**
 * Sidebar.tsx - Horizontal filter bar fixed at the bottom of the screen.
 *
 * Contains four sections:
 *   1. Min Score slider   — sets the minimum motivation score to display (0-100).
 *   2. Absentee toggle    — when on, shows only properties with absentee owners.
 *   3. Result count       — number of properties currently passing the filters.
 *   4. Color legend       — red (High >= 67), yellow (Medium 33-66), green (Low < 33).
 *
 * This component holds no state. Filter changes are passed up to App.tsx
 * via the onMinScoreChange and onAbsenteeOnlyChange callbacks.
 */
import React from 'react';

interface SidebarProps {
  /** Current minimum motivation score (0-100). */
  minScore: number;
  /** Whether to show only absentee-owned properties. */
  absenteeOnly: boolean;
  /** Number of properties passing the current filters. */
  resultCount: number;
  /** Called when the score slider changes. */
  onMinScoreChange: (v: number) => void;
  /** Called when the absentee toggle changes. */
  onAbsenteeOnlyChange: (v: boolean) => void;
}

/**
 * Bottom filter bar. Sections are separated by vertical dividers.
 */
export function Sidebar({
  minScore,
  absenteeOnly,
  resultCount,
  onMinScoreChange,
  onAbsenteeOnlyChange,
}: SidebarProps) {
  return (
    <div className="bottom-bar">

      {/* 1. Score slider */}
      <div className="bar-section-score">
        <div className="bar-score-header">
          <span className="bar-label">Min Score</span>
          <span className="bar-value">{minScore}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
        />
      </div>

      <div className="bar-divider" />

      {/* 2. Absentee owner toggle */}
      <div className="bar-section-toggle">
        <span className="toggle-label">Owner Filter</span>
        <div className="toggle-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={absenteeOnly}
              onChange={(e) => onAbsenteeOnlyChange(e.target.checked)}
            />
            <span className="toggle-track" />
          </label>
          <span>Absentee owners only</span>
        </div>
      </div>

      <div className="bar-divider" />

      {/* 3. Result count */}
      <div className="bar-section-count">
        <span className="count-number">{resultCount}</span>
        <span className="count-sub">properties shown</span>
      </div>

      <div className="bar-divider" />

      {/* 4. Color legend */}
      <div className="bar-section-legend">
        <div className="legend-row">
          <div className="legend-dot" style={{ background: '#ef4444' }} />
          High motivation (≥ 67)
        </div>
        <div className="legend-row">
          <div className="legend-dot" style={{ background: '#eab308' }} />
          Medium (33 – 66)
        </div>
        <div className="legend-row">
          <div className="legend-dot" style={{ background: '#22c55e' }} />
          Low (&lt; 33)
        </div>
      </div>

    </div>
  );
}
