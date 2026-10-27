/* Reuse raster material from the supplied reference. CSS handles placement, not painting. */
(() => {
  'use strict';
  const atlas='assets/reference-atlas.webp';
  let serial=0;
  function crop(rect,x,y,w,h){return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${rect.join(' ')}" preserveAspectRatio="none" overflow="hidden"><image href="${atlas}" width="1586" height="992"/></svg>`;}
  const regions={
    paper:{frame:[1157,16,420,963],edge:6,texture:[1175,955,380,28],textureSize:[190,28]},
    card:{frame:[435,366,226,340],edge:9,texture:[1175,955,380,28],textureSize:[190,28],topFromBottom:true},
    key:{frame:[324,126,135,66],edge:15,texture:[341,136,97,7],textureSize:[97,7]},
    activeKey:{frame:[623,125,150,69],edge:15,texture:[646,136,93,7],textureSize:[93,7]},
    pressedKey:{frame:[1407,133,130,75],edge:14,texture:[1423,146,95,5],textureSize:[95,5]},
    seal:{frame:[196,780,122,32],edge:3,texture:[202,786,12,18],textureSize:[12,18]}
  };
  function material(kind,extra='',actualWidth=0,actualHeight=0){
    const data=regions[kind], [sx,sy,sw,sh]=data.frame,e=data.edge;
    const width=actualWidth||300,height=actualHeight||(kind==='key'||kind.endsWith('Key')?100:kind==='seal'?36:240);
    const border=kind==='paper'?7:kind==='card'?7:kind==='seal'?4:14;
    const id='rasterMaterial'+(++serial),[tw,th]=data.textureSize;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('material-surface');if(extra)svg.classList.add(extra);svg.dataset.sourceMaterial=kind;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const tile=crop(data.texture,0,0,tw,th);
    let pieces=`<defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="${tw*2}" height="${th*2}">${tile}<g transform="translate(${tw*2} 0) scale(-1 1)">${tile}</g><g transform="translate(0 ${th*2}) scale(1 -1)">${tile}</g><g transform="translate(${tw*2} ${th*2}) scale(-1 -1)">${tile}</g></pattern></defs><rect width="${width}" height="${height}" fill="url(#${id})"/>`;
    if(kind==='paper'||kind==='card'){
      const secondTile=crop([1180,948,380,42],0,0,157,41);
      pieces+=`<defs><pattern id="${id}variation" patternUnits="userSpaceOnUse" width="314" height="82" x="-37" y="-19">${secondTile}<g transform="translate(314 0) scale(-1 1)">${secondTile}</g><g transform="translate(0 82) scale(1 -1)">${secondTile}</g><g transform="translate(314 82) scale(-1 -1)">${secondTile}</g></pattern></defs><rect width="${width}" height="${height}" fill="url(#${id}variation)" opacity=".3"/>`;
    }
    const topY=data.topFromBottom?sy+sh-e:sy,bottomY=data.bottomFromTop?sy:sy+sh-e;
    pieces+=crop([sx,topY,e,e],0,0,border,border)+crop([sx+e,topY,sw-2*e,e],border,0,width-2*border,border)+crop([sx+sw-e,topY,e,e],width-border,0,border,border);
    pieces+=crop([sx,sy+e,e,sh-2*e],0,border,border,height-2*border)+crop([sx+sw-e,sy+e,e,sh-2*e],width-border,border,border,height-2*border);
    pieces+=crop([sx,bottomY,e,e],0,height-border,border,border)+crop([sx+e,bottomY,sw-2*e,e],border,height-border,width-2*border,border)+crop([sx+sw-e,bottomY,e,e],width-border,height-border,border,border);
    svg.innerHTML=pieces;return svg;
  }
  const sizes=new WeakMap();
  const resize=new ResizeObserver(entries=>entries.forEach(({target})=>{
    const w=target.offsetWidth,h=target.offsetHeight;if(!w||!h||sizes.get(target)===w+':'+h)return;sizes.set(target,w+':'+h);
    target.querySelectorAll(':scope>.material-surface').forEach(surface=>surface.replaceWith(material(surface.dataset.sourceMaterial,[...surface.classList].find(name=>name.startsWith('key-'))||'',w,h)));
  }));
  function apply(target,kind){if(target.querySelector(':scope>.material-surface'))return;target.classList.add('asset-backed');target.prepend(material(kind,'',target.offsetWidth,target.offsetHeight));resize.observe(target);}
  // These surfaces keep the source paper grain and worn edges; all game text stays live.
  document.querySelectorAll('#restore,#box,#settingsPanel,.archive-heading,.search-paper,.evidence-panel,.opening-folder,.welcome>.panel').forEach(el=>apply(el,'paper'));
  document.querySelectorAll('.keycap-nav button,.opening-tools button,.welcome .row button').forEach(button=>{button.classList.add('asset-backed','asset-keycap');button.prepend(material('key','key-normal',button.offsetWidth,button.offsetHeight),material('activeKey','key-current',button.offsetWidth,button.offsetHeight),material('pressedKey','key-pressed',button.offsetWidth,button.offsetHeight));resize.observe(button);});
  function dressDeck(){
    document.querySelectorAll('.deck-card').forEach(card=>{
      apply(card,'card');
      const label=card.querySelector(':scope>span');if(card.classList.contains('front'))apply(label,'seal');
      const clip=card.querySelector('.paperclip');if(clip){
        clip.classList.add('source-paperclip');
        clip.innerHTML=`<svg viewBox="0 0 33 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><clipPath id="clip${serial}"><path d="M21 0h11v12L15 50 7 56 0 49V37L18 3Z"/></clipPath></defs><image href="${atlas}" x="-624" y="-387" width="1586" height="992" clip-path="url(#clip${serial})"/></svg>`;
      }
    });
  }
  new MutationObserver(dressDeck).observe(document.getElementById('reasoningDeck'),{childList:true});dressDeck();
})();
