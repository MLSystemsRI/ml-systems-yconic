# ML Systems — Master Plan

## Intent

We replace the construction-mortgage-demolition system with a closed loop that makes the old way look absurd.

**The wedge:** One home. One deconstruction. One RCM mortgage. That single transaction proves the loop — recovered materials lower the build cost, principal-first mortgage builds the buyer's equity, and the data from both feeds the next project. Everything else scales from that first closed cycle.

**Old system:** Bank takes 18 years of interest before you build equity. Demolition destroys 90% of materials. Contractors operate at 16% margins with zero technology. Three industries, $63 trillion, completely disconnected.

**ML Systems:** 100% of your mortgage payment builds equity from day one. Deconstruction recovers 80–90% of materials. AI agents score every decision through a value hierarchy that puts homeowners first. One company, one loop: Finance → Deconstruct → Design → Build → Repeat.

**This is not a SaaS product.** We don't sell subscriptions. We build homes, recover materials, and originate mortgages. Revenue comes from outcomes — a home built, a material sold, a loan closed. The software is the nervous system, not the product.

**In one sentence:** ML Systems gives first-time buyers a home that costs less, builds equity faster, and wastes almost nothing — and no combination of existing banks, builders, or demolition contractors can replicate it because doing so would destroy their own business models.

---

## User Story — Maria, First-Time Buyer

**Before (Conventional):**
Maria earns $52K/year in Providence. She qualifies for a $280K FHA loan at 6.5%. Monthly payment: $1,770. After 12 months, she's paid $21,240 — but only $3,180 went to principal. The bank kept $18,060 in interest. Her equity after year 1: ~$5,180 (down payment + $3,180 principal).

**After (ML Systems RCM — Tier 2, Standard):**
Maria qualifies for a $200K RCM loan (lower TDC from recovered materials + PRA lot). Monthly payment: $1,111. 100% goes to principal from day one. After 12 months, she's paid $13,332 — all to principal. Her equity after year 1: ~$16,332 (down payment + $13,332). She also saved $50K on purchase price vs. comparable conventional home.

**Delta:** Maria builds **3.2x more equity in year 1** and pays **37% less monthly**. The home cost ML Systems less to build (recovered materials), sells for less (buyer wins), and generates higher margin (25.9% vs 16%). Everyone wins except the bank that lost $18,060 in interest.

**Addressable population:** Rhode Island has ~11,000 renter households earning $40K–$75K who are mortgage-eligible but priced out of conventional construction. The Providence-Warwick MSA alone has ~8,200. New England expansion (MA, CT, NH) adds ~145,000 equivalent households. Every Maria-equivalent is a closed-loop cycle waiting to happen.

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

**Composite disruption score:** Geometric mean of equity velocity (18x), material recovery (8.5x), cost reduction (1.89x), margin improvement (1.62x), and revenue streams (4x per dollar) = **5.5x paradigm shift** vs. industry baseline. This isn't a slide — it's a function you can call.

### Why the Old System Can't Respond

The construction-mortgage-demolition complex is structurally incapable of adopting this model:

1. **Banks profit from interest** — RCM eliminates it. No bank will voluntarily route 100% to principal.
2. **Demolition contractors destroy materials** — their business model requires waste. Recovery kills their margin.
3. **GCs have no technology** — 16% margins leave zero room for R&D. They can't build what we already shipped.
4. **No data exists** — 269 field days, 1,480 task executions, 81 task codes. Competitors start at zero.

The moat isn't technology. The moat is that fixing one piece requires fixing all three industries simultaneously. We already did. A well-funded startup with $10M could replicate the *code* in 18 months — but they'd still need 269 days of field data, GC registration, PHA relationships, grant pipeline, and a physical deconstruction crew. The code is the nervous system. The body took years to build.

**Why PropTech fast-followers can't acquire their way in:** Opendoor and Offerpad optimize *transactions* on existing homes — they don't build, deconstruct, or originate. Acquiring the RCM product structure is meaningless without the deconstruction pipeline that lowers TDC, the field data that trains the agents, and the GC registration that lets you swing a hammer. The bundle is the moat. No single acquisition gets you the loop.

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

### Core Type Signatures

```typescript
interface ActionProposal {
  agentId: string;
  action: string;
  homeownerValue: number;   // 0–40
  collectiveValue: number;  // 0–30
  engineValue: number;      // 0–30
  mve: MVEAssessment;
}

interface ActionResult {
  approved: boolean;
  lensScore: number;
  mveResult: { passed: boolean; returnCount: number };
  blockedBy: string[];       // which gate rejected
}

// AgentOrchestrator.submitAction(proposal: ActionProposal): ActionResult
// — every agent action passes through this before execution
```

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

**Partner example:** A regional contractor in Warwick with TTP score 45 (Full API band) can build on top of ML Systems: query available recovered materials via `ttp_check_access`, get real-time BOH pricing feeds, run `rcm_calculate_payment` to quote buyers, and validate their own subcontractor actions against the Lucent Lens. They get a technology stack they could never build at 16% margins — and ML Systems gets network data from every transaction.

### Custodian Constraints (Immutable)

```typescript
const CUSTODIAN_CONSTRAINTS = {
  transparencyTrust:      "optimize_user_compute",    // we don't profit from users' compute
  equityOrder:            "public_before_private",    // public institutions get equity first
  minimumViableExpense:   4,                          // every dollar returns 4x
  fiduciaryDuty:          "public",                   // accountability to general public
} as const;  // readonly — cannot be overridden at runtime
```

The CEO (Custodian) is the only agent that can override MVE, and even then the override is logged.

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

**12 domains. All responding 200. Full SEO. 396 tests. CI/CD with coverage enforcement.**

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
| Agent Orchestrator (lifecycle + validation) | Full pipeline, 396 tests |
| A2A Protocol (hierarchical delegation) | Capability discovery, task decomposition |
| MCP Tools (7 external-facing) | TTP, RCM, Intent validation |
| Disruption Engine (quantified 100x) | 5-multiplier composite scoring |
| Intent Schema (culture-as-code) | Lucent Lens + MVE + Custodian constraints |
| ML Provenance (ML Material IDs) | Full engine: grading, contamination, DEM export, valuation |
| Marketplace Engine (BOH) | Listings, orders, revenue → equity integration |
| Closed-Loop Pipeline | Finance→Deconstruct→Design→Build in single executable |
| Field Data Integration | Inspection validation, auto-classification, provenance ingestion |
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

### Observability & Analytics

| System | Coverage | What It Tracks |
|--------|----------|---------------|
| Google Analytics (GA4) | Cross-domain, all 12 domains | Unified property `G-S7L16PQTX9` tracks user journeys across mlsystemsri.com → .store → .info → subdomains. Single funnel visibility from awareness to conversion. |
| Cloudflare Analytics | All domains (DNS + CDN) | HTTP requests, unique visitors, page views, bot traffic, cache hit ratio. 7-day rolling aggregates via API (`CF_API_TOKEN` + zone-level pull). |
| Custodian Deploy System | 12-phase automated audit | Uptime, response time, SEO health (OG/JSON-LD/canonical), security headers, git status, app health — runs on demand, outputs `custodian-report.json`. |
| Google Search Console | All 5 TLDs + subdomains | 168 indexed URLs across domains. mlsystemsri.store leads organic traffic (marketplace demand signal without paid ads). |

**Key traction signal:** mlsystemsri.store (Builder's Open House) generates the most organic search traffic across all domains — contractors are already searching for secondary building materials in RI. This is unpaid demand discovery validating the marketplace thesis before a single ad dollar is spent.

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

## What We Ship — Build Timeline

The hackathon deliverable is the **agentic orchestration layer** — the code in this repo. ML Systems (the company) is pre-existing infrastructure built over months. This repo is what we built during the hackathon window.

### Scope Boundary — What's New vs. What Existed

| Layer | Examples | Built When | In This Repo? |
|-------|---------|-----------|---------------|
| **Hackathon code (from scratch)** | TTP engine, RCM engine, Intent Schema, Agent Orchestrator, A2A Protocol, MCP Tools, Disruption Engine, Provenance engine, Marketplace engine, Closed-Loop Pipeline, Field Data Integration | Hackathon window | **Yes — all new TypeScript, zero dependencies** |
| **Hackathon hardening (finalized)** | 430 tests, CI/CD pipeline, coverage gates, API docs, architecture docs, master plan, examples | Hackathon window (built on top of from-scratch code) | **Yes** |
| **Pre-existing company** | 12 live domains, production databases, 269 field days, grant pipeline, GC registration, lease negotiation | Months of prior work | **No — none of this is in this repo** |

This distinction matters: a judge should evaluate this repo as a standalone artifact. The company context explains *why* the code exists, but the code stands alone — `npm install && npm test` runs 396 tests with zero external dependencies.

### Build Schedule — 5-Day Window

The hackathon timeline is **5 days** with 2 days allocated to error testing, edge-case hardening, and iterative scoring against the YConic rubric.

| Day | Hours | Deliverable | Owner | Category |
|-----|-------|------------|-------|----------|
| **1** | 0–8 | TTP engine (score calc, 8 factors, 5 access bands) + RCM engine (6 tiers, Standard + Preferred) + Intent Schema (Lucent Lens, MVE gate, Custodian constraints) | Sal | **From scratch** |
| **1** | 8–16 | Agent Orchestrator (lifecycle, validation, safety cutoff) + A2A Protocol (hierarchy enforcement, capability gates, value limits, intent preservation) | Sal + Claude | **From scratch** |
| **2** | 0–8 | MCP tools (7 endpoints) + Disruption Engine (5-multiplier composite) + Provenance engine (ML Material IDs, grading, DEM export) + Marketplace engine (listings, orders, revenue) | Sal + Claude | **From scratch** |
| **2** | 8–16 | Integration tests across all engines + unit tests to 278 passing + CI/CD pipeline (typecheck, lint, test, format) + coverage enforcement (80%+ threshold) | Sal + Claude | **Finalized** |
| **3** | 0–16 | Master plan (79.5% → 84%+), API.md (12KB reference), ARCHITECTURE.md (11KB guide), CONTRIBUTING.md, 4 example files, README, CHANGELOG, SECURITY.md | Sal + Claude | **Finalized** |
| **4** | 0–16 | **Error testing day.** Run full CI 10+ times. Fuzz edge cases: negative scores, overflow tiers, malformed proposals, boundary TTP bands. Fix every failure. Re-score against rubric. Tighten weak dimensions. | Sal + Claude | **Hardening** |
| **5** | 0–16 | **Final polish + submission.** Address scanner feedback. Verify all 396 tests green. Final master plan iteration against 12-dimension rubric. Tag v1.0.0. Submit. | Sal + Claude | **Ship** |

### Contingency — If Behind by Day 3

| Priority | Component | Can Drop? | Fallback | Impact |
|----------|----------|-----------|----------|--------|
| **Critical** | TTP + RCM + Intent Schema | No | — | Core demo breaks without these |
| **Critical** | Agent Orchestrator + Lucent Lens | No | — | The differentiator — cannot ship without it |
| **High** | A2A Protocol | Simplify to 2 enforcement layers (hierarchy + capability) | Lose value-limit cascading and intent preservation |
| **High** | Provenance + Marketplace engines | Ship provenance only, drop marketplace | Lose revenue integration, keep material ID story |
| **Medium** | MCP Tools (7) | Ship 3 core (ttp_score, rcm_payment, intent_validate) | Lose 4 convenience tools, keep external agent interface |
| **Medium** | Disruption Engine | Drop entirely | Disruption table in master plan covers narrative |
| **Low** | Integration tests (17) | Drop | 261 unit tests still pass, lose cross-module coverage |
| **Low** | Examples (4 files) | Drop | README quickstart covers basics |
| **Low** | ARCHITECTURE.md / API.md | Defer to Day 5 | README + inline JSDoc sufficient for judges |

**If behind by Day 3:** Drop marketplace engine + 4 convenience MCP tools + examples + architecture doc. This saves ~6 hours. Redirect to error testing on Day 4 with reduced surface area. The demo-critical path remains intact: **Lucent Lens blocks an agent action live → audience sees the gate reject an engine-first proposal → approved action flows through A2A delegation**. Everything else supports that moment.

**If ahead by Day 3:** Add schema visualization, expand competitive matrix with PropTech fast-follower analysis, write integration walkthrough for external developers.

### Team — Who Does What

| Role | Person | Responsibilities | Decision Authority |
|------|--------|-----------------|-------------------|
| **The Custodian (CEO)** | Sal | Architecture decisions, engine design (TTP/RCM), field operations context, grant pipeline, business logic validation, final sign-off on all code | **All** — sole founder, sole decision-maker |
| **Language Modeler (LM)** | Claude (Anthropic) | Code generation, test writing, documentation drafting, score optimization against rubric, edge-case identification | **None** — proposes, Sal approves. Every commit is Sal's decision. |
| **Financial Architect (FA)** | Sal | RCM tier design, unit economics, cap table structure, investor narrative, competitive positioning | **All financial** — numbers come from Sal's field experience |

**How the pairing works in practice:**
1. Sal defines the engine contract (types, interfaces, constraints)
2. Claude generates implementation + tests against those contracts
3. Sal reviews, modifies, and commits — or rejects and re-specifies
4. Claude runs CI, identifies failures, proposes fixes
5. Sal approves fixes or redirects approach

This is not "AI built it." This is a domain expert using AI as a force multiplier — the same way a GC uses a nail gun instead of a hammer. The architecture, business logic, and field knowledge are Sal's. The typing speed is Claude's.

**Scaling the team (post-hackathon):** The Power Triple (LM/FA/AE) is designed as three separate seats. Superintendent hire in Month 3. AE hire in Month 6. The agent hierarchy mirrors the future org chart — roles hand off to humans without restructuring the system. The code Sal writes today becomes the onboarding documentation for the team that runs it tomorrow.

---

## Risks

| Risk | Category | Severity | Mitigation |
|------|----------|----------|-----------|
| Pre-revenue | Market | High | One purchase (liability insurance) unlocks GC → first project → revenue. Everything else is built. |
| RCM regulatory scrutiny | Regulatory | Medium | Originate conventional mortgages while 3 parallel pathways process (FHA 245(a), DU 12.0, CDFI partnership). RCM is a product structure, not a new financial instrument — principal-first allocation is legal under current frameworks. |
| Construction cost overruns | Construction | Medium | 50% of materials from recovery (cost floor known). Modular factory build reduces site variables. Day N Payroll aligns crew incentives with daily completion. |
| Agent produces bad recommendation | Technical | Low | Lucent Lens gates every action (min 30 score). MVE blocks actions without 3/4 returns. Safety cutoff at 10 blocked actions. All decisions logged and auditable. Human override always available. |
| Key person (Sal) | Execution | Medium | Power Triple designed as separate seats. Agent hierarchy mirrors future org chart. Superintendent hire Month 3. Knowledge encoded in code, not in one person's head. |
| Anchor asset (1011 TRR) falls through | Market | Medium | Operations proceed on PRA land bank lots with temporary yard. TRR is an accelerant, not a dependency. Fallback warehouse: commercial lease in Warwick industrial corridor (~$8/sqft, 5,000 sqft = $40K/year). Materials staging works at any scale — TRR just makes it 100x more efficient. |
| Grant not awarded | Market | Medium | 3 parallel tracks (EOH, Housing 2030 PHA, Work Immersion). Any one funds operations. NACA pipeline is independent of grants. |

---

## Traction

- 12 live domains, all HTTP 200, full SEO (168 indexed URLs)
- 194 automated tests with coverage enforcement
- CI/CD pipeline with build verification, security audit, and coverage gates
- Multi-agent orchestration with A2A protocol, MCP tools, and intent validation
- Disruption engine quantifying 5.5x paradigm shift in executable code
- GC exam passed (RI)
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
- TTP scores are computed on read (not stored as aggregates), so new data sources plug in without migration. Access band checks are O(1) lookups. High-frequency field data ingestion (material scans, grading events) flows through Inngest event streams with deduplication — TTP recalculation is eventual-consistent, not blocking. Write-heavy material grading uses Supabase's row-level security with project-scoped partitioning, so concurrent projects never contend on the same rows.
- Field data stays regional (crews, materials, PHA). Intelligence layer (TTP, RCM, orchestration) runs centrally. This is the franchise model: local body, shared brain.

---

## Appendix A — 1011 Ten Rod Road (Physical BOH Location)

$44M state-funded MBTA parking garage (Wickford Junction). 1,100 spaces. 4 stories. **Operated at a loss for 14 years.** 157 daily riders vs 3,386 projected. Floors 3–4 roped off. $0 parking revenue. $0 property tax to North Kingstown.

**This is the physical home of the Builder's Open House (BOH).** The digital marketplace at mlsystemsri.store is already live and generating organic traffic. 1011 Ten Rod Road is where the physical inventory lives — recovered materials graded with ML Material IDs, stored in zone-mapped bays, and picked up by contractors who found them online.

**ML Systems enters it for $1,692,146.** 25-year arithmetic lease (Day N = $N). Total: $41.6M. Operations cover $40M. Investors cover $1.69M entry. 96% infrastructure subsidy.

| Digital (mlsystemsri.store) | Physical (1011 Ten Rod Road) |
|----------------------------|------------------------------|
| Material listings with ML IDs | 1,100 parking bays → inventory bays by zone |
| AI grading + provenance pages | Crew grades materials on intake |
| Online ordering + Stripe checkout | Station lobby → BOH pickup desk |
| Contractor API access (TTP-gated) | Gate infrastructure → AI checkout tracking |
| Organic search traffic (already leading) | Rt 4 highway access, adjacent to Home Depot/Walmart corridor |

The closed loop completes here: deconstruction crews recover materials → materials get ML IDs and grading → stored at TRR by zone → listed on BOH → contractors purchase online or in-person → provenance chain maintained from demo site to new build.

**Status: Active pursuit. Strong interest from property owner.**

This is an accelerant, not a dependency. If it falls through, operations proceed on PRA lots with temporary warehouse (see Risks table).

---

*ML Systems LLC — Rhode Island — NAICS 236115*
*Sal — The Custodian (TT + LL + MVE)*

**We don't sell software. We build homes, recover materials, and make the old system look absurd.**
