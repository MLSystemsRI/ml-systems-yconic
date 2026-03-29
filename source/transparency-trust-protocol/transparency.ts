/**
 * Transparency Trust Protocol (TTP)
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

import type { ApiTier } from "./api-auth";

/* ─── Score Factors ─── */

export interface TransparencyFactors {
  /** API tier level */
  tier: ApiTier;
  /** Identity verified through Clerk/KYC */
  identityVerified: boolean;
  /** Number of verified materials contributed */
  materialsContributed: number;
  /** Number of completed project cycles */
  cyclesCompleted: number;
  /** Number of annual review gates passed (employees) */
  reviewsPassed: number;
  /** Days since account creation */
  accountAgeDays: number;
  /** State agency / regulator status */
  isRegulator: boolean;
  /** Data contributions (decon logs, BOH listings, design specs) */
  dataContributions: number;
}

/* ─── Factor Weights ─── */

const TIER_SCORES: Record<ApiTier, number> = {
  free:       5,
  starter:    15,
  pro:        30,
  enterprise: 50,
};

const IDENTITY_BONUS = 20;
const MATERIAL_SCORE_PER = 1;    // +1 per verified material, capped at 15
const MATERIAL_CAP = 15;
const CYCLE_SCORE_PER = 10;      // +10 per completed cycle, capped at 30
const CYCLE_CAP = 30;
const REVIEW_SCORE_PER = 5;      // +5 per review passed, capped at 15
const REVIEW_CAP = 15;
const ACCOUNT_AGE_MAX = 10;      // up to +10 based on age
const ACCOUNT_AGE_DAYS_FULL = 365; // 1 year = full age bonus
const DATA_CONTRIBUTION_PER = 0.5; // +0.5 per data point, capped at 10
const DATA_CONTRIBUTION_CAP = 10;
const COMPLIANCE_PARTNER_BONUS = 5; // small bonus for recognized government entities

/* ─── Score Calculation ─── */

export function calculateTransparencyScore(factors: TransparencyFactors): number {
  // Regulators score normally — no automatic 100.
  // They earn their score like everyone else, plus a small compliance partner bonus.
  let score = 0;

  // Tier
  score += TIER_SCORES[factors.tier] ?? 5;

  // Identity
  if (factors.identityVerified) score += IDENTITY_BONUS;

  // Materials contributed
  score += Math.min(factors.materialsContributed * MATERIAL_SCORE_PER, MATERIAL_CAP);

  // Cycles completed
  score += Math.min(factors.cyclesCompleted * CYCLE_SCORE_PER, CYCLE_CAP);

  // Reviews passed
  score += Math.min(factors.reviewsPassed * REVIEW_SCORE_PER, REVIEW_CAP);

  // Account age
  const ageRatio = Math.min(factors.accountAgeDays / ACCOUNT_AGE_DAYS_FULL, 1);
  score += Math.round(ageRatio * ACCOUNT_AGE_MAX);

  // Data contributions
  score += Math.min(factors.dataContributions * DATA_CONTRIBUTION_PER, DATA_CONTRIBUTION_CAP);

  // Compliance partner bonus — recognized government entities
  if (factors.isRegulator) score += COMPLIANCE_PARTNER_BONUS;

  return Math.min(Math.round(score), 100);
}

/* ─── Access Thresholds ─── */

export type AccessBand =
  | "public_record"        // 0-10
  | "ml_verified"          // 11-30
  | "full_api"             // 31-60
  | "double_verified"      // 61-80
  | "ontology_licensed";   // 81-100

export function getAccessBand(score: number): AccessBand {
  if (score <= 10)  return "public_record";
  if (score <= 30)  return "ml_verified";
  if (score <= 60)  return "full_api";
  if (score <= 80)  return "double_verified";
  return "ontology_licensed";
}

export const ACCESS_BAND_LABELS: Record<AccessBand, string> = {
  public_record:      "Public Record (Level 0)",
  ml_verified:        "ML Systems Verified (Level 1)",
  full_api:           "Full API Access",
  double_verified:    "Double-Verified (Level 2)",
  ontology_licensed:  "Ontology Licensed (Full Access)",
};

export const ACCESS_BAND_THRESHOLDS: { band: AccessBand; min: number; max: number; label: string }[] = [
  { band: "public_record",     min: 0,  max: 10,  label: "Public record only — name, category, status" },
  { band: "ml_verified",       min: 11, max: 30,  label: "Provenance chain, grading, contamination data" },
  { band: "full_api",          min: 31, max: 60,  label: "Material feeds, valuations, marketplace access" },
  { band: "double_verified",   min: 61, max: 80,  label: "State cross-verified data, bulk export, webhooks" },
  { band: "ontology_licensed", min: 81, max: 100, label: "Construction DAG, robot params, ML1 metadata" },
];

/* ─── Quick Score from Tier (for API-key-only contexts) ─── */

export function quickScoreFromTier(tier: ApiTier, isRegulator: boolean): number {
  // Regulators get tier score + compliance bonus — NOT automatic 100
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
  "/api/v1/materials/dem-export",      // DEM compliance export
  "/api/v1/materials/provenance",      // Material provenance lookup
  "/api/v1/materials/status",          // Material status/contamination
  "/api/v1/properties/compliance",     // Property compliance records
  "/api/v1/properties/public-record",  // Public record verification
  "/api/v1/projects/permits",          // Permit and inspection data
] as const;

/**
 * Check if a regulator can access a specific endpoint.
 * Regulators on free/starter tiers are restricted to compliance endpoints.
 * If they pay for pro/enterprise, they get normal tier access like anyone else.
 */
export function regulatorCanAccess(endpoint: string, tier: ApiTier): boolean {
  // Pro+ regulators get normal tier-based access (they paid for it)
  if (tier === "pro" || tier === "enterprise") return true;
  // Free/starter regulators: compliance endpoints only
  return REGULATOR_ALLOWED_ENDPOINTS.some(allowed => endpoint.startsWith(allowed));
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
export function getVerificationFeeCents(
  band: AccessBand,
  isAiCrawler: boolean,
): number {
  if (!isAiCrawler) return 0; // humans don't pay per-query
  switch (band) {
    case "double_verified":   return VERIFICATION_FEE.doubleVerifiedCents;
    case "ml_verified":       return VERIFICATION_FEE.mlVerifiedCents;
    case "public_record":     return VERIFICATION_FEE.publicRecordCents;
    default:                  return 0; // full_api and ontology are subscription-gated
  }
}

/* ─── Response Headers ─── */

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
