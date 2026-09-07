# Phase 3 - Services, Contact and footer

Authority: `sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md`, especially its Design Scope Override. The user approved starting Phase 3. This work implements only the two new routes, their required interactions, the shared footer and working header links. Phase 4 has not started.

## ECC workflow and implementation

Used installed ECC 2.2.1 planning, frontend-design-direction, code-reviewer, browser-qa and verification-loop guidance. The CLI installation check could not resolve its home directory in this shell; the previously verified local ECC installation and its instruction files were available and used. No reinstall or additional dependency was needed.

Implementation sequence:

1. Read the override and complete Phase 3 requirements. Save the approved source hashes and homepage component source before editing.
2. Transcribe all 30 service facts directly from the brief into `src/service-data.js`.
3. Build Services as a presentation page with a five-service directory, original mobile banking illustration, transfer panels, a QR illustration and a door-to-door section. Expandable details preserve every supplied fact. No service detail routes, payment controls, downloads or Read More links.
4. Build Contact around the supplied contact details and the four-field local form. Retain required copy. Omit the optional legacy filler sentence because it does not fit the focused contact layout.
5. Add the approved footer to all existing routes and activate Services/Contact in the existing header. Preserve the logo, main page components and product files.
6. Build and check responsive layouts, exact content, keyboard behavior, form validation, navigation and existing functionality. Review screenshots and fix discrepancies before stopping at Phase 3.

## Design decisions

- Services uses an editorial directory and distinct service compositions. Muted neutral panels, Sakhi green and orange support the existing brand. A gently moving phone illustration, transfer indicators and a scanning line illustrate the service concepts without imitating a functioning banking app. All illustrations are local SVG/CSS.
- Contact uses generous typography, a small contact emblem, a sticky desktop contact column and a warm neutral form panel. Mobile stacks the contact details and form. Links use only the approved telephone and email destinations.
- Footer uses an unchanged logo on white, the exact institution statement, five navigation links, the address, telephone and email. No social links, newsletter, unrelated destinations or legacy clutter.
- Existing reduced-motion behavior applies to new animations. Accordion controls expose expanded state and hide collapsed content from keyboard/assistive navigation. Directory controls move keyboard focus to the chosen service heading. Form labels, native validation and completion focus are implemented.

## Verification evidence

- Production build: passed.
- `npm run qa:phase3`: passed at 1440x1000, 768x1024, 375x812 and 320x740. All 30 service facts compared with the Markdown brief; all five services and all required contact/footer information present. No horizontal overflow.
- Service accordion expand/collapse, directory navigation, reduced motion and sticky header checks passed. No service detail links or Read More actions.
- Contact rejects empty values, whitespace-only name/message, malformed email and invalid phone. A valid local preview clears input values, moves focus to an explicit not-sent status and supports returning to an empty form. Zero requests during preview; no local/session storage.
- All five footer destinations navigate correctly; footer contains exactly five page links plus approved telephone/email links. Contact reload works. No console errors or failed requests in Phase 3 checks.
- Existing Homepage QA passed at all four sizes. Existing product QA was rerun for all products and responsive viewports after integration. Test selectors were scoped to accommodate duplicate footer destinations, and legacy-name checks retain the explicitly approved `info@hccs.co.in` exception.
- Approved-source comparison: every pre-existing source file except `src/main.jsx` is byte-identical to the Phase 3 baseline, including all product data, product presentation, global styles, shared UI and logo. Homepage component bodies are identical. Changes in `main.jsx` are limited to imports, route selection, header links/current state and the shared footer.
- Visual review: desktop full pages, tablet layouts, mobile/narrow-mobile layouts and contact preview states. Fixed joined words in responsive Services copy, rounded the footer base, increased form placeholder contrast and centered the Contact completion/focus target so the fixed header cannot obscure it.
- ECC review: no unresolved critical/high findings. Form submission is prevented and input values are never transmitted, persisted or logged. No backend, API, new dependency or future-phase scaffolding was added.

Results: `qa/phase3-results.json`, `qa/results.json`, `qa/phase2-results.json`. Screenshots: `qa/screenshots/phase3/`. Source baseline: `qa/phase3-baseline/`. New-page screenshots are the initial visual baseline and still require the user's manual design approval; no automated visual-equivalence claim is made for them.

No dedicated lint/type configuration exists in this JavaScript project. Build and browser checks were used; no coverage or full WCAG conformance claim is made.

Run `npm run dev` from `C:\Users\Krish\Desktop\Sakhi`. Local server: `http://127.0.0.1:5173`. Stop after Phase 3 for manual QA.
