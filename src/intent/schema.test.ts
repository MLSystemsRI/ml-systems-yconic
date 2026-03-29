import { describe, it, expect } from "vitest";
import {
  scoreLucentLens,
  passesLucentLens,
  passesMVE,
  createAgentIntent,
  CUSTODIAN_CONSTRAINTS,
  PRICING_RULES,
} from "./schema.js";

/* ─── scoreLucentLens ─── */

describe("scoreLucentLens", () => {
  it("sums all three components", () => {
    const score = scoreLucentLens(30, 20, 15);
    expect(score.total).toBe(65);
  });

  it("clamps homeowner to 0-40", () => {
    expect(scoreLucentLens(50, 0, 0).homeowner).toBe(40);
    expect(scoreLucentLens(-5, 0, 0).homeowner).toBe(0);
  });

  it("clamps collective to 0-30", () => {
    expect(scoreLucentLens(0, 40, 0).collective).toBe(30);
    expect(scoreLucentLens(0, -5, 0).collective).toBe(0);
  });

  it("clamps engine to 0-30", () => {
    expect(scoreLucentLens(0, 0, 40).engine).toBe(30);
    expect(scoreLucentLens(0, 0, -5).engine).toBe(0);
  });

  it("max possible score is 100", () => {
    const max = scoreLucentLens(40, 30, 30);
    expect(max.total).toBe(100);
  });

  it("min possible score is 0", () => {
    const min = scoreLucentLens(0, 0, 0);
    expect(min.total).toBe(0);
  });
});

/* ─── passesLucentLens ─── */

describe("passesLucentLens", () => {
  it("rejects engine-only actions", () => {
    const score = scoreLucentLens(0, 0, 25);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("Engine-only");
  });

  it("rejects when engine exceeds homeowner", () => {
    const score = scoreLucentLens(10, 20, 25);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("cannot exceed homeowner");
  });

  it("rejects below minimum total", () => {
    const score = scoreLucentLens(15, 5, 5);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(false);
    expect(result.reason).toContain("below minimum");
  });

  it("passes valid homeowner-first action", () => {
    const score = scoreLucentLens(25, 15, 10);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(true);
  });

  it("passes with custom minimum threshold", () => {
    const score = scoreLucentLens(15, 5, 5);
    const result = passesLucentLens(score, 20);
    expect(result.passes).toBe(true);
  });

  it("allows equal homeowner and engine scores", () => {
    const score = scoreLucentLens(20, 10, 20);
    const result = passesLucentLens(score);
    expect(result.passes).toBe(true);
  });
});

/* ─── passesMVE ─── */

describe("passesMVE", () => {
  it("passes with 4/4 returns", () => {
    const result = passesMVE({
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: true,
    });
    expect(result.passes).toBe(true);
    expect(result.returnCount).toBe(4);
  });

  it("passes with 3/4 returns", () => {
    const result = passesMVE({
      materialValue: true,
      ontologyData: true,
      robotTraining: true,
      marketIntelligence: false,
    });
    expect(result.passes).toBe(true);
    expect(result.returnCount).toBe(3);
  });

  it("rejects with 2/4 returns", () => {
    const result = passesMVE({
      materialValue: true,
      ontologyData: true,
      robotTraining: false,
      marketIntelligence: false,
    });
    expect(result.passes).toBe(false);
    expect(result.returnCount).toBe(2);
  });

  it("rejects with 0/4 returns", () => {
    const result = passesMVE({
      materialValue: false,
      ontologyData: false,
      robotTraining: false,
      marketIntelligence: false,
    });
    expect(result.passes).toBe(false);
    expect(result.returnCount).toBe(0);
  });
});

/* ─── createAgentIntent ─── */

describe("createAgentIntent", () => {
  it("creates agent with default constraints", () => {
    const agent = createAgentIntent("pi", "Project Intelligence");
    expect(agent.agentId).toBe("pi");
    expect(agent.agentName).toBe("Project Intelligence");
    expect(agent.parentAgentId).toBeNull();
    expect(agent.minimumLensScore).toBe(30);
    expect(agent.canOverrideMVE).toBe(false);
  });

  it("sets parent agent ID", () => {
    const agent = createAgentIntent("cda", "Creative Design Agent", "pi");
    expect(agent.parentAgentId).toBe("pi");
  });

  it("enforces all 4 custodian constraints", () => {
    const agent = createAgentIntent("test", "Test Agent");
    expect(agent.enforcedConstraints).toHaveLength(4);
    expect(agent.enforcedConstraints).toContain("transparencyTrust");
    expect(agent.enforcedConstraints).toContain("equityOrder");
    expect(agent.enforcedConstraints).toContain("minimumViableExpense");
    expect(agent.enforcedConstraints).toContain("fiduciaryDuty");
  });
});

/* ─── Constants ─── */

describe("constants", () => {
  it("custodian constraints are immutable", () => {
    expect(CUSTODIAN_CONSTRAINTS.transparencyTrust).toBe("optimize_user_compute");
    expect(CUSTODIAN_CONSTRAINTS.equityOrder).toBe("public_before_private");
    expect(CUSTODIAN_CONSTRAINTS.minimumViableExpense).toBe(4);
    expect(CUSTODIAN_CONSTRAINTS.fiduciaryDuty).toBe("public");
  });

  it("pricing rules enforce anti-SaaS model", () => {
    expect(PRICING_RULES.ownDataAccess).toBe("free");
    expect(PRICING_RULES.aiCrawlerAccess).toBe("per_query");
    expect(PRICING_RULES.ecosystemAccess).toBe("earned_access");
    expect(PRICING_RULES.primaryRevenue).toBe("outcome_based");
  });
});
