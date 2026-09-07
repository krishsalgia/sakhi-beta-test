# Manual-QA corrections and homepage entrance

Scope: the ten issues in the user's latest manual-QA amendment, after completion of all four phases. The creative-inner-pages Markdown remains authoritative for copy, product records, services, routes and branding. No phase or backend was added. ECC motion-ui and browser-qa guidance was applied using the existing CSS/React motion system and installed Playwright/Chrome.

## Corrections

1. The shell now spans the viewport. A shared fluid gutter retains the inner content alignment, while the opaque sticky header reaches both viewport edges with square outer corners. This removes the nested-container seam and the colored wedges exposed by the old rounded header.
2. Featured cards reserve separate grid rows for copy and artwork. Titles wrap at full available width. The illustrations, lift, spotlight and graphic hover movements remain; the calendar rotates around its center so it cannot crowd the text at narrow widths.
3. The same three application steps sit in a compact connected process panel. The line reveals with the section, and markers respond on hover. Mobile uses a vertical connector.
4. Loan rows retain their editorial list and expanding hover wash. The default layout adds restrained SVG product emblems, a rate/fact area with a separator, and the first eligibility fact from the existing approved product record.
5. The loan hero arch and arrow use SVG at every breakpoint. The arch and white spotlight card share an intrinsic vertical composition without overlap, retaining their existing pointer and idle motion.
6. The Lakhpati panel uses content-driven height, centered columns and tighter fluid spacing. All six Table B periods, deposit values and maturity values remain intact.
7. The Deposits-to-Loans CTA aligns the original copy, integrated vector path and original link in one responsive row, stacking on mobile.
8. Service selection tiles derive their height from the content. Each adds one existing approved service fact, an icon surface and a restrained line cue. Existing hover and section-jump behavior remain. No service route or Read More control was added.

The current override is isolated in `src/polish.css`. Calculators, branch records/map, product data, service data, contact form, footer, logo and route logic were not modified. The homepage protection check now starts at `ProductArt`, allowing the explicitly requested Hero markup wrappers while still guarding all later homepage components.

## Homepage entrance

The existing final layout, copy and child-card floating animations are preserved. Entry transforms live on new wrappers and settle to `transform: none`:

| Element | Delay | Duration | Treatment |
| --- | --- | --- | --- |
| Blue panel | 0 ms | 750 ms | Shallow clip and opacity reveal |
| Headline lines | 150 / 260 ms | 800 ms | Separate masked upward reveals |
| Supporting paragraph | 400 ms | 650 ms | 18px upward settle |
| Product CTA / Find out more | 500 / 600 ms | 650 ms | Staggered upward settle |
| Dark card | 250 ms | 1150 ms | Right offset, slight rotation and scale |
| Savings card | 400 ms | 1200 ms | Opposing offset and rotation |
| Spark | 650 ms | 650 ms | Small scale and rotation settle |
| Existing scribble | 600 ms | 1000 ms | SVG stroke drawing |
| Existing graph | 900 ms | 850 ms | SVG stroke drawing |

The sequence completes in approximately 1.75 seconds. Mobile uses smaller card offsets and rotations, with card delays of 450 / 580 ms (complete by 1.78 seconds). No loading screen or interaction lock is introduced. Keyboard focus immediately reveals the focused CTA. The sequence runs when Home mounts, including actual route navigation, and does not replay on ordinary scroll re-entry. Reduced motion removes the entrance and decorative loops.

## Browser evidence

- `qa/polish/before/`: focused captures of the original reported problems.
- `qa/polish/viewports/`: final screenshots of the specified sections at five desktop widths, tablet, mobile and 320px.
- `qa/polish/entrance/`: 0, 320, 700, 1250 and 1850ms desktop/mobile sequence frames and computed animation states.
- `qa/polish/results.json`: route/viewport checks, console/request errors, entrance layout shift, sticky edge coverage, card spacing and Home revisit behavior.

Run the server with `npm run dev`, then `npm run qa:polish` and `node qa/hero-sequence.mjs`. Existing product, creative interaction, service/contact, final and enhancement suites cover data accuracy and preserved functionality.

Verified on 5 September 2026:

- Production build passed.
- Polish checks passed for all 40 route/viewport combinations: 1366x768, 1440x900, 1920x1080, 2560x1440, 3840x2160, 768x1024, 390x844 and 320x740 across Home, Loans, Deposits, Services and Contact. No horizontal overflow or console/page/request errors; entrance layout shift stayed below 0.01.
- Desktop/mobile entrance sequence checks passed. Early CTA click, hard refresh, all four inner-route arrivals at Home and no replay on scroll passed.
- All 15 product records and their tables matched the authoritative brief; dialogs, keyboard focus and local preview forms passed.
- Product interactions passed: rate switcher, filters, all six Lakhpati rows, three loan spotlights and seven eligibility selectors.
- Service/contact checks passed, including all 30 service facts, accordions, keyboard behavior, validation, footer destinations and no form requests.
- The existing final suite passed all 35 route/viewport combinations; approved content and logo hashes were unchanged.
- The enhancement suite passed all 155 checks, including loan/deposit calculations, branch selection, state filters, responsive navigation and route transitions.
- Homepage QA passed at four viewport sizes; featured-product destinations, dialog dismissal, keyboard focus and the original periodic hero motion also passed.
- `node qa/polish-hover.mjs` passed at all seven required widths: the loan row wash, CTA arrow rotation and service hover background retain their existing behavior. Resting loan-list screenshots were captured for visual inspection.
