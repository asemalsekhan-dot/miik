/* Shared session classification for final reports; stored records are untouched. */
(()=>{'use strict';
 const sessionTypes=['session','individualSession','individual','groupSession','group'];
 function isSession(x){return sessionTypes.includes(x?.type)}
 function isGroup(x){return isSession(x)&&(x.type==='groupSession'||x.type==='group'||/جماعية|جمعية/.test(String(x.values?.[0]||''))||(Array.isArray(x.groupStudents)&&x.groupStudents.length>0)||(Array.isArray(x.groupStudentIds)&&x.groupStudentIds.length>0))}
 function sessions(rows){const list=(rows||[]).filter(isSession);return {individual:list.filter(x=>!isGroup(x)).length,group:list.filter(isGroup).length}}
 window.MiikReportStats={isSession,isGroup,sessions};
})();
