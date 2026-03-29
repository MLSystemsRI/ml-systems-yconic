/**
 * ML Systems — RCM Variant Engine
 *
 * Two product classes, 6 total tiers, mapped to credit score.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * STANDARD RCM (Tiers 1–3) — Monthly payments
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   Same monthly payment M (standard amortization formula).
 *   100% of M goes to principal. Interest deferred as separate liability.
 *   When borrower pays ABOVE M, the excess is allocated per tier:
 *
 *   Tier 1 (580–619): Interest-First — 100% excess → accrued interest
 *                      (then principal once interest extinguished)
 *   Tier 2 (620–659): Split — 50/50 excess between interest and principal
 *   Tier 3 (660–699): Principal-First — 100% excess → principal
 *
 * ═══════════════════════════════════════════════════════════════════════
 * PREFERRED RCM (Tiers 4–6) — Daily arithmetic payments
 * ═══════════════════════════════════════════════════════════════════════
 *
 *   Modeled after the 1011 Ten Rod Road repayment vehicle:
 *     Day 1 = $1, Day 2 = $2, Day 3 = $3, ... Day N = $N
 *     Total after N days = N(N+1)/2
 *
 *   Borrower commits to DAILY payments. The arithmetic never stops
 *   until the loan is fully paid. Interest accrues monthly on remaining
 *   principal, deferred to the end (same as standard RCM).
 *   100% of every daily payment goes to principal.
 *
 *   Tier 4 (700–739): 1 stream — Day N total = $1 × N
 *   Tier 5 (740–779): 2 streams — Day N total = $2 × N
 *   Tier 6 (780+):    3 streams — Day N total = $3 × N
 *
 *   Multiple streams = concurrent arithmetic sequences. Each stream
 *   independently pays $1, $2, $3... per day. The daily payment is the
 *   sum of all active streams.
 */

import { rcmMonthlyPayment, rcmAccruedInterest } from "./rcm";

// ── Types ────────────────────────────────────────────────────────────

export type ProductClass = "standard" | "preferred";

export type OverpaymentMode = "interest_first" | "split" | "principal_first";

export type StreamCount = 1 | 2 | 3;

export type CreditTier = 1 | 2 | 3 | 4 | 5 | 6;

/** Standard RCM tier definition (monthly payments with overpayment mode) */
export interface StandardTier {
  tier: CreditTier;
  productClass: "standard";
  name: string;
  ficoRange: string;
  ficoMin: number;
  ficoMax: number;
  overpaymentMode: OverpaymentMode;
  description: string;
}

/** Preferred RCM tier definition (daily arithmetic payments) */
export interface PreferredTier {
  tier: CreditTier;
  productClass: "preferred";
  name: string;
  ficoRange: string;
  ficoMin: number;
  ficoMax: number;
  streamCount: StreamCount;
  /** Daily increment per stream (dollars) */
  dailyIncrement: number;
  description: string;
}

export type RCMTier = StandardTier | PreferredTier;

// ── Standard RCM Schedule Types ──────────────────────────────────────

export interface StandardScheduleRow {
  month: number;
  /** Base monthly payment M */
  payment: number;
  /** Overpayment amount above M (borrower-initiated) */
  overpayment: number;
  /** Total applied to principal this month */
  toPrincipal: number;
  /** Total applied to accrued interest this month */
  toInterest: number;
  /** Remaining principal balance */
  principalBalance: number;
  /** Accumulated deferred interest */
  accruedInterest: number;
  /** Total debt (principal + accrued interest) */
  totalDebt: number;
  /** Equity (propertyValue - principalBalance) */
  equity: number;
}

export interface StandardAnalysis {
  tier: StandardTier;
  schedule: StandardScheduleRow[];
  principalPayoffMonth: number;
  totalInterestAccrued: number;
  totalInterestPaid: number;
  deferredInterestAtPayoff: number;
  equityAtYear5: number;
  equityAtYear10: number;
}

// ── Preferred RCM Schedule Types ─────────────────────────────────────

export interface PreferredScheduleRow {
  day: number;
  /** Daily payment (streamCount × day × dailyIncrement) */
  dailyPayment: number;
  /** Cumulative paid to date */
  cumulativePaid: number;
  /** Remaining principal balance */
  principalBalance: number;
  /** Accumulated deferred interest (accrues monthly) */
  accruedInterest: number;
  /** Total debt */
  totalDebt: number;
  /** Equity */
  equity: number;
}

export interface PreferredAnalysis {
  tier: PreferredTier;
  /** Day-by-day schedule (sampled — every 30 days + key milestones) */
  schedule: PreferredScheduleRow[];
  /** Day when principal hits zero */
  principalPayoffDay: number;
  /** Equivalent in months */
  principalPayoffMonths: number;
  /** Final daily payment on payoff day */
  finalDailyPayment: number;
  /** Total interest accrued over life of loan */
  totalInterestAccrued: number;
  /** Deferred interest remaining at principal payoff */
  deferredInterestAtPayoff: number;
  /** Equity at payoff */
  equityAtPayoff: number;
  /** Total amount paid (principal only — interest deferred) */
  totalPaid: number;
}

// ── Tier Definitions ─────────────────────────────────────────────────

export const STANDARD_TIERS: StandardTier[] = [
  {
    tier: 1,
    productClass: "standard",
    name: "Entry",
    ficoRange: "580–619",
    ficoMin: 580,
    ficoMax: 619,
    overpaymentMode: "interest_first",
    description:
      "Most conservative. Any payment above M extinguishes accrued interest first. " +
      "Once deferred interest hits zero, remainder reduces principal. " +
      "Prioritizes liability reduction — safest for lender and borrower.",
  },
  {
    tier: 2,
    productClass: "standard",
    name: "Standard",
    ficoRange: "620–659",
    ficoMin: 620,
    ficoMax: 659,
    overpaymentMode: "split",
    description:
      "Balanced. Overpayments split 50/50 between accrued interest and principal. " +
      "Builds equity and reduces liability simultaneously.",
  },
  {
    tier: 3,
    productClass: "standard",
    name: "Proven",
    ficoRange: "660–699",
    ficoMin: 660,
    ficoMax: 699,
    overpaymentMode: "principal_first",
    description:
      "Equity-forward. Overpayments go 100% to principal — interest stays deferred. " +
      "Maximum equity acceleration on a monthly payment structure. " +
      "Lender trusts the credit profile to carry the deferred interest.",
  },
];

export const PREFERRED_TIERS: PreferredTier[] = [
  {
    tier: 4,
    productClass: "preferred",
    name: "Tempered",
    ficoRange: "700–739",
    ficoMin: 700,
    ficoMax: 739,
    streamCount: 1,
    dailyIncrement: 1,
    description:
      "Single arithmetic stream. Day N = $N. Gentle daily ramp — " +
      "starts at $1/day, escalates $1/day. The arithmetic never stops " +
      "until the loan is paid. Payoff in ~2.2 years on a $320K loan.",
  },
  {
    tier: 5,
    productClass: "preferred",
    name: "Forged",
    ficoRange: "740–779",
    ficoMin: 740,
    ficoMax: 779,
    streamCount: 2,
    dailyIncrement: 1,
    description:
      "Dual arithmetic streams. Day N = $2N. Two concurrent $1/day sequences " +
      "running in parallel — doubling the daily payment. " +
      "Payoff in ~1.5 years on a $320K loan.",
  },
  {
    tier: 6,
    productClass: "preferred",
    name: "Sovereign",
    ficoRange: "780+",
    ficoMin: 780,
    ficoMax: 850,
    streamCount: 3,
    dailyIncrement: 1,
    description:
      "Triple arithmetic streams. Day N = $3N. Three concurrent $1/day sequences. " +
      "Maximum velocity — payoff in ~1.3 years on a $320K loan. " +
      "Requires highest credit and financial capacity. " +
      "Modeled directly after the 1011 Ten Rod Road repayment vehicle.",
  },
];

export const ALL_TIERS: RCMTier[] = [...STANDARD_TIERS, ...PREFERRED_TIERS];

// ── Tier Resolution ──────────────────────────────────────────────────

/**
 * Resolve credit score → RCM tier.
 * Scores below 580 get Tier 1 (Entry). Scores above 850 get Tier 6 (Sovereign).
 */
export function resolveTier(creditScore: number): RCMTier {
  const clamped = Math.max(580, Math.min(850, creditScore));
  const tier = ALL_TIERS.find((t) => clamped >= t.ficoMin && clamped <= t.ficoMax);
  if (tier) return tier;
  return creditScore < 580 ? ALL_TIERS[0]! : ALL_TIERS[5]!;
}

// ── Standard RCM Engine ──────────────────────────────────────────────

/**
 * Allocate an overpayment (amount above M) per the tier's mode.
 *
 * @param excess       Amount paid above the monthly payment M
 * @param principalBal Current principal balance
 * @param accruedInt   Current accrued interest
 * @param mode         Overpayment allocation mode
 */
export function allocateOverpayment(
  excess: number,
  principalBal: number,
  accruedInt: number,
  mode: OverpaymentMode
): { toPrincipal: number; toInterest: number } {
  if (excess <= 0) return { toPrincipal: 0, toInterest: 0 };

  switch (mode) {
    case "interest_first": {
      const toInt = Math.min(excess, accruedInt);
      const toPrin = Math.min(excess - toInt, principalBal);
      return { toPrincipal: toPrin, toInterest: toInt };
    }
    case "split": {
      const half = excess / 2;
      const toInt = Math.min(half, accruedInt);
      // If interest is less than half, the unused portion goes to principal
      const toPrin = Math.min(half + (half - toInt), principalBal);
      return { toPrincipal: toPrin, toInterest: toInt };
    }
    case "principal_first": {
      const toPrin = Math.min(excess, principalBal);
      return { toPrincipal: toPrin, toInterest: 0 };
    }
  }
}

/**
 * Generate a month-by-month schedule for a Standard RCM tier.
 *
 * @param loanAmount     Principal at origination
 * @param annualRate     Annual interest rate (decimal, e.g., 0.065)
 * @param termMonths     Loan term in months
 * @param propertyValue  Property value for equity calculation
 * @param tier           Standard tier (determines overpayment mode)
 * @param overpaymentFn  Optional: function returning the overpayment amount for a given month.
 *                       If omitted, no overpayments (pure RCM baseline).
 */
export function generateStandardSchedule(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  propertyValue: number,
  tier: StandardTier,
  overpaymentFn?: (month: number, principalBal: number, accruedInt: number) => number
): StandardAnalysis {
  const r = annualRate / 12;
  const M = rcmMonthlyPayment(loanAmount, annualRate, termMonths);

  const schedule: StandardScheduleRow[] = [];
  let principalBal = loanAmount;
  let accruedInt = 0;
  let totalInterestAccrued = 0;
  let totalInterestPaid = 0;
  let principalPayoffMonth = termMonths;
  let paidOff = false;

  // Month 0
  schedule.push({
    month: 0,
    payment: 0,
    overpayment: 0,
    toPrincipal: 0,
    toInterest: 0,
    principalBalance: principalBal,
    accruedInterest: 0,
    totalDebt: principalBal,
    equity: propertyValue - principalBal,
  });

  for (let t = 1; t <= termMonths; t++) {
    if (paidOff) {
      // Loan already paid off — carry forward
      schedule.push({
        month: t,
        payment: 0,
        overpayment: 0,
        toPrincipal: 0,
        toInterest: 0,
        principalBalance: 0,
        accruedInterest: accruedInt,
        totalDebt: accruedInt,
        equity: propertyValue,
      });
      continue;
    }

    // 1. Interest accrues on remaining principal
    const monthInterest = principalBal * r;
    accruedInt += monthInterest;
    totalInterestAccrued += monthInterest;

    // 2. Base payment: 100% of M → principal
    const baseToPrin = Math.min(M, principalBal);
    principalBal = Math.max(0, principalBal - baseToPrin);

    // 3. Overpayment (if any)
    const overpayment = overpaymentFn ? Math.max(0, overpaymentFn(t, principalBal, accruedInt)) : 0;
    const { toPrincipal: extraPrin, toInterest: extraInt } = allocateOverpayment(
      overpayment,
      principalBal,
      accruedInt,
      tier.overpaymentMode
    );
    principalBal = Math.max(0, principalBal - extraPrin);
    accruedInt = Math.max(0, accruedInt - extraInt);
    totalInterestPaid += extraInt;

    if (!paidOff && principalBal <= 0.01) {
      principalPayoffMonth = t;
      paidOff = true;
    }

    schedule.push({
      month: t,
      payment: M,
      overpayment,
      toPrincipal: baseToPrin + extraPrin,
      toInterest: extraInt,
      principalBalance: principalBal,
      accruedInterest: accruedInt,
      totalDebt: principalBal + accruedInt,
      equity: propertyValue - principalBal,
    });
  }

  return {
    tier,
    schedule,
    principalPayoffMonth,
    totalInterestAccrued,
    totalInterestPaid,
    deferredInterestAtPayoff: schedule[principalPayoffMonth]?.accruedInterest ?? 0,
    equityAtYear5: schedule[Math.min(60, schedule.length - 1)]?.equity ?? 0,
    equityAtYear10: schedule[Math.min(120, schedule.length - 1)]?.equity ?? 0,
  };
}

// ── Preferred RCM Engine (Daily Arithmetic) ──────────────────────────

/**
 * Calculate the day when principal is fully paid for a Preferred tier.
 *
 * Daily payment at day d = streamCount × dailyIncrement × d
 * Cumulative paid through day D = streamCount × dailyIncrement × D(D+1)/2
 *
 * Solve for D: k × D(D+1)/2 = L
 *   D² + D - 2L/k = 0
 *   D = (-1 + √(1 + 8L/k)) / 2
 *
 * Interest accrues monthly but doesn't affect the principal payoff calculation
 * because 100% of daily payments go to principal and interest is deferred.
 */
export function preferredPayoffDay(
  loanAmount: number,
  streamCount: StreamCount,
  dailyIncrement: number = 1
): number {
  const k = streamCount * dailyIncrement;
  return Math.ceil((-1 + Math.sqrt(1 + (8 * loanAmount) / k)) / 2);
}

/**
 * Daily payment amount for a Preferred tier at a given day.
 */
export function preferredDailyPayment(
  day: number,
  streamCount: StreamCount,
  dailyIncrement: number = 1
): number {
  return streamCount * dailyIncrement * day;
}

/**
 * Cumulative amount paid through day D for a Preferred tier.
 */
export function preferredCumulativePaid(
  day: number,
  streamCount: StreamCount,
  dailyIncrement: number = 1
): number {
  const k = streamCount * dailyIncrement;
  return k * day * (day + 1) / 2;
}

/**
 * Generate a schedule for a Preferred RCM tier.
 *
 * Simulates day-by-day: 100% of daily payment → principal.
 * Interest accrues on the 1st of each month on remaining principal, deferred.
 * Schedule is sampled (every 30 days + payoff day) to keep output manageable.
 *
 * @param loanAmount    Principal at origination
 * @param annualRate    Annual interest rate (decimal)
 * @param propertyValue Property value for equity calculation
 * @param tier          Preferred tier (determines stream count)
 */
export function generatePreferredSchedule(
  loanAmount: number,
  annualRate: number,
  propertyValue: number,
  tier: PreferredTier
): PreferredAnalysis {
  const dailyRate = annualRate / 365;
  const monthlyRate = annualRate / 12;
  const payoffDay = preferredPayoffDay(loanAmount, tier.streamCount, tier.dailyIncrement);

  const schedule: PreferredScheduleRow[] = [];
  let principalBal = loanAmount;
  let accruedInt = 0;
  let totalInterestAccrued = 0;
  let cumulativePaid = 0;
  let actualPayoffDay = payoffDay;

  // Day 0
  schedule.push({
    day: 0,
    dailyPayment: 0,
    cumulativePaid: 0,
    principalBalance: principalBal,
    accruedInterest: 0,
    totalDebt: principalBal,
    equity: propertyValue - principalBal,
  });

  // Sample points: every 30 days + payoff day
  const sampleDays = new Set<number>();
  for (let d = 30; d <= payoffDay + 30; d += 30) sampleDays.add(d);
  sampleDays.add(payoffDay);
  // Also add day 1, 7, 90, 180, 365
  for (const d of [1, 7, 90, 180, 365]) sampleDays.add(d);

  let paidOff = false;

  for (let d = 1; d <= payoffDay + 30; d++) {
    if (paidOff) break;

    // Interest accrues monthly (on day 30, 60, 90, etc.)
    if (d % 30 === 0 && principalBal > 0) {
      const monthInt = principalBal * monthlyRate;
      accruedInt += monthInt;
      totalInterestAccrued += monthInt;
    }

    // Daily payment → 100% to principal
    const dailyPay = preferredDailyPayment(d, tier.streamCount, tier.dailyIncrement);
    const applied = Math.min(dailyPay, principalBal);
    principalBal = Math.max(0, principalBal - applied);
    cumulativePaid += applied;

    if (principalBal <= 0.01 && !paidOff) {
      actualPayoffDay = d;
      paidOff = true;
    }

    // Record at sample points
    if (sampleDays.has(d) || paidOff) {
      schedule.push({
        day: d,
        dailyPayment: dailyPay,
        cumulativePaid,
        principalBalance: principalBal,
        accruedInterest: accruedInt,
        totalDebt: principalBal + accruedInt,
        equity: propertyValue - principalBal,
      });
      if (paidOff) break;
    }
  }

  const finalPayment = preferredDailyPayment(actualPayoffDay, tier.streamCount, tier.dailyIncrement);

  return {
    tier,
    schedule,
    principalPayoffDay: actualPayoffDay,
    principalPayoffMonths: +(actualPayoffDay / 30.44).toFixed(1),
    finalDailyPayment: finalPayment,
    totalInterestAccrued,
    deferredInterestAtPayoff: accruedInt,
    equityAtPayoff: propertyValue,
    totalPaid: cumulativePaid,
  };
}

// ── Full Comparison ──────────────────────────────────────────────────

export interface FullComparison {
  loanAmount: number;
  annualRate: number;
  termMonths: number;
  propertyValue: number;
  flatRCM: {
    monthlyPayment: number;
    principalPayoffMonth: number;
    totalInterestAccrued: number;
    equityAtYear5: number;
    equityAtYear10: number;
  };
  standard: StandardAnalysis[];
  preferred: PreferredAnalysis[];
}

/**
 * Run all 6 tiers against the same loan parameters.
 *
 * For Standard tiers, an optional overpaymentAmount sets a fixed monthly
 * overpayment above M (default: $500/mo to demonstrate mode differences).
 */
export function compareAllTiers(
  loanAmount: number,
  annualRate: number,
  termMonths: number,
  propertyValue: number,
  overpaymentAmount: number = 500
): FullComparison {
  const flatM = rcmMonthlyPayment(loanAmount, annualRate, termMonths);
  const flatPayoff = Math.ceil(loanAmount / flatM);
  const flatInterest = rcmAccruedInterest(loanAmount, flatM, annualRate, termMonths);
  const flatEquity5 = propertyValue - Math.max(loanAmount - 60 * flatM, 0);
  const flatEquity10 = propertyValue - Math.max(loanAmount - 120 * flatM, 0);

  const standard = STANDARD_TIERS.map((tier) =>
    generateStandardSchedule(
      loanAmount,
      annualRate,
      termMonths,
      propertyValue,
      tier,
      // Fixed overpayment each month (to show mode differences)
      (_month, prinBal, _accInt) => (prinBal > 0 ? overpaymentAmount : 0)
    )
  );

  const preferred = PREFERRED_TIERS.map((tier) =>
    generatePreferredSchedule(loanAmount, annualRate, propertyValue, tier)
  );

  return {
    loanAmount,
    annualRate,
    termMonths,
    propertyValue,
    flatRCM: {
      monthlyPayment: flatM,
      principalPayoffMonth: flatPayoff,
      totalInterestAccrued: flatInterest,
      equityAtYear5: flatEquity5,
      equityAtYear10: flatEquity10,
    },
    standard,
    preferred,
  };
}
