import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),errors=[],checks=[];
try{
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    await page.goto('http://127.0.0.1:5173/branches',{waitUntil:'networkidle'});
    await page.locator('.territory-tabs button').first().click();
    assert.equal(await page.locator('.area-choice').count(),6);
    await page.locator('.area-choice').first().click();
    await page.locator('.branch-card[data-branch="andheri"]').waitFor();
    assert.equal(await page.locator('.branch-card').count(),6);
    await page.locator('.branch-card[data-branch="andheri"]').click();
    assert.match(await page.locator('.selected-branch h3').textContent(),/Andheri/);
    await page.locator('.leaflet-tile-loaded').first().waitFor({state:'attached',timeout:20000});
    await page.locator('.network-back').click();
    assert.equal(await page.locator('.area-choice').count(),6);
    await page.locator('.network-back').click();
    await page.locator('.territory-tabs button').last().click();
    assert.equal(await page.locator('.territory-empty').count(),1);
    checks.push({width,maharashtraCities:6,mumbaiBranches:6,andheriSelected:true,tilesLoaded:true,karnataka:true});
    await page.close();
  }
  assert.deepEqual(errors,[]);
  await writeFile('qa/blogs/final/branch-interactions.json',JSON.stringify({checks,errors},null,2));
  console.log('Branch selection, map tiles, back navigation and Karnataka passed at desktop/mobile; no console errors.');
}finally{await browser.close();}
