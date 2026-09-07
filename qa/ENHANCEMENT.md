# Post-completion enhancement record

Verified on 5 September 2026. The website content, product records, service records, contact details, brand rules and routes remain governed by `sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md`. The later post-completion amendment governs this visual, responsive and interaction pass.

## Design and responsive implementation

- Sampled the existing logo without modifying it. The interface now uses its institutional blue (`#004ca3`) as the dominant color and its olive green (`#66813a`) for savings and growth. Coral/red/yellow remain small accents.
- Replaced the fixed desktop shell with a fluid 92–95vw composition. Type, spacing, illustration scale, grids and section depth adapt through `clamp()`, flexible grid tracks and dedicated large-screen breakpoints.
- Added restrained grid, radial-light, line and tinted-surface treatments while retaining readable text widths.
- Added a fast local CSS route entrance, intersection-based section reveals, staggered cards, card spotlights, varied hover feedback and synchronized branch transitions. Reduced-motion users receive static content and no running decorative motion.
- Added a Loans calculator using the specified amortized EMI equation and published 18% product rate. Personal Loan and Mortgage Loan are offered because both have a published numeric rate and published amount/tenure limits. The calculator makes no network request.
- Added Fixed Deposit and Recurring Deposit illustrative calculators. Both use only published rate ranges and disclose the simple-interest/no-compounding assumption. Recurring contributions are modelled at the beginning of each month. The calculators make no network requests.

## India-wide branch research

The investigation used the exact identity **Sakhi Multi State Cooperative Credit Society Ltd**, registration **MSCS/CR/667/2012**, to exclude unrelated businesses and schemes containing “Sakhi.” Queries covered the organization name and registration number nationally, Maharashtra, Karnataka, Bengaluru, Belagavi, Bidar, Kalaburagi/Gulbarga, Gujarat, Delhi, Telangana, Tamil Nadu and Kerala. Search categories included the official site, Central Registrar records, Ministry of Cooperation records, indexed business listings and directories.

Primary evidence:

- [Official Sakhi branch directory](https://www.sakhimultistate.com/branches): twelve named branches with addresses and contact details, all in Maharashtra.
- [Official Sakhi Our Story](https://www.sakhimultistate.com/About/our-story): registration identity and stated Maharashtra/Karnataka operating territory.
- [Central Registrar election order](https://crcs.gov.in/public/uploads/society_notification/667baca57bad3_roorder%26electionprogramforsakhimultistatecooperativecreditsocietyltd.pdf): corroborates the society identity, registration context and Andheri contact.
- [Ministry of Cooperation list](https://www.cooperation.gov.in/sites/default/files/2023-08/Training_1.pdf): corroborates the registered society and a Solapur record. It was not treated as proof of an additional customer branch.

The verified interactive dataset contains these twelve Maharashtra locations:

1. Head Office / Andheri, Mumbai
2. Jarimari, Mumbai
3. Jogeshwari, Mumbai
4. Ghatkopar, Mumbai
5. Chembur, Mumbai
6. Thane
7. Borivali, Mumbai
8. Pusesavali, Satara district
9. Tembhurni, Solapur district
10. Chinchwad, Pune district
11. Panvel, Raigad district
12. Satara

Karnataka is shown as a researched operating territory because the official site names it, but it has no marker or branch card: no exact current Karnataka branch address could be verified confidently. No additional state produced a location with enough evidence to display. Results for unrelated Sakhi entities, “Bank Sakhi” schemes and weak directory-only listings were excluded. Secondary listings mentioning a Solapur railway-road office, a different Andheri building, Vaijapur recruitment and employee locations were also excluded because they did not establish a current branch of this exact society.

The Andheri records conflict: official materials variously show B-702, B-703 and B-706 at Sagar Tech Plaza. The interface preserves the already approved B-703 address from the project brief and contact page, which is also present in the Central Registrar election material, rather than silently changing approved contact data.

## Map implementation

The map is a local SVG and requires no external runtime or map API. Its state geometry is adapted from the MIT-licensed [React India Map project](https://github.com/vishalvoid/react-india-map), with a visible source credit in the interface. It is presented as a stylized administrative visualization. Maharashtra is the only verified active state; Karnataka has a distinct researched-territory treatment. The twelve city markers use approximate visual coordinates while every displayed address and contact comes from the verified branch dataset.

Desktop provides state filters, synchronized markers, a selected-branch panel and a two-column branch list. Mobile provides the whole-India map, a touch-friendly state select and horizontally scrollable branch cards. Selecting a marker or card updates the same branch detail state.

## Verification

- `npm run build`: passed.
- `npm run qa`: passed at desktop, tablet, mobile and 320px; 11 FAQs, sticky header, navigation, links, eligibility and reduced motion passed.
- `npm run qa:products`: passed for all 8 deposit and 7 loan products; every Markdown fact and table matched; dialogs, focus return, form previews, responsive bounds and zero submissions passed.
- `npm run qa:creative`: rate switcher, filters, 6 Lakhpati rows, 3 loan spotlights, all 7 loan eligibility selectors, reveals and reduced motion passed across four viewport classes.
- `npm run qa:phase3`: 30 service facts, accordions, contact validation, footer destinations and zero contact requests passed across four viewport classes.
- `npm run qa:final`: 35 route/viewport checks across five routes and seven viewport classes passed; no console or request failures; dialog transitions, live reduced-motion switching, approved content hashes and the logo passed.
- `node qa/product-navigation.mjs`: all four featured destinations, close control, backdrop dismissal and form screenshots passed.
- `node qa/keyboard-motion.mjs`: keyboard focus and periodic hero motion passed.
- `npm run qa:enhancement`: 155 checks passed at 1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160, 768×1024 and 390×844 on all five routes. It also verified 92%+ desktop shell width, no horizontal overflow, 12 markers/cards, Maharashtra/Karnataka behavior, marker/card synchronization, exact calculator values, route navigation and zero console/page/request errors.

Full-page captures are in `qa/enhancement-screens/`; focused mobile and 4K captures are in `qa/enhancement-screens/sections/`.
