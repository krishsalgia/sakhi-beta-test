# Blog editor upgrade verification

Local preview: http://127.0.0.1:5173/login (`npm run dev`). All mutating checks used disposable Playwright browser contexts and the approved local prototype credentials; the user's browser storage was not touched.

Implemented only the Blog editor upgrade and the public renderer/storage integration it needs. Existing non-Blog source files retain their pre-upgrade hashes, apart from appended interface translations. Header/Footer, Homepage, branch experience, product data, calculators, Services and Contact source files are unchanged. No dependency was added.

Verified:

- `workflow.mjs`: 46 checks passed. Existing posts migrate to blocks; ordered content, bold, featured/inline uploads, draft privacy, publish, preview, refresh persistence, editing, reordering, replacement/removal, shared-asset cleanup, SEO fields/metadata/fallbacks, duplicate URLs, file validation and deletion confirmation work. No console errors.
- `edge-cases.mjs`: 15 checks passed. Italics, safe links, keyboard block menu, mobile WebP uploads, blank captions, empty/missing images and discarded-upload cleanup work. No console errors.
- `responsive.mjs`: 1440×900, 1920×1080, 2560×1440, 1024×1366, 768×1024, 390×844 and 375×812 passed. File controls, previews, block movement and SEO controls fit. English/Hindi/Marathi chrome works; authored text stays unchanged; no missing translation keys or console errors.
- `regression.mjs`: the public listing matches all three pre-upgrade visual baselines within the existing five-channel tolerance. Six existing routes load at desktop/tablet/mobile without overflow or console errors. Source scope checks pass.
- Existing article screenshots retain identical geometry. Desktop has one pixel with a channel delta of six in unchanged placeholder art; visual inspection confirms no design change. Details are in `reader-regression.json`.
- `npm run build`: passed. Vite reports an advisory that the main minified chunk exceeds 500 kB after the added three-language editor messages. No build errors; no new packages.

The block editor is native and lightweight; formatting serializes restricted text runs rather than arbitrary HTML. IndexedDB holds image blobs, while localStorage holds stable asset IDs and ordered article data. Cleanup checks all saved posts, including drafts, and does not remove shared media. See `src/blogs/README.md` for the prototype boundary and production storage/authentication TODOs. SEO checks are advisory and not ranking predictions. Public metadata remains client-rendered for this localhost prototype.

Visual artifacts are in `screenshots`. Keyboard interaction and semantic/label checks were exercised; this is not a claim of a complete screen-reader or WCAG audit. The project has no dedicated TypeScript, lint or coverage scripts.
