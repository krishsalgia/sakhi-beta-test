import { useSyncExternalStore } from 'react';
import catalog from './messages.txt?raw';

// Source-message keys keep translations independent of product IDs and values.
export const messages = Object.fromEntries(catalog.split('\n').filter(line => line.includes('|||')).map(line => {
  const [en, hi, mr] = line.split('|||').map(part => part.trim());
  return [en, { en, hi, mr }];
}));
const foldedMessages = Object.fromEntries(Object.entries(messages).map(([key, value]) => [key.toLowerCase(), value]));
const supported = ['en', 'hi', 'mr'];
let language = 'en';
try { const saved = localStorage.getItem('sakhi.language'); if (supported.includes(saved)) language = saved; } catch {}
document.documentElement.lang = language;
const listeners = new Set();
export function setLanguage(next) {
  if (!supported.includes(next) || next === language) return;
  language = next;
  document.documentElement.lang = next;
  try { localStorage.setItem('sakhi.language', next); } catch {}
  listeners.forEach(listener => listener());
}
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const useLanguage = () => useSyncExternalStore(subscribe, () => language, () => 'en');

export function t(value) {
  if (typeof value !== 'string' || language === 'en' || !/[A-Za-z]/.test(value)) return value;
  const key = value.trim().replace(/\s+/g, ' ');
  const match = messages[key] || foldedMessages[key.toLowerCase()];
  if (match) return value.replace(value.trim(), match[language]);
  // Preserve official identity, contact details, addresses, rates and identifiers.
  if (/^(Sakhi(?: Multistate Co-operative Credit Society| Multi State Co Operative Credit Society Ltd\.)?|NEFT|RTGS|QR|FD|RD|EMI|GST|IFSC|PAN|MOA & AOA|Form G|NOC|LLP|OpenStreetMap|Leaflet|React India Map project|MH|KA|N)$/.test(key) || /@|https?:|^\d[\d,.%+\s/₹]*$|^₹/.test(key)) return value;
  if (/Sagar Tech Plaza|Hindusthan Bhavan|Sarvodaya Sahakari|Guru Nanak Nagar|Samrat CHS|Rajhas Niwas|Kishor Kunj|At Post Pusesavali|Ganesh Complex|Survey No\.|Raghukanta Apartment|55 Bhavani Peth/.test(key)) return value;
  // Dynamic interface messages use centrally translated templates.
  for (const [source, translations] of templates) {
    const found = key.match(source);
    if (found) return translations[language].replace(/\$(\d+)/g, (_, index) => t(found[Number(index)]));
  }
  const pieces = value.split(/( · | \/ |\n)/);
  if (pieces.length > 1) return pieces.map(piece => /^( · | \/ |\n)$/.test(piece) ? piece : t(piece)).join('');
  if (import.meta.env.DEV) { window.__sakhiMissingTranslations ??= new Set(); window.__sakhiMissingTranslations.add(key); }
  return value;
}
const templates = [
  [/^No application has been submitted\. To continue with (.+), speak with Sakhi\.$/, { hi: 'कोई आवेदन जमा नहीं हुआ है। $1 के लिए आगे बढ़ने हेतु Sakhi से बात करें।', mr: 'कोणताही अर्ज सादर केलेला नाही. $1 साठी पुढील प्रक्रिया करण्यासाठी Sakhi शी संपर्क साधा.' }],
  [/^Explore (.+), (\d+) locations?$/, { hi: '$1 देखें, $2 शाखाएँ', mr: '$1 पाहा, $2 शाखा' }],
  [/^Explore (.+)$/, { hi: '$1 देखें', mr: '$1 पाहा' }],
  [/^Choose (.+)$/, { hi: '$1 चुनें', mr: '$1 निवडा' }],
  [/^View details for (.+)$/, { hi: '$1 का विवरण देखें', mr: '$1 चे तपशील पाहा' }],
  [/^View (.+)$/, { hi: '$1 देखें', mr: '$1 पाहा' }],
  [/^Show (.+) rate$/, { hi: '$1 की दर देखें', mr: '$1 चा दर पाहा' }],
  [/^Show product (\d+)$/, { hi: 'उत्पाद $1 देखें', mr: 'उत्पादन $1 पाहा' }],
  [/^Select (.+) branch$/, { hi: '$1 शाखा चुनें', mr: '$1 शाखा निवडा' }],
  [/^(.+) area geographic branch map$/, { hi: '$1 क्षेत्र की शाखाओं का भौगोलिक मानचित्र', mr: '$1 परिसरातील शाखांचा भौगोलिक नकाशा' }],
  [/^(.+) Sakhi branches$/, { hi: '$1 में Sakhi की शाखाएँ', mr: '$1 येथील Sakhi शाखा' }],
  [/^(.+) slider$/, { hi: '$1 समायोजित करें', mr: '$1 समायोजित करा' }],
  [/^Please enter your (.+)\.$/, { hi: 'कृपया अपना $1 दर्ज करें।', mr: 'कृपया आपले $1 भरा.' }],
  [/^(\d+) years$/, { hi: '$1 वर्ष', mr: '$1 वर्षे' }],
  [/^(\d+) months$/, { hi: '$1 महीने', mr: '$1 महिने' }],
  [/^(.+) to (.+)$/, { hi: '$1 से $2', mr: '$1 ते $2' }],
  [/^(.+) cr$/, { hi: '$1 करोड़', mr: '$1 कोटी' }],
  [/^Interest: ([\d.%\s]+)$/, { hi: 'ब्याज: $1', mr: 'व्याज: $1' }],
  [/^(.+) \/ BRANCH LOCATIONS$/, { hi: '$1 / शाखाओं के स्थान', mr: '$1 / शाखांची ठिकाणे' }],
  [/^(.+)\. (\d+) Sakhi locations\. Select a branch\.$/, { hi: '$1। Sakhi की $2 शाखाएँ। एक शाखा चुनें।', mr: '$1. Sakhi च्या $2 शाखा. एक शाखा निवडा.' }],
  [/^(.+)\. Choose a city or area\.$/, { hi: '$1। शहर या क्षेत्र चुनें।', mr: '$1. शहर किंवा परिसर निवडा.' }],
  [/^(.+)\. Branch information is being updated\.$/, { hi: '$1। शाखाओं की जानकारी अद्यतन की जा रही है।', mr: '$1. शाखांची माहिती अद्ययावत केली जात आहे.' }],
  [/^Period (.+), Deposit Amount (.+), Maturity Amount (.+)$/, { hi: 'अवधि $1, जमा राशि $2, परिपक्वता राशि $3', mr: 'मुदत $1, ठेव रक्कम $2, मुदतपूर्ती रक्कम $3' }],
  [/^(.+): (.+) percent principal and (.+) percent estimated return or interest$/, { hi: '$1: $2 प्रतिशत मूलधन और $3 प्रतिशत अनुमानित प्रतिफल या ब्याज', mr: '$1: $2 टक्के मुद्दल आणि $3 टक्के अंदाजित परतावा किंवा व्याज' }],
];
