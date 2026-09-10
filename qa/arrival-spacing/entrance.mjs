import {chromium} from 'playwright';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),results=[];
await mkdir('qa/arrival-spacing/motion',{recursive:true});
const before=JSON.parse(await readFile('qa/arrival-spacing/before/hero-geometry.json','utf8'));
try{for(const [width,height]of[[1440,900],[2560,1440],[3840,2160],[1024,1000],[768,1024],[390,844],[320,740]]){
 const p=await b.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__cls+=e.value;})).observe({type:'layout-shift',buffered:true});const observer=new MutationObserver(()=>{const card=document.querySelector('.savings-entry');if(card&&!window.__firstHero){window.__firstHero={opacity:getComputedStyle(card).opacity,animation:getComputedStyle(card).animationName,transform:getComputedStyle(card).transform};observer.disconnect();}});observer.observe(document,{childList:true,subtree:true});});
 await p.goto('http://127.0.0.1:5173');await p.locator('.savings-entry').waitFor({state:'attached'});
 const first=await p.evaluate(()=>window.__firstHero);assert.ok(Number(first.opacity)<.1,'Card starts in entrance state, no settled flash');
 const samples=[];
 for(const time of [0,180,400,700,1100,1700,2200]){
  await p.evaluate(time=>document.querySelector('.hero').getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=a.effect.getTiming().iterations===Infinity?0:time;}),time);
  await p.screenshot({path:`qa/arrival-spacing/motion/${width}-${time}.png`});
  samples.push(await p.evaluate(()=>({height:document.querySelector('.hero').offsetHeight,overflow:document.documentElement.scrollWidth>innerWidth,back:getComputedStyle(document.querySelector('.future-entry')).transform,front:getComputedStyle(document.querySelector('.savings-entry')).transform})));
 }
 assert.ok(samples.every(s=>s.height===samples[0].height&&!s.overflow));assert.equal(samples.at(-1).back,'matrix(1, 0, 0, 1, 0, 0)');
 const settled=await p.evaluate(()=>Object.fromEntries(['.hero','.hero-copy','.hero-art','.hero h1','.future-panel','.savings-panel'].map(s=>{const e=document.querySelector(s);return[s,{width:e.offsetWidth,height:e.offsetHeight,left:e.offsetLeft,top:e.offsetTop}]})));
 for(const [selector,box]of Object.entries(settled)){const old=before.find(r=>r.width===width).boxes[selector];for(const key of ['width','height','left','top'])assert.equal(box[key],old[key],`${width} ${selector} ${key} approved layout preserved`);}
 await p.reload();await p.waitForTimeout(2250);await p.evaluate(()=>scrollTo({top:1200,behavior:'instant'}));await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));assert.ok(await p.locator('.savings-entry').evaluate(e=>Number(getComputedStyle(e).opacity)===1));
 const cls=await p.evaluate(()=>window.__cls);assert.equal(cls,0);
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.future-entry').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await p.locator('.hero').evaluate(e=>getComputedStyle(e,'::after').display),'none');
 await p.locator('.hero-copy>.button').click();assert.ok(p.url().endsWith('#featured'));assert.deepEqual(errors,[]);
 results.push({width,height,first,settled,samples,cls,staticLayoutUnchanged:true,scrollDoesNotReplay:true,reducedMotion:true,cta:true});await p.close();console.log(`Entrance ${width} passed`);
}}finally{await writeFile('qa/arrival-spacing/entrance-results.json',JSON.stringify(results,null,2));await b.close();}
