import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
await mkdir('qa/featured-atlas/pass2',{recursive:true});
const results=[],errors=[];
for(const [width,height] of [[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 for(let index=0;index<4;index++){
  if(width>1100)await page.locator('.atlas-navigation button').nth(index).click();
  else await page.evaluate(index=>{const s=document.querySelectorAll('.atlas-scene')[index];scrollTo({top:scrollY+s.getBoundingClientRect().top-document.querySelector('.header').getBoundingClientRect().bottom-18,behavior:'instant'});},index);
  await page.waitForTimeout(450);
  await page.screenshot({path:`qa/featured-atlas/pass2/${width}-${index}.png`});
  results.push(await page.evaluate(({width,index})=>{const s=document.querySelectorAll('.atlas-scene')[index],pin=document.querySelector('.atlas-pin'),h=document.querySelector('.atlas-heading');return {width,index,mode:document.querySelector('#featured').dataset.mode,overflow:document.documentElement.scrollWidth>innerWidth,title:s.querySelector('h3').textContent,copy:s.querySelector('.atlas-copy').getBoundingClientRect().toJSON(),art:s.querySelector('.atlas-sculpture').getBoundingClientRect().toJSON(),stage:document.querySelector('.atlas-stage').getBoundingClientRect().toJSON(),pin:pin.getBoundingClientRect().toJSON(),heading:h.getBoundingClientRect().toJSON()};},{width,index}));
 }
 if(width===1440){
  for(const p of [.23,.47,.71,.99]){
   await page.evaluate(p=>{const s=document.querySelector('#featured'),pin=s.firstElementChild,l=innerHeight*.22;scrollTo({top:scrollY+s.getBoundingClientRect().top-parseFloat(getComputedStyle(pin).top)-l+p*(s.offsetHeight-pin.offsetHeight+l),behavior:'instant'});},p);
   await page.waitForTimeout(450);await page.screenshot({path:`qa/featured-atlas/pass2/transition-${p}.png`});
  }
 }
 await page.close();
}
await writeFile('qa/featured-atlas/pass2/results.json',JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({errors,issues:results.filter(r=>r.overflow||(r.mode==='cinematic'&&(r.copy.top<r.heading.bottom-1||r.copy.bottom>r.stage.bottom+1||r.art.bottom>r.stage.bottom+20))).map(r=>({width:r.width,index:r.index,copy:[r.copy.top,r.copy.bottom],stage:[r.stage.top,r.stage.bottom],art:[r.art.top,r.art.bottom]}))}));
await browser.close();
