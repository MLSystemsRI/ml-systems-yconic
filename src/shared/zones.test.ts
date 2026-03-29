import { describe, it, expect } from "vitest";
import { materialCategoryToZone, zoneLabel, activeZones } from "./zones.js";

describe("Shared Zone Mapping", () => {
  it("maps structural lumber to zone 2", () => {
    expect(materialCategoryToZone("structural_lumber")).toBe(2);
  });

  it("maps doors to zone 3", () => {
    expect(materialCategoryToZone("doors")).toBe(3);
  });

  it("maps concrete to zone 7", () => {
    expect(materialCategoryToZone("concrete")).toBe(7);
  });

  it("returns zone label for known zones", () => {
    expect(zoneLabel(2)).toBe("Lumber");
    expect(zoneLabel(3)).toBe("Doors/Windows/Trim");
    expect(zoneLabel(7)).toBe("Concrete");
  });

  it("returns fallback label for unknown zones", () => {
    expect(zoneLabel(99)).toBe("Zone 99");
  });

  it("finds active zones from categories", () => {
    const zones = activeZones(["structural_lumber", "doors", "concrete"]);
    expect(zones).toEqual([2, 3, 7]);
  });

  it("deduplicates zones", () => {
    const zones = activeZones(["structural_lumber", "finish_lumber"]);
    expect(zones).toEqual([2]); // Both map to zone 2
  });

  it("returns sorted zones", () => {
    const zones = activeZones(["concrete", "doors", "structural_lumber"]);
    expect(zones).toEqual([2, 3, 7]); // Sorted ascending
  });
});
