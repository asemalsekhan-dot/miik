/* The nine approved positive-behaviour values; shared plan distribution. */
(()=>{'use strict';
 const values=['الانضباط','الإيجابية','التسامح','المثابرة','العزيمة','الإتقان','المرونة','الوسطية','الانتماء الوطني'];
 const schedules={1:['الانضباط','الإيجابية','التسامح','الوسطية','الانتماء الوطني','المثابرة','الإتقان','المرونة','العزيمة','الانضباط','الإيجابية','الوسطية','الانضباط','المثابرة','المرونة','التسامح','الإتقان','الانضباط'],2:['الانضباط','الإيجابية','المثابرة','الوسطية','المرونة','الانتماء الوطني','الانضباط','الإتقان','التسامح','الإيجابية','العزيمة','الإتقان','الوسطية','المرونة','الانضباط','المثابرة','العزيمة','الإتقان','الانضباط']};
 function distribute(rows,term){const list=rows.map((r,i)=>({...r,value:schedules[String(term)]?.[i]||values[i%values.length]})),locked=new Set();list.forEach((r,i)=>{const event=[...(r.days||[]),...(r.extras||[]).map(x=>x.text||'')].join(' ');let value='';if(/اليوم الوطني|يوم العلم السعودي|يوم التأسيس/.test(event))value='الانتماء الوطني';else if(i===0||i===list.length-1||({1:[12],2:[2,6,14]}[String(term)]||[]).includes(i)||/بعد الإجازة/.test(r.initiatives||''))value='الانضباط';else if(/الوسطية/.test(event))value='الوسطية';else if(/التسامح/.test(event))value='التسامح';else if(/اختبار|التهيئة النهائية|الجاهزية النهائية/.test(r.program||''))value='الإتقان';if(value){r.value=value;locked.add(i)}});
 // Keep every value represented if event overrides consume its original week.
 for(const v of values){if(list.some(r=>r.value===v))continue;const counts=new Map(values.map(v=>[v,list.filter(r=>r.value===v).length]));const i=list.findIndex((r,i)=>!locked.has(i)&&counts.get(r.value)>1);if(i>=0)list[i].value=v}
 return list;
 }
 window.MiikNineValues={values,distribute};
})();
