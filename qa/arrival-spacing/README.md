# Targeted arrival and spacing QA

- Initial audit: 198 combinations, six routes, three languages, eleven viewports.
- After spacing corrections: 165 affected-route combinations; no content overflow, header collisions or console errors.
- Existing calculator/regression suite: 155 checks passed.
- Hero first-frame, sampled choreography, settled-layout dimensions, scroll re-entry, reduced motion and CTA checks: entrance-results.json.
- Scope: one CSS import in main.jsx plus arrival-spacing.css. All existing component implementations, data, formulas, translations and map files unchanged.

Intentional overflow reviewed visually: screen-reader announcements; the loan-row hover wash; clipped decorative circles in deposit cards. These are excluded from the content-overflow report.

Screenshots: before/ (baseline), after/ (all routes, languages and sizes), motion/ (sampled hero sequence).
