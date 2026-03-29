/**
 * Transparency Trust Protocol — Shared Types
 *
 * API tier levels gate access depth through the TTP scoring system.
 * Each tier represents a subscription level with different capabilities.
 */

/** API subscription tier — determines base transparency score */
export type ApiTier = "free" | "starter" | "pro" | "enterprise";

/** Verification level for material provenance records */
export type VerificationLevel = 0 | 1 | 2;

/** Access band derived from transparency score (0-100) */
export type AccessBand =
  | "public_record" //  0-10
  | "ml_verified" // 11-30
  | "full_api" // 31-60
  | "double_verified" // 61-80
  | "ontology_licensed"; // 81-100

/** Factors that contribute to a transparency score */
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

/** Computed TTP score result with full factor breakdown */
export interface TTScoreResult {
  score: number;
  band: AccessBand;
  factors: {
    tier: number;
    identity: number;
    materials: number;
    cycles: number;
    reviews: number;
    age: number;
    data: number;
    compliance: number;
  };
  isRegulator: boolean;
  calculatedAt: Date;
  expiresAt: Date;
  cached: boolean;
}

/** Reason for a TTP score change — used in audit history */
export type TTChangeReason =
  | "recalculation"
  | "tier_upgrade"
  | "material_contributed"
  | "cycle_completed"
  | "review_passed"
  | "data_contributed"
  | "manual_adjustment"
  | "account_aged";
