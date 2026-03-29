# ML Systems — Construction Proptech Ecosystem

**Built entirely through Language Modeling with Claude Code.**

> We help homeowners who struggle with building equity and affording construction costs in a closed-loop system that finances, deconstructs, designs, and builds — resulting in faster equity growth and lower costs with near-zero waste.

---

## Live Ecosystem — 12 Domains, 1 Platform

| Domain | Purpose | Stack |
|--------|---------|-------|
| [mlsystemsri.com](https://mlsystemsri.com) | Marketing & Platform | Next.js 15, tRPC, Drizzle |
| [app.mlsystemsri.com](https://app.mlsystemsri.com) | Core Application | Clerk, Supabase, Stripe |
| [mlsystemsri.store](https://mlsystemsri.store) | Builder's Open House — Materials Marketplace | Next.js, React Context |
| [mlsystemsri.info](https://mlsystemsri.info) | Intelligence Portal | Next.js SSG |
| [mlsystemsri.net](https://mlsystemsri.net) | Network & Partnerships | Next.js SSG |
| [mlsystemsri.xyz](https://mlsystemsri.xyz) | 3D Experiences & Digital Twins | Three.js, R3F |
| [fa.mlsystemsri.com](https://fa.mlsystemsri.com) | Financial Architect — 23 3D Visualizations | Three.js, Static HTML |
| [ae.mlsystemsri.com](https://ae.mlsystemsri.com) | Accounting Engineer — GAAP & Construction Accounting | Static HTML |
| [lm.mlsystemsri.com](https://lm.mlsystemsri.com) | Language Modeler — AI-Native Development | Static HTML |
| [pit.mlsystemsri.com](https://pit.mlsystemsri.com) | The Pit — Reverse Auction for Construction Loans | Next.js, Drizzle |
| [collective.mlsystemsri.com](https://collective.mlsystemsri.com) | Builders Collective — Design Verification | Next.js |
| [boh.mlsystemsri.com](https://boh.mlsystemsri.com) | Builder's Open House (alias) | → mlsystemsri.store |

**Infrastructure:** Vercel (hosting) · Supabase (Postgres) · Fly.io (Python scorer) · Clerk (auth) · Stripe (payments) · Inngest (jobs) · Cloudflare R2 (storage) · Google Analytics 4 (unified cross-domain tracking)

---

## The Closed Loop

```
    ┌─────────────┐
    │   FINANCE    │ ← RCM Mortgage (100% to principal)
    │  The Pit     │   Reverse auction, 7-tier fees
    └──────┬───────┘
           ▼
    ┌─────────────┐
    │ DECONSTRUCT  │ ← 80-90% material recovery
    │  Decon Lab   │   ML Material IDs, provenance chains
    └──────┬───────┘
           ▼
    ┌─────────────┐
    │   DESIGN     │ ← AI-powered (Claude + DALL-E)
    │Design Studio │   45+ sheet plan stacks
    └──────┬───────┘
           ▼
    ┌─────────────┐
    │    BUILD     │ ← Zone-based tracking
    │  Platform    │   Day N scheduling, AI scoring
    └──────┬───────┘
           │
           └──────────→ Back to FINANCE (equity growth)
```

Every dollar spent produces **4 returns**: recovered material value, ontology data, robot training signal, and market-making intelligence.

---

## Neural Net Architecture — 3 Nets, 9 Nodes

```
PHYSICAL NET          FINANCIAL NET         DANCE NET
├── ML1 (Decon)       ├── LM (Language)      ├── EV (Events)
├── ML2 (Design)      ├── FA (Financial)     ├── CR (Healthcare)
└── ML3 (Build)       └── AE (Accounting)    └── GW (Growth)
```

The CEO operates **LM + FA + AE** directly. All other nodes are managed by agents.

---

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
  Decon BOH BC   LL MVE                     ← Domain + Ops
  .info .net .xyz Dance                     ← Extensions
```

**PI** = Project Intelligence (Lucent Lens — finds value-increasing tasks)
**TT** = Transparency Trust (we don't profit from users' compute — we optimize it)
**TTP** = Transparency Trust Protocol (the moat — score 0-100, 5 access bands)

[Interactive 3D Agent Hierarchy →](https://fa.mlsystemsri.com/agent-hierarchy.html)

---

## Transparency Trust Protocol (TTP) — The Moat

Every entity gets a Transparency Score (0-100). The score gates access depth.

| Score | Band | Access |
|-------|------|--------|
| 0-10 | Public Record | Name, category, status |
| 11-30 | ML Verified | Provenance chain, grading |
| 31-60 | Full API | Material feeds, valuations |
| 61-80 | Double-Verified | State cross-verified, bulk export |
| 81-100 | Ontology Licensed | Construction DAG, robot params |

- **Regulators = automatic 100** (free access seeds double-verification)
- **AI crawlers = 402** without API key
- **X-TT-Score/Band/Protocol** headers on every API response
- DB-backed engine with 24h cache, 7 parallel factor queries

Source: [`source/transparency-trust-protocol/`](source/transparency-trust-protocol/)

---

## RCM — Reverse Construction Mortgage

**100% of every payment goes to principal.** Interest is deferred as a separate liability.

- **Standard (Tiers 1-3):** Monthly payments, 3 overpayment allocation modes by credit tier
- **Preferred (Tiers 4-6):** Daily arithmetic payments ($1/stream/day), 1/2/3 concurrent streams

No existing mortgage product varies allocation by credit tier. This is novel.

Source: [`source/rcm-engine/`](source/rcm-engine/)

---

## Key Visualizations (Three.js)

All interactive, all live at [fa.mlsystemsri.com](https://fa.mlsystemsri.com):

| Visualization | What It Shows |
|---------------|---------------|
| [Genesis](https://fa.mlsystemsri.com/genesis.html) | The entire ML Systems architecture as a living 3D organism |
| [Neural Topology](https://fa.mlsystemsri.com/neural-topology.html) | 3 neural nets converging in a 3D cube |
| [Income Streams](https://fa.mlsystemsri.com/income-streams.html) | 93 revenue strands through a 3D wormhole |
| [Norse Hall](https://fa.mlsystemsri.com/norse-hall.html) | Single project: 9 phases, 142 tasks, critical path |
| [Galactic Nebula](https://fa.mlsystemsri.com/galactic-nebula.html) | 4 projects orbiting a shared timeline |
| [Fiduciary Structure](https://fa.mlsystemsri.com/fiduciary.html) | Equity custodianship — concentric rings |
| [Partnership Map](https://fa.mlsystemsri.com/partnership-map.html) | 17 nodes, 32 connections — institutional mind map |
| [Traffic Funnel](https://fa.mlsystemsri.com/traffic-funnel.html) | 12 channels → 5 TLDs → 4 apps → 6 gates → 4 revenue streams |
| [Operations Timeline](https://fa.mlsystemsri.com/operations-timeline.html) | 18-month swimlane, critical path, dependency chains |
| [Master Pitch](https://fa.mlsystemsri.com/master-pitch.html) | Complete investor narrative in one page |
| [Agent Hierarchy](https://fa.mlsystemsri.com/agent-hierarchy.html) | All agents, roles & subagents — flowchart |
| [Ecosystem Architecture](https://fa.mlsystemsri.com/ecosystem-architecture.html) | Full 3D map of the entire ecosystem |

Local copies in [`visualizations/`](visualizations/)

---

## How It Was Built — Language Modeling

This entire ecosystem was built by one person using **Claude Code** (Anthropic's CLI) as the execution layer.

**Language Modeling is not vibe coding.** It is the deliberate, fiduciary-grade practice of engineering outcomes through language with AI as the execution layer.

| Metric | Count |
|--------|-------|
| Live domains | 12 |
| Git repositories | 16 |
| Three.js visualizations | 23 |
| Database tables | 30+ |
| tRPC procedures | 100+ |
| Neural net nodes | 9 |
| Active agents | 2 (PI + Custodian) |
| Lines of code | 50,000+ |
| Team size | 1 human + Claude |

### The Language Modeler's Stack
- **Claude Code CLI** — primary development tool
- **CLAUDE.md files** — per-repo context and constraints
- **Memory system** — persistent cross-session knowledge (50+ memory files)
- **Multi-agent orchestration** — parallel research and builds
- **Research-to-code pipeline** — PDF → intelligence → schema → UI → deploy

---

## Color System

| Color | Hex | Identity |
|-------|-----|----------|
| Green | `#22C55E` | Platform default |
| Blue | `#60A5FA` | Design Studio / FA |
| Orange | `#F97316` | Deconstruction Lab |
| Teal | `#14B8A6` | Builder's Open House |
| Red | `#EF4444` | The Pit |
| Emerald | `#10B981` | Accounting Engineer |
| Cyan | `#06B6D4` | Language Modeler |
| Slate | `#94A3B8` | .info (Intelligence) |
| Amber | `#F59E0B` | .net (Network) |
| Violet | `#8B5CF6` | .xyz (Experience) |

---

## Repo Structure

```
ml-systems-yconic/
├── README.md                          ← You are here
├── visualizations/                    ← 23 Three.js interactive HTML pages
│   ├── index.html                     ← FA hub (card grid navigation)
│   ├── genesis.html                   ← The Value Engine (full ecosystem 3D)
│   ├── agent-hierarchy.html           ← Agent flowchart
│   ├── agent-hierarchy-3d.html        ← 3D clickable agent hierarchy
│   ├── neural-topology.html           ← 3 neural nets in 3D cube
│   └── ...                            ← 18 more visualizations
├── portals/
│   ├── accounting-engineer/           ← ae.mlsystemsri.com hub page
│   └── language-modeler/              ← lm.mlsystemsri.com hub page
├── source/
│   ├── transparency-trust-protocol/   ← TTP engine, score calculator, AI crawler detection
│   ├── rcm-engine/                    ← RCM mortgage variant type system (620 lines)
│   ├── schema/                        ← Full Drizzle DB schema (1,303 lines, 30+ tables)
│   ├── ga4/                           ← Cross-domain GA4 component (12 domains)
│   └── agents/                        ← Agent configuration
├── research/
│   ├── gaap-construction-accounting.md
│   ├── language-modeler-deep-research.md
│   └── master-pitch.md
└── docs/
    └── architecture.md                ← Technical architecture deep dive
```

---

## Company

**ML Systems LLC** — Rhode Island · NAICS 236115 (Residential Construction)

Founded by Sal, who operates as The Custodian with fiduciary duty to public equity. LLC structured as C-Corp.

**Core principle:** Public institutions receive equity before any private entity. The cap table has institutional accountability baked in from day one.

---

*Built with [Claude Code](https://claude.ai/claude-code) by Anthropic*
