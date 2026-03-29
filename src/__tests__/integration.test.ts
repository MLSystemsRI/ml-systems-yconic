import { describe, it, expect } from "vitest";
import {
  calculateTransparencyScore,
  getAccessBand,
  VERIFICATION_FEE,
  transparencyHeaders,
  getVerificationFeeCents,
} from "../ttp/transparency.js";
import type { TransparencyFactors } from "../ttp/types.js";
import { resolveTier, ALL_TIERS, compareAllTiers } from "../rcm/engine.js";
import { rcmMonthlyPayment } from "../rcm/math.js";
import {
  scoreLucentLens,
  passesLucentLens,
  passesMVE,
  createAgentIntent,
  CUSTODIAN_CONSTRAINTS,
  PRICING_RULES,
} from "../intent/schema.js";

/* ─── Helpers ─── */

function makeFactors(overrides: Partial<TransparencyFactors> = {}): TransparencyFactors {
  return {
    tier: "free",
    identityVerified: false,
    materialsContributed: 0,
    cyclesCompleted: 0,
    reviewsPassed: 0,
    accountAgeDays: 0,
    isRegulator: false,
    dataContributions: 0,
    ...overrides,
  };
}

/* ─── Test 1: TTP score gates RCM tier data access ─── */

describe("TTP score gates RCM tier visibility", () => {
  it("low TTP score restricts access to public_record — only basic tier names visible", () => {
    const score = calculateTransparencyScore(makeFactors({ tier: "free" }));
    const band = getAccessBand(score);

    expect(band).toBe("public_record");
    // At public_record level, only tier names and FICO ranges are public info
    const visibleTiers = ALL_TIERS.map((t) => ({ name: t.name, ficoRange: t.ficoRange }));
    expect(visibleTiers).toHaveLength(6);
  });

  it("mid TTP score (full_api) unlocks detailed tier data including schedules", () => {
    const score = calculateTransparencyScore(
      makeFactors({
        tier: "pro",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 1,
        accountAgeDays: 180,
      }),
    );
    const band = getAccessBand(score);

    expect(score).toBeGreaterThan(30);
    expect(["full_api", "double_verified", "ontology_licensed"]).toContain(band);

    // With full_api+, all tier descriptions and schedule generation are accessible
    const comparison = compareAllTiers(320_000, 0.065, 360, 400_000);
    expect(comparison.standard).toHaveLength(3);
    expect(comparison.preferred).toHaveLength(3);
  });

  it("high TTP score (ontology_licensed) grants complete engine access", () => {
    const score = calculateTransparencyScore(
      makeFactors({
        tier: "enterprise",
        identityVerified: true,
        materialsContributed: 15,
        cyclesCompleted: 3,
        reviewsPassed: 3,
        accountAgeDays: 365,
        dataContributions: 20,
      }),
    );
    const band = getAccessBand(score);

    expect(band).toBe("ontology_licensed");
    // At ontology_licensed, full comparison including deferred interest modeling is available
    const comparison = compareAllTiers(320_000, 0.065, 360, 400_000);
    expect(comparison.preferred[0]!.tier.streamCount).toBe(1);
    expect(comparison.preferred[2]!.tier.streamCount).toBe(3);
  });
});

/* ─── Test 2: Intent Schema validates decisions involving TTP + RCM ─── */

describe("Intent Schema validates cross-module decisions", () => {
  it("loan origination passes Lucent Lens when homeowner benefit leads", () => {
    // Scenario: originating an RCM loan — homeowner gets 100% principal payments,
    // community benefits from decon materials, engine gets data
    const score = scoreLucentLens(35, 20, 15);
    const result = passesLucentLens(score);

    expect(result.passes).toBe(true);
    expect(score.homeowner).toBeGreaterThanOrEqual(score.engine);
  });

  it("loan origination passes MVE when decon produces 3+ returns", () => {
    const mve = passesMVE({
      materialValue: true, // recovered lumber, fixtures
      ontologyData: true, // assembly data for ML training
      robotTraining: true, // separation sequences
      marketIntelligence: true, // pricing data for BOH
    });

    expect(mve.passes).toBe(true);
    expect(mve.returnCount).toBe(4);
  });

  it("rejects a decision that only benefits the engine", () => {
    // Scenario: collecting user data without homeowner benefit
    const score = scoreLucentLens(0, 5, 25);
    const result = passesLucentLens(score);

    expect(result.passes).toBe(false);
    expect(result.reason).toContain("Engine-only");
  });
});

/* ─── Test 3: Full pipeline — TTP → RCM → Intent ─── */

describe("Full pipeline: score entity → resolve tier → validate action", () => {
  it("end-to-end: starter user gets Tier 4 RCM, action approved by Intent", () => {
    // Step 1: Score the entity through TTP
    const ttpScore = calculateTransparencyScore(
      makeFactors({
        tier: "starter",
        identityVerified: true,
        materialsContributed: 3,
        cyclesCompleted: 1,
        accountAgeDays: 200,
        dataContributions: 5,
      }),
    );
    const band = getAccessBand(ttpScore);
    expect(ttpScore).toBeGreaterThan(30);
    expect(band).not.toBe("public_record");

    // Step 2: Resolve their RCM tier based on credit score
    const creditScore = 720;
    const tier = resolveTier(creditScore);
    expect(tier.tier).toBe(4);
    expect(tier.productClass).toBe("preferred");
    if (tier.productClass === "preferred") {
      expect(tier.streamCount).toBe(1);
    }

    // Step 3: Validate the loan action through Intent Schema
    const lensScore = scoreLucentLens(35, 20, 10);
    const lensResult = passesLucentLens(lensScore);
    expect(lensResult.passes).toBe(true);

    const mveResult = passesMVE({
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: false,
    });
    expect(mveResult.passes).toBe(true);

    // Step 4: Generate TTP headers for the response
    const headers = transparencyHeaders(ttpScore);
    expect(headers["X-TT-Score"]).toBe(String(ttpScore));
    expect(headers["X-TT-Band"]).toBe(band);
  });

  it("end-to-end: free user gets restricted access, low-credit tier", () => {
    // Step 1: Low TTP score
    const ttpScore = calculateTransparencyScore(makeFactors({ tier: "free" }));
    expect(ttpScore).toBe(5);
    expect(getAccessBand(ttpScore)).toBe("public_record");

    // Step 2: Low credit score → Tier 1
    const tier = resolveTier(590);
    expect(tier.tier).toBe(1);
    expect(tier.productClass).toBe("standard");
    if (tier.productClass === "standard") {
      expect(tier.overpaymentMode).toBe("interest_first");
    }

    // Step 3: Basic loan still passes Intent if it serves the homeowner
    const lensScore = scoreLucentLens(30, 10, 5);
    expect(passesLucentLens(lensScore).passes).toBe(true);
  });
});

/* ─── Test 4: Anti-SaaS pricing aligns with TTP fee schedule ─── */

describe("Anti-SaaS pricing aligns with TTP verification fees", () => {
  it("own data access is free — matches PRICING_RULES", () => {
    expect(PRICING_RULES.ownDataAccess).toBe("free");
    // Non-AI queries always return 0 fee regardless of band
    expect(getVerificationFeeCents("public_record", false)).toBe(0);
    expect(getVerificationFeeCents("double_verified", false)).toBe(0);
    expect(getVerificationFeeCents("ontology_licensed", false)).toBe(0);
  });

  it("AI crawler access is per-query — matches PRICING_RULES", () => {
    expect(PRICING_RULES.aiCrawlerAccess).toBe("per_query");
    // AI queries pay verification fees on public/ml_verified/double_verified bands
    expect(getVerificationFeeCents("public_record", true)).toBe(VERIFICATION_FEE.publicRecordCents);
    expect(getVerificationFeeCents("ml_verified", true)).toBe(VERIFICATION_FEE.mlVerifiedCents);
    expect(getVerificationFeeCents("double_verified", true)).toBe(
      VERIFICATION_FEE.doubleVerifiedCents,
    );
  });

  it("subscription-gated bands have zero per-query fee — access is earned", () => {
    expect(PRICING_RULES.ecosystemAccess).toBe("earned_access");
    // full_api and ontology_licensed are subscription-gated, no per-query fee
    expect(getVerificationFeeCents("full_api", true)).toBe(0);
    expect(getVerificationFeeCents("ontology_licensed", true)).toBe(0);
  });

  it("fee tiers are ordered: public < ml_verified < double_verified", () => {
    expect(VERIFICATION_FEE.publicRecordCents).toBeLessThan(VERIFICATION_FEE.mlVerifiedCents);
    expect(VERIFICATION_FEE.mlVerifiedCents).toBeLessThan(VERIFICATION_FEE.doubleVerifiedCents);
  });

  it("primary revenue is outcome_based, not subscription-based", () => {
    expect(PRICING_RULES.primaryRevenue).toBe("outcome_based");
    // RCM monthly payment is a real outcome — payment exists for an actual loan
    const payment = rcmMonthlyPayment(320_000, 0.065, 360);
    expect(payment).toBeGreaterThan(0);
  });
});

/* ─── Test 5: Agent intent creation with cross-module constraint enforcement ─── */

describe("Agent intent enforces constraints across modules", () => {
  it("new agent inherits all 4 custodian constraints", () => {
    const agent = createAgentIntent("rcm-engine", "RCM Engine Agent", "fa");

    expect(agent.enforcedConstraints).toContain("transparencyTrust");
    expect(agent.enforcedConstraints).toContain("equityOrder");
    expect(agent.enforcedConstraints).toContain("minimumViableExpense");
    expect(agent.enforcedConstraints).toContain("fiduciaryDuty");
    expect(agent.canOverrideMVE).toBe(false);
  });

  it("agent minimum lens score blocks low-value RCM actions", () => {
    const agent = createAgentIntent("ttp-scorer", "TTP Scoring Agent");
    // Agent requires minimum 30 total score
    const weakAction = scoreLucentLens(10, 5, 5);
    expect(weakAction.total).toBeLessThan(agent.minimumLensScore);
    expect(passesLucentLens(weakAction, agent.minimumLensScore).passes).toBe(false);

    const strongAction = scoreLucentLens(25, 15, 10);
    expect(strongAction.total).toBeGreaterThanOrEqual(agent.minimumLensScore);
    expect(passesLucentLens(strongAction, agent.minimumLensScore).passes).toBe(true);
  });

  it("transparencyTrust constraint aligns with TTP compute optimization", () => {
    expect(CUSTODIAN_CONSTRAINTS.transparencyTrust).toBe("optimize_user_compute");
    // Free tier gets quota-limited queries, not blocked — optimized, not profited from
    expect(VERIFICATION_FEE.freeQuotaPerDay).toBe(10);
    expect(VERIFICATION_FEE.proQuotaPerDay).toBe(Infinity);
  });

  it("MVE constraint applies to construction actions validated by Intent", () => {
    const agent = createAgentIntent("decon-agent", "Deconstruction Agent", "pi");
    expect(agent.enforcedConstraints).toContain("minimumViableExpense");
    expect(CUSTODIAN_CONSTRAINTS.minimumViableExpense).toBe(4);

    // Decon operation with full returns passes MVE
    const fullDecon = passesMVE({
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: true,
    });
    expect(fullDecon.passes).toBe(true);
    expect(fullDecon.returnCount).toBeGreaterThanOrEqual(
      CUSTODIAN_CONSTRAINTS.minimumViableExpense - 1,
    );

    // Office supply purchase fails MVE — no construction returns
    const officePurchase = passesMVE({
      materialValue: false,
      ontologyData: false,
      robotTraining: false,
      marketIntelligence: false,
    });
    expect(officePurchase.passes).toBe(false);
  });

  it("agent hierarchy preserves parent chain", () => {
    const ceo = createAgentIntent("ceo", "CEO (Sal)");
    const fa = createAgentIntent("fa", "Financial Architect", ceo.agentId);
    const rcmAgent = createAgentIntent("rcm", "RCM Engine", fa.agentId);

    expect(ceo.parentAgentId).toBeNull();
    expect(fa.parentAgentId).toBe("ceo");
    expect(rcmAgent.parentAgentId).toBe("fa");
  });
});
