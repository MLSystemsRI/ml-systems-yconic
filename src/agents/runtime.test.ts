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
