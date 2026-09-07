# CODEX EXECUTION PROMPT — Sakhi Multistate Frontend Redesign
## 4-Phase Manual QA Workflow

You are the implementation engineer.

This project must be completed in **4 strictly separated phases**.

## CRITICAL EXECUTION RULE

You must **STOP after each phase** and wait for the user to manually QA the work.

Do **not** continue to the next phase until the user explicitly says something equivalent to:

```text
Proceed to Phase 2
Proceed to Phase 3
Proceed to Phase 4
```

At the end of each phase:

1. Run the current build on localhost.
2. Verify only the scope of that phase.
3. Give the user:
   - localhost URL/port,
   - exact run command,
   - concise list of what was completed,
   - anything the user should specifically QA.
4. STOP.

Do not pre-build later phases.

Do not create hidden scaffolding, placeholder routes, backend logic, or future code for later phases unless it is strictly necessary for the current phase to function.

---

# GLOBAL RULES FOR ALL 4 PHASES

## DESIGN SCOPE OVERRIDE — AUTHORITATIVE

This section overrides any older instruction elsewhere in this file that could be interpreted as requiring every page to replicate the exact homepage/reference layout.

### Homepage

The **Homepage must replicate `Sakhi1` (reference video) and `Sakhi2` as closely as possible**.

For the Homepage, treat the supplied references as authoritative for:

- overall layout and composition
- visual hierarchy
- section structure where applicable
- spacing and proportions
- interaction style
- scroll behavior
- transitions
- animation timing
- sticky/pinned behavior
- reveals
- transforms
- motion language
- overall visual treatment

The Homepage should be a faithful reproduction of the approved reference direction, adapted only where necessary to accommodate Sakhi's actual content, logo, colors, and required sections.

### All other pages

The following pages must **NOT** be simple replicas of the Homepage or forced into the exact same section composition:

- Loans
- Deposits
- Services
- Contact

For these pages, use **creative freedom and original design judgment** while staying consistent with the Sakhi brand and the premium quality established by the Homepage.

Design these pages from scratch with their own appropriate layouts and interactions.

You are encouraged to create original:

- section compositions
- financial product cards
- comparison layouts
- expandable cards
- drawers and modals
- hover interactions
- scroll-triggered transitions
- animated headings
- image reveals
- masks and clipping
- parallax
- staggered entrances
- sticky sections
- subtle marquee or horizontal movement where appropriate
- fluid page transitions
- premium micro-interactions
- responsive card systems
- data/rate presentation patterns
- interactive eligibility/document displays
- other polished frontend interactions appropriate for a professional financial institution

The goal is **not visual sameness between every route**.

The goal is for all pages to feel like they belong to the same premium Sakhi website while each page has its own purpose-built design.

### Design consistency that must remain across all pages

Even with creative freedom, preserve:

- existing Sakhi logo exactly
- existing Sakhi brand color palette
- professional financial-institution tone
- typography system
- spacing discipline
- border/radius language
- animation quality
- motion smoothness
- header/footer system
- responsive quality
- content accuracy
- overall premium visual standard

Do not introduce an unrelated design style that makes inner pages feel like a different website.

### Phase interpretation

- **Phase 1 / Homepage:** faithful replication of `Sakhi1` + `Sakhi2`.
- **Phase 2 / Loans + Deposits:** original creative redesign using the Sakhi visual system; do not copy the Homepage layout.
- **Phase 3 / Services + Contact:** original creative redesign using the Sakhi visual system; do not copy the Homepage layout.
- **Phase 4:** refine consistency, motion, fluidity, responsiveness, and polish across the entire site without making all routes visually identical.

If any later section says or implies that Loans, Deposits, Services, or Contact must closely replicate the exact `Sakhi1`/`Sakhi2` layout, **this Design Scope Override takes precedence**.

## ECC is mandatory

This project **must use ECC**.

First check whether ECC is already installed:

```bash
codex plugin list --json
```

If `ecc@ecc` is already installed, use it and do not reinstall it.

If ECC is not installed, the client explicitly approves a **one-time installation** from:

```text
https://github.com/affaan-m/ecc
```

Use:

```bash
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc
codex plugin list --json
```

Do not use third-party mirrors.

Use the relevant ECC planning, frontend/design, review, and verification workflow.

---

## Overall project objective

Redesign from scratch:

```text
https://www.sakhimultistate.com/
```

This is only a **client-facing frontend prototype** running on localhost.

Do not add:

- backend
- database
- authentication
- OTP
- payment processing
- CMS
- APIs that are not needed for frontend rendering
- analytics/tracking
- production infrastructure
- unnecessary environment variables
- speculative future features

Keep the implementation lean.

A lightweight React/Vite frontend is acceptable if the repository is empty.

---

# HIGHEST PRIORITY DESIGN INSTRUCTION

The uploaded:

- `Sakhi1` — **reference video and highest-priority motion/interaction reference**
- `Sakhi2` — **main visual/layout reference**
- `Sakhi3` and `Sakhi4` — approved placeholder images

are the **exact approved design direction**.

Priority:

1. `Sakhi1` — authoritative reference for motion, transitions, scroll behavior, animation timing, interactions, sticky behavior, reveals, hover states, and scroll effects
2. `Sakhi2` — authoritative visual/layout reference
3. Existing Sakhi logo and brand color palette
4. `Sakhi3` and `Sakhi4` — approved placeholder imagery
5. Existing website — content source only

## You must replicate the approved references

Do not reinterpret the design.

Do not substitute generic fade animations for the actual reference motion.

Reproduce where visible:

- scroll-linked animation
- pinned/sticky sections
- masking
- clipping
- parallax
- image reveals
- text reveals
- counters
- marquee motion
- card expansion
- hover interaction
- cursor interaction
- layered transitions
- section overlap
- scale/transform transitions

Match:

- spacing
- typography feel
- hierarchy
- alignment
- proportions
- border behavior
- corner radii
- visual rhythm
- animation timing

Desktop fidelity comes first, then tablet/mobile adaptation.

Use Sakhi3/Sakhi4 where placeholder imagery is needed.

Do not fetch random stock images.

---

# Brand rules

## Logo

Keep the existing Sakhi logo exactly as it is.

Do not:

- redraw it
- recolor it
- modify proportions
- replace the icon
- modernize it

## Color palette

Keep the existing Sakhi brand color palette unchanged.

Do not introduce a replacement banking palette.

Neutral backgrounds/text shades are acceptable where needed, but core brand colors must remain unchanged.

---

# Required legacy-name replacement

Replace visible occurrences of:

```text
Hindustan Co-op Credit Society Ltd.
Hindustan Co-operative Credit Society Ltd.
Hindusthan Co-op Credit Society Ltd.
Hindusthan Cooperative Credit Society Ltd.
Hindusthan co-op credit society ltd
HCCS
```

with exactly:

```text
Sakhi Multistate Co-operative Credit Society
```

Also normalize obvious broken variants that refer to the same institution.

Do **not** change valid contact email/domain strings such as:

```text
info@hccs.co.in
```

unless replacement contact data is supplied.

Before final completion, search the entire visible frontend for legacy branding.

---

# Approved site structure

Only these public destinations are approved:

```text
Home
Our Products
  ├── Loans
  └── Deposits
Services
Contact
```

Recommended routes:

```text
/
/products/loans
/products/deposits
/services
/contact
```

Do not build:

- About Us
- Gallery
- Videos
- Testimonials
- standalone FAQ route
- Branches
- Privacy Policy
- Terms
- Careers
- News
- unrelated legacy pages

The homepage may contain the approved FAQ section.

---

# Header rules

The redesigned header must:

- remain fixed/sticky while scrolling
- be responsive
- visually follow the supplied references

Only approved navigation:

```text
Home
Our Products
  Loans
  Deposits
Services
Contact
```

Do not add:

- About
- Gallery
- Videos
- Testimonials
- FAQ link
- Branches
- Privacy
- Terms
- social links
- unnecessary login/dashboard buttons

---

# Footer rules

Footer navigation must contain only:

```text
Home
Loans
Deposits
Services
Contact
```

Approved contact data:

```text
B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East, Mumbai, 400072, Maharashtra, India
9920028810
info@hccs.co.in
```

Approved statement:

```text
Our goal at Sakhi Multistate Co-operative Credit Society is to provide access to various types of loans at competitive interest rates.
```

Remove legacy clutter:

- About Us
- Gallery
- Videos
- Testimonials
- FAQ link
- Privacy Policy
- Terms
- developer credit
- newsletter
- unrelated hyperlinks

Do not add social media links.

The old HCCS social handles are not approved.

---

# ============================================================
# PHASE 1 — FOUNDATION + GLOBAL DESIGN SYSTEM + HOMEPAGE
# ============================================================

## Objective

Build only:

- project/frontend foundation
- reusable design tokens/components needed now
- fixed header
- homepage
- enough global structure to support Phase 1 only

Do not build Product, Services, or Contact pages yet.

Do not add future route implementations.

---

## Homepage redesign

Complete visual redesign using the Sakhi1 video + Sakhi2.

### Completely remove

```text
Our Testimonials
```

Do not include:

- testimonial section
- testimonial slider
- testimonial quotes
- testimonial images
- testimonial navigation
- testimonial “View More”

---

## Homepage promotional topics

Use these only where appropriate within the approved reference layout:

### Pension Deposits

- Long-term savings discipline
- Protected retirement income

### Fixed Deposit

### Gold Loan

- Faster processing
- Safety of gold

Use Sakhi3/Sakhi4 as placeholder imagery where needed.

---

## Homepage figures

| Metric | Value |
|---|---:|
| Year of Service | 36 |
| Branches | 11 |
| Total Member | 46483+ |
| Funds | 9 cr |
| Deposit | 70 cr |
| Loan | 60 cr |
| Paid Up Share Capital | 6 cr |
| Turnover | 132 cr |

Use animated counters only if they match the reference design.

Do not alter these figures.

---

## Homepage featured products

Show:

- Daily Deposit
- Loan Against Deposits
- Daily 100 days Loan / 200 days Loan
- JLG Loan

During Phase 1 these may visually exist without navigating to unfinished Product pages.

If clicking them would create dead routes, either:

- keep them non-navigating temporarily, or
- use a clearly frontend-only interaction

Do not create Product pages early.

---

## Reasons to choose us

Preserve these ideas:

### Range of Products and Services

Diverse financial products/services including accounts, loans, online/mobile banking, and convenient banking features.

### Digital Banking Capabilities

User-friendly digital banking, secure transactions, mobile banking, and convenient fund transfers.

### Competitive Interest Rates

Stable and competitive rates on deposits and loans.

### Accessibility

A branch network that supports customers who prefer in-person banking and easy service access.

---

## Apply in three easy steps

```text
1. Complete the form
2. Get Approval
3. Secure Your Funds
```

---

## Eligibility CTA

Preserve this purpose:

```text
Help the user understand the loan amount they may be eligible for and what the EMI would be, then encourage them to apply according to eligibility.
```

No backend lending engine.

If the reference design includes a calculator, a frontend-only demo calculator is acceptable.

---

## Homepage FAQ

Keep the FAQ on the homepage.

It may be redesigned as accordions, cards, interactive panels, or another reference-matching format.

Preserve these facts:

- Current Account documentation includes the appropriate proprietor/company/LLP/partnership rubber stamp, personal/business Aadhaar and PAN information, three photos, business letterhead, Form G, MOA/AOA, and certificate of registration.
- Daily Deposit premature closure:
  - within 4 months: 4% penalty + Rs 20 service charge + 18% GST
  - 4–6 months: principal/deposit amount only, no interest
  - 6–12 months: 2% p.a. interest as stated by the source
  - on maturity: interest is earned
- Borrower and guarantor should not belong to the same family; spouse may be a co-borrower.
- The institution states it does not make accounts dormant and prefers continuous follow-up to keep them active.
- Shares cannot be transferred to another person; they may be withdrawn after 5 years from ownership.
- Members are the owners of the institution.
- The current site states the society has Grade A government-audit status.
- No hidden charges and no third-party commission; fees are disclosed.
- Senior citizens and ladies receive 0.25% extra on deposits.
- Online transfer facilities include mobile banking and QR-code facilities.
- Women empowerment is strongly focused through the JLG concept.

Apply the legacy-name replacement rule throughout.

---

# PHASE 1 QA CHECKPOINT

Before stopping:

- [ ] ECC used
- [ ] frontend runs on localhost
- [ ] fixed header implemented
- [ ] header has only approved links
- [ ] homepage visually follows supplied references
- [ ] homepage animations/transitions follow the reference
- [ ] logo unchanged
- [ ] color palette unchanged
- [ ] testimonials fully removed
- [ ] figures correct
- [ ] featured products shown
- [ ] reasons-to-choose-us content retained
- [ ] 3-step section retained
- [ ] FAQ retained
- [ ] no Services/Product/Contact page implementation yet
- [ ] no backend/API/database/auth code
- [ ] no console errors

## STOP AFTER PHASE 1

Return only:

- what was completed
- localhost URL
- run command
- a short “What to QA” list

Then STOP and wait for explicit approval to proceed to Phase 2.

---

# ============================================================
# PHASE 2 — OUR PRODUCTS: DEPOSITS + LOANS
# ============================================================

Start this phase only after explicit user approval.

## Objective

Build:

```text
/products/deposits
/products/loans
```

Complete redesign from scratch using the exact approved design language.

Do not build Services or Contact yet.

---

# Product interaction rule

Avoid unnecessary product-detail routes.

Product details may open through:

- expansion
- animated panel
- modal
- drawer
- accordion
- reference-matching interaction

If “Apply Now” appears, it is frontend-only.

Allowed fields:

```text
Name
Phone Number
Email
```

No network request.

---

# Deposit products

## Savings Account

Tagline:

```text
Do not save what is left after spending, but spend what is left after saving.
```

Features:

- Easy transactions
- Mobile banking
- QR code
- Zero balance account if opened online

Rate:

```text
3.5%
```

Eligibility:

- No age limit
- Any individual who is an Indian citizen

Documents:

- Aadhaar card
- PAN card
- Three photos

---

## Current Account

Tagline:

```text
Chase the vision, not the money, the money will end up following you.
```

Features:

- No limit on maximum deposit amount
- No limit on withdrawals

Interest:

```text
No interest is paid on the Current Account.
```

Eligibility:

- Age limit
- Private and public limited companies
- Partnership companies
- Sole proprietorship

Documents:

- Rubber Stamp: Proprietor / Private Limited / Limited Liability Partnership (LLP) / Partnership firm
- Aadhaar card
- Personal and Business PAN card
- Three photos
- Business letterhead
- Form G
- MOA & AOA
- Certificate of Registration

Do not invent a numeric age value.

---

## Recurring Deposits

Tagline:

```text
Recurring Deposits, build your savings bit by bit.
```

Features:

- Minimum investment: Rs 500
- No maximum amount limit

Rate:

```text
6.50% to 8.00%
```

Eligibility:

- No age limit

Documents:

- Aadhaar card
- PAN card
- Three photos

---

## Fixed Deposits

Tagline:

```text
Fixed Deposit for your future.
```

Features:

- No maximum deposit limit

Rate:

```text
5.5% to 9%
```

Additional benefit:

```text
0.25% extra on Fixed Deposit returns for Senior Citizens and Ladies
```

Eligibility:

- No age limit

Documents:

- Aadhaar card
- PAN card
- Three photos

---

## DAM Duppat Deposits

Keep this exact product name:

```text
DAM Duppat Deposits
```

Offer:

```text
Invest a minimum amount of Rs 5,000 and above and get double the amount in 96 months.
```

---

## Lakhpati Deposit

Tagline:

```text
Smart today for better tomorrow
```

### Table A

| Deposit Amount | Period | Maturity Amount |
|---:|---:|---:|
| 1,400 | 60 | 1,00,000 |
| 2,800 | 60 | 2,00,000 |
| 4,200 | 60 | 3,00,000 |
| 5,600 | 60 | 4,00,000 |
| 7,000 | 60 | 5,00,000 |
| 14,000 | 60 | 10,00,000 |
| 21,000 | 60 | 15,00,000 |
| 28,000 | 60 | 20,00,000 |
| 35,000 | 60 | 25,00,000 |

### Table B

| Deposit Amount | Period | Maturity Amount |
|---:|---:|---:|
| 8,050 | 12 | 1,00,000 |
| 3,900 | 24 | 1,00,000 |
| 2,510 | 36 | 1,00,000 |
| 1,820 | 48 | 1,00,000 |
| 1,400 | 60 | 1,00,000 |
| 1,130 | 72 | 1,00,000 |

Do not extrapolate values.

---

## Pension Deposits

Copy:

```text
May your retirement be filled with many relaxing days and exciting new adventures. Invest now to have relaxing days.
```

Rates:

| Period | Interest |
|---:|---:|
| 12 | 7.50% |
| 24 | 8.00% |
| 36 | 9.00% |

Do not invent a period unit.

---

## Daily Deposit

Tagline:

```text
If you don't make putting money away for the future a priority, you'll never get around to doing it.
```

Features:

- Can be opened with a minimum balance of Rs 50
- No maximum deposit amount

Rate:

```text
5% to 7%
```

Eligibility:

- No age limit
- No maximum amount limit

Documents:

- Aadhaar card
- PAN card
- Three photos

---

# Loan products

## Personal Loan

Tagline:

```text
Are you choosing the best personal loan for your needs?
```

Features:

- Loan limit up to Rs 1,00,000
- Tenure: 12 to 24 months
- Easy EMI facility

Rate:

```text
18%
```

Eligibility:

```text
Age 21 to 55 years
```

Documents:

- Aadhaar card
- PAN card
- Income certificate
- Light bill
- Six photos
- 2 cheques
- Bank statement — 6 months
- Ration card
- NOC from family member

---

## Gold Loan

Tagline:

```text
A dream comes true, sponsored by your Gold.
```

Features:

- Less documentation
- Fast processing

Eligibility:

```text
18 years and above
```

Documents:

- Aadhaar card
- PAN card
- Bank details

---

## Loan Against Deposits

Message:

```text
Need not break Fixed Deposits; get quick disbursal of a loan against Fixed Deposits.
```

Rate:

```text
2% more than the rate of returns of the deposits
```

Eligibility:

```text
18 years and above
```

Documents:

- Aadhaar card
- PAN card
- Bank details

---

## Mortgage Loan

Tagline:

```text
Mortgage. To help you build, buy or refinance.
```

Features:

- Loan limit: minimum Rs 1,00,000 up to Rs 5,00,000
- Tenure: 24 to 36 months

Interest:

```text
18%
```

Eligibility:

- Age 21 to 55 years
- Registration of mortgage is mandatory for loans in branches outside Mumbai

Documents/conditions:

- Aadhaar card
- PAN card
- Income certificate
- Light bill
- Six photos
- 2 cheques
- Bank statement — 6 months
- Ration card
- NOC from a family member
- A room or flat mortgage is mandatory for the above loan

---

## Daily 100 days Loan / 200 days Loan

Tagline:

```text
Need super fast approved loans?
```

Features:

- Daily-basis collection
- Less documentation

Eligibility:

- Age 20 to 57 years
- Business oriented

Documents:

- Aadhaar card
- PAN card
- Light bill
- Gumasta license
- 2 cheques
- Bank details and statement
- Income certificate

---

## JLG Loan

Tagline:

```text
Behind every successful woman is a tribe of other successful women, who have her back.
```

Features:

- Only for a group of women
- Only for married women with 2 years of marriage stability

Eligibility:

- Age 21 to 56 years
- Not applicable to rented customers

Documents:

- Aadhaar card
- PAN card / Voter ID
- Light bill
- Bank details
- Marriage proof

---

## PDC Loan

Tagline:

```text
Stop being chained down by bad credit, we have the key to set you free.
```

Features:

- Loan limit: Rs 25,000 up to Rs 1,00,000
- Easy EMI facility

Rate:

```text
18%
```

Eligibility:

```text
Age 21 to 55 years
```

Documents:

- Aadhaar card
- PAN card
- Income certificate
- Light bill
- Six photos
- 2 cheques
- Bank statement — 6 months
- Ration card
- NOC from family member

---

# PHASE 2 QA CHECKPOINT

Before stopping:

- [ ] Deposits page built
- [ ] Loans page built
- [ ] all 8 deposit products present
- [ ] all 7 loan products present
- [ ] rates/limits/periods unchanged
- [ ] no invented values
- [ ] product interactions match the reference style
- [ ] frontend-only forms make no network requests
- [ ] header navigation now correctly reaches Loans and Deposits
- [ ] responsive behavior tested
- [ ] no Services/Contact implementation yet
- [ ] no console errors

## STOP AFTER PHASE 2

Return:

- completed work
- localhost URL
- run command
- short “What to QA” list

Then STOP and wait for explicit approval to proceed to Phase 3.

---

# ============================================================
# PHASE 3 — SERVICES + CONTACT + FOOTER
# ============================================================

Start only after explicit user approval.

## Objective

Build:

```text
/services
/contact
```

and complete the redesigned footer.

Do not begin final site-wide animation polish beyond what these pages require.

---

# Services

The Services page must be completely redesigned.

## Important

Do not recreate individual service routes.

Do not add:

```text
Read More
```

Do not build:

```text
/services/mobile-banking
/services/neft
/services/rtgs
/services/qr
/services/door-to-door
```

Service items are presentation-only.

Allowed UI:

- cards
- panels
- accordions
- hover reveals
- expandable sections
- scroll-driven layout

---

## Mobile Banking

Preserve:

- Instant transaction amount stated by the site: Rs 2,00,000
- Round-the-clock account access
- Check balances
- Review transaction history
- Monitor finances from mobile devices
- Reduce reliance on paper statements, physical checks, and frequent branch visits
- Removes geographical barriers
- Useful for customers with limited mobility or remote access needs
- View account activity
- Receive real-time notifications for balances, deposits, and withdrawals

---

## NEFT

Preserve:

- Electronic transfer from one bank account to another
- Can be initiated using online banking, mobile banking, or at a branch
- Secure and reliable
- Requires beneficiary account number, bank branch, and IFSC

---

## RTGS

Preserve:

- Immediate/real-time settlement of fund transfers
- Recipient receives funds quickly
- Secure and reliable
- Useful for efficient and time-sensitive payments
- Reduces physical movement of funds, paperwork, and delays

---

## QR Code Payments

Preserve:

- Instant transaction amount stated by the site: Rs 1,00,000
- Fast smartphone scan-to-pay flow
- Contactless transactions
- Wide merchant/business/service-provider acceptance
- Typically lower transaction cost than traditional payment methods
- Can help small and medium businesses reduce processing costs

---

## Door to Door Services

Preserve:

- Supports financial inclusion where banking infrastructure access is limited
- Helps build stronger customer relationships
- Intended to improve customer satisfaction
- Facilitates collection/submission of documents
- Helps reduce administrative burden

---

# Contact page

Completely redesign to fit Sakhi1/Sakhi2/video.

Required text:

```text
Contact Us
Get In Touch
Reach out to us & we will respond as soon as we can.
```

Frontend-only form:

```text
Name
Email
Phone
Message
Submit
```

No backend/network submission.

Secondary copy:

```text
We are here to help you
```

Also preserve:

```text
Various versions have evolved over the years sometimes by accident sometimes on purpose injected humour and the like.
```

if it fits the approved layout.

Contact information:

```text
Branch Office
B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East
Mumbai, 400072
Maharashtra, India

Call us at
9920028810

Email Address
info@hccs.co.in
```

`tel:` and `mailto:` links are allowed.

Do not create unrelated hyperlinks.

---

# Footer implementation

Footer navigation:

```text
Home
Loans
Deposits
Services
Contact
```

Contact data:

```text
B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East, Mumbai, 400072, Maharashtra, India
9920028810
info@hccs.co.in
```

Footer statement:

```text
Our goal at Sakhi Multistate Co-operative Credit Society is to provide access to various types of loans at competitive interest rates.
```

No social icons.

No legacy extra links.

---

# PHASE 3 QA CHECKPOINT

Before stopping:

- [ ] Services page built
- [ ] all 5 approved services present
- [ ] no service “Read More” links
- [ ] no service detail routes
- [ ] Contact page built
- [ ] contact data correct
- [ ] form is frontend-only
- [ ] form makes no network request
- [ ] footer built
- [ ] footer contains only approved links
- [ ] no social links
- [ ] no legacy footer clutter
- [ ] responsive behavior tested
- [ ] no console errors

## STOP AFTER PHASE 3

Return:

- completed work
- localhost URL
- run command
- short “What to QA” list

Then STOP and wait for explicit approval to proceed to Phase 4.

---

# ============================================================
# PHASE 4 — MOTION FIDELITY + RESPONSIVE POLISH + FINAL QA
# ============================================================

Start only after explicit user approval.

## Objective

Do not add new pages or new product/service content.

This phase is exclusively for:

- exact motion refinement
- transition fidelity
- interaction polish
- responsive refinement
- consistency
- accessibility safeguards
- cleanup
- final visual QA

---

# Required visual QA loop

1. Run all routes locally.
2. Inspect every route at desktop size.
3. Compare against Sakhi1 and Sakhi2.
4. Replay and inspect `Sakhi1`, the supplied reference video.
5. Compare:
   - start states
   - mid-animation states
   - final states
   - scroll timing
   - easing
   - pin duration
   - reveal timing
   - hover behavior
   - section overlap
   - transform scale
6. Use browser screenshots/Playwright where helpful.
7. Fix:
   - spacing
   - typography
   - alignment
   - clipping
   - scale
   - timing
   - layout shifts
8. Test tablet.
9. Test mobile.
10. Verify fixed header behavior on every page.
11. Verify all product interactions.
12. Verify Services has no extra hyperlinks.
13. Verify Contact form makes no network request.
14. Search project-wide for old branding.
15. Verify Testimonials are absent.
16. Verify only approved header/footer navigation.
17. Verify localhost command works from a fresh terminal.

Do not stop at the first acceptable pass.

Iterate until the frontend is visually close to the approved references.

---

# Performance discipline

- Avoid unnecessary dependencies
- Avoid multiple overlapping animation libraries
- Reuse components appropriately
- Keep DOM complexity reasonable
- Prefer transform/opacity animations
- Respect `prefers-reduced-motion`
- Prevent layout shifts
- Optimize local imagery
- Remove dead code
- Remove unused routes
- Remove unused assets
- No console errors
- No broken links

---

# FINAL ACCEPTANCE CHECKLIST

- [ ] ECC used
- [ ] frontend runs on localhost
- [ ] no backend/API/database/auth/payment implementation
- [ ] design closely replicates Sakhi1 video + Sakhi2
- [ ] Sakhi3/Sakhi4 used where placeholder imagery is needed
- [ ] logo unchanged
- [ ] brand palette unchanged
- [ ] header fixed
- [ ] header only includes approved navigation
- [ ] footer only includes approved navigation/contact content
- [ ] no social links
- [ ] homepage content retained
- [ ] testimonials fully removed
- [ ] homepage FAQ retained
- [ ] 8 deposit products present
- [ ] 7 loan products present
- [ ] no invented product values
- [ ] 5 approved services present
- [ ] no service-detail routes
- [ ] Contact content retained
- [ ] Contact form is frontend-only
- [ ] visible legacy HCCS/Hindustan/Hindusthan branding normalized
- [ ] valid contact email/domain retained
- [ ] no About/Gallery/Videos/Branches/Privacy/Terms/Newsletter clutter
- [ ] animations smooth and reference-faithful
- [ ] desktop/tablet/mobile usable
- [ ] no console errors
- [ ] no broken navigation

---

# FINAL PHASE 4 RESPONSE

After all checks are complete, return only:

- concise summary of final work
- localhost URL/port
- exact run command
- any unavoidable limitation caused by a genuinely missing supplied asset

Do not add recommendations or alternative design suggestions.
