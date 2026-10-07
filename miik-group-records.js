/* Shared participant model for legacy and current group sessions. */
(()=>{'use strict';
 const S='miikStudentsV39', A='miik-demo-actions';
 const N=x=>String(x??'').trim().replace(/\s+/g,' ');
 const E=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=k=>{const v=JSON.parse(localStorage.getItem(k)||'[]');if(!Array.isArray(v))throw Error('Invalid records');return v};
 const isGroup=x=>x?.type==='session'&&(/جماعية/.test(x.values?.[0]||'')||Array.isArray(x.groupStudents));
 function members(x,roster=read(S)){
  if(!isGroup(x))return [];
  const names=Array.isArray(x.groupStudents)&&x.groupStudents.length?x.groupStudents:String(x.values?.[3]||'').split('|').filter(Boolean);
  const list=names.length?names:[x.student].filter(Boolean);
  return list.map((name,i)=>{const stored=x.groupParticipants?.find(p=>N(p.name)===N(name)),id=stored?.id||x.groupStudentIds?.[i]|| (i===0?x.studentId:'');let s=id?roster.find(s=>s.miikId===id):null;if(!s){const matches=roster.filter(s=>N(s.name)===N(name));if(matches.length===1)s=matches[0]}
   return {name:N(name),id:s?.miikId||id||'',stage:s?.stage||stored?.stage||'',grade:s?.grade||stored?.grade||(i===0?x.miik009Class?.grade:'')||'',section:s?.section||stored?.section||(i===0?x.miik009Class?.section:'')||''};});
 }
 function assign(x,p){const y={...x,groupParticipants:p,groupStudents:p.map(p=>p.name),groupStudentIds:p.map(p=>p.id),student:p[0]?.name||'',studentId:p[0]?.id||''};y.values=[...(x.values||[])];y.values[3]=p.map(p=>p.name).join('|');if(p[0])y.miik009Class={stage:p[0].stage,grade:p[0].grade,section:p[0].section};return y}
 function display(x,field){const p=members(x);return p.length?p.map(m=>E(m[field]||'—')).join('<br>'):E(field==='name'?x.student:x.miik009Class?.[field]||'—')}
 function migrate(roster=read(S)){const rows=read(A);let dirty=false;const out=rows.map(x=>{if(!isGroup(x))return x;const y=assign(x,members(x,roster));if(JSON.stringify(x)!==JSON.stringify(y))dirty=true;return y});if(dirty)localStorage.setItem(A,JSON.stringify(out));}
 function remove(x,target,roster){if(!isGroup(x))return x;const shared=roster.some(s=>s.miikId!==target.miikId&&N(s.name)===N(target.name));const p=members(x,roster).filter(p=>p.id?p.id!==target.miikId:shared||N(p.name)!==N(target.name));return p.length?assign(x,p):null}
 window.MiikGroupRecords={isGroup,members,assign,display,migrate,remove};
})();
