# ML Systems — Master Plan

## Intent

We replace the construction-mortgage-demolition system with a closed loop that makes the old way look absurd.

**Old system:** Bank takes 18 years of interest before you build equity. Demolition destroys 90% of materials. Contractors operate at 16% margins with zero technology. Three industries, $63 trillion, completely disconnected.

**ML Systems:** 100% of your mortgage payment builds equity from day one. Deconstruction recovers 80–90% of materials. AI agents score every decision through a value hierarchy that puts homeowners first. One company, one loop: Finance → Deconstruct → Design → Build → Repeat.

**This is not a SaaS product.** We don't sell subscriptions. We build homes, recover materials, and originate mortgages. Revenue comes from outcomes — a home built, a material sold, a loan closed. The software is the nervous system, not the product.

---

## Disruption — Quantified, Not Claimed

We don't pitch disruption. We calculate it. The `disruption/engine.ts` computes a composite score from five measurable multipliers:

| What Exists | What ML Systems Does | Multiplier |
|-------------|---------------------|-----------|
| 18 years before principal > interest | 100% to principal from day one | **18x faster equity** |
| 90% of materials landfilled | 80–90% recovered with ML Material IDs | **9x recovery** |
| Demolition destroys value | Deconstruction creates inventory | **Cost center → profit center** |
| No mortgage varies by credit tier | 6-tier RCM with variable allocation | **First of its kind** |
| $300K+ per home (RI avg) | $146K–$225K TDC | **39–42% cost reduction** |
| 16% GC margins (RI avg) | 25.9% target (Toll Brothers benchmark) | **+62% margin improvement** |
| Zero shingle recyclers in RI | ML Systems builds the market | **∞ — category creation** |
| $44M garage earning $0 for 14 years | $41.6M in lease revenue | **$0 → $41.6M** |

**Composite disruption score:** Geometric mean of equity velocity (18x), material recovery (8.5x), cost reduction (1.89x), margin improvement (1.62x), and revenue streams (4x per dollar) = **5.5x paradigm shift** vs. industry baseline. This isn't a slide — it's a function you can call.

### Why the Old System Can't Respond

The construction-mortgage-demolition complex is structurally incapable of adopting this model:

1. **Banks profit from interest** — RCM eliminates it. No bank will voluntarily route 100% to principal.
2. **Demolition contractors destroy materials** — their business model requires waste. Recovery kills their margin.
3. **GCs have no technology** — 16% margins leave zero room for R&D. They can't build what we already shipped.
4. **No data exists** — 269 field days, 1,480 task executions, 81 task codes. Competitors start at zero.

The moat isn't technology. The moat is that fixing one piece requires fixing all three industries simultaneously. We already did. A well-funded startup with $10M could replicate the *code* in 18 months — but they'd still need 269 days of field data, GC registration, PHA relationships, grant pipeline, and a physical deconstruction crew. The code is the nervous system. The body took years to build.

### Competitive Landscape

| Vertical | Closest Analog | Why ML Systems Wins |
|----------|---------------|-------------------|
| Modular Construction | ICON ($400M+ raised, 3D-printed) | ICON prints new materials at $200K+. ML Systems recovers existing materials at near-zero cost, builds at $146K–$225K. Recovery > printing. |
| Alternative Mortgage | CMG Financial All-In-One | CMG rebates interest on deposits, still charges it. RCM eliminates interest entirely — 100% to principal. Structural difference, not incremental. |
| Material Recovery | Habitat ReStores / Build Reuse | Donation-based, retail markup, no grading system. ML Systems: ML Material IDs, provenance chain, AI grading, integrated marketplace. Data compounds. |

None of these competitors operate across all three verticals. That's the point.

---

## Agentic Orchestration — Intent as Code

### The Problem with AI Agents

Every AI agent system has the same flaw: agents optimize for task completion, not values. An agent told to "minimize construction cost" will cut corners. An agent told to "maximize revenue" will exploit homeowners. The alignment problem isn't theoretical — it's the reason construction AI hasn't penetrated residential.

### Our Solution: The Lucent Lens

Every agent in ML Systems inherits an executable value hierarchy at instantiation. Not guidelines. Not system prompts. **Scored enforcement functions** baked into the orchestrator:

```
INTENT: "Glow within to help humans."

HIERARCHY:
  Homeowner Value    ████████████████████████████  0–40 pts   (ALWAYS FIRST)
  Collective Value   ████████████████████████       0–30 pts
  Engine Value       ████████████████████████       0–30 pts
                                              Lucent Score: 0–100

RULE: Engine value can NEVER exceed homeowner value.
GATE: Minimum 30 points to execute. Below 30 = blocked.
```

This is culture-as-code. The Lucent Lens isn't a mission statement — it's a scoring function that gates every agent action before execution.

### Agent Hierarchy (Enforced, Not Suggested)

```
  CEO / The Custodian (TT + LL + MVE)
       │
       ├── Language Modeler (LM) — Intelligence, AI, strategy
       ├── Financial Architect (FA) — Capital, equity, investors
       └── Accounting Engineer (AE) — Ledger, GAAP, compliance
                    │
            Project Intelligence (PI) — Lucent Lens engine
                    │
         ┌────┬────┼────┬────┐
        CDA  TTA  DRA  LPA  MIA
```

The A2A (Agent-to-Agent) protocol enforces this hierarchy structurally:

1. **Delegation flows DOWN only** — A child agent cannot assign tasks to its parent
2. **Capability gates** — Each agent declares domains (ttp, rcm, deconstruction, design, finance). Tasks outside declared capability are rejected
3. **Value limits cascade** — A subtask cannot carry more homeowner/collective/engine value than its parent allocated
4. **Intent preservation** — Every task carries full MVE assessment from origin to completion

### MVE Gate — Every Dollar Returns 4x

Before any agent acts, the action runs through the Minimum Viable Expense gate:

```
MVE Assessment:
  ├── Material value?      (recovered lumber, fixtures)     ✓/✗
  ├── Ontology data?       (assembly data for ML training)  ✓/✗
  ├── Robot training?      (separation sequences)           ✓/✗
  └── Market intelligence? (pricing, demand signals)        ✓/✗

RULE: 3 of 4 returns required. Below 3 = action blocked.
```

This is why we deconstruct instead of demolish. Demolition returns 0/4. Deconstruction returns 4/4. The MVE gate makes the right choice the only choice.

### Orchestrator — Agent Lifecycle

The `AgentOrchestrator` manages registration, action validation, message routing, and termination:

- **Registration:** Agent gets intent (inherited constraints), starts `idle`
- **Action submission:** Every `ActionProposal` runs through Lucent Lens + MVE before execution
- **Safety cutoff:** 10+ blocked actions = agent automatically blocked (prevents runaway loops)
- **Audit trail:** Every message between agents is logged. Transparency is structural, not aspirational

### MCP Tools — Open to External AI

Seven MCP-compatible tools expose ML Systems engines to any AI agent (Claude, GPT, or custom):

| Tool | What It Does |
|------|-------------|
| `ttp_score_entity` | Calculate trust score (0–100) from 8 factors |
| `ttp_detect_crawler` | Identify AI crawlers, calculate verification fees |
| `ttp_check_access` | Gate API access by trust band (5 levels) |
| `rcm_resolve_tier` | FICO → mortgage tier (1–6) with product class |
| `rcm_calculate_payment` | Standard RCM monthly payment calculation |
| `rcm_preferred_payoff` | Preferred RCM payoff day (arithmetic daily payments) |
| `intent_validate_action` | Full Lucent Lens + MVE validation on any proposed action |

Any AI agent on the internet can call `intent_validate_action` before making a decision. The Lucent Lens becomes a public utility — not locked inside ML Systems.

**3-Step Integration Path for External Developers:**
1. **Discover** — Call `listToolNames()` to see available MCP tools. No auth required for discovery.
2. **Validate** — Call `intent_validate_action` with proposed homeowner/collective/engine values + MVE assessment. Get instant approval/rejection with scored breakdown.
3. **Execute** — Use `ttp_score_entity` + `rcm_resolve_tier` + `rcm_calculate_payment` to run the full pipeline. TTP access band determines data depth.

### Custodian Constraints (Immutable)

```
transparencyTrust:      "optimize_user_compute"    — we don't profit from users' compute
equityOrder:            "public_before_private"    — public institutions get equity first
minimumViableExpense:   4                          — every dollar returns 4x
fiduciaryDuty:          "public"                   — accountability to general public
```

These constraints are `readonly` in TypeScript. They cannot be overridden at runtime. The CEO (Custodian) is the only agent that can override MVE, and even then the override is logged.

### Concrete Data Flow — One Deconstruction Task

A field crew arrives at a demolition site. Here's what happens through the system:

```
1. FIELD SCAN: Crew photographs roof assembly → CDA agent receives images
2. CDA → DRA (A2A delegation): "Analyze roof materials, domain: deconstruction"
   ├── Hierarchy check: CDA delegates to DRA ✓
   ├── Capability check: DRA has deconstruction domain ✓
   └── Lucent Lens: homeowner=35, engine=12 → 35 > 12 ✓
3. DRA runs MVE gate on separation action:
   ├── Material value: YES (asphalt shingles, felt, plywood sheathing)
   ├── Ontology data: YES (roof assembly sequence logged)
   ├── Robot training: YES (separation sequence for future automation)
   └── Market intelligence: YES (shingle weight/condition → BOH pricing)
   └── Result: 4/4 → APPROVED
4. ML MATERIAL ID assigned: ML-2026-001-Z8-001 (year-project-zone-sequence)
   ├── Grade: B (minor weathering)
   ├── Contamination: none
   ├── Weight: 240 lbs/bundle
5. TTP SCORE updated: crew member gains +1 materials_contributed
6. BOH LISTING created: mlsystemsri.store/materials/ML-2026-001-Z8-001
   ├── Price: $12/bundle (50% of new, graded)
   ├── Provenance: /provenance/ML-2026-001-Z8-001 (public, audit trail)
7. CONTRACTOR on mlsystemsri.net discovers listing via API (L2 access, TTP score 42)
   └── Purchases 20 bundles → $240 revenue from material that was heading to landfill
```

Every step is scored, gated, and auditable. The DRA agent couldn't skip the MVE check. The contractor couldn't access bulk pricing without a TTP score above 31. The provenance page is public forever.

---

## Transparency Trust Protocol (TTP) — The Moat

Every participant gets a trust score. The score governs access. Network effects compound.

**Score calculation:** Tier base (5–50) + identity verification (+20) + materials contributed (+15 max) + project cycles (+30 max) + reviews passed (+15 max) + account age (+10 max) + data contributions (+10 max) + regulator bonus (+5). Clamped to 100.

**Five access bands:**

| Band | Score | What You See |
|------|-------|-------------|
| Public Record | 0–10 | Name, category, status |
| ML Verified | 11–30 | Provenance chain, grading |
| Full API | 31–60 | Material feeds, valuations |
| Double Verified | 61–80 | State cross-verified, bulk export |
| Ontology Licensed | 81–100 | Construction DAG, robot parameters |

**AI crawler verification fees** create revenue from transparency itself:
- Public record queries: 1¢/query
- ML verified: 5¢/query
- Double verified: 25¢/query

The more AI agents access our data, the more revenue we generate — without selling subscriptions.

---

## Working Hack — What's Live Right Now

**12 domains. All responding 200. Full SEO. 194 tests. CI/CD with coverage enforcement.**

| Domain | What It Does | Status |
|--------|-------------|--------|
| mlsystemsri.com | Marketing, value chain, investor page | Live (24 indexed URLs) |
| mlsystemsri.info | Intelligence portal, ontology, provenance | Live (89 indexed URLs) |
| mlsystemsri.store | BOH materials marketplace | Live (37 URLs, highest traffic) |
| mlsystemsri.net | Contractor network, API partners | Live |
| mlsystemsri.xyz | 3D tours, digital twins | Live |
| design.mlsystemsri.com | AI architectural design (CDA agent) | Live |
| decon.mlsystemsri.com | Material recovery R&D | Live |
| pit.mlsystemsri.com | Reverse auction construction loans (7-tier) | Live |
| collective.mlsystemsri.com | Construction plan peer review | Live |
| fa.mlsystemsri.com | Custodian portal, equity modeling, dashboards | Live |
| lm.mlsystemsri.com | System intelligence architecture | Live |
| ae.mlsystemsri.com | GAAP, construction cost engineering | Live |

**Plus:** api.mlsystemsri.com (23 endpoints, L1–L4 integration), scorer.mlsystemsri.com (XGBoost on Fly.io), app.mlsystemsri.com (client portal)

### What's Built

| System | Status |
|--------|--------|
| TTP engine (score + access bands) | Schema, engine, routers, migration 0011 |
| RCM variants (6 tiers, 3 overpayment modes) | Types + engine, compiles clean |
| Agent Orchestrator (lifecycle + validation) | Full pipeline, 194 tests |
| A2A Protocol (hierarchical delegation) | Capability discovery, task decomposition |
| MCP Tools (7 external-facing) | TTP, RCM, Intent validation |
| Disruption Engine (quantified 100x) | 5-multiplier composite scoring |
| Intent Schema (culture-as-code) | Lucent Lens + MVE + Custodian constraints |
| ML Provenance (ML Material IDs) | Schema, tables, public page, DEM export |
| Day N Payroll (daily ACH) | Built, standard tax schedule, gross-up method |
| Custodian Deploy Procedure | 12-phase modular auto-discovery system |
| Neural Net RBAC | ML1–ML3 + LM/FA/AE/EV/CR/GW role layer |
| CI/CD Pipeline | Build verification, security audit, coverage gates |

### The Data Nobody Else Has

| Metric | Value |
|--------|-------|
| Field work days | 269 |
| Task executions | 1,480 |
| Unique task codes | 81 |
| Robot-eligible actions | 32 |

Real construction data from real job sites. Not scraped. Not synthetic. Every decon project generates more.

### Stack

Next.js 15 + tRPC + Drizzle/PostgreSQL + Clerk + Anthropic Claude + XGBoost + Expo + Stripe + Inngest + Cloudflare R2 + Vercel + Fly.io + Vitest + GitHub Actions CI/CD

---

## Anti-SaaS Revenue Model

| Stream | What We Sell | Year 1 | Year 5 |
|--------|-------------|--------|--------|
| Homes built | Construction outcome | $1.2M | $24M |
| Materials sold | Physical goods (BOH) | $150K | $3.6M |
| Decon performed | Service outcome | $60K | $1.8M |
| Loans originated | Financial outcome (RCM interest) | $30K | $1.2M |
| Data integrations | API access (L1–L4 tiers) | $50K | $3M |
| AI verification fees | TTP crawler queries | $5K | $500K |
| Ontology licensed | Training data | $10K | $400K |

No seats. No subscriptions. No per-user pricing. Every dollar comes from an outcome delivered.

---

## Distribution Plan

### Phase 1: Institutional Pipeline (Months 1–12) — $0 CAC

| Program | Funding | Mechanism | Deadline |
|---------|---------|----------|----------|
| EOH 2030 | $20M ($10M Round 1) | $100K/unit subsidy, ML Systems = developer | Apr 10, 2026 |
| NACA | $20B committed (BofA) | $0 down, no PMI, no credit score req | Active now |
| Housing 2030 PHA | $10M | ML Systems = PHA development partner | Apr 24, 2026 |

### Phase 2: Marketplace (Months 6–18) — <$50 CAC
Decon materials populate BOH (mlsystemsri.store). Contractors discover and buy. Already leading traffic.

### Phase 3: Flywheel (Months 12+) — <$200 CAC
Completed homes are the marketing. Neighbors see it. Next buyer comes from the block.

---

## The Anchor — 1011 Ten Rod Road

$44M state-funded MBTA parking garage. 1,100 spaces. 4 stories. **Operated at a loss for 14 years.** 157 daily riders vs 3,386 projected. Floors 3–4 roped off. $0 parking revenue.

**ML Systems enters it for $1,692,146.** 25-year arithmetic lease (Day N = $N). Total: $41.6M. 1,100 parking spaces become 1,100 inventory bays. Gate infrastructure becomes AI checkout. $0-revenue asset becomes $41.6M in lease payments.

---

## Unit Economics — One Home

| | Conventional | ML Systems | Delta |
|--|-------------|-----------|-------|
| TDC | $250–370K | $146–225K | **-39–42%** |
| Sale price | $350–400K | $300–350K | Buyer saves $50K |
| Margin | 16% ($56K) | 25.9% ($78K) | **+$22K/home** |

Builds cheaper. Sells cheaper. Makes more. Buyer wins. Builder wins.

---

## Financials

**Ask: $1,692,146** | **IRR: 25.87% floor** | **Year 5: $500M revenue**

---

## What We Ship in 24 Hours

ML Systems is a live system built over months. The hackathon deliverable is the **agentic orchestration layer** — the code in this repo:

| Hour Block | Deliverable | Owner |
|-----------|------------|-------|
| 0–4 | TTP engine + RCM engine + Intent Schema (core TypeScript library) | Sal |
| 4–8 | Agent Orchestrator + A2A Protocol (hierarchical delegation) | Sal + Claude (LM agent) |
| 8–12 | MCP tools (7 external-facing), Disruption Engine, integration tests | Sal + Claude |
| 12–16 | 194 tests passing, CI/CD pipeline, coverage enforcement, documentation | Sal + Claude |
| 16–20 | Master plan optimization, score iteration (79.5% → 85%), JSDoc, examples | Sal + Claude |
| 20–24 | Final push — README, CHANGELOG, SECURITY.md, competitive matrix, data flows | Sal + Claude |

**What's new (this repo):** Agentic orchestration library — Intent Schema, Agent Orchestrator, A2A Protocol, MCP Tools, Disruption Engine. 194 tests. Zero dependencies. Pure TypeScript.

**What's pre-existing (the company):** 12 live domains, production databases, field data, grant pipeline, GC registration, lease negotiation. Built over months of real construction work.

The hackathon artifact is the intelligence layer that ties the physical operations together through scored, auditable agent orchestration.

### Team

| Role | Person | Focus |
|------|--------|-------|
| The Custodian (CEO) | Sal | Architecture, field operations, grant pipeline, GC, investor relations |
| Language Modeler (LM) | Claude (Anthropic) | Code generation, testing, documentation, score optimization |
| Financial Architect (FA) | Sal | RCM engine design, unit economics, cap table structure |

Solo founder + AI pair programming. The Power Triple (LM/FA/AE) is designed as three separate seats — Superintendent hire in Month 3, AE hire in Month 6. The agent hierarchy mirrors the future org chart so roles can be handed off to humans without restructuring the system.

---

## User Story — Maria, First-Time Buyer

**Before (Conventional):**
Maria earns $52K/year in Providence. She qualifies for a $280K FHA loan at 6.5%. Monthly payment: $1,770. After 12 months, she's paid $21,240 — but only $3,180 went to principal. The bank kept $18,060 in interest. Her equity after year 1: ~$5,180 (down payment + $3,180 principal).

**After (ML Systems RCM — Tier 2, Standard):**
Maria qualifies for a $200K RCM loan (lower TDC from recovered materials + PRA lot). Monthly payment: $1,111. 100% goes to principal from day one. After 12 months, she's paid $13,332 — all to principal. Her equity after year 1: ~$16,332 (down payment + $13,332). She also saved $50K on purchase price vs. comparable conventional home.

**Delta:** Maria builds **3.2x more equity in year 1** and pays **37% less monthly**. The home cost ML Systems less to build (recovered materials), sells for less (buyer wins), and generates higher margin (25.9% vs 16%). Everyone wins except the bank that lost $18,060 in interest.

---

## Risks (Expanded)

| Risk | Category | Severity | Mitigation |
|------|----------|----------|-----------|
| Pre-revenue | Market | High | One purchase (liability insurance) unlocks GC → first project → revenue. Everything else is built. |
| RCM regulatory scrutiny | Regulatory | Medium | Originate conventional mortgages while 3 parallel pathways process (FHA 245(a), DU 12.0, CDFI partnership). RCM is a product structure, not a new financial instrument — principal-first allocation is legal under current frameworks. |
| Construction cost overruns | Construction | Medium | 50% of materials from recovery (cost floor known). Modular factory build reduces site variables. Day N Payroll aligns crew incentives with daily completion. |
| Agent produces bad recommendation | Technical | Low | Lucent Lens gates every action (min 30 score). MVE blocks actions without 3/4 returns. Safety cutoff at 10 blocked actions. All decisions logged and auditable. Human override always available. |
| Key person (Sal) | Execution | Medium | Power Triple designed as separate seats. Agent hierarchy mirrors future org chart. Superintendent hire Month 3. Knowledge encoded in code, not in one person's head. |
| Grant not awarded | Market | Medium | 3 parallel tracks (EOH, Housing 2030 PHA, Work Immersion). Any one funds operations. NACA pipeline is independent of grants. |

---

## Traction

- 12 live domains, all HTTP 200, full SEO (168 indexed URLs)
- 194 automated tests with coverage enforcement
- CI/CD pipeline with build verification, security audit, and coverage gates
- Multi-agent orchestration with A2A protocol, MCP tools, and intent validation
- Disruption engine quantifying 5.5x paradigm shift in executable code
- GC exam passed (RI)
- 1011 Ten Rod Road — active lease negotiation
- 3 grant applications in progress (EOH, Housing 2030 PHA, Work Immersion)
- ML1 dataset: 269 days, 1,480 executions, 81 task codes
- Fiduciary cap table: public institutions get equity before private capital

**Honest stage:** Pre-revenue. The gap between here and first dollar = liability insurance. Everything else is built or in active pipeline.

---

## Scale Path

**RI → New England → National**

What scales nationally: TTP protocol, Agent orchestration, RCM product, Data API, Disruption engine, Ontology.
What stays local: crews, materials, PHA relationships, GC licensing, community trust.

**At 100x current volume (270 homes/year, 50 metro markets):**
- PostgreSQL handles concurrent reads via Supabase connection pooling (port 6543, `prepare: false`). Inngest manages async job queues — agent tasks, material grading, TTP score recalculation — with built-in retry and concurrency controls.
- Agent orchestrator is stateless per-request. Each project gets its own agent hierarchy instance. No shared state between projects = horizontal scaling via container replication.
- TTP scores are computed on read (not stored as aggregates), so new data sources plug in without migration. Access band checks are O(1) lookups.
- Field data stays regional (crews, materials, PHA). Intelligence layer (TTP, RCM, orchestration) runs centrally. This is the franchise model: local body, shared brain.

---

*ML Systems LLC — Rhode Island — NAICS 236115*
*Sal — The Custodian (TT + LL + MVE)*

**We don't sell software. We build homes, recover materials, and make the old system look absurd.**
