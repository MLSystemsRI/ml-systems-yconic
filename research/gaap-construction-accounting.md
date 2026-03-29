# GAAP, Construction Accounting & C-Corp Tax Strategy
## ML Systems LLC — Accounting Engineer Knowledge Base

**Prepared:** 2026-03-27
**Entity:** ML Systems LLC (C-Corp election) | NAICS 236115 | Rhode Island
**Purpose:** Comprehensive accounting reference for the Accounting Engineer portal

---

## Table of Contents

1. [GAAP Foundation for Construction Companies](#1-gaap-foundation-for-construction-companies)
2. [Construction-Specific Accounting](#2-construction-specific-accounting)
3. [C-Corp Tax Structure for LLCs](#3-c-corp-tax-structure-for-llcs)
4. [Multi-Revenue Stream Accounting](#4-multi-revenue-stream-accounting)
5. [Payroll Accounting for Day N System](#5-payroll-accounting-for-day-n-system)
6. [Material Provenance & Inventory](#6-material-provenance--inventory)
7. [AI/Technology Capitalization](#7-aitechnology-capitalization)
8. [Fiduciary Equity Accounting](#8-fiduciary-equity-accounting)
9. [Key Financial Statements for Construction C-Corps](#9-key-financial-statements-for-construction-c-corps)
10. [RI-Specific Tax Considerations](#10-ri-specific-tax-considerations)

---

## 1. GAAP Foundation for Construction Companies

### 1.1 The Four Foundational Principles

| Principle | Description | ML Systems Application |
|---|---|---|
| **Historical Cost** | Record assets at original purchase price, not current market value. Adjust only for depreciation. | Construction equipment, vehicles, recovered materials (at cost of recovery, not resale value) |
| **Revenue Recognition** | Under ASC 606, recognize revenue as performance obligations are satisfied | Construction contracts recognized over time; material sales at point of transfer |
| **Matching** | Record expenses in the same period as the revenue they generate | Job costs matched to revenue via percentage-of-completion |
| **Full Disclosure** | Financial statements must reveal all information needed to understand financial position | Requires disclosure of accounting policies, contingent liabilities, related-party transactions |

### 1.2 ASC 606 — Revenue from Contracts with Customers

ASC 606 replaced the prior construction-specific guidance (ASC 605-35) with a single, unified 5-step revenue recognition model that applies across all industries.

#### The 5-Step Model

**Step 1: Identify the Contract**
- Written agreement with enforceable rights and obligations
- For ML Systems: construction contracts, material purchase agreements, API subscription agreements, loan origination agreements
- Each contract type follows this same framework but with different performance obligation characteristics

**Step 2: Identify Performance Obligations**
- Distinct goods or services promised to the customer
- Construction contract: the completed home is typically a single performance obligation (highly interdependent activities)
- Material sales: each material lot/unit is a separate performance obligation
- API subscriptions: the ongoing data access is a stand-ready obligation
- Loan origination: the loan itself and any servicing are separate obligations

**Step 3: Determine the Transaction Price**
- Fixed price + variable consideration (change orders, incentives, penalties)
- For unpriced change orders: estimate using either the **expected value method** (probability-weighted amounts) or the **most likely amount method** (single most likely outcome)
- **Constraint on variable consideration:** Only include amounts where it is *probable* that a significant reversal of cumulative revenue will NOT occur

**Step 4: Allocate Transaction Price to Performance Obligations**
- Based on relative standalone selling prices
- For bundled construction + materials contracts, allocate based on observable prices where available

**Step 5: Recognize Revenue as Performance Obligations are Satisfied**
- **Over time** (construction contracts) or **at a point in time** (material sales, equipment)

### 1.3 Percentage-of-Completion vs. Completed-Contract

#### Percentage-of-Completion Method (PCM) — Primary Method for ML Systems

Under ASC 606, revenue for construction contracts is recognized **over time** when at least one of these criteria is met:

1. The customer simultaneously receives and consumes benefits as the entity performs (service contracts)
2. The entity's performance creates or enhances an asset the customer controls as it is created (construction on customer's land)
3. The entity's performance does not create an asset with alternative use, and the entity has an enforceable right to payment for performance completed to date

**ML Systems builds homes on the customer's property (or land held for the customer), satisfying criterion #2. PCM applies.**

#### Measuring Progress — Input Method vs. Output Method

| Method | Measurement Basis | Best For |
|---|---|---|
| **Input (Cost-to-Cost)** | Actual costs incurred / Total estimated costs | ML Systems default — tracks labor, materials, subcontractor costs against budget |
| **Input (Efforts-Expended)** | Labor hours or machine hours expended / Total estimated hours | Alternative when costs don't correlate well with progress |
| **Output (Units-of-Delivery)** | Units delivered / Total contract units | Multi-unit housing developments |
| **Output (Milestones)** | Milestones achieved / Total milestones | Phased projects with clear deliverables |

**For ML Systems' 8-month build cycle:** The **cost-to-cost input method** is the standard approach. With an 8-month cycle, revenue is recognized proportionally each month based on costs incurred relative to total estimated project cost.

**Example — 8-Month Build, $400K Contract:**

| Month | Cumulative Cost | % Complete | Cumulative Revenue | Monthly Revenue |
|---|---|---|---|---|
| 1 | $30,000 | 7.5% | $30,000 | $30,000 |
| 2 | $80,000 | 20.0% | $80,000 | $50,000 |
| 3 | $150,000 | 37.5% | $150,000 | $70,000 |
| 4 | $220,000 | 55.0% | $220,000 | $70,000 |
| 5 | $280,000 | 70.0% | $280,000 | $60,000 |
| 6 | $330,000 | 82.5% | $330,000 | $50,000 |
| 7 | $370,000 | 92.5% | $370,000 | $40,000 |
| 8 | $400,000 | 100.0% | $400,000 | $30,000 |

*Total estimated cost = $400,000. This assumes a cost-plus or break-even scenario for simplicity; actual margin would shift revenue recognition accordingly.*

#### Completed-Contract Method (CCM) — Limited Use

ASC 606 effectively mandates over-time recognition for most construction contracts. CCM may only apply when:
- The contractor cannot reasonably measure progress
- Projects are short-duration (under 2 years) AND the contractor is a small contractor
- Fewer than 5 homes under construction

**ML Systems should NOT use CCM.** The 8-month cycle with job costing systems provides sufficient data for over-time recognition.

#### Key Exclusions from Input Measurement

Under ASC 606, certain costs must be **excluded** from the input measure of progress:
- **Rework costs** — do not represent transfer of goods/services to customer
- **Wasted materials** — same rationale
- **Uninstalled materials** — materials purchased but not yet incorporated into the project do not represent progress (important for ML Systems' recovered materials inventory)

### 1.4 Loss Contracts

If estimated total costs exceed the contract price at any point, the **entire anticipated loss** must be recognized immediately in the current period — not spread over the remaining contract term. This is a critical monitoring point for the Accounting Engineer.

---

## 2. Construction-Specific Accounting

### 2.1 Job Costing Methodology

Job costing is the backbone of construction accounting. Every transaction is assigned to a specific project and cost code.

#### Cost Code Structure for ML Systems

| Category | Description | Examples |
|---|---|---|
| **Direct Materials** | Materials physically incorporated into the project | Lumber, concrete, roofing, fixtures, recovered materials |
| **Direct Labor** | Wages for workers on the specific job | Crew wages (Day N payroll), subcontractor labor |
| **Subcontractor Costs** | Third-party contracted work | Electrical, plumbing, HVAC subs |
| **Equipment** | Equipment costs allocated to the job | Equipment rental, fuel, maintenance allocated by usage |
| **Overhead Allocation** | Indirect costs allocated to jobs | Insurance, office rent, project management proportional allocation |

#### GAAP-Approved Job Cost Methods

1. **Cost-to-cost method** — Compare actual costs to projected totals (primary for ML Systems)
2. **Efforts-expended method** — Measure progress through labor or machine hours
3. **Units-of-delivery method** — Completion rates based on delivered vs. total units

#### ML Systems Novel Consideration: Recovered Materials as Job Cost Inputs

When ML Systems uses its own recovered/reclaimed materials in a construction project:
- The **cost basis** of those materials (recovery labor + processing costs) flows into job cost as Direct Materials
- NOT the fair market value or resale price
- This creates a natural cost advantage: recovery cost < new material cost = higher margin on construction contracts
- The difference between recovery cost and new-material-equivalent cost is NOT separately recognized as profit — it simply results in lower total job costs and therefore higher project margin

### 2.2 Work-in-Progress (WIP) Schedules

The WIP schedule is the most critical financial management tool for construction companies. It compares:

**Earned Revenue** (based on % complete) vs. **Billings to Date**

#### WIP Schedule Format

| Project | Contract Price | Est. Total Cost | Cost to Date | % Complete | Earned Revenue | Billings to Date | Over/(Under) Billing |
|---|---|---|---|---|---|---|---|
| Project A | $400,000 | $320,000 | $160,000 | 50% | $200,000 | $180,000 | ($20,000) |
| Project B | $350,000 | $280,000 | $210,000 | 75% | $262,500 | $280,000 | $17,500 |

**Under-billings** (earned > billed) = **Asset** on balance sheet ("Costs and Estimated Earnings in Excess of Billings")
**Over-billings** (billed > earned) = **Liability** on balance sheet ("Billings in Excess of Costs and Estimated Earnings")

#### WIP Schedule Frequency

- **Monthly:** Internal management and project monitoring
- **Quarterly:** Surety/bonding company reviews
- **Annually:** Year-end financial statements, CPA review/audit

#### WIP Best Practices

1. Review estimated costs-to-complete **every month** — stale estimates destroy accuracy
2. Document all estimate changes with written explanations
3. Reconcile WIP to the general ledger monthly
4. Track change orders separately — approved, unapproved, unpriced
5. Flag any project approaching zero or negative margin immediately

### 2.3 Retainage Accounting

Retainage is the portion of the contract price (typically 5-10%) withheld by the owner until project completion or a specified milestone.

#### Balance Sheet Classification

- **Retainage Receivable** — classified as a current asset if expected to be collected within 12 months; otherwise, long-term
- **Retainage Payable** — amounts withheld from subcontractors, classified as current or long-term liability

#### ASC 606 Treatment

Under Topic 606, retainage classification depends on whether the right to payment is **unconditional**:
- If unconditional (only passage of time required): classify as a **receivable**
- If conditional (performance conditions remain): classify as a **contract asset**

For construction, retainage is typically conditional on satisfactory completion, so it is classified as a **contract asset** until the retention period ends.

#### Journal Entries

**When billing with 10% retainage:**
```
Dr. Accounts Receivable         $90,000
Dr. Retainage Receivable        $10,000
    Cr. Billings on Contract              $100,000
```

**When retainage is released:**
```
Dr. Accounts Receivable         $10,000
    Cr. Retainage Receivable              $10,000
```

### 2.4 Change Order Accounting

Change orders modify the scope and/or price of an existing construction contract.

#### ASC 606 Classification

| Type | Scope Change | Price Change | Treatment |
|---|---|---|---|
| **Approved** | Yes | Yes (agreed) | Update contract price and total estimated costs |
| **Unapproved** | Yes | Disputed | Treat as variable consideration — include in transaction price only if "probable" no significant reversal |
| **Unpriced** | Yes | Not yet determined | Estimate consideration per variable consideration guidance |

#### Three Accounting Methods for Modifications (ASC 606-10-25-12 through 25-13)

1. **Separate contract** — If the modification adds distinct goods/services at standalone selling price, treat as a new, separate contract
2. **Termination + new contract** — If remaining goods/services are distinct from those already transferred, treat as termination of old contract and creation of new one (cumulative catch-up adjustment)
3. **Part of existing contract** — If remaining goods/services are NOT distinct (most common in construction), update the transaction price and measure of progress with a cumulative catch-up adjustment

**ML Systems default:** Method 3 for most change orders (e.g., homeowner changes fixtures, adds a room). The cumulative catch-up adjustment recalculates earned revenue from inception using the revised transaction price and estimated total costs.

### 2.5 Material Inventory Valuation (Recovered/Reclaimed)

See Section 6 for detailed treatment of recovered materials.

---

## 3. C-Corp Tax Structure for LLCs

### 3.1 LLC Electing C-Corp Status

ML Systems LLC can elect to be taxed as a C corporation by filing **IRS Form 8832** (Entity Classification Election), commonly known as "check-the-box."

#### Key Implications

| Factor | Treatment |
|---|---|
| **State law entity** | Remains an LLC under RI law (liability protection) |
| **Federal tax treatment** | Taxed as a C corporation |
| **Self-employment tax** | Eliminated (owner receives W-2 wages instead) |
| **QSBS eligibility** | YES — LLCs taxed as C-corps can issue qualified small business stock |
| **Filing requirement** | Form 1120 (corporate return) |
| **Operating agreement** | Must be updated to reflect corporate governance (board, officers, stock) |

#### Timing Consideration

The election is effective on the date specified on Form 8832 (can be retroactive up to 75 days). For QSBS purposes, the stock is considered "issued" on the date the election is effective. **Earlier election = earlier start on the 5-year holding period for 100% exclusion.**

### 3.2 Double Taxation and Mitigation Strategies

C corporation profits are taxed at two levels:
1. **Corporate level:** 21% federal + 7% RI = ~28% combined
2. **Shareholder level:** 0-23.8% on dividends (qualified dividend rate + 3.8% NIIT)

**Combined effective rate on distributed profits: ~39-45%**

#### Strategy Matrix for ML Systems

| Strategy | How It Works | ML Systems Application | Tax Savings |
|---|---|---|---|
| **Reasonable Salary** | W-2 wages deductible to corp, taxed once to employee | Sal takes salary as Custodian/CEO — reduces corporate taxable income | Eliminates double tax on salary portion |
| **Retained Earnings** | Undistributed profits taxed only at corporate level (21% + 7%) | Reinvest in equipment, R&D, materials inventory, real estate | Defers shareholder-level tax indefinitely |
| **Retirement Contributions** | 401(k)/pension contributions deductible to corp, tax-deferred to employee | Max out 401(k) ($23,500 for 2026) + employer match | Deductible + tax-deferred |
| **Fringe Benefits** | Health insurance, education assistance deductible to corp, tax-free to employee | Health/dental/vision for Sal + crew | Deductible + tax-free |
| **Equipment/R&D Reinvestment** | Section 179 + bonus depreciation + R&D credits | AI development, construction equipment, robotics | Reduces corporate income significantly |
| **Shareholder Loans** | Interest on shareholder loans deductible to corp | Structure some capital as debt, receive interest income (taxed once) | Interest deductible at corporate level |

#### Accumulated Earnings Tax Warning

The IRS imposes a 20% penalty tax on retained earnings exceeding **$250,000** that lack a reasonable business purpose. For ML Systems, valid purposes include:
- Working capital for construction projects in progress
- Equipment acquisition plans
- R&D investment in AI/robotics
- Real estate acquisition (Ten Rod Road)
- Expansion into new markets

**Document the business purpose for all retained earnings above $250K.**

### 3.3 Qualified Small Business Stock (QSBS) — Section 1202

QSBS is potentially the most valuable tax provision for ML Systems investors and Sal personally.

#### Eligibility Requirements

| Requirement | ML Systems Status |
|---|---|
| Domestic C corporation | YES (LLC with C-Corp election) |
| Aggregate gross assets ≤ $75M (post-OBBBA) | YES (startup stage) |
| Stock acquired at original issuance | YES (founder shares + investor shares) |
| Acquired for money, property, or services | YES |
| Active business test: ≥80% of assets used in qualified operations | Must monitor — construction, tech, material sales all qualify |
| Qualified trade or business | YES — construction is NOT a disqualified business |

#### Disqualified Businesses (Section 1202(e)(3))

These businesses CANNOT qualify for QSBS:
- Health, law, engineering, architecture, accounting, actuarial science, performing arts, consulting, athletics, financial services, brokerage services
- Banking, insurance, financing, leasing
- Farming, natural resource extraction
- Hotels, motels, restaurants

**CRITICAL:** Engineering and architecture are disqualified, but **construction (NAICS 236115) is NOT.** ML Systems' primary business — building homes — qualifies. However, the **loan origination** activity could potentially be characterized as "financing" which IS disqualified. The 80% active business asset test must be carefully monitored to ensure construction/tech/materials remain the dominant asset usage.

#### Exclusion Tiers (Post-OBBBA, effective July 4, 2025)

| Holding Period | Exclusion | Max Gain Excluded |
|---|---|---|
| 3+ years | 50% | Greater of $15M or 10x basis |
| 4+ years | 75% | Greater of $15M or 10x basis |
| 5+ years | **100%** | Greater of $15M or 10x basis |

**For URI equity gift scenario:** If URI receives stock at original issuance and holds for 5+ years, any gain on disposition is **100% excluded** from federal capital gains tax. This makes the equity gift significantly more valuable to URI than the face value alone.

#### State QSBS Treatment

Rhode Island: **Conforms** to federal QSBS treatment (no separate RI exclusion needed — the gain simply doesn't appear on the federal return that flows to RI).

**Notable non-conforming states:** California, Pennsylvania, Mississippi, Alabama do NOT honor the QSBS exclusion.

### 3.4 R&D Tax Credits — Section 41

#### Federal R&D Credit

ML Systems qualifies for R&D credits on multiple fronts:

| Activity | Qualifying Basis | 4-Part Test |
|---|---|---|
| **AI scoring algorithms** | Developing novel property assessment and efficiency scoring models | Technological uncertainty in model architecture, training data, accuracy thresholds |
| **Robotics/automation** | Deconstruction automation, material sorting | Process of experimentation in mechanical design, sensor integration |
| **Material science R&D** | Adhesive separation, shingle recycling, contamination grading | Technological uncertainty in chemical processes, recovery rates |
| **Ontology development** | Building material knowledge graph, ML Material ID system | Novel data structures, classification algorithms |
| **RCM mortgage engine** | Credit-tier-variable allocation, daily payment processing | Novel financial product engineering |

#### Qualifying Research Expenses (QREs)

- **Wages:** Salaries of employees performing qualified research (developers, data scientists, engineers)
- **Supplies:** Materials consumed in R&D (test materials, lab supplies)
- **Contract Research:** 65% of amounts paid to third parties for qualified research
- **Cloud Computing:** Server costs for AI training and model development (post-OBBBA clarification)

#### Credit Calculation

Two methods available:
1. **Regular Credit (RC):** 20% of QREs exceeding a base amount (calculated from historical R&D spending ratio)
2. **Alternative Simplified Credit (ASC):** 14% of QREs exceeding 50% of average QREs for the prior 3 years

**For startups with no prior R&D history:** The ASC method with $0 base period = 14% x 50% of current QREs = **6% effective credit on all QREs** in year one.

#### Section 280C Election

A C-Corp can elect to reduce the R&D credit to approximately **79% of the gross credit** (1 minus 21% corporate rate) while retaining the full R&D deduction. This avoids having to reduce the R&D deduction by the credit amount. Model both approaches.

#### Form 6765 Section G — Mandatory for 2026+

Starting tax year 2026, all R&D credit claims must include project-level detail:
- Business component identification
- Research activities and personnel
- QRE allocation by activity category
- Officer attestation

**Exception:** Qualified small businesses with <$1.5M QREs and <$50M gross receipts are exempt. ML Systems likely qualifies for this exemption in early years.

#### Startup Payroll Tax Offset

Qualified small businesses (≤$5M gross receipts, ≤5 years old) can elect to apply up to **$500,000** of R&D credits against payroll taxes (FICA employer portion) instead of income taxes. Critical for pre-revenue or low-revenue years.

### 3.5 Section 179 Deduction

#### 2026 Limits

| Parameter | Amount |
|---|---|
| Maximum deduction | $2,560,000 |
| Phase-out threshold | $4,090,000 |
| Full phase-out | $6,650,000 |
| Income limitation | Cannot exceed business taxable income |

#### Eligible Construction Equipment

- Excavators, bulldozers, loaders, and heavy machinery
- Trucks, vans, and fleet vehicles (heavy vehicles >6,000 lbs GVWR = full expensing)
- Construction tools and power equipment
- Computer equipment and off-the-shelf software
- Qualified improvement property (QIP) for nonresidential buildings

#### Bonus Depreciation (Post-OBBBA)

**100% bonus depreciation permanently restored** for qualifying property acquired and placed in service after January 19, 2025:
- Applies to new AND used property (if first time owned by the taxpayer)
- Recovery period of 20 years or less
- No income limitation (unlike Section 179)
- Applied AFTER Section 179

#### Strategy for ML Systems

1. Apply **Section 179** first (up to income limitation)
2. Apply **100% bonus depreciation** to remaining qualifying property
3. Standard **MACRS depreciation** on any remainder

For the Ten Rod Road scenario: Qualified improvement property improvements to the parking structure would qualify for both Section 179 and bonus depreciation.

---

## 4. Multi-Revenue Stream Accounting

### 4.1 Revenue Stream Classification

ML Systems has five distinct revenue streams, each with different ASC 606 treatment:

| Revenue Stream | ASC 606 Category | Recognition Timing | Primary Standard |
|---|---|---|---|
| **Construction Contracts** | Performance obligation satisfied over time | Over time (cost-to-cost input method) | ASC 606-10-25-27 |
| **Material Sales (BOH)** | Performance obligation satisfied at a point in time | At delivery/transfer of control | ASC 606-10-25-30 |
| **Loan Origination Fees** | Fee income | Deferred and amortized over loan life | ASC 310-20 |
| **API/Ontology Subscriptions** | Stand-ready service obligation | Ratably over subscription period | ASC 606-10-55-1 |
| **Data Licensing (Per-Query)** | Usage-based service | As usage occurs | ASC 606-10-55-65 |

### 4.2 Construction Revenue — Over-Time Recognition

- Use cost-to-cost input method
- Monthly WIP schedule updates
- Revenue = % complete x total contract price
- Exclude uninstalled materials and rework costs from progress measurement

### 4.3 Material Sales (BOH) — Point-in-Time Recognition

Control transfers when the buyer:
1. Has present obligation to pay
2. Has legal title
3. Has physical possession
4. Bears risks and rewards of ownership
5. Has accepted the asset

**For BOH marketplace sales:** Revenue recognized at pickup/delivery. For shipped materials, revenue recognized at delivery (or shipment if FOB shipping point).

**Recovered Material Margin:** The profit on material sales is the difference between the selling price and the cost basis of the recovered material (recovery labor + processing costs). This is pure margin if recovery costs are significantly below market value.

### 4.4 Loan Origination Fees — ASC 310-20

Loan origination fees are subject to **ASC 310-20**, not ASC 606:

- **Direct loan origination costs** (employee compensation for loan-specific activities, third-party costs) are offset against origination fee income
- The **net amount** is deferred and amortized over the life of the loan using the **interest method** (effective yield)
- This applies to loans **held for investment** (which ML Systems' RCM mortgages are)

**For RCM loans specifically:**
- The origination fee minus direct origination costs = net deferred fee
- Amortize as a yield adjustment over the loan term (e.g., 30 years for a mortgage)
- This means most of the origination fee revenue is recognized very slowly over decades
- However, if a loan is sold, the entire remaining deferred fee is recognized at sale

### 4.5 API/Ontology Subscription Revenue

SaaS/subscription revenue under ASC 606:
- Performance obligation: providing continuous access to data/API
- This is a **stand-ready obligation** — revenue recognized **ratably** over the subscription period
- Monthly subscription = recognize monthly; annual subscription = recognize 1/12 each month
- Usage-based pricing (per-query): recognize as consumption occurs
- **Constraint:** Usage-based royalty exception does NOT apply to SaaS (it applies only to licensing of IP where the license is the predominant item)

### 4.6 Revenue Segmentation and Reporting

#### Segment Reporting (ASC 280)

While ASC 280 segment reporting is only mandatory for public companies, ML Systems should voluntarily segment for:
- Internal management reporting
- Investor presentations
- Bonding company requirements
- Bank/lender covenant monitoring

**Recommended Segments:**

| Segment | Revenue Streams | Key Metrics |
|---|---|---|
| **Construction** | Contract revenue, change orders | Backlog, WIP, gross margin by project |
| **Materials** | BOH sales, Housing 2030 portal sales | Inventory turnover, recovery margin |
| **Financial Services** | Loan origination fees, interest income | Loan volume, delinquency rates, net interest margin |
| **Technology** | API subscriptions, data licensing, ontology fees | MRR/ARR, churn, API call volume |

### 4.7 Transfer Pricing Between Business Units

Since ML Systems operates as a single legal entity (not separate subsidiaries), formal transfer pricing under IRC Section 482 does not strictly apply. However, **internal cost allocation** is critical for:

1. **Accurate job costing** — Construction projects using recovered materials must use cost basis, not retail price
2. **Segment profitability** — Each segment needs correct cost allocation
3. **Grant compliance** — Housing 2030 and other grants require accurate cost reporting
4. **Bonding** — Sureties evaluate construction operations separately

**Recommended approach:** Establish internal cost allocation policies documented in an accounting manual:
- Materials transferred from recovery to construction: at cost (recovery labor + processing)
- Shared overhead: allocated by reasonable metric (headcount, square footage, revenue proportion)
- Technology costs: allocated to segments by usage
- If/when subsidiaries are created: arm's length pricing per IRC Section 482

---

## 5. Payroll Accounting for Day N System

### 5.1 GAAP Treatment of Daily ACH Disbursement

The Day N payroll system (daily ACH to employees) is unusual but fully GAAP-compliant. Key accounting considerations:

#### Accrual Basis Recording

Under GAAP accrual accounting, payroll expense is recognized **when earned by the employee** (i.e., daily), regardless of payment frequency. The Day N system actually aligns **more closely** with the accrual principle than traditional bi-weekly pay because the expense recognition and cash disbursement occur on the same day.

#### Daily Journal Entry

```
Daily (for each employee):
Dr. Payroll Expense (or Job Cost — Direct Labor)    $XXX (gross pay)
Dr. Employer Payroll Tax Expense                      $XX (employer FICA, FUTA, SUTA)
    Cr. Cash (operating account)                             $XXX (net pay — ACH)
    Cr. Federal Income Tax Payable                           $XX
    Cr. State Income Tax Payable                             $XX
    Cr. FICA Payable (employee + employer portion)           $XX
    Cr. FUTA/SUTA Payable                                    $XX
```

#### Tax Deposit Schedules

Daily pay does NOT change tax deposit timing:
- **Federal income tax + FICA:** Deposited per IRS lookback period (monthly or semi-weekly, based on prior year liability)
- **FUTA:** Deposited quarterly if liability exceeds $500
- **RI state income tax:** Deposited per state schedule (monthly or quarterly)
- **RI TDI/UI:** Quarterly

**The daily cash outflow for net pay is real, but tax liabilities accumulate in payable accounts until the deposit date.**

### 5.2 Gross-Up Method Accounting

In the gross-up method, the employer absorbs the employee's tax burden. The employee's stated pay ($20/hr) is the NET amount; the employer calculates and pays the additional taxes.

#### Gross-Up Calculation

```
Gross Pay = Net Pay / (1 - Total Tax Rate)

Example at $20/hr net, 30% combined tax rate:
Gross Pay = $20 / (1 - 0.30) = $28.57/hr
Employer additional cost = $8.57/hr in employee taxes + employer payroll taxes on $28.57
```

#### Accounting Treatment

- The **total gross amount** ($28.57) is the deductible wage expense
- The employee taxes paid by the employer are treated as **additional compensation**, NOT as tax expense
- This means W-2 wages reported to the IRS reflect the grossed-up amount
- Employer FICA/FUTA/SUTA are calculated on the grossed-up amount

#### Journal Entry (Gross-Up)

```
Dr. Payroll Expense / Job Cost          $28.57 (grossed-up amount)
Dr. Employer FICA Expense                $2.19 (7.65% of $28.57)
Dr. Employer FUTA/SUTA Expense           $0.XX
    Cr. Cash — Employee ACH                     $20.00 (net pay to employee)
    Cr. Federal Income Tax Payable               $X.XX
    Cr. FICA Payable (employee portion)          $2.19
    Cr. FICA Payable (employer portion)          $2.19
    Cr. State Income Tax Payable                 $X.XX
    Cr. FUTA/SUTA Payable                        $0.XX
```

### 5.3 Workers' Compensation Accrual

Workers' comp premiums are typically paid based on estimated annual payroll, with an audit adjustment at year-end.

- **Monthly accrual:** Accrue workers' comp expense based on actual payroll x applicable rate
- **Payment timing:** Premium paid over time (not upfront for ML Systems per MEMORY.md)
- **Year-end audit:** Adjust accrual for actual payroll vs. estimated; record additional expense or credit

```
Monthly:
Dr. Workers' Comp Expense    $XXX
    Cr. Workers' Comp Payable        $XXX

When premium payment is made:
Dr. Workers' Comp Payable    $XXX
    Cr. Cash                         $XXX
```

### 5.4 Cash Flow Statement Impact

Daily pay significantly affects the **cash flow from operations** section:

| Traditional Bi-Weekly | Day N Daily |
|---|---|
| Large payroll outflows every 2 weeks | Small daily outflows |
| Accrued wages liability fluctuates | Minimal accrued wages (paid same day) |
| Cash balance swings significantly around pay dates | Smoother, more predictable daily cash outflow |
| Requires larger cash reserve for pay date peaks | Requires consistent daily liquidity |

**Cash flow statement presentation:** Payroll cash outflows are classified as **operating activities**. The daily pattern doesn't change classification, only the cadence.

**Key management consideration:** The Day N system requires the operating bank account to maintain sufficient daily balance for payroll ACH. Recommend a dedicated payroll account funded daily from the master operating account.

---

## 6. Material Provenance & Inventory

### 6.1 GAAP Treatment of Recovered Materials

This is a novel area where ML Systems' business model creates unique accounting considerations.

#### Cost Basis Determination

Recovered materials are **NOT** valued at fair market value upon recovery. Under GAAP, the cost basis of recovered materials includes:

| Cost Component | Description | Example |
|---|---|---|
| **Direct Recovery Labor** | Wages of deconstruction crew performing the recovery | $20/hr x hours on the recovery task |
| **Direct Materials** | Supplies used in recovery (blades, solvents, packaging) | Saw blades, separation chemicals |
| **Equipment Allocation** | Equipment usage allocated to the recovery operation | Proportional depreciation/rental cost |
| **Transportation** | Moving materials from demolition site to storage/processing | Truck fuel, driver time |
| **Processing/Grading** | Costs of cleaning, grading, testing, tagging (ML Material ID) | Lab time, testing supplies |
| **Overhead Allocation** | Proportional share of facility, management, insurance | Warehouse rent, insurance allocation |

#### The "Joint Product" vs. "By-Product" Framework

When ML Systems deconstructs a building, it produces multiple outputs:
- Primary service: building removal/site clearing (contracted service)
- Recovered materials: the physical materials salvaged

**Two possible accounting treatments:**

**Option A — By-Product Method (Recommended for early operations):**
- The deconstruction service is the primary product
- Recovered materials are a by-product
- Revenue from material sales reduces the cost of the deconstruction service (credit against COGS)
- Materials enter inventory at **zero cost** or **net realizable value minus normal profit margin**
- Simpler, more conservative, appropriate when material recovery is incidental to the deconstruction service

**Option B — Joint Product Method (When material recovery is a primary business purpose):**
- Both the service AND the materials are significant outputs
- Total costs are allocated between the service and materials using a rational basis (e.g., relative sales value method)
- Materials enter inventory at their allocated share of total costs
- More complex but more accurate when material recovery represents a significant portion of value

**ML Systems should transition from Option A to Option B** as the materials marketplace (BOH) matures and material sales become a significant revenue stream.

### 6.2 Inventory Methods

#### Lower of Cost or Net Realizable Value (LCNRV) — ASC 330

All inventory, including recovered materials, must be carried at the **lower of cost or net realizable value (NRV)**.

NRV = Estimated selling price - Costs of completion - Costs of disposal - Normal profit margin (for by-product method)

#### Inventory Costing Method Options

| Method | How It Works | ML Systems Fit |
|---|---|---|
| **Specific Identification** | Each item tracked individually by cost | **BEST for high-value items** — each ML Material ID carries its own cost basis |
| **FIFO (First-In, First-Out)** | Oldest inventory costs charged to COGS first | Good for commodity materials (lumber, concrete) |
| **Weighted Average** | Average cost across all units | Simplest for bulk commodities |
| **LIFO** | Most recent costs charged to COGS first | NOT recommended — prohibited under IFRS, adds complexity |

**Recommended approach:** **Specific identification** for graded/tagged materials (each ML Material ID = unique cost record) and **FIFO** for commodity bulk materials.

### 6.3 Write-Down Rules

Materials must be written down when NRV falls below cost:

| Condition | Treatment |
|---|---|
| **Damaged material** | Write down to NRV (reduced selling price - disposal costs) |
| **Contaminated material** | If unsaleable, write off entirely; if saleable at reduced price, write down to NRV |
| **Obsolete material** | Write down to NRV or write off if no market |
| **Grade downgrade** | Adjust carrying value to NRV at new grade level |

#### Journal Entry for Write-Down

```
Dr. Inventory Write-Down Expense (or COGS)    $XXX
    Cr. Inventory — Recovered Materials                $XXX
```

Write-downs are **NOT reversible** under US GAAP (unlike IFRS). Once written down, the new lower value becomes the new cost basis.

### 6.4 ML Material ID and Provenance Tracking

The ML Material ID system (ML-{year}-{project}-{zone+seq}) creates a natural specific-identification tracking system. Each material unit has:

- Unique identifier
- Cost basis (sum of recovery costs allocated to that unit)
- Grade and contamination status
- Location tracking
- Audit trail

This system supports both **inventory valuation** and **DEM compliance** (regulatory reporting for hazardous materials).

---

## 7. AI/Technology Capitalization

### 7.1 ASC 350-40 — Internal-Use Software

ML Systems develops significant internal-use software: the scoring engine, RCM mortgage engine, ontology system, marketplace platform, and various portals.

#### Current Guidance (Pre-ASU 2025-06)

Three project stages with different treatments:

| Stage | Activities | Treatment |
|---|---|---|
| **Preliminary Project** | Conceptual design, vendor evaluation, technology selection | **EXPENSE** as incurred |
| **Application Development** | Coding, testing, configuration, data conversion | **CAPITALIZE** |
| **Post-Implementation** | Training, maintenance, bug fixes | **EXPENSE** as incurred |

#### Updated Guidance — ASU 2025-06 (Effective 2028, early adoption permitted)

FASB modernized the guidance to align with agile/iterative development:

**Key Changes:**
1. **Project stages eliminated** — no more bright-line stage gates
2. **Capitalization begins when** two conditions are met:
   - Management has authorized and committed to funding the project
   - It is **probable** the project will be completed and used as intended
3. **Capitalization ends when** the software is substantially ready for use
4. Better alignment with agile sprints, CI/CD, and iterative development

#### What to Capitalize vs. Expense

| Capitalize | Expense |
|---|---|
| Developer salaries during active development | Preliminary research and feasibility studies |
| Third-party development costs | Training costs |
| Testing directly related to development | Data migration (unless it adds functionality) |
| Cloud hosting costs during development (ASC 350-40-25-19) | Ongoing maintenance and bug fixes |
| AI model training costs if creating new capability | Routine model retraining on new data |
| Database design and development | General administrative overhead |

#### ML Systems Specific Applications

| Asset | Capitalize? | Rationale |
|---|---|---|
| **Scorer (XGBoost engine)** | YES — development costs | Novel AI model for property assessment |
| **RCM mortgage engine** | YES — development costs | Unique financial product software |
| **Ontology knowledge graph** | YES — development costs | Novel data structure with licensing value |
| **BOH marketplace platform** | YES — development costs | E-commerce platform development |
| **ML Material ID system** | YES — development costs | Novel provenance tracking software |
| **Website/marketing portals** | EXPENSE | ASC 350-40 excludes websites used for advertising |
| **Routine model retraining** | EXPENSE | Maintenance, not new capability |
| **Data entry/migration** | EXPENSE | Does not add new functionality |

### 7.2 Amortization

Capitalized software costs are amortized on a **straight-line basis** over the estimated useful life, typically **3-5 years** for technology assets.

- Amortization begins when the software is **substantially ready for intended use**
- Useful life should be reassessed regularly
- If the software is abandoned or impaired, write down the remaining capitalized cost immediately

#### Journal Entries

**Capitalizing development costs:**
```
Dr. Capitalized Software — [Project Name]    $XXX
    Cr. Cash / Accounts Payable / Accrued Salaries    $XXX
```

**Monthly amortization (e.g., $100K capitalized, 5-year life):**
```
Dr. Amortization Expense — Software    $1,667
    Cr. Accumulated Amortization — Software    $1,667
```

### 7.3 Dual-Use Software (Internal + Licensed to Customers)

The ontology system and API platform have dual use — internal operations AND external licensing/subscription revenue. This creates a classification question:

- **If primarily internal-use:** Follow ASC 350-40
- **If sold/licensed externally:** Follow ASC 985-20 (Costs of Software to be Sold, Leased, or Marketed)

Under ASC 985-20, costs are expensed until **technological feasibility** is established (working model or detailed program design), then capitalized until the product is available for general release.

**For ML Systems:** If the ontology/API starts as internal and later becomes a licensed product, the existing capitalized costs under ASC 350-40 remain; additional costs for the external version follow ASC 985-20 from the point of technological feasibility.

---

## 8. Fiduciary Equity Accounting

### 8.1 Equity Gift to URI — Accounting Treatment

When ML Systems gifts 0.1% equity to the University of Rhode Island:

#### For ML Systems (the Donor)

1. **Determine fair value** of the gifted shares using a qualified appraisal (required for noncash charitable contributions exceeding $10,000 for closely held stock)
2. **Record the gift:**
```
Dr. Charitable Contribution Expense    $XXX (FMV of shares)
    Cr. Common Stock (par value portion)          $X
    Cr. Additional Paid-in Capital                $XXX
```
3. **Tax deduction:** C-corporations can deduct charitable contributions up to **10% of taxable income** (calculated before the charitable deduction). Excess carries forward for 5 years.
4. **Valuation implications:** The gifted shares at 0.1% implying a $1B valuation floor creates a **documented valuation event** that anchors future 409A valuations, QSBS basis calculations, and investor pricing.

#### For URI (the Recipient)

- Records contribution revenue at fair value
- The equity is recorded as an investment asset
- Subsequent changes in value follow investment accounting (FMV adjustments for public entities; cost basis or equity method for private companies depending on influence level)

### 8.2 Stock-Based Compensation — ASC 718

When ML Systems issues equity to employees, directors, or service providers:

#### Measurement

- **Fair value** determined at the **grant date** using an appropriate valuation method
- For private companies: 409A valuation (safe harbor) or Black-Scholes/Monte Carlo model
- Expense recognized over the **requisite service period** (vesting period)

#### Common Award Types for ML Systems

| Award Type | Vesting | Expense Recognition |
|---|---|---|
| **Restricted Stock** | Time-based (e.g., 4 years) | Straight-line over vesting period |
| **Stock Options** | Time-based or performance-based | Straight-line (time) or when probable (performance) |
| **Profits Interest** | Performance/time-based | Over vesting period |

#### Journal Entry (Restricted Stock Grant, $100K FMV, 4-year vest)

```
Monthly for 48 months:
Dr. Stock Compensation Expense    $2,083
    Cr. Additional Paid-in Capital        $2,083
```

### 8.3 Public Institution Equity — Reporting Considerations

Having URI (a public institution) on the cap table creates additional considerations:

1. **Open records:** URI's investment holdings may be subject to public records requests — ML Systems financial information shared with URI could become public
2. **GASB reporting:** URI follows GASB (not FASB); they report the investment under GASB standards for investments
3. **Fiduciary duty:** ML Systems' board has a fiduciary duty to ALL shareholders, including URI. Material decisions affecting equity value require proper governance
4. **Information rights:** URI would likely receive standard investor information rights (quarterly financials, annual audited statements)
5. **Anti-dilution:** Consider whether URI's equity has anti-dilution protection or is subject to dilution in future rounds

### 8.4 409A Valuation Requirements

Any time ML Systems issues equity (including the URI gift), it needs a **409A valuation** to establish fair market value:

- Required for stock options and other deferred compensation
- Safe harbor: Hire a qualified independent appraiser
- Typically valid for 12 months (or until a material event)
- The URI equity gift at an implied $1B valuation MUST be supported by a defensible appraisal methodology

---

## 9. Key Financial Statements for Construction C-Corps

### 9.1 Required Financial Statements

| Statement | Purpose | Construction-Specific Elements |
|---|---|---|
| **Balance Sheet** | Financial position at a point in time | WIP assets/liabilities, retainage, equipment |
| **Income Statement** | Performance over a period | Revenue by contract, gross margin by project |
| **Statement of Cash Flows** | Cash inflows/outflows | Operating: collections, payroll; Investing: equipment; Financing: loans |
| **Statement of Stockholders' Equity** | Changes in equity | Stock issuances, retained earnings, QSBS tracking |
| **Notes to Financial Statements** | Supplementary disclosures | Revenue recognition policies, significant estimates, contingencies |

### 9.2 Construction-Specific Schedules

| Schedule | Purpose | Frequency |
|---|---|---|
| **WIP Schedule** | Over/under billing analysis by project | Monthly (internal), quarterly (surety), annually (CPA) |
| **Job Cost Detail** | Cost breakdown by project and cost code | Monthly |
| **Backlog Report** | Remaining contract value on signed contracts | Monthly |
| **Equipment Schedule** | Asset listing with depreciation, Section 179/bonus | Annually |
| **Contract Revenue Schedule** | Revenue recognized by contract with % complete | Monthly |

### 9.3 Surety Bond Financial Requirements

#### Bond Thresholds and Financial Statement Requirements

| Bond Amount | Financial Statement Required |
|---|---|
| Under $750K | 1-2 page application, personal credit of owners |
| $750K - $2M | Company + owner financials; internal statements may be accepted |
| $2M - $5M | **CPA compilation** or **review** required |
| Over $5M | **CPA review** required; some sureties require **audit** |
| Over $10M | **CPA audit** typically required |

#### The Three C's of Surety Underwriting

| Factor | What Sureties Evaluate | ML Systems Considerations |
|---|---|---|
| **Character** | Reputation, integrity, management quality, experience | Founder track record, project history, references |
| **Capacity** | Ability to handle project size, type, complexity | Workforce, equipment, project management systems |
| **Capital** | Working capital, net worth, profitability, liquidity | Balance sheet strength, WIP position, debt ratios |

#### Key Financial Ratios Sureties Monitor

| Ratio | Formula | Target |
|---|---|---|
| **Working Capital** | Current Assets - Current Liabilities | Positive and growing |
| **Current Ratio** | Current Assets / Current Liabilities | > 1.25 |
| **Debt-to-Equity** | Total Liabilities / Total Equity | < 3.0 |
| **Equity-to-Revenue** | Total Equity / Annual Revenue | Varies by size |
| **Net Income Margin** | Net Income / Revenue | > 3% |

#### Bonding Capacity Rule of Thumb

Bonding capacity is typically **10-20x working capital** for established contractors. A company with $500K in working capital might qualify for $5M-$10M in aggregate bonding.

### 9.4 CPA Engagement Levels

| Level | Assurance | Cost | When Required |
|---|---|---|---|
| **Compilation** | None — CPA presents management's numbers | $ | Small bonds, bank loans |
| **Review** | Limited — analytical procedures + inquiries | $$ | Most surety bonds, bank lines of credit |
| **Audit** | Reasonable assurance — full testing | $$$ | Large bonds (>$10M), public grants, investor due diligence |

**ML Systems near-term need:** CPA **review** engagement for surety bonding and investor/grant credibility.

---

## 10. RI-Specific Tax Considerations

### 10.1 Rhode Island Corporate Income Tax

| Item | Detail |
|---|---|
| **Tax Rate** | 7% of RI taxable income |
| **Minimum Tax** | $400 (all corporations with RI business activity) |
| **Apportionment** | Single Sales Factor, market-based sourcing (C-Corps, effective 2015+) |
| **Filing** | Form RI-1120C; due April 15 (calendar year) or 15th day of 4th month after fiscal year-end |
| **Combined Reporting** | Required using Finnegan method for sales factor |
| **Estimated Tax** | Required if expected tax liability > $400 |

#### Effective Combined Rate

Federal (21%) + RI (7%) = **~28% combined rate** on corporate income (RI tax is deductible on the federal return, creating a slight reduction in effective rate).

Actual effective rate: 21% + 7% x (1 - 0.21) = 21% + 5.53% = **~26.53%**

### 10.2 Rhode Island R&D Tax Credit

| Parameter | Amount |
|---|---|
| Credit rate (first $111,111 in excess QREs) | **22.5%** |
| Credit rate (QREs over $111,111) | **16.9%** |
| Carryforward period (pre-2026) | 7 years |
| Carryforward period (2026+) | **15 years** |
| Refundable? | No — credit only |

**The RI R&D credit is among the most generous state-level R&D credits in the US.** The 22.5% rate on the first ~$111K in qualifying expenses significantly exceeds most states.

#### Combined Federal + State R&D Benefit

For ML Systems' first $111,111 in Rhode Island QREs:
- Federal credit: ~6-14% (depending on method)
- RI credit: 22.5%
- Combined: up to **36.5%** credit on qualified research expenses

### 10.3 Other RI Business Incentives

| Incentive | Description | ML Systems Applicability |
|---|---|---|
| **Rebuild Rhode Island** | Up to 20-30% tax credit on commercial development costs | Ten Rod Road development |
| **Qualified Jobs Tax Credit** | Credit for creating new jobs; $2,500/job/year for up to 5 years | New hires for construction crew |
| **Sales Tax Exemption** | Certain construction materials exempt for qualifying projects | Housing 2030 projects |
| **Enterprise Zone Tax Credits** | Credits in designated enterprise zones | Depends on project location |
| **Small Business Development Fund** | Loans and grants for small businesses | General business development |

### 10.4 RI Payroll Tax Requirements

| Tax | Rate | ML Systems Impact |
|---|---|---|
| **RI Income Tax Withholding** | Progressive (3.75% - 5.99%) | Withhold from daily gross-up wages |
| **RI Temporary Disability Insurance (TDI)** | 1.1% (2026, employee-paid) | Withhold from employees |
| **RI Job Development Fund (JDF)** | 0.21% (employer-paid) | Employer cost on all wages |
| **RI Unemployment Insurance (UI)** | Variable (new employer: 2.42%) | Employer cost, first $28,800 per employee |

### 10.5 RI Construction Industry Regulations Affecting Accounting

| Regulation | Accounting Impact |
|---|---|
| **GC Registration (not "license")** | Registration fee is an operating expense; liability insurance is a prerequisite |
| **Prevailing Wage (public projects)** | Certified payroll records required; wage rates set by RI DLT |
| **Retainage limits** | RI limits retainage to 5% on public construction contracts (RIGL 37-12-3) |
| **Prompt Payment Act** | Contractors must pay subcontractors within 30 days of receipt (affects A/P timing) |
| **Lien law** | Mechanics' lien rights affect receivables security and collection |

---

## Appendix A: Novel Accounting Considerations Unique to ML Systems

### A.1 The Reversed Conventional Mortgage (RCM) — Accounting Novelty

The RCM allocates 100% of payment to principal, with interest deferred as a separate liability. This creates unique accounting:

- **Loan asset on balance sheet:** Principal balance declines faster than traditional amortization
- **Deferred interest liability:** Accumulates as a separate liability (accrued interest payable)
- **Interest income recognition:** Still recognized on an accrual basis under ASC 310 — the interest accrues even though the borrower isn't paying it currently
- **Impairment testing:** If deferred interest grows too large relative to collateral value, impairment may be required
- **Regulatory considerations:** The RCM may require specific regulatory approval as a novel mortgage product; accounting must comply with whatever framework regulators impose

### A.2 Material Recovery Value in Equity Calculation

ML Systems' equity formula: `Equity = Property Value - Principal Balance + Material Recovery Value`

This is a **management metric**, not a GAAP measurement. For GAAP purposes:
- Property value = appraised FMV (for balance sheet carrying value, use historical cost minus depreciation)
- Material recovery value = inventory at cost (LCNRV)
- The premium from material recovery shows up as higher project margins, not as a separate equity component

### A.3 Ontology Licensing as Intangible Asset

The building material ontology/knowledge graph developed by ML Systems is an **internally developed intangible asset**:

- Development costs capitalized under ASC 350-40 (software) or ASC 350-30 (general intangibles)
- If licensed to third parties, subsequent costs follow ASC 985-20
- The ontology's value is realized through API subscription revenue, NOT through balance sheet revaluation
- Under US GAAP, internally developed intangibles are carried at **cost minus amortization**, never at fair value (unlike acquisitions)

### A.4 Day N Payroll as Competitive Advantage

The daily pay system creates an accounting pattern that is:
- More aligned with accrual principles than traditional payroll
- Requires more sophisticated cash management
- Creates virtually zero accrued wages liability (competitive advantage for balance sheet presentation)
- Increases transaction volume significantly (365 payroll cycles vs. 26 for bi-weekly)
- Requires robust automation to be practical at scale

### A.5 Multi-Layer Revenue Recognition Summary

| Revenue Event | ASC Reference | Method | Timing |
|---|---|---|---|
| Construction contract payment | ASC 606 | Over time (cost-to-cost) | Monthly as work progresses |
| Material sale (BOH) | ASC 606 | Point in time | At delivery/pickup |
| Loan origination fee | ASC 310-20 | Interest method amortization | Over life of loan (decades) |
| API subscription | ASC 606 | Ratable | Monthly over subscription period |
| Data query fee | ASC 606 | As consumed | When API call occurs |
| Change order (approved) | ASC 606-10-25-12 | Cumulative catch-up | When modification approved |
| Retainage release | ASC 606 | Already recognized | Cash receipt only (no new revenue) |
| Material recovery (by-product) | ASC 330 / ASC 606 | Credit to COGS | When materials enter inventory |
| Housing 2030 grant | ASC 958 (if conditional) | As conditions are met | As grant milestones achieved |

---

## Appendix B: Chart of Accounts Structure (Recommended)

### Revenue Accounts (4000s)
- 4100 — Construction Contract Revenue
- 4200 — Material Sales Revenue
- 4300 — Loan Origination Fee Income
- 4310 — Interest Income — RCM Loans
- 4400 — API/Ontology Subscription Revenue
- 4410 — Data Licensing Revenue (Per-Query)
- 4500 — Grant Revenue
- 4600 — Other Revenue

### Cost of Revenue (5000s)
- 5100 — Construction Direct Costs (by job)
- 5110 — Direct Labor
- 5120 — Direct Materials (new)
- 5130 — Direct Materials (recovered)
- 5140 — Subcontractor Costs
- 5150 — Equipment Allocation
- 5200 — Material Recovery Costs (Deconstruction)
- 5300 — Loan Origination Direct Costs
- 5400 — Technology Infrastructure Costs (API serving)

### Operating Expenses (6000s)
- 6100 — Payroll & Benefits (non-job)
- 6200 — Rent & Facilities
- 6300 — Insurance (GL, WC, E&O)
- 6400 — Professional Services (legal, accounting, consulting)
- 6500 — Technology & Software
- 6600 — Marketing & Business Development
- 6700 — Depreciation & Amortization
- 6800 — R&D Expenses (non-capitalizable)
- 6900 — General & Administrative

### Assets (1000s)
- 1100 — Cash & Cash Equivalents
- 1110 — Operating Account
- 1120 — Payroll Account (Day N)
- 1200 — Accounts Receivable
- 1210 — Retainage Receivable
- 1220 — Contract Assets (under-billings)
- 1300 — Inventory — New Materials
- 1310 — Inventory — Recovered Materials
- 1400 — Loans Receivable — RCM
- 1410 — Deferred Loan Origination Fees (contra)
- 1500 — Property & Equipment
- 1600 — Capitalized Software
- 1610 — Accumulated Amortization — Software

### Liabilities (2000s)
- 2100 — Accounts Payable
- 2110 — Retainage Payable
- 2120 — Contract Liabilities (over-billings)
- 2200 — Accrued Payroll Taxes
- 2210 — Federal Income Tax Payable
- 2220 — FICA Payable
- 2230 — State Tax Payable
- 2240 — Workers' Comp Payable
- 2300 — Accrued Interest — RCM (deferred interest liability)
- 2400 — Notes Payable
- 2500 — Corporate Income Tax Payable

### Equity (3000s)
- 3100 — Common Stock (par value)
- 3200 — Additional Paid-in Capital
- 3300 — Retained Earnings
- 3400 — Stock Compensation (ASC 718)

---

## Appendix C: Key ASC References

| Standard | Topic | Application |
|---|---|---|
| ASC 310-20 | Loan Origination Fees & Costs | RCM loan origination fee amortization |
| ASC 330 | Inventory | Recovered materials valuation (LCNRV) |
| ASC 350-40 | Internal-Use Software | AI/scoring/platform capitalization |
| ASC 360 | Property, Plant & Equipment | Construction equipment, real estate |
| ASC 450 | Contingencies | Warranty reserves, legal contingencies |
| ASC 606 | Revenue from Contracts with Customers | All revenue recognition |
| ASC 718 | Stock Compensation | Employee equity grants, URI gift |
| ASC 740 | Income Taxes | Tax provision, R&D credits, QSBS |
| ASC 835 | Interest | Effective interest method for loans |
| ASC 842 | Leases | Equipment leases, facility leases |
| ASC 958 | Not-for-Profit (contributions received) | Grant accounting (Housing 2030) |
| ASC 985-20 | Software to be Sold/Licensed | Ontology licensing costs |

---

## Sources

- [ASC 606 Transition for Construction — Baker Tilly](https://www.bakertilly.com/insights/the-asc-606-transition-for-construction-contractors-recognizing-revenue)
- [Construction Revenue Recognition — Deltek](https://www.deltek.com/en/construction/accounting/revenue-recognition)
- [Construction Accounting GAAP — K38 Consulting](https://k38consulting.com/construction-accounting-gaap/)
- [WIP Schedules — AICPA](https://www.aicpa-cima.com/professional-insights/article/wip-schedules-blueprints-for-solid-construction-accounting)
- [Construction Project Accounting — Intuit](https://www.intuit.com/enterprise/blog/construction/construction-project-accounting/)
- [ASC 606 Variable Consideration — Katz Abosch](https://www.katzabosch.com/thought-leadership/asc-606-and-evaluating-variable-consideration/)
- [Contract Modifications — Cohen & Co](https://www.cohenco.com/knowledge-center/insights/november-2019/how-to-account-for-contract-modifications-in-your-construction-business-under-the-new-revenue)
- [Section 1202 QSBS Guide 2026 — Millan CPA](https://millancpa.com/insights/section-1202-qualified-small-business-stock-qsbs-tax-guide)
- [LLCs Can Issue QSBS — FBT Gibbons](https://fbtgibbons.com/to-be-clearllcs-can-issue-qualified-small-business-stock-qsbs/)
- [2026 R&D Credit Field Guide — StrikeTax](https://www.striketax.com/journal/2026-rd-tax-credit-field-guide)
- [AI and R&D Tax Credits — KPMG](https://kpmg.com/us/en/taxnewsflash/news/2026/01/kpmg-article-ai-reshapes-software-r-and-d-tax-credits.html)
- [R&D Tax Credits for AI/ML — Shay CPA](https://shaycpa.com/how-ai-and-ml-companies-can-tap-into-the-rd-tax-credit/)
- [Section 174 in 2026 — KBS CPA](https://kbscpa.com/understanding-rd-tax-credits-and-section-174-in-2026/)
- [Construction Tax Breaks 2025 — Baldwin CPAs](https://www.baldwincpas.com/insights/construction-tax-breaks-2025-bonus-depreciation-and-section-179-guide)
- [Section 179 Deduction 2026 — Section179.org](https://www.section179.org/section_179_deduction/)
- [OBBBA Bonus Depreciation — DHJJ](https://dhjj.com/bonus-depreciation-section-179-2025/)
- [ASU 2025-06 Internal-Use Software — BDO](https://arch.bdo.com/new-asu-on-internal-use-software-costs-guidance)
- [ASC 350-40 Software Capitalization — FinQuery](https://finquery.com/blog/asc-350-internal-use-software-accounting-fasb/)
- [Software Costs — KPMG](https://kpmg.com/us/en/frv/reference-library/2025/fasb-issues-final-asu-on-software-cost-accounting.html)
- [Loan Origination Fees — PwC](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/loans_and_investment/loans_and_investment_US/chapter_4_accounting__1_US/44_loan_origination__US.html)
- [Loan Origination Fees — Meaden & Moore](https://www.meadenmoore.com/blog/atc/accounting-for-loan-origination-fees)
- [SaaS Revenue Recognition — Deloitte](https://www.deloitte.com/us/en/services/audit-assurance/articles/revenue-recognition-saas-software-guidance.html)
- [Revenue for Software/SaaS — KPMG](https://kpmg.com/us/en/frv/reference-library/2025/handbook-revenue-software-saas.html)
- [ASC 718 Stock Compensation — JP Morgan](https://www.jpmorganworkplacesolutions.com/insights/what-is-asc-718/)
- [ASC 718 Guide — Carta](https://carta.com/equity-management/cap-table/financial-reporting/)
- [C-Corp Double Taxation Strategies — SDO CPA](https://www.sdocpa.com/c-corp-double-taxation-explained/)
- [Charitable Contributions — IRS Pub 526](https://www.irs.gov/publications/p526)
- [Accounting for Stock Gift Donations — CFO Selections](https://www.cfoselections.com/perspective/accounting-and-reporting-for-stock-gift-donations-to-nonprofits)
- [Surety Bond Financial Requirements — CSBA](https://commercialsurety.com/what-type-of-cpa-financial-statement-are-required-for-construction-surety-bonds/)
- [Bonding Capacity — CMP CPA](https://blog.cmp.cpa/bonding-capacity)
- [RI Corporate Tax — RI Division of Taxation](https://tax.ri.gov/tax-sections/corporate-tax)
- [RI R&D Tax Credit — Endeavor Advisors](https://www.endeavoradvisors.com/rhode-island-rd-tax-credit/)
- [RI R&D Credits — StrikeTax](https://www.striketax.com/state-rd-credits/rhode-island-r-d-tax-credits)
- [RI Tax Incentives — Gusto](https://gusto.com/resources/states/rhode-island/ri-tax-incentives)
- [Intercompany Accounting — NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/intercompany-accounting.shtml)
- [Payroll Accounting — AccountingCoach](https://www.accountingcoach.com/payroll-accounting/explanation)
