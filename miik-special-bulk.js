/* Fast entry for a shared special category, while preserving the existing records. */
(()=>{'use strict';
 const STORE='miikV56Special',ROSTER='miikStudentsV39';
 const CATEGORIES=['يتيم الأب','يتيم الأم','يتيم الأبوين','انفصال الوالدين','أحد الوالدين موقوف/مسجون','أبناء شهداء الواجب','ذوو الإعاقة','طلاب دور الملاحظة','ذوو الحاجة المادية','الضمان الاجتماعي','تكافل','أخرى'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const norm=s=>String(s??'').trim().replace(/\s+/g,' ').normalize('NFKC');
 function gradeRank(value){
  const s=norm(value).replace(/[أإآ]/g,'ا').replace(/[ًٌٍَُِّْ]/g,'');
  const stage=s.includes('ابتدائي')?0:s.includes('متوسط')?10:s.includes('ثانوي')?20:100;
  const levels=['اول','ثاني','ثالث','رابع','خامس','سادس'];
  const level=levels.findIndex(word=>new RegExp('(?:^|\\s)(?:ال)?'+word+'(?:ى|ة)?(?:\\s|$)').test(s));
  return stage+(level<0?9:level+1);
 }
 const compareGrades=(a,b)=>gradeRank(a)-gradeRank(b)||String(a).localeCompare(String(b),'ar',{numeric:true});
 const read=key=>{try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}};
 const notice=(title,message)=>window.showMiikNotice?.(title,message);
 const identity=s=>String(s.miikId||s.id||[s.name,s.stage,s.grade,s.section].map(norm).join('|'));
 const uniqueRoster=()=>{const seen=new Set();return read(ROSTER).filter(s=>{if(!s?.name)return false;const k=identity(s);if(seen.has(k))return false;seen.add(k);return true})};
 // Canonical label for existing records and restored legacy data.
 function unifyCategoryLabels(){
  try{
   const raw=localStorage.getItem(STORE);if(!raw)return;
   const rows=JSON.parse(raw);if(!Array.isArray(rows))return;
   const aliases=new Set(['أبناء الأسر المستفيدة من الضمان الاجتماعي','أبناء الأسرة المستفيدة من الضمان الاجتماعي','طلاب الضمان الاجتماعي','من أسرة مستفيدة من الضمان الاجتماعي']);
   let changed=false;const updated=rows.map(row=>{if(row&&aliases.has(norm(row.type))){changed=true;return {...row,type:'الضمان الاجتماعي'}}return row});
   if(changed)localStorage.setItem(STORE,JSON.stringify(updated));
  }catch(_){}
 }
 unifyCategoryLabels();
 const same=(row,s,type)=>norm(row.type)===norm(type)&&(row.studentId&&s.miikId?row.studentId===s.miikId:norm(row.student)===norm(s.name)&&(!row.grade||norm(row.grade)===norm(s.grade))&&(!row.section||norm(row.section)===norm(s.section)));
 let roster=[],selected=new Set(),saving=false;
 function category(){const val=document.getElementById('miikBulkCategory')?.value||'';return val==='أخرى'?document.getElementById('miikBulkOther')?.value.trim()||'':val}
 function draw(){
  const box=document.getElementById('miikBulkList');if(!box)return;
  const q=norm(document.getElementById('miikBulkSearch')?.value),grade=document.getElementById('miikBulkGrade')?.value||'',section=document.getElementById('miikBulkSection')?.value||'',type=category(),existing=read(STORE);
  const matches=roster.map((s,i)=>({s,i})).filter(({s})=>(!q||norm([s.name,s.grade,s.section].join(' ')).includes(q))&&(!grade||s.grade===grade)&&(!section||s.section===section));
  box.innerHTML=matches.length?matches.map(({s,i})=>{const duplicate=type&&existing.some(x=>same(x,s,type));if(duplicate)selected.delete(identity(s));return `<label class="miik-bulk-student"><input type="checkbox" data-bulk-index="${i}" ${selected.has(identity(s))?'checked':''} ${duplicate?'disabled':''}><span><b>${esc(s.name)}</b><small>${esc([s.grade,s.section&&'الفصل '+s.section].filter(Boolean).join(' · '))}${duplicate?' · مسجل في هذه الفئة':''}</small></span></label>`}).join(''):'<p class="miik-bulk-empty">لا يوجد طلاب مطابقون لهذا البحث.</p>';
  box.querySelectorAll('[data-bulk-index]').forEach(input=>input.addEventListener('change',()=>{const k=identity(roster[Number(input.dataset.bulkIndex)]);input.checked?selected.add(k):selected.delete(k);count()}));
  count();
 }
 function count(){const el=document.getElementById('miikBulkCount');if(el)el.textContent=`المحددون: ${selected.size}`}
 function sections(){const grade=document.getElementById('miikBulkGrade')?.value||'',el=document.getElementById('miikBulkSection');if(!el)return;const before=el.value,values=[...new Set(roster.filter(s=>!grade||s.grade===grade).map(s=>s.section).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'ar',{numeric:true}));el.innerHTML='<option value="">جميع الفصول</option>'+values.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');if(values.includes(before))el.value=before;draw()}
 window.miikSpecialBulkOpen=function(){
  roster=uniqueRoster();selected=new Set();saving=false;
  if(!roster.length){notice('الإضافة الجماعية','أضف الطلاب إلى بيانات مِعِك أولًا.');return}
  const grades=[...new Set(roster.map(s=>s.grade).filter(Boolean))].sort(compareGrades);
  window.showMiikDialog(`<h2>إضافة طلاب لفئة واحدة</h2><p class="miik-bulk-intro">اختر الفئة ثم حدد الطلاب. الطلاب المسجلون فيها يظهرون لك ولا يُضافون مرة ثانية.</p><label>الفئة الخاصة<select id="miikBulkCategory"><option value="">اختر الفئة</option>${CATEGORIES.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label><label id="miikBulkOtherWrap" hidden>اسم الفئة الأخرى<input id="miikBulkOther" placeholder="اكتب اسم الفئة"></label><div class="miik-bulk-filters"><label>الصف<select id="miikBulkGrade"><option value="">جميع الصفوف</option>${grades.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label><label>الفصل<select id="miikBulkSection"><option value="">جميع الفصول</option></select></label></div><label>بحث عن طالب<input id="miikBulkSearch" placeholder="اكتب الاسم أو الصف"></label><div id="miikBulkCount" class="miik-bulk-count">المحددون: 0</div><div id="miikBulkList" class="miik-bulk-list"></div><label>ملاحظة مشتركة (اختياري)<textarea id="miikBulkNote" rows="2"></textarea></label><div class="dialog-actions"><button type="button" class="dialog-primary" id="miikBulkSave">حفظ الطلاب المحددين</button><button type="button" class="dialog-cancel" onclick="closeMiikDialog()">إلغاء</button></div>`);
  document.getElementById('miikBulkCategory').addEventListener('change',e=>{document.getElementById('miikBulkOtherWrap').hidden=e.target.value!=='أخرى';draw()});
  document.getElementById('miikBulkOther').addEventListener('input',draw);
  document.getElementById('miikBulkGrade').addEventListener('change',sections);
  document.getElementById('miikBulkSection').addEventListener('change',draw);
  document.getElementById('miikBulkSearch').addEventListener('input',draw);
  document.getElementById('miikBulkSave').addEventListener('click',save);
  sections();
 };
 function save(){
  if(saving)return;const type=category();if(!type){notice('الفئة الخاصة','اختر الفئة الخاصة أولًا.');return}
  if(!selected.size){notice('الإضافة الجماعية','حدد طالبًا واحدًا على الأقل.');return}
  const current=read(STORE),items=roster.filter(s=>selected.has(identity(s))),fresh=items.filter(s=>!current.some(x=>same(x,s,type)));
  if(!fresh.length){notice('الإضافة الجماعية','كل الطلاب المحددين مسجلون في هذه الفئة.');draw();return}
  const note=document.getElementById('miikBulkNote')?.value.trim()||'',rows=fresh.map(s=>({id:'special_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),student:s.name,studentId:s.miikId||'',stage:s.stage||'',grade:s.grade||'',section:s.section||'',type,note}));
  saving=true;try{localStorage.setItem(STORE,JSON.stringify([...rows,...current]))}catch(_){saving=false;notice('تعذر الحفظ','لم تُحفظ السجلات. تحقق من مساحة التخزين وحاول مرة أخرى.');return}
  window.closeMiikDialog();window.v56SpecialRecords?.();notice('تم الحفظ',`أُضيف ${rows.length} طالبًا إلى «${type}».${items.length>rows.length?' تم تجاوز المسجلين مسبقًا.':''}`);
 }
 const originalForm=window.v56PersonForm;
 if(typeof originalForm==='function')window.v56PersonForm=function(kind,id){
  const result=originalForm.apply(this,arguments);
  if(kind==='special'&&!id){const actions=document.querySelector('#v56pStudent')?.closest('.miik-dialog-card')?.querySelector('.dialog-actions')||document.querySelector('.miik-dialog-card .dialog-actions');const cancel=actions?.querySelector('.dialog-cancel');if(cancel&&!document.getElementById('miikSpecialSaveNext'))cancel.insertAdjacentHTML('beforebegin','<button type="button" class="miik-bulk-next" id="miikSpecialSaveNext">حفظ وإضافة طالب آخر ＋</button>');document.getElementById('miikSpecialSaveNext')?.addEventListener('click',saveNext)}
  return result
 };
 const originalSave=window.v107SavePerson;
 if(typeof originalSave==='function')window.v107SavePerson=function(kind,id){
  if(kind==='special'){
   const name=document.getElementById('v56pStudent')?.value.trim()||'',type=categorySingle();
   if(name&&type&&read(STORE).some(x=>x.id!==id&&norm(x.student)===norm(name)&&norm(x.type)===norm(type))){notice('الطالب مسجل','هذا الطالب موجود في الفئة نفسها؛ افتح سجله إذا أردت تعديل ملاحظاته.');return false}
  }
  return originalSave.apply(this,arguments)
 };
 function categorySingle(){const el=document.getElementById('v56pType'),v=el?.value||'';return v==='أخرى'?document.getElementById('v107OtherSpecial')?.value.trim()||'أخرى':v}
 function saveNext(){
  const name=document.getElementById('v56pStudent')?.value.trim()||'',type=document.getElementById('v56pType')?.value||'',other=document.getElementById('v107OtherSpecial')?.value||'';
  if(!name||!type||(type==='أخرى'&&!other.trim())){notice('أكمل البيانات','اختر الطالب والفئة الخاصة قبل الحفظ.');return}
  const before=read(STORE).length,saved=window.v107SavePerson('special','');
  if(saved===false||read(STORE).length!==before+1)return;
  window.v56PersonForm('special');
  document.getElementById('v56pType').value=type;
  const otherEl=document.getElementById('v107OtherSpecial');if(otherEl){otherEl.value=other;otherEl.style.display=type==='أخرى'?'block':'none'}
  document.getElementById('v56pStudent')?.focus();
 }
})();
