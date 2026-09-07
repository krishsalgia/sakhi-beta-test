import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { metrics, products, faqs } from '../src/content.js';
import { branches } from '../src/branch-data.js';

const branchLinks = new Set([
  ...branches.flatMap(branch => [`tel:${branch.phone}`, `mailto:${branch.email}`]),
  'https://github.com/vishalvoid/react-india-map',
]);

await mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], failedRequests = [], results = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 375, 812], ['small-mobile', 320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', error => errors.push(`${name}: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`${name}: ${message.text()}`); });
    page.on('requestfailed', request => failedRequests.push(`${name}: ${request.url()}`));
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.deposit-visual').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `qa/screenshots/${name}-hero.png` });
    await page.screenshot({ path: `qa/screenshots/${name}-full.png`, fullPage: true });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.product-card').count(), products.length);
    assert.equal(await page.locator('.faq-item').count(), faqs.length);
    for (const [value, label] of metrics) {
      const metric = page.locator('.metrics > div').filter({ hasText: label });
      assert.equal(await metric.locator('dd').textContent(), value);
    }
    const overflow = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
    assert.ok(overflow.page <= overflow.viewport, `${name}: horizontal overflow ${JSON.stringify(overflow)}`);
    const panelsInViewport = await page.locator('.hero-panel').evaluateAll(elements => elements.every(element => { const rect = element.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth; }));
    assert.equal(panelsInViewport, true, `${name}: hero panels clipped by viewport`);
    assert.equal(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    if (width <= 760) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      assert.equal(await page.locator('#navigation').isVisible(), true);
    }
    await page.getByRole('button', { name: 'Our Products', exact: true }).click();
    assert.equal(await page.locator('#products-menu').getByRole('link', { name: 'Loans', exact: true }).getAttribute('href'), '/products/loans');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#products-menu').count(), 0);
    await page.locator('#reasons').scrollIntoViewIfNeeded();
    const headerTop = await page.locator('.header').evaluate(element => element.getBoundingClientRect().top);
    assert.ok(Math.abs(headerTop) < 1, `${name}: header is not sticky`);
    await page.getByRole('button', { name: 'Check loan eligibility' }).click();
    assert.equal(await page.locator('#eligibility-details').isVisible(), true);
    assert.equal(await page.locator('#eligibility-details a[href="tel:9920028810"]').count(), 1);
    for (let i = 0; i < faqs.length; i++) {
      await page.locator(`#question-${i}`).click();
      assert.equal(await page.locator(`#question-${i}`).getAttribute('aria-expanded'), 'true');
      await page.locator(`#answer-${i}`).waitFor({ state: 'visible' });
      assert.equal(await page.locator(`#answer-${i}`).isVisible(), true);
    }
    await page.locator('#question-1').click();
    await page.locator('#question-1').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `qa/screenshots/${name}-faq.png` });
    const links = await page.locator('a').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    assert.ok(links.every(href => href.startsWith('#') || branchLinks.has(href) || ['/', '/services', '/contact', '/branches'].includes(href) || /^\/products\/(loans|deposits)(#[-a-z]+)?$/.test(href)));
    for (const href of links.filter(href => href.startsWith('#'))) assert.equal(await page.locator(href).count(), 1);
    const text = await page.locator('body').innerText();
    const sanitized = text.replace(/[\w.-]+@hccs\.co\.in/gi, '').replaceAll('Hindusthan Bhavan', '');
    assert.equal(/Hindust[ah]n|HCCS|testimonial/i.test(sanitized), false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.savings-panel').evaluate(element => getComputedStyle(element).animationName), 'none');
    results.push({ viewport: name, size: `${width}x${height}`, overflow: false, stickyHeader: true, faq: '11 passed', eligibility: 'passed', reducedMotion: 'passed' });
    await page.close();
  }
  assert.deepEqual(errors, [], 'Console/page errors');
  assert.deepEqual(failedRequests, [], 'Failed network requests');
  await writeFile('qa/results.json', JSON.stringify({ results, errors, failedRequests }, null, 2));
  console.log(JSON.stringify({ results, errors, failedRequests }, null, 2));
} finally { await browser.close(); }
