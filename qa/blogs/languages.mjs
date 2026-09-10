import {chromium} from 'playwright';import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('qa/blogs/final',{recursive:true});const browser=await chromium.launch({channel:'chrome'});const results=[],errors=[],missing=new Set();
for(const width of [1440,768,390]){
 const page=await browser.newPage({viewport:{width,height:width===768?1024:width===390?844:900}});page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const lang of ['hi','mr']){
  await page.goto('http://127.0.0.1:5173/blogs',{waitUntil:'networkidle'});if(width===390)await page.locator('.menu-toggle').click();await page.locator('.language-control select').selectOption(lang);if(width===390)await page.locator('.menu-toggle').click();await page.waitForTimeout(400);await page.screenshot({path:`qa/blogs/final/${width}-${lang}-listing.png`});
  results.push(await page.evaluate(({width,lang})=>{const header=document.querySelector('.header'),logo=header.querySelector('.logo').getBoundingClientRect(),nav=header.querySelector('.navigation').getBoundingClientRect(),langBox=header.querySelector('select').getBoundingClientRect();return {width,lang,overflow:document.documentElement.scrollWidth>innerWidth,headerOverlap:width>760&&nav.left<logo.right+8,languageRight:langBox.right,translatedLabel:header.querySelector('a[href="/blogs"]').textContent,authoredTitle:document.querySelector('#journal-feature-title').textContent};},{width,lang}));
  await page.goto('http://127.0.0.1:5173/login',{waitUntil:'networkidle'});await page.locator('#admin-username').fill('krish');await page.locator('#admin-password').fill('1153');await page.locator('.blog-login-form button[type=submit]').click();await page.locator('.blog-dashboard-heading>button').click();await page.waitForTimeout(500);await page.screenshot({path:`qa/blogs/final/${width}-${lang}-editor.png`});
  results.push({width,lang,route:'editor',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});(await page.evaluate(()=>[...(window.__sakhiMissingTranslations||[])])).forEach(v=>missing.add(v));
  await page.locator('.blog-admin-logout').click();
 }
 await page.close();
}
await writeFile('qa/blogs/final/languages.json',JSON.stringify({results,errors,missing:[...missing]},null,2));console.log(JSON.stringify({errors,issues:results.filter(r=>r.overflow||r.headerOverlap),missing:[...missing]}));await browser.close();
