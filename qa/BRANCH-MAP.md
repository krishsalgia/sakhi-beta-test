# Hierarchical branch-map correction

This implements only the latest Homepage branch-map request. The creative-inner-pages Markdown and approved branch records remain the content authority. Existing section colors, heading, outer card, branch detail presentation and branch cards are retained. ECC motion-ui and browser-qa guidance was used. The header, shell, page transitions, remaining Homepage components and all inner pages were not edited.

## Navigation and maps

- **India:** the existing complete SVG map, with only Maharashtra and Karnataka interactive. No branch or city dots. Two visible state selectors synchronize their highlight with the SVG states.
- **State:** a geographic outline of Maharashtra or Karnataka, projected from the existing cached geographic dataset. Maharashtra shows six city/area markers with callouts; the points use the same geographic projection as the state boundary. Karnataka shows no markers.
- **City/area:** Leaflet 1.9.4, loaded as a separate module only when a city is opened, with real OpenStreetMap raster tiles. Only that area's individual branches are mounted. Branch selection and the list share one state; selection zooms to the locality and updates the original verified address/contacts. Show all branches restores the area extent.
- **Navigation:** clickable India/state breadcrumbs, a visible parent-level Back control, keyboard-operable state/city/branch markers and mobile state/city cards. Mobile branch cards scroll horizontally inside the section; details follow them.
- **Motion:** a 240ms map recession followed by a 650ms zoom/reveal, staggered city/branch markers and a synchronized panel entrance. Branch selection uses a restrained 650ms map movement. Reduced motion removes the geographic transitions and marker entrance. Map-wheel zoom is disabled so normal page scrolling continues.

## Exact grouping of the existing 12 records

| City / area | Included branches |
| --- | --- |
| Mumbai | Head Office / Andheri, Jarimari, Jogeshwari, Ghatkopar, Chembur, Borivali |
| Thane | Thane |
| Panvel / Navi Mumbai / Raigad | Panvel |
| Pune / Pimpri-Chinchwad | Chinchwad |
| Satara area | Satara, Pusesavali |
| Solapur area | Tembhurni |

The district groups are explicitly identified in the interface; Pusesavali is not presented as a central Satara address, and Tembhurni is not presented as a central Solapur address. Each original ID appears in exactly one group. `src/branch-data.js` is unchanged, including every full address, telephone and email. The former decorative x/y coordinates are no longer used for rendering.

## Geographic source evidence and precision

`src/branch-geography.js` stores WGS84 latitude/longitude pairs and a source URL for each point. These are matches to the locality, street or nearby landmark named in the approved address, not surveyed branch entrances. The interface tells visitors to use the full verified address when visiting. No points were scattered by visual coordinates.

- Head Office / Andheri uses the coordinates encoded in the map marker on the [official Sakhi branch directory](https://www.sakhimultistate.com/branches), rather than the map camera's offset center. The embedded source and conversion are saved in `qa/branch-drilldown/geocoding/andheri-official.json`.
- The other records use one-time OpenStreetMap/Nominatim locality lookups of the existing public addresses. Raw queries, selected OSM objects and coordinates are cached under `qa/branch-drilldown/geocoding/`; the selected source object for each marker is recorded alongside its coordinates. Jogeshwari resolves to Behram Baug, Borivali to Borivali East, Chembur to Tilak Nagar, and so on.
- Lookups were sequential, on one machine, slower than one request per second, and cached. The site has no runtime geocoder, autocomplete or address-search API. The research helper links to the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/).
- State paths are generated from the project's previously cached `qa/enhancement-research/india-current.geojson`. Their Mercator projection parameters and vector paths are local in `src/branch-state-shapes.json`. Its accompanying MIT license is included in `public/assets/branch-state-license.txt`. The existing national SVG and its existing credit are preserved.
- City maps use [Leaflet's standard tile integration](https://leafletjs.com/examples/quick-start/) with visible OpenStreetMap attribution and the standard HTTPS tile URL. Browser caching and normal on-demand loading follow the [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/). No offline download, prefetch service, Google API, paid key, duplicate map library or backend was introduced. `VITE_MAP_TILE_URL` permits a compatible provider override; an alternative provider's attribution must also be supplied if used.

## Karnataka

The previous research and project records were inspected before choosing the pending state. Sakhi's [official Our Story](https://www.sakhimultistate.com/About/our-story) identifies Maharashtra and Karnataka as operating territory. The cached and current official branch directory contained the 12 Maharashtra locations already approved for this project; neither it nor the prior research established a current Karnataka branch address. Therefore Karnataka is interactive but has no invented city, address or branch marker. Its interface states that branch information is being updated.

## QA artifacts

- `qa/branch-drilldown/before-hashes.json`: source and logo preservation snapshot from before this correction.
- `qa/branch-drilldown/screens/`: India, Maharashtra, Mumbai, selected Jogeshwari and Karnataka screenshots at the requested viewport sizes, plus narrow mobile.
- `qa/branch-drilldown/results.json`: complete hierarchy, group membership, all 12 address/contact checks, live tiles, marker/list synchronization, back/breadcrumb navigation, reduced motion, real touch input, orientation change, overflow, console errors and unrelated-source preservation.
- `npm run qa:branches`: repeatable dedicated browser suite. The older enhancement suite was updated only where its prior India-level marker expectations conflicted with this requested hierarchy.

Run `npm run dev` and open http://127.0.0.1:5173/. Live city-map tiles require an internet connection; the branch list and verified information remain usable if tiles are unavailable.

## Verification results — 5 September 2026

- Production build passed; the Leaflet module and its stylesheet are split from the initial page bundle.
- `npm run qa:branches` passed at 2560x1440, 1920x1080, 1440x900, 768x1024, 390x844 and 320x740. All six area groups, every original address/contact, live basemaps, both directions of selection synchronization, fit-all, breadcrumbs, Back, keyboard activation, reduced motion and page scrolling passed with no console/page errors.
- A separate touch context passed state/city/branch taps and portrait-to-landscape resizing. No horizontal page overflow was found.
- All pre-existing source files except the intentionally replaced `src/branch-network.jsx` matched their pre-change hashes, including the original branch records, calculators, header/Home source, inner pages, every existing stylesheet and the logo.
- `npm run qa` passed its four Homepage viewport classes, including navigation, all FAQs, eligibility, sticky header and reduced motion.
- `npm run qa:enhancement` passed 155 checks across seven viewport classes and all five routes, including calculators and the revised branch hierarchy.
