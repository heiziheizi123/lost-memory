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
  function sprite(name,rect,extra='') {
    const [x,y,w,h]=rect;
    return `<svg class="atlas-sprite ${extra}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><image href="${atlas}" x="${-x}" y="${-y}" width="1586" height="992"/></svg>`;
  }
  document.body.classList.add('reference-scene');
  toggle=function(id){if(id==='restore')document.querySelector('.keycap-nav [data-view="reasoning"]').click();else if(id==='box')document.querySelector('.keycap-nav [data-view="evidence"]').click();};
  const header=document.querySelector('.case-header');
  header.firstElementChild.innerHTML='<div class="paper-label">A · 纸质案件档案</div><div class="brand-line"><span class="wordmark">CODE SELA</span><h1>车祸现场男孩失踪案</h1></div><p class="desk-motto">TRUTH LIVES IN DETAILS</p>';
  const nav=document.querySelector('.keycap-nav');
  const labels={archive:'案件档案',evidence:'证据',reasoning:'案件还原',settings:'设置'};
  nav.querySelectorAll('button').forEach(b=>b.textContent=labels[b.dataset.view]);
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
  // Polygon clipping is a browser presentation mask; the supplied bitmap is not altered.
  cutout.innerHTML=`<svg viewBox="0 0 239 382" focusable="false"><defs><clipPath id="selaReferenceClip"><path d="M91 58L187 54 224 78 235 133 215 169 194 178 208 211 231 259 237 326 205 378 86 378 78 332 63 284 53 223 30 201 12 178 2 154 9 132 20 127 28 141 45 155 64 163 83 151 88 122 80 104Z"/></clipPath></defs><image href="${atlas}" x="-892" y="-286" width="1586" height="992" clip-path="url(#selaReferenceClip)"/></svg>`;
  assistant.insertBefore(cutout,$('assistantMessage'));
  const face=document.createElement('div');face.className='sela-expression-tile';assistant.append(face);
  const antenna=document.createElementNS('http://www.w3.org/2000/svg','path');antenna.setAttribute('d','M137 66L125 26M170 61L194 32');antenna.setAttribute('fill','none');antenna.setAttribute('stroke','#b5a176');antenna.setAttribute('stroke-width','3');cutout.querySelector('svg').append(antenna);
  const expressionPaths={
    smile:['M119 104v14 M181 104v14','M140 129l10 8 10-8'],
    thinking:['M114 111h18 M170 111h18','M142 134h16'],
    discovery:['M122 111a6 6 0 1 0 .1 0 M178 111a6 6 0 1 0 .1 0','M145 132a5 6 0 1 0 .1 0'],
    question:['M115 105h17 M174 116h16','M140 135q10-9 20 0'],
    warning:['M114 102l20 10 M186 102l-20 10','M139 134h22'],
    success:['M114 115q10-15 20 0 M166 115q10-15 20 0','M137 130q13 19 26 0'],
    mismatch:['M114 108h19 M177 105v15','M136 135q7-8 14 0t14 0'],
    waiting:['M114 114h19 M167 114h19','M142 134h16'],
    reading:['M112 106h25 M163 106h25 M112 115h25 M163 115h25','M142 134h16'],
    complete:['M114 114q10-12 20 0 M166 114q10-12 20 0','M138 130q12 12 24 0']
  };
  const mainFace=document.createElementNS('http://www.w3.org/2000/svg','g');mainFace.classList.add('reference-live-face');
  mainFace.innerHTML='<path d="M100 83L192 95 184 147 93 135Z" fill="#27291f"/><g class="live-face-lines" transform="matrix(.6 .08 -.08 .6 61 32)" fill="none" stroke="#e0d9b8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path class="live-eyes"/><path class="live-mouth"/></g>';
  cutout.querySelector('svg').append(mainFace);
  function refreshFace(){
    const state=assistant.dataset.state||'smile',paths=expressionPaths[state]||expressionPaths.smile;
    face.innerHTML=sprite(state,crops[state]||crops.smile);face.dataset.expression=state;
    mainFace.dataset.expression=state;mainFace.querySelector('.live-eyes').setAttribute('d',paths[0]);mainFace.querySelector('.live-mouth').setAttribute('d',paths[1]);
  }
  new MutationObserver(refreshFace).observe(assistant,{attributes:true,attributeFilter:['data-state']});refreshFace();
  const message=$('assistantMessage');message.classList.add('assistant-note');
  const signature=document.createElement('span');signature.className='note-signature';signature.textContent='— SELA';message.append(signature);
  const intro=document.createElement('div');intro.className='reasoning-intro';intro.innerHTML='<span>CODE SELA<br>CASE RECONSTRUCTION</span><p>结合已有证据，依次梳理推理链条，还原事件的可能经过。</p>';
  $('restore').insertBefore(intro,$('reasoningDeck'));
  $('restore').querySelector('h2').textContent='案件还原';
  $('restore').querySelector('p.small').classList.add('reasoning-guidance');
  const illustration=document.createElement('figure');illustration.className='selected-illustration';illustration.innerHTML=sprite('road',[451,410,193,156])+'<figcaption>档案插图 · 事实以原始记录为准</figcaption>';
  $('restoreBody').after(illustration);
  function positionIllustration(){illustration.style.setProperty('--detail-photo-top',($('restoreBody').offsetTop+28)+'px');}
  new ResizeObserver(positionIllustration).observe($('restoreBody'));positionIllustration();
  const facts=['家属口述与现场声音','撞击后的独立口述','车门、鞋印与随身物品','现场处置与身份核验','事故点至桥东的目击','离店时间与出租车行程','侧脸与纸本缩写','搜索范围与车辆里程','南环旧账与再次上车'];
  function decorateDeck(){
    const stage=$('reasoningDeck').querySelector('.deck-stage');if(!stage)return;
    stage.querySelectorAll('.deck-card').forEach(card=>{
      const n=Number(card.dataset.id.slice(1));card.style.setProperty('--slot',n);card.dataset.number=n;
      if(!card.classList.contains('front'))card.addEventListener('click',()=>document.querySelector('[data-choose="'+card.dataset.id+'"]').click());
      const title=card.querySelector('strong');const status=card.querySelector('small');
      card.querySelector('span').textContent='推理 '+n;
      const photo=document.createElement('div');photo.className='reasoning-photo';
      photo.innerHTML=sprite('illustration',n%3===0?[455,450,180,115]:n%3===1?[452,410,192,155]:[234,500,96,110]);
      card.insertBefore(photo,title);
      const note=document.createElement('p');note.className='card-excerpt';note.textContent=facts[n-1];card.insertBefore(note,status);
      const clip=document.createElement('i');clip.className='paperclip';clip.setAttribute('aria-hidden','true');card.append(clip);
      card.style.setProperty('--fan-x',(n-5)*76+'px');card.style.setProperty('--fan-r',(n-5)*4+'deg');card.style.setProperty('--fan-y',Math.abs(n-5)*13+'px');
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
