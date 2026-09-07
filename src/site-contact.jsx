import React from './i18n/react';
import { Icon } from './ui';

export const contact = {
  address: 'B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East, Mumbai, 400072, Maharashtra, India',
  phone: '9920028810',
  email: 'info@hccs.co.in',
};

export function ServiceIcon({ name, ...props }) {
  const paths = {
    digital: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 3h4m-3 12h2',
    transfer: 'M3 7h17m-5-4 5 4-5 4M21 17H4m5-4-5 4 5 4',
    clock: 'M12 8v5l3 2M9 3a9 9 0 1 1-6 9M3 3v5h5',
    scan: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h3v3H8zm6 0h2v3h-2zm-6 6h3v2H8zm6 0h2v2h-2z',
    access: 'm3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',
    phone: 'm7 3-4 3c0 8 7 15 15 15l3-4-5-3-2 3c-4-2-5-3-7-7l3-2-3-5Z',
    mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
    pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM9 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>;
}

export function Footer() {
  const links = [['Home', '/'], ['Loans', '/products/loans'], ['Deposits', '/products/deposits'], ['Services', '/services'], ['Branches', '/branches'], ['Contact', '/contact']];
  return <footer className="site-footer">
    <div className="footer-top"><div className="footer-intro"><div className="footer-logo"><img src="/assets/sakhi-logo.png" alt="Sakhi Multi State Co Operative Credit Society Ltd." width="646" height="152" /></div><p>Our goal at Sakhi Multistate Co-operative Credit Society is to provide access to various types of loans at competitive interest rates.</p></div>
      <nav className="footer-navigation" aria-label="Footer navigation"><span>EXPLORE SAKHI</span>{links.map(([label, href]) => <a key={href} href={href}>{label}<Icon /></a>)}</nav>
      <div className="footer-contact"><span>GET IN TOUCH</span><address>{contact.address}</address><a href={`tel:${contact.phone}`}>{contact.phone}<Icon /></a><a href={`mailto:${contact.email}`}>{contact.email}<Icon /></a></div>
    </div><div className="footer-bottom"><span>Sakhi Multistate Co-operative Credit Society</span><span>People first. Possibilities next.<i aria-hidden="true" /></span></div>
  </footer>;
}
