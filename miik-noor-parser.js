/* قارئ نتائج نور المشترك. يتوقع Workbook من SheetJS (XLSX.read).
   الهدف: اكتشاف قوالب نور وتحويلها إلى DTO موحد قبل أي تحليل.
*/
(function (global) {
  "use strict";

  // النشاط يظهر في جدول التدقيق، لكنه لا يدخل لاحقًا في مؤشرات التحصيل الأكاديمي.
  // السلوك والمواظبة تُقرأ كحقول متابعة مستقلة وليست مواد دراسية.
  const EXCLUDED_SUBJECTS = new Set([
    "السلوك", "السلوك الإيجابي", "السلوك المتميز", "المواظبة", "الحضور", "الغياب"
  ]);

  const clean = v => String(v ?? "").replace(/\s+/g, " ").trim();
  const ar = v => clean(v).replace(/[ـ]/g, "");
  const num = v => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(String(v).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  function matrix(ws) {
    const ref = ws["!ref"];
    if (!ref) return [];
    const range = global.XLSX.utils.decode_range(ref);
    const rows = [];
    for (let r=range.s.r; r<=range.e.r; r++) {
      const row = [];
      for (let c=range.s.c; c<=range.e.c; c++) {
        const cell = ws[global.XLSX.utils.encode_cell({r,c})];
        row.push(cell ? (cell.v ?? cell.w ?? null) : null);
      }
      rows.push(row);
    }
    return rows;
  }

  function allText(rows) {
    return rows.flat().map(clean).filter(Boolean).join(" | ");
  }

  function findCell(rows, predicate) {
    for (let r=0;r<rows.length;r++) for (let c=0;c<(rows[r]||[]).length;c++) {
      const v=clean(rows[r][c]);
      if (predicate(v,r,c)) return {r,c,v};
    }
    return null;
  }

  function extractClassName(rows) {
    // قوالب نور لا تستخدم تسمية واحدة للفصل: الثانوية قد تستخدم Section،
    // والمتوسطة قد تستخدم Class، والعربي يستخدم «الفصل».
    // نبحث في السطر نفسه فقط حتى لا نلتقط رقمًا عشوائيًا من بيانات أخرى.
    const labels=[];
    for(let r=0;r<rows.length;r++) for(let c=0;c<(rows[r]||[]).length;c++){
      const raw=clean(rows[r][c]);
      const normalized=ar(raw).replace(/[:：]/g,":").trim();

      // يدعم أيضًا الحالة التي تكون فيها التسمية والقيمة داخل الخلية نفسها مثل Class: 1 أو الفصل: 1.
      const inline=normalized.match(/^(?:الفصل|Section|Class)\s*:\s*([0-9٠-٩]{1,2}|[أ-يA-Za-z]|[0-9٠-٩]{1,2}\s*[\/\-]\s*[أ-يA-Za-z0-9٠-٩]{1,2})$/i);
      if(inline){
        const inlineValue=clean(inline[1]);
        if(inlineValue) return inlineValue;
      }

      const key=normalized.replace(/:/g,"").trim();
      if(key==="الفصل" || /^(Section|Class)$/i.test(key)) labels.push({r,c,key});
    }
    const valid=v=>{
      const x=clean(v);
      if(!x) return false;
      if(/^(الفصل|Section|Class)$/i.test(ar(x).replace(/[:：]/g,"").trim())) return false;
      // رقم فصل معتاد، أو ترميز قصير مثل 1/أ أو أ.
      if(/^\d{1,2}$/.test(x)) return +x>=1 && +x<=30;
      if(/^[أ-يA-Za-z]$/.test(x)) return true;
      if(/^\d{1,2}\s*[\/\-]\s*[أ-يA-Za-z0-9]{1,2}$/.test(x)) return true;
      return false;
    };
    for(const label of labels){
      const row=rows[label.r]||[];
      // الإنجليزية غالبًا القيمة بعدها، والعربية في قوالب RTL غالبًا قبلها؛ ثم نجرب الاتجاه الآخر.
      // بعض قوالب نور تستخدم خلايا مدمجة واسعة؛ قد تفصل القيمة عن التسمية حتى 5–6 أعمدة.
      // نبقى في السطر نفسه ونوسّع البحث فقط، حتى لا نلتقط رقمًا من سطر آخر.
      const forward=[1,2,3,4,5,6,7,8], backward=[-1,-2,-3,-4,-5,-6,-7,-8];
      const preferred = /^(Section|Class)$/i.test(label.key) ? [...forward,...backward] : [...backward,...forward];
      for(const d of preferred){
        const c=label.c+d;
        if(c<0 || c>=row.length) continue;
        const v=clean(row[c]);
        if(valid(v)) return v;
      }
    }
    return null;
  }

  function normalizeSubject(name) {
    let s=ar(name)
      .replace(/^\*+/,"")
      .replace(/\s*\([^)]*\)\s*/g," ")
      .replace(/\s+/g," ").trim();
    const aliases = {
      "القرآن الكريم والدراسات الاسلامية":"القرآن الكريم والدراسات الإسلامية",
      "الدراسات الاسلامية":"الدراسات الإسلامية",
      "اللغة الانجليزية":"اللغة الإنجليزية",
      "المهارات الحياتية والاسرية":"المهارات الحياتية والأسرية",
      "المهارات الحياتية والأسرية":"المهارات الحياتية والأسرية",
      "التربية البدنية والدفاع عن النفس":"التربية البدنية والدفاع عن النفس"
    };
    return aliases[s] || s;
  }

  function excluded(name) {
    const n=normalizeSubject(name);
    return [...EXCLUDED_SUBJECTS].some(x => n===x || n.includes(x));
  }

  // أسطر تلخيصية في شهادة نور وليست مواد دراسية.
  // تُستبعد من المصدر نفسه حتى لا تظهر في المعاينة ولا تدخل أي تحليل.
  function summaryRow(name) {
    const n=ar(name).replace(/[:：]/g, "").trim();
    return /^(مجموع الدرجات الموزونة|مجموع الدرجات الموزنه|الدرجات الموزونة|الدرجات الموزنه|المعدل|المعدل العام|المعدل الفصلي|النسبة المئوية|النسبه المئويه)$/.test(n);
  }

  function detect(workbook) {
    const ws=workbook.Sheets[workbook.SheetNames[0]];
    const rows=matrix(ws), text=allText(rows);

    if (/عدد الطلاب الحاصلين على تقدير|توزيع أعداد الطلاب على مستويات الأداء/.test(text))
      return {id:"NOOR_AGGREGATE", confidence:0.99};

    if (text.includes("إشعار فترة أولى") || text.includes("إشعار فترة ثانية"))
      return {id:"HIGH_PERIOD_NOTICE", confidence:0.99};

    if (text.includes("كشف درجات الفصل") && text.includes("الثانوي"))
      return {id:"HIGH_FINAL_NOTICE", confidence:0.99};

    if (text.includes("إشعار بدرجات الفصل الدراسي") && text.includes("المتوسط"))
      return {id:"MIDDLE_INDIVIDUAL_NOTICE", confidence:0.97};

    return {id:"UNKNOWN", confidence:0};
  }

  function contextFromText(text, templateId) {
    let stage = text.includes("الثانوي") ? "الثانوية" : text.includes("المتوسط") ? "المتوسطة" : null;
    let grade = null;
    if (/الأول\s+(المتوسط|الثانوي)/.test(text)) grade="الأول";
    else if (/الثاني\s+(المتوسط|الثانوي)/.test(text)) grade="الثاني";
    else if (/الثالث\s+(المتوسط|الثانوي)/.test(text)) grade="الثالث";

    let resultType=null;

    // في إشعار المتوسط الفردي، عنوان نور نفسه يحدد نوع النتيجة:
    // "إشعار بدرجات الفصل الدراسي ... - أولى"  = الفترة الأولى
    // "إشعار بدرجات الفصل الدراسي ... - ثانية" = الفترة الثانية
    // نفس العنوان بلا اللاحقة                       = نهاية الفصل
    // لا نعتمد على كلمات "الفترة" داخل أعمدة جدول الدرجات.
    if (templateId==="MIDDLE_INDIVIDUAL_NOTICE") {
      const compact = text.replace(/[–—]/g,"-").replace(/\s+/g," ");
      const notice = compact.match(/إشعار\s+بدرجات\s+الفصل\s+الدراسي\s+(الأول|الثاني)(?:\s*-\s*(أولى|الأولى|أول|الأول|ثانية|الثانية|ثاني|الثاني))?/);
      if (notice) {
        if (["أولى","الأولى","أول","الأول"].includes(notice[2])) resultType="فترة أولى";
        else if (["ثانية","الثانية","ثاني","الثاني"].includes(notice[2])) resultType="فترة ثانية";
        else if (notice[1]==="الأول") resultType="نهاية الفصل الأول";
        else if (notice[1]==="الثاني") resultType="نهاية الفصل الثاني";

      }
    } else if (templateId==="HIGH_FINAL_NOTICE") {
      if (text.includes("الفصل الدراسي الأول") || text.includes("الفصل الأول")) resultType="نهاية الفصل الأول";
      else if (text.includes("الفصل الدراسي الثاني") || text.includes("الفصل الثاني")) resultType="نهاية الفصل الثاني";
      else if (text.includes("الفصل الثالث")) resultType="نهاية الفصل الثالث";

    } else if (templateId==="HIGH_PERIOD_NOTICE") {
      if (text.includes("إشعار فترة أولى") || text.includes("فترة أولى")) resultType="فترة أولى";
      else if (text.includes("إشعار فترة ثانية") || text.includes("فترة ثانية")) resultType="فترة ثانية";
    }

    if (!resultType && templateId==="UNKNOWN") {
      if (text.includes("الفصل الدراسي الأول")) resultType="نهاية الفصل الأول";
      else if (text.includes("الفصل الدراسي الثاني")) resultType="نهاية الفصل الثاني";

      else if (text.includes("فترة أولى")) resultType="فترة أولى";
      else if (text.includes("فترة ثانية")) resultType="فترة ثانية";
    }

    const year=text.match(/14\d{2}\s*[\/-]\s*14\d{2}/);
    return {stage, grade, resultType, templateId,academicYear:year?year[0]:null};
  }

  function extractSchoolName(rows){
    const labels=["اسم المدرسة","School Name"];
    for(const label of labels){
      const hit=findCell(rows,v=>ar(v).toLowerCase().includes(ar(label).toLowerCase()));
      if(!hit) continue;
      const row=rows[hit.r]||[];
      const candidates=[];
      for(let d=1;d<=14;d++) for(const c of [hit.c-d,hit.c+d]){
        if(c<0||c>=row.length) continue;
        const v=clean(row[c]);
        if(v && !/اسم المدرسة|School Name/i.test(v) && v.length>4) candidates.push({d,v});
      }
      if(candidates.length){candidates.sort((a,b)=>a.d-b.d);return candidates[0].v;}
    }
    // بعض إشعارات نور تضع اسم المدرسة كسطر مستقل دون عنوان ملاصق.
    for(const row of rows) for(const cell of (row||[])){
      const v=clean(cell);
      if(/(متوسطة|ثانوية|ابتدائية|مدرسة)/.test(v) && !/المرحلة|الصف|مدير المدرسة/.test(v) && v.length>=8) return v;
    }
    return null;
  }

  function extractEducationAdmin(rows){
    for(const row of rows) for(const cell of (row||[])){
      const v=clean(cell);
      if(/الإدارة العامة للتعليم/.test(v)) return v;
    }
    return null;
  }

  function looksArabicStudentName(v){
    const s=clean(v);
    if(!s || s.length<5) return false;
    if(/اسم الطالب|Student Name|الفصل|Section|المدرسة|School Name|الهوية|Identity|الجنسية|Nationality|الميلاد|Birth/i.test(s)) return false;
    const arabic=(s.match(/[\u0600-\u06FF]/g)||[]).length;
    return arabic>=4 && /\s/.test(s) && !/^(الأول|الثاني|الثالث|الثانوية|المتوسطة)$/.test(s);
  }

  function extractName(rows) {
    // نور قد يضع «اسم الطالب» في أقصى اليمين والاسم داخل خلية مدمجة بعيدة في السطر نفسه.
    // لذلك لا نعتمد على خلية ملاصقة فقط.
    const labels=[];
    for(let r=0;r<rows.length;r++) for(let c=0;c<(rows[r]||[]).length;c++){
      const v=clean(rows[r][c]);
      if(/اسم\s*الطالب/.test(v) || /Student\s*Name/i.test(v)) labels.push({r,c,v});
    }
    for(const label of labels){
      const row=rows[label.r]||[];
      const candidates=[];
      for(let c=0;c<row.length;c++){
        if(c===label.c) continue;
        const v=clean(row[c]);
        if(looksArabicStudentName(v)) candidates.push({v,d:Math.abs(c-label.c)});
      }
      if(candidates.length){ candidates.sort((a,b)=>a.d-b.d); return candidates[0].v; }
    }
    // احتياط: بعض القوالب تضع الاسم داخل نفس خلية العنوان.
    const h=findCell(rows,v=>/اسم\s*الطالب/.test(v) && clean(v.replace(/اسم\s*الطالب\s*:?/g,"")));
    if(h){ const x=clean(h.v.replace(/اسم\s*الطالب\s*:?/g,"")); if(looksArabicStudentName(x)) return x; }
    return null;
  }

  function extractIndicator(rows, labels) {
    const names=Array.isArray(labels)?labels:[labels];
    for(const label of names){
      const hit=findCell(rows,v=>ar(v).includes(ar(label)));
      if(!hit) continue;
      const candidates=[];
      // الأقرب في نفس السطر أولًا، لأن قوالب نور قد تعكس اتجاه الخلايا.
      for(let d=1;d<=8;d++){
        for(const c of [hit.c-d,hit.c+d]){
          if(c>=0 && c<(rows[hit.r]||[]).length){
            const n=num(rows[hit.r][c]); if(n!==null) candidates.push({d,n});
          }
        }
      }
      // ثم سطر أعلى/أسفل قريب عند وجود دمج خلايا.
      for(let dr=1;dr<=2;dr++){
        for(const rr of [hit.r-dr,hit.r+dr]){
          if(rr<0||rr>=rows.length) continue;
          for(let dc=-2;dc<=2;dc++){
            const c=hit.c+dc; if(c<0||c>=(rows[rr]||[]).length) continue;
            const n=num(rows[rr][c]); if(n!==null) candidates.push({d:10+dr+Math.abs(dc),n});
          }
        }
      }
      if(candidates.length){ candidates.sort((a,b)=>a.d-b.d); return candidates[0].n; }
    }
    return null;
  }

  function extractBehavior(rows){
    let positive=extractIndicator(rows,["السلوك الإيجابي"]);
    let distinguished=extractIndicator(rows,["السلوك المتميز","السلوك المميز"]);
    let attendance=extractIndicator(rows,["المواظبة"]);

    // قالب الثانوي قد يجمعها في سطر واحد:
    // «الإيجابي / المتميز / المواظبة» وبجواره «80 / 20 / 100».
    if(positive===null || distinguished===null || attendance===null){
      const hit=findCell(rows,v=>ar(v).includes("الإيجابي") && ar(v).includes("المتميز") && ar(v).includes("المواظبة"));
      if(hit){
        const row=rows[hit.r]||[];
        const vals=[];
        for(let c=0;c<row.length;c++){
          if(c===hit.c) continue;
          const txt=clean(row[c]);
          const m=txt.match(/(\d+(?:\.\d+)?)\s*[\/\-]\s*(\d+(?:\.\d+)?)\s*[\/\-]\s*(\d+(?:\.\d+)?)/);
          if(m){ vals.push(+m[1],+m[2],+m[3]); break; }
        }
        if(vals.length===3){
          if(positive===null) positive=vals[0];
          if(distinguished===null) distinguished=vals[1];
          if(attendance===null) attendance=vals[2];
        }
      }
    }
    return {positive,distinguished,attendance};
  }

  function extractRankOnSameRow(rows, labels){
    // الترتيب حساس: لا نستخدم البحث التقريبي حول السطر حتى لا نلتقط درجة/معدل قريبًا بالخطأ.
    // نقبل رقمًا فقط إذا كان موجودًا في نفس سطر عبارة الترتيب الرسمية في نور.
    const names=Array.isArray(labels)?labels:[labels];
    for(const label of names){
      const hit=findCell(rows,v=>ar(v).includes(ar(label)));
      if(!hit) continue;
      const row=rows[hit.r]||[];
      const candidates=[];
      for(let d=1;d<=12;d++){
        for(const c of [hit.c-d,hit.c+d]){
          if(c<0 || c>=row.length) continue;
          const n=num(row[c]);
          if(n!==null && Number.isInteger(n) && n>=1) candidates.push({d,n});
        }
      }
      if(candidates.length){ candidates.sort((a,b)=>a.d-b.d); return candidates[0].n; }
    }
    return null;
  }

  function extractRanking(rows){
    // لا يحسب مِعِك ترتيبًا من الدرجات؛ ينقل ترتيب نور فقط متى كان الرقم ظاهرًا مع خانة الترتيب نفسها.
    const classRank=extractRankOnSameRow(rows,["الترتيب على الفصل","ترتيب الفصل"]);
    const gradeRank=extractRankOnSameRow(rows,["الترتيب على الصف","ترتيب الصف"]);
    return {classRank,gradeRank};
  }

  function parseMiddleIndividual(workbook, det) {
    const students=[];
    for(const sn of workbook.SheetNames){
      const rows=matrix(workbook.Sheets[sn]), text=allText(rows);
      const name=extractName(rows); if(!name) continue;
      const subjectHeader=findCell(rows,v=>ar(v)==="المواد الدراسية");
      const totalHeader=findCell(rows,v=>ar(v)==="المجموع");
      const gradeHeader=findCell(rows,v=>ar(v)==="التقدير");
      if(!subjectHeader || !totalHeader) continue;
      const subjects=[];
      for(let r=subjectHeader.r+1;r<rows.length;r++){
        const raw=clean(rows[r][subjectHeader.c]); if(!raw) continue;
        if(/التقدير العام|الترتيب|نتيجة الطالب|مدير المدرسة/.test(raw)) break;
        const subject=normalizeSubject(raw); if(!subject || excluded(subject) || summaryRow(subject)) continue;
        const parsedScore=num(rows[r][totalHeader.c]);
        const score=parsedScore; // الخانة الفارغة تبقى null؛ الصفر الحقيقي من نور يبقى 0.
        const noorGrade=gradeHeader ? clean(rows[r][gradeHeader.c])||null : null;
        subjects.push({subjectNameRaw:raw, subjectName:subject, score, maxScore:null, percentage:null, noorGrade});
      }
      students.push({studentNameRaw:name, className:extractClassName(rows), subjects, behavior:extractBehavior(rows), ranking:extractRanking(rows)});
    }
    const first=matrix(workbook.Sheets[workbook.SheetNames[0]]);
    const context=contextFromText(allText(first),det.id);
    // The period report mixes subjects out of 60 and 100. Infer per subject
    // only when every positive score agrees with its official Noor grade.
    // Ambiguous or missing evidence keeps the scale unknown.
    const gradeOf=v=>{const s=clean(v).replace(/[\u064B-\u065F]/g,'');return s.includes('ممتاز')?'ممتاز':s.includes('جيد جدا')?'جيد جدًا':/^جيد/.test(s)?'جيد':s.includes('مقبول')?'مقبول':/ضعيف|راسب/.test(s)?'راسب':null};
    const classify=p=>p>=90?'ممتاز':p>=80?'جيد جدًا':p>=70?'جيد':p>=50?'مقبول':'راسب';
    const bySubject=new Map();
    for(const st of students)for(const x of st.subjects){if(!bySubject.has(x.subjectName))bySubject.set(x.subjectName,[]);bySubject.get(x.subjectName).push(x)}
    for(const entries of bySubject.values()){
      const evidence=entries.filter(x=>x.score>0&&gradeOf(x.noorGrade));
      const candidates=[60,100].filter(max=>evidence.length>=2&&entries.every(x=>x.score===null||(x.score>=0&&x.score<=max))&&evidence.every(x=>classify(x.score/max*100)===gradeOf(x.noorGrade)));
      for(const x of entries){
        const local=x.score>0&&gradeOf(x.noorGrade)?[60,100].filter(max=>x.score<=max&&classify(x.score/max*100)===gradeOf(x.noorGrade)):[];
        const max=local.length===1?local[0]:candidates.length===1?candidates[0]:null;
        if(max!==null){x.maxScore=max;x.percentage=x.score===null?null:x.score/max*100;x.maxScoreSource='مستنتج من الدرجة وتقدير نور'}
      }
    }
    context.schoolName=extractSchoolName(first);
    context.educationAdmin=extractEducationAdmin(first);
    return {context, students, warnings:[]};
  }

  function parseHighIndividual(workbook, det) {
    const students=[];
    for(const sn of workbook.SheetNames){
      const rows=matrix(workbook.Sheets[sn]);
      const name=extractName(rows); if(!name) continue;

      // للثانوي قالبان فرديان معروفان لدينا حاليًا داخل نفس Adapter:
      // نهاية الفصل: «المواد الدراسية / المجموع / التقدير العام».
      // إشعار الفترة: «المادة / مجموع / النهاية العظمى» ولا يحتوي تقديرًا نصيًا دائمًا.
      const sh=findCell(rows,v=>{
        const x=ar(v).trim(); return x==="المواد الدراسية" || x==="المادة";
      });
      const th=findCell(rows,v=>{
        const x=ar(v).trim(); return x==="المجموع" || x==="مجموع";
      });
      const mh=findCell(rows,v=>ar(v).trim()==="النهاية العظمى");
      let gh=findCell(rows,v=>{
        const x=ar(v).trim(); return x==="التقدير" || x==="التقدير العام";
      });
      if(!sh || !th) continue;
      // Bilingual final reports put the Arabic grade in a different column
      // from the English grade heading. Use the column containing Arabic grades.
      if(det.id==="HIGH_FINAL_NOTICE"){
        const arabicGrade=findCell(rows,(v,r)=>r>sh.r && /^(ممتاز|جيد|مقبول|ضعيف|راسب)/.test(v));
        if(arabicGrade)gh=arabicGrade;
      }

      const subjects=[];
      for(let r=sh.r+1;r<rows.length;r++){
        const raw=clean(rows[r][sh.c]); if(!raw) continue;
        if(/التقدير|نتيجة الطالب|الترتيب|مدير المدرسة/.test(raw)) break;
        const subject=normalizeSubject(raw);
        if(!subject || excluded(subject) || summaryRow(subject) || /^(المجموع|مجموع)$/.test(ar(subject))) continue;

        const parsedScore=num(rows[r][th.c]);
        const score=parsedScore; // الخانة الفارغة تبقى null؛ الصفر الحقيقي من نور يبقى 0.
        const maxScore=mh ? num(rows[r][mh.c]) : null;
        let percentage=null;
        if(score!==null && maxScore!==null && maxScore>0) percentage=(score/maxScore)*100;
        else if(score!==null && score>=0 && score<=100) percentage=score; // قالب نهاية الفصل: «المجموع» نفسه من 100.
        const noorGrade=gh ? clean(rows[r][gh.c])||null : null;
        subjects.push({subjectNameRaw:raw,subjectName:subject,score,maxScore,percentage,noorGrade});
      }
      students.push({studentNameRaw:name,className:extractClassName(rows),subjects,behavior:extractBehavior(rows),ranking:extractRanking(rows)});
    }
    const first=matrix(workbook.Sheets[workbook.SheetNames[0]]);
    const context=contextFromText(allText(first),det.id);
    context.schoolName=extractSchoolName(first);
    context.educationAdmin=extractEducationAdmin(first);
    return {context,students,warnings:[]};
  }


  function parseAggregate(workbook,det){
    const rows=matrix(workbook.Sheets[workbook.SheetNames[0]]);
    const field=label=>{const hit=findCell(rows,v=>ar(v).replace(/[:：]/g,'').trim()===label);if(!hit)return null;return rows[hit.r].map(clean).find((v,c)=>c!==hit.c&&v&&v!==':')||null};
    const stageText=field('الصف')||'',context=contextFromText(stageText,det.id);
    context.schoolName=field('المدرسة');context.academicYear=field('العام الدراسي');
    context.className=field('الفصل');context.resultType=[field('الفصل الدراسي'),field('الفترة')].filter(Boolean).join(' — ');
    const studentCount=num(field('عدد الطلاب'));
    const heading=findCell(rows,v=>/عدد الطلاب الحاصلين على تقدير|توزيع أعداد الطلاب على مستويات الأداء/.test(v));
    const header=heading&&rows[heading.r+1];
    const columns=(header||[]).map((v,c)=>({label:clean(v),c})).filter(x=>/^(ممتاز|جيد|مقبول|ضعيف|راسب|الدرجات الصفرية)/.test(x.label));
    const subjects=[];const warnings=[];
    if(!columns.length||!Number.isInteger(studentCount)||studentCount<1)throw Error('تعذر تحديد عدد الطلاب أو عناوين الإحصاءات');
    for(let r=heading.r+2;r<rows.length;r++){
      const row=rows[r],name=clean(row[0]);
      if(/نسبة الطلاب|توزيع نسبة/.test(name))break;
      if(!name)continue;
      const counts={};
      for(const col of columns){const n=num(row[col.c]);if(n===null||!Number.isInteger(n)||n<0)throw Error('عدد غير صالح في إحصاءات مادة '+name);counts[col.label]=n}
      if(Object.values(counts).reduce((a,b)=>a+b,0)!==studentCount)throw Error('مجموع فئات مادة '+name+' لا يطابق عدد الطلاب');
      subjects.push({subjectName:normalizeSubject(name),counts});
    }
    if(!subjects.length)throw Error('لم توجد إحصاءات مواد في القالب');
    warnings.push('هذا ملف إحصائي مجمع؛ لا يتضمن أسماء الطلاب أو درجاتهم الفردية، ولا يمكن فصل الدرجات الصفرية عن فئات المصدر.');
    return {context,students:[],aggregate:{studentCount,columns:columns.map(x=>x.label),subjects},warnings};
  }

  function parse(workbook) {
    const det=detect(workbook);
    let dto;
    if(det.id==="NOOR_AGGREGATE") dto=parseAggregate(workbook,det);
    else if(det.id==="MIDDLE_INDIVIDUAL_NOTICE") dto=parseMiddleIndividual(workbook,det);
    else if(det.id==="HIGH_PERIOD_NOTICE" || det.id==="HIGH_FINAL_NOTICE") dto=parseHighIndividual(workbook,det);
    else dto={context:{templateId:"UNKNOWN"},students:[],warnings:["قالب نور غير معروف."]};
    dto.source={template:det.id,confidence:det.confidence};
    return dto;
  }

  global.MiikNoorParser={detect,parse,normalizeSubject,excluded,summaryRow};
})(window);
