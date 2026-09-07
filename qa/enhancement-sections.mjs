import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = 'http://127.0.0.1:5173';
await mkdir('qa/enhancement-screens/sections', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function capture(viewport, route, selector, name) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const section = page.locator(selector);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await section.screenshot({ path: `qa/enhancement-screens/sections/${name}.png` });
  await page.close();
}

try {
  const mobile = { width: 390, height: 844 };
  const fourK = { width: 3840, height: 2160 };
  await capture(mobile, '/', '.branch-network', 'mobile-branch-network');
  await capture(mobile, '/products/loans', '.loan-calculator', 'mobile-loan-calculator');
  await capture(mobile, '/products/deposits', '.deposit-calculator', 'mobile-deposit-calculator');
  await capture(mobile, '/services', '.services-body', 'mobile-services');
  await capture(mobile, '/contact', '.contact-layout', 'mobile-contact');
  await capture(fourK, '/', '.hero', '4k-home-hero');
  await capture(fourK, '/', '.branch-network', '4k-branch-network');
  await capture(fourK, '/products/loans', '.loan-calculator', '4k-loan-calculator');
  await capture(fourK, '/products/deposits', '.deposit-calculator', '4k-deposit-calculator');
  console.log('Focused enhancement screenshots captured.');
} finally {
  await browser.close();
}
