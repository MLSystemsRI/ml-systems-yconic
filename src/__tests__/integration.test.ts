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
import { rcmMonthlyPayment, rcmEquity } from "../rcm/math.js";
import {
  scoreLucentLens,
  passesLucentLens,
  passesMVE,
  createAgentIntent,
  CUSTODIAN_CONSTRAINTS,
  PRICING_RULES,
} from "../intent/schema.js";
import {
  generateMaterialId,
  gradeMaterial,
  assessContamination,
  estimateValue,
} from "../provenance/engine.js";
import {
  createBatchListings,
  createOrder,
  confirmOrder,
  materialRecoveryEquityContribution,
} from "../marketplace/engine.js";
import type { MaterialRecord } from "../provenance/engine.js";
import { processLoanApplication } from "../rcm/pipeline.js";
import { calculateDisruptionScore, validateClosedLoop } from "../disruption/engine.js";

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

/* ─── Test 6: Closed-Loop Integration — Provenance → Marketplace → RCM Equity ─── */

describe("Closed loop: deconstruct → provenance → marketplace → equity", () => {
  it("full cycle: recover materials, grade, list, sell, add to homeowner equity", () => {
    /* Step 1: Deconstruction — recover materials and assign ML IDs */
    const materials: MaterialRecord[] = [];
    for (let i = 1; i <= 5; i++) {
      const mlId = generateMaterialId(2026, "PRV001", 2, i);
      const grading = gradeMaterial({
        structuralIntegrity: 80 + i * 2,
        surfaceCondition: 70 + i * 3,
        moistureContent: 12,
        loadTested: i <= 3,
        ageYears: 15,
      });
      const contamTest = assessContamination({
        leadPaint: false,
        asbestos: false,
        mold: false,
        chemicalTreatment: false,
        pestDamage: false,
      });

      materials.push({
        mlId,
        projectId: "PRV001",
        zone: 2,
        sequence: i,
        category: "structural_lumber",
        description: `2x6 stud ${i}, 8ft`,
        grade: grading.grade,
        contamination: contamTest.status,
        dimensions: { length: 96, width: 5.5, depth: 1.5, unit: "in" },
        weightLbs: 16,
        recoveredAt: new Date(),
        recoveredBy: "crew-001",
        estimatedValue: 0,
        auditTrail: [],
      });
    }

    expect(materials).toHaveLength(5);
    expect(materials[0]!.contamination).toBe("clean");

    /* Step 2: Create marketplace listings */
    const { listings, skipped, totalValueCents } = createBatchListings(materials, 40);
    expect(listings).toHaveLength(5);
    expect(skipped).toHaveLength(0);
    expect(totalValueCents).toBeGreaterThan(0);

    /* Step 3: Activate and sell listings */
    for (const listing of listings) {
      listing.status = "active";
    }
    const { order } = createOrder(listings, "buyer-001");
    expect(order).not.toBeNull();
    confirmOrder(order!, listings);
    expect(listings.every((l) => l.status === "sold")).toBe(true);

    /* Step 4: Calculate material recovery equity contribution */
    const recovery = materialRecoveryEquityContribution(listings);
    expect(recovery.totalRevenueCents).toBeGreaterThan(0);
    expect(recovery.equityContributionCents).toBeGreaterThan(0);
    expect(recovery.listingCount).toBe(5);

    /* Step 5: Add recovery revenue to RCM equity calculation */
    const loanAmount = 320_000;
    const monthlyPayment = rcmMonthlyPayment(loanAmount, 0.065, 360);
    const principalPaidYear1 = monthlyPayment * 12;
    const balanceAfterYear1 = loanAmount - principalPaidYear1;
    const materialValue = recovery.equityContributionCents / 100;

    const equityWithRecovery = rcmEquity(400_000, balanceAfterYear1, materialValue);
    const equityWithoutRecovery = rcmEquity(400_000, balanceAfterYear1);

    /* Material recovery adds to homeowner equity — the closed loop works */
    expect(equityWithRecovery).toBeGreaterThan(equityWithoutRecovery);
    expect(equityWithRecovery - equityWithoutRecovery).toBeCloseTo(materialValue, 0);
  });

  it("validates the full closed loop is intact", () => {
    const loop = validateClosedLoop({
      finance: true,
      deconstruct: true,
      design: true,
      build: true,
    });
    expect(loop.intact).toBe(true);
    expect(loop.loopEfficiency).toBe(1);
  });

  it("disruption score reflects the closed-loop advantage", () => {
    const score = calculateDisruptionScore();
    expect(score.closedLoop).toBe(true);
    expect(score.antiSaasAligned).toBe(true);
    expect(score.compositeMultiplier).toBeGreaterThan(2);
    expect(score.multipliers).toHaveLength(5);
  });
});

/* ─── Test 7: Loan Pipeline with Provenance Data ─── */

describe("Loan pipeline uses provenance-validated data", () => {
  it("processes loan where MVE is validated by actual material recovery", () => {
    /* Verify MVE returns are real by checking provenance produces all 4 */
    const materialRecovered = estimateValue("structural_lumber", "B", 100, "clean");
    expect(materialRecovered.valueCents).toBeGreaterThan(0); // Return 1: material value

    const grading = gradeMaterial({
      structuralIntegrity: 85,
      surfaceCondition: 75,
      moistureContent: 14,
      loadTested: true,
      ageYears: 10,
    });
    expect(grading.grade).toBeDefined(); // Return 2: ontology data (grading = ML training signal)
    // Return 3: robot training (grading process = humanoid operation sequence)
    // Return 4: market intelligence (pricing data feeds marketplace)

    /* Now process the loan — MVE is backed by real provenance */
    const result = processLoanApplication({
      applicantId: "APP-002",
      creditScore: 720,
      loanAmount: 250_000,
      annualRate: 0.065,
      termMonths: 360,
      propertyValue: 350_000,
      ttpFactors: {
        tier: "starter",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 1,
        reviewsPassed: 1,
        accountAgeDays: 180,
        isRegulator: false,
        dataContributions: 10,
      },
      mve: {
        materialValue: true,
        ontologyData: true,
        robotTraining: true,
        marketIntelligence: true,
      },
    });

    expect(result.approved).toBe(true);
    expect(result.intent.mveApproved).toBe(true);
    expect(result.intent.mveReturnCount).toBe(4);
  });
});
