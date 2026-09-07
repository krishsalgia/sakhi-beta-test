import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({channel:'chrome'});
const base='http://127.0.0.1:5173';
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto(base);await page.getByRole('button',{name:'Show product 2',exact:true}).click();await page.waitForTimeout(250);
  const card=page.locator('.product-card').nth(1),art=card.locator('.product-art');
  assert.equal(await card.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(247, 249, 243)','Original green card surface');
  const before=await art.evaluate(el=>getComputedStyle(el).transform);await card.hover();await page.waitForTimeout(500);
  assert.notEqual(await art.evaluate(el=>getComputedStyle(el).transform),before,'Original art hover');
  await page.locator('.product-caption').nth(1).click();await page.waitForURL(base+'/products/loans#loan-against-deposits');
  await page.goto(base+'/contact');await page.waitForTimeout(1800);
  const hero=await page.locator('.connection-opening').boundingBox();await page.mouse.move(hero.x+hero.width*.85,hero.y+hero.height*.3);
  assert.notEqual(await page.locator('.connection-opening').evaluate(el=>el.style.getPropertyValue('--hand-x')),'');
  await page.locator('#contact-email').focus();assert.equal(await page.locator('.conversation').evaluate(el=>el.style.getPropertyValue('--field')),'1');
  await page.waitForFunction(()=>Number(document.querySelector('.connection-page').style.getPropertyValue('--contact-scroll'))>0);
  assert.ok(Number(await page.locator('.connection-page').evaluate(el=>el.style.getPropertyValue('--contact-scroll')))>0,'Scroll-linked contact composition');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  assert.equal(await page.locator('.connection-sculpture').evaluate(el=>getComputedStyle(el).translate),'0px');
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
  await page.close();

  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const touch=await context.newPage();await touch.goto(base);await touch.locator('#featured').scrollIntoViewIfNeeded();
  const rail=touch.locator('.featured-track'),box=await rail.boundingBox();
  const session=await context.newCDPSession(touch);
  const y=Math.min(650,Math.max(150,box.y+box.height*.6));
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:330,y}]});
  for(let i=1;i<=12;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:330-i*22,y}]});await touch.waitForTimeout(16);}
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(800);
  assert.ok(await rail.evaluate(el=>el.scrollLeft)>200,'Native touch swipe did not move product rail');
  const scrollBefore=await touch.evaluate(()=>scrollY);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:180,y:640}]});
  for(let i=1;i<=10;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:180,y:640-i*25}]});await touch.waitForTimeout(16);}
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(500);
  assert.ok(await touch.evaluate(()=>scrollY)>scrollBefore+100,'Vertical touch scrolling was trapped');
  await touch.goto(base+'/contact');
  await touch.locator('#contact-name').fill('QA Visitor');await touch.locator('#contact-email').fill('qa@example.com');await touch.locator('#contact-phone').fill('0000000000');await touch.locator('#contact-message').fill('Local QA preview.');
  await touch.getByRole('button',{name:'Submit',exact:true}).tap();assert.equal(await touch.locator('#contact-phone').getAttribute('aria-invalid'),'true');
  await touch.locator('#contact-phone').fill('9000000000');await touch.getByRole('button',{name:'Submit',exact:true}).tap();await touch.waitForTimeout(1100);
  const status=await touch.getByRole('status').boundingBox();assert.ok(status.y>=84&&status.y+status.height<=844,'Completion not automatically visible on mobile');
  await touch.screenshot({path:'qa/three-enhancements/screens/touch-completion.png'});
  await context.close();
  await writeFile('qa/three-enhancements/interaction-results.json',JSON.stringify({hover:'preserved',cardColors:'preserved',productNavigation:'passed',contactPointerAndScroll:'passed',liveReducedMotion:'passed',nativeSwipe:'passed',verticalTouchScroll:'passed',obviousPhoneValidation:'passed',completionVisibility:'passed'},null,2));
  console.log('Native swipe, vertical touch scroll, hover, preserved colours, navigation, contact motion and completion visibility passed.');
}finally{await browser.close();}
