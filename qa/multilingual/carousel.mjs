import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),results=[];
await mkdir('qa/multilingual/carousel',{recursive:true});
try{for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160]]){
 const p=await b.newPage({viewport:{width,height}});await p.goto('http://127.0.0.1:5173');await p.waitForTimeout(1300);
 const geometry=await p.evaluate(()=>{const s=document.querySelector('.featured-journey'),pin=s.firstElementChild;return {start:scrollY+s.getBoundingClientRect().top-parseFloat(getComputedStyle(pin).top),runway:s.offsetHeight-pin.offsetHeight};});
 const samples=[];
 for(const progress of [0,.25,.5,.75,1]){
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+progress*geometry.runway);await p.waitForTimeout(100);
  const sample=await p.evaluate(()=>{const s=document.querySelector('.featured-journey'),pin=s.firstElementChild,windowEl=s.querySelector('.featured-window');const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};return {cards:[...s.querySelectorAll('.featured-stop')].map(rect),heading:rect(s.querySelector('h2')),window:rect(windowEl),pin:rect(pin),zoom:new DOMMatrix(getComputedStyle(s.querySelector('.featured-composition')).transform).a,sectionHeight:s.offsetHeight,cardScales:[...s.querySelectorAll('.featured-stop')].map(e=>getComputedStyle(e).scale),overflow:document.documentElement.scrollWidth>innerWidth};});
  samples.push({progress,...sample});await p.screenshot({path:`qa/multilingual/carousel/${width}-${progress*100}.png`});
 }
 assert.ok(samples[0].cards[0].x>=samples[0].window.x,'First card starts fully inside left');
 assert.ok(samples[0].cards[0].right<=samples[0].window.right,'First card fits inside right');
 assert.ok(samples[0].cards[0].y-samples[0].heading.bottom<100,'Heading connected to cards');
 for(let i=1;i<samples.length;i++)assert.ok(samples[i].cards[0].x>samples[i-1].cards[0].x,'Known card travels RIGHT on down scroll');
 assert.ok(Math.abs(samples[0].zoom-1)<.002&&Math.abs(samples[4].zoom-1)<.002);
 assert.ok(samples.slice(1,4).every(s=>Math.abs(s.zoom-1.06)<.002));
 assert.ok(samples.every(s=>s.sectionHeight===samples[0].sectionHeight&&!s.overflow));
 const backwards=[];for(const progress of [1,.75,.5,.25,0]){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+progress*geometry.runway);await p.waitForTimeout(70);backwards.push(await p.locator('.featured-stop').first().evaluate(e=>e.getBoundingClientRect().x));}
 for(let i=1;i<backwards.length;i++)assert.ok(backwards[i]<backwards[i-1],'Known card travels LEFT on up scroll');
 const zoomExit=[];for(const progress of [.88,.91,.94,.97,1]){await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),geometry.start+progress*geometry.runway);await p.waitForTimeout(70);zoomExit.push(await p.locator('.featured-stop').evaluateAll(cards=>cards.map(e=>e.getBoundingClientRect().x)));}
 for(let i=1;i<zoomExit.length;i++)for(let card=0;card<4;card++)assert.ok(zoomExit[i][card]>=zoomExit[i-1][card]-.1,'Zoom-out does not reverse any card');
 results.push({width,height,geometry,samples,backwards,zoomExit});await p.close();console.log(`Carousel ${width}: down RIGHT, up LEFT; one zoom cycle`);
}}finally{await writeFile('qa/multilingual/carousel-results.json',JSON.stringify(results,null,2));await b.close();}
