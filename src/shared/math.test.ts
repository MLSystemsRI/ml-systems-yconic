/**
 * Shared Math Utility Tests
 */

import { describe, it, expect } from "vitest";
import { roundMoney, clamp, safeRatio, nonNegative, createGradeCounter, isMarketplaceSafe } from "./math.js";

describe("roundMoney", () => {
  it("rounds to two decimal places", () => {
    expect(roundMoney(1.006)).toBe(1.01);
    expect(roundMoney(1.004)).toBe(1);
    expect(roundMoney(99.999)).toBe(100);
  });

  it("handles zero and negative", () => {
    expect(roundMoney(0)).toBe(0);
    expect(roundMoney(-1.556)).toBe(-1.56);
  });

  it("preserves exact values", () => {
    expect(roundMoney(100)).toBe(100);
    expect(roundMoney(1264.14)).toBe(1264.14);
  });
});

describe("clamp", () => {
  it("clamps below minimum", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(500, 580, 850)).toBe(580);
  });

  it("clamps above maximum", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(900, 580, 850)).toBe(850);
  });

  it("passes through values within range", () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(720, 580, 850)).toBe(720);
  });

  it("handles min equals max", () => {
    expect(clamp(5, 10, 10)).toBe(10);
  });
});

describe("safeRatio", () => {
  it("divides normally when denominator is positive", () => {
    expect(safeRatio(10, 5)).toBe(2);
    expect(safeRatio(1, 3)).toBeCloseTo(0.333, 2);
  });

  it("returns default when denominator is zero", () => {
    expect(safeRatio(10, 0)).toBe(0);
    expect(safeRatio(10, 0, 1)).toBe(1);
  });

  it("returns default when denominator is negative", () => {
    expect(safeRatio(10, -5)).toBe(0);
  });
});

describe("nonNegative", () => {
  it("passes positive values through", () => {
    expect(nonNegative(42)).toBe(42);
  });

  it("clamps negative to zero", () => {
    expect(nonNegative(-10)).toBe(0);
  });

  it("handles zero", () => {
    expect(nonNegative(0)).toBe(0);
  });
});

describe("createGradeCounter", () => {
  it("initializes all grades to zero", () => {
    const counter = createGradeCounter();
    expect(counter).toEqual({ A: 0, B: 0, C: 0, D: 0, salvage: 0 });
  });

  it("returns a fresh object each call", () => {
    const a = createGradeCounter();
    const b = createGradeCounter();
    a.A = 5;
    expect(b.A).toBe(0);
  });
});

describe("isMarketplaceSafe", () => {
  it("allows clean materials", () => {
    expect(isMarketplaceSafe("clean")).toBe(true);
  });

  it("allows suspected materials", () => {
    expect(isMarketplaceSafe("suspected")).toBe(true);
  });

  it("allows remediated materials", () => {
    expect(isMarketplaceSafe("remediated")).toBe(true);
  });

  it("blocks confirmed contamination", () => {
    expect(isMarketplaceSafe("confirmed")).toBe(false);
  });
});
