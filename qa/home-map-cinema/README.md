# Homepage cinematic map QA

Only src/home-branch-assembly.jsx and src/home-branch-assembly.css changed. See scope-results.json. Shared branch components, geography, coordinates, translations, main routing, other Homepage sections, other routes, and dependencies are unchanged.

The existing 36 SVG state references are used throughout the scene and final explorer. Oversized type parts over a near-full-width navy spatial field. Regional groups arrive from opposing sides and foreground/background depth, with a camera push/pull, settling compression, border tracing, and sequential Maharashtra/Karnataka color/elevation/ring/label payoffs. The same SVG moves into the final open Homepage explorer as its panel appears. Native scroll controls the whole timeline. Keyboard users can skip to the usable explorer; reduced motion uses fades without camera/piece transforms. After interaction, backward scrolling preserves the active explorer.

Verification completed:

- cinema-check.mjs: 1440x900, 1920x1080, 2560x1440, 3840x2160, 768x1024, 390x844. Empty initial map, all 36 state references, depth transforms, controlled progress, paused scroll, reversible assembly, panel availability, no horizontal overflow, CLS 0, no console/page errors. Screenshots in cinema/.
- containment.mjs: 51 timeline samples across ten widths from 320 to 3840. All visible pieces remain inside the cinematic field before handoff. Section height stays constant throughout scroll. See containment-results.json.
- interactions.mjs: Homepage and /branches at desktop/tablet/mobile; real OSM tiles, Mumbai -> Andheri exact address, breadcrumbs, Karnataka pending state, actual touch, ready-to-exploring identical map geometry/colors. English/Hindi/Marathi reduced-motion sequences, keyboard skip, language changes during assembly, orientation/resize. No console/page errors. Network access was needed for real OSM tiles.
- branches-regression.mjs --compare: exact layout geometry/styles at six widths, unchanged branch source hashes, visual equivalence with at most five channel levels of rasterization tolerance where screenshot bytes differ. See branches-comparison.json; byte equality is reported separately.
- performance-results.json: 180-frame native scroll sampling at desktop, 4K, and mobile, no long tasks; 95th-percentile frame interval 12.7ms / 14ms / 7.6ms in this local Chrome environment. This is local evidence, not a universal device performance guarantee.
- npm run build passed after final source changes.

Local: http://127.0.0.1:5173
Run: npm run dev
