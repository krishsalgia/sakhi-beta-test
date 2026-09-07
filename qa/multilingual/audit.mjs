import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
const page = await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const missing=new Set(), errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('sakhi.language','hi'));
const collect=async()=>{for(const text of await page.evaluate(()=>[...(window.__sakhiMissingTranslations||[])]))missing.add(text);};
try {
  for(const route of ['/','/products/loans','/products/deposits','/services','/branches','/contact']) {
    await page.goto('http://127.0.0.1:5173'+route); await page.waitForTimeout(500);
    if(route==='/') await page.locator('[aria-controls="eligibility-details"]').click();
    if(route.includes('/products/')) {
      const kind=route.split('/').pop();
      const ids=await page.evaluate(async kind=>(await import('/src/product-data.js'))[kind].map(p=>p.id),kind);
      for(const id of ids) {
        await page.goto('http://127.0.0.1:5173'+route+'#'+id);
        await page.reload();
        await page.locator('dialog').waitFor();
        await collect();
        if(id===ids[0]) {
          await page.locator('.detail-actions button').click();
          await page.locator('.application-form button').click();
          await page.locator('#applicant-name').fill('QA');
          await page.locator('#applicant-phone').fill('9876543210');
          await page.locator('#applicant-email').fill('qa@example.com');
          await page.locator('.application-form button').click();
          await collect();
        }
        await page.keyboard.press('Escape');
      }
      for(const tab of await page.locator('.calc-plan-tabs button').all()){await tab.click();await collect();}
    }
    if(route==='/branches') {
      await page.locator('.state-choice').count();
      await page.evaluate(async()=>{
        const {t}=await import('/src/i18n/index.js');
        const {branches}=await import('/src/branch-data.js');
        const {branchAreas,branchLocations}=await import('/src/branch-geography.js');
        for(const b of branches) for(const field of ['name','city','district','state','address']) if(b[field])t(b[field]);
        for(const a of branchAreas){t(a.name);t(a.subtitle);}
        for(const b of Object.values(branchLocations))t(b.locality);
      });
      await page.locator('.map-state-verified').click();await page.waitForTimeout(350);await collect();
      const cities=await page.locator('.city-area-list button').count();
      const cityButtons=page.locator('.area-list button');
      // Actual class is discovered below; map markers are stable and accessible.
      const ids=await page.locator('.city-marker').count();
      for(let i=0;i<ids;i++) {
        await page.locator('.area-choice').nth(i).click();await page.waitForTimeout(600);
        for(const b of await page.locator('.branch-card').all()){await b.click();await collect();}
        await page.locator('.network-breadcrumbs button').nth(1).click();await page.waitForTimeout(350);
      }
    }
    if(route==='/contact'){await page.locator('.message-form button').click();}
    await collect();
  }
} catch(e){errors.push(e.stack);} finally {
  await writeFile('qa/multilingual/missing.json',JSON.stringify({missing:[...missing].sort(),errors},null,2));
  console.log(JSON.stringify({missing:[...missing].sort(),errors},null,2));
  await browser.close();
}
