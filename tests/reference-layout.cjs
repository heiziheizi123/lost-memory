const {chromium}=require('playwright');
const assert=require('assert');
(async()=>{
 const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||undefined,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:768,height:1024},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8123');await page.waitForTimeout(1000);
  await page.locator('[data-folder=people]').click();
  assert.equal(await page.locator('.folder-tabs [aria-current=page]').count(),1);
  assert.equal(await page.locator('.folder-tabs [aria-current=page]').getAttribute('data-folder'),'people');
  await page.locator('.keycap-nav [data-view=evidence]').click();
  assert.equal(await page.locator('.folder-tabs [aria-current=page]').count(),1);
  assert.equal(await page.locator('.folder-tabs [aria-current=page]').getAttribute('data-folder'),'evidence');
  await page.locator('[data-folder=archive]').click();
  await page.setViewportSize({width:390,height:640});
  await page.getByRole('button',{name:'案件推演',exact:true}).click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'reasoning');
  const cdp=await page.context().newCDPSession(page);
  await page.locator('.front').scrollIntoViewIfNeeded();
  const box=await page.locator('.front').boundingBox();const x=box.x+box.width/2,y=Math.min(box.y+box.height/2,650);
  const before=await page.evaluate(()=>scrollY),selected=await page.locator('.deck-status').textContent();
  assert(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),'touch-scroll scenario needs content taller than the viewport');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let dy=10;dy<=110;dy+=10){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-dy}]});await page.waitForTimeout(25);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350);
  assert.equal(await page.locator('.dragging').count(),0,'vertical touch should not leave dragging state');
  assert.equal(await page.locator('.deck-status').textContent(),selected,'vertical scrolling must not select another card');
  assert(await page.evaluate(prior=>scrollY>prior,before),'vertical touch must allow page scrolling');
  await page.locator('.front').scrollIntoViewIfNeeded();const b=await page.locator('.front').boundingBox();
  await page.mouse.move(b.x+b.width*.6,b.y+b.height*.5);await page.mouse.down();await page.mouse.move(b.x+b.width*.6+35,b.y+b.height*.5,{steps:4});
  assert.equal(await page.locator('.dragging').count(),1);
  await page.evaluate(()=>visualViewport.dispatchEvent(new Event('resize')));await page.mouse.up();
  assert.equal(await page.locator('.dragging').count(),0,'visual viewport resize must safely cancel dragging');
  await page.setViewportSize({width:768,height:1024});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('.sela-expression-tile').isVisible(),false,'desktop/tablet should use the large live face');
  // Exercise the real incorrect-answer feedback, including its live large portrait.
  await page.evaluate(()=>{for(const q of ['A/A','A/R','F/R']){cmd.value=q;run();}});
  await page.locator('#r1_0').selectOption('儿童哭声');await page.locator('#r1_1').selectOption('儿童哭声');
  await page.locator('button[onclick="submitR(\'r1\')"]').click();
  await page.waitForFunction(()=>document.querySelector('.reference-live-face').dataset.expression==='mismatch',{},{timeout:8000});
  assert.equal(await page.evaluate(()=>st.rest.size),0);assert(await page.locator('.feedback').isVisible());
  assert.deepEqual(errors,[]);console.log('Reference layout: unique active folder, legacy entry navigation, CDP vertical touch scrolling, visual viewport cancellation and real mismatch portrait passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
