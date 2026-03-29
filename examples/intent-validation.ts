// Intent Validation Example — Score a decision against Lucent Lens and check MVE gate
import {
  scoreLucentLens,
  passesLucentLens,
  passesMVE,
  CUSTODIAN_CONSTRAINTS,
} from "../src/intent/index.js";

// Scenario: Originating an RCM loan with decon-recovered materials
const lensScore = scoreLucentLens(
  35, // homeowner: gets 100% principal payments + equity acceleration
  20, // collective: decon materials enter BOH marketplace, contractors get work
  15, // engine: ontology data + market intelligence captured
);

console.log("Lucent Lens Score:", lensScore);

const lensResult = passesLucentLens(lensScore);
console.log(`Lucent Lens: ${lensResult.passes ? "APPROVED" : "REJECTED"} — ${lensResult.reason}`);

// MVE gate — does this expense produce 4x returns?
const mve = passesMVE({
  materialValue: true,    // recovered lumber, fixtures, hardware
  ontologyData: true,     // assembly separation data for ML training
  robotTraining: true,    // humanoid operation sequences
  marketIntelligence: true, // secondary material pricing for BOH
});

console.log(`MVE Gate: ${mve.passes ? "PASSED" : "FAILED"} — ${mve.reason}`);
console.log(`Required multiplier: ${CUSTODIAN_CONSTRAINTS.minimumViableExpense}x`);

// Rejected scenario: engine-only action
const badScore = scoreLucentLens(0, 5, 25);
const badResult = passesLucentLens(badScore);
console.log(`\nEngine-only action: ${badResult.reason}`);
