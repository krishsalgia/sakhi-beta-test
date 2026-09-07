# Three targeted enhancements

Authority: the latest user attachment, `9e952d4c-6e5a-40d2-bf65-0091d437eabb/pasted-text.txt`, together with the existing approved implementation and content.

## Implementation

- `/branches` adds an animated green hero, counts derived from the shared directory, the existing `BranchNetwork`, and a visit/contact continuation. Home exposes `View all branches`. The header is unchanged. A `dedicated` presentation prop suppresses the Homepage CTA on the dedicated route; no map, state machine, coordinates, or branch records were duplicated.
- `/contact` replaces the old layout with oversized opposing typography, interlocking blue/green forms, a drawn connection thread, cursor response, scroll-linked movement, interactive contact methods, an unfolding message sheet, field-responsive connection graphics, and completion progress. The office motif continues the same connection line. Phone, email, address and required phrases are preserved.
- Contact validates required fields, whitespace, email, phone length/format and repeated-digit phone values inline. Successful local validation transforms the sheet into an honest “Message ready” state. It makes no submission request, uses no persistent storage, and explicitly says the message was not sent or saved. Back to form retains the local draft for editing.
- `FeaturedJourney` wraps the original four product cards without changing their content or artwork. The desktop rail's visual order is reversed while DOM reading order remains unchanged. Positive X translation accompanies downward scrolling, progressing from product 1 to 4. Native sticky positioning uses at most 1,200 vertical scroll pixels; no wheel/touch interception occurs. Active scale, opacity and progress provide focus. Keyboard focus brings each card into view. Original alternating surfaces and hover effects remain.
- Tablet, mobile, short screens and reduced-motion preferences use an unpinned native horizontal rail. Contact reduces motion and recomposes its graphics and form at small widths. Motion listeners and observers clean up on unmount.
- The global reveal helper excludes explicitly owned motion regions, avoiding conflicting transforms on the carousel and Contact. Other reveal targets keep their original behavior.
- A tile-failure message now sits below the map reset button and cannot intercept input. The geographic explorer interaction otherwise remains unchanged.

No dependencies added. ECC motion and browser QA guidance supported the branch/carousel work; Contact's creative direction was independent.

## Verification

- `npm run build`: passed.
- `npm run qa`: passed at four Homepage sizes; FAQ, eligibility, navigation, fixed header, images, reduced motion; no console errors or failed requests.
- `npm run qa:final`: 35 checks across five existing routes and seven sizes; navigation, dialog motion, live reduced motion, content/logo preservation; no console errors or failed requests.
- `npm run qa:enhancement`: 155 checks across seven sizes and five existing routes, including the published-rate calculators and branch hierarchy.
- `node qa/three-enhancements/check.mjs`: exercised `/`, `/branches`, `/contact` at 1366×768, 1440×900, 1920×1080, 2560×1440, 3840×2160, 768×1024, 390×844 and 320×740. The final mobile continuation is recorded in `three-enhancements/results-390-320.json`. Desktop/tablet results and screenshots were collected during the preceding run. All twelve records were compared with the original directory at desktop and mobile; both map/card selection directions and parent navigation were checked.
- Contact checks cover four empty-field errors, malformed email, invalid phone, whitespace message, four-field completion progress, zero network requests on submit, unchanged sheet height after completion, contact links and required copy. Recorded mobile CLS was below 0.1, with no horizontal overflow or console errors.
- `node qa/three-enhancements/interaction-check.mjs`: passed original card colours/hover, actual product navigation, cursor and scroll response, live reduced motion, actual CDP touch swipes, vertical touch scrolling, obviously invalid phone rejection and automatic completion visibility below the fixed header.
- Final desktop carousel measurements after spacing refinement are in `three-enhancements/carousel-results.json`: positive X direction, all four active states, centring within two pixels, and complete card bounds at every requested desktop size. Entry, product positions and release screenshots were inspected.
- Original source hashes remain unchanged outside `main.jsx`, `site-motion.js`, `branch-network.jsx`, and the expressly replaced `contact-page.jsx`; new scoped components/CSS provide the enhancements. Shared financial data, branch geography, original map components, calculators, logo and other page styles are preserved.

Screenshots are in `qa/three-enhancements/screens/`. The map imagery requires internet access, as before. When city-wide mobile zoom places nearby Andheri/Jarimari pins together, zoom or use the branch list; coordinates were not displaced for presentation. The pointer-sync test uses the geographically separate Jogeshwari pin, and every branch card is checked independently.

## Run and manually review

```powershell
cd C:\Users\Krish\Desktop\Sakhi
npm run dev
```

Open `http://127.0.0.1:5173/`, `/branches`, and `/contact`. Review downward/rightward carousel movement and release, touch swiping, all branch levels and breadcrumbs, Contact's entrance/scroll/focus/validation/completion, and reduced-motion behavior. The existing financial pages and calculators remain available for regression review.
