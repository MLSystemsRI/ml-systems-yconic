# API Reference

> `@ml-systems/yconic` — Three engines, pure TypeScript, strict mode.

---

## TTP — Transparency Trust Protocol

```ts
import { calculateTransparencyScore, getAccessBand, isAiCrawler } from "@ml-systems/yconic/ttp";
```

### Functions

#### `calculateTransparencyScore(factors: TransparencyFactors): number`

Calculate a transparency score (0-100) from raw factors. Eight dimensions scored in parallel, clamped to 100.

| Parameter | Type | Description |
|-----------|------|-------------|
| `factors.tier` | `ApiTier` | API subscription level (`"free"` \| `"starter"` \| `"pro"` \| `"enterprise"`) |
| `factors.identityVerified` | `boolean` | Identity verified through Clerk/KYC |
| `factors.materialsContributed` | `number` | Number of verified materials contributed |
| `factors.cyclesCompleted` | `number` | Completed project cycles |
| `factors.reviewsPassed` | `number` | Annual review gates passed |
| `factors.accountAgeDays` | `number` | Days since account creation |
| `factors.isRegulator` | `boolean` | State agency / regulator status |
| `factors.dataContributions` | `number` | Data contributions (decon logs, BOH listings, design specs) |

#### `getAccessBand(score: number): AccessBand`

Map a transparency score to its access band.

| Score | Band | Access |
|-------|------|--------|
| 0-10 | `"public_record"` | Name, category, status |
| 11-30 | `"ml_verified"` | Provenance chain, grading |
| 31-60 | `"full_api"` | Material feeds, valuations |
| 61-80 | `"double_verified"` | State cross-verified, bulk export |
| 81-100 | `"ontology_licensed"` | Construction DAG, robot params |

#### `quickScoreFromTier(tier: ApiTier, isRegulator: boolean): number`

Derive a quick transparency score from tier alone. Used when full factor calculation is unavailable (DB fallback).

#### `regulatorCanAccess(endpoint: string, tier: ApiTier): boolean`

Check if a regulator can access a specific endpoint. Regulators on free/starter tiers are restricted to compliance endpoints. Pro/enterprise tiers get normal access.

#### `getVerificationFeeCents(band: AccessBand, isAiQuery: boolean): number`

Calculate per-query verification fee for AI crawlers in cents. Returns 0 for non-AI queries.

| Band | Fee |
|------|-----|
| `"double_verified"` | 25c |
| `"ml_verified"` | 5c |
| `"public_record"` | 1c |

#### `transparencyHeaders(score: number, extra?: { verificationFeeCents?: number; regulatorScoped?: boolean }): Record<string, string>`

Generate `X-TT-Score`, `X-TT-Band`, and `X-TT-Protocol` response headers.

#### `isAiCrawler(userAgent: string | null): boolean`

Detect if a request is from a known AI crawler. Case-insensitive match against 20+ known bot user-agents.

#### `identifyCrawler(userAgent: string | null): AiCrawlerName | null`

Extract the specific crawler name from a user-agent string. Returns `null` if no known crawler is detected.

#### `getKnownCrawlers(): readonly string[]`

Return the full list of known AI crawler identifiers.

#### `minTierForVerification(level: VerificationLevel): string`

Return the minimum API tier required to access a verification level. Level 0 = free, Level 1 = starter, Level 2 = pro.

#### `processTTPRequest(req: TTPRequest): TTPResult`

Process a request through the full TTP pipeline: score resolution, band assignment, AI crawler detection, regulator scope enforcement, and response header generation.

```ts
interface TTPRequest {
  path: string;
  userAgent: string | null;
  apiTier: ApiTier;
  isRegulator: boolean;
  ttScore?: number;        // Pre-computed score (optional)
}

interface TTPResult {
  allowed: boolean;
  score: number;
  band: AccessBand;
  headers: Record<string, string>;
  feeCents: number;
  reason?: string;          // Present when access is denied
}
```

### Types

| Type | Values |
|------|--------|
| `ApiTier` | `"free"` \| `"starter"` \| `"pro"` \| `"enterprise"` |
| `AccessBand` | `"public_record"` \| `"ml_verified"` \| `"full_api"` \| `"double_verified"` \| `"ontology_licensed"` |
| `VerificationLevel` | `0` \| `1` \| `2` |
| `TTChangeReason` | `"recalculation"` \| `"tier_upgrade"` \| `"material_contributed"` \| `"cycle_completed"` \| `"review_passed"` \| `"data_contributed"` \| `"manual_adjustment"` \| `"account_aged"` |

### Constants

| Constant | Description |
|----------|-------------|
| `ACCESS_BAND_LABELS` | Human-readable labels for each access band |
| `ACCESS_BAND_THRESHOLDS` | Band definitions with min/max scores and descriptions |
| `REGULATOR_ALLOWED_ENDPOINTS` | Scoped endpoints regulators can access on free/starter tiers |
| `VERIFICATION_FEE` | Per-query fee schedule and daily quotas by tier |
| `VERIFICATION_LABELS` | Labels for verification levels (0, 1, 2) |
| `VERIFICATION_DESCRIPTIONS` | Full descriptions for each verification level |

---

## RCM — Reverse Construction Mortgage

```ts
import { resolveTier, rcmMonthlyPayment, preferredPayoffDay } from "@ml-systems/yconic/rcm";
```

### Functions

#### `rcmMonthlyPayment(principal: number, annualRate: number, termMonths: number): number`

Calculate the standard monthly payment for an RCM loan. Uses the standard amortization formula. The entire payment goes to principal; interest is tracked separately as a deferred liability.

#### `rcmAccruedInterest(principal: number, monthlyPmt: number, annualRate: number, termMonths: number): number`

Calculate total accrued (deferred) interest over the life of an RCM loan. Since 100% of each payment goes to principal, interest accrues on the declining balance but is never paid from the monthly payment.

#### `rcmEquity(propertyValue: number, principalBalance: number, materialRecoveryValue?: number): number`

Calculate equity: `Property Value - Principal Balance + Material Recovery Value`. The material recovery component is unique to ML Systems' closed-loop model.

#### `resolveTier(creditScore: number): RCMTier`

Resolve a FICO credit score to an RCM tier. Scores below 580 map to Tier 1 (Entry). Scores above 850 map to Tier 6 (Sovereign).

| Tier | Name | FICO | Product | Mechanism |
|------|------|------|---------|-----------|
| 1 | Entry | 580-619 | Standard | Interest-first overpayment |
| 2 | Standard | 620-659 | Standard | 50/50 split overpayment |
| 3 | Proven | 660-699 | Standard | Principal-first overpayment |
| 4 | Tempered | 700-739 | Preferred | 1 stream, Day N = $N |
| 5 | Forged | 740-779 | Preferred | 2 streams, Day N = $2N |
| 6 | Sovereign | 780+ | Preferred | 3 streams, Day N = $3N |

#### `allocateOverpayment(excess: number, principalBal: number, accruedInt: number, mode: OverpaymentMode): { toPrincipal: number; toInterest: number }`

Allocate an overpayment above the base monthly payment per the tier's mode.

#### `generateStandardSchedule(loanAmount: number, annualRate: number, termMonths: number, propertyValue: number, tier: StandardTier, overpaymentFn?: (month: number, principalBal: number, accruedInt: number) => number): StandardAnalysis`

Generate a month-by-month amortization schedule for a Standard RCM tier (Tiers 1-3). Accepts an optional overpayment function for custom payment strategies.

#### `generatePreferredSchedule(loanAmount: number, annualRate: number, propertyValue: number, tier: PreferredTier): PreferredAnalysis`

Generate a day-by-day schedule for a Preferred RCM tier (Tiers 4-6). Simulates daily arithmetic payments with monthly interest accrual. Schedule is sampled at key intervals.

#### `preferredPayoffDay(loanAmount: number, streamCount: StreamCount, dailyIncrement?: number): number`

Calculate the day when principal is fully paid. Formula: `D = (-1 + sqrt(1 + 8L/k)) / 2` where `k = streamCount * dailyIncrement`.

#### `preferredDailyPayment(day: number, streamCount: StreamCount, dailyIncrement?: number): number`

Daily payment amount at a given day: `streamCount * dailyIncrement * day`.

#### `preferredCumulativePaid(day: number, streamCount: StreamCount, dailyIncrement?: number): number`

Cumulative amount paid through day D: `k * D * (D + 1) / 2`.

#### `compareAllTiers(loanAmount: number, annualRate: number, termMonths: number, propertyValue: number, overpaymentAmount?: number): FullComparison`

Run all 6 tiers against the same loan parameters. Default overpayment for Standard tiers: $500/mo.

### Types

| Type | Description |
|------|-------------|
| `ProductClass` | `"standard"` \| `"preferred"` |
| `OverpaymentMode` | `"interest_first"` \| `"split"` \| `"principal_first"` |
| `StreamCount` | `1` \| `2` \| `3` |
| `CreditTier` | `1` \| `2` \| `3` \| `4` \| `5` \| `6` |
| `RCMTier` | `StandardTier \| PreferredTier` (discriminated union on `productClass`) |
| `StandardAnalysis` | Full analysis result with schedule, payoff month, interest totals, equity snapshots |
| `PreferredAnalysis` | Full analysis result with schedule, payoff day, final payment, cumulative totals |
| `FullComparison` | All 6 tiers compared against the same loan parameters |

### Constants

| Constant | Description |
|----------|-------------|
| `STANDARD_TIERS` | Tier definitions for Tiers 1-3 (monthly payments) |
| `PREFERRED_TIERS` | Tier definitions for Tiers 4-6 (daily arithmetic) |
| `ALL_TIERS` | Combined array of all 6 tiers |

---

## Intent — Culture as Code

```ts
import { scoreLucentLens, passesLucentLens, passesMVE } from "@ml-systems/yconic/intent";
```

### Functions

#### `scoreLucentLens(homeowner: number, collective: number, engine: number): LucentLensScore`

Score an action through the Lucent Lens value hierarchy. Inputs are clamped to their maximums.

| Parameter | Range | Priority |
|-----------|-------|----------|
| `homeowner` | 0-40 | Highest — always evaluated first |
| `collective` | 0-30 | Second — community, contractors, partners |
| `engine` | 0-30 | Third — data, revenue, efficiency |

Returns `{ homeowner, collective, engine, total }`.

#### `passesLucentLens(score: LucentLensScore, minimumTotal?: number): { passes: boolean; reason: string }`

Validate an action against the Lucent Lens hierarchy. Default minimum total: 30.

Rules enforced:
- Homeowner score must be >= engine score
- Total must meet minimum threshold
- Engine-only actions (homeowner = 0, engine > 0) are rejected

#### `passesMVE(assessment: MVEAssessment): { passes: boolean; returnCount: number; reason: string }`

Validate an expense against the Minimum Viable Expense gate. Every dollar must produce at least 3 of 4 returns.

```ts
interface MVEAssessment {
  materialValue: boolean;       // Recovered material value
  ontologyData: boolean;        // ML training signal
  robotTraining: boolean;       // Humanoid operations data
  marketIntelligence: boolean;  // Pricing and demand data
}
```

#### `createAgentIntent(agentId: string, agentName: string, parentAgentId?: string | null): AgentIntent`

Create a new agent intent with default constraints. All agents inherit: transparency trust, equity order, MVE, and fiduciary duty. Only the CEO can override MVE.

### Types

| Type | Description |
|------|-------------|
| `LucentLensScore` | `{ homeowner: number; collective: number; engine: number; total: number }` |
| `MVEAssessment` | Four boolean fields for the 4x return check |
| `AgentIntent` | Agent configuration with ID, parent, minimum score, enforced constraints |
| `CustodianConstraint` | `"transparencyTrust"` \| `"equityOrder"` \| `"minimumViableExpense"` \| `"fiduciaryDuty"` |
| `PricingModel` | `"outcome_based"` \| `"per_query"` \| `"earned_access"` |

### Constants

| Constant | Description |
|----------|-------------|
| `CUSTODIAN_CONSTRAINTS` | Non-negotiable rules: optimize user compute, public before private, 4x MVE, fiduciary duty |
| `PRICING_RULES` | Anti-SaaS pricing: own data = free, AI crawlers = per-query, ecosystem = earned, revenue = outcome-based |
