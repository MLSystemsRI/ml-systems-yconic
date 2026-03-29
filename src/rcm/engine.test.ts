import { describe, it, expect } from "vitest";
import {
  resolveTier,
  allocateOverpayment,
  generateStandardSchedule,
  generatePreferredSchedule,
  preferredPayoffDay,
  preferredDailyPayment,
  preferredCumulativePaid,
  compareAllTiers,
  STANDARD_TIERS,
  PREFERRED_TIERS,
  ALL_TIERS,
} from "./engine.js";

/* ─── Tier Definitions ─── */

describe("tier definitions", () => {
  it("has 3 standard tiers (1-3)", () => {
    expect(STANDARD_TIERS).toHaveLength(3);
    STANDARD_TIERS.forEach((t, i) => {
      expect(t.tier).toBe(i + 1);
      expect(t.productClass).toBe("standard");
    });
  });

  it("has 3 preferred tiers (4-6)", () => {
    expect(PREFERRED_TIERS).toHaveLength(3);
    PREFERRED_TIERS.forEach((t, i) => {
      expect(t.tier).toBe(i + 4);
      expect(t.productClass).toBe("preferred");
    });
  });

  it("ALL_TIERS contains all 6 tiers in order", () => {
    expect(ALL_TIERS).toHaveLength(6);
    ALL_TIERS.forEach((t, i) => expect(t.tier).toBe(i + 1));
  });

  it("FICO ranges are contiguous (no gaps)", () => {
    for (let i = 1; i < ALL_TIERS.length; i++) {
      const prev = ALL_TIERS[i - 1]!;
      const curr = ALL_TIERS[i]!;
      expect(curr.ficoMin).toBe(prev.ficoMax + 1);
    }
  });

  it("standard tiers have distinct overpayment modes", () => {
    const modes = STANDARD_TIERS.map((t) => t.overpaymentMode);
    expect(new Set(modes).size).toBe(3);
  });

  it("preferred tiers have increasing stream counts", () => {
    expect(PREFERRED_TIERS[0]!.streamCount).toBe(1);
    expect(PREFERRED_TIERS[1]!.streamCount).toBe(2);
    expect(PREFERRED_TIERS[2]!.streamCount).toBe(3);
  });
});

/* ─── resolveTier ─── */

describe("resolveTier", () => {
  it("maps exact FICO boundaries to correct tiers", () => {
    expect(resolveTier(580).tier).toBe(1);
    expect(resolveTier(619).tier).toBe(1);
    expect(resolveTier(620).tier).toBe(2);
    expect(resolveTier(659).tier).toBe(2);
    expect(resolveTier(660).tier).toBe(3);
    expect(resolveTier(699).tier).toBe(3);
    expect(resolveTier(700).tier).toBe(4);
    expect(resolveTier(739).tier).toBe(4);
    expect(resolveTier(740).tier).toBe(5);
    expect(resolveTier(779).tier).toBe(5);
    expect(resolveTier(780).tier).toBe(6);
    expect(resolveTier(850).tier).toBe(6);
  });

  it("clamps below-minimum score to Tier 1", () => {
    expect(resolveTier(300).tier).toBe(1);
    expect(resolveTier(0).tier).toBe(1);
  });

  it("clamps above-maximum score to Tier 6", () => {
    expect(resolveTier(900).tier).toBe(6);
    expect(resolveTier(999).tier).toBe(6);
  });
});

/* ─── allocateOverpayment ─── */

describe("allocateOverpayment", () => {
  it("returns zero for zero excess", () => {
    const result = allocateOverpayment(0, 100_000, 5_000, "split");
    expect(result.toPrincipal).toBe(0);
    expect(result.toInterest).toBe(0);
  });

  it("returns zero for negative excess", () => {
    const result = allocateOverpayment(-500, 100_000, 5_000, "split");
    expect(result.toPrincipal).toBe(0);
    expect(result.toInterest).toBe(0);
  });

  describe("interest_first mode", () => {
    it("pays interest before principal", () => {
      const result = allocateOverpayment(1000, 100_000, 500, "interest_first");
      expect(result.toInterest).toBe(500);
      expect(result.toPrincipal).toBe(500);
    });

    it("caps at available interest", () => {
      const result = allocateOverpayment(300, 100_000, 500, "interest_first");
      expect(result.toInterest).toBe(300);
      expect(result.toPrincipal).toBe(0);
    });

    it("caps at principal balance when interest exhausted", () => {
      const result = allocateOverpayment(5000, 2000, 1000, "interest_first");
      expect(result.toInterest).toBe(1000);
      expect(result.toPrincipal).toBe(2000);
    });
  });

  describe("split mode", () => {
    it("splits 50/50 between interest and principal", () => {
      const result = allocateOverpayment(1000, 100_000, 5000, "split");
      expect(result.toInterest).toBe(500);
      expect(result.toPrincipal).toBe(500);
    });

    it("redirects unused interest portion to principal", () => {
      const result = allocateOverpayment(1000, 100_000, 200, "split");
      expect(result.toInterest).toBe(200);
      // Half was 500, only 200 went to interest, so 300 extra goes to principal
      expect(result.toPrincipal).toBe(800);
    });
  });

  describe("principal_first mode", () => {
    it("sends all excess to principal", () => {
      const result = allocateOverpayment(1000, 100_000, 5000, "principal_first");
      expect(result.toPrincipal).toBe(1000);
      expect(result.toInterest).toBe(0);
    });

    it("caps at principal balance", () => {
      const result = allocateOverpayment(5000, 2000, 5000, "principal_first");
      expect(result.toPrincipal).toBe(2000);
      expect(result.toInterest).toBe(0);
    });
  });
});

/* ─── Preferred RCM Math ─── */

describe("preferredPayoffDay", () => {
  it("calculates payoff for single stream $320K loan", () => {
    const day = preferredPayoffDay(320_000, 1);
    // √(2 * 320000) ≈ 800
    expect(day).toBeGreaterThan(790);
    expect(day).toBeLessThan(810);
  });

  it("dual stream pays off faster", () => {
    const single = preferredPayoffDay(320_000, 1);
    const dual = preferredPayoffDay(320_000, 2);
    expect(dual).toBeLessThan(single);
  });

  it("triple stream is fastest", () => {
    const dual = preferredPayoffDay(320_000, 2);
    const triple = preferredPayoffDay(320_000, 3);
    expect(triple).toBeLessThan(dual);
  });

  it("verifies cumulative paid >= loan amount at payoff day", () => {
    const payoff = preferredPayoffDay(320_000, 1);
    const paid = preferredCumulativePaid(payoff, 1);
    expect(paid).toBeGreaterThanOrEqual(320_000);
  });
});

describe("preferredDailyPayment", () => {
  it("day 1 single stream = $1", () => {
    expect(preferredDailyPayment(1, 1)).toBe(1);
  });

  it("day 100 single stream = $100", () => {
    expect(preferredDailyPayment(100, 1)).toBe(100);
  });

  it("day 100 dual stream = $200", () => {
    expect(preferredDailyPayment(100, 2)).toBe(200);
  });

  it("day 100 triple stream = $300", () => {
    expect(preferredDailyPayment(100, 3)).toBe(300);
  });
});

describe("preferredCumulativePaid", () => {
  it("follows triangular number formula", () => {
    // Sum 1..100 = 100 * 101 / 2 = 5050
    expect(preferredCumulativePaid(100, 1)).toBe(5050);
  });

  it("dual stream doubles cumulative", () => {
    expect(preferredCumulativePaid(100, 2)).toBe(10100);
  });

  it("day 0 = 0", () => {
    expect(preferredCumulativePaid(0, 1)).toBe(0);
  });
});

/* ─── Schedule Generation ─── */

describe("generateStandardSchedule", () => {
  it("generates correct number of rows (term + month 0)", () => {
    const analysis = generateStandardSchedule(320_000, 0.065, 360, 400_000, STANDARD_TIERS[0]!);
    expect(analysis.schedule).toHaveLength(361);
  });

  it("month 0 starts with full principal", () => {
    const analysis = generateStandardSchedule(320_000, 0.065, 360, 400_000, STANDARD_TIERS[0]!);
    expect(analysis.schedule[0]!.principalBalance).toBe(320_000);
    expect(analysis.schedule[0]!.equity).toBe(80_000);
  });

  it("principal decreases over time", () => {
    const analysis = generateStandardSchedule(320_000, 0.065, 360, 400_000, STANDARD_TIERS[0]!);
    const month1 = analysis.schedule[1]!.principalBalance;
    const month12 = analysis.schedule[12]!.principalBalance;
    expect(month12).toBeLessThan(month1);
  });

  it("equity increases over time", () => {
    const analysis = generateStandardSchedule(320_000, 0.065, 360, 400_000, STANDARD_TIERS[0]!);
    const early = analysis.schedule[12]!.equity;
    const late = analysis.schedule[120]!.equity;
    expect(late).toBeGreaterThan(early);
  });

  it("with overpayments, pays off faster", () => {
    const noExtra = generateStandardSchedule(320_000, 0.065, 360, 400_000, STANDARD_TIERS[2]!);
    const withExtra = generateStandardSchedule(
      320_000,
      0.065,
      360,
      400_000,
      STANDARD_TIERS[2]!,
      () => 1000,
    );
    expect(withExtra.principalPayoffMonth).toBeLessThan(noExtra.principalPayoffMonth);
  });
});

describe("generatePreferredSchedule", () => {
  it("starts with full principal at day 0", () => {
    const analysis = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[0]!);
    expect(analysis.schedule[0]!.principalBalance).toBe(320_000);
  });

  it("ends with zero principal", () => {
    const analysis = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[0]!);
    const last = analysis.schedule[analysis.schedule.length - 1]!;
    expect(last.principalBalance).toBeLessThanOrEqual(0.01);
  });

  it("more streams = fewer days to payoff", () => {
    const t4 = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[0]!);
    const t5 = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[1]!);
    const t6 = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[2]!);
    expect(t5.principalPayoffDay).toBeLessThan(t4.principalPayoffDay);
    expect(t6.principalPayoffDay).toBeLessThan(t5.principalPayoffDay);
  });

  it("final daily payment matches payoff day calculation", () => {
    const analysis = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[0]!);
    expect(analysis.finalDailyPayment).toBe(analysis.principalPayoffDay);
  });

  it("total paid approximates loan amount", () => {
    const analysis = generatePreferredSchedule(320_000, 0.065, 400_000, PREFERRED_TIERS[0]!);
    // Total paid should be very close to (but not less than) 320K
    expect(analysis.totalPaid).toBeGreaterThanOrEqual(319_999);
    expect(analysis.totalPaid).toBeLessThan(321_000);
  });
});

/* ─── Full Comparison ─── */

describe("compareAllTiers", () => {
  it("returns all 3 standard and 3 preferred analyses", () => {
    const result = compareAllTiers(320_000, 0.065, 360, 400_000);
    expect(result.standard).toHaveLength(3);
    expect(result.preferred).toHaveLength(3);
  });

  it("includes flat RCM baseline", () => {
    const result = compareAllTiers(320_000, 0.065, 360, 400_000);
    expect(result.flatRCM.monthlyPayment).toBeGreaterThan(0);
    expect(result.flatRCM.totalInterestAccrued).toBeGreaterThan(0);
  });

  it("preserves input parameters", () => {
    const result = compareAllTiers(320_000, 0.065, 360, 400_000, 750);
    expect(result.loanAmount).toBe(320_000);
    expect(result.annualRate).toBe(0.065);
    expect(result.termMonths).toBe(360);
    expect(result.propertyValue).toBe(400_000);
  });
});
