/**
 * Disruption Engine — Quantified Paradigm Shift
 *
 * This module encodes the 100x metrics as executable scoring functions.
 * Instead of claiming disruption in a pitch deck, the code itself
 * calculates exactly how much better the ML Systems closed loop is
 * compared to traditional construction finance.
 *
 * The disruption score is a composite of measurable multipliers:
 * - Equity velocity (how fast homeowners build equity)
 * - Material recovery (waste eliminated, value captured)
 * - Cost reduction (total development cost vs. industry average)
 * - Margin improvement (GC margins vs. industry standard)
 * - Revenue conversion (cost centers converted to revenue streams)
 *
 * Every metric is backed by a real calculation, not a claim.
 */

/* ─── Industry Baselines ─── */

/**
 * Traditional construction/mortgage industry benchmarks.
 * These are the numbers ML Systems makes look absurd.
 */
export const INDUSTRY_BASELINE = {
  /** Years before principal payments exceed interest in traditional mortgage */
  yearsToEquityCrossover: 18,
  /** Percentage of construction materials sent to landfill */
  materialWasteRate: 0.9,
  /** Average new construction cost per home (RI market) */
  averageCostPerHome: 350_000,
  /** Industry-standard GC margin */
  gcMarginPercent: 0.16,
  /** Traditional demolition: pure cost, zero recovery */
  demolitionRecoveryRate: 0,
  /** Months to close a construction loan (traditional) */
  loanClosingMonths: 3,
  /** Revenue streams from demolition waste */
  demolitionRevenueStreams: 0,
  /** Shingle recyclers in Rhode Island */
  riShingleRecyclers: 0,
  /** Annual RI shingle waste (tons) going to landfill */
  riAnnualShingleWasteTons: 47_500,
} as const;

/* ─── ML Systems Metrics ─── */

/**
 * ML Systems closed-loop performance metrics.
 * Each field directly counters an industry baseline.
 */
export interface ClosedLoopMetrics {
  /** Equity crossover: years (0 = day one, since 100% goes to principal) */
  equityCrossoverYears: number;
  /** Material recovery rate (0.80 = 80%) */
  materialRecoveryRate: number;
  /** Total development cost per home */
  costPerHome: number;
  /** GC margin achieved */
  gcMarginPercent: number;
  /** Revenue from deconstruction (cost center → revenue) */
  deconstructionRevenue: number;
  /** Revenue streams from each construction dollar (MVE) */
  revenueStreams: number;
}

/**
 * Default ML Systems metrics based on operational targets.
 */
export const ML_SYSTEMS_DEFAULTS: ClosedLoopMetrics = {
  equityCrossoverYears: 0,
  materialRecoveryRate: 0.85,
  costPerHome: 185_000,
  gcMarginPercent: 0.259,
  deconstructionRevenue: 1,
  revenueStreams: 4,
};

/* ─── Disruption Multipliers ─── */

export interface DisruptionMultiplier {
  metric: string;
  oldWay: number;
  newWay: number;
  multiplier: number;
  unit: string;
  description: string;
}

/**
 * Calculate the disruption multiplier for equity velocity.
 *
 * Traditional mortgage: 18 years before principal > interest.
 * RCM: 100% to principal from day one. Interest is deferred.
 * The multiplier is literally infinite (18/0), so we cap at 18x.
 */
export function equityVelocityMultiplier(crossoverYears: number = 0): DisruptionMultiplier {
  const mult = crossoverYears === 0 ? INDUSTRY_BASELINE.yearsToEquityCrossover : Math.round(INDUSTRY_BASELINE.yearsToEquityCrossover / crossoverYears);
  return {
    metric: "equity_velocity",
    oldWay: INDUSTRY_BASELINE.yearsToEquityCrossover,
    newWay: crossoverYears,
    multiplier: mult,
    unit: "years to equity crossover",
    description: crossoverYears === 0
      ? "100% to principal from day one — no crossover needed"
      : `Equity crossover in ${crossoverYears} years vs. industry ${INDUSTRY_BASELINE.yearsToEquityCrossover}`,
  };
}

/**
 * Calculate the disruption multiplier for material recovery.
 *
 * Industry: 90% of materials landfilled.
 * ML Systems: 80-90% recovered, graded, given ML Material IDs.
 */
export function materialRecoveryMultiplier(recoveryRate: number = 0.85): DisruptionMultiplier {
  const industryRecovery = 1 - INDUSTRY_BASELINE.materialWasteRate;
  const multiplier = recoveryRate / industryRecovery;
  return {
    metric: "material_recovery",
    oldWay: industryRecovery,
    newWay: recoveryRate,
    multiplier: Math.round(multiplier * 10) / 10,
    unit: "recovery rate",
    description: `${(recoveryRate * 100).toFixed(0)}% recovery vs. industry ${(industryRecovery * 100).toFixed(0)}%`,
  };
}

/**
 * Calculate the disruption multiplier for cost reduction.
 *
 * RI average: $350K per home.
 * ML Systems target: $185K per home (47% reduction).
 */
export function costReductionMultiplier(costPerHome: number = 185_000): DisruptionMultiplier {
  const reduction = 1 - costPerHome / INDUSTRY_BASELINE.averageCostPerHome;
  return {
    metric: "cost_reduction",
    oldWay: INDUSTRY_BASELINE.averageCostPerHome,
    newWay: costPerHome,
    multiplier: Math.round((INDUSTRY_BASELINE.averageCostPerHome / costPerHome) * 10) / 10,
    unit: "cost per home (USD)",
    description: `${(reduction * 100).toFixed(0)}% cost reduction — $${INDUSTRY_BASELINE.averageCostPerHome.toLocaleString()} → $${costPerHome.toLocaleString()}`,
  };
}

/**
 * Calculate the disruption multiplier for GC margins.
 *
 * Industry standard: 16% GC margin.
 * ML Systems target: 25.9% (62% improvement).
 */
export function marginImprovementMultiplier(gcMargin: number = 0.259): DisruptionMultiplier {
  const multiplier = gcMargin / INDUSTRY_BASELINE.gcMarginPercent;
  return {
    metric: "margin_improvement",
    oldWay: INDUSTRY_BASELINE.gcMarginPercent,
    newWay: gcMargin,
    multiplier: Math.round(multiplier * 10) / 10,
    unit: "GC margin",
    description: `${(gcMargin * 100).toFixed(1)}% margin vs. industry ${(INDUSTRY_BASELINE.gcMarginPercent * 100).toFixed(0)}%`,
  };
}

/**
 * Calculate the disruption multiplier for revenue stream conversion.
 *
 * Traditional demolition: 0 revenue streams (pure cost).
 * ML Systems deconstruction: 4 revenue streams per dollar spent (MVE).
 *
 * This is a category creation — the multiplier is infinite (0 → 4),
 * so we represent it as the stream count itself.
 */
export function revenueStreamMultiplier(streams: number = 4): DisruptionMultiplier {
  return {
    metric: "revenue_streams",
    oldWay: INDUSTRY_BASELINE.demolitionRevenueStreams,
    newWay: streams,
    multiplier: streams,
    unit: "revenue streams per construction dollar",
    description: `${streams} returns per dollar (material + ontology + robot + market) vs. 0 from demolition`,
  };
}

/* ─── Composite Disruption Score ─── */

export interface DisruptionScore {
  multipliers: DisruptionMultiplier[];
  /** Geometric mean of all multipliers — the composite "Nx" factor */
  compositeMultiplier: number;
  /** Category: how disruptive is this? */
  category: "incremental" | "significant" | "paradigm_shift" | "category_creation";
  /** Anti-SaaS alignment: revenue model is outcome-based, not subscription */
  antiSaasAligned: boolean;
  /** Closed-loop integrity: all engines connected */
  closedLoop: boolean;
}

/**
 * Calculate the composite disruption score.
 *
 * Uses geometric mean of individual multipliers because multiplicative
 * effects compound — improving 5 dimensions by 3x each is not 15x, it's 243x.
 *
 * Categories:
 * - < 2x composite: incremental improvement
 * - 2-5x: significant disruption
 * - 5-10x: paradigm shift
 * - 10x+: category creation (you're not competing, you built something new)
 */
export function calculateDisruptionScore(
  metrics: ClosedLoopMetrics = ML_SYSTEMS_DEFAULTS,
): DisruptionScore {
  const multipliers = [
    equityVelocityMultiplier(metrics.equityCrossoverYears),
    materialRecoveryMultiplier(metrics.materialRecoveryRate),
    costReductionMultiplier(metrics.costPerHome),
    marginImprovementMultiplier(metrics.gcMarginPercent),
    revenueStreamMultiplier(metrics.revenueStreams),
  ];

  /* Geometric mean: (m1 × m2 × ... × mn)^(1/n) */
  const product = multipliers.reduce((acc, m) => acc * m.multiplier, 1);
  const compositeMultiplier = Math.round(Math.pow(product, 1 / multipliers.length) * 10) / 10;

  let category: DisruptionScore["category"];
  if (compositeMultiplier >= 10) category = "category_creation";
  else if (compositeMultiplier >= 5) category = "paradigm_shift";
  else if (compositeMultiplier >= 2) category = "significant";
  else category = "incremental";

  return {
    multipliers,
    compositeMultiplier,
    category,
    antiSaasAligned: true,
    closedLoop: metrics.revenueStreams >= 4,
  };
}

/* ─── Closed-Loop Validation ─── */

/**
 * Validate that the full closed loop is intact.
 *
 * The closed loop: Finance → Deconstruct → Design → Build → Repeat
 * Each stage feeds the next. If any stage is missing, the loop breaks.
 */
export type LoopStage = "finance" | "deconstruct" | "design" | "build";

export interface ClosedLoopResult {
  intact: boolean;
  stages: Record<LoopStage, boolean>;
  missingStages: LoopStage[];
  loopEfficiency: number;
}

export function validateClosedLoop(
  stages: Record<LoopStage, boolean>,
): ClosedLoopResult {
  const allStages: LoopStage[] = ["finance", "deconstruct", "design", "build"];
  const missing = allStages.filter((s) => !stages[s]);
  const present = allStages.filter((s) => stages[s]).length;

  return {
    intact: missing.length === 0,
    stages,
    missingStages: missing,
    loopEfficiency: present / allStages.length,
  };
}

/**
 * Compare traditional linear construction vs. ML Systems closed loop.
 *
 * Traditional: Buy land → Demolish → Design → Build → Sell → Done
 *   (Linear. One pass. No feedback. No material recovery.)
 *
 * ML Systems: Finance → Deconstruct → Design → Build → Repeat
 *   (Circular. Each cycle produces data, materials, market intelligence.)
 *   (Every dollar returns 4x through MVE.)
 */
export interface ParadigmComparison {
  traditional: {
    model: "linear";
    materialRecovery: number;
    revenueStreams: number;
    equityModel: string;
    pricingModel: string;
    dataCapture: boolean;
  };
  mlSystems: {
    model: "closed_loop";
    materialRecovery: number;
    revenueStreams: number;
    equityModel: string;
    pricingModel: string;
    dataCapture: boolean;
  };
  disruption: DisruptionScore;
}

export function compareParadigms(
  metrics: ClosedLoopMetrics = ML_SYSTEMS_DEFAULTS,
): ParadigmComparison {
  return {
    traditional: {
      model: "linear",
      materialRecovery: 1 - INDUSTRY_BASELINE.materialWasteRate,
      revenueStreams: 0,
      equityModel: "interest_first_18_years",
      pricingModel: "subscription",
      dataCapture: false,
    },
    mlSystems: {
      model: "closed_loop",
      materialRecovery: metrics.materialRecoveryRate,
      revenueStreams: metrics.revenueStreams,
      equityModel: "principal_first_day_one",
      pricingModel: "outcome_based",
      dataCapture: true,
    },
    disruption: calculateDisruptionScore(metrics),
  };
}
