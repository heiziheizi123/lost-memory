const {chromium}=require('playwright');const assert=require('assert');
(async()=>{const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||undefined,headless:true});try{
 for(const width of [320,360,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8123');await page.waitForTimeout(1000);
  assert.equal(await page.locator('.folder-tabs').isVisible(),false,'one navigation row on phones');
  assert.deepEqual(await page.locator('.nav-label-mobile').allTextContents(),['档案','证据','还原','设置']);
  assert.equal(await page.locator('#assistantToggle').getAttribute('aria-expanded'),'false');
  await page.locator('#assistantToggle').click();assert(await page.locator('#assistantMessage').isVisible());await page.locator('#assistantToggle').click();
  await page.locator('[data-view=reasoning]').click();assert(await page.locator('.front').isVisible());
  assert.equal(await page.locator('.selected-illustration').isVisible(),false,'avoid duplicate decorative photo');
  assert.equal(await page.locator('.final-deduction').isVisible(),false,'locked final deduction stays out of the reading flow');
  const before=await page.locator('#caseTimeline').textContent();assert.equal(await page.locator('#caseTimeline').isVisible(),false);
  await page.locator('.mobile-timeline-toggle').click();assert(await page.locator('#caseTimeline').isVisible());assert.equal(await page.locator('#caseTimeline').textContent(),before);await page.locator('.mobile-timeline-toggle').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const sizes=await page.locator('.keycap-nav button,.deck-controls button').evaluateAll(elements=>elements.map(e=>e.getBoundingClientRect()).map(r=>[r.width,r.height]));assert(sizes.every(([w,h])=>w>=44&&h>=44));
  await page.locator('[data-deck=expand]').click();await page.getByRole('button',{name:'关闭推理卡片列表'}).click();assert.equal(await page.locator('#deckList').isVisible(),false);assert.equal(await page.locator('[data-deck=expand]').getAttribute('aria-expanded'),'false');
  await page.locator('[data-deck=expand]').click();await page.locator('[data-choose=r4]').click();assert((await page.locator('.deck-status').textContent()).includes('04'));
  await page.setViewportSize({width:1440,height:1000});assert(await page.locator('.folder-tabs').isVisible());assert(await page.locator('.sela-reference-figure').isVisible());assert(await page.locator('#caseTimeline').isVisible());
  assert.deepEqual(errors,[]);await page.close();console.log('Mobile reading layout passed at '+width+'px and desktop transition.');
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
