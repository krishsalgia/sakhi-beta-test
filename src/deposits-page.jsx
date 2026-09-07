import React from './i18n/react';
import { useRef, useState } from 'react';
import { deposits } from './product-data';
import { Icon } from './ui';
import { useProductReveal, useSculptureMotion } from './product-motion';
import { DepositCalculator } from './calculators';

const groups = [
  ['all', 'All deposits'], ['everyday', 'Everyday banking'],
  ['steady', 'Build your savings'], ['future', 'Plan ahead'],
];
const groupFor = id => ['savings-account', 'current-account', 'daily-deposit'].includes(id) ? 'everyday' : ['fixed-deposits', 'recurring-deposits'].includes(id) ? 'steady' : 'future';
const rateProducts = ['fixed-deposits', 'recurring-deposits', 'daily-deposit'].map(id => deposits.find(product => product.id === id));
const displayOrder = ['fixed-deposits', 'savings-account', 'current-account', 'recurring-deposits', 'daily-deposit', 'dam-duppat-deposits', 'lakhpati-deposit', 'pension-deposits'];

function DepositHero({ onSelect }) {
  const [rateIndex, setRateIndex] = useState(0);
  const current = rateProducts[rateIndex];
  const sculpture = useSculptureMotion();
  return <section className="deposit-hero" aria-labelledby="deposit-title">
    <div className="deposit-hero-copy">
      <div className="inner-breadcrumb"><a href="/">Home</a><span>/</span><span>Deposits</span></div>
      <span className="product-kicker"><i /> TOMORROW STARTS WITH TODAY</span>
      <h1 id="deposit-title"><span>Good habits.</span><br /><em>Great futures.</em></h1>
      <p>A little set aside. A little more possibility.<br />Find a home for your savings, whatever<br className="desktop-break" /> tomorrow looks like.</p>
      <a className="button deposit-primary" href="#product-catalog">Find your deposit <Icon /></a>
      <div className="deposit-hero-note"><span aria-hidden="true">✧</span><p>Your pace. Your plans.<br /><strong>Let’s grow from here.</strong></p></div>
    </div>
    <div className="growth-stage" {...sculpture}>
      <div className="growth-stage-top"><span>THE GROWTH COLLECTION</span><span aria-hidden="true">↗</span></div>
      <div className="growth-sculpture" aria-hidden="true"><div className="growth-orbit orbit-one" /><div className="growth-orbit orbit-two" /><div className="growth-pillar pillar-one"><span>₹</span></div><div className="growth-pillar pillar-two"><span>₹</span></div><div className="growth-pillar pillar-three"><span>₹</span></div><span className="growth-star">✧</span></div>
      <div className="rate-window" aria-live="polite"><span>{current.name}</span><strong key={current.id}>{current.rate}</strong><span>Interest rate</span></div>
      <div className="rate-options" aria-label="Explore deposit rates">{rateProducts.map((product, index) => <button key={product.id} aria-pressed={rateIndex === index} aria-label={`Show ${product.name} rate`} onClick={() => setRateIndex(index)}>{['Fixed', 'Recurring', 'Daily'][index]}</button>)}</div>
      <button className="growth-details" onClick={() => onSelect(current)} aria-label={`Explore ${current.name}`}>Explore this deposit <Icon /></button>
    </div>
  </section>;
}

function DepositCard({ product, onSelect, index }) {
  const featured = product.id === 'fixed-deposits';
  const retirement = product.id === 'pension-deposits';
  return <article id={product.id} className={`deposit-plan catalog-card product-reveal ${featured ? 'deposit-plan-featured' : ''} ${retirement ? 'deposit-plan-retirement' : ''}`} style={{ '--reveal-delay': `${index % 2 * 70}ms` }}>
    <div className="deposit-plan-top"><span>{product.category}</span><span className="deposit-plan-mark" aria-hidden="true">{featured ? '✧' : '↗'}</span></div>
    <h3>{product.name}</h3><p>{product.tagline}</p>
    <div className="deposit-plan-value"><small>{product.highlightLabel}</small><strong>{product.highlight}</strong></div>
    {featured && <div className="deposit-bonus"><span>+0.25%</span><p>Extra on Fixed Deposit returns<br />for Senior Citizens and Ladies</p></div>}
    {featured && <div className="deposit-plan-rings" aria-hidden="true"><i /><i /><i /></div>}
    {retirement && <div className="retirement-lines" aria-hidden="true"><i /><i /><i /></div>}
    <button className="plan-open" aria-label={`View details for ${product.name}`} aria-haspopup="dialog" onClick={() => onSelect(product)}><span>Explore deposit</span><Icon /></button>
  </article>;
}

function LakhpatiExplorer({ onSelect }) {
  const product = deposits.find(item => item.id === 'lakhpati-deposit');
  const rows = product.tables[1].rows;
  const [index, setIndex] = useState(2);
  const row = rows[index];
  return <section className="lakhpati-explorer product-reveal" aria-labelledby="lakhpati-title">
    <div className="lakhpati-intro"><span className="product-kicker">A GOAL WORTH SAVING FOR</span><h2 id="lakhpati-title">Picture your<br /><em>first lakh.</em></h2><p>Smart today for better tomorrow.<br />Explore the Lakhpati Deposit plans.</p><button className="text-link" onClick={() => onSelect(product)}>See both deposit tables <Icon /></button><div className="lakhpati-loops" aria-hidden="true"><span /><span /><span /></div></div>
    <div className="lakhpati-controls"><span className="product-kicker">LAKHPATI DEPOSIT / TABLE B</span><div className="lakhpati-output" aria-live="polite"><div><span>Deposit Amount</span><strong key={row[0]}>{row[0]}</strong></div><Icon /><div><span>Maturity Amount</span><strong>{row[2]}</strong></div></div><label htmlFor="lakhpati-period">Choose a period <output htmlFor="lakhpati-period">{row[1]}</output></label><input id="lakhpati-period" type="range" min="0" max="5" step="1" value={index} aria-valuetext={`Period ${row[1]}, Deposit Amount ${row[0]}, Maturity Amount ${row[2]}`} onChange={event => setIndex(Number(event.target.value))} /><div className="period-labels" aria-hidden="true">{rows.map(item => <span key={item[1]}>{item[1]}</span>)}</div><p>Choose a listed period to see its deposit amount.<br />Each option is a plan from Table B.</p></div>
  </section>;
}

export function DepositsPage({ onSelect }) {
  const root = useRef(null);
  const [group, setGroup] = useState('all');
  useProductReveal(root, group);
  const visible = displayOrder.map(id => deposits.find(product => product.id === id)).filter(product => group === 'all' || groupFor(product.id) === group);
  return <div className="deposits-experience" ref={root}>
    <DepositHero onSelect={onSelect} />
    <div className="savings-principles product-reveal"><div><span aria-hidden="true">01</span><p><strong>Start small.</strong> Daily Deposit from Rs 50.</p></div><div><span aria-hidden="true">02</span><p><strong>Keep growing.</strong> Make saving a habit.</p></div><div><span aria-hidden="true">03</span><p><strong>Think ahead.</strong> A plan for every chapter.</p></div></div>
    <DepositCalculator />
    <section className="deposit-catalog" id="product-catalog" aria-labelledby="deposit-catalog-title">
      <aside className="deposit-catalog-rail"><span className="product-kicker">THE DEPOSIT COLLECTION</span><h2 id="deposit-catalog-title">Find your way<br />to <em>grow.</em></h2><p>Everyday essentials.<br />Long-term possibilities.</p><div className="deposit-filters" role="group" aria-label="Filter deposits">{groups.map(([value, label]) => <button key={value} aria-pressed={value === group} onClick={() => setGroup(value)}>{label}<Icon /></button>)}</div><span className="deposit-count" aria-live="polite">{visible.length} deposit {visible.length === 1 ? 'option' : 'options'} to explore</span></aside>
      <div className="deposit-plans" data-filter={group}>{visible.map((product, index) => <DepositCard key={product.id} product={product} index={index} onSelect={onSelect} />)}</div>
    </section>
    <LakhpatiExplorer onSelect={onSelect} />
    <section className="deposit-crosslink product-reveal"><div className="deposit-cta-copy"><span className="product-kicker">SAVINGS ARE JUST THE START</span><h2>Make room for<br />your next move.</h2></div><svg className="deposit-cta-path" viewBox="0 0 380 160" fill="none" aria-hidden="true"><path d="M8 122h110c54 0 46-78 100-78h148m-33-28 33 28-33 28" pathLength="1" /></svg><a href="/products/loans" className="button dark">Explore loans <Icon /></a></section>
  </div>;
}
