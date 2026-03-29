import { describe, it, expect } from "vitest";
import { TABLE_NAMES, isValidTable } from "./index.js";

describe("TABLE_NAMES", () => {
  it("contains 30+ tables", () => {
    expect(TABLE_NAMES.length).toBeGreaterThanOrEqual(30);
  });

  it("includes core tables", () => {
    expect(TABLE_NAMES).toContain("users");
    expect(TABLE_NAMES).toContain("apiKeys");
  });

  it("includes ML1 tables", () => {
    expect(TABLE_NAMES).toContain("deconSessions");
    expect(TABLE_NAMES).toContain("materials");
    expect(TABLE_NAMES).toContain("materialProvenance");
  });

  it("includes TTP tables", () => {
    expect(TABLE_NAMES).toContain("ttScores");
    expect(TABLE_NAMES).toContain("ttScoreHistory");
  });

  it("includes BOH tables", () => {
    expect(TABLE_NAMES).toContain("storeListings");
    expect(TABLE_NAMES).toContain("storeOrders");
  });
});

describe("isValidTable", () => {
  it("returns true for known tables", () => {
    expect(isValidTable("users")).toBe(true);
    expect(isValidTable("ttScores")).toBe(true);
    expect(isValidTable("materials")).toBe(true);
  });

  it("returns false for unknown tables", () => {
    expect(isValidTable("nonexistent")).toBe(false);
    expect(isValidTable("")).toBe(false);
    expect(isValidTable("Users")).toBe(false);
  });
});
