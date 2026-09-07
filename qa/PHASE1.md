# Phase 1 implementation and verification

Authority: `sakhi_codex_redesign_prompt_4_phase_QA_edited.md`, limited to Phase 1 by the user's request.

## ECC workflow
- `codex plugin list --json` verified ecc@ecc 2.2.1 installed and enabled, sourced from https://github.com/affaan-m/ECC.git. No reinstall.
- Applied ECC planner requirements/dependency/acceptance workflow, frontend-design-direction, code-reviewer checklist, verification-loop and browser-qa.

## Plan and scope
1. Inspect the supplied layout and all 16.47 seconds of the supplied video. Save a 12-frame contact sheet for motion analysis.
2. Retrieve the original logo without alteration and verify the original orange (#EF7E1A) and green (#01995B). Retain logo blue within the original image.
3. Build only the React/Vite homepage: sticky navigation, layered hero, four featured products, reasons, eight figures, eligibility guidance, approved promotional topics, three steps, eleven FAQs.
4. Match the wide white rounded shell, orange adaptation of the reference's bright hero, overlapping tilted panels, pale feature cards, open advantages grid, centered figures, dark inset banner and alternating promotional layouts.
5. Build and browser-test desktop, tablet and mobile. Review screenshots, navigation, FAQ, eligibility interaction, keyboard use, reduced motion, overflow and console errors. Fix before handoff.

## Reference observations
- Sakhi1: 1600 × 1200, 16.4667 seconds. Hero remains visible throughout; slight periodic vertical/rotational movement in the layered composition. No demonstrated scrolling, pinned sections, counter animation, text reveals, cursor interaction or expanding cards. Do not invent those sequences.
- Sakhi2: 1024 × 3337. Neutral outer canvas, white rounded page, modest header, approximately 2:1 hero, two tall overlapping panels crossing the hero's lower edge, generous section spacing, light product cards, fine separators, inset dark CTA and alternating visual/text rows.
- Sakhi3 and Sakhi4 copied unchanged for approved rupee imagery. Original logo copied unchanged from the existing website.
- Future header destinations remain aria-disabled buttons. No product, service or contact routes, route stubs, forms, footer, backend or authentication have been implemented.
- Eligibility expands inline guidance and offers the approved telephone number. The video/layout contains no calculator, so no calculator or invented eligibility result is added.

## Validation
Results and screenshots are produced by `npm run qa`. This is a Phase 1 functional and responsive check, plus human inspection of screenshots against the supplied references; it does not claim pixel equality with the different reference brand or a prior approved screenshot baseline.

## Completed checks
- Production build: PASS. JavaScript syntax checks: PASS. No TypeScript or lint framework is configured; no unrelated tooling was added.
- Playwright: PASS at 1440×1000, 768×1024, 375×812 and 320×740. Eight exact figures, four featured products, eleven working FAQs, eligibility disclosure, menu, valid in-page targets, sticky header, loaded assets, no horizontal overflow, no hero clipping and reduced-motion behavior checked.
- Console/page errors: 0. Failed requests: 0.
- Inspected desktop and tablet hero screenshots, desktop/tablet full-page screenshots, narrow mobile hero and mobile full-page screenshots. Fixed obscured hero copy, tablet decoration overlap, mobile panel clipping and missing favicon.
- ECC code review: no remaining critical/high findings. Fixed keyboard focus restoration when the product dropdown is dismissed using Escape. Reviewed scope, all source files, effect cleanup, local interactions and fixed content. No network submissions, credentials, backend, future routes or hidden page implementations.
- Legacy-name and testimonial scan in rendered frontend: clean. The original Sakhi logo and both approved placeholder images are unchanged. Placeholder hashes match the user's originals.
- A full redesigned footer is intentionally deferred to Phase 3 as required by the brief.
