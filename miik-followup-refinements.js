/* توحيد أدوات المتابعة ودراسة الحالة والتوجيه الجماعي. */
(()=>{
 'use strict';
 const AKEY='miik-demo-actions',GKEY='miik-group-guidance-v1';
 const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=k=>{try{const x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
 const write=(k,x)=>localStorage.setItem(k,JSON.stringify(x));
 const notice=(h,t)=>window.showMiikNotice?.(h,t);

 // لا يحتاج هذان النموذجان زر رؤوس الأقلام العام.
 const openBefore=window.openAction;
 window.openAction=function(type){const result=openBefore.apply(this,arguments);setTimeout(()=>{
   const inline=document.querySelector('#actionModal .miik-shalwa-inline');
   if(type==='followup'||type==='emergency'){inline?.remove();return}
   if(type==='case'){inline?.remove();mountCaseGuide()}
 },100);return result};

 let editingCase='';
 const oldClose=window.closeAction;
 window.closeAction=function(){editingCase='';return oldClose?.apply(this,arguments)};
 const oldEdit=window.v55Edit;
 window.v55Edit=function(id,type,sub){if(type!=='case')return oldEdit?.apply(this,arguments);
   const x=read(AKEY).find(z=>String(z._v55id)===String(id));
   if(!x)return notice('دراسة الحالة','تعذر العثور على الدراسة. أعد فتح السجل.');
   editingCase=String(id);window.openAction('case');
   setTimeout(()=>{
     document.getElementById('actionStudent').value=x.student||'';
     document.getElementById('actionDate').value=x.date||'';
     ['f1','f2','f3','f4'].forEach((k,i)=>{const el=document.getElementById(k);if(el)el.value=x.caseFields?.[k]??x.values?.[i]??''});
     document.getElementById('actionTitle').textContent='تعديل دراسة الحالة';
   },160);
 };
 const oldSave=window.saveAction;
 window.saveAction=function(e){if(currentAction!=='case')return oldSave?.apply(this,arguments);
   e?.preventDefault();const fields=Object.fromEntries(['f1','f2','f3','f4'].map(k=>[k,document.getElementById(k)?.value.trim()||'']));
   const student=document.getElementById('actionStudent')?.value.trim(),date=document.getElementById('actionDate')?.value;
   if(!student||!date||!fields.f1){notice('دراسة الحالة','أكمل اسم الطالب والتاريخ وسبب الدراسة.');return false}
   const a=read(AKEY),i=editingCase?a.findIndex(x=>String(x._v55id)===editingCase):-1;
   if(editingCase&&i<0){notice('دراسة الحالة','تعذر العثور على السجل الأصلي.');return false}
   const person=read('miikStudentsV39').find(x=>x.name===student);
   const record={...(i>=0?a[i]:{}),_v55id:i>=0?a[i]._v55id:'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),type:'case',title:'دراسة حالة',student,date,caseFields:fields,values:Object.values(fields),summary:[fields.f1,fields.f2].filter(Boolean).join(' · '),miik009Class:i>=0?a[i].miik009Class:{grade:person?.grade||'',section:person?.section||''}};
   if(i>=0)a[i]=record;else a.unshift(record);
   write(AKEY,a);const updated=i>=0;editingCase='';window.closeAction();window.v55Records('case');
   notice('دراسة الحالة',updated?'تم حفظ التعديل على الدراسة نفسها.':'تم حفظ دراسة الحالة.');return false;
 };

 // مساعد مقابلة منظم، لا يضيف تشخيصات أو إجراءات أو نتائج لم يذكرها الموجّه.
 const questions=[
  {label:'متى لاحظت المشكلة، وكم مرة تكررت؟',key:'frequency'},
  {label:'ماذا قال الطالب عن السبب أو الظروف المرتبطة بها؟',key:'student'},
  {label:'ما أثرها في الدراسة أو الحضور أو علاقاته؟',key:'effect'},
  {label:'ما المعلومات التي تحققت منها مع المعلم أو الأسرة أو سجلات المدرسة؟',key:'verified'},
  {label:'ما الإجراء الذي اتخذته بالفعل أثناء المقابلة أو بعدها؟',key:'action'},
  {label:'هل ظهرت نتيجة حتى الآن، وما المتابعة المقترحة؟',key:'result'}
 ];
 let guide={step:0,answers:{}};
 function tailoredQuestion(q){const reason=guide.answers.reason||'',said=guide.answers.student||'';
   if(q.key==='frequency'&&/غياب|تأخر/.test(reason))return 'متى بدأت حالات '+reason+'، وكم مرة تكررت حسب السجل؟';
   if(q.key==='frequency'&&/نوم|نعاس/.test(reason))return 'متى ينام الطالب داخل الفصل، وكم مرة لاحظت ذلك؟';
   if(q.key==='student'&&/غياب|تأخر/.test(reason))return 'ماذا ذكر الطالب عن أسباب عدم انتظام حضوره؟';
   if(q.key==='effect'&&/سهر|نوم/.test(said))return 'هل لاحظت أثر السهر في تركيزه أو حضوره أو تحصيله؟';
   if(q.key==='verified'&&/أسرة|منزل/.test(said))return 'ما الذي أمكن التحقق منه مع الأسرة أو المعلمين، بعد موافقة الموجّه والإجراءات المعتادة؟';
   return q.label;
 }
 function mountCaseGuide(){const target=document.getElementById('dynamicFields');if(!target||document.getElementById('miikCaseGuide'))return;
   const box=document.createElement('div');box.id='miikCaseGuide';box.className='miik-case-guide';
   box.innerHTML='<button type="button" class="miik-guide-toggle" onclick="miikCaseGuideStart()">✦ معك طير شلوى يخدمك</button><div id="miikGuidePanel" hidden></div>';
   target.parentElement.insertBefore(box,target);guide={step:0,answers:{}};
 }
 function guidePanel(){return document.getElementById('miikGuidePanel')}
 window.miikCaseGuideStart=function(){const reason=document.getElementById('f1')?.value.trim();if(!reason){notice('معك طير شلوى يخدمك','اكتب سبب الدراسة بكلمات مختصرة أولًا.');document.getElementById('f1')?.focus();return}
   guide={step:0,answers:{reason}};guidePanel().hidden=false;renderQuestion()};
 function renderQuestion(){const p=guidePanel();if(!p)return;
   const q=questions[guide.step];
   p.innerHTML=`<p class="miik-guide-context">سبب الدراسة: ${E(guide.answers.reason)} · سؤال ${guide.step+1} من ${questions.length}</p><label>${E(tailoredQuestion(q))}<textarea id="miikGuideAnswer" rows="3" placeholder="أجب برؤوس أقلام مما ذكره الطالب أو تحققت منه"></textarea></label><div class="miik-guide-actions"><button type="button" onclick="miikCaseGuideNext()">${guide.step===questions.length-1?'مراجعة المسودة':'السؤال التالي'}</button><button type="button" onclick="miikCaseGuideFinish()">انتهيت، أعد المسودة</button></div>`;
   document.getElementById('miikGuideAnswer').value=guide.answers[q.key]||'';
 }
 window.miikCaseGuideNext=function(){const q=questions[guide.step];guide.answers[q.key]=document.getElementById('miikGuideAnswer')?.value.trim()||'';
   if(guide.step<questions.length-1){guide.step++;renderQuestion()}else window.miikCaseGuideFinish()};
 window.miikCaseGuideFinish=function(){const q=questions[guide.step];if(q)guide.answers[q.key]=document.getElementById('miikGuideAnswer')?.value.trim()||'';
   const a=guide.answers,parts=[];
   if(a.frequency)parts.push('تكرار الملاحظة: '+a.frequency);
   if(a.student)parts.push('إفادة الطالب: '+a.student);
   if(a.effect)parts.push('الأثر الملحوظ: '+a.effect);
   if(a.verified)parts.push('معلومات تم التحقق منها: '+a.verified);
   const draft={f1:a.reason||'',f2:parts.join('\n'),f3:a.action?'إجراءات نُفذت: '+a.action:'',f4:a.result||'النتيجة قيد المتابعة؛ تُستكمل بعد ظهورها.'};
   for(const [k,v] of Object.entries(draft)){const el=document.getElementById(k);if(el&&v)el.value=v}
   const p=guidePanel();if(p)p.innerHTML='<p>وُزعت إجاباتك على حقول الدراسة. راجع الصياغة والوقائع، وعدّلها قبل الحفظ.</p>';
 };

 const topics={
  'الغياب المتكرر':'توضيح أثر الغياب المتكرر في التعلم والانضباط، ومناقشة أسباب الغياب وسبل تحسين المواظبة.',
  'التأخر الصباحي':'توضيح أثر التأخر الصباحي، وتعزيز الالتزام بوقت الحضور والتعاون مع الأسرة عند الحاجة.',
  'التأخر الدراسي':'التعرف على عوامل التعثر الدراسي، والتعريف بأساليب تنظيم المذاكرة والاستفادة من الدعم المدرسي.',
  'التفوق الدراسي':'تعزيز الاستمرار في التفوق، وتنمية مهارات التعلم الذاتي وإدارة الوقت.',
  'التنمر':'تعزيز احترام الآخرين ورفض التنمر، والتعريف بطرق طلب المساعدة والإبلاغ الآمن.',
  'قلق الاختبارات':'التعريف بطرق الاستعداد للاختبارات وتنظيم الوقت ومهارات التعامل مع القلق.',
  'تنظيم الوقت':'مساعدة الطلاب على تحديد الأولويات ووضع جدول مناسب للدراسة والراحة.',
  'الانضباط المدرسي':'تعزيز الالتزام بأنظمة المدرسة والمسؤولية عن السلوك.',
  'السلامة الرقمية':'تعزيز الاستخدام المسؤول للتقنية وحماية الخصوصية وطلب المساعدة عند التعرض لأذى رقمي.'
 };
 const groupRows=()=>read(GKEY);
 function classes(){const a=read('miikStudentsV39');return [...new Map(a.filter(x=>x.grade).map(x=>[String(x.grade)+'|'+String(x.section||''),{grade:x.grade,section:x.section||''}])).values()].sort((a,b)=>a.grade.localeCompare(b.grade,'ar')||a.section.localeCompare(b.section,'ar',{numeric:true}))}
 const oldGroup=window.v171GroupGuidance;
 window.v171GroupGuidance=function(){oldGroup?.apply(this,arguments);const tiles=document.querySelectorAll('#moduleGrid .v55-tile');if(tiles[2]){tiles[2].querySelector('b').textContent='سجل التوجيه الجماعي';tiles[2].querySelector('span').textContent='عرض التوجيهات السابقة وتعديلها وحذفها وطباعة السجل.';tiles[2].onclick=e=>{e.preventDefault();e.stopPropagation();window.v171Register()}}};
 window.miikGroupTopic=function(){const k=document.getElementById('g171title')?.value;document.getElementById('g171CustomWrap').hidden=k!=='أخرى';if(topics[k])document.getElementById('g171goals').value=topics[k]};
 window.miikGroupAll=function(){const yes=document.getElementById('g171All')?.checked;document.querySelectorAll('.miik-group-class input').forEach(x=>{x.disabled=yes;if(yes)x.checked=false})};
 window.v171Add=function(id=''){const x=groupRows().find(y=>y.id===id)||{},values=classes(),selected=new Set(x.targets||String(x.target||'').split('، ').filter(Boolean));
   const preset=x.title?(Object.prototype.hasOwnProperty.call(topics,x.title)?x.title:'أخرى'):'الغياب المتكرر',all=x.target==='جميع طلاب المدرسة';
   window.showMiikDialog(`<h2>${id?'تعديل التوجيه الجماعي':'إضافة توجيه جماعي'}</h2><form id="g171Form"><div class="miik171-form"><label>عنوان التوجيه الجماعي<select id="g171title" onchange="miikGroupTopic()">${Object.keys(topics).map(k=>`<option value="${E(k)}" ${preset===k?'selected':''}>${E(k)}</option>`).join('')}<option value="أخرى" ${preset==='أخرى'?'selected':''}>أخرى</option></select></label><label id="g171CustomWrap" ${preset==='أخرى'?'':'hidden'}>عنوان آخر<input id="g171Custom" value="${preset==='أخرى'?E(x.title||''):''}"></label><label>طريقة التوجيه<select id="g171method"><option value="">اختر الطريقة</option>${['دورة','محاضرة','لقاء'].map(k=>`<option ${x.method===k?'selected':''}>${k}</option>`).join('')}</select></label><label class="miik171-wide">الفئة المستهدفة <span class="miik-exam-help">اختر فصلًا أو أكثر، أو جميع طلاب المدرسة.</span><div><label><input type="checkbox" id="g171All" ${all?'checked':''} onchange="miikGroupAll()"> جميع طلاب المدرسة</label></div><div class="miik-group-classes">${values.map(c=>{const label=[c.grade,c.section].filter(Boolean).join(' — ');return `<label class="miik-group-class"><input type="checkbox" value="${E(label)}" ${selected.has(label)&&!all?'checked':''} ${all?'disabled':''}>${E(label)}</label>`}).join('')}</div></label><label>التاريخ الهجري<input id="g171date" readonly required placeholder="اختر التاريخ الهجري" value="${E(x.date||'')}" onclick="openHijriPicker(this)"></label><label>وقت التنفيذ <span class="miik-exam-help">بنظام 12 ساعة</span><div class="miik-group-time"><select id="g171period"><option value="ص" ${x.time?.includes('ص')?'selected':''}>AM · صباحًا</option><option value="م" ${x.time?.includes('م')?'selected':''}>PM · مساءً</option></select><select id="g171hour">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${parseInt(x.time,10)===i+1?'selected':''}>${i+1}</option>`).join('')}</select><select id="g171minute">${['00','15','30','45'].map(v=>`<option ${x.time?.includes(':'+v)?'selected':''}>${v}</option>`).join('')}</select></div></label><label class="miik171-wide">أهداف التوجيه الجماعي<textarea id="g171goals">${E(x.goals??topics[preset]??'')}</textarea></label><label class="miik171-wide">ملاحظات<textarea id="g171notes">${E(x.notes||'')}</textarea></label></div><div class="dialog-actions"><button type="submit" class="dialog-primary">حفظ</button><button type="button" class="dialog-cancel" onclick="closeMiikDialog()">إلغاء</button></div></form>`);
   document.getElementById('g171Form').onsubmit=e=>{e.preventDefault();window.v171Save(id)};
 };
 window.v171Save=function(id){const get=k=>document.getElementById('g171'+k)?.value.trim()||'',title=get('title')==='أخرى'?get('Custom'):get('title'),all=document.getElementById('g171All')?.checked,targets=[...document.querySelectorAll('.miik-group-class input:checked')].map(x=>x.value);
   if(!title||!get('method')||!get('date')||(!all&&!targets.length)){notice('التوجيه الجماعي','أكمل العنوان والطريقة والتاريخ والفئة المستهدفة.');return}
   const a=groupRows(),i=a.findIndex(x=>x.id===id),old=a[i]||{},x={...old,id:id||'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),title,method:get('method'),target:all?'جميع طلاب المدرسة':targets.join('، '),targets:all?[]:targets,date:get('date'),time:get('hour')+':'+get('minute')+' '+get('period'),goals:get('goals'),notes:get('notes'),evidence:old.evidence||[]};
   if(i<0)a.unshift(x);else a[i]=x;write(GKEY,a);window.closeMiikDialog();window.v171Register();notice('التوجيه الجماعي','تم حفظ التوجيه.');
 };
 window.v171Register=function(){const a=groupRows(),g=document.getElementById('moduleGrid');if(!g)return;
   g.innerHTML=`<div class="miik171-wrap"><div class="miik171-top"><h3>سجل التوجيه الجماعي</h3><button class="miik171-btn" onclick="v171GroupGuidance()">رجوع</button></div><div class="miik171-actions"><button class="miik171-btn primary" onclick="v171Add()">إضافة توجيه</button><button class="miik171-btn" onclick="miikGroupPrintRegister()">طباعة السجل</button><button class="miik171-btn" onclick="v171Report()">تقرير التوجيه الجماعي المفصل</button></div>${a.length?`<div class="miik-exam-scroll"><table class="miik171-table"><thead><tr><th>م</th><th>العنوان</th><th>الطريقة</th><th>الفئة المستهدفة</th><th>التاريخ</th><th>إدارة</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td>${i+1}</td><td>${E(x.title)}</td><td>${E(x.method)}</td><td>${E(x.target)}</td><td>${E(x.date)}</td><td><button class="miik171-btn" onclick="v171Add('${E(x.id)}')">تعديل</button> <button class="miik171-btn" onclick="miikGroupDelete('${E(x.id)}')">حذف</button></td></tr>`).join('')}</tbody></table></div>`:'<p>لا توجد توجيهات جماعية مسجلة.</p>'}</div>`;
 };
 window.miikGroupDelete=function(id){const x=groupRows().find(z=>z.id===id);if(!x)return;window.showMiikDialog(`<h2>حذف التوجيه</h2><p>هل أنت متأكد من حذف «${E(x.title)}» وشواهده؟</p><div class="dialog-actions"><button id="miikGroupConfirm" type="button" class="dialog-primary">نعم، حذف</button><button type="button" class="dialog-cancel" onclick="closeMiikDialog()">إلغاء</button></div>`);document.getElementById('miikGroupConfirm').onclick=()=>{write(GKEY,groupRows().filter(z=>z.id!==id));window.closeMiikDialog();window.v171Register()}};
 window.miikGroupPrintRegister=function(){const a=groupRows();if(!a.length)return notice('الطباعة','لا توجد توجيهات للطباعة.');let p={};try{p=JSON.parse(localStorage.getItem('miikProfileV58')||'{}')}catch(_){}const logo=new URL('ministry-logo.png',location.href).href,w=window.open('','_blank');if(!w)return;w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>سجل التوجيه الجماعي</title><style>@page{size:A4;margin:14mm}body{font-family:Tahoma,Arial;color:#29463d}.head{display:grid;grid-template-columns:1fr 80px 1fr;align-items:center;border-bottom:2px solid #829582;padding-bottom:8px;font-size:11px;font-weight:bold}.head img{width:70px}.school{text-align:left}h1{text-align:center;font-size:20px;margin:24px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #aeb9ae;padding:8px;text-align:center}th{background:#e7eee6}.sign{text-align:center;margin-top:28px;line-height:2}</style><div class="head"><div>المملكة العربية السعودية<br>وزارة التعليم<br>${E(p.education||p.region||'')}</div><img src="${logo}"><div class="school">${E(p.school||'')}<br>التوجيه الطلابي</div></div><h1>سجل التوجيه الجماعي</h1><table><thead><tr><th>م</th><th>العنوان</th><th>الطريقة</th><th>الفئة المستهدفة</th><th>التاريخ</th><th>الوقت</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td>${i+1}</td><td>${E(x.title)}</td><td>${E(x.method)}</td><td>${E(x.target)}</td><td>${E(x.date)}</td><td>${E(x.time)}</td></tr>`).join('')}</tbody></table><div class="sign"><b>الموجّه الطلابي:</b><br>${E(p.name||'')}</div>`);w.document.close();setTimeout(()=>w.print(),350)};
})();
