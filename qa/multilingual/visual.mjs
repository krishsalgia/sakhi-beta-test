import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
const results=[],issues=[],errors=[];
await mkdir('qa/multilingual/screenshots',{recursive:true});
const sizes=[[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844]];
try {
for(const [width,height] of sizes){
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const lang of ['en','hi','mr']){
  await page.addInitScript(lang=>localStorage.setItem('sakhi.language',lang),lang);
  for(const route of ['/','/products/loans','/products/deposits','/services','/branches','/contact']){
   const name=route.split('/').pop()||'home';
   await page.goto('http://127.0.0.1:5173'+route); await page.waitForTimeout(1200);
   const report=await page.evaluate(()=>{
    const nav=document.querySelector('.navigation'), logo=document.querySelector('.logo');
    const navBox=nav.getBoundingClientRect(),logoBox=logo.getBoundingClientRect();
    const overflow=[...document.querySelectorAll('button,.button')].filter(e=>{if(!e.checkVisibility({checkVisibilityCSS:true})||e.closest('[inert]')||!e.textContent.trim())return false;return e.scrollWidth>e.clientWidth+3||e.scrollHeight>e.clientHeight+3;}).map(e=>({text:e.textContent.trim(),class:e.className,width:[e.clientWidth,e.scrollWidth],height:[e.clientHeight,e.scrollHeight]}));
    return {lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,headerOverlap:innerWidth>760&&navBox.left<logoBox.right+15,buttonOverflow:overflow,missing:[...(window.__sakhiMissingTranslations||[])]};
   });
   const result={width,height,lang,route,...report};results.push(result);
   if(report.overflow||report.headerOverlap||report.buttonOverflow.length||report.missing.length)issues.push(result);
   await page.screenshot({path:`qa/multilingual/screenshots/${width}-${lang}-${name}.png`});
   if([1440,768,390].includes(width)&&lang!=='en'){
    await page.emulateMedia({reducedMotion:'reduce'});
    for(const el of await page.locator('.product-reveal,.reveal-ready,.connection-page section').all()){await el.scrollIntoViewIfNeeded();}
    await page.waitForTimeout(150);await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:`qa/multilingual/screenshots/${width}-${lang}-${name}-full.png`,fullPage:true});
    await page.emulateMedia({reducedMotion:'no-preference'});
   }
   if(width<=760){await page.locator('.menu-toggle').click();assert.ok(await page.locator('.language-control select').isVisible());await page.locator('.menu-toggle').click();}
  }
 }
 await page.close();console.log(`Completed ${width} x ${height}`);
}
}finally{await writeFile('qa/multilingual/visual-results.json',JSON.stringify({results,issues,errors},null,2));console.log(JSON.stringify({checks:results.length,issues,errors},null,2));await browser.close();}
