import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const brief = await readFile('sakhi_codex_redesign_prompt_4_phase_QA_creative_inner_pages.md', 'utf8');
const serviceBrief = brief.split('# Services\n')[1].split('# Contact page')[0];
const expected = [...serviceBrief.matchAll(/## (Mobile Banking|NEFT|RTGS|QR Code Payments|Door to Door Services)\n([\s\S]*?)(?=\n---)/g)].map(([,name,block]) => ({name, facts:[...block.matchAll(/^- (.+)$/gm)].map(match=>match[1])}));
assert.equal(expected.length,5);
const normalize = text => text.replace(/\s+/g,' ').trim();
const allowed = ['/', '/products/loans', '/products/deposits', '/services', '/contact'];
const errors=[], failures=[], results=[];
const browser = await chromium.launch({channel:'chrome'});
await mkdir('qa/screenshots/phase3',{recursive:true});
async function bounds(page) {
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page overflow');
 for(const el of await page.locator('main input,main textarea,main button,footer a').all()) {
  if(!await el.isVisible()) continue;
  const box=await el.boundingBox();
  assert.ok(box.x>=0 && box.x+box.width<=page.viewportSize().width+1,'Control outside viewport');
 }
}
try {
 for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',375,812],['small-mobile',320,740]]) {
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failures.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
  await page.goto('http://127.0.0.1:5173/services',{waitUntil:'networkidle'});
  for(const service of expected) {
   const article=page.locator('article').filter({has:page.getByRole('heading',{name:service.name,exact:true})});
   assert.equal(await article.count(),1);
   const directory=page.getByRole('group',{name:'Explore services'}).getByRole('button',{name:new RegExp(service.name)});
   await directory.focus();await page.keyboard.press('Enter');
   await page.waitForFunction(id=>document.activeElement===document.querySelector(`#${id} h2`),await article.getAttribute('id'));
   const more=article.locator('.service-expand');
   if(await more.count()) {await more.click();assert.equal(await more.getAttribute('aria-expanded'),'true');}
   const actual=await article.locator('.service-facts li').allTextContents();
   assert.deepEqual(actual,service.facts,service.name);
   for(const li of await article.locator('.service-facts li').all()) await li.waitFor({state:'visible'});
   if(await more.count()) {
    await article.getByRole('button',{name:'Fewer details'}).click();
    assert.equal(await article.locator('.service-extra').getAttribute('inert'),'');
   }
  }
  assert.equal(await page.getByRole('link',{name:'Read More',exact:true}).count(),0);
  assert.equal(await page.locator('main a[href^="/services/"]').count(),0);
  await bounds(page);
  for(const el of await page.locator('.product-reveal').all()) {await el.scrollIntoViewIfNeeded();await page.waitForFunction(el=>el.dataset.reveal==='visible',await el.elementHandle());}
  assert.ok(Math.abs(await page.locator('.header').evaluate(el=>el.getBoundingClientRect().top))<1);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const selector of ['.service-device','.transfer-track i','.scan-line']) assert.equal(await page.locator(selector).first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  if(width<=760)await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('#navigation').getByRole('link',{name:'Contact',exact:true}).click();
  await page.waitForURL('**/contact');
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('#navigation a[aria-current="page"]').textContent(),'Contact ');
  const body=normalize(await page.locator('main').innerText());
  for(const text of ['Contact Us','Get In Touch','Reach out to us & we will respond as soon as we can.','We are here to help you','Branch Office','B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East','Mumbai, 400072','Maharashtra, India','Call us at','9920028810','Email Address','info@hccs.co.in'])assert.ok(body.includes(text),text);
  const form=page.locator('.contact-form');
  assert.deepEqual(await form.locator('input,textarea').evaluateAll(els=>els.map(el=>el.name)),['name','email','phone','message']);
  const requests=[];const record=r=>requests.push(r.url());page.on('request',record);
  await form.getByRole('button',{name:'Submit',exact:true}).click();
  assert.equal(await form.evaluate(el=>el.checkValidity()),false);
  await page.getByLabel('Name',{exact:true}).fill('   ');
  assert.equal(await page.getByLabel('Name',{exact:true}).evaluate(el=>el.checkValidity()),false);
  await page.getByLabel('Name',{exact:true}).fill('QA Member');
  await page.getByLabel('Email',{exact:true}).fill('invalid');
  assert.equal(await page.getByLabel('Email',{exact:true}).evaluate(el=>el.checkValidity()),false);
  await page.getByLabel('Email',{exact:true}).fill('qa@example.test');
  await page.getByLabel('Phone',{exact:true}).fill('123');
  assert.equal(await page.getByLabel('Phone',{exact:true}).evaluate(el=>el.checkValidity()),false);
  await page.getByLabel('Phone',{exact:true}).fill('+91 9000000000');
  await page.getByLabel('Message',{exact:true}).fill('  ');
  assert.equal(await page.getByLabel('Message',{exact:true}).evaluate(el=>el.checkValidity()),false);
  await page.getByLabel('Message',{exact:true}).fill('Local browser QA message.');
  assert.equal(await form.evaluate(el=>el.checkValidity()),true);
  await form.getByRole('button',{name:'Submit',exact:true}).click();
  await page.getByRole('status').waitFor();
  assert.match(await page.getByRole('status').innerText(),/Your message has not been sent/);
  assert.equal(await page.getByRole('status').evaluate(el=>document.activeElement===el),true);
  assert.ok(await page.getByRole('status').evaluate(el=>el.getBoundingClientRect().top>=document.querySelector('.header').getBoundingClientRect().bottom),'Preview status hidden by fixed header');
  await page.screenshot({path:`qa/screenshots/phase3/${name}-contact-preview.png`});
  await page.getByRole('button',{name:'Back to form'}).click();
  await page.waitForFunction(()=>document.activeElement===document.querySelector('#contact-name'));
  assert.deepEqual(await form.locator('input,textarea').evaluateAll(els=>els.map(el=>el.value)),['','','','']);
  assert.deepEqual(requests,[],'Contact preview issued a request');page.off('request',record);
  assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0]);
  await bounds(page);
  const footer=page.locator('footer');
  assert.deepEqual(await footer.getByRole('navigation').locator('a').evaluateAll(els=>els.map(el=>el.getAttribute('href'))),allowed);
  assert.equal(await footer.locator('a').count(),7);
  const footerText=normalize(await footer.innerText());
  assert.ok(footerText.includes('Our goal at Sakhi Multistate Co-operative Credit Society is to provide access to various types of loans at competitive interest rates.'));
  assert.equal(normalize(await footer.locator('address').innerText()),'B-703, Sagar Tech Plaza, Sakinaka Junction, Andheri East, Mumbai, 400072, Maharashtra, India');
  assert.equal(await footer.locator('a[href="mailto:info@hccs.co.in"]').count(),1);
  assert.equal(await footer.locator('a[href="tel:9920028810"]').count(),1);
  assert.doesNotMatch((await page.locator('body').innerText()).replaceAll('info@hccs.co.in',''),/HCCS|Hindust[ah]n|testimonial|newsletter|Privacy Policy|Careers/i);
  for(const href of allowed) {
   await page.locator('.footer-navigation').locator(`a[href="${href}"]`).click();
   await page.waitForURL(url=>url.pathname===href);
   assert.equal(await page.locator('h1').count(),1);
   assert.equal(await page.locator('footer').count(),1);
  }
  await page.reload({waitUntil:'networkidle'});assert.equal(await page.getByLabel('Message',{exact:true}).count(),1);
  results.push({viewport:name,serviceFacts:30,serviceAccordions:'passed',keyboard:'passed',contactValidation:'passed',contactRequests:0,footerDestinations:5,overflow:false});
  await page.close();
 }
 const baseline=JSON.parse(await readFile('qa/phase3-baseline/hashes.json','utf8'));
 for(const [file,hash] of Object.entries(baseline)) {
  if(!['src/content.js','src/product-data.js','src/service-data.js','src/ui.jsx','public/assets/sakhi-logo.png'].includes(file))continue;
  assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),hash,`${file} changed`);
 }
 const oldMain=await readFile('qa/phase3-baseline/main.jsx.txt','utf8'),newMain=await readFile('src/main.jsx','utf8');
 // The manual-QA amendment authorizes Hero entrance wrappers; all other home components remain protected.
 assert.equal(newMain.replaceAll('\r\n','\n').split('function ProductArt(')[1].split('function App()')[0],oldMain.replaceAll('\r\n','\n').split('function ProductArt(')[1].split('function App()')[0],'Unrelated homepage components changed');
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 await writeFile('qa/phase3-results.json',JSON.stringify({results,errors,failures,approvedContentPreserved:true},null,2));
 console.log(JSON.stringify({results,errors,failures,approvedContentPreserved:true},null,2));
}finally{await browser.close();}
