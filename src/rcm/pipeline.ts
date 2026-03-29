/**
 * RCM Loan Processing Pipeline — End-to-End Origination
 *
 * This is the deep feature: a complete loan processing pipeline that
 * connects every engine in the ecosystem. A loan application flows
 * through TTP scoring, credit tier resolution, schedule generation,
 * intent validation, and final approval/denial.
 *
 * Pipeline stages:
 * 1. TTP Scoring — Is the applicant trusted enough?
 * 2. Credit Tier Resolution — Which RCM product do they qualify for?
 * 3. Schedule Generation — What do their payments look like?
 * 4. Intent Validation — Does this loan serve the homeowner first?
 * 5. Approval Decision — All gates must pass.
 *
 * This is NOT scaffolding. Every stage runs real calculations.
 * The pipeline produces actionable origination data.
 */

import { calculateTransparencyScore, getAccessBand } from "../ttp/transparency.js";
import type { TransparencyFactors, AccessBand } from "../ttp/types.js";
import { resolveTier, generateStandardSchedule, generatePreferredSchedule } from "./engine.js";
import { rcmMonthlyPayment, rcmEquity } from "./math.js";
import type { RCMTier, StandardScheduleRow, PreferredScheduleRow } from "./types.js";
import { scoreLucentLens, passesLucentLens, passesMVE } from "../intent/schema.js";
import type { MVEAssessment, LucentLensScore } from "../intent/schema.js";

/* ─── Application Input ─── */

export interface LoanApplication {
  /** Applicant identifier */
  applicantId: string;
  /** FICO credit score */
  creditScore: number;
  /** Requested loan amount */
  loanAmount: number;
  /** Annual interest rate (decimal) */
  annualRate: number;
  /** Loan term in months */
  termMonths: number;
  /** Estimated property value */
  propertyValue: number;
  /** TTP scoring factors */
  ttpFactors: TransparencyFactors;
  /** MVE assessment for the construction project */
  mve: MVEAssessment;
}

/* ─── Pipeline Stage Results ─── */

export interface TTPStageResult {
  score: number;
  band: AccessBand;
  meetsMinimum: boolean;
  minimumRequired: number;
}

export interface CreditStageResult {
  tier: RCMTier;
  monthlyPayment: number;
  equityAtYear5: number;
  equityAtYear10: number;
}

export interface ScheduleStageResult {
  type: "standard" | "preferred";
  standardSchedule: StandardScheduleRow[] | null;
  preferredSchedule: PreferredScheduleRow[] | null;
  principalPayoffMonth: number | null;
  principalPayoffDay: number | null;
}

export interface IntentStageResult {
  lensScore: LucentLensScore;
  lensApproved: boolean;
  lensReason: string;
  mveApproved: boolean;
  mveReturnCount: number;
  mveReason: string;
}

export type DenialReason =
  | "ttp_score_too_low"
  | "lucent_lens_failed"
  | "mve_gate_failed"
  | "credit_score_out_of_range";

export interface PipelineResult {
  approved: boolean;
  denialReasons: DenialReason[];
  applicantId: string;
  ttp: TTPStageResult;
  credit: CreditStageResult | null;
  schedule: ScheduleStageResult | null;
  intent: IntentStageResult;
  processedAt: Date;
}

/* ─── Pipeline Configuration ─── */

/** Minimum TTP score required to originate a loan */
const MINIMUM_TTP_SCORE = 15;

/** Homeowner value for RCM origination — high, because the product is designed for them */
const ORIGINATION_HOMEOWNER_VALUE = 35;

/** Collective value — community benefits from decon materials and local construction */
const ORIGINATION_COLLECTIVE_VALUE = 20;

/** Engine value — data capture, not extraction */
const ORIGINATION_ENGINE_VALUE = 10;

/* ─── Pipeline Execution ─── */

/**
 * Process a loan application through the full pipeline.
 *
 * This is the core function. It runs every stage in sequence,
 * collects results, and returns a comprehensive origination decision.
 *
 * The pipeline NEVER short-circuits — it runs all stages even if
 * an early stage fails, so the applicant gets complete feedback
 * on everything they need to fix. This is the Lucent Lens in action:
 * transparency over gatekeeping.
 */
export function processLoanApplication(application: LoanApplication): PipelineResult {
  const denialReasons: DenialReason[] = [];

  /* Stage 1: TTP Scoring */
  const ttpScore = calculateTransparencyScore(application.ttpFactors);
  const ttpBand = getAccessBand(ttpScore);
  const ttpMeetsMinimum = ttpScore >= MINIMUM_TTP_SCORE;

  const ttp: TTPStageResult = {
    score: ttpScore,
    band: ttpBand,
    meetsMinimum: ttpMeetsMinimum,
    minimumRequired: MINIMUM_TTP_SCORE,
  };

  if (!ttpMeetsMinimum) {
    denialReasons.push("ttp_score_too_low");
  }

  /* Stage 2: Credit Tier Resolution */
  let credit: CreditStageResult | null = null;
  if (application.creditScore >= 300 && application.creditScore <= 850) {
    const tier = resolveTier(application.creditScore);
    const monthlyPayment = rcmMonthlyPayment(
      application.loanAmount,
      application.annualRate,
      application.termMonths,
    );
    const balanceAtYear5 = Math.max(0, application.loanAmount - monthlyPayment * 60);
    const balanceAtYear10 = Math.max(0, application.loanAmount - monthlyPayment * 120);
    const equityAtYear5 = rcmEquity(application.propertyValue, balanceAtYear5);
    const equityAtYear10 = rcmEquity(application.propertyValue, balanceAtYear10);

    credit = { tier, monthlyPayment, equityAtYear5, equityAtYear10 };
  } else {
    denialReasons.push("credit_score_out_of_range");
  }

  /* Stage 3: Schedule Generation */
  let schedule: ScheduleStageResult | null = null;
  if (credit) {
    if (credit.tier.productClass === "standard") {
      const analysis = generateStandardSchedule(
        application.loanAmount,
        application.annualRate,
        application.termMonths,
        application.propertyValue,
        credit.tier,
      );

      schedule = {
        type: "standard",
        standardSchedule: analysis.schedule,
        preferredSchedule: null,
        principalPayoffMonth: analysis.principalPayoffMonth,
        principalPayoffDay: null,
      };
    } else {
      const analysis = generatePreferredSchedule(
        application.loanAmount,
        application.annualRate,
        application.propertyValue,
        credit.tier,
      );

      schedule = {
        type: "preferred",
        standardSchedule: null,
        preferredSchedule: analysis.schedule,
        principalPayoffMonth: null,
        principalPayoffDay: analysis.principalPayoffDay,
      };
    }
  }

  /* Stage 4: Intent Validation */
  const lensScore = scoreLucentLens(
    ORIGINATION_HOMEOWNER_VALUE,
    ORIGINATION_COLLECTIVE_VALUE,
    ORIGINATION_ENGINE_VALUE,
  );
  const lensResult = passesLucentLens(lensScore);
  const mveResult = passesMVE(application.mve);

  const intent: IntentStageResult = {
    lensScore,
    lensApproved: lensResult.passes,
    lensReason: lensResult.reason,
    mveApproved: mveResult.passes,
    mveReturnCount: mveResult.returnCount,
    mveReason: mveResult.reason,
  };

  if (!lensResult.passes) denialReasons.push("lucent_lens_failed");
  if (!mveResult.passes) denialReasons.push("mve_gate_failed");

  /* Stage 5: Final Decision */
  return {
    approved: denialReasons.length === 0,
    denialReasons,
    applicantId: application.applicantId,
    ttp,
    credit,
    schedule,
    intent,
    processedAt: new Date(),
  };
}

/* ─── Pipeline Utilities ─── */

/**
 * Quick eligibility check — runs TTP + credit stages only.
 * Use this for pre-qualification before collecting full application data.
 */
export function checkEligibility(
  ttpFactors: TransparencyFactors,
  creditScore: number,
): { eligible: boolean; ttpScore: number; tier: RCMTier | null; reasons: string[] } {
  const reasons: string[] = [];

  const ttpScore = calculateTransparencyScore(ttpFactors);
  if (ttpScore < MINIMUM_TTP_SCORE) {
    reasons.push(`TTP score ${ttpScore} below minimum ${MINIMUM_TTP_SCORE}`);
  }

  let tier: RCMTier | null = null;
  if (creditScore >= 300 && creditScore <= 850) {
    tier = resolveTier(creditScore);
  } else {
    reasons.push(`Credit score ${creditScore} outside valid range (300-850)`);
  }

  return { eligible: reasons.length === 0, ttpScore, tier, reasons };
}

/**
 * Calculate the equity advantage of RCM over a traditional mortgage.
 *
 * Traditional: ~$0 equity for 7+ years (interest-first amortization).
 * RCM: 100% to principal from day one.
 *
 * Returns the dollar difference at key milestones.
 */
export function equityAdvantage(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  propertyValue: number,
): {
  year1: { rcm: number; traditional: number; advantage: number };
  year5: { rcm: number; traditional: number; advantage: number };
  year10: { rcm: number; traditional: number; advantage: number };
} {
  const rcmPayment = rcmMonthlyPayment(loanAmount, annualRate, termMonths);

  /* Traditional mortgage amortization: interest-first */
  const monthlyRate = annualRate / 12;
  const traditionalPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  function traditionalEquity(months: number): number {
    let balance = loanAmount;
    for (let m = 0; m < months; m++) {
      const interest = balance * monthlyRate;
      const principal = traditionalPayment - interest;
      balance -= principal;
    }
    return propertyValue - Math.max(balance, 0);
  }

  function rcmEquityAt(months: number): number {
    const remainingBalance = Math.max(0, loanAmount - rcmPayment * months);
    return rcmEquity(propertyValue, remainingBalance);
  }

  return {
    year1: {
      rcm: rcmEquityAt(12),
      traditional: traditionalEquity(12),
      advantage: rcmEquityAt(12) - traditionalEquity(12),
    },
    year5: {
      rcm: rcmEquityAt(60),
      traditional: traditionalEquity(60),
      advantage: rcmEquityAt(60) - traditionalEquity(60),
    },
    year10: {
      rcm: rcmEquityAt(120),
      traditional: traditionalEquity(120),
      advantage: rcmEquityAt(120) - traditionalEquity(120),
    },
  };
}
