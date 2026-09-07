import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

await mkdir('qa/polish/viewports', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const width of [1366, 1440, 1920, 2560, 3840, 768, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width > 2000 ? 1440 : 900 } });
    await page.goto('http://127.0.0.1:5173/products/loans', { waitUntil: 'networkidle' });
    const row = page.locator('.loan-row').first();
    await row.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(850);
    const atRest = await row.evaluate(el => ({
      wash: getComputedStyle(el, '::before').transform,
      cta: getComputedStyle(el.querySelector('.loan-row-open svg')).transform,
    }));
    await page.screenshot({ path: `qa/polish/viewports/loan-list-${width}.png` });
    await row.hover();
    await page.waitForTimeout(650);
    assert.notEqual(await row.evaluate(el => getComputedStyle(el, '::before').transform), atRest.wash);
    // The approved arrow rotation belongs to the CTA's hover, not the whole row.
    await row.locator('.loan-row-open').hover();
    await page.waitForTimeout(400);
    assert.notEqual(await row.locator('.loan-row-open svg').evaluate(el => getComputedStyle(el).transform), atRest.cta);

    await page.goto('http://127.0.0.1:5173/services', { waitUntil: 'networkidle' });
    const service = page.locator('.service-directory button').first();
    await service.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(850);
    const before = await service.evaluate(el => getComputedStyle(el).backgroundColor);
    await service.hover();
    await page.waitForTimeout(650);
    assert.notEqual(await service.evaluate(el => getComputedStyle(el).backgroundColor), before);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log(`Loan wash/CTA and service hover preserved at ${width}px`);
    await page.close();
  }
} finally { await browser.close(); }
