import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { faqs, metrics, reasons } from './content';
import { Icon, Doodle } from './ui';
import { ProductsPage } from './products';
import { ServicesPage } from './services-page';
import { ContactPage } from './contact-page';
import { Footer } from './site-contact';
import { useAmbientMotion } from './product-motion';
import { HomeBranchAssembly } from './home-branch-assembly';
import { BranchesPage } from './branches-page';
import { FeaturedJourney } from './featured-journey';
import { BlogsPage, BlogArticlePage } from './blogs/blogs-page';
const BlogAdminPage = React.lazy(() => import('./blogs/admin-page'));
import { useSiteMotion } from './site-motion';
import './styles.css';
import './products.css';
import './phase3.css';
import './enhancements.css';
import './polish.css';
import './targeted-experiences.css';
import './i18n/language.css';
import './arrival-spacing.css';
import { useLanguage, t } from './i18n';
import { LanguageControl } from './i18n/language-control';

function Header({ currentPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const header = useRef(null);
  useEffect(() => {
    const close = event => {
      if (event.type === 'keydown' && (event.key !== 'Escape' || document.querySelector('dialog[open]'))) return;
      if (event.type === 'keydown' && !mobileOpen && !productsOpen) return;
      if (event.type === 'pointerdown' && header.current?.contains(event.target)) return;
      setProductsOpen(false); setMobileOpen(false);
      if (event.type === 'keydown') {
        const toggle = header.current?.querySelector('.menu-toggle');
        const target = toggle && getComputedStyle(toggle).display !== 'none' ? toggle : header.current?.querySelector('[aria-controls="products-menu"]');
        target?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [mobileOpen, productsOpen]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const close = () => { setMobileOpen(false); setProductsOpen(false); };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  return <header className="header" ref={header} onBlur={event => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) { setMobileOpen(false); setProductsOpen(false); }
  }}>
    <a href="/" className="logo" aria-label="Sakhi home" onClick={() => setMobileOpen(false)}><img src="/assets/sakhi-logo.png" width="646" height="152" alt="Sakhi Multi State Co Operative Credit Society Ltd." /></a>
    <button className="menu-toggle" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="navigation" onClick={() => setMobileOpen(!mobileOpen)}><span /><span /></button>
    <nav id="navigation" aria-label="Main navigation" className={mobileOpen ? 'navigation is-open' : 'navigation'}>
      <a href="/" className={!currentPage ? 'active' : undefined} aria-current={!currentPage ? 'page' : undefined} onClick={() => setMobileOpen(false)}>Home</a>
      <div className="products-nav">
        <button className={['loans', 'deposits'].includes(currentPage) ? 'active' : undefined} aria-expanded={productsOpen} aria-controls="products-menu" onClick={() => setProductsOpen(!productsOpen)}>Our Products <Icon name="down" /></button>
        {productsOpen && <div className="dropdown" id="products-menu"><a href="/products/loans" aria-current={currentPage === 'loans' ? 'page' : undefined}>Loans</a><a href="/products/deposits" aria-current={currentPage === 'deposits' ? 'page' : undefined}>Deposits</a></div>}
      </div>
      <a href="/services" className={currentPage === 'services' ? 'active' : undefined} aria-current={currentPage === 'services' ? 'page' : undefined}>Services</a>
      <a href="/branches" className={currentPage === 'branches' ? 'active' : undefined} aria-current={currentPage === 'branches' ? 'page' : undefined}>Branches</a>
      <a href="/blogs" className={currentPage === 'blogs' ? 'active' : undefined} aria-current={currentPage === 'blogs' ? 'page' : undefined} onClick={() => setMobileOpen(false)}>Blogs</a>
      <a href="/contact" className="nav-contact" aria-current={currentPage === 'contact' ? 'page' : undefined}>Contact <Icon /></a>
      <LanguageControl />
    </nav>
  </header>;
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-copy"><h1 id="hero-title"><span className="hero-headline-line"><span>Invest in</span></span><span className="hero-headline-line"><span>your future</span></span><span className="spark" aria-hidden="true">✧</span></h1>
      <p>Every little ambition deserves a bigger tomorrow. Grow your savings and take your next step with Sakhi.</p>
      <a className="button dark" href="#featured">Explore our products <Icon /></a>
      <a className="find-more" href="#reasons">Find out more <span aria-hidden="true">↓</span></a>
    </div>
    <Doodle className="hero-doodle" />
    <div className="hero-art" aria-label="Savings for every chapter of your life">
      <div className="hero-card-entry future-entry"><div className="hero-panel future-panel">
        <div className="panel-top">A little today.<span aria-hidden="true">✧</span></div>
        <h2>Your future,<br />in focus.</h2>
        <svg className="growth-line" viewBox="0 0 240 140" fill="none" aria-hidden="true"><path d="M0 125 25 112 40 120 65 80 80 95 108 61 127 73 148 38 167 55 193 16 216 30 240 5" stroke="#01995B" strokeWidth="3" /><path d="M0 140 240 0M0 105l190-105M45 140 240 30" stroke="white" strokeOpacity=".09" /></svg>
        <div className="future-bottom"><span>Built around you.</span><strong>36 years<br />of service</strong><span className="green-pill">Your goals. Our commitment.</span></div>
      </div></div>
      <div className="hero-card-entry savings-entry"><div className="hero-panel savings-panel">
        <div className="panel-top">Your next chapter <span aria-hidden="true">↗</span></div>
        <span className="panel-kicker">STARTS WITH A LITTLE SAVING</span>
        <div className="cash-window"><img src="/assets/sakhi3.png" alt="A fan of Indian rupee notes" width="357" height="358" /></div>
        <div className="saving-message"><span>Small steps. Lasting possibilities.</span><strong>Make room<br />for your dreams.</strong><span className="mini-arrow" aria-hidden="true">↗</span></div>
        <div className="mini-products"><span><i className="mini-dot orange" />Daily Deposit</span><span><i className="mini-dot green" />Fixed Deposit</span></div>
        <div className="panel-footer"><span>Savings, with a purpose.</span><span aria-hidden="true">✧</span></div>
      </div></div>
    </div>
  </section>;
}

function Featured() {
  return <FeaturedJourney />;
}

function Reasons() {
  return <section className="section reasons" id="reasons" aria-labelledby="reasons-title"><div className="section-intro"><h2 id="reasons-title">Reasons to<br />choose us.</h2><p>People first. Possibilities next.<br />A financial partner that grows with you.</p></div><div className="reasons-grid">{reasons.map(([icon, title, copy]) => <article className="reason" key={title}><span className="reason-icon"><Icon name={icon} /></span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div></section>;
}

function Figures() {
  return <section className="section figures" aria-labelledby="figures-title"><h2 id="figures-title">Growing together.</h2><p>Our strength is our members.<br />Our story, in numbers.</p><dl className="metrics">{metrics.map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function Eligibility() {
  const [open, setOpen] = useState(false);
  return <section className="section eligibility" aria-labelledby="eligibility-title"><div className="eligibility-banner"><svg className="banner-lines" viewBox="0 0 1000 360" preserveAspectRatio="none" aria-hidden="true">{Array.from({length: 12}, (_, i) => <path key={i} d={`M0 ${30 + i * 35} Q500 ${450 - i * 25} 1000 ${i * 20}`} fill="none" stroke="currentColor" />)}</svg><div className="eligibility-copy"><h2 id="eligibility-title">Your next step.<br />A little more certainty.</h2><p>Understand the loan amount you may be eligible for and what your EMI could be. Apply with your eligibility in mind.</p><button className="button light" aria-expanded={open} aria-controls="eligibility-details" onClick={() => setOpen(!open)}>Check loan eligibility <Icon /></button></div><div className="eligibility-slip"><span>LET’S LOOK AHEAD</span><strong>Dream.<br />Plan.<br /><em>Make it happen.</em></strong><div><Icon name="rates" /><span>A clearer picture.<br />A confident next step.</span></div></div></div>{open && <div id="eligibility-details" className="eligibility-details"><h3>Find the right amount for your next step.</h3><p>Speak with Sakhi to understand the loan amount you may be eligible for, your estimated EMI and how to apply according to your eligibility.</p><a className="text-link" href="tel:9920028810">Call 9920028810 <Icon /></a></div>}</section>;
}

function Promotions() {
  return <section className="section promotions" aria-label="Savings and loan possibilities"><article className="promotion"><div className="deposit-visual"><div className="orange-backplate" /><img src="/assets/sakhi4.jpg" alt="A bundle of Indian rupee notes" width="678" height="452" loading="lazy" /><span className="image-label">TODAY’S SAVINGS. TOMORROW’S PLANS.</span></div><div className="promotion-copy"><span className="eyebrow">FIXED DEPOSIT</span><h2>A little planning.<br />A brighter future.</h2><p>Give your savings a purpose. A Fixed Deposit helps you put something aside for the moments that matter.</p></div></article><article className="promotion pension"><div className="promotion-copy"><span className="eyebrow">PENSION DEPOSITS</span><h2>A new chapter.<br />The same peace of mind.</h2><p>Build long-term savings discipline for protected retirement income. Invest now for more relaxing days and exciting new adventures.</p></div><div className="pension-visual" aria-hidden="true"><div className="pension-circle" /><div className="floating-label"><span className="label-icon">↗</span>Save with purpose.<Icon /></div><div className="floating-label"><span className="label-icon">✧</span>Plan for your tomorrow.<Icon /></div><div className="floating-label"><span className="label-icon">✓</span>Enjoy your next chapter.<Icon /></div><Doodle /></div></article><article className="gold-promotion"><span className="eyebrow">GOLD LOAN</span><h2>Let your gold open<br />new doors.</h2><p>Faster processing. Safety of your gold.<br />A little support for your next big possibility.</p><a className="button dark" href="#eligibility-title">Plan your next step <Icon /></a></article></section>;
}

function Steps() {
  return <section className="section steps" aria-labelledby="steps-title"><h2 id="steps-title">Apply in three easy steps.</h2><ol>{['Complete the form', 'Get Approval', 'Secure Your Funds'].map((step, index) => <li key={step}><span className="step-number">0{index + 1}</span><h3>{step}</h3><Icon /></li>)}</ol></section>;
}

function FAQ() {
  const [active, setActive] = useState(null);
  return <section className="section faq" aria-labelledby="faq-title"><div className="section-intro"><span className="eyebrow">A LITTLE CLARITY</span><h2 id="faq-title">Good questions.<br />Clear answers.</h2><p>Things you might like to know before your next step.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <article className={`faq-item ${active === index ? 'expanded' : ''}`} key={question}><h3><button id={`question-${index}`} aria-expanded={active === index} aria-controls={`answer-${index}`} onClick={() => setActive(active === index ? null : index)}>{question}<span className="faq-plus" aria-hidden="true">+</span></button></h3><div className="faq-answer" id={`answer-${index}`} role="region" aria-labelledby={`question-${index}`} inert={active !== index}><div><p>{answer}</p></div></div></article>)}</div></section>;
}

function App() {
  const language = useLanguage();
  useEffect(() => {
    if (/^\/(blogs|login)(\/|$)/.test(location.pathname)) return;
    const names = { "/products/loans": "Loans", "/products/deposits": "Deposits", "/services": "Services", "/branches": "Find a branch", "/contact": "Contact Us" };
    document.title = `${t(names[location.pathname] || "Home")} | Sakhi Multistate Co-operative Credit Society`;
  }, [language]);
  useAmbientMotion();
  const pathname = window.location.pathname.replace(/\/$/, '');
  useSiteMotion(pathname);
  if (pathname === '/login') return <React.Suspense fallback={null}><BlogAdminPage /></React.Suspense>;
  let blogSlug = '';
  try { blogSlug = decodeURIComponent(pathname.slice('/blogs/'.length)); } catch {}
  const currentPage = (pathname === '/blogs' || pathname.startsWith('/blogs/')) ? 'blogs' : pathname === '/products/deposits' ? 'deposits' : pathname === '/products/loans' ? 'loans' : pathname === '/services' ? 'services' : pathname === '/contact' ? 'contact' : pathname === '/branches' ? 'branches' : null;
  return <div className="site-shell" id="home"><a className="skip-link" href="#main">Skip to content</a><Header currentPage={currentPage} /><main id="main" tabIndex={-1}>{currentPage === 'blogs' ? (pathname === '/blogs' ? <BlogsPage /> : <BlogArticlePage slug={blogSlug} />) : currentPage === 'branches' ? <BranchesPage /> : currentPage === 'services' ? <ServicesPage /> : currentPage === 'contact' ? <ContactPage /> : currentPage ? <ProductsPage kind={currentPage} /> : <><Hero /><Featured /><Reasons /><HomeBranchAssembly /><Figures /><Eligibility /><Promotions /><Steps /><FAQ /><section className="closing"><h2>Every future starts<br />with a small step.</h2><a className="button dark" href="#featured">Find your next step <Icon /></a></section></>}</main><Footer /></div>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
