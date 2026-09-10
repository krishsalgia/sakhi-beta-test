# Homepage branch-map assembly QA

Only `src/main.jsx` changed among the existing source files: its Homepage branch component import and render now use `HomeBranchAssembly`. The new component and stylesheet own the entrance. Shared branch components, geography, data, all other routes, translations, and global styles are unchanged (checked against `before-hashes.json`). No dependencies were added.

The existing 36 SVG references arrive in overlapping geographic groups. Native scroll drives opacity, perspective transforms, and border opacity. Geometry settles before progress 0.85; Maharashtra and Karnataka receive their existing colors over the final 15%. The section has a short sticky hold, with shorter mobile travel. Reduced motion uses fades and no hold. Reversing scroll retraces the entrance until the user starts exploring; interaction then permanently hands control back to the existing explorer for that page visit. Keyboard focus provides immediate access.

## Verification

- `check.mjs` / `results.json`: all 11 sizes (1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160, 1024×1366, 768×1024, 430×932, 390×844, 375×812, 320×740). Empty initial state, simultaneous left/right movement, 3D transforms, borders, neutral settled geometry, final colors, inert controls until completion, reverse progress, no autoplay while paused, no clipped pieces or page overflow, constant section height, and CLS 0.
- Both Homepage and `/branches`: state → Mumbai → branch address, city tiles, breadcrumbs, and Karnataka's existing pending state at desktop, 4K, tablet, and mobile. English/Hindi/Marathi and reduced motion passed. No console or page errors. City tile checks required network-enabled execution because the sandbox blocked OpenStreetMap requests.
- `lifecycle.mjs` / `lifecycle-results.json`: keyboard entry, native wheel down/up, language switching during assembly, resize/orientation before and after handoff, reload/Strict Mode, and actual touch taps. Passed after the final animation-frame cleanup.
- `/branches` map workspace screenshots are byte-identical before/after at all seven comparison sizes. Whole-page captures show minor text rasterization differences in some sizes; those are not claimed to be byte-identical. The completed Homepage map was also visually compared against the original workspace.
- `npm run build`: passed.

Motion screenshots are named by viewport width and normalized progress. `before-*` and `after-*` captures preserve the visual comparisons.

Run locally with `npm run dev` at http://127.0.0.1:5173. Run network-dependent QA with `node qa/home-map-assembly/check.mjs`; local lifecycle checks use `node qa/home-map-assembly/lifecycle.mjs`.
