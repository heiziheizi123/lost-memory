const SAVE_KEY='lost_memory_save_v1';
function saveGame(){
  const data={version:1,time:Date.now(),p:[...st.p],l:[...st.l],t:[...st.t],seen:[...st.seen],items:[...st.items],sel:[...st.sel],rest:[...st.rest],comb:[...st.comb],output:O.innerHTML};
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));sela('存档写入完成。当前调查状态已保存至本地。');}
  catch(e){sela('存档写入失败。本地存储不可用。');}
}
function loadGame(){
  let raw=localStorage.getItem(SAVE_KEY);if(!raw)return sela('未检测到可读取存档。');
  try{
    let d=JSON.parse(raw);if(!d||d.version!==1)throw new Error('version');
    st.p=new Set(d.p||[]);st.l=new Set(d.l||[]);st.t=new Set(d.t||[]);st.seen=new Set(d.seen||[]);st.items=new Set(d.items||[]);st.sel=d.sel||[];st.rest=new Set(d.rest||[]);st.comb=new Set(d.comb||[]);
    O.innerHTML=d.output||'';
    videoPanel.style.display=st.t.has('公开寻人时间')?'block':'none';
    render();renderRestore();sela('存档读取完成。调查状态已恢复。');
  }catch(e){sela('存档数据无法解析。读取终止。');}
}
function newGame(){
  if(!confirm('确定清除当前存档并重新开始调查吗？'))return;
  localStorage.removeItem(SAVE_KEY);localStorage.removeItem('lost_memory_complete');localStorage.removeItem('lost_memory_ending');location.reload();
}
function initSaveControls(){
  const row=document.querySelector('.panel .row');if(!row)return;
  const save=document.createElement('button');save.textContent='保存进度';save.onclick=saveGame;
  const load=document.createElement('button');load.textContent='读取存档';load.onclick=loadGame;
  const reset=document.createElement('button');reset.textContent='重新开始';reset.onclick=newGame;
  row.append(save,load,reset);
  if(localStorage.getItem(SAVE_KEY))sela('检测到本地存档。可选择“读取存档”恢复调查。');
}
window.addEventListener('DOMContentLoaded',initSaveControls);