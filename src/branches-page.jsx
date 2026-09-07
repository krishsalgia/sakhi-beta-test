import React from './i18n/react';
import { useEffect } from 'react';
import { BranchNetwork } from './branch-network';
import { branches } from './branch-data';
import { branchAreas } from './branch-geography';
import { Icon } from './ui';

export function BranchesPage() {
  useEffect(() => { document.title = 'Find a branch | Sakhi Multistate Co-operative Credit Society'; }, []);
  return <div className="branches-page">
    <section className="branches-opening" aria-labelledby="branches-title" data-own-motion>
      <div className="branches-opening-top"><span>OUR BRANCH NETWORK</span><a href="#branch-explorer">Explore the map <Icon /></a></div>
      <h1 id="branches-title"><span>Closer to your</span><br /><em>everyday.</em><span className="branches-pin-symbol" aria-hidden="true"><i /></span></h1>
      <div className="branches-opening-bottom"><p>Find Sakhi near you. Explore our network<br className="wide-break" /> and make your next step a little more personal.</p><dl><div><dd>{String(branches.length).padStart(2, '0')}</dd><dt>Verified locations</dt></div><div><dd>{String(branchAreas.length).padStart(2, '0')}</dd><dt>Cities & areas in Maharashtra</dt></div></dl></div>
      <svg className="branches-connection" viewBox="0 0 1000 400" fill="none" aria-hidden="true"><path d="M10 360C170 360 160 200 370 200S600 360 720 230 780 50 990 50" pathLength="1" /><circle cx="990" cy="50" r="9" /></svg>
    </section>
    <div id="branch-explorer"><BranchNetwork dedicated /></div>
    <aside className="branches-visit"><span className="branches-visit-mark" aria-hidden="true">↗</span><div><h2>A familiar face.<br />A clearer next step.</h2><p>Choose a branch in the explorer for its full address and available contact details before you visit.</p></div><a className="button dark" href="/contact">Get in touch <Icon /></a></aside>
  </div>;
}
