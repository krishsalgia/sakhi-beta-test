import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
await mkdir('qa/polish/entrance',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const evidence=[];
try {
  for(const [width,height] of [[1440,900],[390,844]]) {
    const page=await browser.newPage({viewport:{width,height}});
    await page.goto('http://127.0.0.1:5173/',{waitUntil:'domcontentloaded'});
    await page.locator('.savings-entry').waitFor();
    await page.evaluate(()=>{
      window.sequenceAnimations=document.getAnimations();
      window.sequenceAnimations.forEach(a=>{a.pause();a.currentTime=0;});
    });
    const frames=[];
    for(const time of [0,320,700,1250,1850]) {
      await page.evaluate(t=>window.sequenceAnimations.forEach(a=>{a.currentTime=t;}),time);
      const state=await page.evaluate(()=>{
        const stateFor=sel=>{const el=document.querySelector(sel),s=getComputedStyle(el);return {opacity:s.opacity,transform:s.transform,dash:s.strokeDashoffset};};
        return {future:stateFor('.future-entry'),savings:stateFor('.savings-entry'),headline:stateFor('.hero-headline-line > span'),doodle:stateFor('.hero-doodle path'),graph:stateFor('.growth-line path'),overflow:document.documentElement.scrollWidth>innerWidth};
      });
      frames.push({time,...state});
      await page.screenshot({path:`qa/polish/entrance/${width}-${time}ms.png`});
    }
    assert.equal(frames[0].future.opacity,'0'); assert.equal(frames[0].savings.opacity,'0');
    assert.notEqual(frames[1].future.transform,frames.at(-1).future.transform);
    assert.notEqual(frames[2].savings.transform,frames.at(-1).savings.transform);
    assert.equal(frames.at(-1).future.opacity,'1'); assert.equal(frames.at(-1).savings.opacity,'1');
    assert.notEqual(frames[0].doodle.dash,frames.at(-1).doodle.dash);
    assert.notEqual(frames[0].graph.dash,frames.at(-1).graph.dash);
    assert.ok(frames.every(frame=>!frame.overflow));
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.savings-entry').evaluate(el=>getComputedStyle(el).opacity),'1');
    assert.equal(await page.locator('.hero').evaluate(el=>el.getAnimations({subtree:true}).length),0);
    evidence.push({width,frames});
    await page.close();
  }
  await writeFile('qa/polish/entrance/results.json',JSON.stringify(evidence,null,2));
  console.log('Desktop/mobile choreography, visible card placement, path drawing, no overflow and reduced motion passed.');
} finally {await browser.close();}
