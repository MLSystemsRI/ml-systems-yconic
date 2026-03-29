/**
 * RCM Equity Simulator — Month-by-Month Comparison
 *
 * Simulates equity growth over the life of a loan for both
 * RCM (100% to principal) and traditional (interest-first) mortgages.
 *
 * This is the proof: visualize exactly how much faster RCM builds
 * equity and when the traditional mortgage finally catches up (it doesn't).
 *
 * The simulator also models material recovery revenue flowing into
 * equity — the closed-loop advantage that no traditional mortgage has.
 */

import { rcmMonthlyPayment, rcmEquity } from "./math.js";

/* ─── Simulation Types ─── */

export interface SimulationInput {
  loanAmount: number;
  annualRate: number;
  termMonths: number;
  propertyValue: number;
  /** Property appreciation rate per year (e.g., 0.03 = 3%) */
  appreciationRate: number;
  /** Material recovery revenue credited per month (cents) */
  monthlyMaterialRevenueCents: number;
  /** Percentage of material revenue that goes to equity */
  materialRevenueSharePercent: number;
}

export interface MonthlySnapshot {
  month: number;
  rcm: {
    principalPaid: number;
    balance: number;
    equity: number;
    materialEquity: number;
    totalEquity: number;
  };
  traditional: {
    principalPaid: number;
    interestPaid: number;
    balance: number;
    equity: number;
  };
  delta: {
    equityAdvantage: number;
    cumulativeInterestSaved: number;
  };
  propertyValue: number;
}

export interface SimulationResult {
  input: SimulationInput;
  rcmPayment: number;
  traditionalPayment: number;
  snapshots: MonthlySnapshot[];
  milestones: SimulationMilestones;
  summary: SimulationSummary;
}

export interface SimulationMilestones {
  /** Month when RCM reaches 20% equity (no more PMI equivalent) */
  rcm20PercentEquityMonth: number | null;
  /** Month when traditional reaches 20% equity */
  traditional20PercentEquityMonth: number | null;
  /** Month when traditional principal > interest in monthly payment */
  traditionalCrossoverMonth: number | null;
  /** Month when RCM loan is fully paid off */
  rcmPayoffMonth: number | null;
  /** Month when traditional loan is fully paid off */
  traditionalPayoffMonth: number;
}

export interface SimulationSummary {
  totalRCMPaid: number;
  totalTraditionalPaid: number;
  totalInterestPaid: number;
  totalInterestSaved: number;
  totalMaterialEquity: number;
  finalRCMEquity: number;
  finalTraditionalEquity: number;
  equityMultiplier: number;
}

/* ─── Simulator ─── */

/**
 * Run a full equity simulation over the loan term.
 *
 * Produces month-by-month snapshots showing exactly how
 * RCM builds equity faster than traditional mortgage.
 *
 * Material recovery revenue is modeled as a steady monthly
 * contribution — in practice it's lumpy (per-project), but
 * the steady model shows the structural advantage clearly.
 */
export function simulateEquity(input: SimulationInput): SimulationResult {
  const rcmPayment = rcmMonthlyPayment(input.loanAmount, input.annualRate, input.termMonths);

  // Traditional mortgage payment (standard amortization)
  const monthlyRate = input.annualRate / 12;
  const traditionalPayment =
    (input.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, input.termMonths)) /
    (Math.pow(1 + monthlyRate, input.termMonths) - 1);

  const snapshots: MonthlySnapshot[] = [];
  let rcmBalance = input.loanAmount;
  let tradBalance = input.loanAmount;
  let cumulativeInterestSaved = 0;
  let cumulativeMaterialEquity = 0;
  let totalInterestPaid = 0;
  let totalRCMPaid = 0;
  let totalTraditionalPaid = 0;

  // Milestones
  let rcm20Month: number | null = null;
  let trad20Month: number | null = null;
  let tradCrossoverMonth: number | null = null;
  let rcmPayoffMonth: number | null = null;

  const monthlyAppreciation = Math.pow(1 + input.appreciationRate, 1 / 12);

  let currentPropertyValue = input.propertyValue;

  for (let month = 1; month <= input.termMonths; month++) {
    // Property appreciation
    currentPropertyValue *= monthlyAppreciation;

    // RCM: 100% to principal
    const rcmPrincipal = Math.min(rcmPayment, rcmBalance);
    rcmBalance = Math.max(0, rcmBalance - rcmPrincipal);
    totalRCMPaid += rcmPrincipal;

    // Material recovery equity
    const materialContrib = (input.monthlyMaterialRevenueCents / 100) * input.materialRevenueSharePercent;
    cumulativeMaterialEquity += materialContrib;

    // Traditional: interest first, then principal
    const tradInterest = tradBalance * monthlyRate;
    const tradPrincipal = Math.min(traditionalPayment - tradInterest, tradBalance);
    tradBalance = Math.max(0, tradBalance - tradPrincipal);
    totalInterestPaid += tradInterest;
    totalTraditionalPaid += tradInterest + tradPrincipal;

    // Interest saved = what traditional pays in interest, RCM doesn't
    cumulativeInterestSaved += tradInterest;

    // Equity calculations
    const rcmEquityValue = rcmEquity(currentPropertyValue, rcmBalance);
    const rcmTotalEquity = rcmEquityValue + cumulativeMaterialEquity;
    const tradEquity = currentPropertyValue - tradBalance;

    snapshots.push({
      month,
      rcm: {
        principalPaid: rcmPrincipal,
        balance: Math.round(rcmBalance * 100) / 100,
        equity: Math.round(rcmEquityValue * 100) / 100,
        materialEquity: Math.round(cumulativeMaterialEquity * 100) / 100,
        totalEquity: Math.round(rcmTotalEquity * 100) / 100,
      },
      traditional: {
        principalPaid: Math.round(tradPrincipal * 100) / 100,
        interestPaid: Math.round(tradInterest * 100) / 100,
        balance: Math.round(tradBalance * 100) / 100,
        equity: Math.round(tradEquity * 100) / 100,
      },
      delta: {
        equityAdvantage: Math.round((rcmTotalEquity - tradEquity) * 100) / 100,
        cumulativeInterestSaved: Math.round(cumulativeInterestSaved * 100) / 100,
      },
      propertyValue: Math.round(currentPropertyValue * 100) / 100,
    });

    // Track milestones
    if (rcm20Month === null && rcmTotalEquity >= currentPropertyValue * 0.2) {
      rcm20Month = month;
    }
    if (trad20Month === null && tradEquity >= currentPropertyValue * 0.2) {
      trad20Month = month;
    }
    if (tradCrossoverMonth === null && tradPrincipal > tradInterest) {
      tradCrossoverMonth = month;
    }
    if (rcmPayoffMonth === null && rcmBalance <= 0) {
      rcmPayoffMonth = month;
    }
  }

  return {
    input,
    rcmPayment: Math.round(rcmPayment * 100) / 100,
    traditionalPayment: Math.round(traditionalPayment * 100) / 100,
    snapshots,
    milestones: {
      rcm20PercentEquityMonth: rcm20Month,
      traditional20PercentEquityMonth: trad20Month,
      traditionalCrossoverMonth: tradCrossoverMonth,
      rcmPayoffMonth,
      traditionalPayoffMonth: input.termMonths,
    },
    summary: {
      totalRCMPaid: Math.round(totalRCMPaid * 100) / 100,
      totalTraditionalPaid: Math.round(totalTraditionalPaid * 100) / 100,
      totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
      totalInterestSaved: Math.round(cumulativeInterestSaved * 100) / 100,
      totalMaterialEquity: Math.round(cumulativeMaterialEquity * 100) / 100,
      finalRCMEquity: snapshots[snapshots.length - 1]?.rcm.totalEquity ?? 0,
      finalTraditionalEquity: snapshots[snapshots.length - 1]?.traditional.equity ?? 0,
      equityMultiplier: snapshots.length > 0
        ? Math.round(
            ((snapshots[snapshots.length - 1]?.rcm.totalEquity ?? 0) /
              Math.max(snapshots[snapshots.length - 1]?.traditional.equity ?? 1, 1)) *
              100,
          ) / 100
        : 0,
    },
  };
}

/**
 * Generate a Maria-specific simulation with realistic defaults.
 *
 * FICO 640, $200K loan, 6.5%, 30 years, 3% appreciation,
 * $500/month material recovery revenue (51% to equity).
 */
export function simulateMaria(): SimulationResult {
  return simulateEquity({
    loanAmount: 200_000,
    annualRate: 0.065,
    termMonths: 360,
    propertyValue: 280_000,
    appreciationRate: 0.03,
    monthlyMaterialRevenueCents: 50_000, // $500/month from material sales
    materialRevenueSharePercent: 0.51,
  });
}

/**
 * Extract key comparison points from a simulation.
 * Returns year 1, 5, 10, 20, and 30 snapshots.
 */
export function extractKeyPoints(
  result: SimulationResult,
): { year: number; snapshot: MonthlySnapshot }[] {
  const years = [1, 5, 10, 20, 30];
  return years
    .map((year) => {
      const month = year * 12;
      const snapshot = result.snapshots[month - 1];
      return snapshot ? { year, snapshot } : null;
    })
    .filter((p): p is { year: number; snapshot: MonthlySnapshot } => p !== null);
}
