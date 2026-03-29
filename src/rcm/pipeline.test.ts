import { describe, it, expect } from "vitest";
import { processLoanApplication, checkEligibility, equityAdvantage } from "./pipeline.js";
import type { LoanApplication } from "./pipeline.js";
import type { TransparencyFactors } from "../ttp/types.js";

/* ─── Fixtures ─── */

function makeFactors(overrides: Partial<TransparencyFactors> = {}): TransparencyFactors {
  return {
    tier: "starter",
    identityVerified: true,
    materialsContributed: 3,
    cyclesCompleted: 1,
    reviewsPassed: 1,
    accountAgeDays: 120,
    isRegulator: false,
    dataContributions: 5,
    ...overrides,
  };
}

function makeApplication(overrides: Partial<LoanApplication> = {}): LoanApplication {
  return {
    applicantId: "APP-001",
    creditScore: 720,
    loanAmount: 320_000,
    annualRate: 0.065,
    termMonths: 360,
    propertyValue: 400_000,
    ttpFactors: makeFactors(),
    mve: {
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: true,
    },
    ...overrides,
  };
}

/* ─── Full Pipeline ─── */

describe("processLoanApplication", () => {
  it("approves a qualified applicant end-to-end", () => {
    const result = processLoanApplication(makeApplication());

    expect(result.approved).toBe(true);
    expect(result.denialReasons).toHaveLength(0);
    expect(result.applicantId).toBe("APP-001");
    expect(result.processedAt).toBeInstanceOf(Date);
  });

  it("returns complete TTP stage results", () => {
    const result = processLoanApplication(makeApplication());

    expect(result.ttp.score).toBeGreaterThan(15);
    expect(result.ttp.meetsMinimum).toBe(true);
    expect(result.ttp.band).toBeDefined();
    expect(result.ttp.minimumRequired).toBe(15);
  });

  it("returns credit tier and payment data", () => {
    const result = processLoanApplication(makeApplication());

    expect(result.credit).not.toBeNull();
    expect(result.credit!.tier.tier).toBe(4);
    expect(result.credit!.tier.productClass).toBe("preferred");
    expect(result.credit!.monthlyPayment).toBeGreaterThan(0);
    expect(result.credit!.equityAtYear5).toBeGreaterThan(0);
    expect(result.credit!.equityAtYear10).toBeGreaterThan(result.credit!.equityAtYear5);
  });

  it("generates preferred schedule for tier 4+ applicants", () => {
    const result = processLoanApplication(makeApplication({ creditScore: 720 }));

    expect(result.schedule).not.toBeNull();
    expect(result.schedule!.type).toBe("preferred");
    expect(result.schedule!.preferredSchedule).not.toBeNull();
    expect(result.schedule!.preferredSchedule!.length).toBeGreaterThan(0);
    expect(result.schedule!.principalPayoffDay).toBeGreaterThan(0);
  });

  it("generates standard schedule for tier 1-3 applicants", () => {
    const result = processLoanApplication(makeApplication({ creditScore: 590 }));

    expect(result.schedule).not.toBeNull();
    expect(result.schedule!.type).toBe("standard");
    expect(result.schedule!.standardSchedule).not.toBeNull();
    expect(result.schedule!.standardSchedule!.length).toBeGreaterThan(0);
    expect(result.schedule!.principalPayoffMonth).toBeGreaterThan(0);
  });

  it("passes intent validation for homeowner-first RCM loan", () => {
    const result = processLoanApplication(makeApplication());

    expect(result.intent.lensApproved).toBe(true);
    expect(result.intent.lensScore.homeowner).toBeGreaterThan(result.intent.lensScore.engine);
    expect(result.intent.mveApproved).toBe(true);
    expect(result.intent.mveReturnCount).toBe(4);
  });
});

/* ─── Denial Scenarios ─── */

describe("pipeline denial scenarios", () => {
  it("denies when TTP score is too low", () => {
    const result = processLoanApplication(
      makeApplication({
        ttpFactors: {
          tier: "free",
          identityVerified: false,
          materialsContributed: 0,
          cyclesCompleted: 0,
          reviewsPassed: 0,
          accountAgeDays: 0,
          isRegulator: false,
          dataContributions: 0,
        },
      }),
    );

    expect(result.approved).toBe(false);
    expect(result.denialReasons).toContain("ttp_score_too_low");
    // Pipeline continues — credit and schedule still generated
    expect(result.credit).not.toBeNull();
  });

  it("denies when MVE gate fails", () => {
    const result = processLoanApplication(
      makeApplication({
        mve: {
          materialValue: true,
          ontologyData: false,
          robotTraining: false,
          marketIntelligence: false,
        },
      }),
    );

    expect(result.approved).toBe(false);
    expect(result.denialReasons).toContain("mve_gate_failed");
    expect(result.intent.mveReturnCount).toBe(1);
  });

  it("denies when credit score is out of range", () => {
    const result = processLoanApplication(makeApplication({ creditScore: 200 }));

    expect(result.approved).toBe(false);
    expect(result.denialReasons).toContain("credit_score_out_of_range");
    expect(result.credit).toBeNull();
    expect(result.schedule).toBeNull();
  });

  it("collects ALL denial reasons — never short-circuits", () => {
    const result = processLoanApplication(
      makeApplication({
        creditScore: 200,
        ttpFactors: {
          tier: "free",
          identityVerified: false,
          materialsContributed: 0,
          cyclesCompleted: 0,
          reviewsPassed: 0,
          accountAgeDays: 0,
          isRegulator: false,
          dataContributions: 0,
        },
        mve: {
          materialValue: false,
          ontologyData: false,
          robotTraining: false,
          marketIntelligence: false,
        },
      }),
    );

    expect(result.approved).toBe(false);
    expect(result.denialReasons.length).toBeGreaterThanOrEqual(2);
    expect(result.denialReasons).toContain("ttp_score_too_low");
    expect(result.denialReasons).toContain("credit_score_out_of_range");
    expect(result.denialReasons).toContain("mve_gate_failed");
  });
});

/* ─── Eligibility Check ─── */

describe("checkEligibility", () => {
  it("confirms eligibility for qualified applicant", () => {
    const result = checkEligibility(makeFactors(), 720);

    expect(result.eligible).toBe(true);
    expect(result.ttpScore).toBeGreaterThan(15);
    expect(result.tier).not.toBeNull();
    expect(result.tier!.tier).toBe(4);
    expect(result.reasons).toHaveLength(0);
  });

  it("flags low TTP score", () => {
    const result = checkEligibility(
      {
        tier: "free",
        identityVerified: false,
        materialsContributed: 0,
        cyclesCompleted: 0,
        reviewsPassed: 0,
        accountAgeDays: 0,
        isRegulator: false,
        dataContributions: 0,
      },
      720,
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("TTP score"))).toBe(true);
  });

  it("flags invalid credit score", () => {
    const result = checkEligibility(makeFactors(), 200);

    expect(result.eligible).toBe(false);
    expect(result.tier).toBeNull();
    expect(result.reasons.some((r) => r.includes("Credit score"))).toBe(true);
  });
});

/* ─── Equity Advantage ─── */

describe("equityAdvantage", () => {
  it("shows RCM builds equity faster at every milestone", () => {
    const advantage = equityAdvantage(320_000, 0.065, 360, 400_000);

    // Year 1: RCM advantage should be significant
    expect(advantage.year1.rcm).toBeGreaterThan(advantage.year1.traditional);
    expect(advantage.year1.advantage).toBeGreaterThan(0);

    // Year 5: advantage compounds
    expect(advantage.year5.advantage).toBeGreaterThan(advantage.year1.advantage);

    // Year 10: advantage continues growing
    expect(advantage.year10.advantage).toBeGreaterThan(advantage.year5.advantage);
  });

  it("calculates realistic equity values", () => {
    const advantage = equityAdvantage(320_000, 0.065, 360, 400_000);

    // RCM at year 5: should have significant equity
    // Monthly payment ~$2023, so 60 months × $2023 = ~$121,380 paid to principal
    // Equity = $400K - ($320K - $121K) = ~$201K
    expect(advantage.year5.rcm).toBeGreaterThan(150_000);
    expect(advantage.year5.rcm).toBeLessThan(250_000);

    // Traditional at year 5: much less equity (mostly interest in early years)
    expect(advantage.year5.traditional).toBeLessThan(advantage.year5.rcm);
  });

  it("shows the 18x equity velocity advantage in real dollars", () => {
    const advantage = equityAdvantage(320_000, 0.065, 360, 400_000);

    // The year 1 RCM advantage should be substantial because
    // traditional mortgages pay mostly interest in year 1
    // while RCM puts 100% to principal
    expect(advantage.year1.advantage).toBeGreaterThan(10_000);
  });
});

/* ─── Pipeline with Different Credit Tiers ─── */

describe("pipeline across credit tiers", () => {
  const tiers = [
    { score: 590, expectedTier: 1, expectedClass: "standard" },
    { score: 650, expectedTier: 2, expectedClass: "standard" },
    { score: 680, expectedTier: 3, expectedClass: "standard" },
    { score: 720, expectedTier: 4, expectedClass: "preferred" },
    { score: 770, expectedTier: 5, expectedClass: "preferred" },
    { score: 810, expectedTier: 6, expectedClass: "preferred" },
  ] as const;

  for (const { score, expectedTier, expectedClass } of tiers) {
    it(`FICO ${score} → Tier ${expectedTier} (${expectedClass})`, () => {
      const result = processLoanApplication(makeApplication({ creditScore: score }));

      expect(result.approved).toBe(true);
      expect(result.credit!.tier.tier).toBe(expectedTier);
      expect(result.credit!.tier.productClass).toBe(expectedClass);
      expect(result.schedule!.type).toBe(expectedClass);
    });
  }
});
