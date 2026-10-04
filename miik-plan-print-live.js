/* The printed operational plan is a view of the counselor's saved plan. */
(()=>{'use strict';
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch(_){return fallback}};
 const termName=t=>String(t)==='2'?'الفصل الدراسي الثاني':'الفصل الدراسي الأول';
 const fields=[
  ['النفسي','دعم الصحة النفسية وتقدير الذات والتكيف مع الضغوط والمواقف الطارئة.'],
  ['التربوي','متابعة التحصيل ورعاية المتفوقين والمتأخرين ودعم مهارات الاستذكار والتنظيم الذاتي.'],
  ['الاجتماعي','تنمية المهارات الاجتماعية والسلوك الإيجابي، والشراكة مع الأسرة والحد من العنف والتنمر.'],
  ['المهني','التعريف بالمسارات والفرص المهنية ومساعدة الطلبة على اتخاذ قرارات واعية.']
 ];
 const goals=[
  ['تحسين نتائج الطلبة في المحطات التقويمية','مقارنة نسبة المجتازين في المحطة الثانية بالأولى للمواد والصفوف المتماثلة','تحسّن النتائج؛ يُحدد المقدار المستهدف بعد قراءة المحطة الأولى','تقارير تحليل النتائج'],
  ['خفض حالات الغياب','مقارنة عدد حالات الغياب في فترتين متماثلتين من بيانات المدرسة','خفض مستهدف 10% بعد تثبيت خط الأساس','إحصاءات إدارة المدرسة'],
  ['خفض حالات التأخر الصباحي','مقارنة عدد حالات التأخر في فترتين متماثلتين من بيانات المدرسة','خفض مستهدف 10% بعد تثبيت خط الأساس','إحصاءات إدارة المدرسة'],
  ['الحد من العنف والتنمر','مقارنة الحالات المسجلة، مع توثيق التوعية والتدخلات','تحسن في عدد الحالات؛ يُضبط المستهدف من بيانات المدرسة','سجل الحالات وتقارير التوعية'],
  ['الاستجابة للحالات المحالة','الفترة بين تاريخ الإحالة وبدء التعامل معها','بدء التعامل مع الحالات المحالة خلال 3 أيام عمل','سجل الإحالات والحالات'],
  ['تفعيل الشراكة الأسرية','مجلس أولياء أمور واحد، وتوثيق التواصل مع الأسر','حضور 20–30% للمجلس، واستكمال التواصل المطلوب خلال العام','محضر المجلس وسجل التواصل في مِعِك'],
  ['التوجيه المهني للمرحلة الثانوية','التوجيه الجمعي وتطبيق مقياس الميول الخارجي','تغطية الطلبة المستهدفين؛ لقاء فردي لمن تظهر حاجته','تقرير التوجيه ونتائج المقياس'],
  ['توثيق الشواهد','حفظ شواهد الأعمال المنفذة ورفع المطلوب منها','توثيق جميع الأعمال المنفذة وفق متطلبات نظام نور','سجلات التنفيذ وتقارير نور']
 ];
 // Metadata explains how a program can be carried out. The program name and weeks
 // always come from the saved plan, including manually added programs.
 const details=[
  [/تحليل نتائج|محطات تقويمية/,['جميع الصفوف','تحليل النتائج وإعداد تقرير','الموجّه الطلابي؛ لجنة التحصيل','تقرير خلال أسبوع من صدور نتائج كل محطة','تقرير التحليل وتوصياته']],
  [/قلق الاختبارات|التهيئة النفسية/,['الطلبة المستهدفون','توجيه جمعي ودعم فردي عند الحاجة','الموجّه الطلابي؛ المعلمون','تنفيذ لقاء توعوي قبيل الاختبارات','تقرير اللقاء وكشف الحضور']],
  [/التهيئة الإرشادية|الأسبوع التمهيدي|بداية الفصل/,['جميع الطلبة','تعريف بخدمات التوجيه وتهيئة الطلبة','الموجّه الطلابي؛ إدارة المدرسة','تنفيذ أنشطة التهيئة في أسابيعها','تقرير التهيئة وكشوف الحضور']],
  [/المتفوقين|تحفيز التحصيل|تكريم/,['الطلبة المتفوقون','حصر وتكريم وفق النتائج','الموجّه الطلابي؛ لجنة التحصيل','حصر المستهدفين وتوثيق التكريم','قوائم التكريم والشهادات']],
  [/تدني التحصيل|المتأخرين دراسي|الدافعية|التحصيل/,['الطلبة المستهدفون','توجيه ومتابعة بالتعاون مع المعلمين','الموجّه الطلابي؛ المعلمون؛ لجنة التحصيل','مراجعة النتائج والخطة العلاجية بعد كل محطة','تحليل النتائج وتقارير المتابعة']],
  [/المعيدين|الرسوب/,['الطلبة المعيدون','متابعة فردية وتواصل أسري بحسب الحاجة','الموجّه الطلابي؛ المعلمون؛ ولي الأمر','متابعة الحالات المرصودة','سجل المتابعة والتواصل']],
  [/الأسرة|أولياء الأمور|الشراكة الأسرية/,['أولياء الأمور','مجلس واحد وتواصل موثق طوال العام','الموجّه الطلابي؛ إدارة المدرسة','مجلس واحد في الفصل وتوثيق التواصل','محضر المجلس وسجل التواصل']],
  [/الفئات الخاصة|الحالات الاجتماعية|الأيتام/,['الطلبة ذوو الاحتياج','حصر ومتابعة سرية بحسب الحالة','الموجّه الطلابي؛ وكيل شؤون الطلاب','تحديث الحصر والمتابعة بحسب الحاجة','السجل السري وتقارير المتابعة']],
  [/العنف|رفق|التنمر/,['جميع الطلبة','توعية وتدخلات إرشادية عند الحاجة','الموجّه الطلابي؛ وكيل شؤون الطلاب','تنفيذ التوعية ومراجعة الحالات المسجلة','تقارير التوعية وسجل الحالات']],
  [/المخدرات|المؤثرات العقلية/,['طلبة المرحلتين','حملة توعوية مناسبة للمرحلة','الموجّه الطلابي؛ الجهات المختصة','تنفيذ التوعية في أسابيعها','تقرير الحملة والشواهد']],
  [/الإنترنت|رقمي|المعلوماتية/,['الطلبة المستهدفون','توعية بالاستخدام الآمن','الموجّه الطلابي؛ المعلمون','تنفيذ التوعية في أسابيعها','تقرير البرنامج وكشف الحضور']],
  [/المهني|المسارات|المستقبل/,['المرحلة الثانوية والصفوف المستهدفة','توجيه جمعي ومقياس ميول خارجي','الموجّه الطلابي؛ المعلمون','تغطية الطلبة المستهدفين','تقرير التوجيه ونتائج المقياس']],
  [/الانضباط|الغياب|التأخر الصباحي/,['الطلبة المستهدفون','توعية ومتابعة بالتنسيق مع إدارة المدرسة','الموجّه الطلابي؛ وكيل شؤون الطلاب','تنفيذ ما خُطط له ومراجعة البيانات','تقرير التنفيذ وإحصاءات المدرسة']],
  [/الصحية|السلامة/,['جميع الطلبة','حملة بالتنسيق مع الصحة المدرسية','الموجّه الطلابي؛ الصحة المدرسية','تنفيذ الحملة في أسبوعها','تقرير الحملة ومحضر التنسيق']],
  [/الجلسات الإرشادية|الضغوط|الاسترخاء|الأزمات|الفقد/,['من تظهر حاجتهم','توجيه أو جلسات بحسب الحالة','الموجّه الطلابي؛ الجهات المساندة عند الحاجة','تسجيل الإجراءات التي نُفذت','سجل الجلسات والتدخلات']]
 ];
 function detail(item){const key=[item.name,item.target?.replace(/^(core|special):/,'')||''].join(' ');return details.find(x=>x[0].test(key))?.[1]||['الفئة المستهدفة بالبرنامج','وفق التنفيذ المسجل للبرنامج','الموجّه الطلابي؛ الشركاء بحسب النشاط','توثيق ما نُفذ في أسبوعه','سجل التنفيذ والتوثيق'];}
 function planItems(weeks){const out=new Map();weeks.forEach((week,index)=>{
  const list=Array.isArray(week.programs)?week.programs:[{name:week.program,target:week.programTarget}];
  list.forEach(program=>{const name=String(program.name||'').trim();if(!name)return;const target=program.target||(!program.custom?week.programTarget:'')||'';
   const key=(target||'unbound')+'|'+name;let row=out.get(key);if(!row){row={name,target,indices:[],weeks:[]};out.set(key,row)}
   if(!row.indices.includes(index)){row.indices.push(index);row.weeks.push(String(week.w||'الأسبوع '+(index+1)))}
  });
 });return [...out.values()].sort((a,b)=>a.indices[0]-b.indices[0]);}
 const monthNames=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
 function numbers(s){return String(s||'').replace(/[٠-٩]/g,x=>'٠١٢٣٤٥٦٧٨٩'.indexOf(x)).replace(/[۰-۹]/g,x=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(x));}
 function entryDate(value){const s=numbers(value);const n=(s.match(/\d+/g)||[]).map(Number),month=monthNames.findIndex(x=>s.includes(x));if(month>=0&&n.length>=2)return{d:n[0],m:month+1,y:n.find(x=>x>1300)||0};if(n.length>=3){if(n[0]>1300)return{y:n[0],m:n[1],d:n[2]};return{d:n[0],m:n[1],y:n[2]}}return null}
 function termMonths(weeks){const set=new Set();weeks.forEach(w=>{const s=numbers(w.date),m=s.match(/\/(\s*\d{1,2})/g)||[];m.forEach(v=>set.add(Number(v.slice(1).trim())))});return set}
 function executions(item,c,months){const title=item.target.startsWith('core:')?item.target.slice(5):item.name;
  if(item.target.startsWith('special:')||!item.target)return null;
  const stored=read('miikExec_'+title,[]);if(!Array.isArray(stored))return 0;
  return stored.filter(x=>{const d=entryDate(x.date);return d&&d.y===Number(c.year)&&months.has(d.m)}).length;
 }
 function render(){const c=read('miikAcademicContext',{year:'1448',term:'1'}),term=termName(c.term),p=read('miikProfileV58',{});
  const weeks=typeof window.miikPlanRows12==='function'?window.miikPlanRows12(String(c.term||'1')):[];
  if(!weeks.length){window.showMiikNotice?.('طباعة الخطة','اعتمد خطة الموجّه الطلابي أولًا، ثم اطبعها.');return}
  const items=planItems(weeks),months=termMonths(weeks),ministry=new URL('ministry-logo.png',location.href).href,amiriFont=new URL('Amiri-Bold.ttf',location.href).href;
  const rawRegion=String(p.education||p.region||p.educationRegion||'').trim();const regionName=rawRegion.replace(/^الإدارة العامة للتعليم\s*/,'').replace(/^إدارة التعليم\s*/,'').replace(/^(?:بمنطقة|منطقة)\s*/,'').trim();const region=regionName?'الإدارة العامة للتعليم بمنطقة '+regionName:'الإدارة العامة للتعليم بمنطقة ................';
  const header=`<header class="head"><div class="gov">المملكة العربية السعودية<br>وزارة التعليم<br>${E(region)}</div><div class="min"><img src="${ministry}" alt="شعار وزارة التعليم"></div><div class="school">${E(p.school||'اسم المدرسة')}<br>التوجيه الطلابي</div></header>`;
  const page=(body,foot)=>`<section class="page">${header}${body}<footer>${E(foot)}</footer></section>`;
  const table=(heads,rows,cls='')=>`<table class="${cls}" dir="rtl"><thead><tr>${heads.map(h=>`<th>${E(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  const sourceRows=[
   ['تحليل النتائج','نتائج المحطات التقويمية والفصل السابق ومؤشرات التحصيل.'],
   ['إحصاءات المدرسة','الغياب والتأخر الصباحي والسلوكيات التي توفرها إدارة المدرسة وإحالات وكيل شؤون الطلاب.'],
   ['منسوبو المدرسة','ملاحظات الطلاب والمعلمين والوكيل والمدير عن احتياجات الطلبة والبيئة المدرسية.'],
   ['المتابعة الشخصية','ما يرصده الموجّه خلال عمله اليومي دون اعتباره بديلًا عن إحصاءات المدرسة.'],
   ['الحالات السابقة','الحالات المفتوحة والسابقة وما ظهر في سجلات متابعتها.']
  ].map(([a,b])=>`<tr><td>${E(a)}</td><td>${E(b)}</td></tr>`);
  const goalRows=goals.map((g,i)=>`<tr><td>${i+1}</td>${g.map(x=>`<td>${E(x)}</td>`).join('')}</tr>`);
  const opChunks=[];for(let i=0;i<items.length;i+=7)opChunks.push(items.slice(i,i+7));
  const opPages=opChunks.map((chunk,part)=>page(`<h2>رابعًا: الخطة التشغيلية للبرامج والخدمات</h2>${part?'<p class="continued">تابع الجدول</p>':''}`+table(['م','البرنامج أو الخدمة','الفئة المستهدفة','أسلوب التنفيذ','المسؤول والشركاء','أسابيع التنفيذ','المؤشر','الشاهد'],chunk.map((item,j)=>{const meta=detail(item);
    return `<tr><td>${part*7+j+1}</td><td>${E(item.name)}</td><td>${E(meta[0])}</td><td>${E(meta[1])}</td><td>${E(meta[2])}</td><td>${E(item.weeks.join('، '))}</td><td>${E(meta[3])}</td><td>${E(meta[4])}</td></tr>`;}),'ops')+`<p class="note">هذه الخطة تحدد الأعمال والمستفيدين والمؤشرات والشواهد المتوقعة؛ تُعرض النتائج الفعلية في تقارير التنفيذ.</p>`,'الخطة التشغيلية'));
  const programPages=typeof window.miikProgramPlansForAnnual==='function'?window.miikProgramPlansForAnnual(page,weeks):[];
  const weekPages=[];for(let offset=0;offset<weeks.length;offset+=9){const chunk=weeks.slice(offset,offset+9);weekPages.push(page(`<h2>سادسًا: الخطة الأسبوعية التفصيلية</h2>`+table(['م','الأسبوع','التاريخ','المحور / البرنامج','القيمة','أبرز المبادرات','المناسبات','الشاهد'],chunk.map((w,j)=>{const programs=(w.programs||[{name:w.program}]).filter(x=>x.name),titles=programs.map(x=>x.name).join('؛ '),witness=[...new Set(programs.map(x=>detail(x)[4]))].join('؛ ')||'ما يُوثق عند التنفيذ';return `<tr><td>${offset+j+1}</td><td>${E(w.w)}</td><td>${E(w.date)}</td><td>${E(titles||'—')}</td><td>${E(w.value||'—')}</td><td>${E(w.initiatives||'—')}</td><td>${E((w.days||[]).join('، ')||'—')}</td><td>${E(witness)}</td></tr>`;}),'weeks'),'الخطة الأسبوعية'));}
  const cover=page(`<div class="cover"><h1>خطة برامج وخدمات التوجيه الطلابي</h1><h2>${E(term)} للعام الدراسي ${E(c.year)}هـ</h2><div class="names"><span>الموجّه الطلابي<br>${E(p.name||'')}</span><span>مدير المدرسة<br>${E(p.principal||'')}</span></div></div>`,term);
  const basmalaPage='<section class="page basmala-page"><div class="basmala-calligraphy">بِسْمِ اللّٰهِ الرَّحْمَٰنِ الرَّحِيمِ</div></section>';
  const intro=page(`<h2>أولًا: التمهيد ومصادر تحديد الاحتياج</h2><p class="intro">تمثّل هذه الخطة إطارًا تنظيميًا لعمل التوجيه الطلابي خلال ${E(term)}، وتجمع بين الرؤية العامة والبرامج والخدمات والمحاور الأسبوعية، مع مراعاة الجوانب الوقائية والإنمائية والعلاجية واحتياجات الطلبة وواقع المدرسة. وتُنفذ الخطة بمرونة وفق ما يستجد من تعاميم واحتياجات، مع توثيق الأعمال والشواهد ومتابعة أثرها.</p><h3>مصادر تحديد الاحتياج</h3>${table(['المصدر','ما يُستفاد منه'],sourceRows,'sources')}<p class="note">تُستخدم هذه المصادر لفهم واقع المدرسة؛ ويُضاف البرنامج الخاص باحتياج طلبتها إلى خطة الموجّه عند الحاجة.</p>`,'التمهيد ومصادر الاحتياج');
  const objectives=page(`<h2>ثانيًا: الهدف العام والأهداف القابلة للقياس</h2><div class="intro">تنظيم وتنفيذ برامج وخدمات التوجيه الطلابي خلال ${E(term)} بما يدعم التوافق النفسي والتربوي والاجتماعي والمهني للطلبة، ويرفع جودة المتابعة والتوثيق والشراكة مع الأسرة والمدرسة.</div><h3>الأهداف والمؤشرات المقترحة</h3>${table(['م','الهدف','المؤشر','المستهدف','وسيلة القياس'],goalRows,'goals')}<p class="note">تُقرأ مؤشرات التحسن بعد تحديد خط الأساس ومقارنة فترتين متماثلتين؛ وتُقاس أعمال البرامج من التنفيذ المحفوظ، لا من مجرد إدراجها في الخطة.</p>`,'الأهداف والمؤشرات');
  const areas=page(`<h2>ثالثًا: مجالات التوجيه والقيم</h2><div class="fieldgrid">${fields.map(([a,b])=>`<div class="field"><strong>${E(a)}</strong><p>${E(b)}</p></div>`).join('')}</div><h3>القيم والمرتكزات التربوية</h3><div class="values">${['الانضباط','الإيجابية','التسامح','المثابرة','العزيمة','الإتقان','المرونة','الوسطية','الانتماء الوطني'].map(x=>`<span>${E(x)}</span>`).join('')}</div>`,'مجالات التوجيه والقيم');
  const follow=page(`<h2>سابعًا: المتابعة والتقويم</h2><ul class="follow"><li>مراجعة المؤشرات شهريًا مع مدير المدرسة أو وكيل شؤون الطلاب، وتعديل الخطة عند الحاجة.</li><li>تُربط الجلسات والتوجيه الجماعي بالبرنامج أو الخدمة باختيار الموجّه عند التسجيل؛ وتظهر في التقرير المرتبط دون افتراض ربط غير مسجل.</li><li>حفظ شواهد التنفيذ أولًا بأول ورفع ما يلزم منها في نظام نور.</li><li>إعداد تقرير ختامي يقارن المخطط بالمنفذ، ويعرض التحديات والتوصيات للفصل التالي.</li></ul><div class="sign"><div>الموجّه الطلابي<br>${E(p.name||'')}</div><div>مدير المدرسة<br>${E(p.principal||'')}</div></div>`,'المتابعة والتقويم');
  const css=`@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}html,body{margin:0;padding:0;direction:rtl}body{font:11px Tahoma,Arial,sans-serif;color:#29463d;background:white}.page{position:relative;min-height:190mm;break-after:page;page-break-after:always;padding-bottom:10mm}.page:last-child{break-after:auto;page-break-after:auto}.head{display:grid;grid-template-columns:1fr 112px 1fr;align-items:center;border-bottom:2px solid #7e9489;padding:4px 0 8px;min-height:65px}.gov{text-align:right}.school{text-align:left}.gov,.school{font-size:11px;line-height:1.7;font-weight:800}.min{text-align:center}.min img{max-width:105px;max-height:59px}.cover{height:146mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:radial-gradient(circle at 50% 45%,#f6f5ed 0,white 58%)}.basmala{font-size:18px;color:#476b5e;margin-bottom:25px}.cover h1{font-size:30px;color:#315c4e;margin:0 0 13px}.cover h2{font-size:19px;color:#61756c;margin:4px}.names{display:grid;grid-template-columns:1fr 1fr;gap:65px;width:76%;margin-top:40px;font-size:13px;font-weight:800;line-height:2}.page h2{font-size:20px;color:#315c4e;border-right:6px solid #93a57d;padding-right:10px;margin:18px 0 13px}.page h3{font-size:15px;color:#315c4e;margin:13px 0 8px}.intro{font-size:13px;line-height:2.1;margin:0 0 12px}table{border-collapse:collapse;table-layout:fixed;width:100%;direction:rtl}th,td{border:1px solid #a5b4a9;padding:6px 7px;vertical-align:middle;text-align:right;line-height:1.7;overflow-wrap:anywhere}th{background:#e2eae0;color:#294b42;text-align:center;font-weight:900}tbody tr{break-inside:avoid;page-break-inside:avoid}.sources{font-size:12px}.sources td:first-child{width:20%;font-weight:bold;background:#f4f6f1}.goals{font-size:10.5px}.goals th:first-child,.goals td:first-child{width:4%;text-align:center}.goals th:nth-child(2){width:22%}.goals th:nth-child(3){width:29%}.goals th:nth-child(4){width:25%}.goals th:nth-child(5){width:20%}.ops{font-size:8.8px}.ops th,.ops td{padding:5px 5px}.ops th:first-child{width:3%}.ops th:nth-child(2){width:15%}.ops th:nth-child(3){width:12%}.ops th:nth-child(4){width:13%}.ops th:nth-child(5){width:13%}.ops th:nth-child(6){width:11%}.ops th:nth-child(7){width:15%}.ops th:nth-child(8){width:11%}.ops th:nth-child(9){width:7%}.ops td:first-child,.ops td:last-child{text-align:center}.weeks{font-size:9.5px}.weeks th,.weeks td{padding:5px}.weeks th:first-child{width:3%}.weeks th:nth-child(2){width:9%}.weeks th:nth-child(3){width:9%}.weeks th:nth-child(4){width:17%}.weeks th:nth-child(5){width:7%}.weeks th:nth-child(6){width:30%}.weeks th:nth-child(7){width:13%}.weeks th:nth-child(8){width:12%}.weeks td:first-child,.weeks td:nth-child(2),.weeks td:nth-child(3){text-align:center}.fieldgrid{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin:18px 0}.field{background:#e9efe6;border:1px solid #c6d3c7;border-radius:10px;padding:17px;font-size:13px;line-height:1.9}.field strong{font-size:15px;color:#315c4e}.field p{margin:4px 0}.values{display:flex;gap:10px;flex-wrap:wrap}.values span{background:#f2f4ed;border:1px solid #e1e6dc;border-radius:20px;padding:8px 13px;font-weight:bold}.note{font-size:10px;color:#697970;line-height:1.8;margin:10px 0}.continued{text-align:left;color:#718176;margin:-28px 0 8px}.follow{font-size:14px;line-height:2.2}.follow li{margin:12px 0}.sign{display:flex;justify-content:space-around;text-align:center;font-size:13px;font-weight:bold;line-height:2;margin-top:32px}footer{position:absolute;bottom:0;right:0;left:0;border-top:1px solid #d7ddd8;padding-top:4px;color:#718078;text-align:center;font-size:8px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
  const polishCSS=`
   /* Mِعِك's quiet olive and cream print identity; no product logo. */
   @font-face{font-family:MiikAmiri;src:url('${amiriFont}') format('truetype');font-weight:700;font-display:block}
   html,body{width:100%;max-width:100%;overflow-x:hidden}
   .page{width:279mm;max-width:100%;min-height:183mm;margin:0 auto;padding:7mm 7mm 11mm;overflow:hidden;background:linear-gradient(155deg,#fff 0%,#fffdf9 55%,#f9f8f1 100%)}
   .page::before,.page::after{content:'';position:absolute;z-index:0;pointer-events:none;border:1px solid rgba(103,128,108,.14);border-radius:7mm;transform:rotate(45deg)}
   .page::before{width:25mm;height:25mm;left:9mm;top:40mm}
   .page::after{width:20mm;height:20mm;right:9mm;bottom:17mm;background:rgba(222,229,215,.13)}
   .page>*{position:relative;z-index:1}
   .page>footer{position:absolute;bottom:5mm;right:7mm;left:7mm}
   .head{min-height:72px;grid-template-columns:minmax(0,1fr) 112px minmax(0,1fr);padding:7px 2px 13px;border-bottom:2px solid #648071}
   .gov,.school{min-width:0;overflow-wrap:anywhere}
   .page h2{font-size:20px;line-height:1.5;margin:30px 0 19px;padding-right:12px;border-right:5px solid #93a57d}
   .page h3{margin:17px 0 10px;font-size:15px}
   table{width:100%;max-width:100%;table-layout:fixed;margin-top:16px;overflow-wrap:anywhere}
   .cover{position:relative;width:100%;height:136mm;justify-content:flex-start;padding-top:61mm;background:radial-gradient(circle at 50% 50%,rgba(242,244,232,.7),rgba(255,253,247,.65) 46%,rgba(255,255,255,.2) 72%)}
   .cover::before,.cover::after{content:'';position:absolute;border:1px solid rgba(99,127,107,.16);border-radius:4mm;transform:rotate(45deg);background:rgba(154,175,145,.12)}
   .cover::before{width:18mm;height:18mm;top:19mm;left:calc(50% - 17mm)}
   .cover::after{width:16mm;height:16mm;top:22mm;left:calc(50% + 3mm);background:rgba(228,223,200,.22)}
   .cover>*{position:relative;z-index:1}
   .basmala{font-size:22px;font-weight:800;line-height:1.8;color:#355d4d;margin:15px 0 22px}
   .cover h1{font-size:33px;line-height:1.6;margin:0 0 23px;color:#244a3d;font-weight:900}
   .cover h2{border:0;margin:0;padding:0;font-size:19px;color:#5e7467;line-height:1.7;white-space:nowrap}
   .cover .names{margin-top:60px;width:75%;gap:55px;line-height:1.85}
   .basmala-page{height:183mm;min-height:183mm;display:flex;align-items:center;justify-content:center;background:#fffdf9}
   .basmala-page::before,.basmala-page::after{display:none}
   .basmala-calligraphy{width:100%;text-align:center;font:700 54px/1.8 'Aldhabi','Arabic Typesetting',MiikAmiri,'Traditional Arabic',serif;color:#285447;white-space:nowrap}
   .intro{font-size:13.3px;line-height:2.15;background:rgba(243,245,237,.48);border-right:3px solid #a3b398;padding:11px 16px;margin:6px 0 17px;border-radius:3px 8px 8px 3px}
   .sources{font-size:11.5px}
   .goals{font-size:10.3px}
   .ops{font-size:8.6px}
   .weeks{font-size:9.2px}
   .weeks th,.weeks td{padding:5px 6px;line-height:1.6}
   .follow{margin-top:18px;font-size:13.5px}
   .sign{display:grid;grid-template-columns:1fr 1fr;gap:20mm;margin-top:58px;line-height:1.9}
   .sign>div{min-width:0;padding-bottom:18px}
   @media print{html,body{width:279mm}.page{width:279mm;max-width:279mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  `;
  const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>خطة برامج وخدمات التوجيه الطلابي</title><style>${css}${polishCSS}</style></head><body>${[cover,basmalaPage,intro,objectives,areas,...opPages,...programPages,...weekPages,follow].join('')}</body></html>`;
  if(typeof window.printDoc84==='function')window.printDoc84(html);else{const w=window.open('','_blank');if(!w)return window.showMiikNotice?.('الطباعة','اسمح بفتح نافذة الطباعة.');w.document.write(html);w.document.close();const ready=w.document.fonts?.ready||Promise.resolve();Promise.race([ready,new Promise(resolve=>setTimeout(resolve,2500))]).then(()=>w.print())}
 }
 window.miikPrintPlan12=render;
})();
