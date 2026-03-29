# ML Systems — Technical Architecture

## System Overview

ML Systems is a construction proptech ecosystem operating as a **closed loop**: Finance → Deconstruct → Design → Build → back to Finance. Every dollar spent produces 4 returns: recovered material value, ontology data, robot training signal, and market-making intelligence.

## Neural Net Architecture — 3 Nets, 9 Nodes

```
PHYSICAL NET          FINANCIAL NET         DANCE NET
├── ML1 (Decon)       ├── LM (Language)      ├── EV (Events)
├── ML2 (Design)      ├── FA (Financial)     ├── CR (Healthcare)
└── ML3 (Build)       └── AE (Accounting)    └── GW (Growth)
```

The CEO operates **LM + FA + AE** directly. All other nodes are managed by agents.

## Core Engines

### Transparency Trust Protocol (TTP)

The moat around the ecosystem. Every entity gets a Transparency Score (0-100) that gates access through 5 bands:

| Score | Band | Access |
|-------|------|--------|
| 0-10 | Public Record | Name, category, status |
| 11-30 | ML Verified | Provenance chain, grading |
| 31-60 | Full API | Material feeds, valuations |
| 61-80 | Double-Verified | State cross-verified, bulk export |
| 81-100 | Ontology Licensed | Construction DAG, robot params |

**Score Factors** (8 dimensions, run in parallel):
1. API tier (5-50pts)
2. Identity verification (0-20pts)
3. Materials contributed (0-15pts)
4. Project cycles completed (0-30pts)
5. Annual reviews passed (0-15pts)
6. Account age (0-10pts, linear to 1 year)
7. Data contributions (0-10pts)
8. Compliance partner status (0-5pts)

**AI Crawler Detection**: 20+ known bot user-agents. AI queries for public property records route through ML Systems as incremental revenue (2nd verification stamp).

**DB-backed Engine** (`tt-engine.ts`): Caches scores for 24 hours per userId+apiKeyId pair. Falls back to `quickScoreFromTier` if DB is unavailable. Score history tracked for audit.

### Reverse Construction Mortgage (RCM)

Novel mortgage product — **100% of every payment goes to principal**. Interest is deferred as a separate liability. No existing mortgage product varies allocation by credit tier.

**Standard RCM (Tiers 1-3)** — Monthly payments:
- Tier 1 (FICO 580-619): Interest-First overpayment allocation
- Tier 2 (FICO 620-659): 50/50 Split allocation
- Tier 3 (FICO 660-699): Principal-First allocation

**Preferred RCM (Tiers 4-6)** — Daily arithmetic payments (Day N = $N × streams):
- Tier 4 (FICO 700-739): 1 stream → ~2.2 year payoff on $320K
- Tier 5 (FICO 740-779): 2 streams → ~1.5 year payoff
- Tier 6 (FICO 780+): 3 streams → ~1.3 year payoff

## Package Structure

```
src/
├── ttp/                    # Transparency Trust Protocol
│   ├── types.ts            # Shared types (ApiTier, AccessBand, TransparencyFactors)
│   ├── transparency.ts     # Core scoring engine (pure functions)
│   ├── ai-crawler.ts       # AI crawler detection & verification tiers
│   └── index.ts            # Barrel export
├── rcm/                    # Reverse Construction Mortgage
│   ├── types.ts            # All RCM types (tiers, schedules, analyses)
│   ├── math.ts             # Core financial math (pure functions)
│   ├── engine.ts           # Tier resolution, schedule generation, comparisons
│   └── index.ts            # Barrel export
├── schema/                 # Database schema (Drizzle ORM)
│   └── index.ts            # 30+ tables, full enum set
└── index.ts                # Root barrel export
```

## Design Principles

1. **Pure functions first**: All scoring and financial math is pure — no side effects, fully testable
2. **DB layer separate**: The TTP engine has a pure scoring layer (`transparency.ts`) and a DB-backed layer (`tt-engine.ts`) that caches and persists
3. **Type-driven**: Strict TypeScript with discriminated unions for tier types (Standard vs Preferred)
4. **Regulator-aware**: Government entities get scoped compliance access, not blanket permissions
5. **AI-monetizable**: Every AI query for public records is incremental revenue through the 2nd verification stamp

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

## Agent Hierarchy

```
                    CEO (Sal)
                 The Custodian
               ┌──────┼──────┐
              LM      FA     AE          ← CEO Roles
           ┌──┤     ┌─┤    ┌─┤
         CDA  DS   Pit Scorer Data Prov  ← Downstream
              Lord
     ┌───────┼──────────┐
    PI       TT       TTP               ← Primary Agents
 ┌──┼──┬──┐   ├──┐
Decon BOH BC   LL MVE                   ← Domain + Ops
.info .net .xyz Dance                   ← Extensions
```

**PI** = Project Intelligence (Lucent Lens — finds value-increasing tasks)
**TT** = Transparency Trust (we don't profit from users' compute — we optimize it)
**TTP** = Transparency Trust Protocol (the moat — score 0-100, 5 access bands)
