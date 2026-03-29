// Full Pipeline Example — TTP scoring + RCM tier resolution + Intent validation
import { calculateTransparencyScore, getAccessBand, transparencyHeaders } from "../src/ttp/index.js";
import { resolveTier, preferredPayoffDay } from "../src/rcm/index.js";
import { scoreLucentLens, passesLucentLens, passesMVE, createAgentIntent } from "../src/intent/index.js";

// Step 1: Score the entity through TTP
const ttpScore = calculateTransparencyScore({
  tier: "starter",
  identityVerified: true,
  materialsContributed: 5,
  cyclesCompleted: 1,
  reviewsPassed: 1,
  accountAgeDays: 200,
  isRegulator: false,
  dataContributions: 5,
});
const band = getAccessBand(ttpScore);
console.log(`TTP Score: ${ttpScore} → Band: ${band}`);

// Step 2: Resolve RCM tier from credit score
const creditScore = 720;
const tier = resolveTier(creditScore);
console.log(`Credit ${creditScore} → Tier ${tier.tier} (${tier.name})`);
if (tier.productClass === "preferred") {
  const days = preferredPayoffDay(320_000, tier.streamCount);
  console.log(`Payoff: ${days} days (~${(days / 30.44).toFixed(1)} months)`);
}

// Step 3: Validate through Intent Schema
const agent = createAgentIntent("fa-pipeline", "Financial Architect Pipeline");
const lens = scoreLucentLens(35, 20, 10);
const lensOk = passesLucentLens(lens, agent.minimumLensScore);
const mveOk = passesMVE({
  materialValue: true, ontologyData: true,
  robotTraining: true, marketIntelligence: false,
});

console.log(`\nLucent Lens: ${lensOk.passes ? "PASS" : "FAIL"} (${lens.total}/100)`);
console.log(`MVE Gate: ${mveOk.passes ? "PASS" : "FAIL"} (${mveOk.returnCount}/4 returns)`);

// Step 4: Attach TTP headers to API response
const headers = transparencyHeaders(ttpScore);
console.log("\nAPI Response Headers:", headers);
