import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const browser=await chromium.launch({channel:'chrome'}),checks=[],errors=[],branchPixels=[];
const pass=(ok,label)=>{assert.ok(ok,label);checks.push(label);};
const track=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});};
const bounds=async(page,label)=>pass(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label);
try{
  // The old full-section screenshots include the sticky header. Compare the
  // branch workspace itself, excluding the explicitly approved Blogs nav edit.
  const decoder=await browser.newPage();
  const before=JSON.parse(await readFile('qa/home-map-cinema/branches-before/results.json','utf8'));
  const after=JSON.parse(await readFile('qa/home-map-cinema/branches-after/results.json','utf8'));
  for(const entry of after.results){
    const old=before.results.find(r=>r.width===entry.width);
    pass(JSON.stringify(entry.geometry)===JSON.stringify(old.geometry),`${entry.width}: existing branch geometry unchanged`);
    const images=await Promise.all(['before','after'].map(async phase=>'data:image/png;base64,'+(await readFile(`qa/home-map-cinema/branches-${phase}/${entry.width}.png`)).toString('base64')));
    const difference=await decoder.evaluate(async({images,start})=>{
      const data=await Promise.all(images.map(async src=>{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return{pixels:ctx.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width};}));
      let max=0,changed=0;for(let n=Math.ceil(start)*data[0].width*4;n<data[0].pixels.length;n+=4){const d=Math.max(...[0,1,2,3].map(i=>Math.abs(data[0].pixels[n+i]-data[1].pixels[n+i])));max=Math.max(max,d);if(d>1)changed++;}return{max,changed};
    },{images,start:entry.geometry.elements['.network-workspace'].y});
    branchPixels.push({width:entry.width,...difference});pass(difference.max<=5,`${entry.width}: branch workspace pixels unchanged within existing five-channel rendering tolerance`);
  }
  await decoder.close();
  const hashes=JSON.parse(await readFile('qa/blogs/before-hashes.json','utf8'));
  const changed=[];for(const [path,hash] of Object.entries(hashes)){if(createHash('sha256').update(await readFile(path)).digest('hex')!==hash)changed.push(path);}
  pass(JSON.stringify(changed.sort())===JSON.stringify(['src/i18n/messages.txt','src/main.jsx','src/site-contact.jsx'].sort()),'Existing source edits limited to route/navigation integration and new translations');
  for(const [width,height] of [[1440,900],[768,1024],[375,812]]){
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});track(page);
    await page.goto('http://127.0.0.1:5173/blogs/',{waitUntil:'networkidle'});
    pass(await page.locator('.journal-masthead').isVisible(),`${width}: trailing-slash Blogs route`);
    await page.screenshot({path:`qa/blogs/final/${width}-listing.png`,fullPage:true});
    await page.locator('.journal-read-button').click();await page.locator('.journal-prose').waitFor();
    await page.screenshot({path:`qa/blogs/final/${width}-reader.png`,fullPage:true});
    await page.evaluate(async()=>{const {BlogRepository}=await import('/src/blogs/repository.js');BlogRepository.createPost({title:'Growth'.repeat(36),slug:'long-content-qa',excerpt:'Perspective'.repeat(50),author:'Writer'.repeat(20),category:'Learning'.repeat(10),publishDate:'2026-09-10',status:'published',featured:true,image:'',content:'Introduction.\n## First heading\nA paragraph with **bold**.\n### Smaller heading\n- First item\n- Second item\n## Last heading\n1. First step\n2. Second step'});});
    await page.goto('http://127.0.0.1:5173/blogs',{waitUntil:'networkidle'});await bounds(page,`${width}: long authored listing text stays within viewport`);
    await page.locator('.journal-read-button').click();await page.locator('.journal-prose').waitFor();await bounds(page,`${width}: long authored article text stays within viewport`);
    pass(await page.locator('.journal-prose h2').count()===2&&await page.locator('.journal-prose h3').count()===1,`${width}: Markdown headings without blank lines`);
    pass(await page.locator('.journal-prose li').count()===4,`${width}: ordered and unordered lists`);
    for(const link of await page.locator('.journal-contents a[href^="#"]').all()){const href=await link.getAttribute('href');pass(await page.locator(href).count()===1,`${width}: TOC target ${href}`);}
    await page.locator('.journal-contents a[href="#article-section-2"]').click();await page.waitForTimeout(150);
    pass(await page.locator('#article-section-2').evaluate(n=>n.getBoundingClientRect().top>=document.querySelector('.header').getBoundingClientRect().bottom),`${width}: heading anchor clears sticky header`);
    pass(Math.abs(await page.locator('.journal-reading-progress').evaluate(n=>n.getBoundingClientRect().top)-await page.locator('.header').evaluate(n=>n.getBoundingClientRect().bottom))<2,`${width}: reading progress follows header`);
    await page.goto('http://127.0.0.1:5173/products/loans',{waitUntil:'networkidle'});
    await page.locator('#loan-amount-number').fill('100000');await page.locator('#loan-tenure-number').fill('24');
    const amount=100000,r=.18/12,months=24,emi=amount*r/(1-Math.pow(1+r,-months));
    const displayed=Number((await page.locator('.loan-calculator .calc-results dd').first().textContent()).replace(/[^0-9]/g,''));pass(displayed===Math.round(emi),`${width}: EMI calculator recomputes`);
    pass(await page.locator('#loan-rate-number').inputValue()==='18'&&await page.locator('#loan-rate-number').getAttribute('readonly')!==null,`${width}: approved loan rate remains fixed`);
    await page.locator('.loan-calculator .calc-plan-tabs button').last().click();pass(await page.locator('#loan-amount-number').inputValue()==='300000',`${width}: Mortgage Loan tab`);
    if(width<=760)await page.locator('.menu-toggle').click();await page.locator('.products-nav>button').click();await page.locator('#products-menu a[href="/products/deposits"]').click();await page.waitForURL('**/products/deposits');
    await page.locator('#deposit-amount-number').fill('200000');await page.locator('#deposit-rate-number').fill('8');await page.locator('#deposit-tenure-number').fill('24');
    pass((await page.locator('.deposit-calculator .calc-results dd').allTextContents()).join('|')==='₹2,00,000|₹32,000|₹2,32,000',`${width}: FD calculator recomputes`);
    await page.locator('.deposit-calculator .calc-plan-tabs button').last().click();await page.locator('#monthly-investment-number').fill('10000');
    pass((await page.locator('.deposit-calculator .calc-results dd').allTextContents()).join('|')==='₹2,40,000|₹17,500|₹2,57,500',`${width}: RD calculator recomputes`);
    await page.goto('http://127.0.0.1:5173/services',{waitUntil:'networkidle'});pass(await page.locator('main h1').count()===1,`${width}: Services route`);
    const more=page.locator('.service-expand').first();await more.click();pass(await more.getAttribute('aria-expanded')==='true',`${width}: Services details expand`);await bounds(page,`${width}: Services layout`);
    await page.goto('http://127.0.0.1:5173/contact',{waitUntil:'networkidle'});pass(await page.locator('main .conversation').count()===1&&await page.locator('main').getByText('Branch Office',{exact:true}).count()===0,`${width}: Contact form and approved section removal preserved`);
    pass(await page.locator('main a[href="tel:9920028810"]').count()===1&&await page.locator('main a[href="mailto:info@hccs.co.in"]').count()===1,`${width}: Contact phone and email preserved`);
    await page.locator('.message-form button[type=submit]').click();pass(await page.locator('#contact-name').getAttribute('aria-invalid')==='true',`${width}: Contact required validation`);
    for(const [key,value] of Object.entries({name:'Local QA',email:'qa@example.test',phone:'9876543210',message:'Local preview verification.'}))await page.locator(`#contact-${key}`).fill(value);
    await page.locator('.message-form button[type=submit]').click();pass((await page.locator('.message-ready [role=status]').textContent()).includes('has not been sent or saved'),`${width}: Contact local preview`);await bounds(page,`${width}: Contact layout`);
    await page.close();
  }
  pass(errors.length===0,'No console errors in final audit');
  await writeFile('qa/blogs/final/audit.json',JSON.stringify({checks,errors,branchPixels,changed},null,2));console.log(`${checks.length} final checks passed; no console errors.`);
}finally{await browser.close();}
