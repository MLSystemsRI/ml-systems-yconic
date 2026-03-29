// Closed-Loop Example — Finance → Deconstruct → Design → Build → Equity
import { executeClosedLoop, buildMariaScenario } from "../src/closed-loop/index.js";

// Build the Maria scenario: FICO 640, $200K loan, Providence RI
const { homeowner, deconPlan, designSpec, buildPlan, mve } = buildMariaScenario();

// Execute the full closed loop — every stage uses real engine calculations
const result = executeClosedLoop(homeowner, deconPlan, designSpec, buildPlan, mve);

console.log("=== Closed Loop Pipeline ===\n");

// Finance stage
console.log(`Finance: ${result.stages.finance.approved ? "APPROVED" : "DENIED"}`);
console.log(`  TTP Score: ${result.stages.finance.ttpScore} (${result.stages.finance.ttpBand})`);
console.log(`  Tier: ${result.stages.finance.tier.tier} (${result.stages.finance.tier.name})`);
console.log(`  Payment: $${result.stages.finance.monthlyPayment.toFixed(2)}/mo → 100% to principal\n`);

// Deconstruct stage
console.log(`Deconstruct: ${result.stages.deconstruct.materialsRecovered} materials recovered`);
console.log(`  Recovery rate: ${(result.stages.deconstruct.recoveryRate * 100).toFixed(0)}%`);
console.log(`  Clean rate: ${(result.stages.deconstruct.cleanRate * 100).toFixed(0)}%`);
console.log(`  Total value: $${(result.stages.deconstruct.totalValueCents / 100).toFixed(2)}\n`);

// Marketplace stage
console.log(`Marketplace: ${result.stages.marketplace.listingsCreated} listings created`);
console.log(`  Revenue to equity: $${(result.stages.marketplace.revenueToEquityCents / 100).toFixed(2)}\n`);

// Equity stage
console.log(`Equity Comparison (Year 1):`);
console.log(`  RCM equity:         $${result.stages.equity.totalEquityYear1.toFixed(2)}`);
console.log(`  Traditional equity: $${result.stages.equity.traditionalEquityYear1.toFixed(2)}`);
console.log(`  RCM advantage:      $${result.stages.equity.equityAdvantage.toFixed(2)}\n`);

// Disruption score
console.log(`Disruption: ${result.disruption.compositeMultiplier.toFixed(1)}x (${result.disruption.category})`);
console.log(`Loop complete: ${result.loopComplete}`);
console.log(`Total value created: $${(result.totalValueCreatedCents / 100).toFixed(2)}`);
