/**
 * RCM Core Math — Pure financial calculations
 *
 * These functions implement the Reverse Construction Mortgage arithmetic.
 * The key innovation: 100% of every payment goes to principal.
 * Interest accrues monthly but is deferred as a separate liability.
 */

/**
 * Calculate the standard monthly payment for an RCM loan.
 *
 * Uses the standard amortization formula but with the RCM twist:
 * the entire payment amount goes to principal reduction.
 * Interest is tracked separately as a deferred liability.
 *
 * @param principal  - Loan amount at origination
 * @param annualRate - Annual interest rate (decimal, e.g., 0.065 for 6.5%)
 * @param termMonths - Loan term in months (e.g., 360 for 30-year)
 * @returns Monthly payment amount
 */
export function rcmMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / termMonths;

  const r = annualRate / 12;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Calculate total accrued (deferred) interest over the life of an RCM loan.
 *
 * Since 100% of M goes to principal each month, interest accrues on
 * the declining balance but is never paid from M — it's deferred.
 *
 * @param principal  - Loan amount at origination
 * @param monthlyPmt - Monthly payment (100% to principal)
 * @param annualRate - Annual interest rate (decimal)
 * @param termMonths - Loan term in months
 * @returns Total interest accrued over the loan term
 */
export function rcmAccruedInterest(
  principal: number,
  monthlyPmt: number,
  annualRate: number,
  termMonths: number,
): number {
  const r = annualRate / 12;
  let balance = principal;
  let totalInterest = 0;

  for (let t = 0; t < termMonths && balance > 0; t++) {
    totalInterest += balance * r;
    balance = Math.max(0, balance - monthlyPmt);
  }

  return totalInterest;
}

/**
 * Calculate equity for a property with an RCM loan.
 *
 * Equity = Property Value - Principal Balance + Material Recovery Value
 *
 * In the ML Systems model, material recovery from deconstruction
 * directly contributes to equity — a unique advantage of the closed loop.
 *
 * @param propertyValue        - Current property value
 * @param principalBalance     - Remaining principal on the loan
 * @param materialRecoveryValue - Value of recovered materials (default 0)
 * @returns Current equity position
 */
export function rcmEquity(
  propertyValue: number,
  principalBalance: number,
  materialRecoveryValue: number = 0,
): number {
  return propertyValue - principalBalance + materialRecoveryValue;
}
