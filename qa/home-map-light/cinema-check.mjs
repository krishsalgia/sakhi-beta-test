import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

// Homepage-only checks. Run once the cinematic source is ready.
// --quick limits the matrix to desktop/mobile. --capture-only records without assertions.
const quick=process.argv.includes('--quick');
const captureOnly=process.argv.includes('--capture-only');
const root=new URL('./',import.meta.url);
const sizes=quick?[[1440,900],[390,844]]:[[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844]];
const points=[0,.2,.4,.6,.76,.83,.92,1];
await mkdir(new URL('cinema/',root),{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[],failures=[];
function check(value,label){if(!value)failures.push(label);}
async function metrics(page){
  return page.locator('.home-branch-assembly').evaluate(host=>{
    const style=getComputedStyle(host),pin=host.querySelector('.cinema-pin');
    return {documentTop:host.getBoundingClientRect().top+scrollY,pinTop:parseFloat(style.getPropertyValue('--cinema-pin-top'))||parseFloat(getComputedStyle(pin).top)||0,runway:parseFloat(getComputedStyle(host,'::after').height)||0,lead:innerHeight*.20};
  });
}
async function move(page,p){
  const m=await metrics(page);
  await page.evaluate(({documentTop,pinTop,runway,lead,p})=>scrollTo({top:documentTop-pinTop-lead+(runway+lead)*p,behavior:'instant'}),{...m,p});
  await page.waitForTimeout(120);
}
async function snapshot(page){
  return page.locator('.home-branch-assembly').evaluate(host=>{
    const panel=host.querySelector('.branch-panel'),pin=host.querySelector('.cinema-pin'),map=host.querySelector('.india-map');
    const box=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height};};
    return {
      progress:Number(host.style.getPropertyValue('--cinema-progress')),
      phase:host.dataset.assembly,
      overflow:document.documentElement.scrollWidth>innerWidth,
      cls:window.__cinemaCLS||0,
      hostHeight:host.offsetHeight,
      pin:box(pin),map:map?box(map):null,
      panel:{...box(panel),opacity:Number(getComputedStyle(panel).opacity),transform:getComputedStyle(panel).transform},
      controls:[...host.querySelectorAll('.territory-tabs button,.map-state')].map(n=>({name:n.getAttribute('aria-label'),blocked:!!n.closest('[inert]'),tabIndex:n.tabIndex,pointerEvents:getComputedStyle(n).pointerEvents})),
      pieces:[...host.querySelectorAll('.india-map use')].map(node=>{
        const style=getComputedStyle(node),matrix=new DOMMatrix(style.transform);
        return {id:node.getAttribute('href').split('#').at(-1),opacity:Number(style.opacity),stroke:Number(style.strokeOpacity),fill:style.fill,transform:style.transform,x:matrix.m41,y:matrix.m42,z:matrix.m43,is2D:matrix.is2D,box:box(node)};
      }),
    };
  });
}
function pieceState(s){return JSON.stringify(s.pieces.map(p=>({id:p.id,opacity:p.opacity,stroke:p.stroke,fill:p.fill,transform:p.transform})));}
try {
  for(const [width,height] of sizes){
    const page=await browser.newPage({viewport:{width,height}});
    await page.addInitScript(()=>{
      window.__cinemaCLS=0;
      new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__cinemaCLS+=entry.value;}).observe({type:'layout-shift',buffered:true});
    });
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
    await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle'});
    await page.locator('.cinema-pin').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const samples=[];
    for(const p of points){
      await move(page,p);
      const state=await snapshot(page);
      samples.push({requested:p,...state});
      await page.screenshot({path:fileURLToPath(new URL(`cinema/${width}-${String(p).replace('.','p')}.png`,root))});
      check(Math.abs(state.progress-p)<.012,`${width}: requested progress ${p}, got ${state.progress}`);
      check(!state.overflow,`${width}: horizontal overflow at ${p}`);
      check(state.cls<.001,`${width}: unexpected layout shift ${state.cls} at ${p}`);
    }
    check(samples[0].pieces.length===36,`${width}: expected 36 geographic state pieces`);
    check(samples[0].pieces.every(piece=>piece.opacity<.01),`${width}: pieces visible before assembly`);
    check(samples.at(-1).phase==='ready',`${width}: assembly did not become ready`);
    check(samples.at(-1).pieces.every(piece=>piece.opacity>.95),`${width}: completed map has invisible pieces`);
    check(samples.at(-1).controls.every(control=>!control.blocked),`${width}: completed controls remain inert`);
    check(samples.some(sample=>sample.requested>0&&sample.requested<.76&&sample.pieces.some(piece=>!piece.is2D&&Math.abs(piece.z)>.1)),`${width}: no state depth movement observed`);
    // Stop on a partially assembled frame: the map must wait for scrolling.
    await move(page,.4);
    const pausedStart=await snapshot(page);
    await page.waitForTimeout(650);
    const pausedEnd=await snapshot(page);
    check(pieceState(pausedStart)===pieceState(pausedEnd),`${width}: state motion continued while scroll was paused`);
    // Scroll back before interacting: forward and reverse states must match.
    const reverse=[];
    for(const p of [.2,0]){
      await move(page,p);
      const state=await snapshot(page),forward=samples.find(sample=>sample.requested===p);
      reverse.push({requested:p,...state});
      check(pieceState(state)===pieceState(forward),`${width}: reverse progress ${p} did not restore construction state`);
    }
    results.push({width,height,metrics:await metrics(page),samples,paused:{start:pausedStart,end:pausedEnd},reverse});
    await page.close();
  }
}finally{await browser.close();}
await writeFile(new URL('cinema-results.json',root),JSON.stringify({results,errors,failures},null,2));
console.log(JSON.stringify({viewports:results.length,errors,failures},null,2));
if(!captureOnly){assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);}
