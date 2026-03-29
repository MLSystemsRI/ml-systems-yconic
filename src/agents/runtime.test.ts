import { describe, it, expect } from "vitest";
import { executeToolCall, executeBatch } from "./runtime.js";
import type { ToolCallInput } from "./runtime.js";

/* ─── TTP Tool Execution ─── */

describe("execute ttp_score_entity", () => {
  it("scores an entity through the real TTP engine", () => {
    const result = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "pro",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 2,
        reviewsPassed: 3,
        accountAgeDays: 180,
        isRegulator: false,
        dataContributions: 10,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["score"]).toBeGreaterThan(30);
    expect(result.result?.["band"]).toBeDefined();
    expect(result.executionMs).toBeGreaterThanOrEqual(0);
  });

  it("returns lowest score for free tier with no factors", () => {
    const result = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "free",
        identityVerified: false,
        materialsContributed: 0,
        cyclesCompleted: 0,
        reviewsPassed: 0,
        accountAgeDays: 0,
        isRegulator: false,
        dataContributions: 0,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["score"]).toBe(5);
    expect(result.result?.["band"]).toBe("public_record");
  });
});

describe("execute ttp_detect_crawler", () => {
  it("detects GPTBot as an AI crawler", () => {
    const result = executeToolCall({
      tool: "ttp_detect_crawler",
      arguments: { userAgent: "Mozilla/5.0 (compatible; GPTBot/1.0)" },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["isCrawler"]).toBe(true);
    expect(result.result?.["feeCents"]).toBeGreaterThan(0);
  });

  it("returns false for normal browser user agent", () => {
    const result = executeToolCall({
      tool: "ttp_detect_crawler",
      arguments: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["isCrawler"]).toBe(false);
  });
});

describe("execute ttp_check_access", () => {
  it("processes a full TTP request", () => {
    const result = executeToolCall({
      tool: "ttp_check_access",
      arguments: {
        path: "/api/v1/materials",
        userAgent: "Mozilla/5.0",
        apiTier: "pro",
        isRegulator: false,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["allowed"]).toBe(true);
    expect(result.result?.["headers"]).toBeDefined();
  });
});

/* ─── RCM Tool Execution ─── */

describe("execute rcm_resolve_tier", () => {
  it("resolves FICO 720 to preferred tier 4", () => {
    const result = executeToolCall({
      tool: "rcm_resolve_tier",
      arguments: { creditScore: 720 },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["tier"]).toBe(4);
    expect(result.result?.["productClass"]).toBe("preferred");
  });

  it("resolves FICO 590 to standard tier 1", () => {
    const result = executeToolCall({
      tool: "rcm_resolve_tier",
      arguments: { creditScore: 590 },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["tier"]).toBe(1);
    expect(result.result?.["productClass"]).toBe("standard");
  });
});

describe("execute rcm_calculate_payment", () => {
  it("calculates monthly payment for a $320K loan", () => {
    const result = executeToolCall({
      tool: "rcm_calculate_payment",
      arguments: { principal: 320_000, annualRate: 0.065, termMonths: 360 },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["monthlyPayment"]).toBeGreaterThan(0);
    expect(result.result?.["totalInterest"]).toBeGreaterThan(0);
  });
});

describe("execute rcm_preferred_payoff", () => {
  it("calculates payoff for preferred tier with 1 stream", () => {
    const result = executeToolCall({
      tool: "rcm_preferred_payoff",
      arguments: { loanAmount: 200_000, streamCount: 1 },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["payoffDay"]).toBeGreaterThan(0);
    expect(result.result?.["payoffMonths"]).toBeGreaterThan(0);
  });
});

/* ─── Intent Tool Execution ─── */

describe("execute intent_validate_action", () => {
  it("approves homeowner-first action with full MVE", () => {
    const result = executeToolCall({
      tool: "intent_validate_action",
      arguments: {
        homeownerValue: 35,
        collectiveValue: 20,
        engineValue: 10,
        materialValue: true,
        ontologyData: true,
        robotTraining: true,
        marketIntelligence: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["approved"]).toBe(true);
    expect(result.result?.["blockedBy"]).toEqual([]);
  });

  it("rejects engine-first action", () => {
    const result = executeToolCall({
      tool: "intent_validate_action",
      arguments: {
        homeownerValue: 5,
        collectiveValue: 10,
        engineValue: 25,
        materialValue: true,
        ontologyData: true,
        robotTraining: true,
        marketIntelligence: true,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["approved"]).toBe(false);
    expect(result.result?.["blockedBy"]).toContain("lucent_lens");
  });
});

/* ─── Provenance Tool Execution ─── */

describe("execute provenance_grade_material", () => {
  it("grades a high-quality structural timber as A", () => {
    const result = executeToolCall({
      tool: "provenance_grade_material",
      arguments: {
        structuralIntegrity: 95,
        surfaceCondition: 90,
        moistureContent: 12,
        loadTested: true,
        ageYears: 5,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["grade"]).toBe("A");
    expect(result.result?.["score"]).toBeGreaterThan(80);
  });

  it("grades damaged material as C or lower", () => {
    const result = executeToolCall({
      tool: "provenance_grade_material",
      arguments: {
        structuralIntegrity: 40,
        surfaceCondition: 35,
        moistureContent: 30,
        loadTested: false,
        ageYears: 50,
      },
    });

    expect(result.success).toBe(true);
    expect(["C", "D", "salvage"]).toContain(result.result?.["grade"]);
  });
});

describe("execute provenance_estimate_value", () => {
  it("estimates value for grade-A structural lumber", () => {
    const result = executeToolCall({
      tool: "provenance_estimate_value",
      arguments: {
        category: "structural_lumber",
        grade: "A",
        boardFeet: 100,
        contamination: "clean",
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["valueCents"]).toBeGreaterThan(0);
  });

  it("reduces value for contaminated material", () => {
    const clean = executeToolCall({
      tool: "provenance_estimate_value",
      arguments: {
        category: "structural_lumber",
        grade: "B",
        boardFeet: 100,
        contamination: "clean",
      },
    });
    const contaminated = executeToolCall({
      tool: "provenance_estimate_value",
      arguments: {
        category: "structural_lumber",
        grade: "B",
        boardFeet: 100,
        contamination: "confirmed",
      },
    });

    expect(clean.success).toBe(true);
    expect(contaminated.success).toBe(true);
    const cleanValue = clean.result?.["valueCents"] as number;
    const contaminatedValue = contaminated.result?.["valueCents"] as number;
    expect(cleanValue).toBeGreaterThan(contaminatedValue);
  });
});

/* ─── RCM Equity Simulation Tool Execution ─── */

describe("execute rcm_simulate_equity", () => {
  it("simulates a 360-month equity comparison", () => {
    const result = executeToolCall({
      tool: "rcm_simulate_equity",
      arguments: {
        loanAmount: 200_000,
        annualRate: 0.065,
        termMonths: 360,
        propertyValue: 280_000,
        appreciationRate: 0.03,
        monthlyMaterialRevenueCents: 50_000,
      },
    });

    expect(result.success).toBe(true);
    expect(result.result?.["milestones"]).toBeDefined();
    expect(result.result?.["summary"]).toBeDefined();
    expect(result.result?.["rcmPayment"]).toBeGreaterThan(0);
    expect(result.result?.["traditionalPayment"]).toBeGreaterThan(0);
  });

  it("shows RCM advantage in equity summary", () => {
    const result = executeToolCall({
      tool: "rcm_simulate_equity",
      arguments: {
        loanAmount: 200_000,
        annualRate: 0.065,
        termMonths: 360,
        propertyValue: 280_000,
        appreciationRate: 0.03,
        monthlyMaterialRevenueCents: 50_000,
      },
    });

    expect(result.success).toBe(true);
    const summary = result.result?.["summary"] as Record<string, unknown>;
    expect(summary["finalRCMEquity"]).toBeGreaterThan(summary["finalTraditionalEquity"] as number);
  });
});

/* ─── Error Handling ─── */

describe("runtime error handling", () => {
  it("returns error for unknown tool", () => {
    const result = executeToolCall({
      tool: "nonexistent_tool",
      arguments: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown tool");
  });

  it("returns error for missing required parameter", () => {
    const result = executeToolCall({
      tool: "rcm_resolve_tier",
      arguments: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing required parameter");
  });

  it("returns error for wrong parameter type", () => {
    const result = executeToolCall({
      tool: "rcm_resolve_tier",
      arguments: { creditScore: "not a number" },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("expected number");
  });

  it("returns error for invalid enum value", () => {
    const result = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "invalid_tier",
        identityVerified: true,
        materialsContributed: 0,
        cyclesCompleted: 0,
        reviewsPassed: 0,
        accountAgeDays: 0,
        isRegulator: false,
        dataContributions: 0,
      },
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("must be one of");
  });
});

/* ─── Batch Execution ─── */

describe("executeBatch", () => {
  it("executes multiple tool calls in sequence", () => {
    const inputs: ToolCallInput[] = [
      {
        tool: "ttp_score_entity",
        arguments: {
          tier: "starter",
          identityVerified: true,
          materialsContributed: 3,
          cyclesCompleted: 1,
          reviewsPassed: 1,
          accountAgeDays: 90,
          isRegulator: false,
          dataContributions: 5,
        },
      },
      {
        tool: "rcm_resolve_tier",
        arguments: { creditScore: 720 },
      },
      {
        tool: "intent_validate_action",
        arguments: {
          homeownerValue: 30,
          collectiveValue: 20,
          engineValue: 10,
          materialValue: true,
          ontologyData: true,
          robotTraining: true,
          marketIntelligence: true,
        },
      },
    ];

    const results = executeBatch(inputs);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("continues batch even when one call fails", () => {
    const inputs: ToolCallInput[] = [
      { tool: "nonexistent", arguments: {} },
      { tool: "rcm_resolve_tier", arguments: { creditScore: 720 } },
    ];

    const results = executeBatch(inputs);
    expect(results[0]!.success).toBe(false);
    expect(results[1]!.success).toBe(true);
  });
});

/* ─── Error Boundary — Runtime Exception Handling ─── */

describe("error boundary — executor exceptions", () => {
  it("catches executor exception and returns structured error", () => {
    // Pass an invalid tier that fails parameter validation
    const result = executeToolCall({
      tool: "ttp_score_entity",
      arguments: {
        tier: "nonexistent_tier",
        identityVerified: true,
        materialsContributed: 5,
        cyclesCompleted: 2,
        reviewsPassed: 3,
        accountAgeDays: 180,
        isRegulator: false,
        dataContributions: 10,
      },
    });
    // Should not crash — returns structured error from validation or try-catch
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.executionMs).toBeGreaterThanOrEqual(0);
  });

  it("handles missing optional params gracefully", () => {
    const result = executeToolCall({
      tool: "ttp_check_access",
      arguments: {
        path: "/api/v1/materials/provenance",
        userAgent: "TestBot/1.0",
        apiTier: "free",
        isRegulator: false,
        // ttScore intentionally omitted (optional)
      },
    });
    expect(result.success).toBe(true);
    expect(result.result).toBeTruthy();
  });

  it("returns error for completely empty arguments on required-param tool", () => {
    const result = executeToolCall({
      tool: "rcm_calculate_payment",
      arguments: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing required parameter");
  });
});
