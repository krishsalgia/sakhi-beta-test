# Phase 2 redesign ? Loans and Deposits

Source of truth: `sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md`, with its authoritative Design Scope Override. Scope is only `/products/loans` and `/products/deposits`. Phase 3 and Phase 4 are not implemented.

ECC 2.2.1 was already installed and was not reinstalled. Applied its planning, frontend-design-direction, code review, verification-loop and browser-qa workflows. No dependencies were added for this redesign.

## Design and implementation

- Deposits: a light editorial composition, original animated coin sculpture, three-product rate switcher, sticky category navigation and filtered savings collection. Fixed and Pension Deposits anchor the collection. The Lakhpati explorer displays only the six supplied Table B rows; it performs no return calculations and adds no period units. All deposit details and complete tables remain available in a modal.
- Loans: a dark architectural hero with an orange arch sculpture, three selectable product spotlights, a numbered product ledger, an eligibility/document selector covering all seven loans, and a full-height detail drawer. Complete requirements remain available for every product.
- Shared quality: the existing typography and Sakhi palette, restrained pointer response, viewport reveals, keyboard-visible focus and reduced-motion support. Pointer and observer effects clean up on unmount. CSS is scoped to the product experiences.
- The approved homepage, fixed header, navigation, logo, shared UI and underlying product data were preserved. Product details retain the local three-field application preview. No application is sent or saved.

## Verification

- Production build passed.
- `npm run qa:products`: both routes passed at 1440?1000, 768?1024, 375?812 and 320?740. All 15 products' facts, eligibility, documents and every table cell were compared directly with the new Markdown brief at each viewport. No page/dialog horizontal overflow, console errors or submission requests.
- `npm run qa:creative`: all four viewports passed. Verified three exact rate displays, four filters, every Lakhpati Table B option using the keyboard, all three loan spotlights, all seven eligibility selections, actual scroll-triggered reveals, pointer reset and reduced motion.
- Modal/drawer checks passed: focus containment and restoration, Escape, close button, backdrop dismissal and long-content scrolling. Forms reject invalid input, accept valid local previews, clear values, and use no storage or network submission.
- `node qa/product-navigation.mjs`: all four homepage featured links opened their matching products; desktop/mobile application and settled drawer screenshots captured.
- `npm run qa`: all homepage checks passed at all four viewports, including the fixed header, navigation, FAQ and eligibility interactions. No console errors or failed requests.
- Homepage protection: hashes for `src/main.jsx`, `src/styles.css`, `src/content.js`, `src/ui.jsx`, `src/product-data.js` and the logo match the pre-redesign baseline exactly. Desktop and mobile homepage screenshots matched exactly. Tablet geometry/content matched, with rasterization differences no greater than 2/255 across 0.312% of pixels.
- Visual review covered desktop full pages, tablet and mobile heroes, narrow-mobile collections, product tables, settled loan drawers and application states. Fixed the deposit grid's empty gap and removed a clipped decorative label. Screenshot captures wait for dialog entry animations to finish.
- ECC review found no remaining critical/high issues in the changed scope. Product facts remain unchanged, no unsupported financial calculation was introduced, and no future-phase scaffolding was added.

Evidence: `qa/phase2-results.json`, `qa/creative-results.json`, `qa/results.json`, `qa/home-baseline.json`, and screenshots under `qa/screenshots/phase2-redesign/`, `qa/screenshots/phase2/` and `qa/screenshots/home-protection/`.

Local server: `http://127.0.0.1:5173`. Run with `npm run dev` from the project directory. Stop at Phase 2 for manual QA.
