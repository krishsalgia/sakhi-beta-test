import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

// Compare rendered facts directly with the authoritative brief, not the app's data.
const brief = await readFile('sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md', 'utf8');
const productBrief = brief.split('# Deposit products')[1].split('# PHASE 2 QA CHECKPOINT')[0];
const expected = Object.fromEntries(['deposits', 'loans'].map((kind, index) => {
  const segment = productBrief.split('# Loan products')[index];
  const entries = [...segment.matchAll(/^## (.+)\r?\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(([, name, body]) => {
    const facts = [
      ...[...body.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)].map(match => match[1]),
      ...[...body.matchAll(/^- (.+)$/gm)].map(match => match[1].trim()),
    ];
    const tables = [...body.matchAll(/(?:^\|.+\|\r?\n?)+/gm)].map(match => match[0].trim().split(/\r?\n/).filter(line => !/^\|[:\s|-]+\|$/.test(line)).map(line => line.split('|').slice(1, -1).map(cell => cell.trim())));
    return { name, facts, tables };
  });
  return [kind, entries];
}));
assert.equal(expected.deposits.length, 8);
assert.equal(expected.loans.length, 7);
await mkdir('qa/screenshots/phase2', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [], requests = [], results = [];
const normalize = text => text.replace(/\s+/g, ' ').trim();

async function checkBounds(page, label) {
  const bounds = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(bounds.page <= bounds.width, `${label}: page overflows`);
  const dialog = page.locator('dialog[open]');
  if (await dialog.count()) {
    assert.ok(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth), `${label}: dialog overflows`);
  }
}

async function checkForm(page) {
  await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
  const before = requests.length;
  assert.deepEqual(await page.locator('form input').evaluateAll(inputs => inputs.map(input => input.name)), ['name', 'phone', 'email']);
  await page.getByRole('button', { name: 'Preview application' }).click();
  assert.equal(await page.locator('form').count(), 1, 'Empty form must not submit');
  await page.getByLabel('Name', { exact: true }).fill('   ');
  await page.getByLabel('Phone Number', { exact: true }).fill('123');
  await page.getByLabel('Email', { exact: true }).fill('invalid');
  assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), false);
  await page.getByLabel('Name', { exact: true }).fill('QA Member');
  await page.getByLabel('Phone Number', { exact: true }).fill('+91 90000 00000');
  await page.getByLabel('Email', { exact: true }).fill('qa@example.test');
  assert.equal(await page.locator('form').evaluate(form => form.checkValidity()), true);
  await page.getByRole('button', { name: 'Preview application' }).click();
  await page.getByRole('heading', { name: 'Preview complete.' }).waitFor();
  assert.match(await page.getByRole('dialog').getByRole('status').innerText(), /No application has been submitted/);
  assert.equal(requests.length, before, 'Form flow must make zero requests');
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
  await page.getByRole('button', { name: 'Back to product' }).click();
  await page.getByRole('button', { name: 'Apply Now', exact: true }).click();
  assert.equal(await page.getByLabel('Name', { exact: true }).inputValue(), '', 'Preview must clear personal data');
  await page.getByRole('button', { name: 'Back to product' }).click();
}

try {
  for (const [viewport, width, height] of [['desktop', 1440, 1000], ['tablet', 768, 1024], ['mobile', 375, 812], ['small-mobile', 320, 740]]) {
    for (const kind of ['deposits', 'loans']) {
      const page = await browser.newPage({ viewport: { width, height } });
      page.on('pageerror', error => errors.push(`${viewport}/${kind}: ${error.message}`));
      page.on('console', message => { if (message.type() === 'error') errors.push(`${viewport}/${kind}: ${message.text()}`); });
      page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on('requestfailed', request => errors.push(`Failed ${request.url()}`));
      await page.goto(`http://127.0.0.1:5173/products/${kind}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all(document.getAnimations().filter(animation => animation.effect.getTiming().iterations !== Infinity).map(animation => animation.finished.catch(() => {}))));
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.catalog-card').count(), expected[kind].length);
      await checkBounds(page, `${viewport}/${kind}`);
      const hero = page.locator(kind === 'deposits' ? '.deposit-hero' : '.loan-hero');
      assert.ok(await hero.evaluate(element => { const rect = element.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth; }), `${viewport}/${kind}: hero is clipped`);
      await page.screenshot({ path: `qa/screenshots/phase2/${viewport}-${kind}-hero.png` });
      await page.locator('.catalog-card').last().scrollIntoViewIfNeeded();
      await page.locator(kind === 'deposits' ? '.deposit-crosslink' : '.loan-crosslink').scrollIntoViewIfNeeded();
      await page.evaluate(() => document.querySelectorAll('.product-reveal').forEach(element => { element.dataset.reveal = 'visible'; }));
      await page.waitForFunction(() => [...document.querySelectorAll('.product-reveal')].every(element => getComputedStyle(element).opacity === '1'));
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await page.screenshot({ path: `qa/screenshots/phase2/${viewport}-${kind}-full.png`, fullPage: true });

      for (const [index, product] of expected[kind].entries()) {
        const button = page.getByRole('button', { name: `View details for ${product.name}`, exact: true });
        await button.click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor({ state: 'visible' });
        await dialog.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished.catch(() => {}))));
        const text = normalize(await dialog.innerText());
        for (const fact of product.facts) assert.ok(text.includes(normalize(fact)), `${kind}/${product.name}: missing fact ${fact}`);
        const actualTables = await dialog.locator('table').evaluateAll(tables => tables.map(table => [...table.rows].map(row => [...row.cells].map(cell => cell.textContent.trim()))));
        assert.deepEqual(actualTables, product.tables, `${product.name}: table differs from brief`);
        await checkBounds(page, `${viewport}/${product.name}`);
        if (product.name === 'Current Account') assert.doesNotMatch(await dialog.locator('.detail-list').filter({ has: page.getByRole('heading', { name: 'Eligibility', exact: true }) }).innerText(), /\d/);
        if (product.name === 'Pension Deposits') assert.doesNotMatch(text, /months|years/);
        if (index === 0 || product.tables.length || product.name === 'Mortgage Loan') await page.screenshot({ path: `qa/screenshots/phase2/${viewport}-${kind}-detail-${index}.png` });
        if (viewport === 'desktop' || index === 0) await checkForm(page);
        if (index === 0) {
          await page.getByRole('button', { name: 'Close product details' }).focus();
          await page.keyboard.press('Tab');
          assert.ok(await page.evaluate(() => !!document.activeElement.closest('dialog')), 'Focus escaped modal');
        }
        await page.keyboard.press('Escape');
    await page.locator('dialog').waitFor({state:'detached'});
        assert.equal(await page.locator('dialog').count(), 0);
        assert.ok(await button.evaluate(element => document.activeElement === element), 'Focus must return to the opener');
      }
      await page.locator('#product-catalog').scrollIntoViewIfNeeded();
      assert.ok(Math.abs(await page.locator('.header').evaluate(element => element.getBoundingClientRect().top)) < 1);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator(kind === 'deposits' ? '.growth-star' : '.portal-arrow').evaluate(element => getComputedStyle(element).animationName), 'none');
      if (width <= 760) await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('button', { name: 'Our Products', exact: true }).click();
      const other = kind === 'deposits' ? 'Loans' : 'Deposits';
      await page.locator('#products-menu').getByRole('link', { name: other }).click();
      await page.waitForURL(`**/products/${other.toLowerCase()}`);
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('.catalog-card').count(), expected[other.toLowerCase()].length);
      await page.goBack({ waitUntil: 'networkidle' });
      assert.equal(new URL(page.url()).pathname, `/products/${kind}`);
      const body = await page.locator('body').innerText();
      assert.doesNotMatch(body.replaceAll('info@hccs.co.in', ''), /HCCS|Hindust[ah]n|testimonials/i);
      results.push({ viewport, route: `/products/${kind}`, products: expected[kind].length, sourceFacts: 'passed', exactTables: 'passed', forms: 'passed', focus: 'passed', responsive: 'passed' });
      await page.close();
    }
  }
  assert.deepEqual(errors, []);
  assert.ok(requests.every(request => request.method === 'GET' && request.url.startsWith('http://127.0.0.1:5173/')), 'Unexpected requests');
  await writeFile('qa/phase2-results.json', JSON.stringify({ results, errors, networkSubmissions: 0 }, null, 2));
  console.log(JSON.stringify({ results, errors, networkSubmissions: 0 }, null, 2));
} finally { await browser.close(); }
