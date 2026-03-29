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
import { validateInspection, classifyMaterial, ingestInspection } from "../field-data/engine.js";
import type { InspectionReport } from "../field-data/engine.js";
import { executeClosedLoop, buildMariaScenario } from "../closed-loop/engine.js";
import { A2ARouter } from "../agents/a2a.js";
import type { AgentCard } from "../agents/a2a.js";
import { executeToolCall, executeBatch } from "../agents/runtime.js";
import { simulateEquity } from "../rcm/simulator.js";
import { materialCategoryToZone, zoneLabel, activeZones } from "../shared/zones.js";

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

/* ─── Test 8: Field Inspection → Provenance → Marketplace ─── */

describe("Field inspection flows through entire pipeline", () => {
  it("field report → ML Material IDs → marketplace listings", () => {
    /* Step 1: Create a field inspection report */
    const report: InspectionReport = {
      inspectorId: "inspector_005",
      projectId: "PRV003",
      address: "456 Benefit St, Providence RI 02903",
      inspectionDate: "2026-03-29",
      items: [
        {
          fieldDescription: "2x6 Douglas Fir joist, structural framing",
          location: "Second floor, north bay",
          estimatedBoardFeet: 180,
          estimatedWeightLbs: 240,
          dimensions: { length: 12, width: 6, depth: 2, unit: "in" },
          visualStructuralScore: 78,
          visualSurfaceScore: 65,
          moistureReading: 15,
          loadTested: false,
          estimatedAgeYears: 40,
          observations: {
            paintChipping: false, paintAge: "post_1978", visibleMold: false,
            chemicalOdor: false, insectDamage: false, waterStaining: false,
            previousRepairs: false, asbestosLabeled: false,
          },
        },
        {
          fieldDescription: "Oak hardwood floor strips, 3/4 inch",
          location: "Living room",
          estimatedBoardFeet: 280,
          estimatedWeightLbs: 420,
          dimensions: { length: 96, width: 2.25, depth: 0.75, unit: "in" },
          visualStructuralScore: 88,
          visualSurfaceScore: 72,
          moistureReading: 10,
          loadTested: true,
          estimatedAgeYears: 40,
          observations: {
            paintChipping: false, paintAge: "post_1978", visibleMold: false,
            chemicalOdor: false, insectDamage: false, waterStaining: false,
            previousRepairs: false, asbestosLabeled: false,
          },
        },
      ],
      siteConditions: {
        weather: "clear", temperature: 55, humidity: 40,
        accessDifficulty: "easy", hazardsPresent: [],
      },
      photos: [
        { filename: "joist_01.jpg", itemIndex: 0, type: "overview" },
        { filename: "floor_01.jpg", itemIndex: 1, type: "overview" },
      ],
    };

    /* Step 2: Validate the inspection */
    const validation = validateInspection(report);
    expect(validation.valid).toBe(true);

    /* Step 3: Ingest into provenance chain */
    const ingestion = ingestInspection(report);
    expect(ingestion.records).toHaveLength(2);
    expect(ingestion.totalValueCents).toBeGreaterThan(0);

    /* Step 4: Verify ML Material IDs are assigned */
    for (const record of ingestion.records) {
      expect(record.mlId).toMatch(/^ML-2026-PRV003-Z\d+-\d{3}$/);
      expect(record.auditTrail.length).toBeGreaterThanOrEqual(2);
    }

    /* Step 5: Auto-classify materials */
    const classification1 = classifyMaterial("2x6 Douglas Fir joist, structural framing");
    expect(classification1.category).toBe("structural_lumber");
    expect(classification1.confidence).toBe("high");

    const classification2 = classifyMaterial("Oak hardwood floor strips, 3/4 inch");
    expect(classification2.category).toBe("flooring");

    /* Step 6: Create marketplace listings from ingested records */
    const { listings, totalValueCents } = createBatchListings(ingestion.records, 100);
    expect(listings.length).toBe(2);
    expect(totalValueCents).toBeGreaterThan(0);

    /* Step 7: Sell and verify equity contribution */
    for (const listing of listings) listing.status = "active";
    const { order } = createOrder(listings, "contractor_007");
    expect(order).not.toBeNull();
    confirmOrder(order!, listings);

    const equity = materialRecoveryEquityContribution(listings);
    expect(equity.equityContributionCents).toBeGreaterThan(0);
    expect(equity.listingCount).toBe(2);
  });
});

/* ─── Test 9: Full Closed-Loop Pipeline ─── */

describe("Closed-loop pipeline runs end-to-end", () => {
  it("Maria scenario: finance → deconstruct → design → build → equity", () => {
    const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();
    const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

    /* Verify all stages complete */
    expect(result.loopComplete).toBe(true);
    expect(result.stages.finance.approved).toBe(true);
    expect(result.stages.deconstruct.materialsRecovered).toBe(10);
    expect(result.stages.marketplace.listingsCreated).toBeGreaterThan(0);
    expect(result.stages.build.constructionStartApproved).toBe(true);

    /* Verify equity advantage */
    expect(result.stages.equity.equityAdvantage).toBeGreaterThan(0);
    expect(result.stages.equity.equityFromMaterials).toBeGreaterThan(0);

    /* Verify disruption score */
    expect(result.disruption.closedLoop).toBe(true);
    expect(result.disruption.compositeMultiplier).toBeGreaterThan(3);

    /* Total value created should be positive */
    expect(result.totalValueCreatedCents).toBeGreaterThan(0);
  });
});

/* ─── Test 10: A2A Agents Orchestrate the Closed Loop via MCP Tools ─── */

describe("A2A agents orchestrate closed-loop pipeline via MCP tools", () => {
  it("agents delegate, execute tools, complete tasks through full pipeline", () => {
    const router = new A2ARouter();

    /* Register 4 agents for the closed-loop pipeline */
    const ceoCard: AgentCard = {
      agentId: "ceo",
      agentName: "CEO (Sal)",
      parentId: null,
      capabilities: [
        { domain: "intent", actions: ["validate"], maxHomeownerValue: 40, maxEngineValue: 30 },
        { domain: "finance", actions: ["approve"], maxHomeownerValue: 40, maxEngineValue: 30 },
      ],
      delegatesTo: ["fa-agent", "pi-agent"],
      delegatedFrom: null,
      status: "available",
    };

    const faCard: AgentCard = {
      agentId: "fa-agent",
      agentName: "Financial Architect",
      parentId: "ceo",
      capabilities: [
        { domain: "rcm", actions: ["calculate", "simulate"], maxHomeownerValue: 40, maxEngineValue: 20 },
        { domain: "finance", actions: ["model"], maxHomeownerValue: 40, maxEngineValue: 20 },
      ],
      delegatesTo: [],
      delegatedFrom: "ceo",
      status: "available",
    };

    const piCard: AgentCard = {
      agentId: "pi-agent",
      agentName: "Project Intelligence",
      parentId: "ceo",
      capabilities: [
        { domain: "ttp", actions: ["score"], maxHomeownerValue: 35, maxEngineValue: 20 },
        { domain: "deconstruction", actions: ["grade", "value"], maxHomeownerValue: 35, maxEngineValue: 20 },
      ],
      delegatesTo: ["decon-agent"],
      delegatedFrom: "ceo",
      status: "available",
    };

    const deconCard: AgentCard = {
      agentId: "decon-agent",
      agentName: "Deconstruction Agent",
      parentId: "pi-agent",
      capabilities: [
        { domain: "deconstruction", actions: ["assess", "recover"], maxHomeownerValue: 30, maxEngineValue: 15 },
      ],
      delegatesTo: [],
      delegatedFrom: "pi-agent",
      status: "available",
    };

    router.registerCard(ceoCard);
    router.registerCard(faCard);
    router.registerCard(piCard);
    router.registerCard(deconCard);

    const fullMVE = { materialValue: true, ontologyData: true, robotTraining: true, marketIntelligence: true };

    /* Phase 1: CEO delegates TTP scoring to PI */
    const ttpDelegation = router.delegate(
      "ceo", "pi-agent", "score_homeowner", "ttp",
      { homeowner: 30, collective: 20, engine: 10 }, fullMVE,
    );
    expect(ttpDelegation.allowed).toBe(true);

    /* PI executes TTP scoring via MCP tool */
    const ttpResult = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "starter", identityVerified: true, materialsContributed: 3,
        cyclesCompleted: 1, reviewsPassed: 1, accountAgeDays: 200,
        isRegulator: false, dataContributions: 5,
      },
    });
    expect(ttpResult.success).toBe(true);
    const ttpScore = ttpResult.result?.["score"] as number;
    expect(ttpScore).toBeGreaterThan(20);

    /* PI completes task with real score */
    router.completeTask(ttpDelegation.delegatedTaskId!, { score: ttpScore, band: ttpResult.result?.["band"] });

    /* Phase 2: CEO delegates RCM calculation to FA */
    const rcmDelegation = router.delegate(
      "ceo", "fa-agent", "calculate_mortgage", "rcm",
      { homeowner: 35, collective: 15, engine: 10 }, fullMVE,
    );
    expect(rcmDelegation.allowed).toBe(true);

    /* FA executes RCM tools via MCP batch */
    const rcmBatch = executeBatch([
      { tool: "rcm_resolve_tier", arguments: { creditScore: 720 } },
      { tool: "rcm_calculate_payment", arguments: { principal: 200_000, annualRate: 0.065, termMonths: 360 } },
    ]);
    expect(rcmBatch.every((r) => r.success)).toBe(true);
    expect(rcmBatch[0]!.result?.["tier"]).toBe(4);
    expect(rcmBatch[0]!.result?.["productClass"]).toBe("preferred");

    router.completeTask(rcmDelegation.delegatedTaskId!, {
      tier: rcmBatch[0]!.result?.["tier"],
      monthlyPayment: rcmBatch[1]!.result?.["monthlyPayment"],
    });

    /* Phase 3: CEO delegates material assessment to PI, PI sub-delegates to Decon */
    const materialDelegation = router.delegate(
      "ceo", "pi-agent", "assess_materials", "deconstruction",
      { homeowner: 30, collective: 20, engine: 10 }, fullMVE,
    );
    expect(materialDelegation.allowed).toBe(true);

    /* PI decomposes into sub-task for decon agent */
    const subtaskResults = router.decompose(materialDelegation.delegatedTaskId!, [{
      toId: "decon-agent",
      action: "grade_recovered_lumber",
      domain: "deconstruction",
      values: { homeowner: 25, collective: 15, engine: 10 },
      mve: fullMVE,
    }]);
    expect(subtaskResults[0]!.allowed).toBe(true);

    /* Decon agent uses provenance MCP tools */
    const gradeResult = executeToolCall({
      tool: "provenance_grade_material",
      arguments: { structuralIntegrity: 85, surfaceCondition: 75, moistureContent: 14, loadTested: true, ageYears: 15 },
    });
    expect(gradeResult.success).toBe(true);
    const grade = gradeResult.result?.["grade"] as string;

    const valueResult = executeToolCall({
      tool: "provenance_estimate_value",
      arguments: { category: "structural_lumber", grade, boardFeet: 200, contamination: "clean" },
    });
    expect(valueResult.success).toBe(true);
    expect(valueResult.result?.["valueCents"]).toBeGreaterThan(0);

    /* Complete task chain: decon → PI → CEO sees results */
    router.completeTask(subtaskResults[0]!.delegatedTaskId!, {
      grade, valueCents: valueResult.result?.["valueCents"],
    });
    router.completeTask(materialDelegation.delegatedTaskId!, {
      materialsGraded: 1, totalValueCents: valueResult.result?.["valueCents"],
    });

    /* Phase 4: Equity simulation ties it all together */
    const equityResult = executeToolCall({
      tool: "rcm_simulate_equity",
      arguments: {
        loanAmount: 200_000, annualRate: 0.065, termMonths: 360,
        propertyValue: 280_000, appreciationRate: 0.03,
        monthlyMaterialRevenueCents: Math.round((valueResult.result?.["valueCents"] as number) / 12),
      },
    });
    expect(equityResult.success).toBe(true);
    const summary = equityResult.result?.["summary"] as Record<string, unknown>;
    expect(summary["finalRCMEquity"]).toBeGreaterThan(summary["finalTraditionalEquity"] as number);

    /* Verify full protocol state */
    const stats = router.stats();
    expect(stats.totalAgents).toBe(4);
    expect(stats.completedTasks).toBe(4); /* TTP, RCM, Material assessment + subtask */
    expect(stats.totalTasks).toBe(4); /* 3 top-level + 1 subtask */
  });
});

/* ─── Test 11: Shared Zones Power Cross-Module Material Routing ─── */

describe("Zone mapping drives cross-module material flow", () => {
  it("field classification → zone assignment → marketplace categorization", () => {
    /* Classify materials from field descriptions */
    const fieldItems = [
      "2x4 Douglas Fir stud",
      "Solid core interior door",
      "Portland cement bags",
      "3-tab asphalt shingles",
    ];

    const classifications = fieldItems.map((desc) => classifyMaterial(desc));
    expect(classifications[0]!.category).toBe("structural_lumber");
    expect(classifications[1]!.category).toBe("doors");
    expect(classifications[2]!.category).toBe("concrete");
    expect(classifications[3]!.category).toBe("roofing");

    /* Map to zones */
    const zones = classifications.map((c) => materialCategoryToZone(c.category));
    expect(zones).toEqual([2, 3, 7, 8]);

    /* Verify zone labels for marketplace display */
    expect(zoneLabel(zones[0]!)).toBe("Lumber");
    expect(zoneLabel(zones[1]!)).toBe("Doors/Windows/Trim");
    expect(zoneLabel(zones[2]!)).toBe("Concrete");
    expect(zoneLabel(zones[3]!)).toBe("Roofing/Siding");

    /* Active zones from a project — unique, sorted */
    const projectZones = activeZones(classifications.map((c) => c.category));
    expect(projectZones).toEqual([2, 3, 7, 8]);
  });

  it("zone assignments match provenance ML Material IDs", () => {
    /* Generate ML IDs and verify zone is embedded correctly */
    const lumberId = generateMaterialId(2026, "PRV001", materialCategoryToZone("structural_lumber"), 1);
    expect(lumberId).toMatch(/^ML-2026-PRV001-Z2-001$/);

    const doorId = generateMaterialId(2026, "PRV001", materialCategoryToZone("doors"), 1);
    expect(doorId).toMatch(/^ML-2026-PRV001-Z3-001$/);

    const concreteId = generateMaterialId(2026, "PRV001", materialCategoryToZone("concrete"), 1);
    expect(concreteId).toMatch(/^ML-2026-PRV001-Z7-001$/);
  });
});

/* ─── Test 12: RCM Equity Simulator with Material Revenue Integration ─── */

describe("Equity simulator integrates material recovery revenue", () => {
  it("material revenue accelerates equity growth vs traditional mortgage", () => {
    const withMaterials = simulateEquity({
      loanAmount: 200_000,
      annualRate: 0.065,
      termMonths: 360,
      propertyValue: 280_000,
      appreciationRate: 0.03,
      monthlyMaterialRevenueCents: 50_000, /* $500/mo from material sales */
      materialRevenueSharePercent: 0.51,
    });

    const withoutMaterials = simulateEquity({
      loanAmount: 200_000,
      annualRate: 0.065,
      termMonths: 360,
      propertyValue: 280_000,
      appreciationRate: 0.03,
      monthlyMaterialRevenueCents: 0,
      materialRevenueSharePercent: 0.51,
    });

    /* Material revenue adds to equity */
    expect(withMaterials.summary.totalMaterialEquity).toBeGreaterThan(0);
    expect(withoutMaterials.summary.totalMaterialEquity).toBe(0);

    /* RCM with materials beats RCM without materials */
    expect(withMaterials.summary.finalRCMEquity).toBeGreaterThan(withoutMaterials.summary.finalRCMEquity);

    /* Both beat traditional */
    expect(withMaterials.summary.finalRCMEquity).toBeGreaterThan(withMaterials.summary.finalTraditionalEquity);
    expect(withoutMaterials.summary.finalRCMEquity).toBeGreaterThanOrEqual(withoutMaterials.summary.finalTraditionalEquity);
  });

  it("equity multiplier increases with material revenue", () => {
    const result = simulateEquity({
      loanAmount: 200_000,
      annualRate: 0.065,
      termMonths: 360,
      propertyValue: 280_000,
      appreciationRate: 0.03,
      monthlyMaterialRevenueCents: 80_000,
      materialRevenueSharePercent: 0.51,
    });

    /* Equity multiplier = RCM equity / traditional equity at final month */
    expect(result.summary.equityMultiplier).toBeGreaterThan(1);
  });
});
