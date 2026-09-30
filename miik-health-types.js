/* Unified health condition choices for the health register and student file. */
(()=>{'use strict';
 const KEY='miikV56Health';
 const TYPES=['أمراض القلب','ضغط الدم','أمراض الكلى','ضعف البصر','الربو','السكر','الصرع','ضعف السمع','السرطان','فقر الدم','روماتيزم','حساسية موسمية','النوم المرضي','التأتأة','نفسية','التوحد','أمراض أخرى'];
 const OTHER='أمراض أخرى';
 const read=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}};
 const write=a=>localStorage.setItem(KEY,JSON.stringify(a));
 const notice=message=>window.showMiikNotice?.('الحالة الصحية',message);
 function replaceTypeInput(id){
  const input=document.getElementById(id);if(!input||input.tagName!=='INPUT')return;
  const old=String(input.value||'').trim();
  const box=document.createElement('div');box.className='miik-health-choice';
  const select=document.createElement('select');select.id=id;select.required=true;
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='اختر الحالة الصحية';select.append(placeholder);
  TYPES.forEach(type=>{const option=document.createElement('option');option.value=type;option.textContent=type;select.append(option)});
  const other=document.createElement('input');other.id=id+'Other';other.placeholder='اكتب الحالة الصحية الأخرى';other.autocomplete='off';other.style.marginTop='8px';
  const known=TYPES.includes(old)&&old!==OTHER;
  select.value=known?old:old?OTHER:'';
  other.value=old&&!known&&old!==OTHER?old:'';
  const update=()=>{other.hidden=select.value!==OTHER;other.required=!other.hidden};
  select.addEventListener('change',update);update();box.append(select,other);input.replaceWith(box);
 }
 function chosen(id){const select=document.getElementById(id);if(!select)return'';return select.value===OTHER?document.getElementById(id+'Other')?.value.trim()||'':select.value.trim()}
 function valid(id){const type=chosen(id);if(!type)notice(document.getElementById(id)?.value===OTHER?'اكتب الحالة الصحية الأخرى.':'اختر الحالة الصحية من القائمة.');return type}
 function refreshStudent(){if(typeof window.renderTimeline==='function')window.renderTimeline();if(document.getElementById('moduleGrid')?.querySelector('.v56-list')&&typeof window.v56HealthRecords==='function')window.v56HealthRecords()}

 const oldPersonForm=window.v56PersonForm;
 window.v56PersonForm=function(kind,id){const result=oldPersonForm?.apply(this,arguments);if(kind==='health')replaceTypeInput('v56pType');return result};
 const oldPersonSave=window.v107SavePerson;
 window.v107SavePerson=function(kind,id){
  if(kind!=='health')return oldPersonSave?.apply(this,arguments);
  const type=valid('v56pType');if(!type)return;
  const student=document.getElementById('v56pStudent')?.value.trim()||'';
  if(!student){notice('اختر اسم الطالب.');return}
  const a=read(),i=a.findIndex(x=>String(x.id)===String(id));
  const record={...(i>=0?a[i]:{}),id:id||'h'+Date.now().toString(36),student,type,note:document.getElementById('v56pNote')?.value.trim()||''};
  if(i>=0)a[i]=record;else a.unshift(record);
  write(a);window.closeMiikDialog?.();window.v56HealthRecords?.();
 };

 const oldOpenHealth=window.openHealthCard;
 window.openHealthCard=function(){
  const result=oldOpenHealth?.apply(this,arguments);
  setTimeout(()=>{
   const button=document.getElementById('miik007NewHealthSave');if(!button)return;
   replaceTypeInput('miik007NewHealthType');
   button.onclick=()=>{
    const type=valid('miik007NewHealthType');if(!type)return;
    const student=typeof currentStudent!=='undefined'?String(currentStudent).trim():document.getElementById('fileName')?.textContent.trim();
    if(!student){notice('افتح ملف الطالب أولًا.');return}
    const a=read();a.unshift({id:'h'+Date.now().toString(36),student,type,note:document.getElementById('miik007NewHealthNote')?.value.trim()||'',date:''});
    write(a);window.closeMiikDialog?.();refreshStudent();
   };
  },0);
  return result;
 };
 const oldEditHealth=window.miik007EditHealth;
 window.miik007EditHealth=function(id){
  const result=oldEditHealth?.apply(this,arguments);
  setTimeout(()=>{
   const button=document.getElementById('miik007HealthSave');if(!button)return;
   replaceTypeInput('miik007HealthType');
   button.onclick=()=>{
    const type=valid('miik007HealthType');if(!type)return;
    const a=read(),i=a.findIndex(x=>String(x.id)===String(id));if(i<0)return;
    a[i]={...a[i],type,note:document.getElementById('miik007HealthNote')?.value.trim()||''};
    write(a);window.closeMiikDialog?.();refreshStudent();
   };
  },0);
  return result;
 };
})();
