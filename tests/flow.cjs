const {chromium}=require('playwright');
const fs=require('fs'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||undefined,headless:true});
 const results=[];
 for(const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:320,height:740}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8123');await page.waitForTimeout(1000);
  assert.equal(await page.locator('#opening').isVisible(),false);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow '+viewport.width);
  await page.locator('[data-view="reasoning"]').click();
  await page.locator('[data-deck="expand"]').click();assert(await page.locator('#deckList').isVisible());
  await page.locator('[data-choose="r4"]').click();
  assert((await page.locator('.deck-status').textContent()).includes('04'));
  await page.locator('[data-deck="next"]').click();assert((await page.locator('.deck-status').textContent()).includes('05'));
  await page.locator('.front').focus();await page.keyboard.press('ArrowLeft');assert((await page.locator('.deck-status').textContent()).includes('04'));
  // Unlock through the authoritative search and combination interfaces, not by granting terms.
  await page.evaluate(()=>{
   for(const q of ['A/A','A/R','F/R','F/H','C/R','E/R','E/B','I/B','G/S','H/T','G/B','H/S','D/T','D/G','J/R','C/P']){cmd.value=q;run();}
   for(const key of Object.keys(C)){if(key.split('|').every(x=>st.items.has(x))){st.sel=key.split('|');combine();}}
  });
  const counts=await page.evaluate(()=>({seen:st.seen.size,comb:st.comb.size,ready:RS.every(ready)}));assert(counts.ready,JSON.stringify(counts));assert.equal(counts.comb,8);
  await page.locator('[data-deck="expand"]').click();await page.locator('[data-choose="r1"]').click();
  await page.selectOption('#r1_0','儿童哭声');await page.selectOption('#r1_1','儿童哭声');await page.locator('button[onclick="submitR(\'r1\')"]').click();
  assert.equal(await page.locator('#r1_0').inputValue(),'儿童哭声');assert(await page.locator('.feedback').isVisible());assert.equal(await page.evaluate(()=>st.rest.size),0);
  await page.evaluate(()=>{for(const r of RS){if(Number(r.id.slice(1))<10){document.querySelector('[data-deck="expand"]').click();document.querySelector('[data-choose="'+r.id+'"]').click();}r.a.forEach((v,i)=>document.getElementById(r.id+'_'+i).value=v);submitR(r.id);}});
  assert.equal(await page.evaluate(()=>st.rest.size),10);assert.equal(await page.locator('#caseTimeline li').count(),10);
  const before=await page.evaluate(()=>{saveGame();return JSON.parse(localStorage.getItem(SAVE_KEY));});
  assert.equal(before.version,1);assert.equal(before.rest.length,10);
  await page.reload();await page.locator('#continueGame').click();assert.equal(await page.evaluate(()=>st.rest.size),10);assert.equal(await page.locator('#opening').isVisible(),false);
  await page.locator('[data-view="reasoning"]').click();await page.getByRole('button',{name:'生成最终案件报告'}).click();await page.waitForURL('**/ending.html');assert.equal(await page.evaluate(()=>localStorage.getItem('lost_memory_complete')),'1');
  assert.deepEqual(errors,[]);
  results.push({viewport,counts,complete:true,errors});await context.close();
 }
 fs.writeFileSync(__dirname+'/test-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
