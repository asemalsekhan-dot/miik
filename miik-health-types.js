/* Multiple health conditions, one student row. Legacy records are grouped without discarding notes. */
(()=>{'use strict';
 const KEY='miikV56Health',S='miikStudentsV39',OTHER='أمراض أخرى';
 const TYPES=['أمراض القلب','ضغط الدم','أمراض الكلى','ضعف البصر','الربو','السكر','الصرع','ضعف السمع','السرطان','فقر الدم','روماتيزم','حساسية موسمية','النوم المرضي','التأتأة','نفسية','التوحد',OTHER];
 const read=k=>{try{const a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}};
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const notice=m=>window.showMiikNotice?.('الحالات الصحية',m);
 const unique=a=>[...new Set(a.map(x=>String(x||'').trim()).filter(Boolean))];
 const conditions=r=>unique(Array.isArray(r.conditions)?r.conditions:[r.type]);
 function resolve(row,roster){if(row.studentId)return roster.find(x=>x.miikId===row.studentId)||null;const a=roster.filter(x=>String(x.name||'').trim()===String(row.student||'').trim()&&['stage','grade','section'].every(k=>!row.miik009Class?.[k]||x[k]===row.miik009Class[k]));return a.length===1?a[0]:null}
 function grouped(rows=read(KEY),roster=read(S)){const map=new Map();for(const r of rows){const st=resolve(r,roster),key=r.studentId?'id:'+r.studentId:st?.miikId?'id:'+st.miikId:'record:'+r.id;const prior=map.get(key);if(prior){prior.conditions=unique([...prior.conditions,...conditions(r)]);prior.type=prior.conditions.join('، ');prior.note=unique([prior.note,r.note]).join('\n');prior._sourceIds.push(r.id)}else map.set(key,{...r,studentId:r.studentId||st?.miikId||'',miik009Class:r.miik009Class||(st?{stage:st.stage,grade:st.grade,section:st.section}:undefined),conditions:conditions(r),type:conditions(r).join('، '),_sourceIds:[r.id]})}return [...map.values()]}
 window.miikHealthGrouped=grouped;
 let serial=0;
 function picker(id,existing){
  const input=document.getElementById(id);if(!input)return;
  const box=document.createElement('div');box.id=id+'Choices';box.className='miik-health-multiple';
  const rows=document.createElement('div');box.appendChild(rows);
  const add=value=>{
   const n=serial++,row=document.createElement('div');row.className='miik-health-condition-row';row.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0';
   const select=document.createElement('select');select.id=rows.children.length===0?id:id+'_'+n;select.className='miik-health-condition';select.style.flex='1';select.setAttribute('aria-label','الحالة الصحية');
   select.innerHTML='<option value="">اختر الحالة الصحية</option>'+TYPES.map(t=>'<option>'+E(t)+'</option>').join('');
   const other=document.createElement('input');other.placeholder='اكتب الحالة الصحية الأخرى';other.className='miik-health-other';other.style.width='100%';
   select.value=TYPES.includes(value)&&value!==OTHER?value:value?OTHER:'';other.value=value&&select.value===OTHER?value:'';
   const update=()=>{other.hidden=select.value!==OTHER};select.onchange=update;update();
   const remove=document.createElement('button');remove.type='button';remove.textContent='إزالة';remove.setAttribute('aria-label','إزالة هذه الحالة الصحية');remove.onclick=()=>{if(rows.children.length>1)row.remove();else{select.value='';other.value='';update()}};
   row.append(select,remove,other);rows.appendChild(row);
  };
  const plus=document.createElement('button');plus.type='button';plus.textContent='＋ إضافة حالة صحية';plus.className='dialog-primary';plus.onclick=()=>add('');
  box.appendChild(plus);input.replaceWith(box);(existing?.length?existing:[input.value||'']).forEach(add);
 }
 function chosen(id){const box=document.getElementById(id+'Choices');if(!box)return null;const list=[];for(const row of box.querySelectorAll('.miik-health-condition-row')){const s=row.querySelector('select'),value=s.value===OTHER?row.querySelector('.miik-health-other').value.trim():s.value;if(!value){notice('اختر الحالة الصحية أو اكتب الحالة الأخرى، أو أزل الخانة الزائدة.');return null}list.push(value)}return unique(list)}
 function commit(student,id,types,note,roster=read(S)){
  const raw=read(KEY),all=grouped(raw,roster),previous=all.find(r=>id&&r._sourceIds.some(x=>String(x)===String(id)))||all.find(r=>r.studentId===student.miikId&&student.miikId);
  const ids=new Set(previous?previous._sourceIds.map(String):[]);
  const record={...(previous||{}),id:previous?.id||id||crypto.randomUUID(),student:student.name,studentId:student.miikId,miik009Class:{stage:student.stage,grade:student.grade,section:student.section},conditions:id?types:unique([...(previous?.conditions||[]),...types]),note:id?note:unique([previous?.note,note]).join('\n')};
  delete record._sourceIds;record.type=record.conditions.join('، ');
  const next=raw.filter(r=>!ids.has(String(r.id)));next.unshift(record);
  try{localStorage.setItem(KEY,JSON.stringify(next));return record}catch(e){notice('تعذر الحفظ. بياناتك السابقة باقية؛ صدّر نسخة احتياطية وتحقق من مساحة المتصفح.');return null}
 }
 window.miikHealthUpsert=commit;
 const oldForm=window.v56PersonForm;
 window.v56PersonForm=function(kind,id){const result=oldForm?.apply(this,arguments);if(kind==='health'){const record=grouped().find(r=>r._sourceIds.some(x=>String(x)===String(id)));picker('v56pType',record?.conditions);if(record){if(document.getElementById('v56pNote'))document.getElementById('v56pNote').value=record.note||'';if(document.getElementById('v56pStudent'))document.getElementById('v56pStudent').readOnly=true}}return result};
 const oldSave=window.v107SavePerson;
 window.v107SavePerson=function(kind,id){if(kind!=='health')return oldSave?.apply(this,arguments);const types=chosen('v56pType');if(!types)return;const name=document.getElementById('v56pStudent')?.value.trim()||'',roster=read(S),record=grouped().find(r=>r._sourceIds.some(x=>String(x)===String(id)));let student=record?.studentId&&record.student===name?roster.find(s=>s.miikId===record.studentId):null;if(!student){const matches=roster.filter(s=>String(s.name||'').trim()===name);if(matches.length===1)student=matches[0]}if(!student)return notice('اختر طالبًا موجودًا في بيانات الطلاب؛ عند تشابه الأسماء أضف الحالة من ملف الطالب.');if(commit(student,id,types,document.getElementById('v56pNote')?.value.trim()||'',roster)){window.closeMiikDialog?.();window.v56HealthRecords?.();window.renderTimeline?.()}};
 const oldLegacySave=window.v56SavePerson;window.v56SavePerson=function(kind,id){return kind==='health'?window.v107SavePerson(kind,id):oldLegacySave?.apply(this,arguments)};
 const refresh=()=>{window.renderTimeline?.();if(document.getElementById('moduleGrid')?.querySelector('.v56-list'))window.v56HealthRecords?.()};
 const oldOpen=window.openHealthCard;
 window.openHealthCard=function(){const result=oldOpen?.apply(this,arguments);setTimeout(()=>{const button=document.getElementById('miik007NewHealthSave');if(!button)return;const roster=read(S),student=roster.find(s=>s.miikId===window.miikCurrentStudentId);picker('miik007NewHealthType');button.onclick=()=>{const types=chosen('miik007NewHealthType');if(!types)return;let st=student;if(!st){const name=document.getElementById('fileName')?.textContent.trim()||'',matches=roster.filter(s=>s.name===name);if(matches.length===1)st=matches[0]}if(!st)return notice('افتح ملف الطالب بعد تحديد صفه وفصله.');if(commit(st,'',types,document.getElementById('miik007NewHealthNote')?.value.trim()||'',roster)){window.closeMiikDialog?.();refresh()}}},0);return result};
 const oldEdit=window.miik007EditHealth;
 window.miik007EditHealth=function(id){const result=oldEdit?.apply(this,arguments);setTimeout(()=>{const button=document.getElementById('miik007HealthSave'),record=grouped().find(r=>r._sourceIds.some(x=>String(x)===String(id)));if(!button||!record)return;picker('miik007HealthType',record.conditions);document.getElementById('miik007HealthNote').value=record.note||'';button.onclick=()=>{const types=chosen('miik007HealthType');if(!types)return;const student=resolve(record,read(S));if(!student)return notice('تعذر تحديد الطالب؛ راجع بياناته أولًا.');if(commit(student,id,types,document.getElementById('miik007HealthNote')?.value.trim()||'')){window.closeMiikDialog?.();refresh()}}},0);return result};
 const oldDelete=window.v56DeletePerson;
 window.v56DeletePerson=function(kind,id){if(kind!=='health')return oldDelete?.apply(this,arguments);const record=grouped().find(r=>r._sourceIds.some(x=>String(x)===String(id)));if(!record)return;window.showMiikDialog?.('<h2>حذف الحالات الصحية</h2><p>هل تريد حذف سجل الحالات الصحية للطالب '+E(record.student)+'؟ يمكنك إزالة حالة واحدة من زر تعديل.</p><div class="dialog-actions"><button class="dialog-primary" id="miikHealthDeleteConfirm">نعم، حذف السجل</button><button class="dialog-cancel" onclick="closeMiikDialog()">إلغاء</button></div>');document.getElementById('miikHealthDeleteConfirm').onclick=()=>{const ids=new Set(record._sourceIds.map(String));try{localStorage.setItem(KEY,JSON.stringify(read(KEY).filter(r=>!ids.has(String(r.id)))));window.closeMiikDialog?.();window.v56HealthRecords?.();window.renderTimeline?.()}catch(_){notice('تعذر حذف السجل. البيانات السابقة باقية.')}}};
})();
