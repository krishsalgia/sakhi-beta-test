import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { branches } from '../src/branch-data.js';
const branchLinks=new Set([...branches.flatMap(branch=>[`tel:${branch.phone}`,`mailto:${branch.email}`]),'https://github.com/vishalvoid/react-india-map']);
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[],failures=[];
await mkdir('qa/screenshots/phase4',{recursive:true});
const routes=[['/','home'],['/products/loans','loans'],['/products/deposits','deposits'],['/services','services'],['/contact','contact']];
async function settled(page) {
 await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
}
try {
 for(const [name,width,height] of [['desktop',1440,1000],['compact-desktop',1024,768],['tablet',820,1180],['narrow-tablet',768,1024],['mobile',390,844],['small-mobile',320,740],['landscape',667,375]]) {
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>failures.push(r.url()));page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  for(const [route,key] of routes) {
   await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('main').count(),1);
   await page.locator('.skip-link').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('main').evaluate(el=>document.activeElement===el),true,'Skip link focus');
   await page.keyboard.press('Escape');assert.equal(await page.locator('main').evaluate(el=>document.activeElement===el),true,'Escape moved focus without a menu');
   if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
   await page.getByRole('button',{name:'Our Products',exact:true}).click();
   if(width<=760) {
    const menu=await page.locator('#navigation').boundingBox();assert.ok(menu.y+menu.height<=height,'Mobile menu exceeds viewport');
    await page.locator('#navigation a[href="/contact"]').focus();
    const contact=await page.locator('#navigation a[href="/contact"]').boundingBox();assert.ok(contact.y+contact.height<=height,'Menu cannot scroll to Contact');
   }
   await page.keyboard.press('Escape');assert.equal(await page.locator('#products-menu').count(),0);
   assert.equal(await page.locator(width<=760?'.menu-toggle':'.products-nav > button').evaluate(el=>document.activeElement===el),true);
   await page.locator('main').focus();
   for(const el of await page.locator('.product-reveal').all()) {
    await el.scrollIntoViewIfNeeded();await page.waitForFunction(el=>el.dataset.reveal==='visible',await el.elementHandle());
   }
   for(const image of await page.locator('img[loading="lazy"]').all()) await image.scrollIntoViewIfNeeded();
   if(key==='services') {
    await page.locator('.service-transfers').scrollIntoViewIfNeeded();
    for(const progress of await page.locator('.transfer-track i').all()) {
     await progress.evaluate(el=>{const a=el.getAnimations()[0];a.pause();a.currentTime=a.effect.getTiming().duration*.99;});
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Transfer motion overflow');
    }
   }
   await page.locator('footer').scrollIntoViewIfNeeded();
   assert.ok(Math.abs(await page.locator('.header').evaluate(el=>el.getBoundingClientRect().top))<1,'Header not fixed');
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
   const hrefs=await page.locator('a').evaluateAll(els=>els.map(el=>el.getAttribute('href')));
   for(const href of hrefs)assert.ok(href.startsWith('#')||branchLinks.has(href)||['/','/products/loans','/products/deposits','/services','/contact','/branches'].includes(href)||/^\/products\/(loans|deposits)#[a-z-]+$/.test(href),href);
   const sanitized=(await page.locator('body').innerText()).replace(/[\w.-]+@hccs\.co\.in/gi,'').replaceAll('Hindusthan Bhavan','');
   assert.doesNotMatch(sanitized,/HCCS|Hindust[ah]n|testimonials|newsletter|Privacy Policy|developer credit/i);
   if(route==='/')await page.waitForFunction(()=>getComputedStyle(document.querySelector('.savings-panel')).animationPlayState==='paused');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settled(page);
   if(['desktop','tablet','mobile','small-mobile'].includes(name)) {
    await page.screenshot({path:`qa/screenshots/phase4/after-${name}-${key}-hero.png`});
    await page.screenshot({path:`qa/screenshots/phase4/after-${name}-${key}-full.png`,fullPage:true});
   }
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'Animations remain under reduced motion');
   await page.emulateMedia({reducedMotion:'no-preference'});
   results.push({viewport:name,route,overflow:false,header:'passed',navigation:'passed',reducedMotion:'passed'});
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:5173/products/deposits',{waitUntil:'networkidle'});
 const stage=page.locator('.growth-stage'),box=await stage.boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.3);
 await page.waitForFunction(()=>document.querySelector('.growth-stage').style.getPropertyValue('--tilt-y')!=='');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await stage.evaluate(el=>el.style.getPropertyValue('--tilt-y')),'0deg');
 await page.emulateMedia({reducedMotion:'no-preference'});
 assert.equal(await stage.evaluate(el=>el.style.getPropertyValue('--tilt-y')),'0deg','Old tilt restored when reduced motion disabled');
 for(const [route,key] of [['/products/deposits','deposits'],['/products/loans','loans']]) {
  await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'networkidle'});
  // This assertion measures dialog motion. Settle the catalogue's existing
  // scroll reveal first so focus cannot move the button between down/up events.
  await page.locator('.catalog-card').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.catalog-card').dataset.reveal!=='waiting');await settled(page);
  await page.locator('.catalog-card button').first().click();await page.getByRole('dialog').waitFor();
  const states=await page.getByRole('dialog').evaluate(el=>{const a=el.getAnimations()[0];a.pause();const duration=a.effect.getTiming().duration;const transforms=[];for(const t of [0,duration/2,duration]){a.currentTime=t;transforms.push(getComputedStyle(el).transform);}a.finish();return transforms;});
  assert.notEqual(states[0],states[1]);assert.notEqual(states[1],states[2]);
  await page.screenshot({path:`qa/screenshots/phase4/${key}-dialog-open.png`});
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.querySelector('dialog')?.dataset.closing==='true');
  await page.locator('dialog').waitFor({state:'detached'});
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.catalog-card button').first().click();
  assert.equal(await page.getByRole('dialog').evaluate(el=>el.getAnimations().length),0);
  await page.keyboard.press('Escape');await page.locator('dialog').waitFor({state:'detached'});
  await page.emulateMedia({reducedMotion:'no-preference'});
 }
 const baseline=JSON.parse(await readFile('qa/phase4-baseline/hashes.json','utf8'));
 for(const file of ['src/content.js','src/product-data.js','src/service-data.js','public/assets/sakhi-logo.png'])assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),baseline[file],file);
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 await writeFile('qa/phase4-results.json',JSON.stringify({results,errors,failures,dialogTransitions:'passed',liveReducedMotion:'passed',contentAndLogo:'unchanged'},null,2));
 console.log(JSON.stringify({viewports:7,routes:5,checks:results.length,errors,failures,dialogTransitions:'passed',liveReducedMotion:'passed',contentAndLogo:'unchanged'},null,2));
}finally{await browser.close();}
