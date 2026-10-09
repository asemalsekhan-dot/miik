/* Approved school scheduling; execution history remains the source of reports. */
(()=>{'use strict';
const S=window.MiikFinalSources,D=window.MiikProgramDevelopment,E=S.E;
const title={skills:'برنامج تعزيز المهارات النفسية والاجتماعية',qudurat:'اختبارات القدرات',tahsili:'الاختبار التحصيلي',nafs:'اختبارات نافس',occasions:'الأيام والمناسبات الوطنية والعالمية',career:'التوجيه المهني'};
window.miikApplyApprovedSchedule=function(rows,term){
 const second=String(term)==='2';
 return rows.map((row,i)=>{
  const w={...row},n=Number(row.w)||i+1;
  let items=(row.programs||[{name:row.program,custom:false,target:row.programTarget||''}]).map(p=>({...p}));
  const career=p=>/التوجيه المهني|مسارات المستقبل/.test(p.name||'');
  if(!second){items=items.filter(p=>p.custom||!career(p));if(/التوجيه المهني|مسارات المستقبل/.test(w.program||'')){w.program=title.skills;w.programTarget='core:'+title.skills;}}
  const add=name=>{if(!items.some(p=>p.name===name))items.push({name,custom:false,target:'core:'+name});};
  if(n===8){items=items.filter(p=>p.custom||!/المهارات النفسية والاجتماعية/.test(p.name||''));if(/المهارات النفسية والاجتماعية/.test(w.program||'')){w.program='';w.programTarget='';}}
  items=items.map(p=>!p.custom&&/المهارات النفسية والاجتماعية/.test(p.name||'')?{...p,name:title.skills,target:'core:'+title.skills}:p);
  if(n===9)add(title.skills);
  if(n===(second?2:9)){add(title.qudurat);add(title.tahsili);}
  if(second&&n===1)add(title.nafs);
  items=items.filter(p=>p.custom||p.name!==title.occasions);if([...(w.days||[]),...(w.extras||[]).map(x=>x.text||'')].some(x=>/اليوم الوطني|يوم العلم/.test(x)))add(title.occasions);
  if(!items.length&&w.program)add(w.program);
  w.programs=items;return w;
 });
};
const career=S.plans.find(p=>p.id==='career');if(career){career.target='طلبة الصف الثالث الثانوي — وفق تخصيص خطة المدرسة.';career.source='خطة برامج وخدمات التوجيه الطلابي 1448: البرنامج للطلبة طوال العام؛ تخصص خطة المدرسة لقاءاته للثالث الثانوي في الفصل الثاني.';}
const record=window.recordProgram;window.recordProgram=function(name){record(name);if(window.miikProgramPlan(name)?.id==='career'){window.miikDevAudienceType('cohort');const select=document.getElementById('miikDevCohort');if(select){const values=[...select.options].filter(x=>x.value.startsWith('ثالث ثانوي')).map(x=>x.value);for(const value of values){document.getElementById('miikDevCohort').value=value;window.miikDevAddCohort();}}const form=document.getElementById('miikProgramExecution');if(form){const note=document.createElement('p');note.className='muted';note.textContent='الفئة المعتمدة في خطة المدرسة: الثالث الثانوي. موعد اللقاءات في الفصل الثاني؛ يمكن تسجيل أي تنفيذ فعلي بتاريخه الصحيح.';form.prepend(note);}}};
const openDay=window.miikOpenGlobalDay12;
window.miikOpenGlobalDay12=function(day){openDay?.(day);window.recordProgram(title.occasions);const form=document.getElementById('miikProgramExecution');if(form){form.elements.namedItem('execTitle').value=day;const field=form.elements.namedItem('d_occasion');if(field)field.value=day;}};
const months=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
function dateParts(value){const s=String(value||'').replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)),numbers=(s.match(/\d+/g)||[]).map(Number),year=numbers.find(n=>n>=1400&&n<1600);let month=months.findIndex(m=>s.includes(m))+1;if(!month&&numbers.length>=3)month=numbers[1];return {year,month};}
window.miikOccasionsMonthHTML=function(year,month){const scope={year:String(year),term:'all'},p=S.plans.find(p=>p.id==='occasions'),rows=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(k=>k?.startsWith('miikExec_')&&window.miikProgramPlan(k.slice(9))?.id==='occasions').flatMap(k=>S.read(k)).filter(x=>{const d=dateParts(x.date);return d.year===+year&&d.month===+month;});
 const body=rows.length?`<table><thead><tr><th>المناسبة المنفذة</th><th>التاريخ</th><th>المشاركات المسجلة</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${E(D.scrub(x.details?.occasion||x.execTitle||x.title||'مناسبة مسجلة'))}</td><td>${E(x.date||'')}</td><td>${E(x.count||0)}</td></tr>`).join('')}</tbody></table>`:'<p>لا توجد مناسبات منفذة بتاريخ موثق في الشهر المختار.</p>';
 return D.genderHTML(`<!doctype html><html dir="rtl" lang="ar"><meta charset="utf-8"><title>التقرير الشهري للأيام والمناسبات</title><style>@page{size:A4 portrait;margin:12mm}body{font:14px/1.9 Tahoma;color:#294a3e}.miik-report-head{display:grid;grid-template-columns:1fr 80px 1fr;align-items:center;font-size:10px;border-bottom:1px solid #9baa88}.miik-report-head img{width:70px}.miik-report-head>div:last-child{text-align:left}h1{text-align:center;font-size:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #b5c5b2;padding:8px}th{background:#edf1e6}tr{break-inside:avoid}thead{display:table-header-group}.sign{display:grid;grid-template-columns:1fr 1fr;text-align:center;margin-top:14mm;break-inside:avoid}</style><body><table style="border:0"><thead><tr><td style="border:0">${S.head(S.profile())}</td></tr></thead><tbody><tr><td style="border:0"><h1>التقرير الشهري للأيام والمناسبات الوطنية والعالمية</h1><p>${E(months[+month-1]||'')} ${E(year)}هـ · ${rows.length} تنفيذ</p>${body}<p>المشاركات هي الأعداد المسجلة في التنفيذ، وقد يشارك الطالب في أكثر من مناسبة. السجلات التي لا تحمل تاريخًا واضحًا تحتاج مراجعة قبل إدراجها شهريًا.</p><div class="sign"><div>الموجّه الطلابي<br>${E(S.profile().name||'')}</div><div>مدير المدرسة<br>${E(S.profile().principal||'')}</div></div></td></tr></tbody></table></body></html>`);
};
window.miikOccasionsMonth=function(){const c=S.context();window.showMiikDialog(`<h2>التقرير الشهري للأيام والمناسبات</h2><form id="miikOccasionMonth"><label>السنة الهجرية<input name="year" value="${E(c.year)}" pattern="14[0-9]{2}" required></label><label>الشهر<select name="month">${months.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('')}</select></label><button type="submit">طباعة التقرير الشهري</button></form>`);document.getElementById('miikOccasionMonth').onsubmit=e=>{e.preventDefault();const f=e.target,html=window.miikOccasionsMonthHTML(f.elements.year.value,f.elements.month.value);(window.printDoc84||window.print86)?.(html);};};
const render=window.renderProgram;window.renderProgram=function(name,g){render(name,g);if(window.miikProgramPlan(name)?.id==='occasions'){const b=document.createElement('button');b.className='program-action';b.textContent='التقرير الشهري للمناسبات';b.onclick=window.miikOccasionsMonth;g.querySelector('.program-actions')?.append(b);}};
})();
