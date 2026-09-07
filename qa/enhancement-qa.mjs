import { chromium } from 'playwright';
import { calculateEmi, calculateFixedDeposit, calculateRecurringDeposit } from '../src/calculator-utils.js';

const base = 'http://127.0.0.1:5173';
const routes = ['/', '/products/loans', '/products/deposits', '/services', '/contact'];
const viewports = [
  { name: '1366', width: 1366, height: 768 },
  { name: '1440', width: 1440, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
  { name: '2560', width: 2560, height: 1440 },
  { name: '3840', width: 3840, height: 2160 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const close = (actual, expected, tolerance = .8) => Math.abs(actual - expected) <= tolerance;
async function revealPage(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(320, Math.floor((await page.viewportSize()).height * .58));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate(position => scrollTo(0, position), y);
    await page.waitForTimeout(70);
  }
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(140);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(100);
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let checks = 0;

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
      page.on('pageerror', error => errors.push(`page: ${error.message}`));
      page.on('requestfailed', request => errors.push(`request: ${request.url()} ${request.failure()?.errorText}`));
      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      assert(response?.ok(), `${route} returned ${response?.status()}`);
      await page.waitForTimeout(180);
      assert(await page.locator('h1').count() === 1, `${route} should contain exactly one h1 at ${viewport.name}`);
      const layout = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        shell: document.querySelector('.site-shell')?.getBoundingClientRect().width,
      }));
      assert(layout.scrollWidth <= layout.clientWidth + 1, `${route} overflows horizontally at ${viewport.name}: ${layout.scrollWidth}/${layout.clientWidth}`);
      if (viewport.width >= 1366) assert(layout.shell / viewport.width >= .91, `${route} shell too narrow at ${viewport.name}: ${(layout.shell / viewport.width).toFixed(3)}`);
      assert(errors.length === 0, `${route} errors at ${viewport.name}: ${errors.join(' | ')}`);
      if (viewport.name === '2560' || viewport.name === 'mobile') {
        await revealPage(page);
        const file = route === '/' ? 'home' : route.split('/').filter(Boolean).join('-');
        await page.screenshot({ path: `qa/enhancement-screens/${file}-${viewport.name}.png`, fullPage: true });
      }
      checks += 4;
      await page.close();
    }
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.branch-network').scrollIntoViewIfNeeded();
  assert(await page.locator('.branch-marker').count() === 0, 'India must show states only');
  assert(await page.locator('.branch-card').count() === 0, 'Branch cards appear after choosing a city');
  const mapBox = await page.locator('.india-map').boundingBox();
  assert(mapBox && mapBox.width > 350 && mapBox.height > 450, 'Whole-India map should be visibly sized');
  await page.getByRole('button', { name: 'Choose Karnataka', exact: true }).click();
  await page.getByText('Our verified directory does not yet include Karnataka branch addresses.', { exact: true }).waitFor();
  assert(await page.locator('.branch-marker').count() === 0, 'Karnataka must not show an unverified branch marker');
  await page.locator('.network-back').click();
  await page.getByRole('button', { name: 'Choose Maharashtra', exact: true }).click();
  await page.getByRole('button', { name: 'Choose Satara', exact: true }).click();
  await page.locator('.branch-card[data-branch="satara"]').click();
  assert(await page.locator('.selected-branch h3').textContent() === 'Satara', 'Marker selection should update branch details');
  checks += 6;

  await page.goto(`${base}/products/loans`, { waitUntil: 'networkidle' });
  await page.locator('#loan-amount-number').fill('100000');
  await page.locator('#loan-tenure-number').fill('12');
  const loan = calculateEmi(100000, 18, 12);
  const loanText = await page.locator('.loan-calculator .calc-results').innerText();
  assert(loanText.includes('₹9,168'), `EMI should display ₹9,168, saw ${loanText}`);
  assert(close(loan.emi, 9167.99), `EMI formula mismatch: ${loan.emi}`);
  assert(await page.locator('#loan-rate-number').isEditable() === false, 'Published 18% loan rate must remain locked');
  checks += 3;

  await page.goto(`${base}/products/deposits`, { waitUntil: 'networkidle' });
  await page.locator('#deposit-amount-number').fill('100000');
  await page.locator('#deposit-rate-number').fill('9');
  await page.locator('#deposit-tenure-number').fill('12');
  let depositText = await page.locator('.deposit-calculator .calc-results').innerText();
  assert(depositText.includes('₹9,000') && depositText.includes('₹1,09,000'), `FD output mismatch: ${depositText}`);
  const fd = calculateFixedDeposit(100000, 9, 12);
  assert(fd.returns === 9000 && fd.maturity === 109000, 'FD simple-interest calculation mismatch');
  await page.getByRole('tab', { name: /Recurring Deposit/ }).click();
  await page.locator('#monthly-investment-number').fill('10000');
  await page.locator('#deposit-rate-number').fill('8');
  await page.locator('#deposit-tenure-number').fill('12');
  depositText = await page.locator('.deposit-calculator .calc-results').innerText();
  const rd = calculateRecurringDeposit(10000, 8, 12);
  assert(rd.invested === 120000 && close(rd.returns, 5200, .01), 'RD illustrative calculation mismatch');
  assert(depositText.includes('₹1,20,000') && depositText.includes('₹5,200') && depositText.includes('₹1,25,200'), `RD output mismatch: ${depositText}`);
  assert((await page.locator('.deposit-calculator .calculator-disclaimer').innerText()).includes('simple interest'), 'Deposit assumption disclosure missing');
  checks += 5;

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.navigation a[href="/services"]').click();
  await page.waitForURL(`${base}/services`);
  assert(await page.locator('h1').textContent(), 'Route transition navigation did not complete');
  checks += 1;
  await page.close();

  console.log(`Enhancement QA passed: ${checks} checks across ${viewports.length} viewports and ${routes.length} routes.`);
} finally {
  await browser.close();
}
