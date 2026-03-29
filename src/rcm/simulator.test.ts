/**
 * RCM Equity Simulator Tests
 *
 * Verifies month-by-month equity comparison between
 * RCM and traditional mortgages.
 */

import { describe, it, expect } from "vitest";
import { simulateEquity, simulateMaria, extractKeyPoints } from "./simulator.js";
import type { SimulationInput } from "./simulator.js";

const DEFAULT_INPUT: SimulationInput = {
  loanAmount: 200_000,
  annualRate: 0.065,
  termMonths: 360,
  propertyValue: 280_000,
  appreciationRate: 0.03,
  monthlyMaterialRevenueCents: 50_000,
  materialRevenueSharePercent: 0.51,
};

describe("RCM Equity Simulator — Core", () => {
  it("produces 360 monthly snapshots", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.snapshots).toHaveLength(360);
  });

  it("RCM always builds more equity than traditional", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    // Check year 1, 5, 10
    for (const month of [12, 60, 120]) {
      const snap = result.snapshots[month - 1]!;
      expect(snap.rcm.totalEquity).toBeGreaterThan(snap.traditional.equity);
      expect(snap.delta.equityAdvantage).toBeGreaterThan(0);
    }
  });

  it("RCM balance decreases faster than traditional", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    const year1 = result.snapshots[11]!;
    expect(year1.rcm.balance).toBeLessThan(year1.traditional.balance);
  });

  it("traditional interest exceeds principal early on", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    const month1 = result.snapshots[0]!;
    expect(month1.traditional.interestPaid).toBeGreaterThan(month1.traditional.principalPaid);
  });

  it("interest saved grows monotonically", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    for (let i = 1; i < result.snapshots.length; i++) {
      expect(result.snapshots[i]!.delta.cumulativeInterestSaved).toBeGreaterThanOrEqual(
        result.snapshots[i - 1]!.delta.cumulativeInterestSaved,
      );
    }
  });

  it("material equity grows month over month", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    for (let i = 1; i < result.snapshots.length; i++) {
      expect(result.snapshots[i]!.rcm.materialEquity).toBeGreaterThanOrEqual(
        result.snapshots[i - 1]!.rcm.materialEquity,
      );
    }
  });

  it("property value appreciates over time", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    const first = result.snapshots[0]!;
    const last = result.snapshots[359]!;
    expect(last.propertyValue).toBeGreaterThan(first.propertyValue);
  });
});

describe("RCM Equity Simulator — Milestones", () => {
  it("RCM reaches 20% equity before or same as traditional", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.milestones.rcm20PercentEquityMonth).not.toBeNull();
    expect(result.milestones.traditional20PercentEquityMonth).not.toBeNull();
    expect(result.milestones.rcm20PercentEquityMonth!).toBeLessThanOrEqual(
      result.milestones.traditional20PercentEquityMonth!,
    );
  });

  it("traditional crossover happens (principal > interest)", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.milestones.traditionalCrossoverMonth).not.toBeNull();
    // For 30-year at 6.5%, crossover is typically around month 216 (18 years)
    expect(result.milestones.traditionalCrossoverMonth!).toBeGreaterThan(150);
  });

  it("RCM pays off before traditional", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.milestones.rcmPayoffMonth).not.toBeNull();
    expect(result.milestones.rcmPayoffMonth!).toBeLessThan(
      result.milestones.traditionalPayoffMonth,
    );
  });
});

describe("RCM Equity Simulator — Summary", () => {
  it("total interest saved is substantial", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    // Traditional 30-year at 6.5% on $200K = ~$255K total interest
    expect(result.summary.totalInterestSaved).toBeGreaterThan(200_000);
  });

  it("material equity contributes meaningfully", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.summary.totalMaterialEquity).toBeGreaterThan(0);
    // $500/mo * 51% * N months
    expect(result.summary.totalMaterialEquity).toBeGreaterThan(50_000);
  });

  it("equity multiplier > 1 (RCM wins)", () => {
    const result = simulateEquity(DEFAULT_INPUT);
    expect(result.summary.equityMultiplier).toBeGreaterThan(1);
  });
});

describe("RCM Equity Simulator — Maria Scenario", () => {
  it("produces a valid simulation", () => {
    const result = simulateMaria();
    expect(result.snapshots).toHaveLength(360);
    expect(result.rcmPayment).toBeGreaterThan(1200);
    expect(result.rcmPayment).toBeLessThan(1400);
  });

  it("Maria's year-1 RCM equity exceeds traditional", () => {
    const result = simulateMaria();
    const year1 = result.snapshots[11]!;
    expect(year1.rcm.totalEquity).toBeGreaterThan(year1.traditional.equity);
    expect(year1.delta.equityAdvantage).toBeGreaterThan(0);
  });
});

describe("RCM Equity Simulator — Key Points", () => {
  it("extracts 5 key year snapshots", () => {
    const result = simulateMaria();
    const points = extractKeyPoints(result);
    expect(points).toHaveLength(5);
    expect(points.map((p) => p.year)).toEqual([1, 5, 10, 20, 30]);
  });

  it("equity advantage grows over time", () => {
    const result = simulateMaria();
    const points = extractKeyPoints(result);
    // Year 1 advantage < year 5 advantage
    expect(points[1]!.snapshot.delta.equityAdvantage).toBeGreaterThan(
      points[0]!.snapshot.delta.equityAdvantage,
    );
  });
});

describe("RCM Equity Simulator — Short Term Loan", () => {
  it("handles a short 60-month loan with fast payoff", () => {
    const result = simulateEquity({
      loanAmount: 50_000,
      annualRate: 0.065,
      termMonths: 60,
      propertyValue: 100_000,
      appreciationRate: 0.02,
      monthlyMaterialRevenueCents: 20_000,
      materialRevenueSharePercent: 0.51,
    });

    expect(result.snapshots).toHaveLength(60);
    expect(result.milestones.rcmPayoffMonth).not.toBeNull();
    // Short term = RCM pays off quickly
    expect(result.milestones.rcmPayoffMonth!).toBeLessThanOrEqual(60);
    // Traditional crossover happens relatively late even on short loans
    expect(result.milestones.traditionalCrossoverMonth).not.toBeNull();
  });

  it("handles very low interest rate", () => {
    const result = simulateEquity({
      loanAmount: 100_000,
      annualRate: 0.001,
      termMonths: 120,
      propertyValue: 150_000,
      appreciationRate: 0,
      monthlyMaterialRevenueCents: 0,
      materialRevenueSharePercent: 0.51,
    });

    expect(result.snapshots).toHaveLength(120);
    // With near-0% interest, traditional interest is minimal
    expect(result.summary.totalInterestPaid).toBeLessThan(1000);
  });

  it("handles high material revenue boosting early milestone", () => {
    const result = simulateEquity({
      loanAmount: 200_000,
      annualRate: 0.065,
      termMonths: 360,
      propertyValue: 250_000,
      appreciationRate: 0.03,
      monthlyMaterialRevenueCents: 500_000, // $5000/mo — very high
      materialRevenueSharePercent: 0.51,
    });

    expect(result.milestones.rcm20PercentEquityMonth).toBe(1); // Immediate 20% with high material revenue
    expect(result.summary.totalMaterialEquity).toBeGreaterThan(500_000);
  });
});

describe("RCM Equity Simulator — No Material Revenue", () => {
  it("RCM still wins without material recovery", () => {
    const result = simulateEquity({
      ...DEFAULT_INPUT,
      monthlyMaterialRevenueCents: 0,
    });

    const year5 = result.snapshots[59]!;
    expect(year5.rcm.totalEquity).toBeGreaterThan(year5.traditional.equity);
    expect(year5.rcm.materialEquity).toBe(0);
  });
});
