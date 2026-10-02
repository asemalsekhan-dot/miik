/* Focused review fixes: emergency save feedback and deletion confirmation. */
(()=>{'use strict';
 const ACTIONS='miik-demo-actions';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch(_){return[]}};
 let emergencySaved=false;
 const open=window.openAction;
 window.openAction=function(type){if(type==='emergency')emergencySaved=false;return open.apply(this,arguments)};
 const save=window.saveAction;
 window.saveAction=function(event){
  if(typeof currentAction==='undefined'||currentAction!=='emergency')return save.apply(this,arguments);
  if(emergencySaved){event?.preventDefault?.();return false}
  const before=localStorage.getItem(ACTIONS);
  const result=save.apply(this,arguments);
  if(localStorage.getItem(ACTIONS)!==before){
   emergencySaved=true;
   window.closeAction?.();
   window.showMiikNotice?.('تم الحفظ','حُفظ الموقف الطارئ في سجل الطالب.');
  }
  return result;
 };
 window.v56DeletePerson=function(kind,id){
  if(kind!=='health'&&kind!=='special')return;
  const key=kind==='health'?'miikV56Health':'miikV56Special';
  const item=read(key).find(x=>String(x.id)===String(id));
  if(!item)return;
  const title=kind==='health'?'الحالة الصحية':'الفئة الخاصة';
  window.showMiikDialog?.(`<h2>حذف ${title}</h2><p>هل أنت متأكد من حذف ${title} للطالب ${esc(item.student)}؟</p><div class="dialog-actions"><button type="button" class="dialog-primary" id="miikConfirmPersonDelete">نعم، حذف</button><button type="button" class="dialog-cancel" onclick="closeMiikDialog()">إلغاء</button></div>`);
  document.getElementById('miikConfirmPersonDelete')?.addEventListener('click',function(){
   this.disabled=true;
   localStorage.setItem(key,JSON.stringify(read(key).filter(x=>String(x.id)!==String(id))));
   window.closeMiikDialog?.();
   if(kind==='health')window.v56HealthRecords?.();else window.v56SpecialRecords?.();
   window.renderTimeline?.();
  },{once:true});
 };
})();
