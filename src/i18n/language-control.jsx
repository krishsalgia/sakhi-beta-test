import React from './react';
import { useLanguage, setLanguage } from './index';

export function LanguageControl() {
  const language = useLanguage();
  return <label className="language-control"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-6 6-6 12 0 18 6-6 6-12 0-18Z" /></svg><span className="language-label">Language</span><select aria-label="Website language" value={language} onChange={event => setLanguage(event.target.value)}><option value="en" lang="en">English</option><option value="hi" lang="hi">हिन्दी</option><option value="mr" lang="mr">मराठी</option></select></label>;
}
