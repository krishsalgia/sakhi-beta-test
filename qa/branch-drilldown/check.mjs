import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { branches } from '../../src/branch-data.js';

const base='http://127.0.0.1:5173';
const sizes=[[2560,1440],[1920,1080],[1440,900],[768,1024],[390,844],[320,740]];
const groups={Mumbai:['andheri','jarimari','jogeshwari','ghatkopar','chembur','borivali'],Thane:['thane'],Panvel:['panvel'],Pune:['chinchwad'],Satara:['satara','pusesavali'],Solapur:['tembhurni']};
assert.deepEqual(Object.values(groups).flat().sort(),branches.map(b=>b.id).sort());
const browser=await chromium.launch({channel:'chrome'}),errors=[],results=[];
await mkdir('qa/branch-drilldown/screens',{recursive:true});
const context=await browser.newContext();
const pause=page=>page.waitForTimeout(950);
async function level(page,name) {await page.locator(`.branch-network[data-map-level="${name}"]`).waitFor();await pause(page);}
async function snap(page,name,width) {await page.mouse.move(0,0);await page.locator('.network-navigation').scrollIntoViewIfNeeded();await pause(page);await page.locator('.network-workspace').screenshot({path:`qa/branch-drilldown/screens/${width}-${name}.png`});}
async function tiles(page) {
  await page.locator('.city-geographic-map').waitFor();
  await page.waitForFunction(()=>document.querySelectorAll('.leaflet-tile-loaded').length>0);
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.map-tile-message').count(),0,'City basemap failed');
}
async function detail(page,id) {
  const branch=branches.find(b=>b.id===id),panel=page.locator('.selected-branch');
  await panel.getByRole('heading',{name:branch.name,exact:true}).waitFor();
  assert.equal(await panel.locator('p').textContent(),branch.address);
  assert.equal(await panel.getByRole('link',{name:branch.phone,exact:true}).getAttribute('href'),'tel:'+branch.phone);
  assert.equal(await panel.getByRole('link',{name:branch.email,exact:true}).getAttribute('href'),'mailto:'+branch.email);
  assert.equal(await page.locator(`[data-branch-marker="${id}"]`).getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator(`.branch-card[data-branch="${id}"]`).getAttribute('aria-pressed'),'true');
}
try {
  for(const [width,height] of sizes) {
    const page=await context.newPage();await page.setViewportSize({width,height});
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
    page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')errors.push(`${width}: ${r.url()} ${r.failure()?.errorText}`);});
    await page.goto(base,{waitUntil:'networkidle'});
    await snap(page,'india',width);
    assert.equal(await page.locator('.india-map .map-state').count(),2);
    assert.equal(await page.locator('.india-map .inactive-states use').count(),34);
    assert.equal(await page.locator('.branch-marker,.city-marker,.selected-branch').count(),0);
    await page.getByRole('button',{name:'Choose Maharashtra',exact:true}).hover();
    assert.ok(await page.locator('.map-state-verified').evaluate(el=>el.classList.contains('is-selected')));
    await page.getByRole('button',{name:'Explore Maharashtra',exact:true}).focus();await page.keyboard.press('Enter');
    await level(page,'state');
    assert.equal(await page.locator('.branch-marker,.branch-card,.india-map').count(),0);
    assert.equal(await page.locator('.city-marker').count(),6);
    assert.equal(await page.locator('.area-choice').count(),6);
    await snap(page,'maharashtra',width);
    await page.getByRole('button',{name:'Explore Mumbai, 6 locations',exact:true}).focus();await page.keyboard.press('Enter');
    await level(page,'city');await tiles(page);
    assert.equal(await page.locator('.city-marker,.india-map,.state-detail-map').count(),0);
    assert.deepEqual((await page.locator('.branch-card').evaluateAll(els=>els.map(el=>el.dataset.branch))).sort(),groups.Mumbai.toSorted());
    assert.equal(await page.locator('.branch-marker').count(),6);
    assert.equal(await page.locator('.selected-branch').count(),0,'No branch selected until requested');
    await snap(page,'mumbai',width);
    await page.getByRole('button',{name:'Select Jogeshwari branch',exact:true}).click();await detail(page,'jogeshwari');await tiles(page);
    await snap(page,'jogeshwari',width);
    await page.locator('.branch-card[data-branch="borivali"]').click();await detail(page,'borivali');await tiles(page);
    await page.getByRole('button',{name:'Show all branches',exact:true}).click();await pause(page);
    const markers=await page.locator('.branch-marker').evaluateAll(els=>els.map(el=>{const b=el.getBoundingClientRect(),m=el.closest('.city-geographic-map').getBoundingClientRect();return b.x>=m.x&&b.right<=m.right&&b.y>=m.y&&b.bottom<=m.bottom;}));
    assert.ok(markers.every(Boolean),'Fit-all must show every branch marker');
    const wheelTop=await page.evaluate(()=>scrollY);await page.locator('.city-geographic-map').hover();await page.mouse.wheel(0,160);await page.waitForTimeout(350);
    assert.notEqual(await page.evaluate(()=>scrollY),wheelTop,'City map hijacked page wheel scrolling');
    await page.locator('.network-back').click();await level(page,'state');
    await page.locator('.network-back').click();await level(page,'india');
    await page.getByRole('button',{name:'Choose Karnataka',exact:true}).click();await level(page,'state');
    assert.equal(await page.locator('.city-marker,.branch-marker,.branch-card').count(),0);
    assert.ok((await page.locator('.network-level-intro').innerText()).includes('Karnataka branch information is being updated.'));
    await snap(page,'karnataka',width);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'Explore Maharashtra',exact:true}).click();await level(page,'state');
    assert.equal(await page.locator('.network-workspace').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
    await page.getByRole('button',{name:'Choose Mumbai',exact:true}).click();await level(page,'city');await tiles(page);
    await page.getByRole('button',{name:'Select Jogeshwari branch',exact:true}).focus();await page.keyboard.press('Space');await detail(page,'jogeshwari');await tiles(page);
    assert.equal(await page.locator('.network-workspace').evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal page overflow');
    await page.emulateMedia({reducedMotion:'no-preference'});
    if(width===1440) {
      for(const [city,ids] of Object.entries(groups)) {
        await page.locator('.network-breadcrumbs').getByRole('button',{name:'Maharashtra',exact:true}).click();await level(page,'state');
        await page.getByRole('button',{name:`Choose ${city}`,exact:true}).click();await level(page,'city');await tiles(page);
        assert.deepEqual((await page.locator('.branch-card').evaluateAll(els=>els.map(el=>el.dataset.branch))).sort(),ids.toSorted());
        assert.equal(await page.locator('.branch-marker').count(),ids.length);
        for(const id of ids){await page.locator(`.branch-card[data-branch="${id}"]`).click();await detail(page,id);await tiles(page);}
      }
    }
    results.push({width,height,hierarchy:'passed',tileMap:'loaded',markerListSync:'passed',backNavigation:'passed',reducedMotion:'passed',overflow:false});
    console.log(`Passed branch hierarchy at ${width}x${height}`);await page.close();
  }
  // Actual touch input, plus resizing an already-open map.
  const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await touch.newPage();await page.goto(base);
  await page.getByRole('button',{name:'Choose Maharashtra',exact:true}).tap();await level(page,'state');
  await page.getByRole('button',{name:'Choose Mumbai',exact:true}).tap();await level(page,'city');await tiles(page);
  await page.getByRole('button',{name:'Select Jogeshwari branch',exact:true}).tap();await detail(page,'jogeshwari');await tiles(page);
  await page.setViewportSize({width:844,height:390});await pause(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.network-back').tap();await level(page,'state');await touch.close();
  const baseline=JSON.parse(await readFile('qa/branch-drilldown/before-hashes.json','utf8'));
  for(const [file,hash] of Object.entries(baseline)) {
    if(file==='src/branch-network.jsx')continue;
    assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`Unrelated source changed: ${file}`);
  }
  assert.deepEqual(errors,[]);
  await writeFile('qa/branch-drilldown/results.json',JSON.stringify({results,errors,allTwelveAddresses:'unchanged',allCityGroups:'passed',touch:'passed',unrelatedSources:'unchanged'},null,2));
  console.log('All branch drill-down, geography grouping, 12 exact addresses, touch, responsive and preservation checks passed.');
} finally {await context.close();await browser.close();}
