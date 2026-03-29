# ML Systems

[![CI](https://github.com/MLSystemsRI/ml-systems-yconic/actions/workflows/ci.yml/badge.svg)](https://github.com/MLSystemsRI/ml-systems-yconic/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-135%20passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/Coverage-80%25%20threshold-yellow.svg)]()
[![License](https://img.shields.io/badge/License-UNLICENSED-red.svg)]()

> Closed-loop construction: Finance → Deconstruct → Design → Build → repeat. Every dollar returns 4x.

**1 human + Claude Code. 12 live domains. 50K+ lines. Zero vibe coding.**

## Quick Start

```bash
npm install @ml-systems/yconic  # private package
```

```typescript
import { calculateTransparencyScore, getAccessBand } from "@ml-systems/yconic/ttp";
import { resolveTier, rcmMonthlyPayment } from "@ml-systems/yconic/rcm";
import { scoreLucentLens, passesLucentLens, passesMVE } from "@ml-systems/yconic/intent";

// Score an entity
const score = calculateTransparencyScore({
  tier: "pro", identityVerified: true, materialsContributed: 5,
  cyclesCompleted: 2, reviewsPassed: 3, accountAgeDays: 180,
  isRegulator: false, dataContributions: 10
});
const band = getAccessBand(score); // "full_api"

// Resolve their mortgage tier
const tier = resolveTier(720);                       // FICO → RCM tier
const payment = rcmMonthlyPayment(320_000, 0.065, 360); // ~$2,023/mo

// Validate against Intent Schema
const lens = scoreLucentLens(35, 20, 10);
const approved = passesLucentLens(lens);
```

## What It Does

Homeowners lose equity for 7+ years on conventional mortgages. 90% of demolition materials go to landfill. Construction has no tech at residential scale.

ML Systems fixes all three at once. Not incrementally — the old system looks absurd next to this.

## The 100x

| Old Way | ML Systems | Multiple |
|---------|-----------|----------|
| 7 years to build equity | Day 1 equity (RCM) | ∞ |
| 90% materials landfilled | 80-90% recovered | 9x |
| $250K-$370K per home | $146K-$225K | 40-50% less |
| 16% GC margin | 25.9% margin | 1.6x |
| 18-month mortgage payoff ramp | Daily arithmetic ($1/day) | Instant |

## Core Engines

### [Transparency Trust Protocol](src/ttp/) — The Moat
Score 0-100. Five access bands. Every API response carries `X-TT-Score` headers. AI crawlers pay per-query verification fees. Regulators get scoped compliance access. The moat deepens as more entities participate. **126 tests, strict TypeScript.**

### [Reverse Construction Mortgage](src/rcm/) — Anti-SaaS Finance
Not a subscription. Not a fee. 100% of every payment → principal. Interest deferred. 6 tiers by credit score — no existing mortgage product does this. Outcome-based: you pay, you own. Period.

### [Intent Schema](src/intent/) — Culture as Code
The Lucent Lens + TTP encoded as executable constraints that every AI agent inherits. Homeowner value (0-40) > Collective value (0-30) > Engine value (0-30). Not a mission statement — a scoring function.

## Project Structure

```
src/
├── index.ts          # Main barrel export
├── ttp/              # Transparency Trust Protocol (126 tests)
│   ├── transparency.ts   # Scoring engine, access bands, headers
│   ├── ai-crawler.ts     # AI crawler detection + verification fees
│   ├── middleware.ts      # Request processing pipeline
│   └── types.ts           # TransparencyFactors, AccessBand, TTScoreResult
├── rcm/              # Reverse Construction Mortgage (47 tests)
│   ├── engine.ts         # 6-tier resolution, schedule generation
│   ├── math.ts           # Payment, interest, equity calculations
│   └── types.ts          # CreditTier, ProductClass, ScheduleRow
├── intent/           # Intent Schema — culture as code (25 tests)
│   ├── schema.ts         # Lucent Lens, MVE gate, Custodian constraints
│   └── types.ts          # LucentLensScore, AgentIntent, PricingModel
└── schema/           # Database schema reference (Drizzle ORM, 30+ tables)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Type-check without emitting (`tsc --noEmit`) |
| `npm test` | Run all tests once (`vitest run`) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run lint` | Lint `src/` with ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format all `.ts` files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run ci` | Full CI pipeline: typecheck + lint + test |

## Live

12 domains, all deployed: [mlsystemsri.com](https://mlsystemsri.com) · [app](https://app.mlsystemsri.com) · [store](https://mlsystemsri.store) · [.info](https://mlsystemsri.info) · [.net](https://mlsystemsri.net) · [.xyz](https://mlsystemsri.xyz) · [fa](https://fa.mlsystemsri.com) · [ae](https://ae.mlsystemsri.com) · [lm](https://lm.mlsystemsri.com) · [pit](https://pit.mlsystemsri.com) · [collective](https://collective.mlsystemsri.com) · [boh](https://boh.mlsystemsri.com)

## Architecture

```
PHYSICAL NET          FINANCIAL NET         DANCE NET
├── ML1 (Decon)       ├── LM (Language)      ├── EV (Events)
├── ML2 (Design)      ├── FA (Financial)     ├── CR (Healthcare)
└── ML3 (Build)       └── AE (Accounting)    └── GW (Growth)
```

## Stack

Next.js 15 · tRPC · Drizzle/Postgres · Clerk · Stripe · Inngest · Fly.io · Cloudflare R2 · Three.js · Claude Code

---

*Built with [Claude Code](https://claude.ai/claude-code) by one person who doesn't call it vibe coding.*
