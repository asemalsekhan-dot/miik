/* نصوص مِعِك حسب جنس المدرسة. الإعداد المحفوظ هو مصدر القرار الوحيد. */
(function(global){
  'use strict';
  const pairs=[
    ['الموجّه الذكي','الموجّه الذكي'], // اسم المنتج ثابت
    ['الموجه الذكي','الموجه الذكي'],
    ['الموجّه الطلابي','الموجّهة الطلابية'],
    ['الموجه الطلابي','الموجهة الطلابية'],
    ['موجّه طلابي','موجّهة طلابية'],
    ['موجه طلابي','موجهة طلابية'],
    ['مدير المدرسة','مديرة المدرسة'],
    ['مديرتنا','مديرتنا'],
    ['معلّمو المواد','معلّمات المواد'],
    ['معلمو المواد','معلمات المواد'],
    ['معلمي المواد','معلمات المواد'],
    ['معلم المادة','معلمة المادة'],
    ['المعلمين','المعلمات'],
    ['المعلمون','المعلمات'],
    ['الطلاب المتعثرون','الطالبات المتعثرات'],
    ['الطلاب المتراجعون','الطالبات المتراجعات'],
    ['الطلاب المتفوقون','الطالبات المتفوقات'],
    ['الطلاب المسجلين','الطالبات المسجلات'],
    ['الطلاب المستفيدون','الطالبات المستفيدات'],
    ['طالب مطابق','طالبة مطابقة'],
    ['طالب موجود','طالبة موجودة'],
    ['طالب جديد','طالبة جديدة'],
    ['الطالب الحالي','الطالبة الحالية'],
    ['الطالب المتفوق','الطالبة المتفوقة'],
    ['الطالب المتعثر','الطالبة المتعثرة'],
    ['الطلاب المحسنون','الطالبات المحسنات'],
    ['الطالبات','الطالبات'],
    ['للطلاب','للطالبات'],
    ['لطلاب','لطالبات'],
    ['بالطلاب','بالطالبات'],
    ['للموجّه الطلابي','للموجّهة الطلابية'],
    ['بالموجّه الطلابي','بالموجّهة الطلابية'],
    ['للموجه الطلابي','للموجهة الطلابية'],
    ['الطلاب','الطالبات'],
    ['طلاب','طالبات'],
    ['الطالب','الطالبة'],
    ['للطالب','للطالبة'],
    ['بالطالب','بالطالبة'],
    ['طالباً','طالبةً'],
    ['طالبًا','طالبةً'],
    ['طالب','طالبة'],
    ['الموجّه','الموجّهة'],
    ['الموجه','الموجهة'],
    ['المعلم','المعلمة'],
    ['المتعثرون','المتعثرات'],
    ['المتراجعون','المتراجعات'],
    ['المتفوقون','المتفوقات'],
    ['المتعثرين','المتعثرات'],
    ['المتراجعين','المتراجعات'],
    ['المتفوقين','المتفوقات'],
    ['المستفيدون','المستفيدات'],
    ['المستفيدين','المستفيدات'],
    ['مُعد التقرير','مُعدّة التقرير'],
    ['معد التقرير','معدة التقرير'],
    ['حيّاك','حيّاكِ'],
    ['حياك','حياكِ']
  ].sort((a,b)=>b[0].length-a[0].length);
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=new RegExp('(?<![\\p{L}\\p{M}])('+pairs.map(x=>escape(x[0])).join('|')+')(?![\\p{L}\\p{M}])','gu');
  const lookup=new Map(pairs);
  function gender(){
    if(global.miikSchoolGenderOverride)return global.miikSchoolGenderOverride;
    try{return JSON.parse(localStorage.getItem('miikProfileV58')||'{}')?.gender==='بنات'?'بنات':'بنين'}
    catch(_){return 'بنين'}
  }
  function format(source){
    const s=String(source??'');
    return gender()==='بنات'?s.replace(pattern,match=>lookup.get(match)):s;
  }
  const known=new WeakMap();
  function updateText(node){
    if(!node?.parentElement || node.parentElement.closest('script,style,textarea,code,.brand'))return;
    const now=node.data,last=known.get(node),source=last?.rendered===now?last.source:now;
    const rendered=format(source);
    known.set(node,{source,rendered});
    if(rendered!==now)node.data=rendered;
  }
  function updateAttribute(el,name){
    const now=el.getAttribute(name),key=name+'Original',last=el.__miikGenderAttrs?.[key];
    const source=last?.rendered===now?last.source:now,rendered=format(source);
    (el.__miikGenderAttrs??={})[key]={source,rendered};
    if(rendered!==now)el.setAttribute(name,rendered);
  }
  function apply(doc){
    if(!doc?.body)return;
    const walk=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT);
    while(walk.nextNode())updateText(walk.currentNode);
    for(const el of doc.querySelectorAll('[placeholder],[title],[aria-label]')){
      if(el.closest('.brand'))continue;
      for(const name of ['placeholder','title','aria-label'])if(el.hasAttribute(name))updateAttribute(el,name);
    }
  }
  const hookedFrames=new WeakSet();
  function attachFrame(frame){
    try{
      const view=frame.contentWindow;
      if(!view||hookedFrames.has(view))return;
      if(!view.document)return; // إطارات المواقع الأخرى لا تُمس.
      hookedFrames.add(view);
      const nativePrint=view.print.bind(view);
      view.print=function(...args){apply(view.document);return nativePrint(...args)};
      view.addEventListener('beforeprint',()=>apply(view.document));
    }catch(_){}
  }
  function attachPrintFrames(){
    for(const frame of document.querySelectorAll('iframe')){
      if(!frame.__miikGenderPrintListener){
        frame.__miikGenderPrintListener=true;
        frame.addEventListener('load',()=>attachFrame(frame));
      }
      attachFrame(frame);
    }
  }
  global.miikGenderText=format;
  global.miikGenderRefresh=()=>apply(document);
  global.miikGenderSourceText=el=>{
    if(!el)return '';
    const walk=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    let source='';
    while(walk.nextNode()){
      const n=walk.currentNode,last=known.get(n);
      source+=last?.rendered===n.data?last.source:n.data;
    }
    return source;
  };
  const schedule=()=>queueMicrotask(()=>{apply(document);attachPrintFrames()});
  const start=()=>{
    apply(document);
    attachPrintFrames();
    new MutationObserver(schedule).observe(document.body,{childList:true,characterData:true,subtree:true});
    global.addEventListener('beforeprint',()=>apply(document));
    global.addEventListener('storage',event=>{if(event.key==='miikProfileV58')schedule()});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  // تقارير مِعِك التي تفتح صفحة طباعة جديدة تتبع الإعداد نفسه.
  const open=global.open;
  if(typeof open==='function')global.open=function(url,...args){
    const popup=open.call(this,url,...args);
    if(popup && (!url || url==='about:blank'))try{
      const nativePrint=popup.print.bind(popup);
      popup.print=function(...printArgs){try{apply(popup.document)}catch(_){}return nativePrint(...printArgs)};
      popup.addEventListener('beforeprint',()=>{try{apply(popup.document)}catch(_){} });
    }catch(_){}
    return popup;
  };
})(window);
