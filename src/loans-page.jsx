import React from './i18n/react';
import { useRef, useState } from 'react';
import { loans } from './product-data';
import { Icon } from './ui';
import { useProductReveal, useSculptureMotion } from './product-motion';
import { LoanCalculator } from './calculators';

const spotlights = ['personal-loan', 'gold-loan', 'jlg-loan'].map(id => loans.find(product => product.id === id));

function LoanEmblem({ index }) {
  const shapes = [
    'M40 38a12 12 0 1 0 0-24 12 12 0 0 0 0 24M18 66v-6c0-19 44-19 44 0v6',
    'M16 52 27 26h26l11 26-24 15ZM16 52h48M27 26l13 41 13-41',
    'M18 26h44v38H18ZM18 35h44M26 48h12m-12 8h20M24 18h34',
    'M12 39 40 15l28 24M20 33v33h40V33M33 66V47h14v19',
    'M19 23h42v43H19ZM19 35h42M29 17v13m22-13v13M29 45h4m14 0h4m-22 10h4m14 0h4',
    'M29 32a8 8 0 1 0 0-16 8 8 0 0 0 0 16M51 37a8 8 0 1 0 0-16 8 8 0 0 0 0 16M12 59v-6c0-18 34-18 34 0v6M46 43c12-6 22 2 22 12v7',
    'M19 17h42v50H19ZM28 29h24M28 38h15M28 52l7 7 16-15',
  ];
  return <div className="loan-row-visual" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" className="loan-emblem-orbit" /><path d={shapes[index]} /></svg></div>;
}

function LoanHero({ onSelect }) {
  const [active, setActive] = useState(0);
  const product = spotlights[active];
  const sculpture = useSculptureMotion();
  return <section className="loan-hero" aria-labelledby="loan-title">
    <div className="loan-hero-grid">
      <div className="loan-hero-copy"><div className="inner-breadcrumb"><a href="/">Home</a><span>/</span><span>Loans</span></div><span className="product-kicker"><i /> POSSIBILITIES, WITH A LITTLE SUPPORT</span><h1 id="loan-title">Big plans.<br /><em>Meet your<br />next move.</em></h1><p>For the life you’re building.<br />The business you believe in.<br />And the possibilities still ahead.</p><a href="#product-catalog" className="button loan-primary">Find your loan <Icon /></a></div>
      <div className="loan-hero-art" {...sculpture}><div className="loan-portal" aria-hidden="true"><svg className="portal-architecture" viewBox="0 0 480 380" fill="none"><path className="arch-floor" d="M24 362h432M55 374h370" /><path className="arch-rib arch-one" d="M96 352V174a144 144 0 0 1 288 0v178" /><path className="arch-rib arch-two" d="M126 352V185a114 114 0 0 1 228 0v167" /><path className="arch-rib arch-three" d="M156 352V196a84 84 0 0 1 168 0v156" /><path className="arch-rib arch-four" d="M183 352V207a57 57 0 0 1 114 0v145" /></svg><svg className="portal-arrow" viewBox="0 0 80 80" fill="none"><path d="M17 63 63 17M21 17h42v42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div className="loan-spotlight" key={product.id}><div><span className="loan-spotlight-eyebrow">IN FOCUS</span><Icon aria-hidden="true" /></div><h2>{product.name}</h2><strong>{product.highlight}</strong><span className="loan-spotlight-label">{product.highlightLabel}</span><button onClick={() => onSelect(product)} aria-label={`Explore ${product.name}`}>Explore this loan <Icon /></button></div></div>
    </div>
    <div className="loan-intent-bar"><span>WHAT DOES YOUR<br /><strong>NEXT STEP LOOK LIKE?</strong></span><div role="group" aria-label="Loan spotlight">{spotlights.map((item, index) => <button aria-pressed={active === index} onClick={() => setActive(index)} key={item.id}><span>0{index + 1}</span>{['Something for me', 'Put my gold to work', 'Grow together'][index]}<Icon /></button>)}</div></div>
  </section>;
}

function LoanRow({ product, index, onSelect }) {
  return <article id={product.id} className="loan-row catalog-card product-reveal">
    <span className="loan-index">0{index + 1}</span>
    <LoanEmblem index={index} />
    <div className="loan-row-copy"><span className="product-kicker">{product.category}</span><h3>{product.name}</h3><p>{product.tagline}</p></div>
    <div className="loan-row-fact"><span>{product.highlightLabel}</span><strong>{product.highlight}</strong>{product.rate && <small>{product.rate === '18%' ? 'Interest: 18%' : 'View interest details'}</small>}<p className="loan-row-eligibility"><span>Eligibility</span>{product.eligibility[0]}</p></div>
    <button className="loan-row-open" onClick={() => onSelect(product)} aria-label={`View details for ${product.name}`} aria-haspopup="dialog"><Icon /><span>Explore loan</span></button>
  </article>;
}

function LoanReadiness({ onSelect }) {
  const [active, setActive] = useState(0);
  const product = loans[active];
  return <section className="loan-readiness product-reveal" aria-labelledby="readiness-title">
    <div className="readiness-copy"><span className="product-kicker">A LITTLE PREPARATION GOES A LONG WAY</span><h2 id="readiness-title">Your plans.<br />Your paperwork.<br /><em>All in focus.</em></h2><p>Know the eligibility and documents for your chosen loan before taking the next step.</p><div className="readiness-symbol" aria-hidden="true"><span /><span /><span>✓</span></div></div>
    <div className="readiness-panel" aria-live="polite" aria-atomic="true"><label htmlFor="readiness-loan">Choose your loan</label><div className="readiness-select"><select id="readiness-loan" value={active} onChange={event => setActive(Number(event.target.value))}>{loans.map((item, index) => <option key={item.id} value={index}>{item.name}</option>)}</select><Icon name="down" /></div><div className="readiness-facts" key={product.id}><span className="product-kicker">ELIGIBILITY</span><ul>{product.eligibility.map(item => <li key={item}>{item}</li>)}</ul><div className="readiness-documents"><span className="product-kicker">DOCUMENTS AT A GLANCE</span><p>{product.documents.slice(0, 3).join(' · ')}</p><span>{product.documents.length} document {product.documents.length === 1 ? 'requirement' : 'requirements'} listed</span></div></div><button className="button dark" onClick={() => onSelect(product)}>View all requirements <Icon /></button></div>
  </section>;
}

export function LoansPage({ onSelect }) {
  const root = useRef(null);
  useProductReveal(root);
  return <div className="loans-experience" ref={root}>
    <LoanHero onSelect={onSelect} />
    <LoanCalculator />
    <section className="loans-catalog" id="product-catalog" aria-labelledby="loans-catalog-title"><div className="loans-catalog-heading product-reveal"><div><span className="product-kicker">THE LOAN COLLECTION / 07</span><h2 id="loans-catalog-title">Find the right support.<br /><em>Make your move.</em></h2></div><p>Different ambitions. Different needs.<br />Explore a loan that fits yours.</p></div><div className="loan-ledger">{loans.map((product, index) => <LoanRow key={product.id} product={product} index={index} onSelect={onSelect} />)}</div></section>
    <LoanReadiness onSelect={onSelect} />
    <section className="loan-crosslink product-reveal"><div><span className="product-kicker">BUILD FOR WHAT COMES AFTER</span><h2>Today’s plans.<br />Tomorrow’s savings.</h2></div><a className="button light" href="/products/deposits">Explore deposits <Icon /></a><span aria-hidden="true">↗</span></section>
  </div>;
}
