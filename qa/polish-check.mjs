import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = 'http://127.0.0.1:5173';
const viewports = [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844],[320,740]].filter(([width])=>!process.argv[2]||process.argv[2].split(',').map(Number).includes(width));
const routes = ['/', '/products/loans', '/products/deposits', '/services', '/contact'];
const results = [], errors = [];
await mkdir('qa/polish/viewports', { recursive:true });
const browser = await chromium.launch({channel:'chrome',headless:true});
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

async function reveal(page, selector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(850);
}
async function headerCheck(page) {
  const header = await page.locator('.header').evaluate(el => {
    const b=el.getBoundingClientRect(),s=getComputedStyle(el);
    return { x:b.x,y:b.y,w:b.width,vw:innerWidth,radius:s.borderRadius,bg:s.backgroundColor,
      corners:[document.elementFromPoint(1,1),document.elementFromPoint(innerWidth-1,1)].every(node=>node===el||el.contains(node)) };
  });
  assert.ok(Math.abs(header.x)<1 && Math.abs(header.y)<1 && Math.abs(header.w-header.vw)<1,JSON.stringify(header));
  assert.equal(header.radius,'0px'); assert.equal(header.bg,'rgb(255, 255, 255)'); assert.ok(header.corners);
}

try {
  for (const [width,height] of viewports) {
    const page=await browser.newPage({viewport:{width,height}});
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
    page.on('requestfailed',r=>errors.push(r.url()));
    await page.addInitScript(() => {
      window.polishCLS=0;
      new PerformanceObserver(list=>list.getEntries().forEach(entry=>{if(!entry.hadRecentInput)window.polishCLS+=entry.value;})).observe({type:'layout-shift',buffered:true});
    });
    for (const route of routes) {
      await page.goto(base+route,{waitUntil:'domcontentloaded'});
      await page.locator('h1').waitFor();
      if(route==='/') {
        const entrance=await page.evaluate(async()=>{
          const bad=[]; let frames=0; const start=performance.now();
          await new Promise(resolve=>{
            const frame=()=>{frames++;if(document.documentElement.scrollWidth>innerWidth)bad.push(performance.now()-start);if(performance.now()-start<1900)requestAnimationFrame(frame);else resolve();};
            requestAnimationFrame(frame);
          });
          return {bad,frames,cls:window.polishCLS};
        });
        assert.deepEqual(entrance.bad,[],'Overflow during entrance');
        assert.ok(entrance.cls<.01,`Entrance layout shift ${entrance.cls}`);
        const sequence=await page.locator('.hero-card-entry').evaluateAll(els=>els.map(el=>{
          const a=el.getAnimations()[0];return {name:a.animationName,start:a.startTime,state:a.playState,timing:a.effect.getTiming()};
        }));
        assert.ok(sequence.every(a=>a.state==='finished' && a.timing.duration+a.timing.delay<=2000));
        assert.ok(sequence[0].timing.delay<sequence[1].timing.delay,'Cards must stagger');
        await page.screenshot({path:`qa/polish/viewports/home-${width}.png`});
        await reveal(page,'.featured');
        const cards=await page.locator('.product-card').evaluateAll(els=>els.map(el=>{
          const c=el.querySelector('.product-copy').getBoundingClientRect(),a=el.querySelector('.product-art').getBoundingClientRect();
          return {gap:a.top-c.bottom,contentFits:el.querySelector('.product-copy').scrollWidth<=el.querySelector('.product-copy').clientWidth+1};
        }));
        assert.ok(cards.every(c=>c.gap>=8 && c.contentFits),JSON.stringify(cards));
        await headerCheck(page);
        await page.screenshot({path:`qa/polish/viewports/cards-${width}.png`});
        await reveal(page,'.figures'); await headerCheck(page);
        await reveal(page,'.steps'); await headerCheck(page);
        assert.equal(await page.locator('.steps li').count(),3);
        await page.screenshot({path:`qa/polish/viewports/steps-${width}.png`});
        await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
        const revisited=await page.locator('.hero-card-entry').evaluateAll(els=>els.map(el=>el.getAnimations()[0].startTime));
        assert.deepEqual(revisited,sequence.map(a=>a.start),'Scroll re-entry restarted hero');
      } else {
        await page.waitForTimeout(1000);
        await page.screenshot({path:`qa/polish/viewports/${route.split('/').at(-1)}-${width}.png`});
      }
      if(route==='/products/loans') {
        assert.equal(await page.locator('svg.portal-arrow').count(),1);
        assert.equal(await page.locator('.loan-portal').innerText(),'');
        const boxes=await page.evaluate(()=>{const a=document.querySelector('.loan-portal').getBoundingClientRect(),b=document.querySelector('.loan-spotlight').getBoundingClientRect();return {gap:b.top-a.bottom};});
        assert.ok(boxes.gap>=0,`Portal/card overlap: ${boxes.gap}`);
        await reveal(page,'.loan-row');
      }
      if(route==='/products/deposits') {
        await reveal(page,'.lakhpati-explorer');
        const h=await page.locator('.lakhpati-explorer').evaluate(el=>el.getBoundingClientRect().height);
        assert.ok(h<(width<=760?750:640),`Lakhpati too tall: ${h}`);
        await page.screenshot({path:`qa/polish/viewports/lakhpati-${width}.png`});
        await reveal(page,'.deposit-crosslink');
        assert.equal(await page.locator('.deposit-crosslink a').getAttribute('href'),'/products/loans');
        await page.screenshot({path:`qa/polish/viewports/deposit-cta-${width}.png`});
      }
      if(route==='/services') {
        assert.equal(await page.locator('.directory-benefit').count(),5);
        assert.equal(await page.getByRole('link',{name:'Read More',exact:true}).count(),0);
        await reveal(page,'.service-directory');
        await page.screenshot({path:`qa/polish/viewports/services-directory-${width}.png`});
      }
      await page.locator('footer').scrollIntoViewIfNeeded(); await headerCheck(page);
      assert.ok(await overflow(page),`${route} ${width} overflow`);
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
      await page.emulateMedia({reducedMotion:'no-preference'});
      results.push({width,height,route,header:'passed',overflow:false});
      console.log(`Passed ${width} ${route}`);
    }
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  for(const source of ['/products/loans','/products/deposits','/services','/contact']) {
    await page.goto(base+source,{waitUntil:'networkidle'});
    await page.locator('.logo').click(); await page.waitForURL(base+'/');
    await page.locator('.hero').waitFor();
    assert.equal(await page.locator('.hero-card-entry').count(),2);
    const active=await page.locator('.hero-card-entry').evaluateAll(els=>els.map(el=>el.getAnimations().length));
    assert.deepEqual(active,[1,1]);
  }
  await page.reload({waitUntil:'domcontentloaded'}); await page.locator('.hero').waitFor();
  await page.waitForTimeout(250);
  const cta=await page.locator('.hero-copy > .button').boundingBox();
  await page.mouse.click(cta.x+cta.width/2,cta.y+cta.height/2);
  await page.waitForURL(base+'/#featured');
  assert.equal(new URL(page.url()).hash,'#featured','CTA unavailable during entrance');
  await page.close();
  assert.deepEqual(errors,[]);
  await writeFile('qa/polish/results.json',JSON.stringify({results,errors,heroCLS:'<0.01',heroReplay:'route only',homeRoutes:4,entranceCTA:'passed'},null,2));
  console.log(`Polish QA passed: ${results.length} route/viewport combinations, entrance, CLS, sticky edges, cards and Home revisits.`);
} finally { await browser.close(); }
