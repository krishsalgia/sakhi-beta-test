import {chromium} from 'playwright';
import {mkdir,readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const root = new URL('./',import.meta.url);
const after = process.argv.includes('--compare');
const phase = after?'after':'before';
const sizes = [[1440,900],[1920,1080],[2560,1440],[3840,2160],[768,1024],[390,844]];
const digest = value=>createHash('sha256').update(value).digest('hex');
async function hashes(path='src') {
  const result={};
  for(const entry of await readdir(path,{withFileTypes:true})) {
    const next=`${path}/${entry.name}`;
    if(entry.isDirectory()) Object.assign(result,await hashes(next));
    else result[next]=digest(await readFile(next));
  }
  return result;
}
await mkdir(new URL(`branches-${phase}/`,root),{recursive:true});
const sourceHashes=await hashes();
if(!after) await writeFile(new URL('before-hashes.json',root),JSON.stringify(sourceHashes,null,2));
const browser=await chromium.launch({channel:'chrome'});
const results=[],errors=[];
try {
  for(const [width,height] of sizes) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));
    page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
    await page.goto('http://127.0.0.1:5173/branches',{waitUntil:'networkidle'});
    await page.locator('.network-workspace').scrollIntoViewIfNeeded();
    await page.mouse.move(0,0);
    await page.waitForTimeout(250);
    const screenshot=await page.locator('.branch-network').screenshot({path:new URL(`branches-${phase}/${width}.png`,root).pathname.replace(/^\/([A-Za-z]:)/,'$1'),animations:'disabled'});
    const geometry=await page.evaluate(()=>{
      const selector=['.branch-network','.network-heading','.network-navigation','.network-workspace','.map-panel','.network-map-stage','.india-map','.branch-panel','.network-panel-stage','.territory-tabs'];
      const origin=document.querySelector('.branch-network').getBoundingClientRect();
      return {overflow:document.documentElement.scrollWidth>innerWidth,language:document.documentElement.lang,elements:Object.fromEntries(selector.map(key=>{
        const node=document.querySelector(key),box=node.getBoundingClientRect(),s=getComputedStyle(node);
        return [key,{x:box.x-origin.x,y:box.y-origin.y,width:box.width,height:box.height,display:s.display,position:s.position,padding:s.padding,gap:s.gap,background:s.backgroundColor,color:s.color,font:s.font,transform:s.transform,opacity:s.opacity}];
      }))};
    });
    let pixelDifference=null;
    if(after){
      const previous=await readFile(new URL(`branches-before/${width}.png`,root));
      if(digest(previous)===digest(screenshot))pixelDifference={maxChannelDifference:0,changedPixels:0};
      else pixelDifference=await page.evaluate(async sources=>{
        const decode=async src=>{const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);return context.getImageData(0,0,canvas.width,canvas.height).data;};
        const [before,now]=await Promise.all(sources.map(decode));
        let maxChannelDifference=0,changedPixels=0;
        for(let n=0;n<before.length;n+=4){const delta=Math.max(...[0,1,2,3].map(i=>Math.abs(before[n+i]-now[n+i])));if(delta)changedPixels++;maxChannelDifference=Math.max(maxChannelDifference,delta);}
        return {maxChannelDifference,changedPixels};
      },[previous,screenshot].map(buffer=>`data:image/png;base64,${buffer.toString('base64')}`));
    }
    results.push({width,height,screenshot:digest(screenshot),geometry,pixelDifference});
    await page.close();
  }
} finally {await browser.close();}
await writeFile(new URL(`branches-${phase}/results.json`,root),JSON.stringify({results,errors},null,2));
if(after) {
  const baseline=JSON.parse(await readFile(new URL('branches-before/results.json',root),'utf8'));
  const beforeHashes=JSON.parse(await readFile(new URL('before-hashes.json',root),'utf8'));
  const changed=Object.keys(beforeHashes).filter(file=>beforeHashes[file]!==sourceHashes[file]);
  const unchangedBranchFiles=Object.keys(beforeHashes).filter(file=>/branch/.test(file)&&!file.includes('home-branch-assembly')).every(file=>beforeHashes[file]===sourceHashes[file]);
  const comparisons=results.map((result,index)=>({width:result.width,geometry:JSON.stringify(result.geometry)===JSON.stringify(baseline.results[index].geometry),pixels:result.screenshot===baseline.results[index].screenshot,pixelEquivalent:result.pixelDifference.maxChannelDifference<=5,pixelDifference:result.pixelDifference}));
  await writeFile(new URL('branches-comparison.json',root),JSON.stringify({comparisons,changed,unchangedBranchFiles,errors},null,2));
  assert.ok(comparisons.every(item=>item.geometry&&item.pixelEquivalent));
  assert.equal(unchangedBranchFiles,true);
}
assert.deepEqual(errors,[]);
console.log(`${phase}: ${results.length} /branches screenshots and geometry captures; no console errors.`);
