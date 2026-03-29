// RCM Comparison Example — Compare all 6 RCM tiers for a $320K home at 6.5%
import { compareAllTiers, rcmMonthlyPayment } from "../src/rcm/index.js";

const loanAmount = 320_000;
const annualRate = 0.065;
const termMonths = 360;
const propertyValue = 400_000;

const monthly = rcmMonthlyPayment(loanAmount, annualRate, termMonths);
console.log(`Base monthly payment (100% to principal): $${monthly.toFixed(2)}\n`);

const comparison = compareAllTiers(loanAmount, annualRate, termMonths, propertyValue, 500);

console.log("=== Standard RCM (Tiers 1-3) — Monthly ===");
for (const s of comparison.standard) {
  console.log(`Tier ${s.tier.tier} (${s.tier.name}): payoff month ${s.principalPayoffMonth}, ` +
    `deferred interest $${s.deferredInterestAtPayoff.toFixed(0)}, ` +
    `5yr equity $${s.equityAtYear5.toFixed(0)}`);
}

console.log("\n=== Preferred RCM (Tiers 4-6) — Daily Arithmetic ===");
for (const p of comparison.preferred) {
  console.log(`Tier ${p.tier.tier} (${p.tier.name}): payoff day ${p.principalPayoffDay} ` +
    `(~${p.principalPayoffMonths} months), ${p.tier.streamCount} stream(s), ` +
    `final daily payment $${p.finalDailyPayment.toFixed(0)}`);
}

console.log("\n=== Flat RCM Baseline (no overpayment modes) ===");
console.log(`Monthly: $${comparison.flatRCM.monthlyPayment.toFixed(2)}, ` +
  `payoff month ${comparison.flatRCM.principalPayoffMonth}`);
