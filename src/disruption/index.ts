/**
 * Disruption Engine — Quantified Paradigm Shift
 *
 * Encodes the 100x metrics as executable scoring functions.
 * Every claim is backed by a calculation, not a pitch slide.
 */

export {
  INDUSTRY_BASELINE,
  ML_SYSTEMS_DEFAULTS,
  equityVelocityMultiplier,
  materialRecoveryMultiplier,
  costReductionMultiplier,
  marginImprovementMultiplier,
  revenueStreamMultiplier,
  calculateDisruptionScore,
  validateClosedLoop,
  compareParadigms,
} from "./engine.js";

export type {
  ClosedLoopMetrics,
  DisruptionMultiplier,
  DisruptionScore,
  LoopStage,
  ClosedLoopResult,
  ParadigmComparison,
} from "./engine.js";
