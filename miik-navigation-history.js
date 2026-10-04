/* Make browser Back navigate within the current app session. */
(()=>{'use strict';
 const screen=()=>{
  if(document.getElementById('studentFile')?.classList.contains('show')){const meta=document.getElementById('fileMeta')?.textContent||'',match=meta.match(/^(.*?)\s*·\s*الفصل\s*(.*)$/);return{kind:'file',name:document.getElementById('fileName')?.textContent||'',grade:match?.[1]||'',section:match?.[2]||''}}
  if(document.getElementById('modulePage')?.classList.contains('show'))return{kind:'module',title:document.getElementById('moduleTitle')?.textContent||'',desc:document.getElementById('moduleDesc')?.textContent||''};
  if(document.getElementById('studentsPage')?.classList.contains('show'))return{kind:'students'};
  if(document.getElementById('calendarPage')?.classList.contains('show'))return{kind:'calendar'};
  return{kind:'home'}
 };
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 let replay=false,last=screen(),pending=false;
 try{history.replaceState({miik:last},'')}catch(_){}
 function sync(){if(replay||pending)return;pending=true;queueMicrotask(()=>{pending=false;if(replay)return;const next=screen();if(same(last,next))return;last=next;try{history.pushState({miik:next},'')}catch(_){}})}
 const hide=window.hideAllPages;
 if(typeof hide==='function')window.hideAllPages=function(){const result=hide.apply(this,arguments);sync();return result};
 const home=window.goHome;
 if(typeof home==='function')window.goHome=function(){const result=home.apply(this,arguments);sync();return result};
 function modalOpen(){return document.getElementById('actionModal')?.classList.contains('show')||document.getElementById('miikDialog')?.classList.contains('show')||!!document.getElementById('v87EvOverlay')}
 function closeModal(){if(document.getElementById('actionModal')?.classList.contains('show'))window.closeAction?.();else if(document.getElementById('miikDialog')?.classList.contains('show'))window.closeMiikDialog?.();else document.getElementById('v87EvOverlay')?.remove()}
 function restore(to){
  if(to.kind==='module'&&to.title)window.openModule?.(to.title,to.desc);
  else if(to.kind==='file'&&to.name)window.openStudent?.(to.name,to.grade,to.section,'');
  else if(to.kind==='students')window.openStudents?.();
  else if(to.kind==='calendar')window.openCalendar?.();
  else window.goHome?.();
 }
 window.addEventListener('popstate',event=>{
  if(modalOpen()){closeModal();try{history.pushState({miik:last},'')}catch(_){}return}
  const target=event.state?.miik;if(!target)return;
  replay=true;restore(target);
  queueMicrotask(()=>{last=screen();replay=false})
 });
})();
