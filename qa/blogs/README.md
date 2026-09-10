# Blogs implementation QA

Run the site with `npm run dev` at http://127.0.0.1:5173.

Three visual passes established the editorial concept, refined the mobile composition and header fit, then checked the final reading view, long authored text, translations and reduced motion. Screenshots are in `pass1`, `pass2` and `final`.

Verified with the existing Playwright/Chrome setup:

- `responsive.mjs`: listing, article, login, dashboard and editor at 1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160, 1024×1366, 768×1024, 430×932, 390×844 and 375×812. No overflow or console errors.
- `functional.mjs`: 39 checks covering login, session refresh/logout, create/edit/delete, confirmation, drafts, publish/unpublish, duplicate slugs, preview, image loading, authored text preservation and public updates across tabs.
- `languages.mjs`: Hindi and Marathi listing/editor at desktop, tablet and mobile; no missing translations.
- `edge-cases.mjs`: 20 checks covering touch navigation, category filtering, fixed reading progress, keyboard modal behavior, reduced motion, deletion of all posts without reseeding, storage failures and image fallback.
- `final-audit.mjs`: 83 checks covering long article content, Markdown and TOC anchors, EMI/FD/RD calculators, Services, Contact validation/local preview, navigation and source scope. No console errors.
- `home-animation.mjs --quick`: Homepage India assembly at desktop/mobile, including forward/reverse motion; passed.
- `branch-interactions.mjs`: desktop/mobile state, city and branch selection, real OpenStreetMap tiles, back navigation and Karnataka state passed without console errors. Tile verification required network access outside the restricted sandbox.
- `npm run qa:creative`: existing Loans/Deposits interactions and responsive behavior passed.
- `npm run build`: passed, with the admin interface/authentication isolated in a lazy-loaded chunk.

The old `/branches` full-section screenshot comparison includes the sticky header, so the approved Blogs navigation addition changes those pixels. The final audit compares branch workspace pixels separately: geometry is identical at all six baseline sizes; five sizes differ by at most one channel value, and 1920px has only two pixels above that, with a maximum delta of four (inside the existing tolerance of five). No branch component, styling, data or logic was changed.

Of the existing source files, only `main.jsx`, `site-contact.jsx` and `i18n/messages.txt` changed for routes, Header/Footer links and new interface translations. Financial data, calculators, existing page components, Homepage animations and styles retain their pre-task hashes.

All data-manipulation checks use isolated browser contexts. They do not alter the user's browser data. Blog persistence is origin/profile-specific localStorage; authentication is a sessionStorage frontend prototype. See `src/blogs/README.md` for the production replacement boundary.
