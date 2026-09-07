# Sakhi - completed frontend prototype

Frontend prototype using `sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md` as the content and product source of truth. The completed site includes a fluid layout, blue-led logo-derived palette, layered surfaces, interactive India branch network and frontend-only Loans and Deposits calculators. The latest manual-QA pass integrates the header with the viewport, corrects the specified card and section spacing, and adds a choreographed homepage entrance while preserving the approved content and functionality.

```powershell
cd C:\Users\Krish\Desktop\Sakhi
npm run dev
```

Open http://127.0.0.1:5173/. The server uses port 5173 strictly and binds only to localhost. Dependencies are already installed; a fresh checkout requires `npm install` first.

Routes: `/`, `/products/deposits`, `/products/loans`, `/services`, `/contact` and `/branches`. Homepage featured links open the corresponding product details. All approved header and footer destinations are active.

Deposits includes a published-rate FD/RD calculator, rate switcher, savings filters, complete product modals and a Lakhpati Table B explorer. Loans includes an exact-formula EMI calculator, product spotlights, a numbered collection, an eligibility/document selector and detail drawers. The homepage branch network drills down from India to a state, then a city/area and individual branches on a geographic street map. Maharashtra contains the same twelve verified branches across six area groups; Karnataka opens a data-pending state with no fabricated addresses or city markers. Services presents all five approved services without separate service routes. The Contact form validates Name, Email, Phone and Message locally and makes no submission request. Application previews accept only Name, Phone Number and Email, validate locally and send or save nothing.

```powershell
npm run build
npm run qa
npm run qa:products
npm run qa:creative
node qa/product-navigation.mjs
npm run qa:final
npm run qa:enhancement
node qa/hero-sequence.mjs
node qa/enhancement-sections.mjs
node qa/three-enhancements/check.mjs
node qa/three-enhancements/interaction-check.mjs
```

Browser QA uses Playwright with installed Google Chrome. Product QA compares all facts and table cells directly with the authoritative Markdown brief. The enhancement suite covers 1366, 1440, 1920, 2560 and 3840 desktop widths plus tablet and mobile on all five routes. Results and screenshots are under `qa/`; see `qa/ENHANCEMENT.md` for the branch research, calculator assumptions, responsive scope and verification evidence.

The targeted visual corrections and homepage entrance are documented in `qa/POLISH.md`. Their viewport captures and animation frames are under `qa/polish/`.

The branch hierarchy, geographic sources and map QA are documented in `qa/BRANCH-MAP.md`. City maps load Leaflet only when opened and use public OpenStreetMap tiles, which require internet access. There is no paid API key, backend or live address-geocoding service. Locality markers are approximate; the existing full branch addresses remain authoritative for visits.

DM Sans is hosted locally under its SIL Open Font License, included in `public/assets/dm-sans-OFL.txt`.

The latest three enhancements add `/branches` using the same `BranchNetwork` component and geographic data as Home, reimagine Contact around an animated connection line and local message preview, and wrap the unchanged featured product cards in a short desktop scroll journey (downward scrolling moves the cards left to right). Tablet/mobile use native swipe and reduced motion removes desktop pinning. See `qa/THREE-ENHANCEMENTS.md` for scope and QA evidence. Earlier phase-specific visual scripts are historical baselines; the current Contact/carousel assertions live in `qa/three-enhancements/`.
