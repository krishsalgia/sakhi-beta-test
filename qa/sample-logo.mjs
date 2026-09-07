import { chromium } from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});const page=await browser.newPage();
await page.goto('http://127.0.0.1:5173/');
const colors=await page.evaluate(async()=>{const image=new Image();image.src='/assets/sakhi-logo.png';await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);const a=x.getImageData(0,0,c.width,c.height).data;const counts={};for(let i=0;i<a.length;i+=4){const rgb=[a[i],a[i+1],a[i+2]];if(Math.max(...rgb)-Math.min(...rgb)<50)continue;const h='#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join('');counts[h]=(counts[h]||0)+1;}return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,30);});
await writeFile('qa/enhancement-research/logo-colors.json',JSON.stringify(colors,null,2));console.log(colors);await browser.close();
