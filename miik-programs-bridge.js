/* The two program hubs and an explicit link from guidance work to its program. */
(()=>{'use strict';
 const DISC='برنامج الانضباط المدرسي والحد من الغياب والتأخر الصباحي';
 const CARE='برنامج رعاية ودعم الطلاب ذوي الظروف الخاصة';
 const MOT='تنمية الدافعية لرفع مستوى التحصيل';
 const ACTIONS='miik-demo-actions', GROUP='miik-group-guidance-v1';
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=k=>{try{const a=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}};
 const write=(k,a)=>localStorage.setItem(k,JSON.stringify(a));
 const q=s=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
 const programs=[DISC,MOT,CARE,'برنامج تعزيز القيم والانتماء الوطني','خفض العنف بالمدارس (رِفق)','تعزيز السلوك الإيجابي','التوجيه المهني'];
 function inferred(topic){if(/تعزيز القيم|الانتماء الوطني/.test(topic))return 'برنامج تعزيز القيم والانتماء الوطني';if(/غياب|تأخر صباح|انضباط|مواظبة/.test(topic))return DISC;if(/دافع|تحصيل|تأخر دراسي|تفوق/.test(topic))return MOT;if(/ظروف خاصة|يتيم|إعاقة|ضمان|مادية/.test(topic))return CARE;if(/تنمر|عنف/.test(topic))return 'خفض العنف بالمدارس (رِفق)';return ''}
 function select(value='',id='miikLinkedProgram'){return `<label class="miik-program-link">ربط هذا العمل ببرنامج (اختياري)<select id="${id}"><option value="">بدون ربط</option>${(window.MiikFinalSources?.plans.filter(p=>p.id!=='family').map(p=>p.name)||programs).map(p=>`<option value="${E(p)}" ${value===p?'selected':''}>${E(p)}</option>`).join('')}</select></label>`}
 function nav(){
  const drawer=document.getElementById('drawer');if(!drawer)return;
  if(!drawer.dataset.miikCloseOnNavigation){drawer.dataset.miikCloseOnNavigation='1';drawer.addEventListener('click',event=>{if(event.target.closest('button'))setTimeout(()=>drawer.classList.remove('show'),0)},true)}
  const details=[...drawer.querySelectorAll('details')];
  const programsMenu=details.find(x=>x.querySelector(':scope > summary')?.textContent.trim()==='برامج التوجيه الطلابي');
  const followMenu=details.find(x=>x.querySelector(':scope > summary')?.textContent.trim()==='المتابعة الطلابية');
  const host=programsMenu?.querySelector(':scope > .subnav');if(!host)return;
  for(const [title,anchor] of [[DISC,MOT],[CARE,DISC]]){
   if([...host.querySelectorAll(':scope > button')].some(x=>x.textContent.trim()===title))continue;
   const button=document.createElement('button');button.type='button';button.textContent=title;
   button.onclick=()=>{document.getElementById('drawer')?.classList.remove('show');openModule(title,'التنفيذ والتوثيق والتقرير من مصدر واحد.')};
   const ref=[...host.children].find(x=>x.textContent.trim()===anchor);ref?.after(button);if(!ref)host.appendChild(button);
  }
  followMenu?.querySelectorAll('button').forEach(button=>{if(button.textContent.trim()==='الفئات الخاصة')button.remove()});
 }
 function roster(){window.v56SpecialRecords?.()}
 function careHub(){
  const g=document.getElementById('moduleGrid');if(!g)return;
  window.renderProgram(CARE,g);
  g.querySelector('.program-surface > .execution-log')?.insertAdjacentHTML('beforebegin',`<div class="miik-program-care-actions"><button type="button" class="program-action" onclick="v56PersonForm('special')">إضافة طالب</button><button type="button" class="program-action" onclick="v56SpecialRecords()">سجل الفئات الخاصة</button></div><div class="miik-special-bulk-launch"><button type="button" onclick="miikSpecialBulkOpen()">＋ إضافة عدة طلاب لفئة واحدة</button></div>`);
 }
 const oldOpen=window.openModule;
 window.openModule=function(title,desc){const result=oldOpen.apply(this,arguments);if(title===DISC||title===CARE){setTimeout(()=>{const g=document.getElementById('moduleGrid');if(document.getElementById('moduleTitle')?.textContent!==title)return;title===CARE?careHub():window.renderProgram(title,g)},20)}return result};
 window.v56Special=()=>openModule(CARE,'التنفيذ والتوثيق والتقرير ومتابعة الطلاب ذوي الظروف الخاصة.');
 const oldPlanOpen=window.miikOpenPlanProgram12;
 if(typeof oldPlanOpen==='function')window.miikOpenPlanProgram12=function(label,...rest){
  if(/رعاية الطلبة من الفئات الخاصة|الظروف الخاصة/.test(label))return openModule(CARE);
  if(/متكرر.*غياب|الانضباط المدرسي|التأخر الصباحي/.test(label))return openModule(DISC);
  return oldPlanOpen.call(this,label,...rest)
 };
 const oldAction=window.openAction;
 window.openAction=function(type){const result=oldAction.apply(this,arguments);if(type==='session')setTimeout(()=>{
  const form=document.getElementById('actionForm'),field=document.getElementById('f2');
  if(!form||!field)return;
  form.querySelector('.miik-program-link')?.remove();
  field.closest('label')?.insertAdjacentHTML('afterend',select(inferred(field.value)));
  field.addEventListener('change',()=>{const target=document.getElementById('miikLinkedProgram');if(target)target.value=inferred(field.value)}, {once:false});
 },35);return result};
 const oldEdit=window.miik007EditAction;
 if(typeof oldEdit==='function')window.miik007EditAction=function(id){const result=oldEdit.apply(this,arguments);const row=read(ACTIONS).find(x=>x._v55id===id);if(row?.type==='session')setTimeout(()=>{const el=document.getElementById('miikLinkedProgram');if(el)el.value=row.programLink||inferred(row.values?.[1]||'')},240);return result};
 const oldSave=window.saveAction;
 window.saveAction=function(e){if(typeof currentAction==='undefined'||currentAction!=='session')return oldSave.apply(this,arguments);
  const value=document.getElementById('miikLinkedProgram')?.value||'',before=read(ACTIONS),result=oldSave.apply(this,arguments),after=read(ACTIONS);
  if(after.length){let row=after.find(x=>!before.some(b=>b._v55id===x._v55id));if(!row){row=after.find(x=>x.type==='session'&&before.find(b=>b._v55id===x._v55id&&JSON.stringify(b)!==JSON.stringify(x)))}if(row&&row.type==='session'){row.programLink=value;write(ACTIONS,after)}}
  return result
 };
 const oldAdd=window.v171Add;
 const topics=['الغياب المتكرر','التأخر الصباحي','التأخر الدراسي','التفوق الدراسي','تعزيز الانضباط','تنمية الدافعية','التنمر','السلوك الإيجابي','مهارات المذاكرة','الاستعداد للاختبارات','الاستخدام الآمن للإنترنت','الاحترام والتعاون'];
 const objectives={
  'الغياب المتكرر':'توضيح أثر الغياب في التحصيل الدراسي، وتعزيز الانتظام في الحضور، والاتفاق على خطوات عملية للحد من الغياب.',
  'التأخر الصباحي':'إبراز أهمية الحضور المبكر، ومناقشة أسباب التأخر، ومساعدة الطلاب على تنظيم الاستعداد لليوم الدراسي.',
  'التأخر الدراسي':'التعرف على أسباب تدني التحصيل، وتنمية مهارات المذاكرة، وتشجيع الاستفادة من الدعم والمتابعة.',
  'التفوق الدراسي':'تعزيز دافعية الطلاب المتفوقين، وتنمية قدراتهم، وتشجيع استمرار التميز والمشاركة الإيجابية.',
  'تعزيز الانضباط':'تعزيز احترام الأنظمة المدرسية، وتوضيح السلوك المتوقع، وتنمية المسؤولية الذاتية.',
  'تنمية الدافعية':'مساعدة الطلاب على تحديد أهداف دراسية واقعية وتنظيم وقتهم وتعزيز مثابرتهم.'
 };
 function groupForm(id){
  const row=read(GROUP).find(x=>x.id===id)||{},form=document.getElementById('g171Form'),box=form?.querySelector('.miik171-form');if(!box)return;
  const students=read('miikStudentsV39'),classes=[...new Set(students.map(s=>[s.grade,s.section].filter(Boolean).join(' / ')).filter(Boolean))],all='جميع طلاب المدرسة';
  const selected=row.target===all?[all]:String(row.target||'').split('، ').filter(Boolean);
  box.innerHTML=`<label>عنوان التوجيه الجماعي<select id="g171title" required><option value="">اختر العنوان</option>${topics.map(x=>`<option ${row.title===x?'selected':''}>${E(x)}</option>`).join('')}</select></label>
  <label>طريقة التوجيه<select id="g171method"><option>دورة</option><option>محاضرة</option><option>لقاء</option></select></label>
  <fieldset class="miik-targets"><legend>الفئة المستهدفة · اختر أكثر من صف أو فصل</legend>${[...classes,all].map(x=>`<label><input type="checkbox" value="${E(x)}" ${selected.includes(x)?'checked':''}>${E(x)}</label>`).join('')||'<p>أضف بيانات الطلاب أولًا لتظهر الصفوف والفصول.</p>'}<input id="g171target" type="hidden" value="${E(row.target||'')}"></fieldset>
  <label>التاريخ الهجري<input id="g171date" readonly placeholder="اختر التاريخ الهجري" value="${E(row.date||'')}"></label>
  <label>وقت التنفيذ<div class="miik-time-parts"><select id="miikGroupHour">${Array.from({length:12},(_,i)=>`<option>${i+1}</option>`).join('')}</select><select id="miikGroupMinute">${['00','15','30','45'].map(x=>`<option>${x}</option>`).join('')}</select><select id="miikGroupPeriod"><option>AM</option><option>PM</option></select></div><input id="g171time" type="hidden" value="${E(row.time||'')}"></label>
  <label class="miik171-wide">أهداف التوجيه الجماعي<textarea id="g171goals">${E(row.goals||'')}</textarea></label>
  <label class="miik171-wide">ملاحظات<textarea id="g171notes">${E(row.notes||'')}</textarea></label>`;
  document.getElementById('g171method').value=row.method||'لقاء';
  const date=document.getElementById('g171date');date.onclick=()=>window.openHijriPicker?.(date);
  const title=document.getElementById('g171title'),goals=document.getElementById('g171goals');
  title.onchange=()=>{goals.value=objectives[title.value]||`توعية الطلاب بموضوع ${title.value}، ومناقشة الممارسات المناسبة، وتحديد خطوات قابلة للمتابعة.`;const linked=document.getElementById('miikGroupProgram');if(linked)linked.value=inferred(title.value)};
  const targets=[...box.querySelectorAll('.miik-targets input[type=checkbox]')],hidden=document.getElementById('g171target');
  function syncTargets(e){if(e?.target.value===all&&e.target.checked)targets.filter(x=>x!==e.target).forEach(x=>x.checked=false);else if(e?.target.checked)targets.find(x=>x.value===all).checked=false;hidden.value=targets.filter(x=>x.checked).map(x=>x.value).join('، ')}
  targets.forEach(x=>x.addEventListener('change',syncTargets));syncTargets();
  const match=String(row.time||'').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);if(match){document.getElementById('miikGroupHour').value=match[1];document.getElementById('miikGroupMinute').value=match[2];document.getElementById('miikGroupPeriod').value=match[3]}
  const time=()=>{document.getElementById('g171time').value=`${document.getElementById('miikGroupHour').value}:${document.getElementById('miikGroupMinute').value} ${document.getElementById('miikGroupPeriod').value}`};
  ['miikGroupHour','miikGroupMinute','miikGroupPeriod'].forEach(x=>document.getElementById(x).addEventListener('change',time));time();
  form.addEventListener('submit',e=>{syncTargets();time();if(!hidden.value){e.preventDefault();e.stopImmediatePropagation();window.showMiikNotice?.('الفئة المستهدفة','اختر صفًا أو فصلًا أو جميع طلاب المدرسة.')}},true);
 }
 if(typeof oldAdd==='function')window.v171Add=function(id){const result=oldAdd.apply(this,arguments);const row=read(GROUP).find(x=>x.id===id),form=document.getElementById('g171Form');form?.querySelector('.dialog-actions')?.insertAdjacentHTML('beforebegin',select(row?.programLink||inferred(row?.title||''),'miikGroupProgram'));groupForm(id);return result};
 const oldHub=window.v171GroupGuidance;
 if(typeof oldHub==='function')window.v171GroupGuidance=function(){const result=oldHub.apply(this,arguments);const buttons=[...document.querySelectorAll('#moduleGrid .v55-tile')];buttons.find(x=>x.textContent.includes('تقرير توجيه جماعي'))?.querySelector('b')?.replaceChildren('سجل التوجيه الجماعي');return result};
 const oldGroupSave=window.v171Save;
 if(typeof oldGroupSave==='function')window.v171Save=function(id){const linked=document.getElementById('miikGroupProgram')?.value||'',before=read(GROUP),result=oldGroupSave.apply(this,arguments),after=read(GROUP);const row=after.find(x=>x.id===id)||after.find(x=>!before.some(y=>y.id===x.id));if(row){row.programLink=linked;write(GROUP,after)}return result};
 const oldShow=window.showProgramReport;
 window.showProgramReport=function(title){const result=oldShow.apply(this,arguments);if(title!==DISC&&title!==CARE)return result;const g=document.getElementById('moduleGrid'),linked=read(ACTIONS).filter(x=>x.programLink===title),group=read(GROUP).filter(x=>x.programLink===title);g?.querySelector('.program-surface')?.insertAdjacentHTML('beforeend',`<div class="miik-program-related"><h3>الأعمال المرتبطة</h3><p>جلسات ومتابعات: ${linked.length} · توجيه جماعي: ${group.length}${title===CARE?' · طلاب الفئات الخاصة: '+read('miikV56Special').length:''}</p><button class="program-action" onclick="miikPrintLinkedProgram('${q(title)}')">طباعة تقرير البرنامج</button></div>`);return result};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',nav,{once:true});else nav();
})();
