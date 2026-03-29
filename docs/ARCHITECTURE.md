# Architecture

## Overview

ML Systems operates as a closed-loop construction system: **Finance -> Deconstruct -> Design -> Build -> Repeat**. This package (`@ml-systems/yconic`) contains the three core engines that power the loop, implemented as pure TypeScript with strict mode and zero runtime dependencies beyond Drizzle ORM for schema definitions.

Every dollar spent produces 4 returns: recovered material value, ontology data, robot training signal, and market-making intelligence.

## Three Engines

```
src/
├── ttp/          Transparency Trust Protocol — the moat
│   ├── types.ts            Shared types (ApiTier, AccessBand, TransparencyFactors)
│   ├── transparency.ts     Core scoring engine (pure functions)
│   ├── ai-crawler.ts       AI crawler detection & verification tiers
│   ├── middleware.ts        Framework-agnostic HTTP pipeline
│   └── index.ts            Barrel export
├── rcm/          Reverse Construction Mortgage — the financial engine
│   ├── types.ts            All RCM types (tiers, schedules, analyses)
│   ├── math.ts             Core financial math (pure functions)
│   ├── engine.ts           Tier resolution, schedule generation, comparisons
│   └── index.ts            Barrel export
├── intent/       Intent Schema — culture as code
│   ├── schema.ts           Lucent Lens, MVE gate, Custodian constraints, pricing rules
│   └── index.ts            Barrel export
└── schema/       Database schema reference (Drizzle ORM, 30+ tables)
```

### TTP — Transparency Trust Protocol

The access control and monetization layer. Every entity in the ecosystem receives a Transparency Score (0-100) computed from 8 weighted factors. The score determines which of 5 access bands the entity falls into, gating data depth from public records through full ontology access.

| Score | Band | Access |
|-------|------|--------|
| 0-10 | Public Record | Name, category, status |
| 11-30 | ML Verified | Provenance chain, grading |
| 31-60 | Full API | Material feeds, valuations |
| 61-80 | Double-Verified | State cross-verified, bulk export |
| 81-100 | Ontology Licensed | Construction DAG, robot params |

**Score Factors** (8 dimensions, scored in parallel):

1. API tier (5-50pts) — base score from subscription level
2. Identity verification (0-20pts) — verified through Clerk/KYC
3. Materials contributed (0-15pts) — provenance-tracked items
4. Project cycles completed (0-30pts) — full lifecycle completions
5. Annual reviews passed (0-15pts) — performance gates
6. Account age (0-10pts) — linear ramp to 1 year
7. Data contributions (0-10pts) — decon logs, BOH listings, design specs
8. Compliance partner status (0-5pts) — recognized government entities

**Key design decisions:**

- **Pure scoring layer** (`transparency.ts`) is completely stateless. No database, no side effects, fully testable. The DB-backed caching layer exists separately in the monorepo.
- **AI crawlers start at 0.** Third-party AI accessing public property records pays a per-query verification fee. ML Systems is the second verification stamp on every query.
- **Regulators get scoped access, not blanket permissions.** Government entities on free/starter tiers can only access compliance endpoints. If they need more, they pay for a tier like everyone else.
- **Framework-agnostic middleware** (`middleware.ts`) processes any HTTP request through the TTP pipeline without coupling to Next.js, Express, or any specific framework.

### RCM — Reverse Construction Mortgage

A novel mortgage product where **100% of every payment goes to principal**. Interest accrues monthly but is deferred as a separate liability. No existing mortgage product varies allocation by credit tier.

**Standard RCM (Tiers 1-3)** — Monthly payments:
- Tier 1 (FICO 580-619): Interest-First overpayment allocation
- Tier 2 (FICO 620-659): 50/50 Split allocation
- Tier 3 (FICO 660-699): Principal-First allocation

**Preferred RCM (Tiers 4-6)** — Daily arithmetic payments (Day N = $N x streams):
- Tier 4 (FICO 700-739): 1 stream, ~2.2 year payoff on $320K
- Tier 5 (FICO 740-779): 2 streams, ~1.5 year payoff
- Tier 6 (FICO 780+): 3 streams, ~1.3 year payoff

**Key design decisions:**

- **Discriminated union for tier types.** `RCMTier = StandardTier | PreferredTier`, discriminated on `productClass`. TypeScript narrows correctly in all branches.
- **Core math is pure.** `rcmMonthlyPayment`, `rcmAccruedInterest`, `rcmEquity` have zero dependencies and no side effects.
- **Schedule generation is deterministic.** Given the same inputs, schedules produce identical output every time.
- **Preferred schedule sampling.** Daily simulation runs internally but outputs are sampled at key intervals to keep result size manageable.

### Intent — Culture as Code

The Lucent Lens, MVE gate, and Custodian principles encoded as executable constraints. Every AI agent in the ML Systems ecosystem inherits this schema at instantiation.

```
HIERARCHY:
  Homeowner Value   0-40 pts   (ALWAYS FIRST)
  Collective Value  0-30 pts
  Engine Value      0-30 pts
                    Lucent Score: 0-100
```

**Key design decisions:**

- **Scoring function, not mission statement.** `scoreLucentLens` returns numbers. `passesLucentLens` returns pass/fail with a reason string. These are machine-evaluable.
- **Homeowner > Collective > Engine.** The hierarchy is enforced: any action where engine value exceeds homeowner value is automatically rejected.
- **MVE gate requires 3 of 4 returns.** Every expense must produce at least 3 of: material value, ontology data, robot training signal, market intelligence.
- **Anti-SaaS pricing is a constant, not a guideline.** Own-data access is free. AI crawlers pay per-query. Primary revenue comes from outcomes.

## How the Engines Connect

```
                    ┌─────────────┐
                    │   Intent    │
                    │ Lucent Lens │
                    │  MVE Gate   │
                    └──────┬──────┘
                           │ governs every decision
                    ┌──────┴──────┐
            ┌───────┤    TTP      ├───────┐
            │       │ Score 0-100 │       │
            │       │  5 bands    │       │
            │       └─────────────┘       │
            │                             │
    ┌───────▼───────┐           ┌─────────▼───────┐
    │  AI Crawlers  │           │   RCM Engine    │
    │  Per-query $  │           │ 6 tiers by FICO │
    │  20+ bots     │           │ Daily arithmetic│
    └───────────────┘           └──────────────────┘
```

1. **Intent governs TTP.** The Lucent Lens hierarchy determines that homeowner data access is prioritized over engine monetization. TTP scoring reflects this — participation earns access, not just payment.

2. **TTP gates RCM data.** Loan comparisons, tier analyses, and schedule data are gated by transparency score. A lender with a higher TTP score sees deeper analytics.

3. **RCM feeds back to TTP.** Completed mortgage cycles increase the entity's TTP score (`cyclesCompleted` factor), deepening their access over time.

4. **Intent constrains both.** Every pricing decision in TTP and every allocation rule in RCM passes through the Lucent Lens and MVE gate before reaching production.

## Design Principles

1. **Pure functions first.** All scoring and financial math is pure — no database access, no network calls, no side effects. The DB layer is separate and lives in the monorepo.

2. **Type-driven design.** Strict TypeScript with discriminated unions, branded types, and exhaustive switch checks. If it compiles, the business logic is correct.

3. **Regulator-aware.** Government entities get scoped compliance access with explicit endpoint allowlists. No blanket permissions, no special treatment beyond what regulation requires.

4. **AI-monetizable.** Every AI query for public records routes through ML Systems as incremental revenue. The verification fee structure turns data access into a revenue stream without restricting it.

5. **Closed-loop equity.** RCM equity calculations include material recovery value — tying the financial engine to the physical deconstruction-to-construction loop. This is not possible in any conventional mortgage product.

## Neural Net Architecture

The broader ML Systems ecosystem operates as three interconnected neural nets with 9 nodes:

```
PHYSICAL NET          FINANCIAL NET         DANCE NET
├── ML1 (Decon)       ├── LM (Language)      ├── EV (Events)
├── ML2 (Design)      ├── FA (Financial)     ├── CR (Healthcare)
└── ML3 (Build)       └── AE (Accounting)    └── GW (Growth)
```

The CEO operates **LM + FA + AE** directly. All other nodes are managed by agents.

This package provides the engines that power the Financial Net. The Physical Net and Dance Net consume these engines through the monorepo's tRPC layer.

## Agent Hierarchy

```
                    CEO (Sal)
                 The Custodian
               ┌──────┼──────┐
              LM      FA     AE          <- CEO Roles
           ┌──┤     ┌─┤    ┌─┤
         CDA  DS   Pit Scorer Data Prov  <- Downstream
              Lord
     ┌───────┼──────────┐
    PI       TT       TTP               <- Primary Agents
 ┌──┼──┬──┐   ├──┐
Decon BOH BC   LL MVE                   <- Domain + Ops
.info .net .xyz Dance                   <- Extensions
```

- **PI** = Project Intelligence (Lucent Lens — finds value-increasing tasks)
- **TT** = Transparency Trust (we do not profit from users' compute — we optimize it)
- **TTP** = Transparency Trust Protocol (the moat — score 0-100, 5 access bands)

## Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Hosting | Vercel | All web apps + static sites |
| Database | Supabase (Postgres) | Primary data store |
| Compute | Fly.io | Python scorer (FastAPI + XGBoost) |
| Auth | Clerk | Identity + session management |
| Payments | Stripe | Subscription + per-query billing |
| Jobs | Inngest | Background task orchestration |
| Storage | Cloudflare R2 | Document + asset storage |
| Analytics | GA4 | Unified cross-domain tracking (12 domains) |
