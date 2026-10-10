/* Approved school scheduling; execution history remains the source of reports. */
(()=>{'use strict';
const S=window.MiikFinalSources,D=window.MiikProgramDevelopment,E=S.E;
const title={skills:'برنامج تعزيز المهارات النفسية والاجتماعية',qudurat:'اختبارات القدرات',tahsili:'الاختبار التحصيلي',nafs:'اختبارات نافس',occasions:'الأيام والمناسبات الوطنية والعالمية',career:'التوجيه المهني'};
window.miikApplyApprovedSchedule=function(rows,term){
 const second=String(term)==='2';
 return rows.map((row,i)=>{
  const w={...row},n=i+1;
  let items=(row.programs||[{name:row.program,custom:false,target:row.programTarget||''}]).map(p=>({...p}));
  const remove=pattern=>{items=items.filter(p=>p.custom||!pattern.test(p.name||''));};
  const add=(name,target='core:'+name)=>{const existing=items.find(p=>!p.custom&&p.name===name);if(existing)existing.target=target;else items.push({name,custom:false,target});};
  const primary=(name,target='core:'+name)=>{w.program=name;w.programTarget=target;add(name,target);};
  if(!second){
   const schedule={
    2:['برنامج رعاية ودعم الطلاب ذوي الظروف الخاصة','core:برنامج رعاية ودعم الطلاب ذوي الظروف الخاصة','حصر الطلبة ذوي الظروف الخاصة وتحديد احتياجاتهم بسرية؛ تنسيق الدعم المناسب؛ تكريم الطلاب المتفوقين وفق النتائج المتاحة'],
    3:['تنمية الدافعية لرفع مستوى التحصيل','core:تنمية الدافعية لرفع مستوى التحصيل','تحليل نتائج الطلبة المتاحة وتصنيف احتياجاتهم؛ التنسيق مع المعلمين لخطة الدعم؛ تعزيز الدافعية ومهارات الاستذكار'],
    4:['خفض العنف بالمدارس (رِفق)','core:خفض العنف بالمدارس (رِفق)','التوعية بالرفق والوقاية من العنف والتنمر؛ تشكيل المجلس الطلابي وعقد اجتماعه'],
    5:['برنامج تعزيز القيم والانتماء الوطني','core:برنامج تعزيز القيم والانتماء الوطني','تعزيز الانتماء الوطني وبناء شخصية الطالب بالتعاون مع النشاط الطلابي؛ تفعيل اليوم الوطني وفق أيام الدراسة المتاحة'],
    6:['تعزيز السلوك الإيجابي','core:تعزيز السلوك الإيجابي','تعزيز الممارسات الإيجابية والقيمة الأسبوعية؛ تكريم المتميزين سلوكيًا؛ متابعة احتياجات الطلبة'],
    7:[title.qudurat,'core:'+title.qudurat,'التنسيق مع معلمي القدرات والتحصيلي؛ تسليم خطة التدريب والاختبار التشخيصي؛ تحديد مواعيد التطبيق ومراجعة النتائج المتاحة'],
    8:['التوجيه وقت الأزمات','core:التوجيه وقت الأزمات','التوعية بالتعامل مع الضغوط والمواقف الصعبة؛ تعريف الطلبة بقنوات طلب المساعدة؛ متابعة الحالات التي تحتاج مساندة'],
    9:[title.skills,'core:'+title.skills,'تنمية المهارات النفسية والاجتماعية؛ تعزيز التواصل والتعاون وحل المشكلات بأنشطة مناسبة للطلبة'],
    10:['متابعة رعاية الفئات الخاصة','core:برنامج رعاية ودعم الطلاب ذوي الظروف الخاصة','متابعة احتياجات الفئات الخاصة؛ مراجعة الدعم المقدم؛ التنسيق مع المعلمين عند الحاجة وتحديد الإجراءات الإضافية'],
    11:['التوعية بأضرار التدخين والتدخين الإلكتروني','core:تعزيز السلوك الإيجابي','التوعية بأضرار التدخين والتدخين الإلكتروني؛ تعزيز السلوك الصحي واتخاذ القرار المناسب؛ تنفيذ إذاعة أو لقاء توجيهي'],
    13:['متابعة الانضباط المدرسي والحد من الغياب والتأخر','core:برنامج الانضباط المدرسي والحد من الغياب والتأخر الصباحي','مراجعة سجلات الغياب والتأخر؛ متابعة الحالات والتواصل مع الأسر؛ تعزيز الانتظام في الحضور'],
    14:[title.career,'core:'+title.career,'التعريف بالمسارات التعليمية والمهنية لطلبة المرحلة الثانوية؛ استكشاف الميول بأنشطة مناسبة لكل صف؛ الاستفادة من أدوات خارجية عند توفرها'],
    15:['متابعة القدرات','core:'+title.qudurat,'مراجعة نتائج الاختبار التشخيصي المتاحة مع المعلمين؛ متابعة تقدم التدريب والصعوبات؛ جمع المرئيات وتعديل الخطة عند الحاجة؛ تسجيل الاختبار البعدي عند إجرائه'],
    17:['متابعة دعم الطلبة المتأخرين دراسيًا','core:تنمية الدافعية لرفع مستوى التحصيل','مراجعة تقدم الطلبة المتأخرين دراسيًا وفق النتائج المتاحة؛ متابعة الدعم مع المعلمين والأسر؛ تحديد ما يحتاج استكمالًا']
   };
   if(schedule[n]){const [name,target,initiatives]=schedule[n];items=items.filter(p=>p.custom);primary(name,target);w.initiatives=initiatives;}
   if(n===4)add('المجلس الطلابي','special:council');
   if(n===7)add(title.tahsili);
   if(n===15)add('متابعة التحصيلي','core:'+title.tahsili);
   if(n===16){w.programTarget='special:family';items=items.map(p=>p.custom?p:{...p,target:'special:family'});}
  }else{
   if(n===8){remove(/المهارات النفسية والاجتماعية/);if(/المهارات النفسية والاجتماعية/.test(w.program||'')){w.program='';w.programTarget='';}}
   if(n===9)add(title.skills);
   if(n===2){add(title.qudurat);add(title.tahsili);}
   if(n===1)add(title.nafs);
   if(n===11){remove(/التوجيه المهني|مسارات المستقبل/);primary(title.career);w.initiatives='لقاءات عن المسارات التعليمية والمهنية والتخصصات لطلبة المرحلة الثانوية؛ أنشطة لاستكشاف الميول بحسب الصف؛ الاستفادة من أدوات خارجية عند توفرها';}
  }
  items=items.map(p=>!p.custom&&/المهارات النفسية والاجتماعية/.test(p.name||'')?{...p,name:title.skills,target:'core:'+title.skills}:p);
  remove(new RegExp('^'+title.occasions+'$'));
  if(!items.length&&w.program)add(w.program,w.programTarget||'core:'+w.program);
  w.programs=items;return w;
 });
};
const career=S.plans.find(p=>p.id==='career');if(career){career.target='طلبة المرحلة الثانوية: الأول والثاني والثالث، بحسب موضوع التنفيذ.';career.source='دليل التوجيه المهني لوزارة التعليم؛ الجدولة في الفصلين وفق خطة المدرسة.';}
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
