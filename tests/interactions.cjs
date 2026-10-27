const {chromium}=require('playwright');
const assert=require('assert'),fs=require('fs');fs.mkdirSync(__dirname+'/artifacts',{recursive:true});
(async()=>{const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||undefined,headless:true});const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8123');assert(await page.locator('#opening').isVisible());await page.locator('#openingSkip').click();
await page.locator('[data-view=reasoning]').click();
async function swipe(distance,pause=0){const box=await page.locator('.front').boundingBox(),x=box.x+box.width*.6,y=box.y+box.height*.5;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+distance,y,{steps:8});if(pause)await page.waitForTimeout(pause);await page.mouse.up();await page.waitForTimeout(350);}
await swipe(-160);assert((await page.locator('.deck-status').textContent()).includes('02'),'distance swipe');
if(await page.locator('#deckList').isVisible())await page.getByRole('button',{name:'关闭推理卡片列表'}).click();
await swipe(-15,160);assert((await page.locator('.deck-status').textContent()).includes('02'),'short drag should restore');
await page.getByRole('button',{name:'关闭推理卡片列表'}).click();
const b=await page.locator('.front').boundingBox();await page.mouse.move(b.x+100,b.y+50);await page.mouse.down();await page.mouse.move(b.x+140,b.y+50,{steps:4});await page.locator('.deck-stage').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();await page.waitForTimeout(300);assert.equal(await page.locator('.dragging').count(),0);
await page.locator('[data-view=settings]').click();await page.locator('#muteMusic').check();await page.locator('#muteEffects').check();await page.locator('#reduceMotion').check();assert(await page.evaluate(()=>missingVideo.muted));
await page.reload();assert.equal(await page.locator('#opening').isVisible(),false);await page.locator('[data-view=settings]').click();assert(await page.locator('#reduceMotion').isChecked());
const hitTargets=await page.locator('#settingsPanel label,.keycap-nav button').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));assert(hitTargets.every(e=>e.w>=44&&e.h>=44));
// A version-1 legacy fixture exercises the actual term migration and transcript normalization.
await page.evaluate(()=>localStorage.setItem(SAVE_KEY,JSON.stringify({version:1,p:['A','B','C'],l:['R','A'],t:['事故后存活','现场封锁'],seen:['A/R'],items:['事故现场照片'],sel:[],rest:['r1'],comb:[],output:'<div>六岁 / 6岁</div>'})));
await page.reload();await page.locator('#continueGame').click();assert.deepEqual(await page.evaluate(()=>[...st.t]),['事故后仍有哭声','外围未封闭']);assert.equal(await page.locator('#out').textContent(),'三岁 / 3岁SELA：存档读取完成。调查状态已恢复。');
await page.setViewportSize({width:844,height:390});await page.setViewportSize({width:320,height:740});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await page.locator('.dragging').count(),0);
await page.evaluate(()=>localStorage.removeItem(SAVE_KEY));await page.reload();await page.locator('[data-view=reasoning]').click();await page.screenshot({path:__dirname+'/artifacts/mobile-preview.png',fullPage:true});
await page.setViewportSize({width:1440,height:1000});await page.locator('[data-view=archive]').click();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:__dirname+'/artifacts/desktop-preview.png',fullPage:true});assert.deepEqual(errors,[]);console.log(JSON.stringify({dragDistance:true,shortDragRestores:true,pointerCancel:true,preferences:true,legacySave:true,orientation:true,hitTargets,errors},null,2));await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
