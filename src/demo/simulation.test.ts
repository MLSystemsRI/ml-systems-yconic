/**
 * Simulation Tests — Verifies the agentic orchestration demo scenario
 *
 * Tests the full pipeline: agent registration, Lucent Lens enforcement,
 * MVE gate, A2A delegation, RCM calculations, TTP scoring, and provenance.
 */

import { describe, it, expect } from "vitest";
import { runDemo } from "./runner.js";
import type { DemoResult } from "./runner.js";
import {
  AgentOrchestrator,
  validateAction,
  A2ARouter,
  executeToolCall,
} from "../agents/index.js";
import type { ActionProposal, AgentCard } from "../agents/index.js";
import { scoreLucentLens, passesLucentLens, passesMVE } from "../intent/schema.js";
import type { MVEAssessment } from "../intent/schema.js";
import { generateMaterialId } from "../provenance/engine.js";
import { resolveTier, preferredPayoffDay } from "../rcm/engine.js";
import { rcmMonthlyPayment } from "../rcm/math.js";

/* ─── Full Demo Run ─── */

describe("Demo Runner — Full Pipeline", () => {
  let result: DemoResult;

  it("runs the full demo without errors", () => {
    result = runDemo();
    expect(result).toBeDefined();
  });

  it("registers all 7 agents", () => {
    expect(result.agentsRegistered).toBe(7);
  });

  it("approves the valid deconstruction action", () => {
    expect(result.approvedActions).toBeGreaterThanOrEqual(1);
  });

  it("blocks the invalid action", () => {
    expect(result.blockedActions).toBeGreaterThanOrEqual(1);
  });

  it("completes 3 valid delegations", () => {
    expect(result.delegationsCompleted).toBe(3);
  });

  it("blocks 1 invalid delegation", () => {
    expect(result.delegationsBlocked).toBe(1);
  });

  it("calculates Maria's monthly payment in expected range", () => {
    // $200K at 6.5% for 30 years should be ~$1264
    expect(result.mariaMonthlyPayment).toBeGreaterThan(1200);
    expect(result.mariaMonthlyPayment).toBeLessThan(1400);
  });

  it("calculates preferred payoff day > 0", () => {
    expect(result.mariaPreferredPayoffDay).toBeGreaterThan(0);
  });

  it("assigns a valid ML Material ID", () => {
    expect(result.materialId).toBe("ML-2026-PRV001-Z3-042");
  });

  it("calculates a positive TTP score", () => {
    expect(result.ttpScore).toBeGreaterThan(0);
    expect(result.ttpScore).toBeLessThanOrEqual(100);
  });

  it("passes all checks", () => {
    expect(result.allPassed).toBe(true);
  });
});

/* ─── Lucent Lens Enforcement ─── */

describe("Lucent Lens — Value Hierarchy", () => {
  it("approves when homeowner > engine", () => {
    const score = scoreLucentLens(35, 25, 20);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(true);
    expect(score.homeowner).toBe(35);
    expect(score.engine).toBe(20);
  });

  it("rejects when engine > homeowner", () => {
    const score = scoreLucentLens(10, 5, 25);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("Engine value cannot exceed homeowner value");
  });

  it("rejects engine-only actions (homeowner = 0)", () => {
    const score = scoreLucentLens(0, 0, 20);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("Engine-only actions are rejected");
  });

  it("rejects when total score below minimum", () => {
    const score = scoreLucentLens(5, 5, 3);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("below minimum");
  });
});

/* ─── MVE Gate ─── */

describe("MVE Gate — 4x Return Requirement", () => {
  it("passes with 4/4 returns", () => {
    const mve: MVEAssessment = {
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: true,
    };
    const result = passesMVE(mve);
    expect(result.passes).toBe(true);
    expect(result.returnCount).toBe(4);
  });

  it("passes with 3/4 returns", () => {
    const mve: MVEAssessment = {
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: false,
    };
    const result = passesMVE(mve);
    expect(result.passes).toBe(true);
    expect(result.returnCount).toBe(3);
  });

  it("fails with 2/4 returns", () => {
    const mve: MVEAssessment = {
      materialValue: false,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: false,
    };
    const result = passesMVE(mve);
    expect(result.passes).toBe(false);
    expect(result.returnCount).toBe(2);
  });

  it("fails with 0/4 returns", () => {
    const mve: MVEAssessment = {
      materialValue: false,
      ontologyData: false,
      robotTraining: false,
      marketIntelligence: false,
    };
    const result = passesMVE(mve);
    expect(result.passes).toBe(false);
    expect(result.returnCount).toBe(0);
  });
});

/* ─── Blocked Action Verification ─── */

describe("Blocked Action — Orchestrator Enforcement", () => {
  it("blocks action where engine > homeowner AND MVE fails", () => {
    const orchestrator = new AgentOrchestrator();
    orchestrator.register("test_agent", "Test Agent", null);

    const proposal: ActionProposal = {
      agentId: "test_agent",
      action: "harvest_data_only",
      homeownerValue: 10,
      collectiveValue: 5,
      engineValue: 25,
      mve: {
        materialValue: false,
        ontologyData: true,
        robotTraining: true,
        marketIntelligence: false,
      },
    };

    const result = orchestrator.submitAction(proposal);
    expect(result.approved).toBe(false);
    expect(result.blockedBy).toContain("lucent_lens");
    expect(result.blockedBy).toContain("mve_gate");
  });

  it("blocks action where only engine value is non-zero", () => {
    const result = validateAction({
      agentId: "any",
      action: "engine_only_action",
      homeownerValue: 0,
      collectiveValue: 0,
      engineValue: 20,
      mve: { materialValue: true, ontologyData: true, robotTraining: true, marketIntelligence: true },
    });
    expect(result.approved).toBe(false);
    expect(result.blockedBy).toContain("lucent_lens");
  });
});

/* ─── RCM Payment Verification ─── */

describe("RCM — Maria's Loan ($200K, FICO 640)", () => {
  it("resolves FICO 640 to Tier 2 (Standard)", () => {
    const tier = resolveTier(640);
    expect(tier.tier).toBe(2);
    expect(tier.productClass).toBe("standard");
    expect(tier.name).toBe("Standard");
  });

  it("calculates correct monthly payment for $200K at 6.5%", () => {
    const payment = rcmMonthlyPayment(200_000, 0.065, 360);
    // Standard 30-year amortization formula: ~$1264.14
    expect(payment).toBeCloseTo(1264.14, 0);
  });

  it("calculates preferred payoff for $200K with 1 stream", () => {
    const day = preferredPayoffDay(200_000, 1);
    // k=1, D = ceil((-1 + sqrt(1 + 8*200000)) / 2) = ceil((-1 + sqrt(1600001)) / 2)
    // sqrt(1600001) ~ 1265.0, D ~ 632
    expect(day).toBeGreaterThan(600);
    expect(day).toBeLessThan(700);
  });

  it("preferred payoff is faster than standard term", () => {
    const payoffDay = preferredPayoffDay(200_000, 1);
    const payoffMonths = payoffDay / 30;
    expect(payoffMonths).toBeLessThan(360); // Preferred always faster than 30-year
  });
});

/* ─── A2A Delegation Hierarchy ─── */

describe("A2A Delegation — Hierarchy Enforcement", () => {
  function buildRouter(): A2ARouter {
    const router = new A2ARouter();

    const cards: AgentCard[] = [
      {
        agentId: "ceo",
        agentName: "CEO",
        parentId: null,
        capabilities: [{ domain: "intent", actions: ["all"], maxHomeownerValue: 40, maxEngineValue: 30 }],
        delegatesTo: ["fa"],
        delegatedFrom: null,
        status: "available",
      },
      {
        agentId: "fa",
        agentName: "FA",
        parentId: "ceo",
        capabilities: [{ domain: "finance", actions: ["all"], maxHomeownerValue: 40, maxEngineValue: 25 }],
        delegatesTo: ["pi"],
        delegatedFrom: "ceo",
        status: "available",
      },
      {
        agentId: "pi",
        agentName: "PI",
        parentId: "fa",
        capabilities: [
          { domain: "construction", actions: ["all"], maxHomeownerValue: 35, maxEngineValue: 25 },
          { domain: "deconstruction", actions: ["all"], maxHomeownerValue: 35, maxEngineValue: 25 },
        ],
        delegatesTo: ["dra"],
        delegatedFrom: "fa",
        status: "available",
      },
      {
        agentId: "dra",
        agentName: "DRA",
        parentId: "pi",
        capabilities: [{ domain: "deconstruction", actions: ["all"], maxHomeownerValue: 30, maxEngineValue: 20 }],
        delegatesTo: [],
        delegatedFrom: "pi",
        status: "available",
      },
    ];

    for (const card of cards) router.registerCard(card);
    return router;
  }

  const defaultMVE: MVEAssessment = {
    materialValue: true,
    ontologyData: true,
    robotTraining: true,
    marketIntelligence: true,
  };

  it("allows CEO -> FA delegation", () => {
    const router = buildRouter();
    const result = router.delegate(
      "ceo", "fa", "process_loan", "finance",
      { homeowner: 30, collective: 20, engine: 15 },
      defaultMVE,
    );
    expect(result.allowed).toBe(true);
  });

  it("allows FA -> PI delegation", () => {
    const router = buildRouter();
    const result = router.delegate(
      "fa", "pi", "assess_project", "construction",
      { homeowner: 30, collective: 20, engine: 15 },
      defaultMVE,
    );
    expect(result.allowed).toBe(true);
  });

  it("blocks CEO -> DRA (skip hierarchy)", () => {
    const router = buildRouter();
    const result = router.delegate(
      "ceo", "dra", "skip_to_bottom", "deconstruction",
      { homeowner: 30, collective: 20, engine: 15 },
      defaultMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not in delegation chain");
  });

  it("blocks FA -> DRA (skip PI)", () => {
    const router = buildRouter();
    const result = router.delegate(
      "fa", "dra", "skip_pi", "deconstruction",
      { homeowner: 30, collective: 20, engine: 15 },
      defaultMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("not in delegation chain");
  });

  it("blocks delegation with engine > homeowner (Lucent Lens)", () => {
    const router = buildRouter();
    const result = router.delegate(
      "ceo", "fa", "bad_intent", "finance",
      { homeowner: 10, collective: 5, engine: 20 },
      defaultMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Lucent Lens violation");
  });

  it("blocks delegation exceeding capability limits", () => {
    const router = buildRouter();
    const result = router.delegate(
      "fa", "pi", "too_much_value", "construction",
      { homeowner: 36, collective: 20, engine: 15 },
      defaultMVE,
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("exceeds");
  });
});

/* ─── TTP Scoring via Tool Runtime ─── */

describe("TTP Score — Tool Runtime", () => {
  it("calculates a score for a verified contractor", () => {
    const result = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "starter",
        identityVerified: true,
        materialsContributed: 8,
        cyclesCompleted: 1,
        reviewsPassed: 1,
        accountAgeDays: 180,
        isRegulator: false,
        dataContributions: 12,
      },
    });
    expect(result.success).toBe(true);
    expect(result.result?.["score"]).toBeGreaterThan(0);
    expect(result.result?.["band"]).toBeDefined();
  });

  it("gives lower score to unverified entity", () => {
    const verified = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "starter",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 0,
        reviewsPassed: 0,
        accountAgeDays: 30,
        isRegulator: false,
        dataContributions: 0,
      },
    });
    const unverified = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "starter",
        identityVerified: false,
        materialsContributed: 5,
        cyclesCompleted: 0,
        reviewsPassed: 0,
        accountAgeDays: 30,
        isRegulator: false,
        dataContributions: 0,
      },
    });
    const verifiedScore = verified.result?.["score"] as number;
    const unverifiedScore = unverified.result?.["score"] as number;
    expect(verifiedScore).toBeGreaterThan(unverifiedScore);
  });
});

/* ─── Material ID ─── */

describe("Provenance — Material ID", () => {
  it("generates correct ML Material ID format", () => {
    const id = generateMaterialId(2026, "PRV001", 3, 42);
    expect(id).toBe("ML-2026-PRV001-Z3-042");
  });

  it("pads sequence number to 3 digits", () => {
    const id = generateMaterialId(2026, "PRV001", 1, 1);
    expect(id).toBe("ML-2026-PRV001-Z1-001");
  });
});
