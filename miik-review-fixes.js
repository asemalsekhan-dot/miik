/* Focused review fixes: emergency save feedback and deletion confirmation. */
(()=>{'use strict';
 const ACTIONS='miik-demo-actions';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[]}catch(_){return[]}};
 let emergencySaved=false;
 const open=window.openAction;
 window.openAction=function(type){
  if(type==='emergency')emergencySaved=false;
  if(type==='session'){
   const studentLabel=document.getElementById('actionStudent')?.closest('label');
   if(studentLabel)studentLabel.style.display='';
  }
  const result=open.apply(this,arguments);
  if(type==='session'){
   document.getElementById('actionTitle').textContent='جلسة إرشادية فردية';
   document.getElementById('actionHint').textContent='سجّل الجلسة الفردية وملخصها.';
   document.querySelector('#actionForm > .miik-shalwa-inline')?.remove();
  }
  return result;
 };
 const openSession=window.v55NewSession;
 if(typeof openSession==='function')window.v55NewSession=function(kind){
  const result=openSession.apply(this,arguments);
  const sessionKind=String(kind).includes('جماعية')?'جلسة إرشادية جماعية':'جلسة إرشادية فردية';
  setTimeout(()=>{
   const input=document.getElementById('f1');
   if(input)input.value=sessionKind;
   if(document.getElementById('actionModal')?.classList.contains('show')){
    document.getElementById('actionTitle').textContent=sessionKind;
    document.getElementById('actionHint').textContent=sessionKind.includes('جماعية')?'سجّل الطلاب المستفيدين وملخص الجلسة الجماعية.':'سجّل الجلسة الفردية وملخصها.';
   }
  },80);
  return result;
 };
 const save=window.saveAction;
 window.saveAction=function(event){
  if(typeof currentAction==='undefined'||currentAction!=='emergency')return save.apply(this,arguments);
  if(emergencySaved){event?.preventDefault?.();return false}
  const before=localStorage.getItem(ACTIONS);
  let result;
  try{result=save.apply(this,arguments)}
  catch(error){if(localStorage.getItem(ACTIONS)===before)throw error;console.error('تعذر تحديث العرض بعد حفظ الموقف الطارئ',error)}
  finally{
   if(localStorage.getItem(ACTIONS)!==before){
    emergencySaved=true;
    document.getElementById('saveNote')?.classList.remove('show');
    window.closeAction?.();
    document.getElementById('actionModal')?.classList.remove('show');
    window.showMiikNotice?.('تم الحفظ','حُفظ الموقف الطارئ في سجل الطالب.');
   }
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
