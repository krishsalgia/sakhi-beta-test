import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('button', { name: 'Our Products', exact: true }).click();
  await page.locator('#products-menu').getByRole('link', { name: 'Loans', exact: true }).focus();
  await page.keyboard.press('Escape');
  const focus = await page.evaluate(() => document.activeElement.textContent);
  assert.ok(focus.includes('Our Products'));
  const motion = await page.locator('.savings-panel').evaluate(element => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 0;
    const start = getComputedStyle(element).transform;
    animation.currentTime = 3500;
    const middle = getComputedStyle(element).transform;
    animation.currentTime = 7000;
    const end = getComputedStyle(element).transform;
    return { start, middle, end };
  });
  assert.notEqual(motion.start, motion.middle);
  assert.equal(motion.start, motion.end);
  console.log(JSON.stringify({ keyboardFocus: 'passed', periodicHeroMotion: 'passed' }));
} finally { await browser.close(); }
