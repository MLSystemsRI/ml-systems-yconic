# ML Systems — Master Plan

## Intent

We replace the construction-mortgage-demolition system with a closed loop that makes the old way look absurd.

**Old system:** Bank takes 18 years of interest before you build equity. Demolition destroys 90% of materials. Contractors operate at 16% margins with zero technology. Three industries, $63 trillion, completely disconnected.

**ML Systems:** 100% of your mortgage payment builds equity from day one. Deconstruction recovers 80–90% of materials. AI scores every decision. One company, one loop: Finance → Deconstruct → Design → Build → Repeat.

**This is not a SaaS product.** We don't sell subscriptions. We build homes, recover materials, and originate mortgages. Revenue comes from outcomes — a home built, a material sold, a loan closed. The software is the nervous system, not the product.

---

## Intent Schema — The Lucent Lens

Every agent, every decision, every line of code inherits this:

```
INTENT: "Glow within to help humans."

HIERARCHY:
  Homeowner Value    ████████████████████████████  0–40 pts   (ALWAYS FIRST)
  Collective Value   ████████████████████████       0–30 pts
  Engine Value       ████████████████████████       0–30 pts
                                              Lucent Score: 0–100

LENSES:
  TT  — Trustee: Fiduciary duty to the public, not shareholders
  LL  — Lucent Lens: Score every decision against the hierarchy
  MVE — Minimum Viable Expense: Every dollar returns 4x or it doesn't get spent

PROTOCOL:
  Transparency Trust Protocol (TTP)
  Score: 0–100 | 5 access bands | credential-gated
  Built: schema + engine + routers + migration 0011
  Every participant, contractor, and lender gets a trust score.
  The score governs what they can access. Network effects compound.
```

This is culture-as-code. The Lucent Lens isn't a mission statement — it's an enforcement mechanism baked into the database. Every AI agent (CDA, TTA, DRA, LPA, MIA) inherits TT + LL + MVE at instantiation. The Intent Schema IS the org chart.

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

---

## The 100x — Why the Old System Is Absurd

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

---

## Working Hack — What's Live Right Now

**12 domains. All responding 200. Full SEO. Cross-domain GA4.**

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

### What's Built (Backend)

| System | Status |
|--------|--------|
| TTP engine (score + access bands) | Schema, engine, routers, migration 0011 |
| RCM variants (6 tiers, 3 overpayment modes) | Types + engine, compiles clean |
| ML Provenance (ML Material IDs) | Schema, tables, public page, DEM export |
| Day N Payroll (daily ACH) | Built, standard tax schedule, gross-up method |
| Custodian Deploy Procedure | 11-phase modular auto-discovery system |
| Neural Net RBAC | ML1–ML3 + LM/FA/AE/EV/CR/GW role layer |

### The Data Nobody Else Has

| Metric | Value |
|--------|-------|
| Field work days | 269 |
| Task executions | 1,480 |
| Unique task codes | 81 |
| Robot-eligible actions | 32 |

This is real construction data from real job sites. Not scraped. Not synthetic. Every decon project generates more. Competitors would need to go swing a hammer for 269 days to start building this.

### Stack

Next.js 15 + tRPC + Drizzle/PostgreSQL + Clerk + Anthropic Claude + XGBoost + Expo + Stripe + Inngest + Cloudflare R2 + Vercel + Fly.io

---

## Distribution Plan

### Phase 1: Institutional Pipeline (Months 1–12) — $0 CAC
Three government programs deliver qualified buyers at zero acquisition cost:

| Program | Funding | Mechanism | Deadline |
|---------|---------|----------|----------|
| EOH 2030 | $20M ($10M Round 1) | $100K/unit subsidy, ML Systems = developer | Apr 10, 2026 |
| NACA | $20B committed (BofA) | $0 down, no PMI, no credit score req | Active now |
| Housing 2030 PHA | $10M | ML Systems = PHA development partner | Apr 24, 2026 |

### Phase 2: Marketplace (Months 6–18) — <$50 CAC
Decon materials populate BOH (mlsystemsri.store). Contractors discover and buy. Already leading traffic across all 5 domains.

### Phase 3: Flywheel (Months 12+) — <$200 CAC
Completed homes are the marketing. Neighbors see it. Next buyer comes from the block.

```
  Grants fund homes → decon creates inventory → contractors buy surplus
       → community sees results → next buyer is organic → flywheel spins
```

### Anti-SaaS Revenue Model

| Stream | What We Sell | Year 1 | Year 5 |
|--------|-------------|--------|--------|
| Homes built | Construction outcome | $1.2M | $24M |
| Materials sold | Physical goods (BOH) | $150K | $3.6M |
| Decon performed | Service outcome | $60K | $1.8M |
| Loans originated | Financial outcome (RCM interest) | $30K | $1.2M |
| Data integrations | API access (L1–L4 tiers) | $50K | $3M |
| Ontology licensed | Training data | $10K | $400K |

No seats. No subscriptions. No per-user pricing. Every dollar comes from an outcome delivered.

---

## The Anchor — 1011 Ten Rod Road

$44M state-funded MBTA parking garage. 1,100 spaces. 4 stories. **Operated at a loss for 14 years.** 157 daily riders vs 3,386 projected. Floors 3–4 roped off. $0 parking revenue. $0 property tax to North Kingstown.

**ML Systems enters it for $1,692,146.** 25-year arithmetic lease (Day N = $N). Total: $41.6M. Operations cover $40M. Investors cover $1.69M entry. 96% infrastructure subsidy.

1,100 parking spaces become 1,100 inventory bays. Gate infrastructure becomes AI checkout. Station lobby becomes BOH pickup desk. $0-revenue asset becomes $41.6M in lease payments.

**Status: Active pursuit. Strong interest from property owner.**

---

## Unit Economics — One Home

| | Conventional | ML Systems | Delta |
|--|-------------|-----------|-------|
| Land | $80–120K | $0–5K (PRA lots) | -$75–115K |
| Demo/Decon | $15–25K (waste) | $0 (self-performed, materials kept) | -$15–25K |
| Materials | $85–120K | $45–70K (50% from recovery) | -$40–50K |
| Module + site | $40–60K | $121–185K (factory module + site) | — |
| Soft costs | $30–45K | $25–35K | -$5–10K |
| **TDC** | **$250–370K** | **$146–225K** | **-39–42%** |
| Sale price | $350–400K | $300–350K | Buyer saves $50K |
| **Margin** | **16% ($56K)** | **25.9% ($78K)** | **+$22K/home** |

Builds cheaper. Sells cheaper. Makes more. Buyer wins. Builder wins.

---

## Financials

**Ask: $1,692,146**

| Use | Amount | Purpose |
|-----|--------|---------|
| Capital assets | $480K | Crane + Brokk robot + liability insurance |
| Platform + tech | $450K | Mobile app, ML3 scorer, API scaling |
| Working capital | $450K | First home, materials, crew |
| Operating reserve | $312K | 18-month runway |

**Projections:**

| Year | Homes | Revenue | Gross Margin | Net Income |
|------|-------|---------|-------------|------------|
| 2026 | 1 | $1.5M | 23% | $120K |
| 2027 | 2 | $3.3M | 23% | $264K |
| 2028 | 4 | $6.0M | 23.3% | $480K |
| 2029 | 8 | $12M | 23.3% | $960K |
| 2030 | 20 | $30M | 23% | $2.4M |
| 2035 | 270 | $500M | 23% | $40M |

**IRR: 25.87% floor.** Daily repayment from day one. Bear $420M / Base $500M / Bull $580M (2035).

---

## Why Now

1. **Fannie Mae DU 12.0** just dropped the 620 FICO floor (2025) — RCM pathway opened
2. **Housing 2030** is a one-time $20M state allocation — window closes April 2026
3. **NACA committed $20B** — largest affordable lending push in history, active now
4. **14 years of stranded asset** — peak political pressure to activate 1011 Ten Rod Road
5. **Construction AI at inflection** — $4.86B → $22.68B by 2032, residential is untouched

All five simultaneously. This window doesn't stay open.

---

## Risks (Honest)

| Risk | Mitigation |
|------|-----------|
| Pre-revenue | One purchase (insurance) unlocks GC → first project → revenue. Everything else is built. |
| Insurance cost | Quotes in hand. Priced into the $480K capital assets line. |
| 1011 TRR falls through | Operations proceed on PRA lots with temp yard. TRR is accelerant, not dependency. |
| RCM regulatory delay | Originate conventional mortgages while 3 parallel pathways (FHA 245(a), DU 12.0, CDFI) process. |
| Key person (Sal) | Power Triple (LM/FA/AE) designed as separate seats. Superintendent hire in Month 3. |
| Grant not awarded | 3 parallel tracks. Any one funds operations. |

---

## Traction

- 12 live domains, all HTTP 200, full SEO (168 indexed URLs)
- GC exam passed (RI)
- Insurance quotes received, ready to bind
- 1011 Ten Rod Road — active lease negotiation
- 3 grant applications in progress (EOH, Housing 2030 PHA, Work Immersion)
- ML1 dataset: 269 days, 1,480 executions, 81 task codes
- mlsystemsri.store leading organic traffic (marketplace demand signal)
- NACA alignment (Providence-Warwick MSA, 30 min from Boston HQ)
- PRA land bank lots available ($0–5K, ARPA-funded)
- URI RISEUP connection (alumni, equity gift structure designed)
- Fiduciary cap table: public institutions get equity before private capital

**Honest stage:** Pre-revenue. The gap between here and first dollar = liability insurance. Everything else is built or in active pipeline.

---

## Scale Path

**RI → New England → National**

| Phase | Timeline | Mechanism |
|-------|----------|----------|
| Rhode Island proof | Years 1–3 | Institutional pipeline, validate unit economics, build ML3 dataset |
| New England | Years 3–5 | NACA national presence + equivalent state programs (MassHousing, CHFA). Replicate: find stranded asset + local PHA + decon pipeline |
| National platform | Years 5–10 | Data API as scaling engine. Ontology licensing. Franchise the closed-loop playbook. Target: 50 metro markets by 2035 |

What scales nationally: TTP protocol, Data API, ML3 model, RCM product, ontology.
What stays local: crews, materials, PHA relationships, GC licensing, community trust.

---

## Impact

| Per Home | Conventional | ML Systems |
|----------|-------------|-----------|
| Materials landfilled | 90%+ | <20% |
| CO2 from new materials | ~50 tons | ~15 tons |
| Construction waste | 8,000 lbs | <1,600 lbs |
| Year-1 equity built | ~$2K | ~$14K |

---

*ML Systems LLC — Rhode Island — NAICS 236115*
*Sal — The Custodian (TT + LL + MVE)*

**We don't sell software. We build homes, recover materials, and make the old system look absurd.**
