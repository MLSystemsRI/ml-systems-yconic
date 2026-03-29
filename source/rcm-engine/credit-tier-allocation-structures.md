# Credit Score Tiers & Credit-Tiered Allocation Structures in Mortgage Lending

> Deep research compiled 2026-03-19. All numbers sourced from federal agencies, GSEs, and industry data.

---

## 1. Standard Credit Score Tiers in Mortgage Lending

### FICO Score Ranges (Industry Standard)

| Tier | FICO Range | Industry Label |
|------|-----------|----------------|
| Exceptional | 800–850 | Super-prime |
| Very Good | 740–799 | Prime |
| Good | 670–739 | Near-prime |
| Fair | 580–669 | Subprime |
| Poor | 300–579 | Deep subprime |

### Minimum Score Requirements by Loan Product (as of 2026)

| Loan Product | Minimum FICO | Notes |
|-------------|-------------|-------|
| **Fannie Mae (Conventional)** | No hard floor (as of Nov 16, 2025) | Previously 620. DU 12.0 now uses comprehensive risk analysis. Loans below 620 may qualify if compensating factors are strong. |
| **Freddie Mac (Conventional)** | No hard floor (2025) | Previously 620/660 depending on property type. Similar shift to holistic risk assessment. |
| **FHA** | 500 (with 10% down) / 580 (with 3.5% down) | Unchanged. The 580 threshold is the key breakpoint for low-down-payment access. |
| **VA** | No official minimum | VA sets no score floor. Individual lenders typically overlay 620, some go to 580 with compensating factors. A few will review 500–550. |
| **USDA** | 640 (GUS automated) / no floor (manual) | 640 for automated underwriting; manual UW has no hard floor but requires compensating factors. |

### Critical 2025–2026 Shift: Fannie Mae DU 12.0

Effective November 16, 2025, Fannie Mae eliminated its hard 620 minimum credit score requirement for loans processed through Desktop Underwriter (DU 12.0). This is the most significant conventional lending threshold change in over a decade.

**What changed:**
- DU now performs a "comprehensive analysis of risk factors" — credit score becomes one input among many
- Borrowers in the 580–619 FICO band may now access conventional financing (previously FHA-only territory)
- Non-traditional credit histories (rent, utilities via VantageScore 4.0 trended data) can substitute

**What did NOT change:**
- Manually underwritten loans still reference the Eligibility Matrix (credit score + LTV + reserves + DTI grid)
- Lender overlays still exist — most lenders still require 620+ regardless of what DU allows
- Credit score still heavily influences LLPAs (pricing), even if it no longer gates eligibility

### New Credit Score Models

FHFA now permits lenders to choose between:
- **Classic FICO** (traditional)
- **VantageScore 4.0** (includes trended data, rent/utility payment history)
- **FICO 10T** (forthcoming integration)

VantageScore 4.0 can score ~5 million additional Americans who are "credit invisible" under classic FICO.

---

## 2. How Credit Tiers Affect Mortgage Terms

### Interest Rate Spreads by FICO Tier

Based on myFICO/Curinos data (February 2026, 30-year fixed, national averages):

| FICO Score | Approximate APR | Spread vs. 780+ |
|-----------|----------------|-----------------|
| 780+ | ~6.41% | — (baseline) |
| 760–779 | ~6.50% | +9 bps |
| 740–759 | ~6.55% | +14 bps |
| 720–739 | ~6.65% | +24 bps |
| 700–719 | ~6.75% | +34 bps |
| 680–699 | ~6.90% | +49 bps |
| 660–679 | ~7.05% | +64 bps |
| 640–659 | ~7.15% | +74 bps |
| 620–639 | ~7.30%+ | +89+ bps |

**Key finding:** The spread between an 800 FICO and a 680 FICO is approximately 50–75 basis points (0.50%–0.75%). On a $300,000 loan, improving from 620 to 760+ saves approximately $156/month and $56,103 in total interest over 30 years.

### PMI (Private Mortgage Insurance) Rates by Credit Score and LTV

PMI is required when LTV exceeds 80% on conventional loans. Rates vary dramatically by credit tier:

| FICO Score | Annual PMI Rate (as % of loan) |
|-----------|-------------------------------|
| 760+ | 0.46%–0.65% |
| 740–759 | 0.55%–0.75% |
| 720–739 | 0.65%–0.90% |
| 700–719 | 0.80%–1.05% |
| 680–699 | 0.95%–1.20% |
| 660–679 | 1.10%–1.35% |
| 620–659 | 1.25%–1.50% |

PMI by LTV (approximate midpoint across scores):
- 95.01–100% LTV: ~1.03%
- 90.01–95% LTV: ~0.875%
- 85.01–90% LTV: ~0.625%
- 80.01–85% LTV: ~0.375%

**Bottom line:** A 620-FICO borrower at 95% LTV can pay 3x the PMI rate of a 760-FICO borrower at 85% LTV. PMI alone can add $200–$400/month to housing cost for lower-tier borrowers.

### DTI (Debt-to-Income) Limits by Underwriting Method

| Method | Standard Max DTI | Extended Max DTI | Conditions |
|--------|-----------------|-----------------|------------|
| DU (automated) | 50% | 50% | Strong credit + reserves can push through |
| Manual UW | 36% | 45% | Must meet credit score + reserve requirements per Eligibility Matrix |
| FHA | 43% | 50%+ | With compensating factors (residual income, reserves) |
| VA | No hard cap | Uses residual income test | Residual income is the gating factor, not DTI ratio |

For manually underwritten conventional loans, DTI can extend from 36% to 45% only if borrowers meet specific credit score AND reserve thresholds from the Fannie Mae Eligibility Matrix.

### Reserve Requirements

Reserves are measured in months of total housing payment (PITIA). Requirements scale with risk:

| Scenario | Typical Reserve Requirement |
|---------|---------------------------|
| Primary residence, strong credit, low LTV | 0 months |
| Primary residence, moderate credit or high LTV | 2 months |
| Second home | 2–6 months |
| Investment property | 6 months |
| Multiple financed properties | 6+ months per property |
| Manual UW with credit score < 680 | 6+ months |

---

## 3. Risk-Based Pricing: Loan-Level Price Adjustments (LLPAs)

### What LLPAs Are

LLPAs are upfront fees (expressed as a percentage of loan amount) that Fannie Mae and Freddie Mac charge lenders based on loan risk characteristics. These fees are passed to borrowers as either:
- A higher interest rate (most common — the fee is converted to rate)
- Upfront points at closing
- Some combination

LLPAs are **cumulative** — multiple adjustments can stack (credit score + LTV + cash-out + condo + investment property, etc.).

### LLPA Credit Score / LTV Grid (Purchase Loans, Terms > 15 Years)

Current Fannie Mae matrix (effective 01/28/2026). Values are percentage of loan amount:

| Credit Score | ≤60% LTV | 60.01–70% | 70.01–75% | 75.01–80% | 80.01–85% | 85.01–90% | 90.01–95% | >95% |
|-------------|----------|-----------|-----------|-----------|-----------|-----------|-----------|------|
| **≥ 780** | 0.000% | 0.000% | 0.000% | 0.375% | 0.375% | 0.250% | 0.250% | 0.250% |
| **760–779** | 0.000% | 0.000% | 0.000% | 0.625% | 0.625% | 0.500% | 0.500% | 0.500% |
| **740–759** | 0.250% | 0.250% | 0.250% | 0.875% | 1.000% | 0.750% | 0.625% | 0.625% |
| **720–739** | 0.500% | 0.500% | 0.500% | 1.250% | 1.250% | 1.000% | 0.875% | 0.875% |
| **700–719** | 0.500% | 0.750% | 0.750% | 1.375% | 1.500% | 1.250% | 1.125% | 1.125% |
| **680–699** | 0.500% | 0.750% | 1.000% | 1.500% | 1.625% | 1.500% | 1.375% | 1.375% |
| **660–679** | 0.750% | 1.000% | 1.250% | 1.750% | 2.000% | 1.750% | 1.625% | 1.625% |
| **640–659** | 1.000% | 1.250% | 1.500% | 2.000% | 2.250% | 2.000% | 1.750% | 1.750% |
| **620–639** | 1.250% | 1.500% | 1.750% | 2.250% | 2.500% | 2.250% | 2.000% | 2.000% |

### How to Read the Grid

**Example:** A borrower with a 659 FICO buying a home at 95% LTV pays a 1.750% LLPA fee. On a $300,000 loan, that is $5,250 added to their cost — either as upfront points or converted to ~0.44% higher rate (using the rough 4:1 conversion of points to rate). A 780+ borrower at the same LTV pays only 0.250% ($750). The difference: **$4,500 in upfront cost or ~37 bps in rate.**

### Additional LLPA Categories (Cumulative)

These stack on top of the credit/LTV adjustment:

| Feature | LLPA |
|---------|------|
| Cash-out refinance | 0.375%–4.125% (varies by credit/LTV) |
| Investment property | 1.125%–3.875% |
| Second home | 0.125%–4.125% |
| Condo (LTV > 75%) | 0.500%–0.750% |
| Manufactured housing | 0.500%–1.000% |
| 2-unit property | 1.000% |
| 3-4 unit property | 1.000% |
| DTI > 40% (new in 2023) | 0.250%–0.375% |
| Subordinate financing | 0.125%–0.250% |

### Key 2023 Matrix Redesign Changes

The May 1, 2023 LLPA overhaul was significant:
- Best pricing threshold moved from 740 to **780**
- New credit score tiers added: 760–779 (previously lumped with 740+)
- Fees for scores below 680 were **reduced** (counterintuitive but intentional — cross-subsidy)
- Fees for scores 720–779 were **increased** slightly
- New DTI-based LLPA introduced (>40% DTI adds 0.250%–0.375%)
- Cash-out refinance fees increased substantially

---

## 4. Alternative & Creative Debt Structures in Housing Finance

### Do Any Existing Models Vary Principal/Interest Allocation by Credit Tier?

**Short answer: No standard mortgage product allocates principal vs. interest differently based on borrower credit score.** All conventional amortization follows the same math — the amortization schedule is a function of rate, term, and balance. Credit score affects the RATE (and thus the ratio), but not the allocation formula itself.

However, several structures come close or achieve similar outcomes through different mechanisms:

### 4a. Flex Modification Program (Fannie Mae/Freddie Mac)

For borrowers in distress, the Flex Modification restructures the loan to achieve a **20% principal and interest payment reduction** through a sequence of steps:
1. Capitalize eligible arrearages
2. Determine a modified fixed interest rate
3. Extend the remaining loan term (up to 40 years)
4. **Forbear a portion of the principal balance** (non-interest-bearing, deferred)

The forbearance step is notable: a portion of principal is set aside (not forgiven) and does not accrue interest. This effectively creates a split-allocation structure — part of the balance accrues interest, part does not.

### 4b. Shared Appreciation Mortgages (SAMs)

In SAMs, a third party provides down payment assistance (often 20–40% of purchase price) in exchange for a share of future appreciation. The borrower makes NO payments on the assistance portion — not even interest — until sale, refinance, or maturity.

**Active programs (2025–2026):**

| Program | Assistance Amount | Repayment Structure |
|---------|------------------|-------------------|
| **California Dream For All** | Up to 20% of purchase price (max $150K) | Repay original amount + 20% of appreciation (15% for ≤80% AMI) |
| **Homium HSAM** | Up to 40% of purchase price | Repay same % of appreciation as assistance received |
| **Michigan/Detroit Pilot** | Varies | State housing authority-backed, shared appreciation |

**Key structural insight:** SAMs effectively create a **zero-interest, equity-linked subordinate lien**. The borrower's first mortgage is smaller (better LTV, no PMI), and the appreciation share functions as deferred interest paid only on exit.

### 4c. Habitat for Humanity — Zero-Interest Mortgage

Habitat provides 30-year, **zero-interest** mortgages. 100% of every payment goes to principal. This is the only mainstream model where payment allocation is fundamentally different — there is no interest component at all.

- Monthly payments capped at 30% of household income
- Sweat equity required (construction hours)
- Habitat pays for construction through fundraising; mortgage repayments fund future builds
- Not credit-score-gated (holistic qualification)

### 4d. NACA — Below-Market-Rate to Near-Zero Mortgage

NACA (Neighborhood Assistance Corporation of America) offers:
- **No down payment, no closing costs, no fees, no PMI**
- **No minimum credit score**
- Below-market interest rates with option to **permanently buy down to near 0%**
- 75,000+ successful homebuyers with 0.01% foreclosure rate

NACA's model inverts the standard credit-tier pricing: instead of penalizing lower scores with higher rates, it uses counseling and financial preparation as the qualification mechanism.

---

## 5. Graduated & Arithmetic Payment Structures

### 5a. Graduated Payment Mortgage (GPM) — FHA Section 245(a)

GPMs are fixed-rate FHA loans where monthly payments start below the fully amortizing level and increase on a predetermined schedule.

**GPM Plans:**

| Plan | Annual Increase | Graduation Period | Negative Amortization? |
|------|----------------|-------------------|----------------------|
| Plan I | 2.5% per year | 5 years | Yes, in early years |
| Plan II | 5.0% per year | 5 years | Yes, more significant |
| Plan III | 7.5% per year | 5 years | Yes, most significant |
| Plan IV | 2.0% per year | 10 years | Yes |
| Plan V | 3.0% per year | 10 years | Yes |

**How it works:** In years 1–5 (or 1–10), payments are below the interest-only amount, so unpaid interest is added to the loan balance (negative amortization). After the graduation period, payments level off at an amount sufficient to fully amortize the inflated balance over the remaining term.

**Regulations:**
- Authorized under National Housing Act, Section 245(a)
- Must be owner-occupied primary residence
- Higher MIP (mortgage insurance premium) due to negative amortization risk
- Maximum LTV is lower than standard FHA (varies by plan)
- VA eliminated GPMs in 2019; FHA still offers them

**Arithmetic pattern:** The increase is a fixed percentage of the previous year's payment. If Year 1 = $1,000 and the plan is 5%/year for 5 years:
- Year 1: $1,000
- Year 2: $1,050
- Year 3: $1,102.50
- Year 4: $1,157.63
- Year 5: $1,215.51
- Year 6–30: $1,276.28 (level for remaining 25 years)

### 5b. Growing Equity Mortgage (GEM)

GEMs are fixed-rate mortgages where payments increase annually, but — critically — **all increases go directly to principal reduction**.

**GEM Plans:**

| Feature | Structure |
|---------|----------|
| Annual payment increase | 1%, 2%, 3%, 4%, or 5% per year |
| Increase allocation | 100% to additional principal |
| Interest rate | Fixed, set at origination |
| Negative amortization | None (payments always cover full interest + additional principal) |
| Typical payoff | 15–20 years on a 30-year note (due to accelerated principal) |

**Key distinction from GPM:** GEMs never have negative amortization. The initial payment is fully amortizing; increases accelerate equity buildup. A 3%/year GEM on a 30-year note typically pays off in ~16 years.

**Regulatory status:**
- FHA Section 245(a) authorized
- Ginnie Mae securitization: Chapter 28 of MBS Guide covers GEM pools
- VA eliminated GEMs in 2019
- Available but uncommon — most borrowers prefer to voluntarily prepay rather than commit to mandatory increases

### 5c. Relevance to Credit-Tiered Allocation

The GPM and GEM structures demonstrate that **payment allocation between principal and interest can be deliberately manipulated** within regulatory frameworks:

- **GPMs** defer principal paydown (and even allow negative amortization) in early years — a form of interest-first allocation
- **GEMs** accelerate principal paydown — a form of principal-first allocation
- Both are FHA-authorized, Ginnie Mae-securitizable, and have established regulatory precedent

**No existing product varies the GPM/GEM graduation rate by credit tier.** But the regulatory framework exists for a product that could.

---

## 6. Community Development & Affordable Housing Loan Structures

### 6a. CDFI Lending Models

Community Development Financial Institutions serve underserved markets with flexible structures:

**Four CDFI types:**
1. Community development banks
2. Community development credit unions
3. Community development loan funds
4. Community development venture capital funds

**Key structural tools CDFIs deploy:**
- Loan loss reserves (pooled risk absorption)
- Revolving loan funds (repayments fund new loans)
- Risk-sharing loans (CDFI absorbs first-loss position)
- Loan guarantees (credit enhancement for conventional lenders)
- Bridge financing (short-term capital while permanent funding closes)
- Below-market interest rates (subsidized by CDFI Fund grants and program-related investments)

**Capital Magnet Fund (CMF):** Federal program under CDFI Fund that provides grants to CDFIs and nonprofits to create affordable housing financing tools. CMF awards can be used for loan loss reserves, revolving loan funds, and risk-sharing structures.

### 6b. Shared Equity Models

**Community Land Trusts (CLTs):**
- CLT retains ownership of land; homebuyer purchases improvements only
- Long-term ground lease (typically 99 years)
- Resale restrictions limit sale price to preserve affordability
- Typical formula: original investment + moderate return (e.g., 25% of appreciation)
- Income means test for eligible buyers at resale
- Result: perpetual affordability from a single subsidy investment
- 6 in 10 CLT homeowners eventually transition to market-rate ownership

**Deed-Restricted Units:**
- Resale price formula attached to the deed
- No separate land ownership entity needed
- Simpler to administer but harder to enforce long-term

**Limited-Equity Cooperatives:**
- Members own shares in the cooperative (not individual units)
- Share price capped at original purchase + limited appreciation
- Monthly carrying charges instead of mortgage payments
- Co-op holds the blanket mortgage

### 6c. Fannie Mae Shared Equity Programs

Fannie Mae has a formal Shared Equity Certification for programs that meet specific criteria:
- Must include resale restrictions ensuring long-term affordability
- Certified programs can deliver loans to Fannie Mae
- Includes CLTs, deed-restricted, and inclusionary housing programs
- Certified programs get standard conventional pricing (no adverse LLPAs for the shared equity structure itself)

### 6d. Structures That Separate Principal and Interest Treatment

| Structure | Principal Treatment | Interest Treatment |
|-----------|-------------------|-------------------|
| **Standard amortization** | Increases over time (back-loaded) | Decreases over time (front-loaded) |
| **Interest-only period** | Zero for 5–10 years, then standard | Full interest paid monthly |
| **GPM** | Negative in early years (balance grows) | Partially deferred (added to principal) |
| **GEM** | Accelerated (extra payments all to principal) | Standard — fully paid each month |
| **Habitat zero-interest** | 100% of payment | Zero (no interest charged) |
| **NACA near-zero** | Near 100% of payment | Minimal |
| **SAM (assistance portion)** | Deferred to sale/refi | None — replaced by appreciation share |
| **CLT ground lease** | Land excluded from mortgage entirely | Interest on improvements only |
| **Flex Modification forbearance** | Portion deferred, non-interest-bearing | Interest only on active portion |
| **CDFI risk-sharing** | First-loss absorbed by CDFI | Borrower rate subsidized |

---

## 7. Synthesis: What Exists vs. What Doesn't

### What EXISTS in the market:
- Credit-tiered **pricing** (LLPAs, rate spreads, PMI differentials)
- Credit-tiered **eligibility** (LTV limits, DTI limits, reserve requirements)
- Non-credit-tiered **payment allocation** (GPMs, GEMs — same structure for all borrowers)
- Zero-interest models (Habitat, NACA — eliminate the allocation question entirely)
- Shared equity/appreciation models (SAMs, CLTs — restructure what "interest" means)
- Flex Modification (splits principal into interest-bearing and non-interest-bearing tranches)

### What DOES NOT EXIST (as of 2026):
- **A mortgage product where the ratio of principal-to-interest in each payment varies based on the borrower's credit tier** — this is a novel concept
- **A graduated payment structure where the graduation rate is tied to credit score** — GPMs use fixed plans regardless of borrower profile
- **A product combining RCM-style 100% principal allocation with credit-tiered interest deferral** — no market precedent

### Regulatory pathway for a credit-tiered allocation product:
1. **FHA Section 245(a)** already authorizes variable payment structures (GPM/GEM) — precedent exists for non-standard amortization
2. **Fannie Mae DU 12.0** now evaluates risk holistically, not by score alone — opens door for innovative products
3. **CDFI Fund** provides grants specifically for creating new affordable housing financing tools
4. **Shared equity certification** from Fannie Mae could potentially cover a credit-tiered structure if affordability preservation is built in
5. **State housing finance agencies** (like RIHousing) have authority to create custom loan products for targeted programs

---

## Sources

- [Fannie Mae LLPA Matrix (01/28/2026)](https://singlefamily.fanniemae.com/media/9391/display)
- [Fannie Mae Eligibility & Pricing](https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/eligibility-pricing)
- [Fannie Mae Drops Minimum FICO Score Requirement — U.S. News](https://money.usnews.com/loans/mortgages/articles/fannie-mae-drops-minimum-fico-score-requirement)
- [How Fannie Mae, Freddie Mac, and New Credit Score Rules Affect Your Mortgage in 2026 — Nolo](https://www.nolo.com/legal-updates/fhfa-approves-use-of-classic-fico-credit-scores-for-fannie-mae-freddie-mac-mortgages.html)
- [Credit Score Rules Changing for Mortgages in 2026 — Yahoo Finance](https://finance.yahoo.com/personal-finance/mortgages/article/credit-score-changes-for-mortgages-in-2026-171156109.html)
- [FHA Loan Credit Score Requirements 2026 — Freedom Mortgage](https://www.freedommortgage.com/learning-center/articles/fha-loan-credit-score-requirements)
- [FHA Loan Requirements 2026 — NerdWallet](https://www.nerdwallet.com/mortgages/learn/fha-loan-requirements)
- [Minimum Credit Score for VA Loans 2026 — VALoans.com](https://www.valoans.com/eligibility/credit/)
- [Current Mortgage Rates by Credit Score 2026 — The Mortgage Reports](https://themortgagereports.com/87625/mortgage-rates-by-credit-score)
- [Mortgage Rates by Credit Score — ConsumerAffairs](https://www.consumeraffairs.com/finance/mortgage-rates-by-credit-score.html)
- [Average Mortgage Rates by Credit Score — Experian](https://www.experian.com/blogs/ask-experian/average-mortgage-rates-by-credit-score/)
- [How Credit Score Affects Mortgage Rate — myFICO](https://www.myfico.com/credit-education/blog/credit-score-mortgage-rates)
- [LLPA Deep-Dive Guide — Homebuyer.com](https://homebuyer.com/learn/loan-level-pricing-adjustments)
- [How LLPAs Affect Your Mortgage Rate 2026 — Better.com](https://better.com/content/loan-level-price-adjustments)
- [LLPA Complete Guide — The Mortgage Reports](https://themortgagereports.com/6866/llpa-loan-level-pricing-adjustment-mortgage-rate)
- [PMI Calculator with Fannie Mae Rates — LTV-Calculator.com](https://www.ltv-calculator.com/pmi-calculator)
- [What Is PMI — Bankrate](https://www.bankrate.com/mortgages/basics-of-private-mortgage-insurance-pmi/)
- [Graduated Payment Mortgage — Bankrate](https://www.bankrate.com/mortgages/graduated-payment-mortgage/)
- [VA GPM — Veteran.com](https://veteran.com/va-gpm/)
- [Growing Equity Mortgage Pools — Ginnie Mae Chapter 28](https://www.ginniemae.gov/issuers/program_guidelines/MBSGuideLib/Chapter_28.pdf)
- [Fannie Mae Debt-to-Income Ratios — Selling Guide](https://selling-guide.fanniemae.com/sel/b3-6-02/debt-income-ratios)
- [Fannie Mae Shared Equity Programs](https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/shared-equity-programs)
- [Shared-Equity Homeownership Basics — National Housing Conference](https://nhc.org/policy-guide/shared-equity-homeownership-the-basics/)
- [Community Land Trusts — Local Housing Solutions](https://www.localhousingsolutions.org/housing-policy-library/community-land-trusts/)
- [California Dream For All — CalHFA](https://www.calhfa.ca.gov/dream/)
- [Homium Shared-Appreciation Mortgage](https://www.homium.io/)
- [NACA Housing Programs](https://www.naca.com/naca-programs/)
- [Habitat for Humanity Zero-Interest Mortgage — NMP](https://nationalmortgageprofessional.com/news/inspiring-journey-through-habitat-humanitys-zero-interest-mortgage-program)
- [What is a CDFI — OFN](https://www.ofn.org/what-is-a-cdfi/)
- [Capital Magnet Fund — CDFI Fund](https://www.cdfifund.gov/programs-training/programs/cmf)
- [How CDFIs Support Affordable Housing — Enterprise Community Partners](https://www.enterprisecommunity.org/story/how-cdfis-support-affordable-housing-rural-america)
- [Flex Modification — Fannie Mae](https://singlefamily.fanniemae.com/servicing/flex-modification)
- [Fannie Mae Eligibility Matrix (Dec 10, 2025)](https://singlefamily.fanniemae.com/media/document/pdf/eligibility-matrix-december-10-2025)
- [Examining Loan Pricing and Credit Risk — Federal Reserve](https://www.federalreserve.gov/econres/notes/feds-notes/examining-the-relationship-between-loan-pricing-and-credit-risk-20250924.html)
- [FHFA Credit Score Models Initiative](https://www.fhfa.gov/policy/credit-scores)
- [Freddie Mac Credit Score Models and Reports](https://sf.freddiemac.com/general/credit-score-models)
