/* Stable internal student IDs. Ambiguous historical records are never assigned by name alone. */
(()=>{'use strict';
 const S='miikStudentsV39',A='miik-demo-actions',H='miikV56Health',P='miikV56Special';
 const read=k=>{try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(_){return[]}};
 const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const norm=x=>String(x||'').replace(/\u00a0/g,' ').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,' ').trim();
 const key=x=>[norm(x.name),norm(x.stage),norm(x.grade),norm(x.section)].join('|');
 const make=()=>crypto.randomUUID?.()||'s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 function migrate(){let students=read(S),changed=false;const used=new Set();for(const x of students){if(!x.miikId||used.has(x.miikId)){x.miikId=make();changed=true}used.add(x.miikId)}if(changed)save(S,students);
  if(!students.length)return students;
  for(const type of [A,H,P]){const rows=read(type);let dirty=false;for(const x of rows){if(x.studentId||x._miikIdentityReview)continue;const candidates=students.filter(s=>norm(s.name)===norm(x.student));let selected=null;if(x.miik009Class){const exact=candidates.filter(s=>['stage','grade','section'].every(k=>!x.miik009Class[k]||norm(s[k])===norm(x.miik009Class[k])));if(exact.length===1)selected=exact[0]}
    if(!selected&&!x.miik009Class&&candidates.length===1)selected=candidates[0];if(selected)x.studentId=selected.miikId;else x._miikIdentityReview=true;dirty=true}
   if(dirty)save(type,rows)}return students}
 window.miikStudentIdentityMigrate=migrate;
 window.miikCurrentStudentId='';
 const oldOpen=window.openStudent;
 const labels={follow:'متابعات',individual:'جلسات فردية',group:'جلسات جماعية',guardian:'تواصل ولي الأمر',case:'دراسة حالة',health:'الحالة الصحية',emergency:'موقف طارئ',special:'فئة خاصة'};
 const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const kind=x=>x.type==='followup'?'follow':x.type==='guardian'?'guardian':x.type==='emergency'?'emergency':x.type==='case'?'case':x.type==='session'?(String(x.values?.[0]||'').includes('جماعية')?'group':'individual'):'';
 function linked(id){return [...read(A).filter(x=>x.studentId===id||x.groupStudentIds?.includes(id)).map(x=>({...x,_kind:kind(x),_source:'action'})),...read(H).filter(x=>x.studentId===id).map(x=>({...x,_kind:'health',_source:'health'})),...read(P).filter(x=>x.studentId===id).map(x=>({...x,_kind:'special',_source:'special'}))]}
 function renderExact(){const id=window.miikCurrentStudentId,who=read(S).find(x=>x.miikId===id);if(!who||read(S).filter(x=>norm(x.name)===norm(who.name)).length<2)return;const rows=linked(id),grid=document.querySelector('#studentFile .student-file-grid'),box=document.getElementById('timelineItems');if(grid)grid.innerHTML=Object.entries(labels).map(([k,l])=>`<button type="button" class="student-stat" onclick="miikStudentIdentityCategory('${k}')"><b>${rows.filter(x=>x._kind===k).length}</b>${l}</button>`).join('');if(box)box.innerHTML=rows.length?rows.map(x=>`<div class="timeline-item"><b>${E(x.title||labels[x._kind])}${x.date?' · '+E(x.date):''}</b>${E(x.summary||x.note||x.type||'')}<div class="miik009-file-actions"><button type="button" onclick="${x._source==='action'?`miik007EditAction('${E(x._v55id)}')`:`v56PersonForm('${x._source}','${E(x.id)}')`}">تعديل</button><button type="button" onclick="${x._source==='action'?`miik007DeleteAction('${E(x._v55id)}')`:`v56DeletePerson('${x._source}','${E(x.id)}')`}">حذف</button></div></div>`).join(''):'<div class="v55-empty">لا توجد سجلات مرتبطة برقم هذا الطالب.</div>'}
 window.miikStudentIdentityCategory=function(k){const rows=linked(window.miikCurrentStudentId).filter(x=>x._kind===k);showMiikDialog(`<h2>${E(labels[k]||'السجل')}</h2>${rows.length?rows.map(x=>`<div class="miik009-read-row"><b>${E(x.date||x.type||'')}</b><span>${E(x.summary||x.note||'')}</span></div>`).join(''):'<p>لا توجد سجلات مرتبطة بهذا الطالب.</p>'}<div class="dialog-actions"><button class="dialog-cancel" onclick="closeMiikDialog()">إغلاق</button></div>`)};
 const oldCategory=window.miik009StudentCategory;
 if(typeof oldCategory==='function')window.miik009StudentCategory=function(k){const who=read(S).find(x=>x.miikId===window.miikCurrentStudentId);if(who&&read(S).filter(x=>norm(x.name)===norm(who.name)).length>1)return window.miikStudentIdentityCategory(k);return oldCategory.apply(this,arguments)};
 if(typeof oldOpen==='function')window.openStudent=function(name,grade,section){const students=migrate(),matches=students.filter(x=>norm(x.name)===norm(name)&&norm(x.grade)===norm(grade)&&norm(x.section)===norm(section));window.miikCurrentStudentId=matches.length===1?matches[0].miikId:'';const result=oldOpen.apply(this,arguments);setTimeout(renderExact,100);return result};
 const oldSave=window.saveAction;
 if(typeof oldSave==='function')window.saveAction=function(){const result=oldSave.apply(this,arguments);migrate();return result};
 const oldImport=window.v39DoImport;
 if(typeof oldImport==='function')window.v39DoImport=async function(){migrate();const result=await oldImport.apply(this,arguments);migrate();return result};
 const oldEdit=window.v75SaveStudentEdit;
 if(typeof oldEdit==='function')window.v75SaveStudentEdit=function(){const id=window.miikCurrentStudentId;migrate();const result=oldEdit.apply(this,arguments);const students=read(S);if(id&&students.some(x=>x.miikId===id))window.miikCurrentStudentId=id;return result};
 const oldDelete=window.miikRC10ConfirmDelete;
 if(typeof oldDelete==='function')window.miikRC10ConfirmDelete=function(){const target=window.__miikRC10Delete;if(target){const students=migrate(),matched=students.find(x=>key(x)===key(target));if(matched){window.__miikRC10Delete={...target,miikId:matched.miikId};for(const k of [A,H,P]){const rows=read(k);const filtered=rows.filter(x=>x.studentId!==matched.miikId);if(filtered.length!==rows.length)save(k,filtered)}}}const result=oldDelete.apply(this,arguments);window.miikCurrentStudentId='';return result};
 migrate();
})();
