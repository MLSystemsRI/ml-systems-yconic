/**
 * MCP Tool Runtime — Executes tool calls against real engines
 *
 * This is the bridge between MCP tool definitions and actual engine
 * functions. When an AI agent calls a tool via MCP, the runtime:
 * 1. Validates the tool name exists
 * 2. Validates all required parameters are present
 * 3. Executes the corresponding engine function
 * 4. Returns typed results
 *
 * This makes the MCP interface functional, not just declarative.
 * Every tool call hits a real calculation — no stubs, no mocks.
 */

import {
  calculateTransparencyScore,
  getAccessBand,
  getVerificationFeeCents,
} from "../ttp/transparency.js";
import { isAiCrawler, identifyCrawler } from "../ttp/ai-crawler.js";
import { processTTPRequest } from "../ttp/middleware.js";
import type { ApiTier, TransparencyFactors } from "../ttp/types.js";
import { resolveTier } from "../rcm/engine.js";
import { rcmMonthlyPayment } from "../rcm/math.js";
import { preferredPayoffDay } from "../rcm/engine.js";
import { scoreLucentLens, passesLucentLens, passesMVE } from "../intent/schema.js";
import { gradeMaterial, estimateValue } from "../provenance/engine.js";
import type { MaterialCategory, MaterialGrade, ContaminationStatus } from "../provenance/engine.js";
import { simulateEquity } from "../rcm/simulator.js";
import { getTool } from "./tools.js";
import type { ToolDefinition, ToolParameter } from "./tools.js";

/* ─── Runtime Types ─── */

export interface ToolCallInput {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  success: boolean;
  tool: string;
  result: Record<string, unknown> | null;
  error: string | null;
  executionMs: number;
}

/* ─── Parameter Validation ─── */

function validateParams(definition: ToolDefinition, args: Record<string, unknown>): string | null {
  for (const param of definition.parameters) {
    if (param.required && !(param.name in args)) {
      return `Missing required parameter: ${param.name}`;
    }
    if (param.name in args) {
      const val = args[param.name];
      if (!matchesType(val, param)) {
        return `Parameter ${param.name}: expected ${param.type}, got ${typeof val}`;
      }
      if (param.enum && typeof val === "string" && !param.enum.includes(val)) {
        return `Parameter ${param.name}: must be one of [${param.enum.join(", ")}]`;
      }
    }
  }
  return null;
}

function matchesType(value: unknown, param: ToolParameter): boolean {
  if (value === null || value === undefined) return !param.required;
  switch (param.type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object";
  }
}

/* ─── Tool Executors ─── */

function executeTTPScoreEntity(args: Record<string, unknown>): Record<string, unknown> {
  const factors: TransparencyFactors = {
    tier: args["tier"] as ApiTier,
    identityVerified: args["identityVerified"] as boolean,
    materialsContributed: args["materialsContributed"] as number,
    cyclesCompleted: args["cyclesCompleted"] as number,
    reviewsPassed: args["reviewsPassed"] as number,
    accountAgeDays: args["accountAgeDays"] as number,
    isRegulator: args["isRegulator"] as boolean,
    dataContributions: args["dataContributions"] as number,
  };

  const score = calculateTransparencyScore(factors);
  const band = getAccessBand(score);

  return { score, band, factors };
}

function executeTTPDetectCrawler(args: Record<string, unknown>): Record<string, unknown> {
  const userAgent = args["userAgent"] as string;
  const accessBand = (args["accessBand"] as string) ?? "public_record";

  const crawler = isAiCrawler(userAgent);
  const identified = identifyCrawler(userAgent);
  const feeCents = getVerificationFeeCents(
    accessBand as
      | "public_record"
      | "ml_verified"
      | "full_api"
      | "double_verified"
      | "ontology_licensed",
    crawler,
  );

  return { isCrawler: crawler, crawlerName: identified, feeCents };
}

function executeTTPCheckAccess(args: Record<string, unknown>): Record<string, unknown> {
  const result = processTTPRequest({
    path: args["path"] as string,
    userAgent: args["userAgent"] as string,
    apiTier: args["apiTier"] as ApiTier,
    isRegulator: args["isRegulator"] as boolean,
    ttScore: args["ttScore"] as number | undefined,
  });

  return {
    allowed: result.allowed,
    score: result.score,
    band: result.band,
    headers: result.headers,
    feeCents: result.feeCents,
  };
}

function executeRCMResolveTier(args: Record<string, unknown>): Record<string, unknown> {
  const tier = resolveTier(args["creditScore"] as number);
  return {
    tier: tier.tier,
    productClass: tier.productClass,
    name: tier.name,
    ficoRange: tier.ficoRange,
    description: tier.description,
  };
}

function executeRCMCalculatePayment(args: Record<string, unknown>): Record<string, unknown> {
  const principal = args["principal"] as number;
  const annualRate = args["annualRate"] as number;
  const termMonths = args["termMonths"] as number;

  const monthlyPayment = rcmMonthlyPayment(principal, annualRate, termMonths);
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal;

  return { monthlyPayment, totalInterest };
}

function executeRCMPreferredPayoff(args: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = args["loanAmount"] as number;
  const streamCount = args["streamCount"] as 1 | 2 | 3;

  const payoffDay = preferredPayoffDay(loanAmount, streamCount);
  const payoffMonths = Math.round((payoffDay / 30) * 10) / 10;
  const finalDailyPayment = payoffDay * streamCount;

  return { payoffDay, payoffMonths, finalDailyPayment };
}

function executeIntentValidateAction(args: Record<string, unknown>): Record<string, unknown> {
  const lensScore = scoreLucentLens(
    args["homeownerValue"] as number,
    args["collectiveValue"] as number,
    args["engineValue"] as number,
  );
  const lensResult = passesLucentLens(lensScore);
  const mveResult = passesMVE({
    materialValue: args["materialValue"] as boolean,
    ontologyData: args["ontologyData"] as boolean,
    robotTraining: args["robotTraining"] as boolean,
    marketIntelligence: args["marketIntelligence"] as boolean,
  });

  const blockedBy: string[] = [];
  if (!lensResult.passes) blockedBy.push("lucent_lens");
  if (!mveResult.passes) blockedBy.push("mve_gate");

  return {
    approved: lensResult.passes && mveResult.passes,
    lensScore,
    mveResult,
    blockedBy,
  };
}

function executeProvenanceGradeMaterial(args: Record<string, unknown>): Record<string, unknown> {
  const result = gradeMaterial({
    structuralIntegrity: args["structuralIntegrity"] as number,
    surfaceCondition: args["surfaceCondition"] as number,
    moistureContent: args["moistureContent"] as number,
    loadTested: args["loadTested"] as boolean,
    ageYears: args["ageYears"] as number,
  });
  return { grade: result.grade, score: result.score, reason: result.reason };
}

function executeProvenanceEstimateValue(args: Record<string, unknown>): Record<string, unknown> {
  return estimateValue(
    args["category"] as MaterialCategory,
    args["grade"] as MaterialGrade,
    args["boardFeet"] as number,
    args["contamination"] as ContaminationStatus,
  );
}

function executeRCMSimulateEquity(args: Record<string, unknown>): Record<string, unknown> {
  const result = simulateEquity({
    loanAmount: args["loanAmount"] as number,
    annualRate: args["annualRate"] as number,
    termMonths: args["termMonths"] as number,
    propertyValue: args["propertyValue"] as number,
    appreciationRate: args["appreciationRate"] as number,
    monthlyMaterialRevenueCents: args["monthlyMaterialRevenueCents"] as number,
    materialRevenueSharePercent: 0.51,
  });
  return {
    milestones: result.milestones,
    summary: result.summary,
    rcmPayment: result.rcmPayment,
    traditionalPayment: result.traditionalPayment,
  };
}

/* ─── Executor Registry ─── */

const EXECUTORS: Record<string, (args: Record<string, unknown>) => Record<string, unknown>> = {
  ttp_score_entity: executeTTPScoreEntity,
  ttp_detect_crawler: executeTTPDetectCrawler,
  ttp_check_access: executeTTPCheckAccess,
  rcm_resolve_tier: executeRCMResolveTier,
  rcm_calculate_payment: executeRCMCalculatePayment,
  rcm_preferred_payoff: executeRCMPreferredPayoff,
  intent_validate_action: executeIntentValidateAction,
  provenance_grade_material: executeProvenanceGradeMaterial,
  provenance_estimate_value: executeProvenanceEstimateValue,
  rcm_simulate_equity: executeRCMSimulateEquity,
};

/* ─── Public API ─── */

/**
 * Execute a single MCP tool call against the real engines.
 *
 * This is the function an MCP server calls when it receives a tool
 * invocation from an AI agent. It validates inputs, runs the engine
 * function, and returns a typed result.
 */
export function executeToolCall(input: ToolCallInput): ToolCallResult {
  const start = performance.now();

  /* Resolve tool definition */
  const definition = getTool(input.tool);
  if (!definition) {
    return {
      success: false,
      tool: input.tool,
      result: null,
      error: `Unknown tool: ${input.tool}`,
      executionMs: performance.now() - start,
    };
  }

  /* Validate parameters */
  const validationError = validateParams(definition, input.arguments);
  if (validationError) {
    return {
      success: false,
      tool: input.tool,
      result: null,
      error: validationError,
      executionMs: performance.now() - start,
    };
  }

  /* Execute */
  const executor = EXECUTORS[input.tool];
  if (!executor) {
    return {
      success: false,
      tool: input.tool,
      result: null,
      error: `No executor registered for tool: ${input.tool}`,
      executionMs: performance.now() - start,
    };
  }

  const result = executor(input.arguments);
  return {
    success: true,
    tool: input.tool,
    result,
    error: null,
    executionMs: performance.now() - start,
  };
}

/**
 * Execute multiple tool calls in sequence.
 * Returns results in the same order as inputs.
 */
export function executeBatch(inputs: ToolCallInput[]): ToolCallResult[] {
  return inputs.map(executeToolCall);
}
