/**
 * ML Systems Intent Schema — Culture as Code
 *
 * Every AI agent in the ML Systems ecosystem inherits these constraints.
 * This is not a mission statement. It is a scoring function.
 *
 * The Lucent Lens value hierarchy governs every decision:
 *   Homeowner value (0-40) > Collective value (0-30) > Engine value (0-30)
 *
 * Any action that scores higher on Engine value than Homeowner value
 * is rejected automatically. The hierarchy is enforced, not suggested.
 *
 * Intent Schema concept: culture-as-code that AI agents inherit.
 * When an agent makes a decision, it runs through this schema first.
 */

/* ─── Value Hierarchy ─── */

export interface LucentLensScore {
  /** Direct benefit to the homeowner (0-40). Always evaluated first. */
  homeowner: number;
  /** Benefit to the collective — community, contractors, partners (0-30) */
  collective: number;
  /** Benefit to the ML Systems engine — data, revenue, efficiency (0-30) */
  engine: number;
  /** Total score (0-100) */
  total: number;
}

/**
 * Score an action through the Lucent Lens.
 *
 * The lens enforces a strict hierarchy:
 * 1. Homeowner value is weighted highest (40pts max)
 * 2. Collective value second (30pts max)
 * 3. Engine value last (30pts max)
 *
 * An action that benefits the engine at the homeowner's expense
 * will always score lower than one that benefits the homeowner.
 */
export function scoreLucentLens(
  homeowner: number,
  collective: number,
  engine: number,
): LucentLensScore {
  const h = Math.min(Math.max(homeowner, 0), 40);
  const c = Math.min(Math.max(collective, 0), 30);
  const e = Math.min(Math.max(engine, 0), 30);
  return { homeowner: h, collective: c, engine: e, total: h + c + e };
}

/**
 * Validate that an action passes the Lucent Lens hierarchy.
 *
 * Rules:
 * - Homeowner score must be >= engine score (homeowner-first)
 * - Total must be >= minimum threshold
 * - Actions that only benefit the engine are rejected
 */
export function passesLucentLens(
  score: LucentLensScore,
  minimumTotal: number = 30,
): { passes: boolean; reason: string } {
  if (score.homeowner === 0 && score.engine > 0) {
    return { passes: false, reason: "Engine-only actions are rejected. Homeowner must benefit." };
  }

  if (score.engine > score.homeowner) {
    return {
      passes: false,
      reason: "Engine value cannot exceed homeowner value. Rebalance the action.",
    };
  }

  if (score.total < minimumTotal) {
    return {
      passes: false,
      reason: `Total score ${score.total} below minimum ${minimumTotal}. Action lacks sufficient value.`,
    };
  }

  return { passes: true, reason: "Action approved by Lucent Lens." };
}

/* ─── Custodian Principles ─── */

/**
 * The Custodian's non-negotiable constraints.
 * These are encoded as executable rules, not aspirational values.
 */
export const CUSTODIAN_CONSTRAINTS = {
  /** We do not profit from users' compute power consumption. We optimize it. */
  transparencyTrust: "optimize_user_compute" as const,

  /** Public institutions receive equity before any private entity. Irreversible. */
  equityOrder: "public_before_private" as const,

  /** Every expense must return 4x value or it doesn't happen. */
  minimumViableExpense: 4 as const,

  /** Fiduciary duty to the general public, not just shareholders. */
  fiduciaryDuty: "public" as const,
} as const;

export type CustodianConstraint = keyof typeof CUSTODIAN_CONSTRAINTS;

/* ─── MVE Gate ─── */

/**
 * Minimum Viable Expense — every dollar must return 4x.
 *
 * The 4 returns from every construction dollar:
 * 1. Recovered material value (physical)
 * 2. Ontology data (ML training signal)
 * 3. Robot training signal (humanoid operations)
 * 4. Market-making intelligence (pricing, demand)
 *
 * If an expense doesn't produce at least 3 of 4, it fails MVE.
 */
export interface MVEAssessment {
  materialValue: boolean;
  ontologyData: boolean;
  robotTraining: boolean;
  marketIntelligence: boolean;
}

export function passesMVE(assessment: MVEAssessment): {
  passes: boolean;
  returnCount: number;
  reason: string;
} {
  const returns = [
    assessment.materialValue,
    assessment.ontologyData,
    assessment.robotTraining,
    assessment.marketIntelligence,
  ].filter(Boolean).length;

  if (returns >= 3) {
    return { passes: true, returnCount: returns, reason: `${returns}/4 returns. MVE passed.` };
  }

  return {
    passes: false,
    returnCount: returns,
    reason: `${returns}/4 returns. Minimum 3 required. Expense rejected.`,
  };
}

/* ─── Anti-SaaS Pricing Constraint ─── */

/**
 * ML Systems does not charge subscriptions for access to your own data.
 *
 * Pricing is outcome-based:
 * - You pay when value is delivered (home built, material sold, loan funded)
 * - Per-query fees for AI crawlers (they extract value, they pay)
 * - Tier upgrades unlock deeper data, not basic functionality
 *
 * The TTP score gates access depth — but the score is EARNED
 * through participation, not purchased through a subscription.
 */
export type PricingModel = "outcome_based" | "per_query" | "earned_access";

export const PRICING_RULES = {
  /** Users never pay to access their own project data */
  ownDataAccess: "free" as const,
  /** AI crawlers pay per-query verification fees */
  aiCrawlerAccess: "per_query" as const,
  /** Deeper ecosystem access is earned through contribution */
  ecosystemAccess: "earned_access" as const,
  /** Revenue from construction outcomes, not software seats */
  primaryRevenue: "outcome_based" as const,
} as const;

/* ─── Agent Intent Inheritance ─── */

/**
 * When a new AI agent is created in the ML Systems ecosystem,
 * it inherits this intent schema. The schema is not optional —
 * it is the operating system for every decision the agent makes.
 *
 * Agent hierarchy:
 *   CEO (Sal) → LM + FA + AE → PI → Domain Agents → Extensions
 *
 * Every agent at every level runs decisions through:
 * 1. Lucent Lens (value hierarchy)
 * 2. MVE gate (4x return requirement)
 * 3. Custodian constraints (transparency, equity order, fiduciary duty)
 * 4. Anti-SaaS pricing rules
 */
export interface AgentIntent {
  agentId: string;
  agentName: string;
  parentAgentId: string | null;
  /** Lucent Lens minimum score to act */
  minimumLensScore: number;
  /** Which custodian constraints this agent enforces */
  enforcedConstraints: CustodianConstraint[];
  /** Whether this agent can override MVE (only CEO can) */
  canOverrideMVE: boolean;
}

export function createAgentIntent(
  agentId: string,
  agentName: string,
  parentAgentId: string | null = null,
): AgentIntent {
  return {
    agentId,
    agentName,
    parentAgentId,
    minimumLensScore: 30,
    enforcedConstraints: [
      "transparencyTrust",
      "equityOrder",
      "minimumViableExpense",
      "fiduciaryDuty",
    ],
    canOverrideMVE: false,
  };
}
