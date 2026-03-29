/**
 * Transparency Trust Protocol (TTP) — Public API
 *
 * The moat around the ML Systems ecosystem. Every entity gets a
 * Transparency Score (0-100) that gates access depth through 5 bands.
 *
 * @example
 * ```ts
 * import { calculateTransparencyScore, getAccessBand, isAiCrawler } from "@ml-systems/yconic/ttp";
 *
 * const score = calculateTransparencyScore({
 *   tier: "starter",
 *   identityVerified: true,
 *   materialsContributed: 5,
 *   cyclesCompleted: 1,
 *   reviewsPassed: 2,
 *   accountAgeDays: 180,
 *   isRegulator: false,
 *   dataContributions: 10,
 * });
 *
 * const band = getAccessBand(score); // "full_api"
 * ```
 */

// Types
export type {
  ApiTier,
  AccessBand,
  TransparencyFactors,
  TTScoreResult,
  TTChangeReason,
  VerificationLevel,
} from "./types.js";

// Core scoring
export {
  calculateTransparencyScore,
  getAccessBand,
  quickScoreFromTier,
  regulatorCanAccess,
  getVerificationFeeCents,
  transparencyHeaders,
  ACCESS_BAND_LABELS,
  ACCESS_BAND_THRESHOLDS,
  REGULATOR_ALLOWED_ENDPOINTS,
  VERIFICATION_FEE,
} from "./transparency.js";

// AI crawler detection
export {
  isAiCrawler,
  identifyCrawler,
  getKnownCrawlers,
  VERIFICATION_LABELS,
  VERIFICATION_DESCRIPTIONS,
  minTierForVerification,
} from "./ai-crawler.js";
export type { AiCrawlerName } from "./ai-crawler.js";

// Middleware
export { processTTPRequest } from "./middleware.js";
export type { TTPRequest, TTPResult } from "./middleware.js";
