const {chromium}=require('playwright');const assert=require('assert');
(async()=>{const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||undefined,headless:true});try{
 for(const viewport of [{width:320,height:740},{width:390,height:844},{width:768,height:1024},{width:1440,height:1000}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<1200,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8123');await page.waitForTimeout(1000);
  const archiveKey=page.locator('.keycap-nav [data-view=archive]'),keyBox=await archiveKey.boundingBox();
  await page.mouse.move(keyBox.x+keyBox.width/2,keyBox.y+keyBox.height/2);await page.mouse.down();assert(await archiveKey.locator('.key-pressed').isVisible());
  await archiveKey.dispatchEvent('pointercancel',{pointerId:1});assert.equal(await archiveKey.locator('.key-pressed').isVisible(),false);await page.mouse.up();
  await archiveKey.focus();await page.keyboard.down('Space');assert(await archiveKey.locator('.key-pressed').isVisible());await page.keyboard.up('Space');assert.equal(await archiveKey.locator('.key-pressed').isVisible(),false);
  for(const view of ['archive','evidence','reasoning','settings']){
   await page.locator('.keycap-nav [data-view='+view+']').click();
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const controls=page.locator('button:not(.deck-card),input,select');
   for(let i=0;i<await controls.count();i++){
    const target=controls.nth(i);if(!await target.isVisible())continue;
    await target.evaluate(e=>e.scrollIntoView({block:'center',inline:'nearest'}));
    const hit=await target.evaluate(e=>{const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;const top=document.elementFromPoint(x,y);return {ok:top===e||e.contains(top),label:e.getAttribute('aria-label')||e.textContent||e.id,top:top?.tagName};});
    assert(hit.ok,JSON.stringify({viewport,view,...hit}));
   }
  }
  await page.locator('[data-view=reasoning]').click();await page.locator('.front').scrollIntoViewIfNeeded();
  assert(await page.locator('.front>.material-surface[data-source-material=card]').count());
  await page.evaluate(()=>{window.materialRebuilds=0;new MutationObserver(()=>materialRebuilds++).observe(document.querySelector('.front>.material-surface'),{childList:true,subtree:true});window.frameDeltas=[];let last=performance.now();window.frameProbe=requestAnimationFrame(function tick(now){frameDeltas.push(now-last);last=now;window.frameProbe=requestAnimationFrame(tick);});});
  const b=await page.locator('.front').boundingBox(),x=b.x+b.width*.6,y=b.y+b.height*.5;
  await page.mouse.move(x,y);await page.mouse.down();
  for(let step=1;step<=12;step++){await page.mouse.move(x-step*5,y);await page.waitForTimeout(20);}
  assert.equal(await page.evaluate(()=>materialRebuilds),0,'dragging must not rebuild raster surfaces');
  await page.mouse.up();
  const timings=await page.evaluate(()=>{cancelAnimationFrame(frameProbe);const ds=frameDeltas.filter(d=>d>0).sort((a,b)=>a-b);return{frames:ds.length,medianMs:ds[Math.floor(ds.length*.5)],p95Ms:ds[Math.floor(ds.length*.95)]};});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({viewport,allViewControlsUnobstructed:true,dragMaterialRebuilds:0,frameTimingSample:timings}));await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
