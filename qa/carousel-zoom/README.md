# Carousel zoom and Branches navigation

Scope: latest user attachment `4a493f75-32be-4912-b0b3-d60aa51e0474/pasted-text.txt`.

- Scroll-derived positive X travel preserves Daily Deposit → Loan Against Deposits → Daily Loan → JLG Loan. Reversing scroll retraces the same positions.
- One inner composition scales from 1 to 1.06 over the first 12%, holds until 88%, and returns to 1 over the last 12%. Travel finishes at 88%, before the final zoom-out. The heading, pin geometry, runway and progress styling remain unchanged.
- Removed focus-based individual card scaling. Card graphics, content, alternating surfaces, hover and details links remain. Pointer focus does not recenter a card underneath a click; keyboard focus still brings its product into view.
- Existing mobile/tablet native rails remain unscaled and unpinned. Reduced motion removes both composition zoom and desktop travel.
- Header and Footer include Branches immediately before Contact. Header uses the existing active class and aria-current treatment. No navigation styling or dropdown logic changed.

Verification: `npm run build`; `node qa/carousel-zoom/check.mjs` (five requested desktop sizes, tablet, mobile, 320px and short landscape); native CDP touch swipe/vertical scrolling and an actual mid-journey product click. See `results.json`, `touch-and-click.json`, and the `screens/` captures. The 2560px composition, entry/exit, tablet Header and Footer were visually inspected. Carousel CLS measured 0 in the scrolling check. Original source hashes outside the four targeted files are checked against `before-hashes.json`.

Run `npm run dev` from `C:\Users\Krish\Desktop\Sakhi`; localhost is `http://127.0.0.1:5173/`.
