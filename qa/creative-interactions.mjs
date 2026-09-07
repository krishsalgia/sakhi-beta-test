import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const errors = [], results = [];
await mkdir('qa/screenshots/phase2-redesign', { recursive: true });

async function revealAndCapture(page, prefix) {
  for (const element of await page.locator('.product-reveal').all()) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element.dataset.reveal === 'visible' && getComputedStyle(element).opacity === '1', await element.elementHandle());
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.screenshot({ path: `qa/screenshots/phase2-redesign/${prefix}-hero.png` });
  await page.screenshot({ path: `qa/screenshots/phase2-redesign/${prefix}-full.png`, fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}

try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 375, 812], ['small-mobile', 320, 740]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('http://127.0.0.1:5173/products/deposits', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const [label, rate] of [['Fixed Deposits', '5.5% to 9%'], ['Recurring Deposits', '6.50% to 8.00%'], ['Daily Deposit', '5% to 7%']]) {
      await page.getByRole('button', { name: `Show ${label} rate` }).click();
      assert.equal(await page.locator('.rate-window strong').textContent(), rate);
    }
    await page.getByRole('button', { name: 'Show Fixed Deposits rate' }).click();
    await page.locator('.deposit-filters').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    for (const [label, count] of [['Everyday banking', 3], ['Build your savings', 2], ['Plan ahead', 3], ['All deposits', 8]]) {
      await page.getByRole('button', { name: label, exact: true }).click();
      assert.equal(await page.locator('.catalog-card').count(), count);
      assert.equal(await page.getByRole('button', { name: label, exact: true }).getAttribute('aria-pressed'), 'true');
    }
    const slider = page.getByRole('slider', { name: 'Choose a period' });
    await slider.focus();
    await page.keyboard.press('Home');
    for (const [index, [period, amount]] of [['12', '8,050'], ['24', '3,900'], ['36', '2,510'], ['48', '1,820'], ['60', '1,400'], ['72', '1,130']].entries()) {
      if (index) await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('.lakhpati-controls output').textContent(), period);
      assert.deepEqual(await page.locator('.lakhpati-output strong').allTextContents(), [amount, '1,00,000']);
    }
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await revealAndCapture(page, `${name}-deposits`);
    if (name === 'desktop') {
      const stage = page.locator('.growth-stage');
      const rect = await stage.boundingBox();
      await page.mouse.move(rect.x + rect.width * .8, rect.y + rect.height * .3);
      await page.waitForFunction(() => document.querySelector('.growth-stage').style.getPropertyValue('--tilt-y') !== '');
      assert.notEqual(await stage.evaluate(element => element.style.getPropertyValue('--tilt-y')), '0deg');
      await page.mouse.move(0, 0);
      assert.equal(await stage.evaluate(element => element.style.getPropertyValue('--tilt-y')), '0deg');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.growth-star').evaluate(element => getComputedStyle(element).animationName), 'none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    }
    await page.goto('http://127.0.0.1:5173/products/loans', { waitUntil: 'networkidle' });
    await page.locator('.loan-intent-bar').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    for (const [label, product] of [['Something for me', 'Personal Loan'], ['Put my gold to work', 'Gold Loan'], ['Grow together', 'JLG Loan']]) {
      await page.getByRole('button', { name: new RegExp(label) }).click();
      assert.equal(await page.locator('.loan-spotlight h2').textContent(), product);
      await page.getByRole('button', { name: `Explore ${product}`, exact: true }).click();
      await page.getByRole('dialog').waitFor({timeout:10000}).catch(async error => { await page.screenshot({path:'qa/screenshots/phase4/interaction-failure.png'}); console.log({name,product}); throw error; });
      assert.equal(await page.locator('#product-dialog-title').textContent(), product);
      await page.keyboard.press('Escape');
    await page.locator('dialog').waitFor({state:'detached'});
    }
    await page.getByRole('button', { name: /Something for me/ }).click();
    await page.locator('.readiness-panel').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const selector = page.getByLabel('Choose your loan', { exact: true });
    const options = await selector.locator('option').allTextContents();
    for (const [index, product] of options.entries()) {
      await selector.selectOption(String(index));
      const facts = await page.locator('.readiness-facts > ul li').allTextContents();
      await page.getByRole('button', { name: 'View all requirements' }).click();
      await page.getByRole('dialog').waitFor({timeout:10000}).catch(async error => { await page.screenshot({path:'qa/screenshots/phase4/interaction-failure.png'}); console.log({name,product}); throw error; });
      assert.equal(await page.locator('#product-dialog-title').textContent(), product);
      const eligibility = await page.getByRole('dialog').locator('.detail-list').filter({ has: page.getByRole('heading', { name: 'Eligibility', exact: true }) }).locator('li').allTextContents();
      assert.deepEqual(facts, eligibility);
      await page.keyboard.press('Escape');
    await page.locator('dialog').waitFor({state:'detached'});
    }
    await selector.selectOption('0');
    await revealAndCapture(page, `${name}-loans`);
    assert.equal(await page.locator('.portal-arrow').evaluate(element => getComputedStyle(element).animationName), 'arrow-drift');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.portal-arrow').evaluate(element => getComputedStyle(element).animationName), 'none');
    results.push({ viewport: name, rateSwitcher: 'passed', filters: 'passed', lakhpatiRows: 6, loanSpotlights: 3, eligibilityProducts: 7, realScrollReveals: 'passed', reducedMotion: 'passed' });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile('qa/creative-results.json', JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally { await browser.close(); }
