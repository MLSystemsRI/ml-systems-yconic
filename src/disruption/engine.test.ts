import { describe, it, expect } from "vitest";
import {
  INDUSTRY_BASELINE,
  ML_SYSTEMS_DEFAULTS,
  equityVelocityMultiplier,
  materialRecoveryMultiplier,
  costReductionMultiplier,
  marginImprovementMultiplier,
  revenueStreamMultiplier,
  calculateDisruptionScore,
  validateClosedLoop,
  compareParadigms,
} from "./engine.js";

/* ─── Individual Multipliers ─── */

describe("equity velocity multiplier", () => {
  it("returns 18x when crossover is day one (0 years)", () => {
    const result = equityVelocityMultiplier(0);
    expect(result.multiplier).toBe(18);
    expect(result.oldWay).toBe(18);
    expect(result.newWay).toBe(0);
  });

  it("returns proportional multiplier for non-zero crossover", () => {
    const result = equityVelocityMultiplier(3);
    expect(result.multiplier).toBe(6);
  });

  it("describes the metric clearly", () => {
    const result = equityVelocityMultiplier(0);
    expect(result.description).toContain("100% to principal");
  });
});

describe("material recovery multiplier", () => {
  it("calculates recovery improvement vs. industry 10%", () => {
    const result = materialRecoveryMultiplier(0.85);
    expect(result.multiplier).toBe(8.5);
    expect(result.oldWay).toBeCloseTo(0.1, 10);
    expect(result.newWay).toBe(0.85);
  });

  it("handles 90% recovery", () => {
    const result = materialRecoveryMultiplier(0.9);
    expect(result.multiplier).toBe(9);
  });
});

describe("cost reduction multiplier", () => {
  it("calculates cost ratio", () => {
    const result = costReductionMultiplier(185_000);
    expect(result.multiplier).toBe(1.9);
    expect(result.oldWay).toBe(350_000);
    expect(result.newWay).toBe(185_000);
  });

  it("describes percentage reduction", () => {
    const result = costReductionMultiplier(185_000);
    expect(result.description).toContain("47%");
  });
});

describe("margin improvement multiplier", () => {
  it("calculates margin ratio", () => {
    const result = marginImprovementMultiplier(0.259);
    expect(result.multiplier).toBe(1.6);
    expect(result.oldWay).toBe(0.16);
  });
});

describe("revenue stream multiplier", () => {
  it("returns stream count as multiplier (0 → N)", () => {
    const result = revenueStreamMultiplier(4);
    expect(result.multiplier).toBe(4);
    expect(result.oldWay).toBe(0);
    expect(result.newWay).toBe(4);
  });

  it("describes all 4 return types", () => {
    const result = revenueStreamMultiplier(4);
    expect(result.description).toContain("material");
    expect(result.description).toContain("ontology");
    expect(result.description).toContain("robot");
    expect(result.description).toContain("market");
  });
});

/* ─── Composite Score ─── */

describe("calculateDisruptionScore", () => {
  it("calculates composite with ML Systems defaults", () => {
    const score = calculateDisruptionScore();
    expect(score.multipliers).toHaveLength(5);
    expect(score.compositeMultiplier).toBeGreaterThan(2);
    expect(["significant", "paradigm_shift"]).toContain(score.category);
    expect(score.antiSaasAligned).toBe(true);
    expect(score.closedLoop).toBe(true);
  });

  it("returns category_creation for extreme disruption", () => {
    const score = calculateDisruptionScore({
      equityCrossoverYears: 0,
      materialRecoveryRate: 0.95,
      costPerHome: 100_000,
      gcMarginPercent: 0.35,
      deconstructionRevenue: 1,
      revenueStreams: 4,
    });
    expect(["paradigm_shift", "category_creation"]).toContain(score.category);
    expect(score.compositeMultiplier).toBeGreaterThanOrEqual(5);
  });

  it("returns incremental for minor improvements", () => {
    const score = calculateDisruptionScore({
      equityCrossoverYears: 15,
      materialRecoveryRate: 0.15,
      costPerHome: 320_000,
      gcMarginPercent: 0.17,
      deconstructionRevenue: 0,
      revenueStreams: 1,
    });
    expect(score.category).toBe("incremental");
  });

  it("marks closed loop as false when < 4 revenue streams", () => {
    const score = calculateDisruptionScore({
      ...ML_SYSTEMS_DEFAULTS,
      revenueStreams: 2,
    });
    expect(score.closedLoop).toBe(false);
  });
});

/* ─── Closed Loop Validation ─── */

describe("validateClosedLoop", () => {
  it("validates complete closed loop", () => {
    const result = validateClosedLoop({
      finance: true,
      deconstruct: true,
      design: true,
      build: true,
    });
    expect(result.intact).toBe(true);
    expect(result.missingStages).toHaveLength(0);
    expect(result.loopEfficiency).toBe(1);
  });

  it("detects missing stages", () => {
    const result = validateClosedLoop({
      finance: true,
      deconstruct: false,
      design: true,
      build: true,
    });
    expect(result.intact).toBe(false);
    expect(result.missingStages).toContain("deconstruct");
    expect(result.loopEfficiency).toBe(0.75);
  });

  it("reports all missing stages", () => {
    const result = validateClosedLoop({
      finance: true,
      deconstruct: false,
      design: false,
      build: false,
    });
    expect(result.missingStages).toHaveLength(3);
    expect(result.loopEfficiency).toBe(0.25);
  });
});

/* ─── Paradigm Comparison ─── */

describe("compareParadigms", () => {
  it("compares traditional vs. ML Systems", () => {
    const comparison = compareParadigms();
    expect(comparison.traditional.model).toBe("linear");
    expect(comparison.mlSystems.model).toBe("closed_loop");
    expect(comparison.traditional.revenueStreams).toBe(0);
    expect(comparison.mlSystems.revenueStreams).toBe(4);
  });

  it("traditional model has no data capture", () => {
    const comparison = compareParadigms();
    expect(comparison.traditional.dataCapture).toBe(false);
    expect(comparison.mlSystems.dataCapture).toBe(true);
  });

  it("traditional uses subscription pricing", () => {
    const comparison = compareParadigms();
    expect(comparison.traditional.pricingModel).toBe("subscription");
    expect(comparison.mlSystems.pricingModel).toBe("outcome_based");
  });

  it("includes disruption score in comparison", () => {
    const comparison = compareParadigms();
    expect(comparison.disruption.compositeMultiplier).toBeGreaterThan(1);
    expect(comparison.disruption.antiSaasAligned).toBe(true);
  });
});

/* ─── Industry Baseline Constants ─── */

describe("industry baseline", () => {
  it("has correct baseline values", () => {
    expect(INDUSTRY_BASELINE.yearsToEquityCrossover).toBe(18);
    expect(INDUSTRY_BASELINE.materialWasteRate).toBe(0.9);
    expect(INDUSTRY_BASELINE.gcMarginPercent).toBe(0.16);
    expect(INDUSTRY_BASELINE.riShingleRecyclers).toBe(0);
    expect(INDUSTRY_BASELINE.demolitionRevenueStreams).toBe(0);
  });
});
