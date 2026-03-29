/**
 * Shared Math Utilities — Used across TTP, RCM, Provenance, Closed-Loop
 *
 * Extracted from repeated patterns across the codebase:
 * - Monetary rounding (28+ instances)
 * - Clamping (12+ instances)
 * - Safe division (8+ instances)
 * - Grade counting (3 instances)
 */

import type { MaterialGrade } from "../provenance/engine.js";

/**
 * Round to two decimal places (monetary precision).
 * Used for all dollar amounts throughout the pipeline.
 */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Clamp a value between min and max bounds.
 * Used in TTP scoring, RCM tier resolution, intent schema.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe division that returns a default when denominator is zero.
 * Used in recovery rate, clean rate, and equity calculations.
 */
export function safeRatio(numerator: number, denominator: number, defaultValue = 0): number {
  return denominator > 0 ? numerator / denominator : defaultValue;
}

/**
 * Ensure a value is non-negative.
 * Used in TTP factor normalization and equity calculations.
 */
export function nonNegative(value: number): number {
  return Math.max(0, value);
}

/**
 * Create a fresh grade counter initialized to zero.
 * Used in provenance, marketplace, and closed-loop engines.
 */
export function createGradeCounter(): Record<MaterialGrade, number> {
  return { A: 0, B: 0, C: 0, D: 0, salvage: 0 };
}

/**
 * Check if a contamination status indicates the material is safe for sale.
 * Used in marketplace filtering and closed-loop pipeline.
 */
export function isMarketplaceSafe(contamination: string): boolean {
  return contamination !== "confirmed";
}
