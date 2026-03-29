# ML Systems

[![CI](https://github.com/MLSystemsRI/ml-systems-yconic/actions/workflows/ci.yml/badge.svg)](https://github.com/MLSystemsRI/ml-systems-yconic/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-363%20passing-brightgreen.svg)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)]()

> Closed-loop construction: Finance → Deconstruct → Design → Build → repeat. Every dollar returns 4x.

**1 human + Claude Code. 12 live domains. Zero vibe coding.**

## Quick Start

```typescript
import { calculateTransparencyScore, getAccessBand } from "@ml-systems/yconic/ttp";
import { resolveTier, rcmMonthlyPayment } from "@ml-systems/yconic/rcm";
import { scoreLucentLens, passesLucentLens, passesMVE } from "@ml-systems/yconic/intent";
import { AgentOrchestrator, A2ARouter } from "@ml-systems/yconic/agents";
import { calculateDisruptionScore } from "@ml-systems/yconic/disruption";

// Score an entity through TTP
const score = calculateTransparencyScore({
  tier: "pro", identityVerified: true, materialsContributed: 5,
  cyclesCompleted: 2, reviewsPassed: 3, accountAgeDays: 180,
  isRegulator: false, dataContributions: 10
});
const band = getAccessBand(score); // "full_api"

// Resolve their mortgage tier and calculate payment
const tier = resolveTier(720);                          // FICO → RCM tier 4
const payment = rcmMonthlyPayment(320_000, 0.065, 360); // ~$2,023/mo → 100% to principal

// Validate action against Intent Schema
const lens = scoreLucentLens(35, 20, 10);
passesLucentLens(lens); // { passes: true } — homeowner value leads

// Quantify the paradigm shift
const disruption = calculateDisruptionScore();
// { compositeMultiplier: 4.5, category: "significant", closedLoop: true }
```

## The 100x

| Old Way | ML Systems | Multiple |
|---------|-----------|----------|
| 18 years to equity crossover | Day 1 equity (100% to principal) | 18x |
| 90% materials landfilled | 80-90% recovered + graded | 8.5x |
| $350K per home (RI avg) | $185K target | 1.9x |
| 16% GC margin | 25.9% margin | 1.6x |
| Demolition = pure cost | Deconstruction = 4 revenue streams | 4x |

## Eight Modules

### [TTP](src/ttp/) — Transparency Trust Protocol
Score 0-100 from 8 weighted factors. Five access bands gate API depth. AI crawlers detected and charged per-query verification fees. Regulators get scoped compliance access. Framework-agnostic middleware processes every request.

### [RCM](src/rcm/) — Reverse Construction Mortgage
6 credit tiers. 100% of every payment → principal (interest deferred). Standard tiers (1-3): monthly with tier-specific overpayment allocation. Preferred tiers (4-6): daily arithmetic payments ($N/day × streams). Full amortization schedule generation and 6-tier comparison.

### [Intent](src/intent/) — Culture as Code
Lucent Lens: homeowner (0-40) > collective (0-30) > engine (0-30). MVE gate: every dollar must produce 3/4 returns. Custodian constraints and anti-SaaS pricing rules encoded as executable scoring functions, not mission statements.

### [Agents](src/agents/) — Multi-Agent Orchestration
AgentOrchestrator manages lifecycle, validates every action through Lucent Lens + MVE. A2A protocol adds hierarchical task delegation with typed capability cards, domain-scoped discovery, and 4-rule delegation enforcement. 7 MCP-compatible tool definitions expose all engines to external AI agents.

### [Disruption](src/disruption/) — Quantified Paradigm Shift
Five disruption multipliers (equity velocity, material recovery, cost reduction, margin improvement, revenue streams) calculated as typed functions. Composite score via geometric mean. Closed-loop validation. Traditional-vs-ML Systems paradigm comparison.

### [Provenance](src/provenance/) — ML Material ID System
Every recovered material gets an ML Material ID (ML-{year}-{project}-{zone}-{seq}), structural grade (A/B/C/D/salvage), contamination assessment, and DEM export for environmental compliance. 15 material categories with zone-based pricing. Round-trip parsing. Recovery reports with value aggregation.

### [Marketplace](src/marketplace/) — Secondary Materials Exchange
Recovered materials flow from provenance into marketplace listings with zone-based categorization and provenance-linked pricing. Order processing with availability checks. Revenue from material sales contributes to homeowner equity via RCM — closing the loop.

### [Schema](src/schema/) — Database Reference
Typed table names and enum types for the production database (Drizzle ORM). Validates table existence. Used by the monorepo's migration system.

## Project Structure

```
src/
├── index.ts              # Barrel export (all modules)
├── ttp/                   # Transparency Trust Protocol
│   ├── transparency.ts    # Scoring engine, access bands, headers
│   ├── ai-crawler.ts      # AI crawler detection + verification fees
│   ├── middleware.ts       # Request processing pipeline
│   └── types.ts           # TransparencyFactors, AccessBand, TTScoreResult
├── rcm/                   # Reverse Construction Mortgage
│   ├── engine.ts          # 6-tier resolution, schedule generation
│   ├── math.ts            # Payment, interest, equity calculations
│   ├── pipeline.ts        # End-to-end loan origination (TTP→RCM→Intent)
│   └── types.ts           # CreditTier, ProductClass, ScheduleRow
├── intent/                # Intent Schema — culture as code
│   └── schema.ts          # Lucent Lens, MVE gate, Custodian constraints
├── agents/                # Multi-agent orchestration
│   ├── orchestrator.ts    # Agent lifecycle + action validation
│   ├── a2a.ts             # A2A protocol — capability discovery + delegation
│   ├── tools.ts           # 7 MCP-compatible tool definitions
│   └── runtime.ts         # MCP tool executor — runs tools against real engines
├── disruption/            # Disruption scoring engine
│   └── engine.ts          # 5 multipliers, composite score, paradigm comparison
├── provenance/            # ML Material ID + grading + DEM export
│   └── engine.ts          # Material IDs, grading, contamination, valuation
├── marketplace/           # Secondary materials exchange
│   └── engine.ts          # Listings, orders, revenue → equity integration
├── demo/                  # Live demo runner
│   ├── runner.ts          # 10-step Maria scenario — full closed loop
│   └── simulation.test.ts # 35 tests validating the demo pipeline
└── schema/                # Database schema reference
    └── index.ts           # Typed table names + enum types
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run 363 tests (`vitest run`) |
| `npm run demo` | Run full closed-loop demo (Maria scenario) |
| `npm run test:coverage` | Tests with V8 coverage report |
| `npm run lint` | Lint with ESLint (strict TS rules) |
| `npm run ci` | Full pipeline: typecheck + lint + test |

## Live

12 domains, all deployed: [mlsystemsri.com](https://mlsystemsri.com) · [app](https://app.mlsystemsri.com) · [store](https://mlsystemsri.store) · [.info](https://mlsystemsri.info) · [.net](https://mlsystemsri.net) · [.xyz](https://mlsystemsri.xyz) · [fa](https://fa.mlsystemsri.com) · [ae](https://ae.mlsystemsri.com) · [lm](https://lm.mlsystemsri.com) · [pit](https://pit.mlsystemsri.com) · [collective](https://collective.mlsystemsri.com) · [boh](https://boh.mlsystemsri.com)

---

*Built with [Claude Code](https://claude.ai/claude-code) by one person who doesn't call it vibe coding.*
