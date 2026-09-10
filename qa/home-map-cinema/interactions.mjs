import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {branches} from '../../src/branch-data.js';
const browser=await chromium.launch({channel:'chrome'}),errors=[],results=[];
const base='http://127.0.0.1:5173';
const monitor=(page,label)=>{page.on('pageerror',e=>errors.push(`${label}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${label}: ${m.text()}`);});};
async function progress(page,p){await page.locator('.home-branch-assembly').evaluate((h,p)=>{const pin=parseFloat(h.style.getPropertyValue('--cinema-pin-top')),run=parseFloat(getComputedStyle(h,'::after').height),lead=innerHeight*.2,top=h.getBoundingClientRect().top+scrollY;scrollTo({top:top-pin-lead+(run+lead)*p,behavior:'instant'});},p);await page.waitForTimeout(120);}
async function level(page,name){await page.locator(`.branch-network[data-map-level="${name}"]`).waitFor();await page.waitForTimeout(750);}
async function mapStyle(page){return page.locator('.india-map').evaluate(svg=>{const rect=n=>{const b=n.getBoundingClientRect();return [b.x,b.y,b.width,b.height];};return {box:rect(svg),nodes:[...svg.querySelectorAll('use')].map(n=>{const s=getComputedStyle(n);return {box:rect(n),fill:s.fill,stroke:s.stroke,opacity:s.opacity,transform:s.transform};})};});}
async function drill(page,touch=false){
 const press=async node=>touch?node.tap():node.click();
 await press(page.locator('.territory-tabs button').first());await level(page,'state');assert.equal(await page.locator('.city-marker').count(),6);
 await press(page.locator('.area-choice').first());await level(page,'city');await page.locator('.leaflet-tile-loaded').first().waitFor();
 assert.equal(await page.locator('.branch-card').count(),6);assert.equal(await page.locator('.selected-branch').count(),0);
 await press(page.locator('.branch-card[data-branch="andheri"]'));await page.locator('.selected-branch').waitFor();
 assert.equal(await page.locator('.selected-branch>p').textContent(),branches.find(b=>b.id==='andheri').address);
 await press(page.locator('.network-back'));await level(page,'state');await press(page.locator('.network-back'));await level(page,'india');
 await press(page.locator('.territory-tabs button').last());await level(page,'state');assert.equal(await page.locator('.city-marker,.branch-card').count(),0);
 await press(page.locator('.network-breadcrumbs button').first());await level(page,'india');
}
try{
 for(const route of ['/','/branches'])for(const [width,height] of [[1440,900],[768,1024],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width===390,isMobile:width===390});monitor(page,route+width);await page.goto(base+route,{waitUntil:'networkidle'});
  if(route==='/'){
   await progress(page,1.01);assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'ready');
   const before=await mapStyle(page);await page.locator('.network-navigation').evaluate(n=>n.focus({preventScroll:true}));const after=await mapStyle(page);assert.deepEqual(after,before,'Handoff must keep map geometry/colors identical');
  }else{assert.equal(await page.locator('.cinema-pin').count(),0);assert.ok(await page.locator('.india-map use').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1')));}
  await drill(page,width===390);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(route==='/'){await progress(page,0);assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');}
  results.push({route,width,drilldown:'passed',tiles:'loaded',exactAddress:'passed',breadcrumbs:'passed',karnataka:'pending',touch:width===390,handoff:route==='/'?'identical geometry/colors':'original map'});console.log('Drilldown',route,width);await page.close();
 }
 for(const lang of ['en','hi','mr'])for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});monitor(page,lang+width);await page.addInitScript(lang=>localStorage.setItem('sakhi.language',lang),lang);await page.goto(base,{waitUntil:'networkidle'});
  await progress(page,.4);assert.ok(await page.locator('.india-map use').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).transform==='none')));assert.equal(await page.locator('.india-map').evaluate(n=>getComputedStyle(n).transform),'none');
  await page.screenshot({path:`qa/home-map-cinema/reduced-${lang}-${width}.png`});
  await page.locator('.cinema-scene-top button').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');
  await drill(page);assert.equal(await page.locator('html').getAttribute('lang'),lang);results.push({lang,width,reducedMotion:'no 3D',keyboardSkip:'passed',hierarchy:'passed'});console.log('Reduced/language',lang,width);await page.close();
 }
 const page=await browser.newPage({viewport:{width:1440,height:900}});monitor(page,'lifecycle');await page.goto(base,{waitUntil:'networkidle'});await progress(page,.4);
 for(const lang of ['hi','mr','en']){await page.locator('.language-control select').selectOption(lang);await page.waitForTimeout(100);assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'assembling');assert.equal(await page.locator('.india-map use').count(),36);}
 for(const [width,height] of [[390,844],[844,390],[768,1024],[1440,900]]){await page.setViewportSize({width,height});await page.waitForTimeout(120);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await progress(page,.4);await page.locator('.cinema-scene-top button').click();assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(120);assert.equal(await page.locator('.home-branch-assembly').getAttribute('data-assembly'),'exploring');
 results.push({languageSwitchDuringAssembly:'passed',resize:'passed',skip:'passed'});await page.close();
 assert.deepEqual(errors,[]);
}finally{await writeFile('qa/home-map-cinema/interaction-results.json',JSON.stringify({results,errors},null,2));await browser.close();}
