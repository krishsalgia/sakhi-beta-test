# Homepage light-background treatment

Only src/home-branch-assembly.css changed against before-hashes.json. The JSX, choreography, timings, state transforms, border reveal, geographic data, and branch navigation are byte-unchanged.

Removed the cinematic field's dark gradient and rounded outline, hid its lighting/meridian layers, and made its ground grid extremely faint. Changed scene typography, state labels, progress line, focus indicator, and highlight rings to colors readable on the existing white/light page. Softened the existing depth shadow without changing its motion.

QA: production build passed; existing cinematic Playwright checks passed at1440,1920,2560,3840,768,390 widths, with no console errors, horizontal overflow, or CLS. Screenshots in cinema/ visually reviewed at desktop and mobile for beginning, construction, payoff, and final explorer. The background is explicitly transparent with no background image and zero radius. Real OSM maps, state/city/Andheri branch details, exact address, back navigation, Karnataka pending state, and mobile touch passed. See verification.json.

The dedicated /branches page has exact geometry and byte-identical screenshots at all six comparison sizes. Shared data, logic, other routes, other Homepage sections, Header/Footer, translations, and dependencies are unchanged.

Local: http://127.0.0.1:5173
Run: npm run dev
