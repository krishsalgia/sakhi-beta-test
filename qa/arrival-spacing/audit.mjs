import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),results=[],errors=[];
const recheck=process.argv.includes('--recheck');
const sizes=[[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[1024,1000],[768,1024],[430,932],[390,844],[375,812],[320,740]];
await mkdir('qa/arrival-spacing/after',{recursive:true});
try {for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const lang of ['en','hi','mr']){
  await page.addInitScript(lang=>localStorage.setItem('sakhi.language',lang),lang);
  for(const route of ['/','/products/loans','/products/deposits','/services','/branches','/contact']){
   if(recheck&&route==='/services')continue;
   await page.goto('http://127.0.0.1:5173'+route);await page.evaluate(()=>document.fonts.ready);
   for(const section of await page.locator('main>section,main>div>section,main>div>div>article').all()){await section.scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(requestAnimationFrame));}
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(80);
   const report=await page.evaluate(()=>{
    const targets='h1,h2,h3,p,button,label,small,dt,dd,.calculator-workspace,.calculator-visual,.calc-results,.message-form,.service-directory,.deposit-filters,.loan-row,.catalog-card,.readiness-panel,.network-workspace,.network-panel,.site-footer';
    // Reviewed intentional exceptions: screen-reader text, extended hover wash,
    // and the clipped decorative circles in two deposit cards. Their text is checked separately.
    const overflow=[...document.querySelectorAll(targets)].filter(e=>e.clientWidth>0&&e.checkVisibility({checkVisibilityCSS:true})&&!e.closest('[inert],[aria-hidden=true]')&&!e.matches('.network-announcement,.loan-row,.deposit-plan-featured,.deposit-plan-retirement')&&e.scrollWidth>e.clientWidth+3).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,90),width:e.clientWidth,scroll:e.scrollWidth}));
    const header=document.querySelector('.navigation').getBoundingClientRect(),logo=document.querySelector('.logo').getBoundingClientRect();
    return {pageOverflow:document.documentElement.scrollWidth>innerWidth,headerOverlap:innerWidth>760&&header.left<logo.right+12,overflow};
   });
   results.push({width,height,lang,route,...report});
   const name=route.split('/').pop()||'home';
   if(!recheck||[768,320].includes(width))await page.screenshot({path:`qa/arrival-spacing/after/${width}-${lang}-${name}.png`,fullPage:true});
   if(route.includes('products')){await page.locator('.calculator-workspace').scrollIntoViewIfNeeded();await page.locator('.calculator-workspace').screenshot({path:`qa/arrival-spacing/after/${width}-${lang}-${name}-calculator.png`});}
  }
 }
 await page.close();console.log(`Audited ${width} x ${height}`);
}}finally{await writeFile(`qa/arrival-spacing/${recheck?'recheck':'audit'}-results.json`,JSON.stringify({results,errors},null,2));console.log(JSON.stringify({checks:results.length,issues:results.filter(r=>r.pageOverflow||r.headerOverlap||r.overflow.length),errors},null,2));await browser.close();}
