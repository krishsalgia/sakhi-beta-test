import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const featured = ['Daily Deposit', 'Loan Against Deposits', 'Daily 100 days Loan / 200 days Loan', 'JLG Loan'];
  for (const product of featured) {
    await page.goto('http://127.0.0.1:5173/');
    await page.getByRole('link', { name: `View ${product}`, exact: true }).click();
    await page.getByRole('dialog').waitFor();
    assert.equal(await page.locator('#product-dialog-title').textContent(), product);
    await page.getByRole('button', { name: 'Close product details' }).click();
    await page.locator('dialog').waitFor({state:'detached'});
    assert.equal(await page.locator('dialog').count(), 0);
  }
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 375, 812]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:5173/products/loans');
    await page.getByRole('button', { name: 'View details for Personal Loan', exact: true }).click();
    await page.getByRole('dialog').evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: `qa/screenshots/phase2-redesign/${name}-loan-drawer.png` });
    await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
    await page.screenshot({ path: `qa/screenshots/phase2/${name}-application.png` });
    await page.getByLabel('Name', { exact: true }).fill('QA Member');
    await page.getByLabel('Phone Number', { exact: true }).fill('9000000000');
    await page.getByLabel('Email', { exact: true }).fill('qa@example.test');
    await page.getByRole('button', { name: 'Preview application' }).click();
    await page.getByRole('heading', { name: 'Preview complete.' }).waitFor();
    await page.screenshot({ path: `qa/screenshots/phase2/${name}-application-complete.png` });
    await page.mouse.click(3, 3);
    await page.locator('dialog').waitFor({state:'detached'});
    assert.equal(await page.locator('dialog').count(), 0, 'Backdrop must dismiss dialog');
  }
  console.log('All 4 featured links, close button and backdrop dismissal passed; desktop/mobile form screenshots captured.');
} finally { await browser.close(); }
