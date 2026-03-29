/**
 * Reverse Construction Mortgage (RCM) — Public API
 *
 * Novel mortgage product where 100% of every payment goes to principal.
 * Interest is deferred as a separate liability. Overpayment allocation
 * varies by credit tier — no existing mortgage product does this.
 *
 * @example
 * ```ts
 * import { resolveTier, rcmMonthlyPayment, preferredPayoffDay } from "@ml-systems/yconic/rcm";
 *
 * const tier = resolveTier(720); // Tier 4 — Tempered (1 stream)
 * const monthly = rcmMonthlyPayment(320_000, 0.065, 360); // ~$2,023
 * const payoffDay = preferredPayoffDay(320_000, 1); // ~800 days
 * ```
 */

// Types
export type {
  ProductClass,
  OverpaymentMode,
  StreamCount,
  CreditTier,
  StandardTier,
  PreferredTier,
  RCMTier,
  StandardScheduleRow,
  StandardAnalysis,
  PreferredScheduleRow,
  PreferredAnalysis,
  FullComparison,
} from "./types.js";

// Core math
export { rcmMonthlyPayment, rcmAccruedInterest, rcmEquity } from "./math.js";

// Engine
export {
  STANDARD_TIERS,
  PREFERRED_TIERS,
  ALL_TIERS,
  resolveTier,
  allocateOverpayment,
  generateStandardSchedule,
  generatePreferredSchedule,
  preferredPayoffDay,
  preferredDailyPayment,
  preferredCumulativePaid,
  compareAllTiers,
} from "./engine.js";
