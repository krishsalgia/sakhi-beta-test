import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
await mkdir('qa/screenshots/phase3', { recursive: true });
const browser = await chromium.launch({channel:'chrome'});
for (const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',375,812],['small-mobile',320,740]]) {
 const page = await browser.newPage({ viewport:{width,height} });
 page.on('pageerror',e=>console.log('ERROR',e.message));
 for(const route of ['services','contact']) {
  await page.goto(`http://127.0.0.1:5173/${route}`,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  for(const el of await page.locator('.product-reveal').all()) {
   await el.scrollIntoViewIfNeeded();
   await page.waitForFunction(el=>el.dataset.reveal==='visible' && getComputedStyle(el).opacity==='1',await el.elementHandle());
  }
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`qa/screenshots/phase3/${name}-${route}-hero.png`});
  await page.screenshot({path:`qa/screenshots/phase3/${name}-${route}-full.png`,fullPage:true});
  console.log(name,route,await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})));
 }
 await page.close();
}
await browser.close();
