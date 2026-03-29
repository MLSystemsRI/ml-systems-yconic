import { describe, it, expect } from "vitest";
import { rcmMonthlyPayment, rcmAccruedInterest, rcmEquity } from "./math.js";

/* ─── rcmMonthlyPayment ─── */

describe("rcmMonthlyPayment", () => {
  it("calculates correct payment for a standard 30-year $320K loan at 6.5%", () => {
    const payment = rcmMonthlyPayment(320_000, 0.065, 360);
    // Standard amortization: ~$2,023
    expect(payment).toBeCloseTo(2022.62, 0);
  });

  it("returns 0 for zero principal", () => {
    expect(rcmMonthlyPayment(0, 0.065, 360)).toBe(0);
  });

  it("handles zero interest rate (simple division)", () => {
    const payment = rcmMonthlyPayment(120_000, 0, 360);
    expect(payment).toBeCloseTo(333.33, 1);
  });

  it("returns negative principal as 0", () => {
    expect(rcmMonthlyPayment(-100_000, 0.065, 360)).toBe(0);
  });

  it("higher rate = higher payment", () => {
    const low = rcmMonthlyPayment(320_000, 0.04, 360);
    const high = rcmMonthlyPayment(320_000, 0.08, 360);
    expect(high).toBeGreaterThan(low);
  });

  it("shorter term = higher payment", () => {
    const long = rcmMonthlyPayment(320_000, 0.065, 360);
    const short = rcmMonthlyPayment(320_000, 0.065, 180);
    expect(short).toBeGreaterThan(long);
  });
});

/* ─── rcmAccruedInterest ─── */

describe("rcmAccruedInterest", () => {
  it("calculates total deferred interest on a 30-year loan", () => {
    const payment = rcmMonthlyPayment(320_000, 0.065, 360);
    const interest = rcmAccruedInterest(320_000, payment, 0.065, 360);

    // With 100% to principal, interest accrues on declining balance
    // Total should be substantial but less than traditional mortgage total interest
    expect(interest).toBeGreaterThan(100_000);
    expect(interest).toBeLessThan(500_000);
  });

  it("returns 0 for zero-rate loan", () => {
    const interest = rcmAccruedInterest(320_000, 2000, 0, 360);
    expect(interest).toBe(0);
  });

  it("higher balance = more accrued interest", () => {
    const payment = 2000;
    const low = rcmAccruedInterest(200_000, payment, 0.065, 360);
    const high = rcmAccruedInterest(400_000, payment, 0.065, 360);
    expect(high).toBeGreaterThan(low);
  });

  it("faster payoff = less total interest", () => {
    const lowPmt = rcmAccruedInterest(320_000, 1500, 0.065, 360);
    const highPmt = rcmAccruedInterest(320_000, 3000, 0.065, 360);
    expect(highPmt).toBeLessThan(lowPmt);
  });
});

/* ─── rcmEquity ─── */

describe("rcmEquity", () => {
  it("calculates basic equity", () => {
    expect(rcmEquity(400_000, 320_000)).toBe(80_000);
  });

  it("includes material recovery value", () => {
    expect(rcmEquity(400_000, 320_000, 15_000)).toBe(95_000);
  });

  it("handles zero principal (fully paid)", () => {
    expect(rcmEquity(400_000, 0)).toBe(400_000);
  });

  it("can return negative equity (underwater)", () => {
    expect(rcmEquity(300_000, 350_000)).toBe(-50_000);
  });

  it("defaults materialRecoveryValue to 0", () => {
    expect(rcmEquity(400_000, 300_000)).toBe(rcmEquity(400_000, 300_000, 0));
  });
});
