/**
 * Transparency Trust Protocol (TTP) — Core Scoring Engine
 *
 * The Custodian's moat around both ecosystems.
 * Every entity gets a Transparency Score (0-100).
 * Earn it through participation or buy it through a tier.
 *
 * Regulators (state, municipal, local — any government entity
 * in a real estate transaction) get scoped compliance access,
 * NOT automatic Score 100. They see the public data they need
 * for double-verification — nothing more.
 *
 * AI crawlers start at 0. Third-party AI accessing public
 * property records pays ML Systems an incremental verification
 * fee — we are the second stamp on every query.
 *
 * The moat deepens as more entities participate —
 * contributions improve data quality, which increases
 * the value of deeper access, which incentivizes
 * more participation. The glow IS the wall.
 */

import type { ApiTier, AccessBand, TransparencyFactors } from "./types.js";

/* ─── Factor Weights ─── */

const TIER_SCORES: Record<ApiTier, number> = {
  free: 5,
  starter: 15,
  pro: 30,
  enterprise: 50,
};

const IDENTITY_BONUS = 20;
const MATERIAL_SCORE_PER = 1; // +1 per verified material, capped at 15
const MATERIAL_CAP = 15;
const CYCLE_SCORE_PER = 10; // +10 per completed cycle, capped at 30
const CYCLE_CAP = 30;
const REVIEW_SCORE_PER = 5; // +5 per review passed, capped at 15
const REVIEW_CAP = 15;
const ACCOUNT_AGE_MAX = 10; // up to +10 based on age
const ACCOUNT_AGE_DAYS_FULL = 365; // 1 year = full age bonus
const DATA_CONTRIBUTION_PER = 0.5; // +0.5 per data point, capped at 10
const DATA_CONTRIBUTION_CAP = 10;
const COMPLIANCE_PARTNER_BONUS = 5; // small bonus for recognized government entities

/* ─── Score Calculation ─── */

/**
 * Calculate a transparency score from raw factors.
 *
 * Score components:
 * - Tier (5-50): base score from API subscription level
 * - Identity (0-20): verified identity bonus
 * - Materials (0-15): +1 per verified material contributed
 * - Cycles (0-30): +10 per completed project cycle
 * - Reviews (0-15): +5 per annual review passed
 * - Age (0-10): linear ramp to 1 year
 * - Data (0-10): +0.5 per data contribution
 * - Compliance (0-5): bonus for recognized government entities
 *
 * Maximum possible score: 155 → clamped to 100
 */
export function calculateTransparencyScore(factors: TransparencyFactors): number {
  let score = 0;

  // Clamp all numeric inputs to non-negative — negative values are invalid
  const materials = Math.max(0, factors.materialsContributed);
  const cycles = Math.max(0, factors.cyclesCompleted);
  const reviews = Math.max(0, factors.reviewsPassed);
  const ageDays = Math.max(0, factors.accountAgeDays);
  const dataContribs = Math.max(0, factors.dataContributions);

  // Tier — base score from subscription level
  score += TIER_SCORES[factors.tier] ?? 5;

  // Identity — verified through Clerk/KYC
  if (factors.identityVerified) score += IDENTITY_BONUS;

  // Materials contributed — provenance-tracked items
  score += Math.min(materials * MATERIAL_SCORE_PER, MATERIAL_CAP);

  // Cycles completed — full project lifecycle completions
  score += Math.min(cycles * CYCLE_SCORE_PER, CYCLE_CAP);

  // Reviews passed — annual performance gates
  score += Math.min(reviews * REVIEW_SCORE_PER, REVIEW_CAP);

  // Account age — time-based trust ramp
  const ageRatio = Math.min(ageDays / ACCOUNT_AGE_DAYS_FULL, 1);
  score += Math.round(ageRatio * ACCOUNT_AGE_MAX);

  // Data contributions — decon logs, BOH listings, design specs
  score += Math.min(dataContribs * DATA_CONTRIBUTION_PER, DATA_CONTRIBUTION_CAP);

  // Compliance partner bonus — recognized government entities
  if (factors.isRegulator) score += COMPLIANCE_PARTNER_BONUS;

  return Math.min(Math.round(score), 100);
}

/* ─── Access Band Resolution ─── */

/**
 * Map a transparency score to its access band.
 *
 * | Score | Band               | Access Level                        |
 * |-------|--------------------|-------------------------------------|
 * | 0-10  | public_record      | Name, category, status              |
 * | 11-30 | ml_verified        | Provenance chain, grading           |
 * | 31-60 | full_api           | Material feeds, valuations          |
 * | 61-80 | double_verified    | State cross-verified, bulk export   |
 * | 81-100| ontology_licensed  | Construction DAG, robot params      |
 */
export function getAccessBand(score: number): AccessBand {
  if (score <= 10) return "public_record";
  if (score <= 30) return "ml_verified";
  if (score <= 60) return "full_api";
  if (score <= 80) return "double_verified";
  return "ontology_licensed";
}

/** Human-readable labels for each TTP access band */
export const ACCESS_BAND_LABELS: Record<AccessBand, string> = {
  public_record: "Public Record (Level 0)",
  ml_verified: "ML Systems Verified (Level 1)",
  full_api: "Full API Access",
  double_verified: "Double-Verified (Level 2)",
  ontology_licensed: "Ontology Licensed (Full Access)",
};

/** Score thresholds and descriptions for each TTP access band */
export const ACCESS_BAND_THRESHOLDS: {
  band: AccessBand;
  min: number;
  max: number;
  label: string;
}[] = [
  {
    band: "public_record",
    min: 0,
    max: 10,
    label: "Public record only — name, category, status",
  },
  {
    band: "ml_verified",
    min: 11,
    max: 30,
    label: "Provenance chain, grading, contamination data",
  },
  {
    band: "full_api",
    min: 31,
    max: 60,
    label: "Material feeds, valuations, marketplace access",
  },
  {
    band: "double_verified",
    min: 61,
    max: 80,
    label: "State cross-verified data, bulk export, webhooks",
  },
  {
    band: "ontology_licensed",
    min: 81,
    max: 100,
    label: "Construction DAG, robot params, ML1 metadata",
  },
];

/* ─── Quick Score from Tier (for API-key-only contexts) ─── */

/**
 * Derive a quick transparency score from tier alone.
 * Used when full factor calculation is unavailable (DB fallback).
 */
export function quickScoreFromTier(tier: ApiTier, isRegulator: boolean): number {
  const base = TIER_SCORES[tier] ?? 5;
  return isRegulator ? Math.min(base + COMPLIANCE_PARTNER_BONUS, 100) : base;
}

/* ─── Regulator Scoped Access ─── */

/**
 * Regulators (state, municipal, local government in real estate transactions)
 * get scoped access to compliance data — NOT blanket full access.
 * They see what they need for their regulatory function, nothing more.
 */
export const REGULATOR_ALLOWED_ENDPOINTS = [
  "/api/v1/materials/dem-export",
  "/api/v1/materials/provenance",
  "/api/v1/materials/status",
  "/api/v1/properties/compliance",
  "/api/v1/properties/public-record",
  "/api/v1/projects/permits",
] as const;

/**
 * Check if a regulator can access a specific endpoint.
 * Regulators on free/starter tiers are restricted to compliance endpoints.
 * If they pay for pro/enterprise, they get normal tier access like anyone else.
 */
export function regulatorCanAccess(endpoint: string, tier: ApiTier): boolean {
  if (tier === "pro" || tier === "enterprise") return true;
  return REGULATOR_ALLOWED_ENDPOINTS.some((allowed) => endpoint.startsWith(allowed));
}

/* ─── Verification Fee (2nd Stamp) ─── */

/**
 * ML Systems is the second verification stamp on public property data.
 * When a third-party AI queries public records through our API,
 * they pay an incremental verification fee per query.
 *
 * State/municipal source → ML Systems verifies & stamps → AI pays per-query
 */
export const VERIFICATION_FEE = {
  /** Per-query fee for AI accessing double-verified data (cents) */
  doubleVerifiedCents: 25,
  /** Per-query fee for AI accessing ML-verified data (cents) */
  mlVerifiedCents: 5,
  /** Per-query fee for public record pass-through (cents) */
  publicRecordCents: 1,
  /** Free tier gets 10 free verification queries/day */
  freeQuotaPerDay: 10,
  /** Starter tier gets 500 free verification queries/day */
  starterQuotaPerDay: 500,
  /** Pro tier gets unlimited (included in subscription) */
  proQuotaPerDay: Infinity,
} as const;

/**
 * Calculate verification fee for an AI query based on data level accessed.
 * Returns fee in cents. 0 = no fee (within quota or non-AI).
 */
export function getVerificationFeeCents(band: AccessBand, isAiQuery: boolean): number {
  if (!isAiQuery) return 0;
  switch (band) {
    case "double_verified":
      return VERIFICATION_FEE.doubleVerifiedCents;
    case "ml_verified":
      return VERIFICATION_FEE.mlVerifiedCents;
    case "public_record":
      return VERIFICATION_FEE.publicRecordCents;
    default:
      return 0; // full_api and ontology are subscription-gated
  }
}

/* ─── Response Headers ─── */

/**
 * Generate TTP response headers for API responses.
 * Every API response includes X-TT-Score, X-TT-Band, and X-TT-Protocol.
 */
export function transparencyHeaders(
  score: number,
  extra?: { verificationFeeCents?: number; regulatorScoped?: boolean },
): Record<string, string> {
  const band = getAccessBand(score);
  const headers: Record<string, string> = {
    "X-TT-Score": String(score),
    "X-TT-Band": band,
    "X-TT-Protocol": "Transparency Trust Protocol v2",
  };
  if (extra?.verificationFeeCents) {
    headers["X-TT-Verification-Fee"] = `${extra.verificationFeeCents}¢`;
  }
  if (extra?.regulatorScoped) {
    headers["X-TT-Regulator-Scope"] = "compliance";
  }
  return headers;
}
