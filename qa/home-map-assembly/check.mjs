import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base = 'http://127.0.0.1:5173';
const sizes = [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[1024,1366],[768,1024],[430,932],[390,844],[375,812],[320,740]];
const browser = await chromium.launch({channel:'chrome'});
const results = [], errors = [];
const delay = page => page.waitForTimeout(80);
async function bounds(page) {
  return page.locator('.home-branch-assembly').evaluate(host => {
    const section = host.querySelector('section'), stage = host.querySelector('.network-map-stage');
    const offset = stage.getBoundingClientRect().top - section.getBoundingClientRect().top;
    const pin = parseFloat(getComputedStyle(section).top) || parseFloat(host.style.getPropertyValue('--assembly-pin-top'));
    const start = Math.max(pin + offset + 80, innerHeight * .55);
    const end = pin + offset - parseFloat(getComputedStyle(host, '::after').height);
    const top = host.getBoundingClientRect().top + scrollY + offset + parseFloat(getComputedStyle(section).marginTop);
    return {top,start,end};
  });
}
async function scrollProgress(page, metrics, progress) {
  await page.evaluate(({top,start,end,progress}) => scrollTo({top:top-start+(start-end)*progress,behavior:'instant'}), {...metrics,progress});
  await delay(page);
}
async function snapshot(page) {
  return page.locator('.home-branch-assembly').evaluate(host => {
    const panel = host.querySelector('.map-panel').getBoundingClientRect();
    return {
      phase: host.dataset.assembly,
      progress: Number(host.style.getPropertyValue('--assembly-progress')),
      height: host.offsetHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      inert: host.querySelector('.territory-tabs').inert,
      panelOpacity: Number(getComputedStyle(host.querySelector('.territory-tabs')).opacity),
      pieces: [...host.querySelectorAll('.india-map use')].map(node => {
        const style = getComputedStyle(node), b = node.getBoundingClientRect(), matrix = new DOMMatrix(style.transform);
        return {id:node.getAttribute('href').split('#')[1],opacity:Number(style.opacity),stroke:Number(style.strokeOpacity),fill:style.fill,x:matrix.m41,perspective:matrix.m34,transform:style.transform,
          clipped:Number(style.opacity)>.05 && (b.left<panel.left-1 || b.right>panel.right+1 || b.top<panel.top-1 || b.bottom>panel.bottom+1)};
      }),
    };
  });
}
function monitor(page,label) {
  page.on('pageerror',e=>errors.push(`${label}: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error') errors.push(`${label}: ${m.text()}`);});
}
async function level(page,name) {
  await page.locator(`.branch-network[data-map-level="${name}"]`).waitFor();
  await page.waitForTimeout(800);
}
async function drill(page) {
  await page.locator('.map-state-verified').click(); await level(page,'state');
  assert.equal(await page.locator('.city-marker').count(),6);
  await page.locator('.area-choice').first().click(); await level(page,'city');
  await page.locator('.leaflet-tile-loaded').first().waitFor();
  assert.equal(await page.locator('.selected-branch').count(),0);
  assert.equal(await page.locator('.branch-card').count(),6);
  await page.locator('.branch-card[data-branch="andheri"]').click();
  await page.locator('.selected-branch').waitFor();
  const branch = (await import('../../src/branch-data.js')).branches.find(b=>b.id==='andheri');
  assert.equal(await page.locator('.selected-branch > p').textContent(),branch.address);
  await page.locator('.network-back').click(); await level(page,'state');
  await page.locator('.network-back').click(); await level(page,'india');
  await page.locator('.territory-tabs button').last().click(); await level(page,'state');
  assert.equal(await page.locator('.city-marker,.branch-card').count(),0);
  await page.locator('.network-breadcrumbs button').first().click(); await level(page,'india');
}
try {
  for (const [width,height] of sizes) {
    const page = await browser.newPage({viewport:{width,height}});
    monitor(page,`motion-${width}`);
    await page.goto(base,{waitUntil:'networkidle'});
    const metrics = await bounds(page);
    const initial = await snapshot(page);
    assert.equal(initial.pieces.length,36);
    assert.ok(initial.pieces.every(p=>p.opacity===0),'First load must have no map');
    assert.ok(initial.inert);
    await page.evaluate(()=>{window.assemblyCLS=0;new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.assemblyCLS+=e.value;})).observe({type:'layout-shift',buffered:false});});
    const samples = [];
    for (const p of [0,.10,.16,.25,.35,.50,.60,.75,.83,.93,1]) {
      await scrollProgress(page,metrics,p);
      const sample = await snapshot(page); samples.push(sample);
      assert.equal(sample.height,initial.height,'Entrance changed layout height');
      assert.equal(sample.overflow,false);
      assert.ok(sample.pieces.every(s=>!s.clipped),`Clipped pieces at ${width}/${p}: ${sample.pieces.filter(s=>s.clipped).map(s=>s.id)}`);
      assert.equal(await page.locator('.city-marker,.branch-marker,.selected-branch').count(),0);
      if ([0,.16,.35,.60,.83,.93,1].includes(p)) await page.screenshot({path:`qa/home-map-assembly/${width}-${p}.png`});
    }
    const early = samples[2].pieces.filter(p=>p.opacity>.1);
    assert.ok(early.some(p=>p.x < -1) && early.some(p=>p.x > 1),'Both sides enter together');
    assert.ok(early.some(p=>p.perspective!==0),'3D transform missing');
    const neutral = samples[8];
    assert.ok(neutral.pieces.every(p=>p.transform==='none' && p.opacity===1),'All geometry must settle before emphasis');
    assert.ok(neutral.pieces.every(p=>p.fill==='rgb(220, 231, 238)'));
    const final = samples.at(-1);
    assert.equal(final.phase,'ready'); assert.equal(final.inert,false);
    assert.equal(final.pieces.find(p=>p.id==='IN-MH').fill,'rgba(0, 76, 163, 0.78)');
    assert.equal(final.pieces.find(p=>p.id==='IN-KA').fill,'rgba(102, 129, 58, 0.34)');
    assert.ok(final.pieces.every(p=>p.stroke===1));
    await scrollProgress(page,metrics,.16);
    const reverse = await snapshot(page);
    assert.deepEqual(reverse.pieces,samples[2].pieces,'Reverse scroll must retrace assembly');
    await page.waitForTimeout(400);
    assert.deepEqual((await snapshot(page)).pieces,reverse.pieces,'No scroll means no autoplay');
    await scrollProgress(page,metrics,0);
    assert.ok((await snapshot(page)).pieces.every(p=>p.opacity===0));
    await scrollProgress(page,metrics,1.02);
    const cls = await page.evaluate(()=>window.assemblyCLS);
    assert.equal(cls,0);
    results.push({width,height,motion:'passed',reverse:'passed',geometry:'passed',clipping:false,overflow:false,cls});
    console.log('Motion passed',width); await page.close();
  }
  for (const route of ['/', '/branches']) for (const [width,height] of [[1440,900],[3840,2160],[768,1024],[390,844]]) {
    const page = await browser.newPage({viewport:{width,height},hasTouch:width<1000});monitor(page,`${route}-${width}`);
    await page.goto(base+route,{waitUntil:'networkidle'});
    if(route==='/') await scrollProgress(page,await bounds(page),1.05);
    else {
      assert.equal(await page.locator('.home-branch-assembly').count(),0);
      assert.ok(await page.locator('.india-map use').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1' && getComputedStyle(n).transform==='none')));
    }
    await drill(page);
    if(route==='/') {
      assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await delay(page);
      assert.ok((await snapshot(page)).pieces.every(p=>p.opacity===1),'Exploration must not be undone by scrolling');
    }
    results.push({route,width,hierarchy:'passed',breadcrumbs:'passed',tiles:'loaded'});
    console.log('Interactions passed',route,width);await page.close();
  }
  for(const language of ['en','hi','mr']) for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});monitor(page,`${language}-reduced-${width}`);
    await page.addInitScript(lang=>localStorage.setItem('sakhi.language',lang),language);
    await page.goto(base,{waitUntil:'networkidle'});const metrics=await bounds(page);
    await scrollProgress(page,metrics,.25);
    const sample=await snapshot(page);assert.ok(sample.pieces.every(p=>p.transform==='none'));
    assert.ok(sample.pieces.some(p=>p.opacity>0) && sample.pieces.some(p=>p.opacity<1));
    await scrollProgress(page,metrics,1.1);assert.equal((await snapshot(page)).inert,false);
    await drill(page);
    assert.equal(await page.locator('html').getAttribute('lang'),language);
    results.push({language,width,reducedMotion:'passed',hierarchy:'passed'});
    console.log('Reduced motion / language passed',language,width);await page.close();
  }
  const hashes=JSON.parse(await readFile('qa/home-map-assembly/before-hashes.json','utf8'));
  const changed=[];for(const [path,hash] of Object.entries(hashes)) if(createHash('sha256').update(await readFile(path)).digest('hex')!==hash) changed.push(path);
  assert.deepEqual(changed,['src/main.jsx']);
  assert.deepEqual(errors,[]);
  await writeFile('qa/home-map-assembly/results.json',JSON.stringify({results,errors,existingFilesChanged:changed,newFiles:['src/home-branch-assembly.jsx','src/home-branch-assembly.css']},null,2));
} finally { await browser.close(); }
