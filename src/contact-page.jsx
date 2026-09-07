import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from './ui';
import { contact, ServiceIcon } from './site-contact';

const fields = [
  { key: 'name', label: 'Name', placeholder: 'What should we call you?', autoComplete: 'name', maxLength: 120 },
  { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email', autoComplete: 'email', maxLength: 254 },
  { key: 'phone', label: 'Phone', placeholder: 'Your phone number', type: 'tel', autoComplete: 'tel', maxLength: 24 },
  { key: 'message', label: 'Message', placeholder: 'Tell us what’s on your mind.', maxLength: 3000 },
];
function errorFor(key, value) {
  if (!value.trim()) return `Please enter your ${key}.`;
  if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email address.';
  if (key === 'phone' && (!/^(?:\+91[\s-]?)?\d(?:[\s-]?\d){9}$/.test(value.trim()) || /^(\d)\1{9}$/.test(value.replace(/\D/g, '').slice(-10)))) return 'Use a valid 10-digit number, optionally with +91.';
  return '';
}

function ConversationForm() {
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});
  const [active, setActive] = useState(0), [complete, setComplete] = useState(false);
  const status = useRef(null), form = useRef(null);
  const filled = fields.filter(field => !errorFor(field.key, values[field.key])).length;
  useEffect(() => {
    if (!complete) return;
    status.current?.focus({ preventScroll: true });
    status.current?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [complete]);
  const submit = event => {
    event.preventDefault();
    const next = Object.fromEntries(fields.map(field => [field.key, errorFor(field.key, values[field.key])]));
    setErrors(next);
    const first = fields.find(field => next[field.key]);
    if (first) { form.current.elements.namedItem(first.key).focus(); return; }
    setComplete(true);
  };
  return <section className="conversation" id="conversation" aria-labelledby="conversation-title" data-complete={complete} style={{ '--field': active, '--filled': filled }}>
    <div className="conversation-companion"><span className="connection-label">YOU + SAKHI</span><h2 id="conversation-title">A little<br />conversation.<br /><em>A new possibility.</em></h2><p>Start with what matters to you.<br />We’re here to help you take the next step.</p>
      <div className="conversation-signal" aria-hidden="true"><div className="signal-orbit" /><div className="signal-orbit second" /><div className="signal-core"><ServiceIcon name={complete ? 'mail' : ['access', 'mail', 'phone', 'mail'][active]} /></div><span className="signal-node node-you">You</span><span className="signal-node node-sakhi">Sakhi</span><svg viewBox="0 0 320 240" fill="none"><path d="M45 165C20 40 230 10 268 120S120 252 65 162" pathLength="1" /></svg></div>
      <div className="conversation-meter"><span>{complete ? 'Message ready' : 'Your conversation'}<b>{String(filled).padStart(2, '0')} / 04</b></span><div>{fields.map((field, index) => <i key={field.key} className={!errorFor(field.key, values[field.key]) ? 'filled' : ''} data-active={active === index} />)}</div><small>Local preview · nothing is sent or saved.</small></div>
    </div>
    <div className="conversation-paper"><div className="paper-heading"><span>MAKE THE FIRST CONNECTION</span><ServiceIcon name="mail" /></div>
      <form ref={form} className="message-form" onSubmit={submit} noValidate inert={complete} aria-hidden={complete || undefined}>
        {fields.map((field, index) => {
          const control = { id: `contact-${field.key}`, name: field.key, value: values[field.key], required: true, maxLength: field.maxLength, placeholder: field.placeholder, autoComplete: field.autoComplete, 'aria-invalid': !!errors[field.key], 'aria-describedby': `${field.key}-error`, onFocus: () => setActive(index), onBlur: () => setErrors(previous => ({ ...previous, [field.key]: errorFor(field.key, values[field.key]) })), onChange: event => { const value = event.target.value; setValues(previous => ({ ...previous, [field.key]: value })); if (errors[field.key]) setErrors(previous => ({ ...previous, [field.key]: errorFor(field.key, value) })); } };
          return <div className="message-field" key={field.key} data-invalid={!!errors[field.key]}><label htmlFor={control.id}><span aria-hidden="true">0{index + 1}</span>{field.label}<i aria-hidden="true">↗</i></label>{field.key === 'message' ? <textarea {...control} rows={3} /> : <input {...control} type={field.type || 'text'} />}<span className="field-error" id={`${field.key}-error`} aria-live="polite">{errors[field.key] || ''}</span></div>;
        })}
        <div className="message-submit-row"><p>All fields are required.<br />This form is a local preview.</p><button className="button dark" type="submit">Submit <Icon /></button></div>
      </form>
      {complete && <div className="message-ready"><div className="ready-envelope" aria-hidden="true"><ServiceIcon name="mail" /><span>✓</span></div><div ref={status} role="status" tabIndex={-1}><span className="connection-label">YOUR WORDS. YOUR NEXT STEP.</span><h3>Message<br /><em>ready.</em></h3><p>Your message has not been sent or saved.<br />Please call or email Sakhi to get in touch.</p></div><a className="button dark" href={`mailto:${contact.email}`}>Email Sakhi <Icon /></a><button className="text-link" onClick={() => { setComplete(false); requestAnimationFrame(() => form.current.elements.namedItem('name').focus()); }}>Back to form <Icon /></button></div>}
    </div>
  </section>;
}

export function ContactPage() {
  const root = useRef(null);
  useEffect(() => {
    document.title = 'Contact Us | Sakhi Multistate Co-operative Credit Society';
    const element = root.current, hero = element.querySelector('.connection-opening');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const progress = Math.max(0, Math.min(1, -hero.getBoundingClientRect().top / hero.offsetHeight));
      element.style.setProperty('--contact-scroll', reduced.matches ? 0 : progress);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointer = event => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--hand-x', `${(event.clientX - box.left - box.width / 2) * .018}px`);
      hero.style.setProperty('--hand-y', `${(event.clientY - box.top - box.height / 2) * .018}px`);
    };
    const leave = () => { hero.style.setProperty('--hand-x', '0px'); hero.style.setProperty('--hand-y', '0px'); };
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { entry.target.dataset.inView = entry.isIntersecting; if (entry.isIntersecting) entry.target.dataset.entered = 'true'; }), { threshold: .1 });
    element.querySelectorAll('section').forEach(section => observer.observe(section));
    window.addEventListener('scroll', schedule, { passive: true });
    reduced.addEventListener('change', schedule);
    hero.addEventListener('pointermove', pointer, { passive: true }); hero.addEventListener('pointerleave', leave);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', schedule); reduced.removeEventListener('change', schedule); hero.removeEventListener('pointermove', pointer); hero.removeEventListener('pointerleave', leave); };
  }, []);
  return <div className="connection-page" ref={root} data-own-motion>
    <section className="connection-opening" aria-labelledby="contact-title">
      <div className="connection-topline"><span>Contact Us</span><span>A CONNECTION CAN CHANGE EVERYTHING <i /></span></div>
      <h1 id="contact-title" aria-label="Get In Touch"><span className="connection-line first">Get In</span>{' '}<span className="connection-line second">Touch</span></h1>
      <a className="connection-start" href="#conversation" aria-label="Start a conversation"><Icon /><span>Start a<br />conversation</span></a>
      <div className="connection-sculpture" aria-hidden="true"><div className="connection-loop blue-loop" /><div className="connection-loop green-loop" /><span className="sculpture-star">✧</span><span className="sculpture-note">A LITTLE CLOSER.</span></div>
      <svg className="connection-thread" viewBox="0 0 1200 700" fill="none" preserveAspectRatio="none" aria-hidden="true"><path className="thread-base" d="M930 65C1160 20 1205 335 965 342S755 220 805 194 914 200 860 310 545 419 590 584 400 680 330 700" /><path className="thread-draw" pathLength="1" d="M930 65C1160 20 1205 335 965 342S755 220 805 194 914 200 860 310 545 419 590 584 400 680 330 700" /></svg>
      <div className="connection-intro"><p>Reach out to us &amp; we will respond as soon as we can.</p><span>Good conversations.<br />Real connections.</span></div>
      <div className="connection-channels"><a href={`tel:${contact.phone}`}><span className="channel-number">01</span><ServiceIcon name="phone" /><span><small>A VOICE AT THE OTHER END</small><strong>{contact.phone}</strong></span><Icon /></a><a href={`mailto:${contact.email}`}><span className="channel-number">02</span><ServiceIcon name="mail" /><span><small>A LITTLE HELLO GOES A LONG WAY</small><strong>{contact.email}</strong></span><Icon /></a></div>
    </section>
    <ConversationForm />
  </div>;
}
