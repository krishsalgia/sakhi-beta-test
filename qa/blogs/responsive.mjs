import {chromium} from 'playwright';import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('qa/blogs/pass2',{recursive:true});const browser=await chromium.launch({channel:'chrome'});const results=[],errors=[];
for(const [width,height] of [[1366,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[1024,1366],[768,1024],[430,932],[390,844],[375,812]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>errors.push(`${width}: ${e.message}`));page.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
 for(const [name,path] of [['listing','/blogs'],['article','/blogs/understanding-fixed-deposits'],['login','/login']]){
  await page.goto(`http://127.0.0.1:5173${path}`,{waitUntil:'networkidle'});await page.waitForTimeout(1100);await page.screenshot({path:`qa/blogs/pass2/${width}-${name}.png`});
  const g=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...document.querySelectorAll('.journal-page h1,.journal-masthead h1>span,.journal-lead h2,.journal-page p,.blog-admin-header select')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&(r.left<0||r.right>innerWidth+1);}).map(n=>n.className||n.tagName),header:document.querySelector('.header')?[...document.querySelector('.header').children].filter(n=>getComputedStyle(n).display!=='none').map(n=>({name:n.className,rect:n.getBoundingClientRect().toJSON()})):null}));results.push({width,height,name,...g});
 }
 await page.locator('#admin-username').fill('krish');await page.locator('#admin-password').fill('1153');await page.getByRole('button',{name:'Login',exact:true}).click();await page.waitForTimeout(500);await page.screenshot({path:`qa/blogs/pass2/${width}-dashboard.png`});
 await page.getByRole('button',{name:'Create blog'}).click();await page.waitForTimeout(500);await page.screenshot({path:`qa/blogs/pass2/${width}-editor.png`});results.push({width,height,name:'editor',overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 await page.close();
}
await writeFile('qa/blogs/pass2/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({errors,issues:results.filter(r=>r.overflow||r.clipped?.length)}));await browser.close();
