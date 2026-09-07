import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { products } from '../../src/content.js';
const base='http://127.0.0.1:5173';
const sizes=[[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844],[320,740],[667,375]];
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const pause=page=>page.waitForTimeout(160);
async function sample(page,g,p){
  await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),g.start+g.runway*p);await pause(page);
  return page.evaluate(()=>({scale:new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.featured-composition')).transform).a,x:document.querySelectorAll('.featured-stop')[2].getBoundingClientRect().x,individual:[...document.querySelectorAll('.featured-stop')].map(e=>getComputedStyle(e).transform),pin:document.querySelector('.featured-pin').getBoundingClientRect().top,height:document.querySelector('#featured').offsetHeight}));
}
try{
 for(const [width,height] of sizes){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
  await page.addInitScript(()=>{window.cls=0;new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.cls+=e.value;})).observe({type:'layout-shift',buffered:true});});
  await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(1700);
  assert.deepEqual(await page.locator('.product-card h3').allTextContents(),products.map(p=>p.title));
  const g=await page.locator('#featured').evaluate(e=>({start:scrollY+e.getBoundingClientRect().top-parseFloat(getComputedStyle(e.firstElementChild).top),runway:e.offsetHeight-e.firstElementChild.offsetHeight}));
  if(width>1100){
   const points=[0,.04,.08,.12,.25,.5,.75,.88,.92,.96,1],samples=[];
   for(const p of points){const s=await sample(page,g,p);samples.push(s);assert.ok(s.individual.every(t=>t==='none'),'Per-card scaling exists');assert.equal(s.height,g.runway+await page.locator('.featured-pin').evaluate(e=>e.offsetHeight));if([0,.12,.5,.88,1].includes(p))await page.screenshot({path:`qa/carousel-zoom/screens/${width}-${p}.png`});}
   assert.ok(Math.abs(samples[0].scale-1)<.001);assert.ok(samples[1].scale>samples[0].scale&&samples[2].scale>samples[1].scale);
   for(let i=3;i<=7;i++)assert.ok(Math.abs(samples[i].scale-1.06)<.001,'Middle zoom should remain fixed');
   assert.ok(samples[8].scale<samples[7].scale&&samples[9].scale<samples[8].scale);assert.ok(Math.abs(samples[10].scale-1)<.001);
   for(let i=4;i<=7;i++)assert.ok(samples[i].x>samples[i-1].x,'Down scroll must physically move cards RIGHT');
   assert.ok(samples.every(s=>Math.abs(s.pin-samples[0].pin)<2),'Pin shifted');
   for(let i=points.length-1;i>=0;i--){const s=await sample(page,g,points[i]);assert.ok(Math.abs(s.scale-samples[i].scale)<.001);assert.ok(Math.abs(s.x-samples[i].x)<2,'Upward scroll must retrace motion');}
   for(let i=0;i<4;i++){
    await sample(page,g,.06+i/3*.82);
    assert.equal(await page.locator('.journey-progress [aria-current]').getAttribute('aria-label'),`Show product ${i+1}`);
    const box=await page.locator('.product-card').nth(i).boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width&&box.y>96&&box.y+box.height<height,'Active card clips');
    assert.ok(Math.abs(box.x+box.width/2-width/2)<3,'Product focus position');
    await page.locator('.product-caption').nth(i).click({trial:true});
   }
   await sample(page,g,.5);const art=page.locator('.product-art').nth(2);const before=await art.evaluate(e=>getComputedStyle(e).transform);await page.locator('.product-card').nth(2).hover();await page.waitForTimeout(500);assert.notEqual(await art.evaluate(e=>getComputedStyle(e).transform),before);
   await sample(page,g,1.3);assert.ok((await page.locator('.featured-pin').boundingBox()).y<samples[0].pin-100,'Pin does not release');
   await page.locator('#reasons').scrollIntoViewIfNeeded();await page.waitForTimeout(800);await page.screenshot({path:`qa/carousel-zoom/screens/${width}-exit.png`});
  }else{
   assert.notEqual(await page.locator('.featured-pin').evaluate(e=>getComputedStyle(e).position),'sticky');
   await page.getByRole('button',{name:'Show product 4',exact:true}).click();await page.waitForTimeout(700);
   assert.ok(await page.locator('.featured-track').evaluate(e=>e.scrollLeft)>100);assert.equal(await page.locator('.featured-composition').evaluate(e=>getComputedStyle(e).transform),'none');
  }
  await page.emulateMedia({reducedMotion:'reduce'});await pause(page);
  assert.equal(await page.locator('.featured-composition').evaluate(e=>getComputedStyle(e).transform),'none');
  assert.notEqual(await page.locator('.featured-pin').evaluate(e=>getComputedStyle(e).position),'sticky');
  await page.emulateMedia({reducedMotion:'no-preference'});
  if(width<=760)await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  assert.deepEqual(await page.locator('#navigation > a, #navigation > .products-nav > button').allTextContents(),['Home','Our Products ','Services','Branches','Contact ']);
  await page.getByRole('button',{name:'Our Products',exact:true}).click();assert.equal(await page.locator('#products-menu a').count(),2);
  await page.keyboard.press('Escape');
  if(width<=760)await page.getByRole('button',{name:'Open navigation',exact:true}).click();
  const branchLink=page.locator('#navigation > a[href="/branches"]');await branchLink.click();await page.waitForURL(base+'/branches');await page.waitForTimeout(1000);
  assert.equal(await page.locator('#navigation a[href="/branches"]').getAttribute('aria-current'),'page');assert.ok((await page.locator('#navigation a[href="/branches"]').getAttribute('class')).includes('active'));
  if(width<=760){await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.locator('#navigation a[href="/contact"]').scrollIntoViewIfNeeded();const box=await page.locator('#navigation a[href="/contact"]').boundingBox();assert.ok(box.y>=0&&box.y+box.height<=height);await page.screenshot({path:`qa/carousel-zoom/screens/menu-${width}.png`});await page.keyboard.press('Escape');}
  else await page.screenshot({path:`qa/carousel-zoom/screens/header-${width}.png`});
  assert.deepEqual(await page.locator('.footer-navigation a').allTextContents(),['Home','Loans','Deposits','Services','Branches','Contact']);
  await page.locator('.footer-navigation a[href="/branches"]').click();await page.waitForURL(base+'/branches');
  await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`qa/carousel-zoom/screens/footer-${width}.png`});
  assert.ok(Math.abs(await page.locator('.header').evaluate(e=>e.getBoundingClientRect().top))<1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
  for(const route of ['/products/loans','/products/deposits','/services','/contact']){await page.goto(base+route,{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow`);}
  results.push({width,height,carousel:width>1100?'direction, reverse, single zoom, bounds, hover and release passed':'native rail preserved',navigation:'passed',reducedMotion:'passed'});console.log(`Passed ${width}×${height}`);await page.close();
 }
 const baseline=JSON.parse(await readFile('qa/carousel-zoom/before-hashes.json','utf8'));
 for(const [file,hash] of Object.entries(baseline)){if(['main.jsx','site-contact.jsx','featured-journey.jsx','targeted-experiences.css'].includes(file))continue;assert.equal(createHash('sha256').update(await readFile('src/'+file)).digest('hex'),hash,`${file} unexpectedly changed`);}
 assert.deepEqual(errors,[]);await writeFile('qa/carousel-zoom/results.json',JSON.stringify({results,errors,unrelatedSources:'unchanged'},null,2));
}finally{await browser.close();}
