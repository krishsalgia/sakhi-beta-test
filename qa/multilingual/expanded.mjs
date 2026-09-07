import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'}),results=[],errors=[];
try{for(const [width,height] of [[1440,900],[768,1024],[390,844],[320,740]])for(const lang of ['hi','mr']){
 const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});await p.addInitScript(lang=>localStorage.setItem('sakhi.language',lang),lang);p.on('pageerror',e=>errors.push(e.message));
 for(const [route,id] of [['/products/loans','mortgage-loan'],['/products/deposits','lakhpati-deposit']]){
  await p.goto('http://127.0.0.1:5173'+route+'#'+id);await p.locator('dialog').waitFor();
  await p.screenshot({path:`qa/multilingual/screenshots/${width}-${lang}-${id}-dialog.png`});
  assert.ok(await p.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await p.locator('.detail-actions button').click();await p.locator('.application-form button').click();
  assert.match(await p.locator('#applicant-name').evaluate(e=>e.validationMessage),/[\u0900-\u097f]/);
  await p.locator('#applicant-name').fill('QA');await p.locator('#applicant-phone').fill('123');assert.match(await p.locator('#applicant-phone').evaluate(e=>e.validationMessage),/[\u0900-\u097f]/);
  await p.locator('#applicant-phone').fill('9876543210');await p.locator('#applicant-email').fill('qa@example.com');await p.locator('.application-form button').click();assert.ok(await p.locator('.application-result').isVisible());await p.keyboard.press('Escape');
 }
 await p.goto('http://127.0.0.1:5173');
 for(const faq of await p.locator('.faq-item button').all()){await faq.click();assert.equal(await faq.getAttribute('aria-expanded'),'true');}
 await p.locator('.journey-progress button').last().click();await p.waitForTimeout(120);assert.ok(await p.locator('.featured-track').evaluate(e=>e.scrollLeft>0));
 const last=p.locator('.featured-stop').last().locator('a');await last.click();await p.locator('dialog').waitFor();assert.ok(p.url().endsWith('/products/loans#jlg-loan'));await p.keyboard.press('Escape');
 await p.goto('http://127.0.0.1:5173/services');for(const expand of await p.locator('.service-expand').all())await expand.click();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.goto('http://127.0.0.1:5173/contact');await p.locator('.message-form button').click();await p.locator('.conversation').screenshot({path:`qa/multilingual/screenshots/${width}-${lang}-form-validation.png`});
 for(const [key,value] of Object.entries({name:'QA',email:'qa@example.com',phone:'9876543210',message:'Local QA'}))await p.locator('#contact-'+key).fill(value);
 await p.locator('.message-form button').click();await p.locator('.conversation').screenshot({path:`qa/multilingual/screenshots/${width}-${lang}-form-ready.png`});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width<=760){await p.locator('.menu-toggle').click();await p.locator('.language-control select').selectOption('en');assert.equal(await p.locator('html').getAttribute('lang'),'en');await p.screenshot({path:`qa/multilingual/screenshots/${width}-mobile-navigation.png`});}
 const missing=await p.evaluate(()=>[...(window.__sakhiMissingTranslations||[])]);assert.deepEqual(missing,[]);results.push({width,lang,dialogs:true,localizedValidation:true,faq:true,touchCarousel:true,serviceDetails:true,contact:true});await p.close();console.log(`Expanded ${width} ${lang} passed`);
}}finally{await writeFile('qa/multilingual/expanded-results.json',JSON.stringify({results,errors},null,2));await b.close();}
