/* وزارة التعليم: الإجراءات التنفيذية للائحة تقويم الطالب 2025م، ص19–20. */
(function(g){'use strict';
const high=s=>/ثانو/.test(s||'');
const H=[['ممتاز مرتفع','أ+',95],['ممتاز','أ',90],['جيد جدًا مرتفع','ب+',85],['جيد جدًا','ب',80],['جيد مرتفع','ج+',75],['جيد','ج',70],['مقبول مرتفع','د+',65],['مقبول','د',60],['ضعيف','ض',50],['راسب','ر',0]];
const M=[['ممتاز','أ',90],['جيد جدًا','ب',80],['جيد','ج',70],['مقبول','د',50],['راسب','ر',0]];
const numeric=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&Number.isFinite(Number(v));
function level(p,s){if(!numeric(p)||+p<0||+p>100)return null;return (high(s)?H:M).find(x=>+p>=x[2])[0]}
function normalized(v,s){const t=String(v||'').replace(/[\u064B-\u065F]/g,'').replace(/جدا/g,'جدًا').trim();return (high(s)?H:M).find(x=>t===x[0])?.[0]||null}
function resolved(x,s){if(!x||!numeric(x.score))return null;if(numeric(x.percentage))return level(x.percentage,s);if(numeric(x.maxScore)&&+x.maxScore>0)return level(+x.score/+x.maxScore*100,s);return normalized(x.noorGrade,s)}
function top(students){const n=students.length,withPct=students.filter(x=>numeric(x.ranking?.certificatePercent)&&+x.ranking.certificatePercent>=0&&+x.ranking.certificatePercent<=100);let source,rows;
 if(n&&withPct.length===n){source='percentage';rows=students.map(x=>({student:x,percent:+x.ranking.certificatePercent})).sort((a,b)=>b.percent-a.percent);let last=null,rank=0;rows.forEach((x,i)=>{if(x.percent!==last)rank=i+1;x.rank=rank;last=x.percent})}
 else if(withPct.length){return {source:'incomplete',rows:[],missing:n-withPct.length,total:n}}
 else {const key=['gradeRank','classRank'].find(k=>(k!=='classRank'||new Set(students.map(x=>x.className||'')).size===1)&&n&&students.every(x=>numeric(x.ranking?.[k])&&Number.isInteger(+x.ranking[k])&&+x.ranking[k]>=1&&+x.ranking[k]<=n));if(!key)return{source:'unavailable',rows:[],total:n};source=key;rows=students.map(x=>({student:x,rank:+x.ranking[key],percent:null})).sort((a,b)=>a.rank-b.rank);if(rows[0].rank!==1||rows.some((x,i)=>i&&x.rank!==rows[i-1].rank&&x.rank!==i+1))return{source:'unavailable',rows:[],total:n}}
 return {source,rows:rows.filter(x=>x.rank<=10),total:n};}
g.MiikNoorOfficial={high,categories:s=>(high(s)?H:M).map(x=>x[0]),symbol:n=>[...H,...M].find(x=>x[0]===n)?.[1]||'',level,resolved,top,strong:n=>/^(ممتاز|جيد جدًا)( مرتفع)?$/.test(n||''),excellent:n=>/^ممتاز( مرتفع)?$/.test(n||''),follow:n=>['مقبول مرتفع','مقبول','ضعيف','راسب'].includes(n)};
})(window);
