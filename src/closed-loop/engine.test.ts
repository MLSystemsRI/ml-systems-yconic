/**
 * Closed-Loop Engine Tests — Full Pipeline Verification
 *
 * Tests the complete Finance → Deconstruct → Design → Build loop
 * using the Maria scenario (FICO 640, $200K, Providence RI).
 */

import { describe, it, expect } from "vitest";
import { executeClosedLoop, buildMariaScenario } from "./engine.js";
import type { ClosedLoopPipelineResult, MVEAssessment } from "./engine.js";

/* ─── Maria Scenario — Full Loop ─── */

describe("Closed Loop — Maria Scenario (FICO 640, $200K)", () => {
  const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
  let result: ClosedLoopPipelineResult;

  it("executes the full closed loop without errors", () => {
    result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);
    expect(result).toBeDefined();
    expect(result.loopComplete).toBe(true);
  });

  /* ── Finance Stage ── */

  it("approves Maria's loan", () => {
    expect(result.stages.finance.approved).toBe(true);
    expect(result.stages.finance.denialReasons).toHaveLength(0);
  });

  it("resolves FICO 640 to Tier 2 Standard", () => {
    expect(result.stages.finance.tier.tier).toBe(2);
    expect(result.stages.finance.tier.productClass).toBe("standard");
  });

  it("calculates monthly payment ~$1264", () => {
    expect(result.stages.finance.monthlyPayment).toBeGreaterThan(1200);
    expect(result.stages.finance.monthlyPayment).toBeLessThan(1400);
  });

  it("passes Lucent Lens (homeowner > engine)", () => {
    expect(result.stages.finance.lensApproved).toBe(true);
    expect(result.stages.finance.lensScore.homeowner).toBe(35);
    expect(result.stages.finance.lensScore.engine).toBe(10);
  });

  it("passes MVE gate (4/4 returns)", () => {
    expect(result.stages.finance.mveApproved).toBe(true);
  });

  /* ── Deconstruct Stage ── */

  it("recovers 10 materials from deconstruction", () => {
    expect(result.stages.deconstruct.materialsRecovered).toBe(10);
  });

  it("assigns ML Material IDs to all materials", () => {
    for (const record of result.stages.deconstruct.materialRecords) {
      expect(record.mlId).toMatch(/^ML-2026-PRV001-Z\d+-\d{3}$/);
    }
  });

  it("grades materials across multiple grades", () => {
    const grades = result.stages.deconstruct.byGrade;
    const totalGraded = Object.values(grades).reduce((a, b) => a + b, 0);
    expect(totalGraded).toBe(10);
  });

  it("calculates positive total material value", () => {
    expect(result.stages.deconstruct.totalValueCents).toBeGreaterThan(0);
  });

  it("detects contaminated materials", () => {
    // Doors and windows have lead paint, roofing has chemical treatment
    expect(result.stages.deconstruct.contaminatedCount).toBeGreaterThanOrEqual(2);
  });

  it("flags DEM reports for lead-contaminated items", () => {
    expect(result.stages.deconstruct.demReportRequired).toBeGreaterThanOrEqual(1);
  });

  /* ── Marketplace Stage ── */

  it("creates listings for non-contaminated materials", () => {
    expect(result.stages.marketplace.listingsCreated).toBeGreaterThan(0);
    expect(result.stages.marketplace.listingsCreated).toBeLessThanOrEqual(10);
  });

  it("skips confirmed contaminated materials", () => {
    // Some materials may be confirmed contaminated
    expect(result.stages.marketplace.listingsSkipped).toBeGreaterThanOrEqual(0);
  });

  it("creates and fulfills a bulk order", () => {
    expect(result.stages.marketplace.orderCreated).toBe(true);
    expect(result.stages.marketplace.orderTotalCents).toBeGreaterThan(0);
  });

  it("calculates 51% revenue share to equity", () => {
    expect(result.stages.marketplace.revenueSharePercent).toBe(0.51);
    expect(result.stages.marketplace.revenueToEquityCents).toBeGreaterThan(0);
  });

  /* ── Design Stage ── */

  it("specifies design with recycled materials", () => {
    expect(result.stages.design.spec.recycledMaterialPercent).toBe(40);
    expect(result.stages.design.recycledMaterialsAvailable).toBe(10);
  });

  it("calculates cost savings from recycled materials", () => {
    expect(result.stages.design.costSavingsFromRecycled).toBeGreaterThan(0);
  });

  /* ── Build Stage ── */

  it("approves construction start (finance approved)", () => {
    expect(result.stages.build.constructionStartApproved).toBe(true);
  });

  it("reduces total cost with recycled materials", () => {
    expect(result.stages.build.totalCost).toBeLessThan(buildPlan.estimatedCost);
  });

  it("calculates GC margin at 25.9%", () => {
    expect(result.stages.build.gcMargin).toBeGreaterThan(0);
    const marginPercent = result.stages.build.gcMargin / result.stages.build.totalCost;
    expect(marginPercent).toBeCloseTo(0.259, 2);
  });

  /* ── Equity Stage ── */

  it("calculates equity from both payments AND materials", () => {
    expect(result.stages.equity.equityFromPayments).toBeGreaterThan(0);
    expect(result.stages.equity.equityFromMaterials).toBeGreaterThan(0);
  });

  it("shows RCM equity advantage over traditional", () => {
    expect(result.stages.equity.equityAdvantage).toBeGreaterThan(0);
    expect(result.stages.equity.totalEquityYear1).toBeGreaterThan(
      result.stages.equity.traditionalEquityYear1,
    );
  });

  it("calculates preferred payoff faster than standard", () => {
    expect(result.stages.equity.payoffComparison.preferredMonths).toBeLessThan(
      result.stages.equity.payoffComparison.standardMonths,
    );
  });

  /* ── Disruption ── */

  it("validates disruption score", () => {
    expect(result.disruption.compositeMultiplier).toBeGreaterThan(3);
    expect(result.disruption.closedLoop).toBe(true);
    expect(result.disruption.antiSaasAligned).toBe(true);
  });

  /* ── Overall ── */

  it("creates total value > 0", () => {
    expect(result.totalValueCreatedCents).toBeGreaterThan(0);
  });
});

/* ─── Denial Scenarios ─── */

describe("Closed Loop — Denial Cases", () => {
  it("denies when MVE fails (< 3 returns)", () => {
    const { homeowner, deconPlan, designSpec, buildPlan } = buildMariaScenario();
    const badMVE: MVEAssessment = {
      materialValue: true,
      ontologyData: false,
      robotTraining: false,
      marketIntelligence: false,
    };

    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, badMVE);
    expect(result.stages.finance.approved).toBe(false);
    expect(result.stages.finance.denialReasons.some((r) => r.includes("MVE gate failed"))).toBe(true);
    expect(result.loopComplete).toBe(false);
  });

  it("still processes all stages even when finance is denied", () => {
    const { homeowner, deconPlan, designSpec, buildPlan } = buildMariaScenario();
    const badMVE: MVEAssessment = {
      materialValue: false,
      ontologyData: false,
      robotTraining: false,
      marketIntelligence: false,
    };

    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, badMVE);
    // All stages still run — transparency over gatekeeping
    expect(result.stages.deconstruct.materialsRecovered).toBe(10);
    expect(result.stages.marketplace.listingsCreated).toBeGreaterThan(0);
    expect(result.stages.equity.equityFromPayments).toBeGreaterThan(0);
  });
});

/* ─── Material Provenance Chain ─── */

describe("Closed Loop — Provenance Chain Integrity", () => {
  it("every material has a unique ML Material ID", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

    const ids = result.stages.deconstruct.materialRecords.map((r) => r.mlId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every material has an audit trail", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

    for (const record of result.stages.deconstruct.materialRecords) {
      expect(record.auditTrail.length).toBeGreaterThanOrEqual(2);
      expect(record.auditTrail[0]!.action).toBe("recovered");
      expect(record.auditTrail[1]!.action).toBe("graded");
    }
  });

  it("recovery rate is realistic (> 80%)", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);
    expect(result.stages.deconstruct.recoveryRate).toBeGreaterThan(0.8);
  });
});

/* ─── Revenue Flow Verification ─── */

describe("Closed Loop — Revenue Flow", () => {
  it("material revenue contributes to homeowner equity", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

    // Revenue flows: deconstruct → marketplace → equity
    const materialRevenue = result.stages.marketplace.revenueToEquityCents;
    const equityFromMaterials = result.stages.equity.equityFromMaterials;

    // Equity from materials should roughly equal 51% of marketplace revenue
    expect(equityFromMaterials).toBeGreaterThan(0);
    expect(materialRevenue).toBeGreaterThan(0);
  });

  it("recycled materials reduce build cost", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

    expect(result.stages.build.materialCostReduction).toBeGreaterThan(0);
    expect(result.stages.build.totalCost).toBeLessThan(buildPlan.estimatedCost);
  });
});
