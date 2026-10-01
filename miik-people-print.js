/* طباعة كشفي الحالات الصحية والفئات الخاصة من بيانات المدرسة والطلاب الفعلية. */
(()=>{
 'use strict';
 const read=key=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value||null}catch(_){return null}};
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const norm=value=>String(value||'').trim().replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ');
 const rank=value=>{const v=norm(value).replace(/الصف|المرحله/g,'');const stage=/متوسط/.test(v)?0:/ثانوي/.test(v)?1:2;const year=/اول|1/.test(v)?0:/ثاني|2/.test(v)?1:/ثالث|3/.test(v)?2:3;return stage*4+year};
 const fallback=value=>String(value||'').trim()||'—';
 function identity(){
  const p=read('miikProfileV58')||{};
  const raw=String(p.education||p.region||p.educationRegion||p.administration||'').trim();
  const region=raw.replace(/^(?:الإدارة العامة للتعليم|إدارة التعليم|التعليم)\s*/,'').replace(/^(?:بمنطقة|منطقة)\s*/,'').trim();
  const school=String(p.school||p.schoolName||document.querySelector('.school-name')?.textContent||'').trim();
  return {education:'الإدارة العامة للتعليم بمنطقة '+(region&&region!=='المنطقة'?region:'القصيم'),school:school&&school!=='اسم المدرسة'&&school!=='المدرسة'?school:'مدرسة التوجيه الطلابي',name:String(p.name||p.fullName||p.counselorName||p.guideName||'').trim()};
 }
 window.v56PrintPeople=function(kind){
  const health=kind==='health', records=read(health?'miikV56Health':'miikV56Special')||[];
  if(!Array.isArray(records)||!records.length){window.showMiikNotice?.('الطباعة','لا توجد سجلات للطباعة.');return}
  const roster=read('miikStudentsV39')||[], students=new Map();
  (Array.isArray(roster)?roster:[]).forEach(s=>{const key=norm(s.name);if(key&&!students.has(key))students.set(key,s)});
  const rows=records.map(x=>{const s=students.get(norm(x.student))||{};return {name:x.student||'',grade:s.grade||x.grade||'',section:s.section||x.section||'',type:x.type||'',note:x.note||''}}).sort((a,b)=>rank(a.grade)-rank(b.grade)||fallback(a.section).localeCompare(fallback(b.section),'ar',{numeric:true})||a.name.localeCompare(b.name,'ar'));
  const p=identity(),title=health?'سجل الحالات الصحية':'سجل الفئات الخاصة',label=health?'الحالة الصحية':'الفئة الخاصة';
  const logo=new URL('ministry-logo.png',location.href).href;
  const body=rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.name)}</td><td>${esc(fallback(r.grade))}</td><td>${esc(fallback(r.section))}</td><td>${esc(r.type)}</td><td>${esc(r.note)}</td></tr>`).join('');
  const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{margin:0;background:#fff;color:#213e34;font-family:Tahoma,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{max-width:210mm;min-height:285mm;margin:0 auto;background:#fff;padding:9mm 7mm}.head{display:grid;grid-template-columns:minmax(0,1fr) 84px minmax(0,1fr);align-items:center;gap:8px;border-bottom:2px solid #49695c;padding-bottom:8px;line-height:1.65;font-size:12px;font-weight:700}.head .right{text-align:right}.head .left{text-align:left}.head img{width:80px;max-height:70px;object-fit:contain;margin:auto}h1{text-align:center;font-size:20px;margin:23px 0 18px}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}col.num{width:5%}col.student{width:27%}col.grade{width:15%}col.section{width:10%}col.type{width:19%}col.note{width:24%}th,td{border:1px solid #aabbb0;padding:8px 4px;text-align:center!important;vertical-align:middle;overflow-wrap:anywhere;line-height:1.55}th{background:#e8efe8;font-weight:700}tbody tr{break-inside:avoid}.sign{text-align:center;margin:52px 0 18px;font-size:11px;line-height:1.7;font-weight:600}.print-button{display:block;margin:15px auto;padding:9px 24px;border:0;border-radius:8px;background:#436555;color:#fff;cursor:pointer;font:inherit}@media print{body{background:#fff}.sheet{padding:0;min-height:0;max-width:none}.print-button{display:none}thead{display:table-header-group}}
  </style></head><body><main class="sheet"><header class="head"><div class="right">المملكة العربية السعودية<br>وزارة التعليم<br>${esc(p.education)}</div><img src="${esc(logo)}" alt="وزارة التعليم"><div class="left">${esc(p.school)}<br>التوجيه الطلابي</div></header><h1>${title}</h1><table><colgroup><col class="num"><col class="student"><col class="grade"><col class="section"><col class="type"><col class="note"></colgroup><thead><tr><th>م</th><th>اسم الطالب</th><th>الصف</th><th>الفصل</th><th>${label}</th><th>ملاحظات</th></tr></thead><tbody>${body}</tbody></table><div class="sign">الموجّه الطلابي: ${esc(p.name)}</div></main><button class="print-button" onclick="window.print()">طباعة</button></body></html>`;
  const popup=window.open('','_blank');
  if(!popup){window.showMiikNotice?.('الطباعة','يرجى السماح بفتح نافذة الطباعة.');return}
  popup.document.open();popup.document.write(html);popup.document.close();
 };
})();
