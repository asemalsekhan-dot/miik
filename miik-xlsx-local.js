/* Local XLSX reader for Noor workbooks. Uses the JSZip already shipped with Miik. */
(()=>{'use strict';
 function colIndex(s){return [...s].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1}
 function colName(n){let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s}
 const decodeCell=s=>{const m=String(s).match(/^([A-Z]+)(\d+)$/);return m?{r:+m[2]-1,c:colIndex(m[1])}:{r:0,c:0}};
 const encodeCell=o=>colName(o.c)+(o.r+1);
 const decodeRange=s=>{const a=String(s).split(':');return{s:decodeCell(a[0]),e:decodeCell(a[1]||a[0])}};
 // One XML implementation on desktop and mobile; Noor exports may include a BOM.
 const nodes=(el,name)=>el.children.flatMap(c=>(c.name===name?[c]:[]).concat(nodes(c,name)));
 function parse(s){
  if(typeof sax==='undefined')throw Error('تعذر تحميل قارئ Excel المحلي');
  const root={children:[]},stack=[root],parser=sax.parser(true,{trim:false,normalize:false});
  let failure=null;
  parser.onerror=e=>{failure=e};
  parser.ondoctype=()=>{throw Error('ملف Excel يحتوي تعريف XML غير مدعوم')};
  parser.onopentag=t=>{const node={name:t.name.split(':').pop(),children:[],text:'',getAttribute:k=>t.attributes[k]??null,get textContent(){return this.text}};stack.at(-1).children.push(node);stack.push(node)};
  const text=t=>{for(const node of stack)if(node!==root)node.text+=t};
  parser.ontext=text;parser.oncdata=text;parser.onclosetag=()=>stack.pop();
  try{parser.write(String(s).replace(/^\uFEFF/, '')).close()}catch(e){failure=e}
  if(failure)throw Error('تعذر قراءة بنية XML في ملف Excel');
  return root;
 }
 async function read(buffer){if(typeof JSZip==='undefined')throw Error('مكتبة ضغط Excel غير موجودة');const zip=await JSZip.loadAsync(buffer),shared=[],sf=zip.file('xl/sharedStrings.xml');if(sf){const doc=parse(await sf.async('text'));for(const si of nodes(doc,'si'))shared.push(nodes(si,'t').map(t=>t.textContent).join(''))}
  const out={SheetNames:[],Sheets:{}},paths=Object.keys(zip.files).filter(p=>/^xl\/worksheets\/[^/]+\.xml$/.test(p)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  let names=[];const wf=zip.file('xl/workbook.xml'),relFile=zip.file('xl/_rels/workbook.xml.rels');if(wf){const doc=parse(await wf.async('text')),rels=relFile?parse(await relFile.async('text')):null,byId=new Map(rels?nodes(rels,'Relationship').map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]):[]);names=nodes(doc,'sheet').map(s=>{let target=byId.get(s.getAttribute('r:id'))||'',path=target.startsWith('/')?target.slice(1):'xl/'+target.replace(/^\.\//,'');path=path.replace(/\/[^/]+\/\.\.\//g,'/');return{name:s.getAttribute('name')||'',path}})}
  for(let i=0;i<paths.length;i++){const path=paths[i],doc=parse(await zip.file(path).async('text')),ws={},cells=nodes(doc,'c');let maxR=0,maxC=0;for(const c of cells){const ref=c.getAttribute('r');if(!ref)continue;const pos=decodeCell(ref);maxR=Math.max(maxR,pos.r);maxC=Math.max(maxC,pos.c);const t=c.getAttribute('t');let raw=t==='inlineStr'?nodes(c,'t').map(x=>x.textContent).join(''):(nodes(c,'v')[0]?.textContent??'');if(t==='s')raw=shared[Number(raw)]??raw;else if(t==='b')raw=raw==='1';else if(t!=='str'&&t!=='e'&&t!=='inlineStr'&&raw!==''&&Number.isFinite(Number(raw)))raw=Number(raw);ws[ref]={v:raw}}
   const dimension=nodes(doc,'dimension')[0]?.getAttribute('ref');ws['!ref']=dimension||('A1:'+encodeCell({r:maxR,c:maxC}));const label=names.find(n=>n.path===path)?.name||'ورقة '+(i+1);let unique=label,j=2;while(out.Sheets[unique])unique=label+' '+j++;out.SheetNames.push(unique);out.Sheets[unique]=ws}
  if(!out.SheetNames.length)throw Error('لا توجد أوراق عمل في ملف Excel');return out}
 window.XLSX={read,utils:{decode_range:decodeRange,encode_cell:encodeCell}};
})();
