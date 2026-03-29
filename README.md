# ML Systems

> Closed-loop construction: Finance → Deconstruct → Design → Build → repeat. Every dollar returns 4x.

**1 human + Claude Code. 12 live domains. 50K+ lines. Zero vibe coding.**

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
Score 0-100. Five access bands. Every API response carries `X-TT-Score` headers. AI crawlers pay per-query verification fees. Regulators get scoped compliance access. The moat deepens as more entities participate. **105 tests, strict TypeScript.**

### [Reverse Construction Mortgage](src/rcm/) — Anti-SaaS Finance
Not a subscription. Not a fee. 100% of every payment → principal. Interest deferred. 6 tiers by credit score — no existing mortgage product does this. Outcome-based: you pay, you own. Period.

### [Intent Schema](src/intent/) — Culture as Code
The Lucent Lens + TTP encoded as executable constraints that every AI agent inherits. Homeowner value (0-40) > Collective value (0-30) > Engine value (0-30). Not a mission statement — a scoring function.

## Live

12 domains, all deployed: [mlsystemsri.com](https://mlsystemsri.com) · [app](https://app.mlsystemsri.com) · [store](https://mlsystemsri.store) · [.info](https://mlsystemsri.info) · [.net](https://mlsystemsri.net) · [.xyz](https://mlsystemsri.xyz) · [fa](https://fa.mlsystemsri.com) · [ae](https://ae.mlsystemsri.com) · [lm](https://lm.mlsystemsri.com) · [pit](https://pit.mlsystemsri.com) · [collective](https://collective.mlsystemsri.com) · [boh](https://boh.mlsystemsri.com)

## Architecture

```
src/
├── ttp/          # Transparency Trust Protocol (scoring, access bands, AI crawler detection)
├── rcm/          # Reverse Construction Mortgage (6-tier engine, daily arithmetic payments)
├── intent/       # Intent Schema (Lucent Lens + value hierarchy as executable code)
└── schema/       # Drizzle ORM (30+ tables, full enum set)
```

```
PHYSICAL NET          FINANCIAL NET         DANCE NET
├── ML1 (Decon)       ├── LM (Language)      ├── EV (Events)
├── ML2 (Design)      ├── FA (Financial)     ├── CR (Healthcare)
└── ML3 (Build)       └── AE (Accounting)    └── GW (Growth)
```

## Stack

Next.js 15 · tRPC · Drizzle/Postgres · Clerk · Stripe · Inngest · Fly.io · Cloudflare R2 · Three.js · Claude Code

## Run

```bash
npm install && npm run ci   # typecheck + lint + 105 tests
```

---

*Built with [Claude Code](https://claude.ai/claude-code) by one person who doesn't call it vibe coding.*
