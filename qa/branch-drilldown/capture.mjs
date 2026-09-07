import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),errors=[];
await mkdir('qa/branch-drilldown/screens',{recursive:true});
try {
  for(const [width,height] of [[1440,900],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}});
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>errors.push(r.url()+' '+r.failure()?.errorText));
    await page.goto('http://127.0.0.1:5173/');
    const screenshot=async name=>{await page.locator('.network-navigation').scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(1100);await page.locator('.network-workspace').screenshot({path:`qa/branch-drilldown/screens/${width}-${name}.png`});};
    await screenshot('india');
    await page.getByRole('button',{name:'Choose Maharashtra',exact:true}).click();
    await page.locator('.city-marker').first().waitFor();await screenshot('maharashtra');
    await page.getByRole('button',{name:'Choose Mumbai',exact:true}).click();
    await page.locator('.city-geographic-map').waitFor();await page.waitForFunction(()=>document.querySelectorAll('.leaflet-tile-loaded').length>0);await screenshot('mumbai');
    await page.getByRole('button',{name:'Select Jogeshwari branch',exact:true}).click();
    await screenshot('jogeshwari');
    await page.locator('.network-breadcrumbs').getByRole('button',{name:'India',exact:true}).click();
    await page.getByRole('button',{name:'Choose Karnataka',exact:true}).click();
    await page.getByText('Our verified directory does not yet include Karnataka branch addresses.',{exact:true}).waitFor();await screenshot('karnataka');
    console.log(width,await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth})));await page.close();
  }
  console.log('Errors:',errors);await writeFile('qa/branch-drilldown/capture-errors.json',JSON.stringify(errors,null,2));
} finally {await browser.close();}
