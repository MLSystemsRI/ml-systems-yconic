# ML Systems — Master Plan

## 1. Vision Clarity

We replace the construction-mortgage-demolition system with a closed loop: **Finance → Deconstruct → Design → Build → Repeat.**

100% of your mortgage payment builds equity from day one. Deconstruction recovers 80–90% of materials. AI agents score every decision through a value hierarchy that puts homeowners first. Revenue comes from outcomes — a home built, a material sold, a loan closed. The software is the nervous system, not the product.

**In one sentence:** ML Systems gives first-time buyers a home that costs less, builds equity faster, and wastes almost nothing — and no combination of existing banks, builders, or demolition contractors can replicate it because doing so would destroy their own business models.

---

## 2. Problem Definition

Maria earns $52K/year in Providence. Conventional: $280K FHA at 6.5%, $1,770/mo — after 12 months, only $3,180 went to principal. The bank kept $18,060.

With RCM: $200K loan, $1,111/mo, 100% to principal. Year-1 equity: $16,332 vs $5,180. **3.2x more equity, 37% lower payment.**

RI has ~11,000 renter households earning $40K–$75K who are mortgage-eligible but priced out. At 50 homes/year: $665K in year-1 equity that would otherwise flow to banks. 2,500 tons of materials diverted from landfill.

**Lifetime trajectory — Maria at Year 5 and Year 10:**
- **Year 5 (conventional):** $12,800 cumulative principal paid. Equity: ~$15K (still mostly down payment + appreciation). Monthly payment unchanged at $1,770.
- **Year 5 (RCM):** $66,660 cumulative principal paid (100% of every payment). Equity: ~$72K including material recovery credits. Remaining balance: $133K on a $200K loan. Maria is 33% paid off in 5 years vs 5% conventional.
- **Year 10 (conventional):** $32,400 principal. Still underwater on total interest paid vs principal.
- **Year 10 (RCM):** $133,320 principal paid. Balance: ~$67K. Maria is 67% paid off — a position conventional borrowers don't reach until year 22. The generational impact: Maria's children inherit a home with 4x more equity than their conventional-mortgage neighbors.

---

## 3. Innovation

No existing mortgage product varies allocation by credit tier. RCM does — 6 tiers, Standard (monthly, 3 overpayment modes) and Preferred (daily arithmetic payments, 1–3 concurrent streams). The `disruption/engine.ts` computes a composite from five multipliers:

| Metric | Value |
|--------|-------|
| Equity velocity | 18x faster |
| Material recovery | 9x vs demolition |
| Cost reduction | 39–42% lower TDC |
| Margin improvement | 25.9% vs 16% industry |
| Revenue per dollar | 4x (MVE gate) |

**Composite disruption score: 5.5x** — a callable function, not a slide.

**RCM without CDFI:** In jurisdictions where no CDFI partner exists, RCM originates as a conventional mortgage with a non-standard amortization schedule — legal under existing frameworks. The borrower signs a supplemental rider directing 100% of payment to principal; deferred interest is disclosed per TILA §1026.37–38. No new instrument class required. The CDFI path is a *speed advantage* (CRA credit incentivizes bank cooperation), not a prerequisite.

---

## 4. Technical Depth

**Core engine logic has zero runtime dependencies** — pure TypeScript functions with no imports from Clerk, Stripe, Inngest, or Claude. Those services exist in the production platform (authentication, payments, queuing, AI analysis) but the engines in this repo are self-contained: `npm install && npm test` runs 482 tests without any external service running.

**Engines built:** TTP · RCM · Intent Schema · Agent Orchestrator · A2A Protocol · 10 MCP Tools · Disruption Engine · Provenance · Marketplace · Closed-Loop Pipeline · Field Data Integration · CI/CD

**TTP Score — Data Model & Algorithm:**

```typescript
// 8-factor weighted scoring with per-factor caps
interface TransparencyFactors {
  tier: "free" | "starter" | "pro" | "enterprise";  // base: 5/15/30/50
  identityVerified: boolean;                          // +20
  materialsContributed: number;                       // +1/ea, cap 15
  cyclesCompleted: number;                            // +10/ea, cap 30
  reviewsPassed: number;                              // +5/ea, cap 15
  accountAgeDays: number;                             // linear ramp to 365d, cap 10
  isRegulator: boolean;                               // +5
  dataContributions: number;                          // +0.5/ea, cap 10
}
// Score = sum(factors) clamped [0, 100] → maps to AccessBand
// Negative inputs clamped to 0 (defensive — tested)
```

```sql
-- TTP migration 0011
ALTER TABLE users ADD COLUMN ttp_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN ttp_band TEXT DEFAULT 'public_record';
ALTER TABLE users ADD COLUMN ttp_factors JSONB DEFAULT '{}';

-- Provenance table
CREATE TABLE material_provenance (
  ml_id TEXT NOT NULL UNIQUE,        -- ML-2026-PRV001-Z3-042
  grade TEXT NOT NULL,                -- A/B/C/D/salvage (5-factor weighted)
  contamination TEXT DEFAULT 'clean', -- clean/suspected/confirmed/remediated
  structural INTEGER,                 -- 0-100, 40% of grade
  surface INTEGER,                    -- 0-100, 30% of grade
  moisture INTEGER,                   -- 0-100, 15% of grade
  load_tested BOOLEAN DEFAULT false,  -- 10% of grade
  age_years INTEGER,                  -- 5% of grade
  audit_log JSONB DEFAULT '[]'
);
```

**RCM Payment — Core Algorithm:**

```typescript
// Standard amortization, but 100% of M goes to principal. Interest deferred.
function rcmMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / termMonths;
  const r = annualRate / 12;
  const factor = Math.pow(1 + r, termMonths);
  return (principal * r * factor) / (factor - 1);
}
// Equity = max(0, propertyValue) - max(0, principalBalance) + max(0, materialRecoveryValue)
```

**Stack:** Next.js 15, tRPC, Drizzle/PostgreSQL, Clerk, Claude, XGBoost, Expo, Stripe, Inngest, Vitest, GitHub Actions

---

## 5. Differentiation

The moat is that fixing one piece requires fixing all three industries simultaneously.

- **Banks profit from interest** — RCM eliminates it
- **Demolition contractors destroy materials** — recovery kills their margin
- **GCs have no technology** — 16% margins leave zero R&D budget
- **No data exists** — 269 field days, 1,480 task executions, 81 task codes

**Replication cost:** GC registration (6 months), PHA relationships (12–18 months), field data (9 months at 30 tasks/day), grant pipeline (6 months, deadline-locked), crew training (3 months). **Total: 18–24 months + ~$500K before writing code.** A competitor starting today can't ship before Q1 2028.

PropTech fast-followers (Opendoor, Offerpad) optimize *transactions* — they don't build, deconstruct, or originate. The bundle is the moat.

**Nonprofit replication risk:** Enterprise Community Partners or Habitat for Humanity aren't constrained by profit margin destruction — but they're constrained by mission scope. Habitat builds with volunteer labor and donated materials (no grading, no provenance, no data). Enterprise funds developers but doesn't originate, build, or deconstruct. Replicating the closed loop requires a nonprofit to simultaneously become a GC, mortgage originator, deconstruction operator, and data company — four regulated activities outside their core competency. The structural barrier isn't profit protection; it's operational complexity across four licensed domains.

---

## 6. Market Awareness

| Vertical | Closest Analog | Why ML Systems Wins |
|----------|---------------|-------------------|
| Modular | ICON (3D-printed, $200K+) | We recover materials at near-zero, build at $146K–$225K |
| Alt Mortgage | CMG All-In-One | CMG rebates interest on deposits. RCM eliminates it entirely |
| Recovery | Habitat ReStores | Donation-based, no grading. We have ML Material IDs + AI grading + marketplace |
| GSE | HomeReady / Home Possible | They reduce down payment. We fix the *structure* — Maria still loses $18K/yr-1 interest with HomeReady |

**RI has ZERO shingle recyclers.** ~45K–50K tons/year going to landfill. Category creation.

**GSE adoption response:** If Fannie/Freddie adopt RCM-like principal-first structures, that's *validation*, not competition. GSEs standardize — they don't originate, build, or deconstruct. ML Systems would originate RCM loans *through* GSE-conforming channels, the same way any lender sells to Fannie today. GSE adoption expands the market (secondary market liquidity for RCM loans) while ML Systems retains the closed-loop advantage: recovered materials + provenance data + construction margin. The mortgage product is one piece of the loop, not the whole business.

---

## 7. Ecosystem Thinking

Every agent inherits the Lucent Lens — a scoring function, not a mission statement:

```
Homeowner Value  0–40 pts  (ALWAYS FIRST)
Collective Value 0–30 pts
Engine Value     0–30 pts
RULE: Engine can NEVER exceed homeowner. Min 30 to execute.
```

MVE gate: every dollar must return 4x (material value, ontology data, robot training, market intelligence). 3/4 required. This is why we deconstruct instead of demolish — demolition returns 0/4.

10 MCP tools expose engines to any external AI agent. The Lucent Lens becomes a public utility.

**Developer onboarding (3 steps, no auth for discovery):**
1. `listToolNames()` → see all 10 MCP tools. No API key needed.
2. `intent_validate_action({ homeownerValue: 30, collectiveValue: 20, engineValue: 10, ... })` → instant approval/rejection with scored breakdown. Validates your agent's intent before you build anything.
3. Use `ttp_score_entity` + `rcm_calculate_payment` + `provenance_grade_material` to run the full pipeline. TTP access band governs data depth — higher trust = richer responses. **API guarantees:** all tools return `{ success, result, error, executionMs }`. Errors are structured, never thrown. Idempotent. No side effects.

12 live domains, 168 indexed URLs, cross-domain GA4 analytics. mlsystemsri.store leads organic traffic — unpaid demand validation.

---

## 8. Scalability Design

**RI → New England → National.** Intelligence layer (TTP, RCM, orchestration) runs centrally. Field operations stay local. Franchise model: local body, shared brain.

At 100x volume (270 homes/year, 50 markets): PostgreSQL + Supabase pooling handles reads. Inngest manages async queues. Agent orchestrator is stateless per-request — horizontal scaling via container replication. TTP scores computed on read (no stored aggregates). Write-heavy grading uses project-scoped partitioning.

RCM regulatory scaling: state lender license ($1K–$5K, 60–90 days each). CDFI partner origination while licenses process. At 50 markets, national NMLS license replaces per-state filings. `resolveTier()` is jurisdiction-agnostic.

**Lucent Lens at franchise scale:** Third-party franchisees control field ops but not the scoring engine. Every material grading event, every agent action, every provenance record flows through the central Lucent Lens before it's committed. A franchisee who grades material dishonestly triggers an audit flag when their grading distribution deviates from the XGBoost baseline (trained on 269 days of verified field data). TTP scores are per-entity — a franchisee's score drops if their data is inconsistent, reducing their access band and API depth. The enforcement is economic: low trust = less data = less business. The Lens doesn't require trust; it measures it.

---

## 9. Feasibility

| | Conventional | ML Systems | Delta |
|--|-------------|-----------|-------|
| TDC | $250–370K | $146–225K | -39–42% |
| Sale price | $350–400K | $300–350K | Buyer saves $50K |
| Margin | 16% | 25.9% | +$22K/home |

**Distribution (zero CAC):** EOH 2030 ($20M, Apr 10), NACA ($20B committed), Housing 2030 PHA ($10M, Apr 24), Work Immersion (75% wage reimbursement).

**Revenue model (anti-SaaS):** Homes built, materials sold, decon performed, loans originated, data integrations, AI verification fees, ontology licensing. No seats. No subscriptions.

**Ask: $1,692,146 | IRR: 25.87% floor | Year 5: $500M revenue**

**Scope clarity — what's hackathon vs pre-existing:**

| Layer | Examples | Built When |
|-------|---------|-----------|
| **Hackathon code** | TTP engine, RCM engine, Intent Schema, Agent Orchestrator, A2A Protocol, MCP Tools, Disruption Engine, Provenance engine, Marketplace engine, all 482 tests, CI/CD | This week — all new TypeScript in this repo |
| **Pre-existing company** | 12 live domains, databases, 269 field days, grant pipeline, GC registration, lease negotiation | Months of prior work — NOT in this repo |

This repo is a standalone artifact. `npm install && npm test` proves it. The company context explains *why* the code exists, but judges should evaluate the code on its own.

---

## 10. Team Execution Plan

| Role | Person | Authority |
|------|--------|-----------|
| The Custodian (CEO) | Sal | All — sole founder, architecture, field ops, business logic |
| Language Modeler (LM) | Claude | None — proposes, Sal approves every commit |
| Financial Architect (FA) | Sal | All financial — numbers from field experience |

**5-day build with hour-by-hour hackathon window:**

| Hour | Deliverable | Go/No-Go |
|------|------------|----------|
| 0–4 | TTP engine (score calc, 8 factors, 5 bands) + unit tests | TTP passes typecheck |
| 4–8 | RCM engine (6 tiers, payment calc, equity) + tests | RCM + TTP both green |
| 8–12 | Intent Schema (Lucent Lens, MVE gate) + Agent Orchestrator | Lens blocks a bad proposal in test |
| 12–16 | A2A Protocol (hierarchy, capability gates, value cascading) | Full orchestrator pipeline green |
| 16–20 | MCP tools (10 endpoints) + Provenance engine | `npm test` >200 passing |
| 20–24 | Disruption Engine + Marketplace + integration tests + CI | `npm run ci` green (typecheck + lint + test) |
| 24–32 | Docs (README, API.md, ARCHITECTURE.md) + master plan | Master plan ≥80% on scanner |
| 32–40 | **Error testing.** Fuzz edge cases, negative inputs, boundary bands. Fix every failure. | 480+ tests, 0 failures |
| 40–48 | **Final hardening.** Address scanner feedback, tag v1.0.0, submit. | All dimensions ≥85% |

**Contingency:** If behind at hour 20, drop marketplace + 4 convenience MCP tools + examples (-6 hrs). Demo-critical path stays intact: Lucent Lens blocks engine-first proposal → A2A delegates approved action → MCP tools expose it externally.

**Post-hackathon:** Superintendent hire Month 3, AE hire Month 6. Agent hierarchy mirrors future org chart — roles hand off to humans without restructuring.

---

## 11. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Pre-revenue | One purchase (liability insurance) unlocks GC → first project → revenue |
| RCM regulatory | Originate conventional while 3 pathways process (FHA 245(a), DU 12.0, CDFI). RESPA/TILA compliant — deferred interest disclosed on LE/CD. RI DBR review Phase 1. |
| Cost overruns | 50% materials from recovery (known cost floor). Day N Payroll aligns crew incentives. |
| Bad agent recommendation | Lucent Lens min-30 gate + MVE 3/4 + safety cutoff at 10 blocks + full audit log |
| Key person | Power Triple = 3 separate seats. Knowledge encoded in code, not one head. |
| Anchor asset falls through | Operations proceed on PRA lots. TRR is accelerant, not dependency. |
| Grants not awarded | 3 parallel tracks + NACA independent of grants |
| Field data bias | 269-day dataset from RI residential sites may contain systematic bias in task coding (e.g., overrepresentation of wood-frame assemblies, underrepresentation of masonry/steel). Mitigation: XGBoost grading model uses material-level features (structural integrity, moisture, surface condition), not assembly-type features. Grading is physics-based, not construction-type-dependent. As geographic expansion adds masonry/steel data, model retrains on expanded corpus. RI bias is a *cold start limitation*, not a structural flaw — and the model degrades gracefully (defaults to conservative grading when confidence is low). |

---

## 12. Working Hack

**12 domains, all HTTP 200. 482 tests. CI/CD. `npm install && npm test`.**

| System | Status |
|--------|--------|
| TTP engine | Schema, engine, routers, migration 0011 |
| RCM variants | 6 tiers, types + engine, compiles clean |
| Agent Orchestrator | Full pipeline, 482 tests |
| A2A Protocol | Hierarchy, capability, value cascading |
| MCP Tools (10) | TTP, RCM, Intent, Provenance, Equity Sim |
| ML Provenance | Grading, contamination, DEM export, valuation |
| Disruption Engine | 5-multiplier composite scoring |
| Closed-Loop Pipeline | Finance→Deconstruct→Design→Build |
| Field Data Integration | Inspection validation, auto-classification, provenance ingestion |
| Shared Zones | 15 material categories → 10 zones, cross-module routing |

**Field data:** 269 days, 1,480 executions, 81 task codes, 32 robot-eligible actions. Not scraped. Not synthetic.

**Honest stage:** Pre-revenue. Gap to first dollar = liability insurance. Everything else is built.

---

*ML Systems LLC — Rhode Island — NAICS 236115*
*Sal — The Custodian (TT + LL + MVE)*

**We don't sell software. We build homes, recover materials, and make the old system look absurd.**
