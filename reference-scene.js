/* Reference-directed presentation. Investigation records and answers remain in index.html. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const atlas='assets/reference-atlas.webp';
  const desk=document.createElement('div');desk.className='desk-decoration';desk.setAttribute('aria-hidden','true');
  desk.innerHTML=`<svg viewBox="0 0 1145 180" focusable="false"><defs><clipPath id="deskObjects"><path d="M0 0h1145v150H940V120H620V48H0z"/></clipPath><linearGradient id="deskShade" x2="0" y2="1"><stop stop-color="#12150f" stop-opacity="0"/><stop offset="1" stop-color="#12150f"/></linearGradient></defs><image href="${atlas}" width="1586" height="992" clip-path="url(#deskObjects)"/><path d="M0 0h1145v180H0z" fill="url(#deskShade)"/></svg>`;
  document.body.prepend(desk);
  const crops={
    smile:[1189,677,100,106],thinking:[1308,677,100,106],discovery:[1447,677,100,106],
    question:[1189,811,100,105],warning:[1308,811,100,105],success:[1447,811,100,105],
    mismatch:[1308,811,100,105],waiting:[1189,677,100,106],reading:[1308,677,100,106],complete:[1447,811,100,105]
  };
  let spriteNumber=0;
  function sprite(name,rect,extra='',fit='xMidYMid slice') {
    const [x,y,w,h]=rect;
    const id='sourceSprite'+(++spriteNumber);
    return `<svg class="atlas-sprite ${extra}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${fit}" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><rect width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})"><image href="${atlas}" x="${-x}" y="${-y}" width="1586" height="992"/></g></svg>`;
  }
  document.body.classList.add('reference-scene');
  toggle=function(id){if(id==='restore')document.querySelector('.keycap-nav [data-view="reasoning"]').click();else if(id==='box')document.querySelector('.keycap-nav [data-view="evidence"]').click();};
  const header=document.querySelector('.case-header');
  header.firstElementChild.innerHTML='<div class="paper-label">A · 纸质案件档案</div><div class="brand-line"><span class="wordmark">CODE SELA</span><h1>车祸现场男孩失踪案</h1></div><p class="desk-motto">TRUTH LIVES IN DETAILS</p>';
  const nav=document.querySelector('.keycap-nav');
  const labels={archive:'案件档案',evidence:'证据',reasoning:'案件还原',settings:'设置'};
  const compactLabels={archive:'档案',evidence:'证据',reasoning:'还原',settings:'设置'};
  nav.querySelectorAll('button').forEach(b=>{
    b.setAttribute('aria-label',labels[b.dataset.view]);
    b.innerHTML=`<span class="nav-label-desktop">${labels[b.dataset.view]}</span><span class="nav-label-mobile" aria-hidden="true">${compactLabels[b.dataset.view]}</span>`;
  });
  const tabs=document.createElement('nav');tabs.className='folder-tabs';tabs.setAttribute('aria-label','卷宗分类');
  tabs.innerHTML=[['01','案发现场','archive'],['02','相关人员','people'],['03','物证调查','evidence'],['04','推理分析','reasoning']].map(([n,label,view])=>`<button data-folder="${view}"><span>${n}</span><strong>${label}</strong><i aria-hidden="true"></i></button>`).join('');
  document.querySelector('.wrap').prepend(tabs);
  const cmdPanel=$('cmd').closest('.panel');cmdPanel.classList.add('archive-content','search-paper');
  $('out').classList.add('archive-content');document.querySelector('.archive-heading').classList.add('archive-content');
  document.querySelectorAll('.side>.panel:not(.assistant)').forEach(el=>el.classList.add('evidence-content'));
  $('box').classList.add('evidence-content');
  const assistant=$('selaAssistant');
  $('selaPortrait').classList.add('original-line-portrait');
  const cutout=document.createElement('div');cutout.className='sela-reference-figure';cutout.setAttribute('aria-hidden','true');
  const portrait='assets/sela-restored-v2.webp';
  cutout.innerHTML='<svg viewBox="0 0 1024 1536" focusable="false"><image href="'+portrait+'" width="1024" height="1536"/></svg>';
  assistant.insertBefore(cutout,$('assistantMessage'));
  const face=document.createElement('div');face.className='sela-expression-tile';assistant.append(face);
  // Only phosphor strokes change; the glass, lighting and perspective remain one image.
  const expressions={
    smile:'M25 24v11M75 24v11M38 48q12 15 24 0',
    thinking:'M22 28h12M68 28h12M44 52h14',
    discovery:'M25 20v15M75 20v15M45 48q5 -5 10 0q5 6 0 11q-5 5 -10 0q-5 -6 0 -11',
    question:'M23 26l10 5M68 25l10 -5M40 52q10 -8 20 0',
    warning:'M20 23l13 8l-13 8M80 23l-13 8l13 8M42 55l8 -7l8 7',
    success:'M20 31q10 -14 20 0M60 31q10 -14 20 0M37 47q13 18 26 0'
  };
  function expressionMarkup(state){
    const core=({mismatch:'warning',waiting:'smile',reading:'thinking',complete:'success'})[state]||state;
    return '<path class="phosphor-expression" d="'+(expressions[core]||expressions.smile)+'" fill="none" stroke="#e6d7a4" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  const mainFace=document.createElementNS('http://www.w3.org/2000/svg','g');mainFace.classList.add('reference-live-face');
  mainFace.setAttribute('transform','matrix(3.25 .54 -.657 3.485 443 298)');cutout.querySelector('svg').append(mainFace);
  function refreshFace(){
    const state=assistant.dataset.state||'smile';
    mainFace.dataset.expression=state;mainFace.innerHTML=expressionMarkup(state);
    face.dataset.expression=state;
    face.innerHTML='<svg viewBox="300 0 700 710" aria-hidden="true" focusable="false"><image href="'+portrait+'" width="1024" height="1536"/><g transform="matrix(3.25 .54 -.657 3.485 443 298)">'+expressionMarkup(state)+'</g></svg>';
  }
  new MutationObserver(refreshFace).observe(assistant,{attributes:true,attributeFilter:['data-state']});refreshFace();
  const openingDesk=desk.cloneNode(true);openingDesk.className='opening-desk';openingDesk.innerHTML=openingDesk.innerHTML.replaceAll('deskObjects','openingDeskObjects').replaceAll('deskShade','openingDeskShade');$('opening').prepend(openingDesk);
  const openingPortrait=document.querySelector('.opening-portrait');
  const openingFigure=cutout.cloneNode(true);openingFigure.className='opening-source-figure';
  openingFigure.innerHTML=openingFigure.innerHTML.replaceAll('selaReferenceClip','openingReferenceClip').replaceAll('sourceScreenClip','openingScreenClip');
  openingPortrait.append(openingFigure);
  const message=$('assistantMessage');message.classList.add('assistant-note');
  const signature=document.createElement('span');signature.className='note-signature';signature.textContent='— SELA';message.append(signature);
  const intro=document.createElement('div');intro.className='reasoning-intro';intro.innerHTML='<span>CODE SELA<br>CASE RECONSTRUCTION</span><p>结合已有证据，依次梳理推理链条，还原事件的可能经过。</p>';
  $('restore').insertBefore(intro,$('reasoningDeck'));
  $('restore').querySelector('h2').textContent='案件还原';
  $('restore').querySelector('p.small').classList.add('reasoning-guidance');
  const illustration=document.createElement('figure');illustration.className='selected-illustration';illustration.innerHTML=sprite('road',[451,410,193,156])+'<figcaption>档案插图 · 事实以原始记录为准</figcaption>';
  $('restoreBody').after(illustration);
  function markFinalDeduction(){
    const card=$('restoreBody').querySelectorAll('.restore-card')[9];
    if(card){card.classList.add('final-deduction');card.classList.toggle('is-locked',!ready(RS[9])&&!st.rest.has('r10'));}
  }
  new MutationObserver(markFinalDeduction).observe($('restoreBody'),{childList:true});markFinalDeduction();
  const phone=matchMedia('(max-width:767px)');
  const timeline=document.querySelector('.timeline');
  const timelineToggle=document.createElement('button');timelineToggle.className='mobile-timeline-toggle';timelineToggle.setAttribute('aria-controls','caseTimeline');
  timelineToggle.innerHTML='<span>已核实的时间线</span><span class="timeline-count"></span>';timeline.prepend(timelineToggle);
  function updateTimelineLabel(){timelineToggle.querySelector('.timeline-count').textContent=st.rest.size+' 条 · '+($('caseTimeline').hidden?'展开':'收起');timelineToggle.setAttribute('aria-expanded',String(!$('caseTimeline').hidden));}
  timelineToggle.addEventListener('click',()=>{$('caseTimeline').hidden=!$('caseTimeline').hidden;updateTimelineLabel();});
  new MutationObserver(updateTimelineLabel).observe($('caseProgress'),{childList:true});
  function updateAssistantSummary(){if(phone.matches)$('assistantToggle').firstElementChild.textContent=$('selaStatus').textContent.replace('SELA：','SELA · ');else $('assistantToggle').firstElementChild.textContent='SELA / 调查助手';}
  new MutationObserver(updateAssistantSummary).observe($('selaStatus'),{childList:true});
  function adaptReadingLayout(){
    assistant.classList.toggle('collapsed',phone.matches);$('assistantToggle').setAttribute('aria-expanded',String(!phone.matches));$('assistantToggle').lastElementChild.textContent=phone.matches?'+':'−';
    $('caseTimeline').hidden=phone.matches;updateTimelineLabel();updateAssistantSummary();
  }
  phone.addEventListener('change',adaptReadingLayout);adaptReadingLayout();
  function positionIllustration(){illustration.style.setProperty('--detail-photo-top',($('restoreBody').offsetTop+28)+'px');}
  new ResizeObserver(positionIllustration).observe($('restoreBody'));positionIllustration();
  const facts=['家属口述与现场声音','撞击后的独立口述','车门、鞋印与随身物品','现场处置与身份核验','事故点至桥东的目击','离店时间与出租车行程','侧脸与纸本缩写','搜索范围与车辆里程','南环旧账与再次上车'];
  const rearPictures=[[180,522,67,112],[245,495,61,106],[314,477,55,105],[451,410,193,156],[380,438,54,120],[675,447,39,111],[742,476,34,101],[805,497,34,99],[859,520,31,102]];
  function decorateDeck(){
    const stage=$('reasoningDeck').querySelector('.deck-stage');if(!stage)return;
    const currentNumber=Number(stage.querySelector('.front').dataset.id.slice(1));
    const remaining=[1,2,3,4,5,6,7,8,9].filter(n=>n!==currentNumber);
    stage.querySelectorAll('.deck-card').forEach(card=>{
      const n=Number(card.dataset.id.slice(1)),isFront=card.classList.contains('front'),order=remaining.indexOf(n),slot=isFront?0:order<4?order-4:order-3;
      card.style.setProperty('--slot',slot+5);card.dataset.number=n;card.dataset.fanSide=slot<0?'left':'right';
      if(!isFront)card.style.zIndex=20-Math.abs(slot);
      if(!card.classList.contains('front'))card.addEventListener('click',()=>document.querySelector('[data-choose="'+card.dataset.id+'"]').click());
      const title=card.querySelector('strong');const status=card.querySelector('small');
      if(isFront)card.querySelector('span').textContent='推理 '+n;
      else card.querySelector('span').innerHTML='<i class="reasoning-label">推理</i><b class="reasoning-number">'+n+'</b>';
      const photo=document.createElement('div');photo.className='reasoning-photo';
      photo.innerHTML=sprite('illustration',isFront?[451,410,193,156]:rearPictures[n-1],'',isFront?'xMidYMid slice':slot<0?'xMinYMid meet':'xMaxYMid meet');
      card.insertBefore(photo,title);
      const note=document.createElement('p');note.className='card-excerpt';note.textContent=facts[n-1];card.insertBefore(note,status);
      const clip=document.createElement('i');clip.className='paperclip';clip.setAttribute('aria-hidden','true');card.append(clip);
      card.style.setProperty('--fan-x',slot*76+'px');card.style.setProperty('--fan-r',slot*4+'deg');card.style.setProperty('--fan-y',Math.abs(slot)*13+'px');
    });
    const p=$('reasoningDeck').querySelector('.deck-shell>.small');p.textContent='把已知的线索串联起来，看看事情的真相是什么。';
    const caption=document.createElement('p');caption.className='drag-caption';caption.innerHTML='<span aria-hidden="true">⟵</span> 拖拽选择推理卡片 <span aria-hidden="true">⟶</span>';
    stage.after(caption);
  }
  new MutationObserver(decorateDeck).observe($('reasoningDeck'),{childList:true});decorateDeck();
  let patternNumber=0;
  function addPaperTexture(panel){
    if(panel.querySelector(':scope>.reference-texture'))return;
    const id='referencePaper'+(++patternNumber);
    const texture=document.createElementNS('http://www.w3.org/2000/svg','svg');texture.classList.add('reference-texture');texture.setAttribute('aria-hidden','true');texture.setAttribute('focusable','false');
    texture.innerHTML=`<defs><pattern id="${id}" width="85" height="50" patternUnits="userSpaceOnUse"><image href="${atlas}" x="-200" y="-350" width="1586" height="992"/></pattern></defs><rect width="100%" height="100%" fill="url(#${id})"/>`;
    panel.prepend(texture);panel.classList.add('textured-paper');
  }
  document.querySelectorAll('#restore,.archive-heading,.search-paper,#box,#settingsPanel,.evidence-panel').forEach(addPaperTexture);
  function syncView(){
    const view=document.body.dataset.view||'archive';
    const activeFolder=view==='evidence'&&document.body.classList.contains('people-focus')?'people':view;
    tabs.querySelectorAll('button').forEach(b=>{if(b.dataset.folder===activeFolder)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    if(view==='reasoning')$('restore').style.display='block';
  }
  let selectingPeople=false;
  document.querySelector('.keycap-nav [data-view="evidence"]').addEventListener('click',()=>{if(!selectingPeople)document.body.classList.remove('people-focus');syncView();});
  tabs.addEventListener('click',e=>{const b=e.target.closest('[data-folder]');if(!b)return;const view=b.dataset.folder;document.body.classList.toggle('people-focus',view==='people');selectingPeople=view==='people';document.querySelector(`.keycap-nav [data-view="${view==='people'?'evidence':view}"]`).click();selectingPeople=false;if(view==='people')$('people').closest('.panel').scrollIntoView({block:'start'});syncView();});
  new MutationObserver(syncView).observe(document.body,{attributes:true,attributeFilter:['data-view']});syncView();
})();
