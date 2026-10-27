/* Presentation state is deliberately separate from the original investigation state. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let prefs = { muteMusic: false, muteEffects: false, skipOpening: false, reduceMotion: false };
  try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem('lost_memory_ui_v1') || '{}') }; } catch {}
  let current = 'r1', expanded = false, drag = null, frame = 0, stateTimer, idleTimer, openingTimer;
  let shownAt = 0, priority = -1, pending = null, pendingTimer;
  const assistant = $('selaAssistant');
  const faces = {
    smile: ['M119 104v14 M181 104v14', 'M140 129l10 8 10-8'],
    thinking: ['M114 111h18 M170 111h18', 'M142 134h16'],
    discovery: ['M122 111a6 6 0 1 0 .1 0 M178 111a6 6 0 1 0 .1 0', 'M145 132a5 6 0 1 0 .1 0'],
    question: ['M115 105h17 M174 116h16', 'M140 135q10-9 20 0'],
    warning: ['M114 102l20 10 M186 102l-20 10', 'M139 134h22'],
    success: ['M114 115q10-15 20 0 M166 115q10-15 20 0', 'M137 130q13 19 26 0'],
    mismatch: ['M114 108h19 M177 105v15', 'M136 135q7-8 14 0t14 0'],
    waiting: ['M114 114h19 M167 114h19', 'M142 134h16'],
    reading: ['M112 106h25 M163 106h25 M112 115h25 M163 115h25', 'M142 134h16'],
    complete: ['M114 114q10-12 20 0 M166 114q10-12 20 0', 'M138 130q12 12 24 0']
  };
  const labels = {smile:'已连接',thinking:'正在分析',discovery:'发现关联',question:'需要核对',warning:'请注意',success:'推演成立',mismatch:'推演失配',waiting:'等待调查',reading:'正在读取',complete:'归档完成'};
  const priorities = {warning:7,success:6,mismatch:5,discovery:4,thinking:3,reading:3,question:2,complete:2,smile:1,waiting:0};
  $('selaPortrait').innerHTML = `<svg viewBox="0 0 300 285" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#b8ab91" stroke-width="3" class="antenna"><path d="M144 70L124 28m32 42 25-42"/><circle cx="124" cy="28" r="3"/><circle cx="181" cy="28" r="3"/></g><path d="M92 189l-35 31-14 65h214l-14-65-35-31z" fill="#5a5c4b" stroke="#171b17" stroke-width="3"/><path d="M120 183l30 65 30-65M96 191l-10 39 27-3-8 15 45 43 45-43-8-15 27 3-10-39" fill="#777763" stroke="#27241f" stroke-width="3"/><path d="M137 188h26l-6 18 9 57-16 17-16-17 9-57z" fill="#8d2926" stroke="#27241f" stroke-width="2"/><rect class="crt" x="75" y="65" width="150" height="113" rx="16" fill="#d8cdb5" stroke="#27241f" stroke-width="4"/><rect x="91" y="80" width="117" height="79" rx="15" fill="#22291f" stroke="#8a876f" stroke-width="3"/><g class="screen-lines" stroke="#c7cfad" stroke-width="4" stroke-linecap="round" fill="none"><path id="faceEyes"/><path id="faceMouth"/></g><g stroke="#8d2926" stroke-width="3"><path d="M193 168h11m6 0h5"/></g><path d="M67 254l37 11m128-11-37 11M88 277l14-20m110 20-14-20" stroke="#27241f" stroke-width="3"/><text id="faceSymbol" x="232" y="92" fill="#b99455" font-size="30" font-family="serif"/></svg>`;
  function paintState(name, message) {
    assistant.dataset.state = name;
    $('faceEyes').setAttribute('d', faces[name][0]); $('faceMouth').setAttribute('d', faces[name][1]);
    $('faceSymbol').textContent = ({discovery:'✧',question:'?',warning:'!',success:'✓',mismatch:'≠',complete:'✓'})[name] || '';
    $('selaStatus').textContent = 'SELA：' + labels[name];
    if (message) $('selaMessage').textContent = message;
    priority = priorities[name]; shownAt = Date.now();
    clearTimeout(stateTimer);
    if (name !== 'smile' && name !== 'waiting') stateTimer = setTimeout(() => { priority = -1; setState('smile', '核对记录，继续调查。'); }, 4200);
  }
  function setState(name, message, immediate = false) {
    const elapsed = Date.now() - shownAt;
    if (!immediate && (elapsed < 2000 || priorities[name] < priority)) {
      if (!pending || priorities[name] >= priorities[pending.name]) pending = {name,message};
      clearTimeout(pendingTimer);
      pendingTimer = setTimeout(() => { const next = pending; pending = null; priority = -1; if (next) setState(next.name,next.message); }, Math.max(2000-elapsed, priority > priorities[name] ? 4200-elapsed : 0, 0));
      return;
    }
    paintState(name,message);
  }
  const clean = html => { const el = document.createElement('div'); el.innerHTML=html; return el.textContent; };
  const originalSela = sela;
  for (const [name, readSet] of [['item',()=>st.items],['term',()=>st.t],['up',()=>st.p],['ul',()=>st.l]]) {
    const original = ({item,term,up,ul})[name];
    const wrapped = function(value,...args) { const known=readSet().has(value); const result=original(value,...args); if(!known)setState('discovery',name==='item'?'新资料已归档：'+value:name==='term'?'发现词条：'+value:'已建立新的检索入口。'); return result; };
    if(name==='item')item=wrapped;else if(name==='term')term=wrapped;else if(name==='up')up=wrapped;else ul=wrapped;
  }
  sela = function(message) {
    originalSela(message);
    const text = clean(message);
    const name = /失败|无法解析|无法读取/.test(text) ? 'warning' : /不足|未登记|未检测|未形成|尚未/.test(text) ? 'question' : /读取完成|状态已恢复/.test(text) ? 'complete' : /写入完成/.test(text) ? 'complete' : /分析完成|新人物|新地点|新.*记录|已开放|关联/.test(text) ? 'discovery' : /无法形成|矛盾/.test(text) ? 'mismatch' : /读取|载入/.test(text) ? 'reading' : 'smile';
    setState(name,text);
  };
  function updateProgress() {
    $('caseProgress').innerHTML = `<span>推演 ${st.rest.size} / ${RS.length}</span><span>记录 ${st.seen.size} / ${Object.keys(R).length}</span>`;
    $('caseTimeline').replaceChildren();
    RS.filter(r => st.rest.has(r.id)).forEach(r => { const li=document.createElement('li'); li.textContent=r.end; $('caseTimeline').append(li); });
    if (!st.rest.size) { const li=document.createElement('li'); li.textContent='完成推演后，将核实的结论按顺序归档。'; $('caseTimeline').append(li); }
  }
  const originalRender = render;
  render = function() {
    originalRender();
    // Native buttons provide the same actions to touch, mouse and keyboard users.
    for (const id of ['people','places','items','terms']) {
      $(id).querySelectorAll('.chip').forEach(chip => {
        const button=document.createElement('button'); button.className=chip.className; button.innerHTML=chip.innerHTML;
        if (id==='items') { const value=chip.textContent; button.onclick=()=>pick(value); button.setAttribute('aria-pressed',String(st.sel.includes(value))); }
        else if(id==='people'||id==='places') { const code=chip.firstChild.textContent; button.onclick=()=> { const parts=$('cmd').value.split('/'); $('cmd').value=id==='people'?code+'/'+(parts[1]||''):(parts[0]||'')+'/'+code; $('cmd').focus(); }; button.setAttribute('aria-label',(id==='people'?'选择人物 ':'选择地点 ')+chip.textContent); }
        if(id==='terms') return; // Discovered terms are readable records, not controls.
        chip.replaceWith(button);
      });
    }
    updateProgress();
  };
  // Retain selected terms across re-rendering, including after a failed submission.
  let choices = {};
  function rememberChoices() { $('restoreBody').querySelectorAll('select').forEach(select => choices[select.id]=select.value); }
  const originalRenderRestore = renderRestore;
  renderRestore = function() {
    rememberChoices(); originalRenderRestore();
    $('restoreBody').querySelectorAll('select').forEach(select => { select.value=choices[select.id]||''; select.setAttribute('aria-label',RS.find(r=>select.id.startsWith(r.id+'_')).n+'，第 '+(Number(select.id.split('_')[1])+1)+' 个空位'); });
    $('restoreBody').querySelectorAll('.restore-card').forEach((card,index) => {
      if(index<9) card.hidden=RS[index].id!==current;
      else if(index===9) card.hidden=false;
    });
    drawDeck(); updateProgress();
  };
  $('restoreBody').addEventListener('change',event => {
    if(event.target.tagName==='SELECT') {
      choices[event.target.id]=event.target.value; event.target.parentElement.classList.remove('invalid');
      document.querySelectorAll('.term').forEach(term=>term.classList.toggle('related',term.textContent===event.target.value));
      setState('thinking','正在核对该空位与已发现词条。');
    }
  });
  const originalSubmit=submitR;
  submitR=function(id) {
    const r=RS.find(r=>r.id===id);
    if(!ready(r)) return originalSubmit(id);
    rememberChoices();
    const errors=r.a.map((answer,i)=>({answer,i,value:$(id+'_'+i).value})).filter(x=>x.value!==x.answer);
    $('restoreBody').querySelectorAll('.feedback').forEach(el=>el.remove());
    if(errors.length) {
      for(const error of errors) $(id+'_'+error.i).parentElement.classList.add('invalid');
      const first=errors[0];
      const hintText = {
        r1:'核对家属所述座位，以及两份独立口述中的儿童声音。',r2:'核对声音出现在撞击之前还是之后。',r3:'打开车门与离开车厢是不同事实，不能据此认定独自走远。',r4:'分别核对现场边界、救援优先事项和接走者的身份核验。',r5:'区分衣着特征与孩子的移动方式。',r6:'分别核对登记情况、目的地方向，以及离店和发车的时间衔接。',r7:'目击侧脸和纸本缩写均不能单独确认身份。',r8:'按搜索范围、车辆里程和确认失踪的时间顺序核对。',r9:'区分车辆类型和到达南环后发生的上车动作。',r10:'依次核对事故后的声音、身份核验、离开方式、出租车方向与最后出现的车辆。'
      }[id];
      const message=`第 ${first.i+1} 个空位${first.value?'的词条“'+first.value+'”与本句所需事实不符':'尚未选择词条'}。${hintText}`;
      const feedback=document.createElement('p'); feedback.className='feedback'; feedback.setAttribute('role','status'); feedback.textContent=message;
      $(id+'_'+first.i).closest('.restore-card').append(feedback);
      sela(message); setState(first.value?'mismatch':'question',message); $(id+'_'+first.i).focus();
      return;
    }
    originalSubmit(id);
    setState('success',r.end); playTone();
    const card=$('restoreBody').querySelectorAll('.restore-card')[RS.indexOf(r)];
    const stamp=document.createElement('span'); stamp.className='stamp animate'; stamp.textContent='推演成立'; card.append(stamp);
  };
  function drawDeck(settle=false) {
    if(drag) cancelDrag();
    const index=RS.findIndex(r=>r.id===current);
    $('reasoningDeck').innerHTML=`<div class="deck-shell"><p class="small">推理 1–9 · 点击卡堆展开；左右拖动或使用下方按钮切换。</p><div class="deck-stage" aria-label="推理卡堆"></div><div class="deck-controls"><button data-deck="prev" aria-label="上一张推理卡">← 上一张</button><button data-deck="expand" aria-expanded="${expanded}" aria-controls="deckList">${expanded?'收起卡片':'展开卡片'}</button><button data-deck="next" aria-label="下一张推理卡">下一张 →</button></div><div id="deckList" class="deck-list ${expanded?'open':''}" ${expanded?'':'hidden'} aria-label="选择推理卡"></div><p class="deck-status" role="status" aria-live="polite">当前：${RS[index].n}</p></div>`;
    const stage=$('reasoningDeck').querySelector('.deck-stage');
    for(let depth=8;depth>=0;depth--) {
      const r=RS[(index+depth)%9], button=document.createElement('button');
      button.className='deck-card'+(depth===0?' front':'')+(settle?' settling':'');button.style.setProperty('--depth',depth);
      button.dataset.id=r.id;button.dataset.depth=depth;button.tabIndex=depth===0?0:-1;button.setAttribute('aria-label',r.n+(depth===0?'，当前选中':''));
      button.innerHTML=`<span>REASONING / ${String(RS.indexOf(r)+1).padStart(2,'0')}</span><strong>${r.n.split('｜')[1]}</strong><small>${st.rest.has(r.id)?'已核实':ready(r)?'资料齐全 · 等待推演':'资料尚未齐全'}</small>`;
      button.setAttribute('aria-hidden',depth===0?'false':'true');stage.append(button);
    }
    const dismiss=document.createElement('button');dismiss.className='deck-dismiss';dismiss.dataset.deck='close';dismiss.textContent='关闭 ×';dismiss.setAttribute('aria-label','关闭推理卡片列表');$('deckList').append(dismiss);
    RS.slice(0,9).forEach(r=>{const button=document.createElement('button');button.textContent=r.n;button.dataset.choose=r.id;button.setAttribute('aria-pressed',String(r.id===current));$('deckList').append(button);});
    stage.addEventListener('pointerdown',startDrag);
    stage.addEventListener('pointermove',moveDrag);
    stage.addEventListener('pointerup',endDrag);
    stage.addEventListener('pointercancel',cancelDrag);
    stage.addEventListener('lostpointercapture',()=>{if(drag)cancelDrag();});
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selectCard((index+(e.key==='ArrowRight'?1:8))%9,true);}else if(e.key==='Escape')closeDeck();});
    stage.querySelector('.front').addEventListener('click',()=>{if(!stage.dataset.suppress) {expanded=!expanded;drawDeck();$('reasoningDeck').querySelector('[data-deck=expand]').focus();}});
  }
  function selectCard(index,focus=false) {
    current=RS[index].id;rememberChoices();expanded=false;renderRestore();
    $('reasoningDeck').querySelectorAll('.deck-card').forEach(el=>el.classList.add('settling'));
    setState('discovery',`已选中${RS[index].n}。下方显示对应推演。`);
    if(focus)$('reasoningDeck').querySelector('.front').focus({preventScroll:true});
  }
  function closeDeck(){expanded=false;drawDeck();$('reasoningDeck').querySelector('[data-deck=expand]').focus({preventScroll:true});}
  $('reasoningDeck').addEventListener('click',e=>{
    const choose=e.target.closest('[data-choose]');if(choose)return selectCard(RS.findIndex(r=>r.id===choose.dataset.choose),true);
    const action=e.target.closest('[data-deck]')?.dataset.deck;if(!action)return;
    if(action==='close')return closeDeck();
    if(action==='expand'){expanded=!expanded;drawDeck();(expanded?$('deckList').querySelector('[aria-pressed=true]'):$('reasoningDeck').querySelector('[data-deck=expand]')).focus({preventScroll:true});}
    else selectCard((RS.findIndex(r=>r.id===current)+(action==='next'?1:8))%9,true);
  });
  $('reasoningDeck').addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded){e.preventDefault();closeDeck();}});
  function startDrag(e) {
    if(e.button!==0||!e.isPrimary)return;
    const card=e.target.closest('.front');if(!card)return;
    drag={id:e.pointerId,card,stage:e.currentTarget,x:e.clientX,y:e.clientY,lastX:e.clientX,lastTime:e.timeStamp,dx:0,v:0,locked:false,baseTransform:getComputedStyle(card).transform};
  }
  function moveDrag(e) {
    if(!drag||e.pointerId!==drag.id)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.locked) {
      if(Math.max(Math.abs(dx),Math.abs(dy))<8)return;
      if(Math.abs(dx)<=Math.abs(dy)*1.2){cancelDrag();return;}
      drag.locked=true;expanded=true;$('deckList').hidden=false;$('deckList').classList.add('open');
      const expand=$('reasoningDeck').querySelector('[data-deck=expand]');expand.setAttribute('aria-expanded','true');expand.textContent='收起卡片';
      drag.card.setPointerCapture(e.pointerId);drag.card.classList.add('dragging');setState('thinking','正在整理推理卡片。');
    }
    const dt=e.timeStamp-drag.lastTime;if(dt>0)drag.v=(e.clientX-drag.lastX)/dt;
    drag.lastX=e.clientX;drag.lastTime=e.timeStamp;drag.dx=dx;
    if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(drag)drag.card.style.transform=`translateX(${drag.dx}px) ${drag.baseTransform==='none'?'':drag.baseTransform} rotate(${drag.dx/28}deg)`;});
  }
  function endDrag(e) {
    if(!drag||e.pointerId!==drag.id)return;
    const d=drag;
    if(!d.locked){drag=null;return;}
    const dx=e.clientX-d.x;
    const velocity=e.timeStamp-d.lastTime<100?d.v:0;
    const commit=Math.abs(dx)>=d.card.offsetWidth*.3||(Math.abs(dx)>20&&Math.abs(velocity)>=.45);
    drag=null;cancelAnimationFrame(frame);frame=0;
    d.stage.dataset.suppress='true';setTimeout(()=>delete d.stage.dataset.suppress,0);
    if(d.card.hasPointerCapture(e.pointerId))d.card.releasePointerCapture(e.pointerId);
    if(commit)selectCard((RS.findIndex(r=>r.id===current)+(dx<0?1:8))%9,true);
    else {d.card.classList.remove('dragging');d.card.classList.add('returning');d.card.style.transform='';setState('question','拖动未达到切换阈值，卡片已归位。');}
  }
  function cancelDrag() {
    if(!drag)return;const d=drag;drag=null;cancelAnimationFrame(frame);frame=0;
    d.card.classList.remove('dragging');d.card.classList.add('returning');d.card.style.transform='';
    if(d.card.hasPointerCapture(d.id))d.card.releasePointerCapture(d.id);
  }
  for(const event of ['blur','resize','orientationchange','pagehide'])window.addEventListener(event,cancelDrag);
  // iOS may resize only the visual viewport when its software keyboard opens.
  window.visualViewport?.addEventListener('resize',cancelDrag);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDrag();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{if(entries.some(e=>!e.isIntersecting))cancelDrag();}).observe($('reasoningDeck'));
  function showView(view,focus=true) {
    cancelDrag();document.body.dataset.view=view;$('settingsPanel').hidden=view!=='settings';
    document.querySelectorAll('[data-view]').forEach(b=>{if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    const target=view==='settings'?$('settingsPanel'):view==='reasoning'?$('restore'):view==='evidence'?$('items').closest('.panel'):$('workspace');
    if(view==='reasoning')$('restore').style.display='block';
    if(view==='evidence')$('box').style.display='block';
    if(focus){target.scrollIntoView({block:'start',behavior:'auto'});target.tabIndex=-1;target.focus({preventScroll:true});}
  }
  document.querySelectorAll('.keycap-nav button').forEach(button=>{
    const release=(animate=true)=>{delete button.dataset.pressed;button.classList.remove('released');if(animate){void button.offsetWidth;button.classList.add('released');}};
    button.addEventListener('pointerdown',e=>{if(e.button!==0)return;button.dataset.pressed='true';button.setPointerCapture(e.pointerId);});
    button.addEventListener('pointerup',()=>release());button.addEventListener('pointercancel',()=>release(false));button.addEventListener('lostpointercapture',()=>{if(button.dataset.pressed)release(false);});
    button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')button.dataset.pressed='true';});button.addEventListener('keyup',()=>release());button.addEventListener('blur',()=>release(false));
    button.onclick=()=>showView(button.dataset.view);
  });
  $('assistantToggle').onclick=()=>{const collapsed=assistant.classList.toggle('collapsed');$('assistantToggle').setAttribute('aria-expanded',String(!collapsed));$('assistantToggle').lastElementChild.textContent=collapsed?'+':'−';};
  const mobile=matchMedia('(max-width:767px)');
  const slot=document.createElement('div');slot.className='assistant-slot';$('workspace').prepend(slot);
  function placeAssistant(){if(mobile.matches)slot.append(assistant);else document.querySelector('.side').prepend(assistant);}
  mobile.addEventListener('change',placeAssistant);placeAssistant();
  function applyPrefs(){document.body.classList.toggle('reduced-motion',prefs.reduceMotion);$('missingVideo').muted=prefs.muteMusic;$('openingMute').textContent=prefs.muteMusic?'取消静音':'静音';}
  function savePrefs(){try{localStorage.setItem('lost_memory_ui_v1',JSON.stringify(prefs));}catch{}applyPrefs();}
  for(const name of Object.keys(prefs)){if(!$(name))continue;$(name).checked=prefs[name];$(name).onchange=()=>{prefs[name]=$(name).checked;savePrefs();};}
  let audioContext;
  function playTone(){if(prefs.muteEffects)return;try{audioContext ||= new (window.AudioContext||window.webkitAudioContext)();const osc=audioContext.createOscillator(),gain=audioContext.createGain();gain.gain.setValueAtTime(.035,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.15);osc.frequency.value=440;osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+.16);}catch{}}
  $('saveControl').onclick=saveGame;$('loadControl').onclick=()=>{cancelDrag();choices={};loadGame();};$('resetControl').onclick=newGame;
  // Keep original save controls for compatibility, but move the visible controls into Settings.
  window.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.panel .row button').forEach(b=>{if(['保存进度','读取存档','重新开始'].includes(b.textContent))b.hidden=true;});
  });
  const originalLoad=loadGame;
  loadGame=function(){cancelDrag();choices={};$('restoreBody').replaceChildren();originalLoad();updateProgress();};
  function closeOpening(){clearTimeout(openingTimer);$('opening').hidden=true;document.querySelector('.wrap').inert=false;document.querySelector('.keycap-nav').inert=false;document.querySelector('.case-header').inert=false;$('workspace').focus({preventScroll:true});try{sessionStorage.setItem('lost_memory_opened','1');}catch{}}
  function startOpening(){
    let opened=false;try{opened=!!sessionStorage.getItem('lost_memory_opened');}catch{}
    if(prefs.skipOpening||opened)return;
    $('opening').hidden=false;document.querySelector('.wrap').inert=true;document.querySelector('.keycap-nav').inert=true;document.querySelector('.case-header').inert=true;
    $('openingSkip').focus();openingTimer=setTimeout(closeOpening,(prefs.reduceMotion||systemMotion.matches)?800:10000);
  }
  $('openingSkip').onclick=closeOpening;$('openingMute').onclick=()=>{prefs.muteMusic=!prefs.muteMusic;$('muteMusic').checked=prefs.muteMusic;savePrefs();};
  function showWelcome(){
    $('welcome').hidden=false;document.querySelector('.wrap').inert=true;document.querySelector('.keycap-nav').inert=true;document.querySelector('.case-header').inert=true;$('continueGame').focus();
  }
  function closeWelcome(){ $('welcome').hidden=true;document.querySelector('.wrap').inert=false;document.querySelector('.keycap-nav').inert=false;document.querySelector('.case-header').inert=false;$('workspace').focus({preventScroll:true}); }
  $('continueGame').onclick=()=>{try{const d=JSON.parse(localStorage.getItem(SAVE_KEY));if(!d||d.version!==1)throw Error();loadGame();closeWelcome();}catch{$('welcomeError').textContent='存档无法解析，请在设置中检查或重新开始。';}};
  $('enterCurrent').onclick=closeWelcome;
  function resetIdle(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>setState('waiting','我在这里。可以回看已登记的记录，或请求提示。'),45000);}
  for(const event of ['pointerdown','keydown'])document.addEventListener(event,resetIdle,{passive:true});
  applyPrefs();paintState('smile','核对已有记录，从人物与地点的关联开始。');render();renderRestore();showView('archive',false);resetIdle();
  try{if(localStorage.getItem(SAVE_KEY))showWelcome();else startOpening();}catch{startOpening();}
})();
