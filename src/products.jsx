import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';
import { deposits, loans } from './product-data';
import { Icon } from './ui';
import { DepositsPage } from './deposits-page';
import { LoansPage } from './loans-page';
import { t, useLanguage } from './i18n';

function ProductTable({ table }) {
  return <div className="product-table-wrap">
    <table>
      <caption>{table.caption}</caption>
      <thead><tr>{table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead>
      <tbody>{table.rows.map(row => <tr key={row.join('-')}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

function DetailList({ title, items }) {
  if (!items) return null;
  return <section className="detail-list"><h3>{title}</h3><ul>{items.map(item => <li key={item}>{item}</li>)}</ul></section>;
}

function ProductDetails({ product, onApply }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <>
    <div className="detail-heading"><span className="eyebrow">{product.category}</span><h2 id="product-dialog-title" tabIndex={-1} ref={heading}>{product.name}</h2><p>{product.tagline}</p></div>
    {product.rate && <section className="detail-rate"><span>Interest</span><strong>{product.rate}</strong></section>}
    {product.benefit && <p className="detail-benefit"><span aria-hidden="true">✧</span>{product.benefit}</p>}
    <div className="detail-columns"><DetailList title="Features" items={product.features} /><DetailList title="Eligibility" items={product.eligibility} /></div>
    {product.documents && <DetailList title={product.id === 'mortgage-loan' ? 'Documents & conditions' : 'Documents'} items={product.documents} />}
    {product.tables && <div className="detail-tables">{product.tables.map(table => <ProductTable key={table.caption} table={table} />)}</div>}
    <div className="detail-actions"><span>Ready to take the next step?</span><button className="button dark" onClick={onApply}>Apply Now <Icon /></button></div>
  </>;
}

function ApplicationPreview({ product, onBack }) {
  const language = useLanguage();
  const form = useRef(null);
  const [complete, setComplete] = useState(false);
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, [complete]);
  const validate = input => {
    input.setCustomValidity('');
    const key = !input.value.trim() ? `Please enter your ${input.name}.` : input.name === 'phone' && !/^(?:\+91[\s-]?)?\d(?:[\s-]?\d){9}$/.test(input.value) ? 'Enter a 10-digit phone number, optionally prefixed with +91.' : input.validity.typeMismatch ? 'Please enter a valid email address.' : '';
    input.setCustomValidity(t(key));
  };
  useEffect(() => { form.current?.querySelectorAll('input').forEach(input => { if (input.validationMessage) validate(input); }); }, [language]);

  function submit(event) {
    event.preventDefault();
    // This prototype deliberately does not transmit or persist form values.
    event.currentTarget.reset();
    setComplete(true);
  }

  return <div className="application-preview">
    <button className="application-back text-link" onClick={onBack}><Icon /> Back to product</button>
    <div className="detail-heading"><span className="eyebrow">{product.name}</span><h2 id="product-dialog-title" tabIndex={-1} ref={heading}>{complete ? 'Preview complete.' : 'Your next step.'}</h2></div>
    {complete ? <div className="application-result" role="status"><span className="result-mark" aria-hidden="true">✓</span><h3>Your details have not been sent.</h3><p>{`No application has been submitted. To continue with ${product.name}, speak with Sakhi.`}</p><a className="button dark" href="tel:9920028810">Call 9920028810 <Icon /></a></div> : <>
      <p className="preview-notice">Application preview only. Try the form below; your details will not be sent or saved.</p>
      <form ref={form} className="application-form" onSubmit={submit} onInvalid={event => validate(event.target)} onInput={event => validate(event.target)}>
        <label htmlFor="applicant-name">Name<input id="applicant-name" name="name" autoComplete="name" required pattern=".*\S.*" maxLength={120} /></label>
        <label htmlFor="applicant-phone">Phone Number<input id="applicant-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={24} title="Enter a 10-digit phone number, optionally prefixed with +91." /></label>
        <label htmlFor="applicant-email">Email<input id="applicant-email" name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <button className="button dark" type="submit">Preview application <Icon /></button>
      </form>
    </>}
  </div>;
}

function ProductDialog({ product, kind, onClose }) {
  const dialog = useRef(null);
  const [applying, setApplying] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement;
    element.showModal();
    element.querySelector('#product-dialog-title')?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, []);

  function changeView(apply) {
    setApplying(apply);
    dialog.current.scrollTo({ top: 0, behavior: 'instant' });
  }

  function requestClose() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onClose();
    else setClosing(true);
  }

  useEffect(() => {
    if (!closing) return;
    const element = dialog.current;
    let active = true;
    const frame = requestAnimationFrame(() => {
      const animations = element.getAnimations();
      Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => { if (active) onClose(); });
    });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, [closing, onClose]);

  return <dialog ref={dialog} className={`product-dialog ${kind}-dialog`} data-closing={closing || undefined} aria-labelledby="product-dialog-title" onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
  }}>
    <div className="dialog-toolbar"><span>{applying ? 'APPLICATION PREVIEW' : 'PRODUCT DETAILS'}</span><button className="dialog-close" aria-label="Close product details" onClick={requestClose}>×</button></div>
    <div className="dialog-content">{applying ? <ApplicationPreview product={product} onBack={() => changeView(false)} /> : <ProductDetails product={product} onApply={() => changeView(true)} />}</div>
  </dialog>;
}

export function ProductsPage({ kind }) {
  const saving = kind === 'deposits';
  const items = saving ? deposits : loans;
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    document.title = `${saving ? 'Deposits' : 'Loans'} | Sakhi Multistate Co-operative Credit Society`;
    const hash = window.location.hash.slice(1);
    const product = items.find(item => item.id === hash);
    if (!product) return;
    const frame = requestAnimationFrame(() => {
      const card = document.getElementById(hash);
      card?.scrollIntoView({ behavior: 'instant', block: 'start' });
      card?.querySelector('button')?.focus({ preventScroll: true });
      setSelected(product);
    });
    return () => cancelAnimationFrame(frame);
  }, [items, saving]);

  return <>
    {saving ? <DepositsPage onSelect={setSelected} /> : <LoansPage onSelect={setSelected} />}
    {selected && <ProductDialog key={selected.id} product={selected} kind={kind} onClose={() => setSelected(null)} />}
  </>;
}
