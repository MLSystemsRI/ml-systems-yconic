# Architecture

## Overview

ML Systems operates as a closed-loop construction system: **Finance → Deconstruct → Design → Build → Repeat**. This package (`@ml-systems/yconic`) contains 10 engines that power the loop, implemented as pure TypeScript with strict mode and zero runtime dependencies.

Every dollar spent produces 4 returns: recovered material value, ontology data, robot training signal, and market-making intelligence.

## Ten Engines

```
src/
├── ttp/           Transparency Trust Protocol — the moat
│   ├── types.ts            Shared types (ApiTier, AccessBand, TransparencyFactors)
│   ├── transparency.ts     Core scoring engine (pure functions)
│   ├── ai-crawler.ts       AI crawler detection & verification tiers
│   ├── middleware.ts        Framework-agnostic HTTP pipeline
│   └── index.ts            Barrel export
├── rcm/           Reverse Construction Mortgage — the financial engine
│   ├── types.ts            All RCM types (tiers, schedules, analyses)
│   ├── math.ts             Core financial math (pure functions)
│   ├── engine.ts           Tier resolution, schedule generation, comparisons
│   ├── pipeline.ts         End-to-end loan origination (TTP→RCM→Intent)
│   ├── simulator.ts        360-month equity simulator (RCM vs traditional)
│   └── index.ts            Barrel export
├── intent/        Intent Schema — culture as code
│   ├── schema.ts           Lucent Lens, MVE gate, Custodian constraints, pricing rules
│   └── index.ts            Barrel export
├── agents/        Multi-agent orchestration
│   ├── orchestrator.ts     Agent lifecycle + action validation via Lucent Lens
│   ├── a2a.ts              A2A protocol — hierarchy enforcement, capability discovery
│   ├── tools.ts            10 MCP-compatible tool definitions
│   ├── runtime.ts          MCP tool executor — runs tools against real engines
│   └── index.ts            Barrel export
├── disruption/    Quantified paradigm shift
│   └── engine.ts           5-multiplier composite scoring, closed-loop validation
├── provenance/    ML Material ID system
│   └── engine.ts           Material IDs, grading, contamination, DEM export, valuation
├── marketplace/   Secondary materials exchange
│   └── engine.ts           Listings, orders, revenue → equity integration
├── closed-loop/   Full pipeline orchestration
│   └── engine.ts           Finance→Deconstruct→Design→Build in single function
├── field-data/    Physical → digital bridge
│   └── engine.ts           Inspection validation, auto-classification, provenance ingestion
├── shared/        Cross-module utilities
│   └── zones.ts            Material category → zone mapping (15 categories → 10 zones)
└── schema/        Database schema reference (Drizzle ORM)
```

## Engine Details

### TTP — Transparency Trust Protocol

The access control and monetization layer. Every entity receives a Transparency Score (0-100) computed from 8 weighted factors. The score determines which of 5 access bands the entity falls into.

| Score | Band | Access |
|-------|------|--------|
| 0-10 | Public Record | Name, category, status |
| 11-30 | ML Verified | Provenance chain, grading |
| 31-60 | Full API | Material feeds, valuations |
| 61-80 | Double-Verified | State cross-verified, bulk export |
| 81-100 | Ontology Licensed | Construction DAG, robot params |

### RCM — Reverse Construction Mortgage

100% of every payment goes to principal. Interest accrues monthly but is deferred as a separate liability. No existing mortgage product varies allocation by credit tier.

- **Standard (Tiers 1-3):** Monthly payments, 3 overpayment modes by credit tier
- **Preferred (Tiers 4-6):** Daily arithmetic payments (Day N = $N × streams)
- **Equity Simulator:** 360-month comparison of RCM vs traditional with material revenue integration

### Intent — Culture as Code

Lucent Lens scoring function gates every agent action. Homeowner value (0-40) must always exceed engine value (0-30). MVE gate requires 3 of 4 returns per dollar spent.

### Agents — Multi-Agent Orchestration

- **AgentOrchestrator:** Lifecycle management, Lucent Lens validation, safety cutoff (10+ blocks = auto-blocked)
- **A2A Protocol:** Hierarchical task delegation with 4 enforcement rules (hierarchy, capability, value limits, intent)
- **MCP Runtime:** 10 tools with real engine executors — TTP scoring, RCM payments, intent validation, provenance grading, material valuation, equity simulation

### Provenance — ML Material ID System

Every recovered material gets: `ML-{year}-{project}-Z{zone}-{seq}`. Structural grading (A/B/C/D/salvage) from 5 weighted factors. Contamination assessment. DEM export for environmental compliance. 15 material categories with zone-based pricing.

### Marketplace — Secondary Materials Exchange

Materials flow from provenance to marketplace listings with provenance-linked pricing. Order processing with availability checks. Revenue from sales contributes to homeowner equity via RCM.

### Field Data — Physical → Digital Bridge

Field crews capture material data via structured inspection forms. Engine validates reports, auto-classifies materials via keyword matching (15 keyword dictionaries), maps observations to contamination tests, and ingests into the ML Material ID provenance chain. Batch processing for end-of-day uploads.

### Closed Loop — Full Pipeline Orchestration

`executeClosedLoop()` runs Finance → Deconstruct → Design → Build in a single function call. Uses real engines at every stage. Returns typed results proving the loop works — homeowner equity grows from both mortgage payments AND material recovery revenue.

### Disruption — Quantified Paradigm Shift

Five disruption multipliers (equity velocity, material recovery, cost reduction, margin improvement, revenue streams) computed as typed functions. Composite score via geometric mean.

## How the Engines Connect

```
                          ┌─────────────┐
                          │   Intent    │
                          │ Lucent Lens │  ← governs every decision
                          │  MVE Gate   │
                          └──────┬──────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
       ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
       │     TTP     │   │   Agents    │   │     RCM     │
       │  Score 0-100│   │  A2A + MCP  │   │  6 Tiers    │
       │   5 Bands   │   │  10 Tools   │   │  Equity Sim │
       └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
              │                  │                  │
       ┌──────▼──────┐          │           ┌──────▼──────┐
       │ Field Data  │          │           │  Closed     │
       │ Inspections │──────────┼──────────▶│  Loop       │
       └──────┬──────┘          │           └──────┬──────┘
              │                  │                  │
       ┌──────▼──────┐          │           ┌──────▼──────┐
       │ Provenance  │          │           │ Disruption  │
       │ ML Material │──────────┤           │ Quantified  │
       │ IDs + Grade │          │           │ 5x Composite│
       └──────┬──────┘          │           └─────────────┘
              │                  │
       ┌──────▼──────┐          │
       │ Marketplace │          │
       │ Listings    │──────────┘
       │ Revenue→RCM │
       └─────────────┘
```

**Data flows:**

1. **TTP scores** gate access depth to all other engines
2. **Field data** feeds into provenance (ML Material IDs, grading, contamination)
3. **Provenance** feeds into marketplace (listings with provenance-linked pricing)
4. **Marketplace revenue** feeds into RCM (homeowner equity via material recovery)
5. **Agents** orchestrate the full pipeline via A2A delegation + MCP tool execution
6. **Intent** validates every action at every stage through Lucent Lens + MVE gate
7. **Closed loop** executes all stages in sequence with real engine calls
8. **Disruption** quantifies the composite advantage vs traditional construction

## Design Principles

1. **Pure functions first.** All scoring and financial math is pure — no database, no network, no side effects. The DB layer lives in the monorepo.

2. **Type-driven design.** Strict TypeScript with discriminated unions, branded types, and exhaustive switch checks. If it compiles, the business logic is correct.

3. **Zero dependencies.** The `dependencies` field is empty. All engines are self-contained pure TypeScript.

4. **Real calculations, not stubs.** Every MCP tool executor calls a real engine function. Every test uses real calculations. Nothing is mocked.

5. **Closed-loop equity.** RCM equity includes material recovery value — tying the financial engine to physical deconstruction. Not possible in conventional mortgage products.

## Agent Hierarchy

```
                    CEO (Sal)
                 The Custodian
               ┌──────┼──────┐
              LM      FA     AE          ← CEO Roles
                    ┌──┤
                   PI  │                  ← Project Intelligence
                ┌──┼──┐│
              Decon  Design              ← Domain Agents
```

- **A2A Protocol** enforces this structurally: delegation DOWN only, capability gates, value limits cascade, intent preserved
- **AgentOrchestrator** manages lifecycle: register → idle → active → (blocked | terminated)
- **MCP Tools** expose all engines to external AI agents (Claude, GPT, custom)

## Testing

482 tests across 21 test files. 98.7% statement coverage, 100% function coverage. Integration tests verify cross-module data flows end-to-end, including A2A agents orchestrating the full closed-loop pipeline via MCP tools.
