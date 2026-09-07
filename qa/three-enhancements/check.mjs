import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { branches } from '../../src/branch-data.js';
import { products } from '../../src/content.js';

const base = 'http://127.0.0.1:5173';
const sizes = [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844],[320,740]];
const errors = [], results = [];
const browser = await chromium.launch({ channel: 'chrome' });
await mkdir('qa/three-enhancements/screens', { recursive: true });
async function settle(page) {
  await page.evaluate(async () => { await Promise.all(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {}))); });
  await page.waitForTimeout(80);
}
async function screenshot(page, name) { await page.screenshot({ path: `qa/three-enhancements/screens/${name}.png` }); }
async function level(page, name) { await page.waitForFunction(name => document.querySelector('.branch-network').dataset.mapLevel === name, name); await settle(page); }
async function mapFlow(page, allBranches = false) {
  assert.equal(await page.locator('.branch-marker').count(), 0);
  await page.getByRole('button', { name: 'Choose Karnataka', exact: true }).click(); await level(page, 'state');
  assert.ok((await page.locator('.territory-empty').innerText()).includes('does not yet include Karnataka branch addresses'));
  assert.equal(await page.locator('.city-marker').count(), 0);
  await page.locator('.network-back').click(); await level(page, 'india');
  await page.getByRole('button', { name: 'Choose Maharashtra', exact: true }).click(); await level(page, 'state');
  assert.equal(await page.locator('.city-marker').count(), 6);
  const groups = allBranches ? ['Mumbai','Thane','Panvel','Pune','Satara','Solapur'] : ['Mumbai'];
  for (const city of groups) {
    await page.getByRole('button', { name: `Choose ${city}`, exact: true }).click(); await level(page, 'city');
    await page.locator('.geo-branch-marker').first().waitFor();
    const ids = await page.locator('.branch-card').evaluateAll(cards => cards.map(card => card.dataset.branch));
    for (const id of allBranches ? ids : ['jogeshwari']) {
      await page.locator(`[data-branch="${id}"]`).click(); await settle(page);
      const branch = branches.find(branch => branch.id === id);
      assert.equal(await page.locator('.selected-branch h3').innerText(), branch.name);
      assert.equal(await page.locator('.selected-branch > p').innerText(), branch.address);
      assert.equal(await page.locator(`[data-branch-marker="${id}"]`).getAttribute('aria-pressed'), 'true');
      if (branch.phone) assert.equal(await page.locator('.selected-branch a').first().getAttribute('href'), `tel:${branch.phone}`);
      if (branch.email) assert.ok(await page.locator(`.selected-branch a[href="mailto:${branch.email}"]`).count());
    }
    await page.getByRole('button', { name: 'Show all branches', exact: true }).click(); await settle(page);
    // Nearby Andheri/Jarimari pins naturally overlap at a city-wide mobile zoom.
    // Use the separate Jogeshwari pin for pointer sync; every card is tested above.
    const markerId = city === 'Mumbai' ? 'jogeshwari' : ids[0];
    await page.locator(`[data-branch-marker="${markerId}"]`).click(); await settle(page);
    assert.equal(await page.locator('.branch-card.is-selected').getAttribute('data-branch'), markerId);
    if(city === 'Mumbai') await screenshot(page, `map-${page.viewportSize().width}-${page.url().endsWith('/branches') ? 'dedicated' : 'home'}`);
    await page.locator('.network-back').click(); await level(page, 'state');
  }
  await page.getByRole('button', { name: 'India', exact: true }).click(); await level(page, 'india');
}
try {
  for (const [width, height] of sizes) {
    if(process.env.QA_WIDTHS && !process.env.QA_WIDTHS.split(',').includes(String(width))) continue;
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', error => errors.push(`${width}: ${error.message}`));
    page.on('console', message => { if(message.type() === 'error') errors.push(`${width}: ${message.text()}`); });
    await page.addInitScript(() => { window.layoutShifts = 0; new PerformanceObserver(list => { for(const entry of list.getEntries()) if(!entry.hadRecentInput) window.layoutShifts += entry.value; }).observe({ type: 'layout-shift', buffered: true }); });
    for (const route of ['/', '/branches', '/contact']) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' }); assert.ok(response.ok()); await settle(page);
      assert.equal(await page.locator('h1').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} overflow ${width}`);
      await screenshot(page, `${route.slice(1) || 'home'}-${width}`);
      if(route === '/contact') {
        assert.equal(await page.locator('.contact-layout').count(), 0);
        for (const text of ['Contact Us', 'Reach out to us & we will respond as soon as we can.', 'Branch Office', 'Mumbai, 400072', 'Maharashtra, India']) assert.ok((await page.locator('main').innerText()).includes(text));
        assert.ok(await page.getByRole('heading', { name: 'Get In Touch', exact: true }).count());
        assert.equal(await page.locator('.connection-channels a').first().getAttribute('href'), 'tel:9920028810');
        assert.equal(await page.locator('.connection-channels a').last().getAttribute('href'), 'mailto:info@hccs.co.in');
        await page.locator('.conversation').scrollIntoViewIfNeeded(); await settle(page); await screenshot(page, `conversation-${width}`);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        assert.equal(await page.locator('[aria-invalid=true]').count(), 4);
        assert.equal(await page.locator('#contact-name').evaluate(el => el === document.activeElement), true);
        await page.locator('#contact-name').fill('QA Visitor'); await page.locator('#contact-email').fill('invalid'); await page.locator('#contact-phone').fill('123'); await page.locator('#contact-message').fill('   ');
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        assert.equal(await page.locator('[aria-invalid=true]').count(), 3);
        await page.locator('#contact-email').fill('qa@example.com'); await page.locator('#contact-phone').fill('+91 9000000000'); await page.locator('#contact-message').fill('This is a local browser QA preview.');
        await page.locator('#contact-message').blur(); await settle(page);
        assert.equal(await page.locator('.conversation-meter .filled').count(), 4);
        const requests = []; const record = request => requests.push(request.url()); page.on('request', record);
        const heightBefore = await page.locator('.conversation-paper').evaluate(el => el.offsetHeight);
        await page.getByRole('button', { name: 'Submit', exact: true }).click(); await settle(page);
        assert.ok((await page.locator('.message-ready').innerText()).includes('Your message has not been sent or saved.'));
        assert.deepEqual(requests, [], 'Submitting must not make any network request'); page.off('request', record);
        assert.equal(await page.locator('.conversation-paper').evaluate(el => el.offsetHeight), heightBefore, 'Completion shifted layout');
        await page.locator('.message-ready').scrollIntoViewIfNeeded(); await screenshot(page, `ready-${width}`);
        await page.getByRole('button', { name: 'Back to form', exact: true }).click();
        assert.equal(await page.locator('#contact-name').inputValue(), 'QA Visitor');
        await page.locator('.connection-office').scrollIntoViewIfNeeded(); await settle(page); await screenshot(page, `office-${width}`);
      } else if(route === '/branches') {
        assert.equal(await page.locator('.network-page-link').count(), 0);
        await page.locator('.network-heading').scrollIntoViewIfNeeded(); await settle(page);
        await mapFlow(page, width === 1440 || width === 390);
      } else {
        const actual = await page.locator('.product-card h3').allTextContents(); assert.deepEqual(actual, products.map(product => product.title));
        const geometry = await page.locator('.featured-journey').evaluate(section => { const pin = section.firstElementChild; return { start: scrollY + section.getBoundingClientRect().top - parseFloat(getComputedStyle(pin).top || 0), runway: section.offsetHeight - pin.offsetHeight, position: getComputedStyle(pin).position }; });
        if(width > 1100) {
          assert.equal(geometry.position, 'sticky'); assert.ok(geometry.runway <= 1201);
          let previousX = -Infinity, pinY;
          for (let index = 0; index < 4; index++) {
            await page.evaluate(top => scrollTo({top, behavior:'instant'}), geometry.start + geometry.runway * index / 3); await page.waitForTimeout(120);
            const x = await page.locator('.featured-track').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
            assert.ok(x > previousX, 'Downward scroll must move the track LEFT to RIGHT'); previousX = x;
            const y = await page.locator('.featured-pin').evaluate(el => el.getBoundingClientRect().top);
            if(index) assert.ok(Math.abs(y - pinY) < 2, 'Pin moved during sequence'); pinY = y;
            assert.equal(await page.locator('.journey-progress [aria-current]').getAttribute('aria-label'), `Show product ${index + 1}`);
            const box = await page.locator('.product-card').nth(index).boundingBox(); assert.ok(Math.abs(box.x + box.width/2 - width/2) < 3, 'Active card not centered');
            const clickable = await page.locator('.product-caption').nth(index).evaluate(el => {const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+20,b.y+b.height/2));}); assert.ok(clickable, 'Card link blocked');
            await screenshot(page, `carousel-${width}-${index + 1}`);
          }
          await page.evaluate(top => scrollTo({top,behavior:'instant'}), geometry.start + geometry.runway + 250); await page.waitForTimeout(100);
          assert.ok((await page.locator('.featured-pin').boundingBox()).y < pinY - 200, 'Sticky did not release');
          await page.locator('.product-caption').nth(1).focus(); await page.waitForTimeout(120);
          assert.equal(await page.locator('.journey-progress [aria-current]').getAttribute('aria-label'), 'Show product 2');
        } else {
          assert.notEqual(geometry.position, 'sticky');
          await page.locator('.featured-journey').scrollIntoViewIfNeeded();
          await page.getByRole('button', { name:'Show product 4', exact:true }).click(); await page.waitForTimeout(700);
          assert.ok(await page.locator('.featured-track').evaluate(el => el.scrollLeft > 100));
          await screenshot(page, `carousel-touch-${width}`);
        }
        await page.locator('.reasons').scrollIntoViewIfNeeded(); await settle(page);
        await mapFlow(page);
        await page.getByRole('link', { name:'View all branches',exact:true }).click(); await page.waitForURL(base + '/branches');
        await page.goto(base, {waitUntil:'networkidle'}); await settle(page);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} after interaction overflow`);
      const cls = await page.evaluate(() => window.layoutShifts); assert.ok(cls < .1, `${route} CLS ${cls}`);
      await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(120);
      assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
      if(route === '/') assert.notEqual(await page.locator('.featured-pin').evaluate(el => getComputedStyle(el).position), 'sticky');
      await page.emulateMedia({reducedMotion:'no-preference'});
      results.push({width,height,route,cls,overflow:false,interactions:'passed',reducedMotion:'passed'});
      await writeFile(`qa/three-enhancements/results${process.env.QA_WIDTHS ? '-'+process.env.QA_WIDTHS.replaceAll(',','-') : ''}.json`,JSON.stringify({results,errors,status:'running'},null,2));
      console.log(`Passed ${route} ${width}×${height}`);
    }
    await page.close();
  }
  const baseline = JSON.parse(await readFile('qa/three-enhancements/before-hashes.json','utf8'));
  for(const [file,hash] of Object.entries(baseline)) {
    if(['main.jsx','site-motion.js','branch-network.jsx','contact-page.jsx'].includes(file)) continue;
    assert.equal(createHash('sha256').update(await readFile('src/'+file)).digest('hex'),hash,`Unrelated source changed: ${file}`);
  }
  assert.deepEqual(errors, []);
  await writeFile(`qa/three-enhancements/results${process.env.QA_WIDTHS ? '-'+process.env.QA_WIDTHS.replaceAll(',','-') : ''}.json`, JSON.stringify({results,errors,sharedBranchData:'unchanged',unrelatedSources:'unchanged'},null,2));
} finally {await browser.close();}
