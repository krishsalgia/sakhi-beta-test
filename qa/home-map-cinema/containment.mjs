import {chromium} from 'playwright';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';const browser=await chromium.launch({channel:'chrome'}),results=[];
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[1024,1366],[768,1024],[430,932],[390,844],[320,740]]){
 const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
 const metrics=await page.locator('.home-branch-assembly').evaluate(h=>({top:h.getBoundingClientRect().top+scrollY,pin:parseFloat(h.style.getPropertyValue('--cinema-pin-top')),run:parseFloat(getComputedStyle(h,'::after').height),lead:innerHeight*.2}));
 const clipped=[];let maximum=0,minimum=1e9;
 for(let i=0;i<=50;i++){
  const progress=i/50;await page.evaluate(({top,pin,run,lead,progress})=>scrollTo({top:top-pin-lead+(run+lead)*progress,behavior:'instant'}),{...metrics,progress});await page.waitForTimeout(20);
  const sample=await page.locator('.home-branch-assembly').evaluate(h=>{const f=h.querySelector('.cinema-field').getBoundingClientRect();return {height:h.offsetHeight,clipped:[...h.querySelectorAll('.india-map use')].filter(n=>{const s=getComputedStyle(n),b=n.getBoundingClientRect();return +s.opacity>.08&&(b.left<f.left-1||b.right>f.right+1||b.top<f.top-1||b.bottom>f.bottom+1);}).map(n=>n.getAttribute('href').split('#')[1])};});
  minimum=Math.min(minimum,sample.height);maximum=Math.max(maximum,sample.height);if(progress<.84&&sample.clipped.length)clipped.push({progress,states:sample.clipped});
 }
 results.push({width,height,clipped,heightChange:maximum-minimum});console.log(results.at(-1));await page.close();
}
await writeFile('qa/home-map-cinema/containment-results.json',JSON.stringify(results,null,2));await browser.close();assert.ok(results.every(r=>r.clipped.length===0&&r.heightChange===0));
