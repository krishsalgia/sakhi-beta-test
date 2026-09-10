import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}), errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const host=page.locator('.home-branch-assembly');
const pause=()=>page.waitForTimeout(100);
try {
  await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
  assert.equal(await host.evaluate(h=>h.style.getPropertyValue('--assembly-progress')),'0');
  await page.locator('.network-breadcrumbs button').focus();
  assert.equal(await host.getAttribute('data-assembly'),'exploring');
  await page.locator('.map-state-verified').focus();await page.keyboard.press('Enter');
  await page.locator('.state-detail-map').waitFor();
  assert.equal(await page.locator('.city-marker').count(),6);
  await page.reload({waitUntil:'networkidle'});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await pause();
  const position=await host.evaluate(h=>{
    const s=h.querySelector('section'),stage=h.querySelector('.network-map-stage'),offset=stage.getBoundingClientRect().top-s.getBoundingClientRect().top;
    const pin=parseFloat(getComputedStyle(s).top)+offset,start=Math.max(pin+80,innerHeight*.55),end=pin-parseFloat(getComputedStyle(h,'::after').height);
    return h.getBoundingClientRect().top+scrollY+offset+parseFloat(getComputedStyle(s).marginTop)-start+(start-end)*.52;
  });
  await page.evaluate(top=>scrollTo({top,behavior:'instant'}),position);await pause();
  const before=await host.evaluate(h=>Number(h.style.getPropertyValue('--assembly-progress')));
  await page.mouse.move(700,300);await page.mouse.wheel(0,80);await page.waitForTimeout(300);
  assert.ok(await host.evaluate((h,p)=>Number(h.style.getPropertyValue('--assembly-progress'))>p,before));
  await page.mouse.wheel(0,-80);await page.waitForTimeout(300);
  assert.ok(Math.abs(await host.evaluate(h=>Number(h.style.getPropertyValue('--assembly-progress')))-before)<.01);
  for(const lang of ['hi','mr','en']) {
    await page.locator('.language-control select').selectOption(lang);await pause();
    assert.equal(await page.locator('html').getAttribute('lang'),lang);
    assert.equal(await host.getAttribute('data-assembly'),'assembling');
    assert.equal(await host.locator('.india-map use').count(),36);
  }
  for(const [width,height] of [[390,844],[844,390],[768,1024],[1440,900]]) {
    await page.setViewportSize({width,height});await pause();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok(await host.evaluate(h=>Number.isFinite(Number(h.style.getPropertyValue('--assembly-progress')))));
  }
  await page.locator('.network-breadcrumbs button').focus();
  for(const [width,height] of [[390,844],[844,390],[1440,900]]) {
    await page.setViewportSize({width,height});await pause();
    assert.equal(await host.getAttribute('data-assembly'),'exploring');
    assert.ok(await host.locator('.india-map use').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).transform==='none' && getComputedStyle(n).opacity==='1')));
  }
  const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  touch.on('pageerror',e=>errors.push(e.message));
  await touch.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
  await touch.locator('.network-page-link').scrollIntoViewIfNeeded();await touch.waitForTimeout(100);
  assert.equal(await touch.locator('.home-branch-assembly').getAttribute('data-assembly'),'ready');
  await touch.locator('.territory-tabs button').first().tap();
  await touch.locator('.state-detail-map').waitFor();await touch.waitForTimeout(700);
  await touch.locator('.network-back').tap();await touch.locator('.india-map').waitFor();
  assert.equal(await touch.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');
  await touch.close();
  assert.deepEqual(errors,[]);
  await writeFile('qa/home-map-assembly/lifecycle-results.json',JSON.stringify({keyboard:'passed',nativeWheelAndReverse:'passed',languageSwitchDuringAssembly:'passed',resizeAndOrientation:'passed',touchHandoff:'passed',strictModeRemount:'passed',errors},null,2));
  console.log('Keyboard, native wheel/reverse, language changes, resize/orientation, reload and touch passed.');
} finally {await browser.close();}
