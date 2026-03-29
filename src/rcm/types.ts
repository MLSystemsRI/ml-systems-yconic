/**
 * Reverse Construction Mortgage (RCM) — Type Definitions
 *
 * Two product classes, 6 total tiers, mapped to credit score.
 *
 * STANDARD RCM (Tiers 1-3): Monthly payments with tier-specific overpayment allocation
 * PREFERRED RCM (Tiers 4-6): Daily arithmetic payments with concurrent streams
 *
 * Core innovation: 100% of every payment goes to principal.
 * Interest is deferred as a separate liability.
 * No existing mortgage product varies allocation by credit tier — this is novel.
 */

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
  dailyIncrement: number;
  description: string;
}

export type RCMTier = StandardTier | PreferredTier;

/** Standard RCM monthly schedule row */
export interface StandardScheduleRow {
  month: number;
  payment: number;
  overpayment: number;
  toPrincipal: number;
  toInterest: number;
  principalBalance: number;
  accruedInterest: number;
  totalDebt: number;
  equity: number;
}

/** Standard RCM full analysis result */
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

/** Preferred RCM daily schedule row */
export interface PreferredScheduleRow {
  day: number;
  dailyPayment: number;
  cumulativePaid: number;
  principalBalance: number;
  accruedInterest: number;
  totalDebt: number;
  equity: number;
}

/** Preferred RCM full analysis result */
export interface PreferredAnalysis {
  tier: PreferredTier;
  schedule: PreferredScheduleRow[];
  principalPayoffDay: number;
  principalPayoffMonths: number;
  finalDailyPayment: number;
  totalInterestAccrued: number;
  deferredInterestAtPayoff: number;
  equityAtPayoff: number;
  totalPaid: number;
}

/** Full comparison across all 6 tiers */
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
