import {chromium} from 'playwright';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome'});
const out='qa/featured-atlas/final';await mkdir(out,{recursive:true});
const sizes=[[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844]];
const links=['/products/deposits#daily-deposit','/products/loans#loan-against-deposits','/products/loans#daily-loan','/products/loans#jlg-loan'];
const titles=['Daily Deposit','Loan Against Deposits','Daily 100 days Loan / 200 days Loan','JLG Loan'];
const descriptions=['Small steps today. A stronger tomorrow. Make saving a part of every day.','Keep your savings growing while you take your next step.','Support for your business, with the convenience of daily collections.','Women supporting women. Move forward with the strength of a group.'];
const errors=[],failures=[],screens=[],interactions=[],languages=[];
function check(test,label){if(!test)failures.push(label);}
async function pageFor(width,height,extra={}){
 const page=await browser.newPage({viewport:{width,height},...extra});
 page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 return page;
}
async function move(page,p){await page.evaluate(p=>{const s=document.querySelector('#featured'),pin=s.firstElementChild,l=innerHeight*.22;scrollTo({top:scrollY+s.getBoundingClientRect().top-parseFloat(getComputedStyle(pin).top)-l+p*(s.offsetHeight-pin.offsetHeight+l),behavior:'instant'});},p);await page.waitForTimeout(500);}
async function select(page,index){
 if(await page.locator('#featured').getAttribute('data-mode')==='cinematic')await page.locator('.atlas-navigation button').nth(index).click();
 else await page.evaluate(index=>{const s=document.querySelectorAll('.atlas-scene')[index];scrollTo({top:scrollY+s.getBoundingClientRect().top-document.querySelector('.header').getBoundingClientRect().bottom-18,behavior:'instant'});},index);
 await page.waitForTimeout(500);
}
async function geometry(page,index){return page.evaluate(index=>{
 const s=document.querySelectorAll('.atlas-scene')[index],pin=document.querySelector('.atlas-pin'),stage=document.querySelector('.atlas-stage'),heading=document.querySelector('.atlas-heading'),nav=document.querySelector('.atlas-navigation');
 const rect=n=>n.getBoundingClientRect().toJSON();
 const svg=s.querySelector('.atlas-sculpture');
 const pieces=[...svg.querySelectorAll('path,ellipse,circle,rect,text')].filter(n=>!n.closest('defs')).map(rect);
 return {mode:document.querySelector('#featured').dataset.mode,overflow:document.documentElement.scrollWidth>innerWidth,copy:rect(s.querySelector('.atlas-copy')),art:{left:Math.min(...pieces.map(n=>n.left)),right:Math.max(...pieces.map(n=>n.right)),top:Math.min(...pieces.map(n=>n.top)),bottom:Math.max(...pieces.map(n=>n.bottom))},pin:rect(pin),stage:rect(stage),heading:rect(heading),nav:rect(nav),blocked:!!s.querySelector('a').closest('[inert]'),visible:getComputedStyle(s.querySelector('.atlas-copy')).visibility};
 },index);}
try{
 for(const [width,height] of sizes){
  const page=await pageFor(width,height,width===390?{isMobile:true,hasTouch:true}:{});
  check(JSON.stringify(await page.locator('.atlas-copy h3').allTextContents())===JSON.stringify(titles),`${width} names`);
  check(JSON.stringify(await page.locator('.atlas-copy p').allTextContents())===JSON.stringify(descriptions),`${width} descriptions`);
  check(JSON.stringify(await page.locator('.atlas-details').evaluateAll(ns=>ns.map(n=>n.getAttribute('href'))))===JSON.stringify(links),`${width} destinations`);
  for(let index=0;index<4;index++){
   await select(page,index);const g=await geometry(page,index);screens.push({width,height,index,...g});
   check(!g.overflow,`${width}/${index} overflow`);check(!g.blocked&&g.visible==='visible',`${width}/${index} usable`);
   check(g.copy.left>=-1&&g.copy.right<=width+1,`${width}/${index} copy fits horizontally`);
   if(g.mode==='cinematic'){
    check(g.copy.top>=g.heading.bottom-1&&g.copy.bottom<=g.nav.top,`${width}/${index} copy fits stage`);
    check(g.art.left>=g.copy.right-16&&g.art.right<=width+1&&g.art.bottom<g.nav.top+1,`${width}/${index} artwork containment`);
    check(g.pin.bottom<=height+1,`${width}/${index} controls fit viewport`);
   }
   await page.screenshot({path:`${out}/${width}-${index}.png`});
  }
  if(width>1100){
   await move(page,.41);const a=await page.locator('.atlas-art').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).transform));
   await move(page,.73);await move(page,.41);const b=await page.locator('.atlas-art').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).transform));
   check(JSON.stringify(a)===JSON.stringify(b),`${width} reverse deterministic`);
   await move(page,1);const g=await geometry(page,3);check(!g.blocked&&g.visible==='visible',`${width} final stays usable`);
   const heightBefore=await page.locator('#featured').evaluate(n=>n.offsetHeight);
   await move(page,.11);check(heightBefore===await page.locator('#featured').evaluate(n=>n.offsetHeight),`${width} no layout jump`);
  }
  await page.close();
 }
 // Follow the real links through the existing destination dialogs, desktop and touch.
 for(const width of [1440,390]){
  const page=await pageFor(width,width===390?844:900,width===390?{isMobile:true,hasTouch:true}:{});
  for(let index=0;index<4;index++){
   if(index)await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
   await select(page,index);await page.locator('.atlas-details').nth(index).click();
   await page.locator('dialog[open] #product-dialog-title').waitFor();
   const actual=await page.locator('#product-dialog-title').textContent();
   check(page.url().endsWith(links[index]),`${width}/${index} destination URL`);
   const expected=index===2?'Daily Loan':titles[index];
   check(actual.includes(expected)||index===2&&actual.includes('100'),`${width}/${index} correct dialog: ${actual}`);
   interactions.push({width,index,url:page.url(),dialog:actual});
   await page.keyboard.press('Escape');await page.locator('dialog[open]').waitFor({state:'detached'});
  }
  await page.close();
 }
 // Keyboard shortcuts and reachable active product CTA.
 const keyboard=await pageFor(1440,900);
 await select(keyboard,0);await keyboard.locator('.atlas-navigation button').nth(3).focus();await keyboard.keyboard.press('Enter');await keyboard.waitForTimeout(500);
 check(await keyboard.locator('.atlas-navigation button').nth(3).getAttribute('aria-current')==='step','keyboard selects chapter four');
 for(let n=0;n<4;n++)await keyboard.keyboard.press('Shift+Tab');
 check(await keyboard.evaluate(()=>document.activeElement.matches('.atlas-details')&&document.activeElement.getAttribute('href').endsWith('#jlg-loan')),'keyboard reaches current View details');
 await keyboard.close();
 // All translations fit, including the longest chapter, with language changes mid-sequence.
 for(const width of [1440,390]){
  const page=await pageFor(width,width===390?844:900);
  for(const lang of ['hi','mr']){
   await page.evaluate(lang=>{localStorage.setItem('sakhi.language',lang);},lang);await page.reload({waitUntil:'networkidle'});
   for(let index=0;index<4;index++){
    await select(page,index);const g=await geometry(page,index);const title=await page.locator('.atlas-copy h3').nth(index).textContent();
    check(title!==titles[index]&&!g.overflow,`${width}/${lang}/${index} translated and fits`);
    if(g.mode==='cinematic')check(g.copy.top>=g.heading.bottom-1&&g.copy.bottom<g.nav.top,`${width}/${lang}/${index} vertical fit`);
    languages.push({width,lang,index,title});
    if(index===2)await page.screenshot({path:`${out}/${width}-${lang}.png`});
   }
  }
  await page.close();
 }
 // Static, fully accessible reduced-motion fallback at desktop and mobile.
 const reduced=[];
 for(const width of [1440,390]){
  const page=await pageFor(width,width===390?844:900,{reducedMotion:'reduce'});
  for(let index=0;index<4;index++){
   await select(page,index);const g=await geometry(page,index);check(g.mode==='reduced'&&!g.blocked&&!g.overflow,`${width}/${index} reduced fallback`);
   check(await page.locator('.atlas-sculpture').nth(index).evaluate(n=>getComputedStyle(n).transform)==='none',`${width}/${index} reduced no 3D`);
  }
  reduced.push({width,allFourUsable:true});await page.screenshot({path:`${out}/${width}-reduced.png`});
  if(width===1440){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);const shot=await page.locator('.hero').screenshot({path:`${out}/hero-after.png`,animations:'disabled'});check(shot.equals(await readFile('qa/featured-atlas/hero-before.png')),'hero pixel-identical');}
  await page.close();
 }
 // Source scope: main's other components and all other pre-existing files are byte-identical.
 const before=JSON.parse(await readFile('qa/featured-atlas/before-hashes.json','utf8'));
 const changed=[];for(const [file,hash] of Object.entries(before)){if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash)changed.push(file);}
 check(changed.every(file=>['src/main.jsx','src/featured-journey.jsx'].includes(file)),'source scope');
 const original=(await readFile('qa/featured-atlas/main-before.jsx','utf8')).replace(/\r\n/g,'\n');
 const current=(await readFile('src/main.jsx','utf8')).replace(/\r\n/g,'\n');
 const scrub=s=>s.replace('faqs, metrics, products, reasons','faqs, metrics, reasons').replace(/function (?:ProductArt|Featured)\([\s\S]*?(?=function Reasons\()/,'');
 check(scrub(original)===scrub(current),'main other components untouched');
 check(errors.length===0,'no console errors');
 await writeFile(`${out}/results.json`,JSON.stringify({screens,interactions,languages,reduced,changed,errors,failures},null,2));
 console.log(JSON.stringify({screens:screens.length,interactions:interactions.length,translations:languages.length,changed,errors,failures}));
 assert.deepEqual(failures,[]);
}finally{await browser.close();}
