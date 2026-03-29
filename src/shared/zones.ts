/**
 * Shared Zone Mapping — Material Category → Deconstruction Zone
 *
 * Used by provenance, marketplace, closed-loop, and field-data engines.
 * Single source of truth for the 10-zone categorization system.
 *
 * Z1: Kitchen | Z2: Lumber | Z3: Doors/Windows/Trim
 * Z4: Sheathing/Drywall | Z5: Flooring/Fixtures | Z6: Hardware/Metals
 * Z7: Concrete | Z8: Roofing/Siding | Z9: Gear | Z10: Bundles
 */

import type { MaterialCategory } from "../provenance/engine.js";

const ZONE_MAP: Record<MaterialCategory, number> = {
  structural_lumber: 2,
  finish_lumber: 2,
  doors: 3,
  windows: 3,
  trim: 3,
  flooring: 5,
  fixtures: 5,
  hardware: 6,
  roofing: 8,
  siding: 8,
  concrete: 7,
  sheathing: 4,
  drywall: 4,
  electrical: 6,
  plumbing: 6,
};

/**
 * Map a material category to its deconstruction zone number.
 */
export function materialCategoryToZone(category: MaterialCategory): number {
  return ZONE_MAP[category];
}

/**
 * Get the zone name for a given zone number.
 */
export function zoneLabel(zone: number): string {
  const labels: Record<number, string> = {
    1: "Kitchen",
    2: "Lumber",
    3: "Doors/Windows/Trim",
    4: "Sheathing/Drywall",
    5: "Flooring/Fixtures",
    6: "Hardware/Metals",
    7: "Concrete",
    8: "Roofing/Siding",
    9: "Gear",
    10: "Bundles",
  };
  return labels[zone] ?? `Zone ${zone}`;
}

/**
 * List all zones that contain materials from a given set of categories.
 */
export function activeZones(categories: MaterialCategory[]): number[] {
  const zones = new Set(categories.map((c) => ZONE_MAP[c]));
  return [...zones].sort((a, b) => a - b);
}
