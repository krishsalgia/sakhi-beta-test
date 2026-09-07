import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
await mkdir('qa/screenshots/phase4',{recursive:true});
const results=[];
for(const [name,width,height] of [['desktop',1440,1000],['tablet',820,1180],['mobile',390,844],['landscape',667,375]]) {
 const page=await browser.newPage({viewport:{width,height}});
 for(const [route,key] of [['/','home'],['/products/loans','loans'],['/products/deposits','deposits'],['/services','services'],['/contact','contact']]) {
  await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const measurements=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth, h1:document.querySelector('h1').getBoundingClientRect().toJSON()}));
  await page.screenshot({path:`qa/screenshots/phase4/before-${name}-${key}.png`});
  if(width<=760) {
   await page.getByRole('button',{name:'Open navigation'}).click();
   await page.getByRole('button',{name:'Our Products',exact:true}).click();
   measurements.menu=await page.locator('#navigation').evaluate(el=>({bottom:el.getBoundingClientRect().bottom,height:innerHeight,scroll:el.scrollHeight,client:el.clientHeight}));
  }
  results.push({name,route,...measurements});
 }
 await page.close();
}
await writeFile('qa/phase4-initial-audit.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results.filter(r=>r.overflow||r.menu?.bottom>r.menu?.height),null,2));
const videoPage=await browser.newPage();await videoPage.goto('http://127.0.0.1:5173/qa/references/Sakhi1.mp4');
await videoPage.waitForFunction(()=>document.querySelector('video')?.readyState>=2);
const video=await videoPage.evaluate(async()=>{const v=document.querySelector('video');v.muted=true;v.currentTime=0;await v.play();await new Promise(resolve=>setTimeout(resolve,4500));v.pause();return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,playedUntil:v.currentTime};});
console.log(JSON.stringify({referenceVideo:video}));
await browser.close();
