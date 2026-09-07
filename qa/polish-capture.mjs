import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const stage = process.argv[2] || 'before';
const dir = `qa/polish/${stage}`;
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const width of [2560, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 1440 } });
    for (const [route, key, sections] of [
      ['/', 'home', ['.featured', '.steps']],
      ['/products/loans', 'loans', ['.loan-ledger']],
      ['/products/deposits', 'deposits', ['.lakhpati-explorer', '.deposit-crosslink']],
      ['/services', 'services', ['.service-directory']],
    ]) {
      await page.goto(`http://127.0.0.1:5173${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1600);
      await page.screenshot({ path: `${dir}/${key}-${width}-hero.png` });
      for (const selector of sections) {
        const section = page.locator(selector);
        await section.scrollIntoViewIfNeeded();
        for (const item of await section.locator('.product-reveal,[data-site-reveal]').all()) {
          await item.scrollIntoViewIfNeeded();
          await page.waitForTimeout(100);
        }
        await page.waitForTimeout(850);
        await page.screenshot({ path: `${dir}/${key}-${width}-${selector.slice(1)}.png` });
      }
    }
    await page.close();
  }
} finally { await browser.close(); }
console.log(`Saved ${stage} screenshots to ${dir}.`);
