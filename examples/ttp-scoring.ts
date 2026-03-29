// TTP Scoring Example — Calculate a transparency score, resolve access band, generate headers
import {
  calculateTransparencyScore,
  getAccessBand,
  transparencyHeaders,
  getVerificationFeeCents,
  ACCESS_BAND_LABELS,
} from "../src/ttp/index.js";

// Score a mid-tier contractor with verified identity and contributions
const factors = {
  tier: "starter" as const,
  identityVerified: true,
  materialsContributed: 5,
  cyclesCompleted: 1,
  reviewsPassed: 2,
  accountAgeDays: 180,
  isRegulator: false,
  dataContributions: 8,
};

const score = calculateTransparencyScore(factors);
const band = getAccessBand(score);
const feeCents = getVerificationFeeCents(band, false);
const headers = transparencyHeaders(score, { verificationFeeCents: feeCents || undefined });

console.log(`Transparency Score: ${score}/100`);
console.log(`Access Band: ${band} — ${ACCESS_BAND_LABELS[band]}`);
console.log("Response Headers:", headers);

// Score an AI crawler query
const aiFeeCents = getVerificationFeeCents(band, true);
console.log(`AI crawler fee for ${band}: ${aiFeeCents}¢ per query`);
