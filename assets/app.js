// ===== client/js/Config =====
/* Config: schema, ค่าคงที่, แบรนด์ */
// ---------- แบรนด์ (แก้โลโก้/ชื่อได้ที่นี่ที่เดียว) ----------
const BRAND = {
  name: 'DLTV Platform',
  phase: '1st Phase',
  logo: 'https://dltv.ac.th/themes/default/assets/images/dltv-main-logo.png',
  foundationLogo: 'https://dltv.ac.th/upload/data/users/0/316/CMS/images/logo%20dlf%20%E0%B8%AA%E0%B8%A1%E0%B8%9A%E0%B8%B9%E0%B8%A3%E0%B8%93%E0%B9%8C.png',
  foundationName: 'มูลนิธิการศึกษาทางไกลผ่านดาวเทียม'
};

// ---------- Schema (ต้องตรงกับ src/server/Config.gs — `npm run build` จะตรวจให้) ----------
const SCHEMA = {
  Members:['member_id','role','name','email','provider','birthdate','age_group','guardian_name','guardian_email','pdpa_consent','consent_at','created_at'],
  Media:['media_id','title','type','url','subject','grade','tags','created_by','created_at'],
  InteractiveCues:['cue_id','media_id','time_sec','question_id','created_at'],
  Questions:['question_id','type','question','choices','answer','subject','grade','difficulty','created_by','created_at'],
  Courses:['course_id','title','subject','grade','description','cover','status','created_by','created_at'],
  Units:['unit_id','course_id','seq','title','media_ids','question_ids','created_at'],
  Classes:['class_id','course_id','name','teacher_id','term','created_at'],
  Enrollments:['enroll_id','class_id','member_id','created_at'],
  Groups:['group_id','class_id','name','member_ids','task','status','created_at'],
  LearningRecords:['record_id','timestamp','member_id','verb','object_type','object_id','course_id','score','max_score','duration_sec','extra']
};
const ID_PREFIX = {Members:'MEM',Media:'MED',InteractiveCues:'CUE',Questions:'Q',Courses:'CRS',Units:'UNT',Classes:'CLS',Enrollments:'ENR',Groups:'GRP',LearningRecords:'LRS'};
const MEDIA_TYPES = [['VDO','วิดีโอ (VDO)'],['InteractiveVDO','Interactive VDO'],['MP3','เสียง (MP3)'],['Sheet','ใบงาน (Sheet)'],['E-book','E-book'],['Picture','รูปภาพ'],['H5P','H5P'],['HTML','HTML'],['Link','ลิงก์']];
const ROLE_LABEL = {admin:'ผู้ดูแลระบบ',teacher:'ผู้สอน',student:'ผู้เรียน 13+',student_u13:'ผู้เรียน <13 (ผู้ปกครองดูแล)'};
const PROVIDER_LABEL = {google:'Google',facebook:'Facebook',email:'อีเมล'};
const VERB_LABEL = {viewed:'เข้าชม',completed:'เรียนจบ',answered:'ตอบคำถาม',updated:'อัปเดตงานกลุ่ม'};
const STATUS = {todo:'○ รอเริ่ม',doing:'◐ กำลังทำ',done:'● เสร็จแล้ว'};
const SUBJECT_COLOR = {'คณิตศาสตร์':['#F28C28','#F6B35F'],'วิทยาศาสตร์':['#1F7A5A','#41B883'],'ภาษาไทย':['#1F5F8B','#5DA3D8'],'ภาษาอังกฤษ':['#6A4CE2','#9887EF'],'สังคมศึกษา':['#B4436C','#EE7FAC']};

// ===== client/js/Utils =====
/* Utils: storage, escape, วันที่, toast */
// ---------- storage + utils ----------
const MEMSTORE = {};
const store = {
  get(k){ try{ const v = localStorage.getItem(k); return v==null ? (MEMSTORE[k] ?? null) : JSON.parse(v); }catch(e){ return MEMSTORE[k] ?? null; } },
  set(k,v){ MEMSTORE[k]=v; try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} },
  del(k){ delete MEMSTORE[k]; try{ localStorage.removeItem(k); }catch(e){} }
};
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids = s => String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
const daysAgo = (n,h=10) => { const d=new Date(); d.setDate(d.getDate()-n); d.setHours(h,(n*7)%60,0,0); return d.toISOString(); };
const fmtDate = s => { const d=new Date(s); return isNaN(d)?'-':d.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'2-digit'}); };
const fmtDT = s => { const d=new Date(s); return isNaN(d)?'-':d.toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}); };
const fmtTime = t => { t=+t||0; return Math.floor(t/60)+':'+String((t%60).toFixed(1)).padStart(4,'0'); };
function ageFrom(b){ if(!b) return null; const d=new Date(String(b).slice(0,10)); if(isNaN(d)) return null; const n=new Date(); let a=n.getFullYear()-d.getFullYear(); const m=n.getMonth()-d.getMonth(); if(m<0||(m===0&&n.getDate()<d.getDate())) a--; return a; }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('show'),2400); }
function parseChoices(c){ try{ const a=JSON.parse(c); if(Array.isArray(a)) return a.map(String); }catch(e){} return String(c||'').split('\n').map(s=>s.trim()).filter(Boolean); }
function ytId(u){ const m=String(u).match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/); return m?m[1]:null; }

// ===== client/js/Api =====
/* Api: เรียก Apps Script หรือ Mock (localStorage) */
// ---------- Backend adapter ----------
const IS_GAS = typeof google!=='undefined' && google.script && google.script.run;
// โหมด API: หน้าเว็บอยู่บนโฮสต์อื่น (Netlify/GitHub Pages ฯลฯ) แล้วเรียก Apps Script ผ่าน URL — ตั้งค่าใน config.js
const API_URL = (typeof window!=='undefined' && window.DLTV_CONFIG && window.DLTV_CONFIG.API_URL) || '';
const MODE = IS_GAS ? 'gas' : API_URL ? 'api' : 'mock';
const DBKEY = 'dltv_db_v1';
const Mock = {
  load(){ const d = store.get(DBKEY) || {}; Object.keys(SCHEMA).forEach(k=>{ if(!Array.isArray(d[k])) d[k]=[]; }); return d; },
  nextId(d,name){ let max=0; d[name].forEach(r=>{ const n=parseInt(String(r[SCHEMA[name][0]]).split('-').pop(),10); if(n>max) max=n; }); return ID_PREFIX[name]+'-'+String(max+1).padStart(4,'0'); },
  insert(d,name,row){ const h=SCHEMA[name]; row={...row}; row[h[0]]=this.nextId(d,name); if(h.includes('created_at')&&!row.created_at) row.created_at=new Date().toISOString(); const o={}; h.forEach(k=>o[k]=row[k]==null?'':String(row[k])); d[name].push(o); return o; },
  sheet(n){ if(!SCHEMA[n]) throw new Error('ไม่มีตาราง '+n); return n; },
  actions:{
    bootstrap(p,d){ return d; },
    whoami(){ return {email:''}; },
    insert(p,d){ return Mock.insert(d,Mock.sheet(p.sheet),p.row); },
    update(p,d){ const n=Mock.sheet(p.sheet), k=SCHEMA[n][0]; const r=d[n].find(x=>String(x[k])===String(p.id)); if(!r) throw new Error('ไม่พบรายการ '+p.id); SCHEMA[n].slice(1).forEach(f=>{ if(p.patch && f in p.patch) r[f]=String(p.patch[f]); }); return r; },
    remove(p,d){ const n=Mock.sheet(p.sheet), k=SCHEMA[n][0]; const i=d[n].findIndex(x=>String(x[k])===String(p.id)); if(i<0) throw new Error('ไม่พบรายการ'); d[n].splice(i,1); return {id:p.id}; },
    register(p,d){
      const r={...(p.row||{})};
      if(!r.name||!r.email) throw new Error('กรุณากรอกชื่อและอีเมล');
      if(String(r.pdpa_consent)!=='true') throw new Error('ต้องยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)');
      const age=ageFrom(r.birthdate); if(age===null) throw new Error('กรุณาระบุวันเกิด');
      r.age_group = age<13?'under13':'13plus'; r.role = age<13?'student_u13':'student';
      if(age<13 && (!r.guardian_name||!r.guardian_email)) throw new Error('ผู้เรียนอายุต่ำกว่า 13 ปี ต้องมีผู้ปกครองให้ความยินยอม');
      if(d.Members.some(m=>String(m.email).toLowerCase()===String(r.email).toLowerCase())) throw new Error('อีเมลนี้ถูกใช้สมัครแล้ว');
      r.consent_at=new Date().toISOString();
      return Mock.insert(d,'Members',r);
    },
    record(p,d){ const r={...(p.row||{})}; if(!r.member_id||!r.verb) throw new Error('ข้อมูล LRS ไม่ครบ'); r.timestamp=r.timestamp||new Date().toISOString(); return Mock.insert(d,'LearningRecords',r); },
    seed(p,d){ if(d.Members.length) return {seeded:false}; Object.keys(p.data).forEach(n=>{ d[n]=p.data[n].map(o=>{ const x={}; SCHEMA[n].forEach(k=>x[k]=o[k]==null?'':String(o[k])); return x; }); }); return {seeded:true}; }
  }
};
function call(action, payload){
  if(IS_GAS) return new Promise((res,rej)=>google.script.run
      .withSuccessHandler(r=> r && r.ok ? res(r.data) : rej(new Error(r ? r.error : 'ไม่มีการตอบกลับ')))
      .withFailureHandler(rej).api(action, payload||{}));
  if(MODE==='api') return fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,payload:payload||{}})})
      .then(r=>{ if(!r.ok) throw new Error('เชื่อมต่อ API ไม่สำเร็จ (HTTP '+r.status+')'); return r.json(); })
      .then(r=>{ if(!r || !r.ok) throw new Error(r ? r.error : 'ไม่มีการตอบกลับ'); return r.data; });
  try{ const d=Mock.load(); const out=Mock.actions[action](payload||{}, d); store.set(DBKEY,d); return Promise.resolve(JSON.parse(JSON.stringify(out))); }
  catch(e){ return Promise.reject(e); }
}

// ===== client/js/State =====
/* State: ข้อมูลในหน่วยความจำ + บันทึก LRS */
// ---------- Local state ----------
let DB = {}; let ME = null; let VIEW = {name:'home', params:{}};
const list = n => DB[n] || [];
const byId = (n,id) => list(n).find(r=>String(r[SCHEMA[n][0]])===String(id));
async function save(n,row,id){
  if(id){ const r=await call('update',{sheet:n,id,patch:row}); const i=list(n).findIndex(x=>x[SCHEMA[n][0]]===id); if(i>=0) DB[n][i]=r; return r; }
  const r=await call('insert',{sheet:n,row}); DB[n].push(r); return r;
}
async function del(n,id){ await call('remove',{sheet:n,id}); DB[n]=list(n).filter(x=>x[SCHEMA[n][0]]!==id); }
async function track(verb, object_type, object_id, x={}){
  if(!ME || x.preview) return;
  try{
    const r = await call('record',{row:{member_id:ME.member_id,verb,object_type,object_id,course_id:x.course_id||'',
      score:x.score??'',max_score:x.max_score??'',duration_sec:x.duration_sec??'',extra:x.extra?JSON.stringify(x.extra):''}});
    DB.LearningRecords.push(r);
  }catch(e){ console.warn('LRS', e); }
}
const isStaff = () => ME && (ME.role==='teacher'||ME.role==='admin');
const isStudent = m => m && (m.role==='student'||m.role==='student_u13');

// ===== client/js/Analytics =====
/* Analytics: คำนวณความก้าวหน้า/คะแนนจาก LRS */
// ---------- LRS analytics ----------
const unitsOf = cid => list('Units').filter(u=>u.course_id===cid).sort((a,b)=>(+a.seq)-(+b.seq));
const recsOf = mid => list('LearningRecords').filter(r=>r.member_id===mid);
function doneUnits(mid){ return new Set(recsOf(mid).filter(r=>r.verb==='completed'&&r.object_type==='unit').map(r=>r.object_id)); }
function progress(mid,cid){ const u=unitsOf(cid); if(!u.length) return 0; const d=doneUnits(mid); return Math.round(u.filter(x=>d.has(x.unit_id)).length/u.length*100); }
function avgScore(mid,cid){ const q=recsOf(mid).filter(r=>r.verb==='answered'&&r.object_type==='quiz'&&(!cid||r.course_id===cid)&&+r.max_score>0); if(!q.length) return null; return Math.round(q.reduce((s,r)=>s+(+r.score)/(+r.max_score),0)/q.length*100); }
function rosterOf(cls){ return list('Enrollments').filter(e=>e.class_id===cls).map(e=>byId('Members',e.member_id)).filter(Boolean); }
function myClasses(){ if(!ME) return []; if(ME.role==='admin') return list('Classes'); if(ME.role==='teacher') return list('Classes').filter(c=>c.teacher_id===ME.member_id); const mine=new Set(list('Enrollments').filter(e=>e.member_id===ME.member_id).map(e=>e.class_id)); return list('Classes').filter(c=>mine.has(c.class_id)); }

// ===== client/js/Ui =====
/* Ui: modal, ฟอร์ม, ยืนยัน */
// ---------- Modal helpers ----------
function closeModal(){ const m=$('#modal'); m.classList.remove('open'); m.innerHTML=''; }
function openModal(title, html, wide){
  const m=$('#modal');
  m.innerHTML=`<div class="mbox ${wide?'wide':''}"><div class="mh"><h3>${esc(title)}</h3><button class="x" aria-label="ปิด">✕</button></div><div class="mcontent">${html}</div></div>`;
  m.classList.add('open'); $$('.x',m).forEach(b=>b.onclick=closeModal);
  m.onclick=e=>{ if(e.target===m) closeModal(); };
  return $('.mcontent',m);
}
function fieldHTML(f,v){
  v = v ?? f.def ?? '';
  const id='f_'+f.k, hint=f.hint?`<span class="hint">${esc(f.hint)}</span>`:'';
  let inp;
  if(f.type==='textarea') inp=`<textarea id="${id}" name="${f.k}" ${f.req?'required':''}>${esc(v)}</textarea>`;
  else if(f.type==='select') inp=`<select id="${id}" name="${f.k}">${f.options.map(([a,b])=>`<option value="${esc(a)}" ${String(a)===String(v)?'selected':''}>${esc(b)}</option>`).join('')}</select>`;
  else if(f.type==='checks'){ const on=new Set(ids(v)); inp=`<div class="checks">${f.options.length?f.options.map(([a,b])=>`<label><input type="checkbox" name="${f.k}" value="${esc(a)}" ${on.has(a)?'checked':''}> ${esc(b)}</label>`).join(''):'<span class="muted small">ยังไม่มีรายการ</span>'}</div>`; }
  else inp=`<input class="inp" id="${id}" name="${f.k}" type="${f.type||'text'}" value="${esc(v)}" ${f.req?'required':''} ${f.step?`step="${f.step}"`:''}>`;
  return `<div class="fld"><label for="${id}">${esc(f.label)}</label>${inp}${hint}</div>`;
}
function formModal(title, fields, vals, onSave){
  const c=openModal(title, `<form class="mform" style="padding:0">${fields.map(f=>fieldHTML(f, vals?.[f.k])).join('')}<div class="merr"></div><div class="mf"><button type="button" class="btn ghost x">ยกเลิก</button><button class="btn primary">บันทึก</button></div></form>`);
  $$('.x',c).forEach(b=>b.onclick=closeModal);
  const form=$('form',c);
  form.onsubmit=async e=>{
    e.preventDefault(); const v={};
    fields.forEach(f=>{ v[f.k] = f.type==='checks' ? $$(`[name="${f.k}"]:checked`,form).map(x=>x.value).join(',') : form.elements[f.k].value; });
    const btn=$('button.primary',form); btn.disabled=true;
    try{ await onSave(v); closeModal(); render(); }catch(err){ $('.merr',form).textContent=err.message; btn.disabled=false; }
  };
}
function askConfirm(msg){ return new Promise(res=>{ const c=openModal('ยืนยัน',`<p>${esc(msg)}</p><div class="mf"><button class="btn ghost" data-no>ยกเลิก</button><button class="btn primary" data-yes>ยืนยัน</button></div>`);
  let done=false; const fin=v=>{ if(done) return; done=true; closeModal(); res(v); };
  $('[data-yes]',c).onclick=()=>fin(true); $('[data-no]',c).onclick=()=>fin(false); $$('.x',$('#modal')).forEach(b=>b.onclick=()=>fin(false)); $('#modal').onclick=e=>{ if(e.target.id==='modal') fin(false); }; }); }
async function confirmDel(n,id,label){ if(!(await askConfirm(`ลบ "${label}" ใช่หรือไม่?`))) return; try{ await del(n,id); toast('ลบแล้ว'); render(); }catch(e){ toast(e.message); } }

// ===== client/views/Home =====
/* View: หน้าหลัก */
// =========================================================
//  VIEW: หน้าหลัก (ผู้เรียนที่ไม่ได้สมัครสมาชิกก็เรียนได้)
// =========================================================
function cover(c){ const [a,b]=SUBJECT_COLOR[c.subject]||['#1B3A5C','#3E6E9E']; return `background:linear-gradient(135deg,${a},${b})`; }
function courseCard(c){
  const n=unitsOf(c.course_id).length, p=ME?progress(ME.member_id,c.course_id):null;
  return `<div class="card ccard" data-go="course" data-id="${c.course_id}">
    <div class="cover" style="${cover(c)}"><b>${esc(c.grade)}</b><span>${esc(c.subject)}</span></div>
    <div class="cbody"><h3>${esc(c.title)}</h3><div class="muted small">${n} หน่วยการเรียน</div>
    ${p!==null && isStudent(ME)?`<div class="bar" title="ความก้าวหน้า ${p}%"><i style="width:${p}%"></i></div><div class="small muted">เรียนแล้ว ${p}%</div>`:''}</div></div>`;
}
function vHome(el){
  const courses=list('Courses').filter(c=>c.status==='published'||isStaff());
  const subjects=[...new Set(courses.map(c=>c.subject))], grades=[...new Set(courses.map(c=>c.grade))];
  const mod=(cls,t,s,route)=>`<button class="mod ${cls}" ${route?`data-go="${route}"`:''}>${t}<small>${s}</small></button>`;
  el.innerHTML=`
  <section class="hero">
    <div>
      <div class="brand-row">${logoTag(BRAND.logo,'brand-logo','DLTV')}${logoTag(BRAND.foundationLogo,'brand-logo','มูลนิธิการศึกษาทางไกลผ่านดาวเทียม')}</div>
      <h1><span class="o">DLTV</span> Platform</h1>
      <p>แพลตฟอร์มการเรียนรู้ทางไกลผ่านดาวเทียม เรียนได้ทุกที่ ทุกเวลา — เปิดเรียนได้ทันทีโดยไม่ต้องสมัคร หรือสมัครสมาชิกเพื่อบันทึกผลการเรียน</p>
      ${ME?`<div class="row"><b>สวัสดี ${esc(ME.name)}</b> <button class="btn navy" data-go="dashboard">ดูผลการเรียนของฉัน</button></div>`
          :`<div class="row"><button class="btn primary" data-go="login">สมัครสมาชิก / เข้าสู่ระบบ</button><span class="muted small">รองรับ Facebook · Google · อีเมล</span></div>`}
    </div>
    <div class="mods">
      ${mod('member','ระบบสมาชิก','MEMBER · PDPA', ME?null:'login')}
      ${mod('lcms','บริหารเนื้อหา','LCMS · หน่วยการเรียน', isStaff()?'lcms':null)}
      ${mod('lms','การเรียนการสอน','LMS · ห้องเรียน', ME?'lms':'login')}
      ${mod('bank','คลังสื่อ & คลังแบบทดสอบ','VDO · MP3 · H5P · Exam', isStaff()?'studio':null)}
      ${mod('csm','เรียนรู้แบบกลุ่ม','CSM · งานกลุ่ม', ME?'csm':'login')}
      ${mod('lrs','บันทึกผลการเรียน','LRS · Dashboard', ME?'dashboard':'login')}
    </div>
  </section>
  <div class="sec-h"><h2>รายวิชา</h2>
    <div class="row">
      <select id="fSub"><option value="">ทุกวิชา</option>${subjects.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
      <select id="fGr"><option value="">ทุกระดับชั้น</option>${grades.map(s=>`<option>${esc(s)}</option>`).join('')}</select>
      <input class="inp" id="fQ" placeholder="ค้นหารายวิชา…">
    </div></div>
  <div class="grid" id="cgrid"></div>`;
  const draw=()=>{
    const s=$('#fSub').value, g=$('#fGr').value, q=$('#fQ').value.trim().toLowerCase();
    const rows=courses.filter(c=>(!s||c.subject===s)&&(!g||c.grade===g)&&(!q||(c.title+c.description).toLowerCase().includes(q)));
    $('#cgrid').innerHTML = rows.length ? rows.map(courseCard).join('') : '<div class="empty">ไม่พบรายวิชา</div>';
  };
  ['fSub','fGr','fQ'].forEach(i=>$('#'+i).oninput=draw); draw();
}

// ===== client/views/Course =====
/* View: เรียนรายวิชา + แบบฝึกหัด */
// =========================================================
//  VIEW: เรียนรายวิชา
// =========================================================
function vCourse(el,{id,unit}){
  const c=byId('Courses',id); if(!c){ el.innerHTML='<div class="empty">ไม่พบรายวิชา</div>'; return; }
  const units=unitsOf(id), cur=byId('Units',unit)||units[0];
  const done=ME?doneUnits(ME.member_id):new Set();
  const p=ME?progress(ME.member_id,id):0;
  el.innerHTML=`
  <div class="crumb"><a data-go="home">หน้าหลัก</a> › ${esc(c.subject)} › ${esc(c.title)}</div>
  <div class="card" style="${cover(c)};color:#fff;border:0">
    <div class="row"><div class="sp"><div class="small" style="opacity:.9">${esc(c.subject)} · ${esc(c.grade)}${c.status!=='published'?' · ฉบับร่าง':''}</div><h1 style="margin:.2em 0">${esc(c.title)}</h1><div style="opacity:.92">${esc(c.description)}</div></div>
    ${ME&&isStudent(ME)?`<div style="min-width:180px"><div class="small">ความก้าวหน้า ${p}%</div><div class="bar" style="background:#ffffff44"><i style="width:${p}%;background:#fff"></i></div></div>`:''}</div>
  </div>
  ${!ME?`<div class="notice">คุณกำลังเรียนแบบ <b>ไม่สมัครสมาชิก</b> — เรียนได้ทุกบท แต่ผลการเรียนจะไม่ถูกบันทึก · <a data-go="login">สมัครสมาชิกเพื่อบันทึกผล</a></div>`:''}
  ${units.length?`<div class="course-layout">
    <aside class="units">${units.map(u=>`<button class="unit ${cur&&u.unit_id===cur.unit_id?'on':''}" data-go="course" data-id="${id}" data-unit="${u.unit_id}"><span class="chk ${done.has(u.unit_id)?'done':''}" data-chk="${u.unit_id}">${done.has(u.unit_id)?'✓':esc(u.seq)}</span><span>${esc(u.title)}</span></button>`).join('')}</aside>
    <div class="card" id="ubody"></div></div>`:'<div class="card empty">รายวิชานี้ยังไม่มีหน่วยการเรียน</div>'}`;
  if(cur) renderUnit($('#ubody'), cur, c);
}
function renderUnit(el,u,c){
  const ctx={course_id:c.course_id};
  track('viewed','unit',u.unit_id,ctx);
  const media=ids(u.media_ids).map(i=>byId('Media',i)).filter(Boolean);
  const qs=ids(u.question_ids).map(i=>byId('Questions',i)).filter(Boolean);
  el.innerHTML=`<div class="muted small">หน่วยที่ ${esc(u.seq)}</div><h2>${esc(u.title)}</h2><div id="mlist"></div>
    ${qs.length?`<h3 style="margin-top:22px">แบบฝึกหัดท้ายหน่วย</h3><form id="quiz">${qs.map((q,i)=>qHTML(q,i)).join('')}<div class="row" style="margin-top:14px"><button class="btn primary">ส่งคำตอบ</button><span id="qres"></span></div></form>`
      :`<div class="row" style="margin-top:16px"><button class="btn primary" id="markDone">ทำเครื่องหมายว่าเรียนจบหน่วยนี้</button></div>`}`;
  const ml=$('#mlist',el);
  if(!media.length) ml.innerHTML='<div class="muted">ไม่มีสื่อในหน่วยนี้</div>';
  media.forEach(m=>{ const b=document.createElement('div'); b.className='media'; ml.appendChild(b); mediaPlayer(b,m,ctx); });
  const markDone=async()=>{ await track('completed','unit',u.unit_id,ctx); const k=$(`[data-chk="${u.unit_id}"]`); if(k){ k.classList.add('done'); k.textContent='✓'; } };
  const md=$('#markDone',el); if(md) md.onclick=async()=>{ if(!ME){ toast('สมัครสมาชิกเพื่อบันทึกผลการเรียน'); return; } await markDone(); toast('บันทึกแล้ว ✓'); };
  const qf=$('#quiz',el);
  if(qf) qf.onsubmit=async e=>{
    e.preventDefault(); let score=0;
    qs.forEach(q=>{ const a=readAnswer(qf,q), ok=isCorrect(q,a); if(ok) score++;
      $(`[data-q="${q.question_id}"] .q-fb`,qf).innerHTML = ok?'<span class="ok">✓ ถูกต้อง</span>':`<span class="no">✗ ยังไม่ถูก — คำตอบคือ ${esc(answerText(q))}</span>`; });
    $('#qres').innerHTML=`<b>ได้ ${score}/${qs.length} คะแนน</b>${ME?'':' <span class="muted small">(ไม่ได้บันทึก — ยังไม่ได้เข้าสู่ระบบ)</span>'}`;
    await track('answered','quiz',u.unit_id,{...ctx,score,max_score:qs.length});
    if(ME) await markDone();
  };
}
function qHTML(q,i){
  const nm='q_'+q.question_id; let body='';
  if(q.type==='mcq') body=parseChoices(q.choices).map((c,j)=>`<label class="opt"><input type="radio" name="${nm}" value="${j}"> ${esc(c)}</label>`).join('');
  else if(q.type==='tf') body=`<label class="opt"><input type="radio" name="${nm}" value="true"> ถูก</label><label class="opt"><input type="radio" name="${nm}" value="false"> ผิด</label>`;
  else body=`<input class="inp" name="${nm}" placeholder="พิมพ์คำตอบ" style="width:100%">`;
  return `<div class="q" data-q="${q.question_id}"><div class="q-t">${i!=null?(i+1)+'. ':''}${esc(q.question)}</div>${body}<div class="q-fb"></div></div>`;
}
function readAnswer(root,q){ const nm='q_'+q.question_id; if(q.type==='short'){ const x=root.querySelector(`[name="${nm}"]`); return x?x.value:''; } const r=root.querySelector(`[name="${nm}"]:checked`); return r?r.value:null; }
function isCorrect(q,a){ if(a==null||a==='') return false; if(q.type==='short') return String(a).trim().toLowerCase()===String(q.answer).trim().toLowerCase(); return String(a)===String(q.answer); }
function answerText(q){ if(q.type==='mcq') return parseChoices(q.choices)[+q.answer]??'-'; if(q.type==='tf') return String(q.answer)==='true'?'ถูก':'ผิด'; return q.answer; }

// ===== client/views/Player =====
/* View: เครื่องเล่นสื่อ + Interactive VDO */
// ---------- Media player (รองรับทุกประเภทในคลังสื่อ) ----------
function mediaPlayer(box,m,ctx={}){
  const t=m.type, u=String(m.url||'');
  box.innerHTML=`<div class="media-h"><span class="tag t-${esc(t)}">${esc((MEDIA_TYPES.find(x=>x[0]===t)||[t,t])[1])}</span><b>${esc(m.title)}</b></div><div class="media-b"></div>`;
  const b=$('.media-b',box);
  if(t==='VDO'||t==='InteractiveVDO'){
    const yt=ytId(u);
    if(yt){ b.innerHTML=`<div class="ratio"><iframe src="https://www.youtube.com/embed/${yt}" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>${t==='InteractiveVDO'?'<div class="small muted" style="margin-top:6px">จุดคำถาม Interactive รองรับเฉพาะไฟล์วิดีโอ (.mp4) ในเฟสนี้</div>':''}`; return; }
    b.innerHTML=`<div class="vwrap"><video controls playsinline preload="metadata" src="${esc(u)}"></video><div class="cue-ov hidden"></div></div>`;
    const v=$('video',b); let seen=false;
    v.addEventListener('play',()=>{ if(!seen){ seen=true; track('viewed','media',m.media_id,ctx); } });
    v.addEventListener('ended',()=>track('completed','media',m.media_id,{...ctx,duration_sec:Math.round(v.duration||0)}));
    if(t==='InteractiveVDO') attachCues(b,v,m,ctx);
  }
  else if(t==='MP3') b.innerHTML=`<audio controls preload="metadata" src="${esc(u)}"></audio>`;
  else if(t==='Picture') b.innerHTML=`<img src="${esc(u)}" alt="${esc(m.title)}">`;
  else if(t==='H5P') b.innerHTML=`<div class="ratio"><iframe src="${esc(u)}" allowfullscreen></iframe></div>`;
  else if(t==='HTML'){
    const f=document.createElement('iframe'); f.className='doc'; f.setAttribute('sandbox','allow-scripts');
    if(u.trim().startsWith('<')) f.srcdoc=u; else f.src=u; b.appendChild(f);
  }
  else if((t==='Sheet'||t==='E-book') && /\.pdf($|\?)/i.test(u)) b.innerHTML=`<iframe class="doc" src="${esc(u)}"></iframe><a class="btn sm" href="${esc(u)}" target="_blank" rel="noopener">เปิดในแท็บใหม่ ↗</a>`;
  else b.innerHTML=`<a class="btn navy" href="${esc(u)}" target="_blank" rel="noopener">เปิด${t==='Link'?'ลิงก์':'เอกสาร'} ↗</a> <span class="muted small">${esc(u)}</span>`;
}
function attachCues(b,v,m,ctx){
  const cues=list('InteractiveCues').filter(c=>c.media_id===m.media_id).map(c=>({...c,t:+c.time_sec})).sort((a,z)=>a.t-z.t);
  const ov=$('.cue-ov',b), shown=new Set();
  const bar=document.createElement('div'); bar.className='cue-bar'; b.appendChild(bar);
  const drawBar=()=>{ if(!v.duration) return; bar.innerHTML=cues.map(c=>`<i style="left:${Math.min(100,c.t/v.duration*100)}%" data-tip="คำถามที่ ${fmtTime(c.t)}"></i>`).join(''); };
  v.addEventListener('loadedmetadata',drawBar); drawBar();
  v.addEventListener('seeked',()=>cues.forEach(c=>{ if(v.currentTime<c.t) shown.delete(c.cue_id); }));
  v.addEventListener('timeupdate',()=>{
    const c=cues.find(c=>!shown.has(c.cue_id) && v.currentTime>=c.t && v.currentTime<c.t+1.5); if(!c) return;
    shown.add(c.cue_id); const q=byId('Questions',c.question_id); if(!q) return;
    v.pause(); if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    ov.innerHTML=`<div class="cue-card"><span class="cue-badge">คำถามระหว่างชมวิดีโอ · ${fmtTime(c.t)}</span>${qHTML(q)}<div class="row" style="margin-top:10px"><button class="btn primary">ส่งคำตอบ</button><button class="btn ghost sm" data-skip>ข้าม</button></div></div>`;
    ov.classList.remove('hidden');
    const resume=()=>{ ov.classList.add('hidden'); ov.innerHTML=''; v.play(); };
    $('[data-skip]',ov).onclick=resume;
    const btn=$('.btn.primary',ov);
    btn.onclick=()=>{
      if(btn.dataset.next) return resume();
      const a=readAnswer(ov,q); if(a==null||a===''){ toast('กรุณาเลือกคำตอบ'); return; }
      const ok=isCorrect(q,a);
      $('.q-fb',ov).innerHTML= ok?'<span class="ok">✓ ถูกต้อง เก่งมาก!</span>':`<span class="no">✗ คำตอบที่ถูกคือ ${esc(answerText(q))}</span>`;
      track('answered','cue',c.cue_id,{...ctx,score:ok?1:0,max_score:1});
      btn.textContent='ดูวิดีโอต่อ ▶'; btn.dataset.next='1';
    };
  });
}

// ===== client/views/Auth =====
/* View: MEMBER – เข้าสู่ระบบ/สมัครสมาชิก/PDPA */
// =========================================================
//  VIEW: ระบบสมาชิก (MEMBER) + PDPA
// =========================================================
function vLogin(el){
  let provider='google';
  const demo=list('Members').slice(0,6);
  el.innerHTML=`
  <div class="auth">
    <div class="card">
      ${logoTag(BRAND.logo,'auth-logo','DLTV')}
      <h2>เข้าสู่ระบบ</h2>
      <p class="muted small">เลือกช่องทางที่ใช้สมัครสมาชิก</p>
      <button class="prov on" data-p="facebook"><span class="ic" style="background:#1877F2">f</span>ดำเนินการต่อด้วย Facebook</button>
      <button class="prov" data-p="google"><span class="ic" style="background:#fff;color:#EA4335;border:1px solid var(--line)">G</span>ดำเนินการต่อด้วย Google</button>
      <button class="prov" data-p="email"><span class="ic" style="background:#2E7CF6">✉</span>ใช้อีเมล</button>
      <form id="lf" class="row" style="margin-top:8px"><input class="inp sp" id="lemail" type="email" placeholder="อีเมลที่สมัครไว้" required><button class="btn navy">เข้าสู่ระบบ</button></form>
      <p class="muted small" style="margin-top:14px">${IS_GAS?'Google: ระบบจะดึงอีเมลบัญชี Google ที่ใช้งานอยู่ให้อัตโนมัติ (เมื่อ deploy แบบ “User accessing”)':'เฟส 1 (โหมดทดลอง): การเชื่อม Facebook/Google เป็นการจำลอง โดยระบุอีเมลของบัญชีนั้น'}</p>
      <h4 style="margin-top:18px">บัญชีทดลอง</h4>
      <div>${demo.map(m=>`<button class="li" data-login="${m.member_id}"><b>${esc(m.name)}</b><br><span class="small muted">${esc(ROLE_LABEL[m.role])} · ${esc(m.email)}</span></button>`).join('')}</div>
    </div>
    <div class="card">
      <h2>สมัครสมาชิกผู้เรียน</h2>
      <form id="rf">
        <div class="fld"><label>ช่องทางสมัคร</label><select name="provider"><option value="facebook">Facebook</option><option value="google" selected>Google</option><option value="email">อีเมล</option></select></div>
        <div class="fld"><label>ชื่อ–นามสกุล</label><input class="inp" name="name" required></div>
        <div class="fld"><label>อีเมล</label><input class="inp" name="email" type="email" required></div>
        <div class="fld"><label>วันเกิด</label><input class="inp" name="birthdate" type="date" required><span class="hint" id="ageHint">ใช้เพื่อแยกผู้เรียนอายุมากกว่า/ต่ำกว่า 13 ปี</span></div>
        <div id="guard" class="guard hidden">
          <b>ผู้เรียนอายุต่ำกว่า 13 ปี — ต้องให้ผู้ปกครองดูแลและให้ความยินยอม</b>
          <div class="fld" style="margin-top:8px"><label>ชื่อผู้ปกครอง</label><input class="inp" name="guardian_name"></div>
          <div class="fld"><label>อีเมลผู้ปกครอง</label><input class="inp" name="guardian_email" type="email"></div>
        </div>
        <div class="pdpa"><span class="pdpa-badge">🔒 PDPA</span>
          <p style="margin:.5em 0">ข้อมูลส่วนบุคคล (ชื่อ อีเมล วันเกิด และผลการเรียน) จะถูกเก็บเพื่อการจัดการเรียนการสอนและรายงานผลการเรียนเท่านั้น ท่านสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลได้ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</p>
          <label class="row"><input type="checkbox" name="pdpa_consent" value="true"> <span id="pdpaTxt">ข้าพเจ้ายินยอมให้เก็บและใช้ข้อมูลตามที่ระบุ</span></label>
        </div>
        <div class="merr" id="rerr" style="margin-top:8px"></div>
        <button class="btn primary" style="margin-top:6px">สมัครสมาชิก</button>
      </form>
    </div>
  </div>`;
  const setP=p=>{ provider=p; $$('.prov',el).forEach(b=>b.classList.toggle('on',b.dataset.p===p)); $('#rf').provider.value=p; };
  $$('.prov',el).forEach(b=>b.onclick=async()=>{
    setP(b.dataset.p);
    if(b.dataset.p==='google' && IS_GAS){ try{ const w=await call('whoami'); if(w.email){ $('#lemail').value=w.email; $('#rf').email.value=w.email; } }catch(e){} }
    $('#lemail').focus();
  });
  setP('facebook');
  const login=m=>{ ME=m; store.set('dltv_me',m.member_id); toast('ยินดีต้อนรับ '+m.name); go(isStaff()?'dashboard':'home'); };
  $$('[data-login]',el).forEach(b=>b.onclick=()=>login(byId('Members',b.dataset.login)));
  $('#lf').onsubmit=e=>{ e.preventDefault(); const em=$('#lemail').value.trim().toLowerCase(); const m=list('Members').find(x=>String(x.email).toLowerCase()===em); if(!m){ toast('ไม่พบบัญชีนี้ — กรุณาสมัครสมาชิก'); $('#rf').email.value=em; return; } login(m); };
  const rf=$('#rf');
  rf.birthdate.oninput=()=>{ const a=ageFrom(rf.birthdate.value); const u=a!==null&&a<13;
    $('#guard').classList.toggle('hidden',!u); $('#ageHint').textContent=a===null?'':`อายุ ${a} ปี — ${u?'ผู้เรียนอายุต่ำกว่า 13 ปี (ผู้ปกครองดูแล)':'ผู้เรียนอายุ 13 ปีขึ้นไป'}`;
    $('#pdpaTxt').textContent=u?'ข้าพเจ้าในฐานะผู้ปกครอง ยินยอมให้เก็บและใช้ข้อมูลของผู้เรียนตามที่ระบุ':'ข้าพเจ้ายินยอมให้เก็บและใช้ข้อมูลตามที่ระบุ'; };
  rf.onsubmit=async e=>{
    e.preventDefault(); const f=rf.elements;
    const row={provider:f.provider.value,name:f.name.value.trim(),email:f.email.value.trim(),birthdate:f.birthdate.value,guardian_name:f.guardian_name.value.trim(),guardian_email:f.guardian_email.value.trim(),pdpa_consent:f.pdpa_consent.checked?'true':'false'};
    try{ const m=await call('register',{row}); DB.Members.push(m); login(m); }catch(err){ $('#rerr').textContent=err.message; }
  };
}

// ===== client/views/Studio =====
/* View: คลังสื่อ, คลังแบบทดสอบ, สร้าง Interactive VDO */
// =========================================================
//  VIEW: คลังสื่อ / คลังแบบทดสอบ / ระบบสร้างสื่อ Interactive VDO
// =========================================================
function vStudio(el,{tab='media',mid}){
  el.innerHTML=`<h1>คลังสื่อ & แบบทดสอบ</h1>
  <div class="tabs">${[['media','คลังสื่อ'],['questions','คลังแบบทดสอบ'],['ivdo','สร้างสื่อ Interactive VDO']].map(([k,l])=>`<button data-go="studio" data-tab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div><div id="tabBody"></div>`;
  const tb=$('#tabBody');
  if(tab==='media') studioMedia(tb); else if(tab==='questions') studioQuestions(tb); else studioIVDO(tb,mid);
}
const MEDIA_FIELDS=()=>[
  {k:'title',label:'ชื่อสื่อ',req:true},
  {k:'type',label:'ประเภท',type:'select',options:MEDIA_TYPES},
  {k:'url',label:'URL / โค้ด HTML',type:'textarea',hint:'วิดีโอ: ลิงก์ .mp4 หรือ YouTube · H5P: ลิงก์ embed · HTML: ลิงก์ หรือวางโค้ด HTML ได้'},
  {k:'subject',label:'วิชา'},{k:'grade',label:'ระดับชั้น',hint:'เช่น ป.1, ม.2'},{k:'tags',label:'แท็ก (คั่นด้วย ,)'}
];
function studioMedia(el){
  el.innerHTML=`<div class="row" style="margin-bottom:12px"><select id="mt"><option value="">ทุกประเภท</option>${MEDIA_TYPES.map(([a,b])=>`<option value="${a}">${b}</option>`).join('')}</select><input class="inp" id="mq" placeholder="ค้นหา…"><span class="sp"></span><button class="btn primary" id="addM">+ เพิ่มสื่อ</button></div><div class="card scroll" style="padding:6px"><table class="tbl"><thead><tr><th>รหัส</th><th>ชื่อสื่อ</th><th>ประเภท</th><th>วิชา / ชั้น</th><th>ใช้ในหน่วย</th><th></th></tr></thead><tbody id="mb"></tbody></table></div>`;
  const draw=()=>{
    const t=$('#mt').value,q=$('#mq').value.toLowerCase();
    const rows=list('Media').filter(m=>(!t||m.type===t)&&(!q||(m.title+m.tags).toLowerCase().includes(q)));
    $('#mb').innerHTML=rows.map(m=>{ const used=list('Units').filter(u=>ids(u.media_ids).includes(m.media_id)).length;
      return `<tr><td class="muted small">${m.media_id}</td><td><b>${esc(m.title)}</b><div class="small muted">${esc(m.tags)}</div></td><td><span class="tag t-${esc(m.type)}">${esc(m.type)}</span></td><td>${esc(m.subject)} ${esc(m.grade)}</td><td>${used}</td>
      <td style="white-space:nowrap"><button class="btn sm" data-pv="${m.media_id}">ดู</button> ${(m.type==='VDO'||m.type==='InteractiveVDO')&&!ytId(m.url)?`<button class="btn sm" data-go="studio" data-tab="ivdo" data-mid="${m.media_id}">จุดคำถาม</button> `:''}<button class="btn sm" data-ed="${m.media_id}">แก้ไข</button> <button class="btn sm danger" data-rm="${m.media_id}">ลบ</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="empty">ไม่มีสื่อ</td></tr>';
    $$('[data-pv]').forEach(b=>b.onclick=()=>{ const m=byId('Media',b.dataset.pv); const c=openModal('ตัวอย่างสื่อ','<div class="media"></div>',true); mediaPlayer($('.media',c),m,{preview:true}); });
    $$('[data-ed]').forEach(b=>b.onclick=()=>{ const m=byId('Media',b.dataset.ed); formModal('แก้ไขสื่อ',MEDIA_FIELDS(),m,v=>save('Media',v,m.media_id)); });
    $$('[data-rm]').forEach(b=>b.onclick=()=>confirmDel('Media',b.dataset.rm,byId('Media',b.dataset.rm).title));
  };
  $('#mt').oninput=draw; $('#mq').oninput=draw; draw();
  $('#addM').onclick=()=>formModal('เพิ่มสื่อเข้าคลัง',MEDIA_FIELDS(),{type:'VDO'},v=>save('Media',{...v,created_by:ME.member_id}));
}
const Q_FIELDS=()=>[
  {k:'type',label:'รูปแบบคำถาม',type:'select',options:[['mcq','ปรนัย (เลือกตอบ)'],['tf','ถูก / ผิด'],['short','เติมคำตอบสั้น']]},
  {k:'question',label:'คำถาม',type:'textarea',req:true},
  {k:'choices',label:'ตัวเลือก (บรรทัดละ 1 ตัวเลือก — เฉพาะปรนัย)',type:'textarea'},
  {k:'answer',label:'คำตอบที่ถูก',req:true,hint:'ปรนัย: ใส่ลำดับตัวเลือก (1, 2, 3…) · ถูก/ผิด: true หรือ false · เติมคำ: ข้อความคำตอบ'},
  {k:'subject',label:'วิชา'},{k:'grade',label:'ระดับชั้น'},
  {k:'difficulty',label:'ระดับความยาก',type:'select',options:[['easy','ง่าย'],['medium','ปานกลาง'],['hard','ยาก']]}
];
function qToForm(q){ return {...q, choices:parseChoices(q.choices).join('\n'), answer:q.type==='mcq'?(+q.answer+1):q.answer}; }
function qFromForm(v){
  const out={...v};
  if(v.type==='mcq'){ const ch=parseChoices(v.choices); const n=parseInt(v.answer,10); if(ch.length<2) throw new Error('ปรนัยต้องมีอย่างน้อย 2 ตัวเลือก'); if(!(n>=1&&n<=ch.length)) throw new Error('ลำดับคำตอบต้องอยู่ระหว่าง 1–'+ch.length); out.choices=JSON.stringify(ch); out.answer=String(n-1); }
  else if(v.type==='tf'){ const a=String(v.answer).trim().toLowerCase(); if(!['true','false','ถูก','ผิด'].includes(a)) throw new Error('คำตอบต้องเป็น true หรือ false'); out.answer=(a==='true'||a==='ถูก')?'true':'false'; out.choices=''; }
  else out.choices='';
  return out;
}
function studioQuestions(el){
  el.innerHTML=`<div class="row" style="margin-bottom:12px"><input class="inp" id="qq" placeholder="ค้นหาคำถาม…"><span class="sp"></span><button class="btn primary" id="addQ">+ เพิ่มข้อสอบ</button></div><div class="card scroll" style="padding:6px"><table class="tbl"><thead><tr><th>รหัส</th><th>คำถาม</th><th>รูปแบบ</th><th>คำตอบ</th><th>วิชา / ชั้น</th><th></th></tr></thead><tbody id="qb"></tbody></table></div>`;
  const TL={mcq:'ปรนัย',tf:'ถูก/ผิด',short:'เติมคำ'};
  const draw=()=>{ const s=$('#qq').value.toLowerCase();
    $('#qb').innerHTML=list('Questions').filter(q=>!s||q.question.toLowerCase().includes(s)).map(q=>`<tr><td class="muted small">${q.question_id}</td><td>${esc(q.question)}</td><td>${TL[q.type]||q.type}</td><td>${esc(answerText(q))}</td><td>${esc(q.subject)} ${esc(q.grade)}</td><td style="white-space:nowrap"><button class="btn sm" data-ed="${q.question_id}">แก้ไข</button> <button class="btn sm danger" data-rm="${q.question_id}">ลบ</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">ยังไม่มีข้อสอบ</td></tr>';
    $$('[data-ed]').forEach(b=>b.onclick=()=>{ const q=byId('Questions',b.dataset.ed); formModal('แก้ไขข้อสอบ',Q_FIELDS(),qToForm(q),v=>save('Questions',qFromForm(v),q.question_id)); });
    $$('[data-rm]').forEach(b=>b.onclick=()=>confirmDel('Questions',b.dataset.rm,byId('Questions',b.dataset.rm).question));
  };
  $('#qq').oninput=draw; draw();
  $('#addQ').onclick=()=>formModal('เพิ่มข้อสอบเข้าคลัง',Q_FIELDS(),{type:'mcq',difficulty:'easy'},v=>save('Questions',{...qFromForm(v),created_by:ME.member_id}));
}
function studioIVDO(el,mid){
  const vids=list('Media').filter(m=>(m.type==='VDO'||m.type==='InteractiveVDO')&&!ytId(m.url));
  mid = mid || vids[0]?.media_id;
  const m=byId('Media',mid);
  el.innerHTML=`<div class="two">
    <div class="card"><h3>เลือกวิดีโอจากคลังสื่อ</h3>${vids.map(v=>`<button class="li ${v.media_id===mid?'on':''}" data-go="studio" data-tab="ivdo" data-mid="${v.media_id}"><b>${esc(v.title)}</b><br><span class="small muted">${v.type==='InteractiveVDO'?'Interactive · '+list('InteractiveCues').filter(c=>c.media_id===v.media_id).length+' คำถาม':'วิดีโอธรรมดา'}</span></button>`).join('')||'<div class="muted">ยังไม่มีวิดีโอ .mp4 ในคลังสื่อ</div>'}
      <p class="small muted">ขั้นตอน: เล่นวิดีโอ → หยุดที่ตำแหน่งที่ต้องการ → เลือกคำถามจากคลังแบบทดสอบ → “เพิ่มจุดคำถาม”</p></div>
    <div class="card">${m?`<h3>${esc(m.title)}</h3><div id="pv"></div>
      <div class="row" style="margin-top:12px"><span>ตำแหน่ง: <b id="ct">0:00.0</b></span>
      <select id="cq" class="sp">${list('Questions').map(q=>`<option value="${q.question_id}">${esc(q.question_id)} · ${esc(q.question.slice(0,60))}</option>`).join('')}</select>
      <button class="btn primary" id="addCue">+ เพิ่มจุดคำถาม</button></div>
      <table class="tbl" style="margin-top:14px"><thead><tr><th>เวลา</th><th>คำถาม</th><th></th></tr></thead><tbody>
      ${list('InteractiveCues').filter(c=>c.media_id===mid).sort((a,b)=>a.time_sec-b.time_sec).map(c=>`<tr><td>${fmtTime(c.time_sec)}</td><td>${esc(byId('Questions',c.question_id)?.question||c.question_id)}</td><td><button class="btn sm danger" data-rm="${c.cue_id}">ลบ</button></td></tr>`).join('')||'<tr><td colspan="3" class="muted">ยังไม่มีจุดคำถาม</td></tr>'}
      </tbody></table>`:'<div class="empty">เลือกวิดีโอทางซ้าย</div>'}</div></div>`;
  if(!m) return;
  const box=document.createElement('div'); box.className='media'; $('#pv').appendChild(box);
  mediaPlayer(box,{...m,type:'InteractiveVDO'},{preview:true});
  const v=$('video',box);
  const keep=store.get('dltv_ivdo_t'); if(keep && keep.mid===mid) v.addEventListener('loadedmetadata',()=>{ v.currentTime=keep.t; },{once:true});
  v.addEventListener('timeupdate',()=>$('#ct').textContent=fmtTime(v.currentTime));
  $('#addCue').onclick=async()=>{
    const q=$('#cq').value; if(!q){ toast('ยังไม่มีข้อสอบในคลัง'); return; }
    await save('InteractiveCues',{media_id:mid,time_sec:v.currentTime.toFixed(1),question_id:q});
    if(m.type!=='InteractiveVDO') await save('Media',{type:'InteractiveVDO'},mid);
    store.set('dltv_ivdo_t',{mid,t:v.currentTime}); toast('เพิ่มจุดคำถามแล้ว'); render();
  };
  $$('[data-rm]',el).forEach(b=>b.onclick=()=>confirmDel('InteractiveCues',b.dataset.rm,'จุดคำถามนี้'));
}

// ===== client/views/Lcms =====
/* View: LCMS */
// =========================================================
//  VIEW: LCMS – บริหารจัดการเนื้อหาและหน่วยการเรียน
// =========================================================
const COURSE_FIELDS=()=>[
  {k:'title',label:'ชื่อรายวิชา',req:true},
  {k:'subject',label:'กลุ่มสาระ',type:'select',options:Object.keys(SUBJECT_COLOR).map(s=>[s,s])},
  {k:'grade',label:'ระดับชั้น',req:true,hint:'เช่น ป.1'},
  {k:'description',label:'คำอธิบายรายวิชา',type:'textarea'},
  {k:'status',label:'สถานะ',type:'select',options:[['draft','ฉบับร่าง (ผู้เรียนยังไม่เห็น)'],['published','เผยแพร่']]}
];
const UNIT_FIELDS=()=>[
  {k:'seq',label:'ลำดับหน่วย',type:'number',req:true},
  {k:'title',label:'ชื่อหน่วยการเรียน',req:true},
  {k:'media_ids',label:'สื่อจากคลังสื่อ',type:'checks',options:list('Media').map(m=>[m.media_id,`[${m.type}] ${m.title}`])},
  {k:'question_ids',label:'แบบฝึกหัดจากคลังแบบทดสอบ',type:'checks',options:list('Questions').map(q=>[q.question_id,`${q.question_id} · ${q.question}`])}
];
function vLCMS(el,{cid}){
  const courses=list('Courses'); cid=cid||courses[0]?.course_id; const c=byId('Courses',cid);
  el.innerHTML=`<div class="row"><h1 class="sp">บริหารจัดการเนื้อหาและหน่วยการเรียน (LCMS)</h1><button class="btn primary" id="addC">+ สร้างรายวิชา</button></div>
  <div class="two" style="margin-top:10px">
    <div>${courses.map(x=>`<button class="li ${x.course_id===cid?'on':''}" data-go="lcms" data-cid="${x.course_id}"><b>${esc(x.title)}</b><br><span class="small muted">${esc(x.subject)} · ${esc(x.grade)} · ${x.status==='published'?'เผยแพร่':'ฉบับร่าง'} · ${unitsOf(x.course_id).length} หน่วย</span></button>`).join('')||'<div class="muted">ยังไม่มีรายวิชา</div>'}</div>
    <div class="card">${c?`
      <div class="row"><div class="sp"><div class="small muted">${c.course_id} · ${esc(c.subject)} · ${esc(c.grade)}</div><h2>${esc(c.title)}</h2><div class="muted">${esc(c.description)}</div></div>
      <span class="st ${c.status==='published'?'done':'todo'}">${c.status==='published'?'● เผยแพร่':'○ ฉบับร่าง'}</span></div>
      <div class="row" style="margin:12px 0"><button class="btn sm" id="edC">แก้ไขรายวิชา</button><button class="btn sm" data-go="course" data-id="${c.course_id}">ดูมุมมองผู้เรียน</button><button class="btn sm danger" id="rmC">ลบรายวิชา</button><span class="sp"></span><button class="btn primary sm" id="addU">+ เพิ่มหน่วยการเรียน</button></div>
      <table class="tbl"><thead><tr><th>#</th><th>หน่วยการเรียน</th><th>สื่อ</th><th>แบบฝึกหัด</th><th></th></tr></thead><tbody>
      ${unitsOf(cid).map(u=>`<tr><td>${esc(u.seq)}</td><td><b>${esc(u.title)}</b></td><td class="small">${ids(u.media_ids).map(i=>esc(byId('Media',i)?.title||i)).join('<br>')||'-'}</td><td>${ids(u.question_ids).length} ข้อ</td><td style="white-space:nowrap"><button class="btn sm" data-eu="${u.unit_id}">แก้ไข</button> <button class="btn sm danger" data-ru="${u.unit_id}">ลบ</button></td></tr>`).join('')||'<tr><td colspan="5" class="muted">ยังไม่มีหน่วยการเรียน</td></tr>'}
      </tbody></table>`:'<div class="empty">สร้างรายวิชาแรก</div>'}</div></div>`;
  $('#addC').onclick=()=>formModal('สร้างรายวิชา',COURSE_FIELDS(),{status:'draft',subject:'คณิตศาสตร์'},async v=>{ const r=await save('Courses',{...v,created_by:ME.member_id}); VIEW.params={cid:r.course_id}; });
  if(!c) return;
  $('#edC').onclick=()=>formModal('แก้ไขรายวิชา',COURSE_FIELDS(),c,v=>save('Courses',v,cid));
  $('#rmC').onclick=async()=>{ if(unitsOf(cid).length){ toast('ลบหน่วยการเรียนในรายวิชาก่อน'); return; } await confirmDel('Courses',cid,c.title); VIEW.params={}; render(); };
  $('#addU').onclick=()=>formModal('เพิ่มหน่วยการเรียน',UNIT_FIELDS(),{seq:unitsOf(cid).length+1},v=>save('Units',{...v,course_id:cid}));
  $$('[data-eu]',el).forEach(b=>b.onclick=()=>{ const u=byId('Units',b.dataset.eu); formModal('แก้ไขหน่วยการเรียน',UNIT_FIELDS(),u,v=>save('Units',v,u.unit_id)); });
  $$('[data-ru]',el).forEach(b=>b.onclick=()=>confirmDel('Units',b.dataset.ru,byId('Units',b.dataset.ru).title));
}

// ===== client/views/Lms =====
/* View: LMS */
// =========================================================
//  VIEW: LMS – บริหารจัดการการเรียนการสอน
// =========================================================
function vLMS(el,{cls}){
  if(isStudent(ME)){
    const mine=myClasses();
    el.innerHTML=`<h1>ห้องเรียนของฉัน</h1>${mine.length?mine.map(k=>{ const c=byId('Courses',k.course_id); const t=byId('Members',k.teacher_id);
      return `<div class="card" style="margin-bottom:14px"><div class="row"><div class="sp"><h3>${esc(k.name)}</h3><div class="muted small">ภาคเรียน ${esc(k.term)} · ผู้สอน ${esc(t?.name||'-')}</div></div></div>
      ${c?`<div class="grid" style="margin-top:12px">${courseCard(c)}</div>`:''}</div>`; }).join('')
      :'<div class="card empty">ยังไม่ได้ลงทะเบียนในห้องเรียนใด — ผู้สอนจะเพิ่มคุณเข้าห้องเรียน หรือเลือกเรียนรายวิชาจาก <a data-go="home">หน้าหลัก</a></div>'}`;
    return;
  }
  const classes=myClasses(); cls=cls||classes[0]?.class_id; const k=byId('Classes',cls);
  el.innerHTML=`<div class="row"><h1 class="sp">บริหารจัดการการเรียนการสอน (LMS)</h1><button class="btn primary" id="addK">+ สร้างห้องเรียน</button></div>
  <div class="two" style="margin-top:10px">
    <div>${classes.map(x=>`<button class="li ${x.class_id===cls?'on':''}" data-go="lms" data-cls="${x.class_id}"><b>${esc(x.name)}</b><br><span class="small muted">${esc(byId('Courses',x.course_id)?.title||'-')} · ${rosterOf(x.class_id).length} คน</span></button>`).join('')||'<div class="muted">ยังไม่มีห้องเรียน</div>'}</div>
    <div class="card">${k?(()=>{ const c=byId('Courses',k.course_id), r=rosterOf(cls);
      const cand=list('Members').filter(m=>isStudent(m)&&!r.some(x=>x.member_id===m.member_id));
      return `<div class="row"><div class="sp"><div class="small muted">${k.class_id} · ภาคเรียน ${esc(k.term)} · ผู้สอน ${esc(byId('Members',k.teacher_id)?.name||'-')}</div><h2>${esc(k.name)}</h2><div>รายวิชา: <a data-go="course" data-id="${k.course_id}">${esc(c?.title||'-')}</a></div></div><button class="btn sm" id="edK">แก้ไข</button><button class="btn sm danger" id="rmK">ลบ</button></div>
      <h3 style="margin-top:18px">รายชื่อผู้เรียน (${r.length})</h3>
      <div class="row" style="margin-bottom:10px"><select id="addSel" class="sp">${cand.map(m=>`<option value="${m.member_id}">${esc(m.name)} · ${esc(ROLE_LABEL[m.role])}</option>`).join('')||'<option value="">ไม่มีผู้เรียนให้เพิ่ม</option>'}</select><button class="btn navy" id="enroll">+ เพิ่มเข้าห้อง</button></div>
      <div class="scroll"><table class="tbl"><thead><tr><th>ผู้เรียน</th><th>กลุ่มอายุ</th><th>ความก้าวหน้า</th><th>คะแนนเฉลี่ย</th><th>กิจกรรมล่าสุด</th><th></th></tr></thead><tbody>
      ${r.map(m=>{ const p=progress(m.member_id,k.course_id), s=avgScore(m.member_id,k.course_id); const last=recsOf(m.member_id).sort((a,b)=>b.timestamp.localeCompare(a.timestamp))[0];
        return `<tr><td><b>${esc(m.name)}</b><div class="small muted">${esc(m.email)}</div></td><td class="small">${m.age_group==='under13'?'ต่ำกว่า 13 ปี':'13 ปีขึ้นไป'}</td><td style="min-width:140px"><div class="bar"><i style="width:${p}%"></i></div><span class="small">${p}%</span></td><td>${s===null?'-':s+'%'}</td><td class="small">${last?fmtDT(last.timestamp):'-'}</td><td><button class="btn sm danger" data-un="${m.member_id}">นำออก</button></td></tr>`; }).join('')||'<tr><td colspan="6" class="muted">ยังไม่มีผู้เรียน</td></tr>'}
      </tbody></table></div>`; })():'<div class="empty">สร้างห้องเรียนแรก</div>'}</div></div>`;
  const KF=()=>[{k:'name',label:'ชื่อห้องเรียน',req:true,hint:'เช่น ป.1/1'},{k:'course_id',label:'รายวิชา',type:'select',options:list('Courses').map(c=>[c.course_id,c.title])},{k:'term',label:'ภาคเรียน',def:'2/2569'},
    ...(ME.role==='admin'?[{k:'teacher_id',label:'ผู้สอน',type:'select',options:list('Members').filter(m=>m.role==='teacher'||m.role==='admin').map(m=>[m.member_id,m.name])}]:[])];
  $('#addK').onclick=()=>formModal('สร้างห้องเรียน',KF(),{},async v=>{ const r=await save('Classes',{teacher_id:ME.member_id,...v}); VIEW.params={cls:r.class_id}; });
  if(!k) return;
  $('#edK').onclick=()=>formModal('แก้ไขห้องเรียน',KF(),k,v=>save('Classes',v,cls));
  $('#rmK').onclick=async()=>{ if(rosterOf(cls).length){ toast('นำผู้เรียนออกจากห้องก่อน'); return; } await confirmDel('Classes',cls,k.name); VIEW.params={}; render(); };
  $('#enroll').onclick=async()=>{ const id=$('#addSel').value; if(!id) return; await save('Enrollments',{class_id:cls,member_id:id}); toast('เพิ่มผู้เรียนแล้ว'); render(); };
  $$('[data-un]',el).forEach(b=>b.onclick=async()=>{ const e=list('Enrollments').find(x=>x.class_id===cls&&x.member_id===b.dataset.un); if(e) await confirmDel('Enrollments',e.enroll_id,byId('Members',b.dataset.un).name+' ออกจากห้อง'); });
}

// ===== client/views/Csm =====
/* View: CSM */
// =========================================================
//  VIEW: CSM – การเรียนรู้แบบกลุ่ม
// =========================================================
function groupCard(g,staff){
  const mem=ids(g.member_ids).map(i=>byId('Members',i)).filter(Boolean);
  return `<div class="card"><div class="row"><h3 class="sp" style="margin:0">${esc(g.name)}</h3><span class="st ${esc(g.status)}">${STATUS[g.status]||esc(g.status)}</span></div>
    <div class="small muted" style="margin:4px 0 8px">${esc(byId('Classes',g.class_id)?.name||'')}</div>
    <div><b>ภารกิจ:</b> ${esc(g.task)||'-'}</div>
    <div style="margin-top:8px" class="small"><b>สมาชิก (${mem.length}):</b> ${mem.map(m=>esc(m.name)).join(', ')||'-'}</div>
    <div class="row" style="margin-top:12px">${['todo','doing','done'].map(s=>`<button class="btn sm ${g.status===s?'navy':''}" data-gs="${g.group_id}" data-s="${s}">${STATUS[s]}</button>`).join('')}
    ${staff?`<span class="sp"></span><button class="btn sm" data-ge="${g.group_id}">แก้ไข</button><button class="btn sm danger" data-gr="${g.group_id}">ลบ</button>`:''}</div></div>`;
}
function vCSM(el,{cls}){
  const staff=isStaff();
  let groups, classes=myClasses();
  if(staff){ cls=cls||classes[0]?.class_id; groups=list('Groups').filter(g=>g.class_id===cls); }
  else groups=list('Groups').filter(g=>ids(g.member_ids).includes(ME.member_id));
  el.innerHTML=`<div class="row"><h1 class="sp">ระบบการจัดการการเรียนรู้แบบกลุ่ม (CSM)</h1>${staff&&cls?'<button class="btn primary" id="addG">+ สร้างกลุ่ม</button>':''}</div>
  ${staff?`<div class="row" style="margin:6px 0 16px"><span>ห้องเรียน:</span>${classes.map(k=>`<button class="btn sm ${k.class_id===cls?'navy':''}" data-go="csm" data-cls="${k.class_id}">${esc(k.name)}</button>`).join('')||'<span class="muted">ยังไม่มีห้องเรียน</span>'}</div>`:'<p class="muted">กลุ่มที่คุณเป็นสมาชิก — อัปเดตสถานะงานกลุ่มได้ที่นี่</p>'}
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${groups.map(g=>groupCard(g,staff)).join('')||'<div class="card empty">ยังไม่มีกลุ่ม</div>'}</div>`;
  const GF=()=>[{k:'name',label:'ชื่อกลุ่ม',req:true},{k:'task',label:'ภารกิจ / งานกลุ่ม',type:'textarea'},
    {k:'member_ids',label:'สมาชิกกลุ่ม (จากผู้เรียนในห้อง)',type:'checks',options:rosterOf(cls).map(m=>[m.member_id,m.name])},
    {k:'status',label:'สถานะ',type:'select',options:Object.entries(STATUS)}];
  const ag=$('#addG'); if(ag) ag.onclick=()=>formModal('สร้างกลุ่มการเรียนรู้',GF(),{status:'todo'},v=>save('Groups',{...v,class_id:cls}));
  $$('[data-gs]',el).forEach(b=>b.onclick=async()=>{ const g=byId('Groups',b.dataset.gs); await save('Groups',{status:b.dataset.s},g.group_id); await track('updated','group',g.group_id,{extra:{status:b.dataset.s}}); toast('อัปเดตสถานะแล้ว'); render(); });
  $$('[data-ge]',el).forEach(b=>b.onclick=()=>{ const g=byId('Groups',b.dataset.ge); formModal('แก้ไขกลุ่ม',GF(),g,v=>save('Groups',v,g.group_id)); });
  $$('[data-gr]',el).forEach(b=>b.onclick=()=>confirmDel('Groups',b.dataset.gr,byId('Groups',b.dataset.gr).name));
}

// ===== client/views/Dashboard =====
/* View: LRS Report & Dashboard */
// =========================================================
//  VIEW: LRS – Report & Dashboard (ผู้เรียน / ผู้สอน / ผู้ดูแลระบบ)
// =========================================================
function niceMax(v){ if(v<=10) return Math.max(2,Math.ceil(v/2)*2); const p=Math.pow(10,Math.floor(Math.log10(v))); return Math.ceil(v/p*2)/2*p; }
function barChart(data,{title='',unit='',h=210}={}){
  const W=680,H=h,pl=34,pr=8,pt=10,pb=26, iw=W-pl-pr, ih=H-pt-pb;
  const max=niceMax(Math.max(1,...data.map(d=>d.value))), step=iw/data.length, bw=Math.max(4,Math.min(36,step*0.62));
  const every=Math.ceil(data.length/10), y=v=>pt+ih-(v/max)*ih;
  const grid=[0,max/2,max].map(v=>`<line x1="${pl}" x2="${W-pr}" y1="${y(v)}" y2="${y(v)}" stroke="#E9ECF2"/><text x="${pl-6}" y="${y(v)+4}" text-anchor="end" font-size="11" fill="#667085">${Math.round(v)}</text>`).join('');
  const bars=data.map((d,i)=>{ const x=pl+i*step+(step-bw)/2, top=y(d.value), hh=pt+ih-top, r=Math.min(4,hh);
    const path= hh>0?`<path d="M${x},${pt+ih} V${top+r} Q${x},${top} ${x+r},${top} H${x+bw-r} Q${x+bw},${top} ${x+bw},${top+r} V${pt+ih} Z" fill="var(--series-1)"/>`:'';
    return `<g data-tip="${esc(d.label)}: ${d.value}${unit}">${path}<rect x="${pl+i*step}" y="${pt}" width="${step}" height="${ih}" fill="transparent"/></g>${i%every===0?`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle" font-size="11" fill="#667085">${esc(d.label)}</text>`:''}`; }).join('');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${grid}<line x1="${pl}" x2="${W-pr}" y1="${pt+ih}" y2="${pt+ih}" stroke="#C9CFDB"/>${bars}</svg>
    <details><summary>ดูเป็นตาราง</summary><table class="tbl"><tbody>${data.map(d=>`<tr><td>${esc(d.label)}</td><td>${d.value}${unit}</td></tr>`).join('')}</tbody></table></details></div>`;
}
function activityByDay(recs,days=14){
  const out=[]; for(let i=days-1;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const key=d.toDateString();
    out.push({label:d.toLocaleDateString('th-TH',{day:'numeric',month:'short'}),value:recs.filter(r=>new Date(r.timestamp).toDateString()===key).length}); }
  return out;
}
const tile=(v,l)=>`<div class="tile"><div class="v">${v}</div><div class="l">${l}</div></div>`;
function recTable(recs,showWho){
  return `<div class="scroll"><table class="tbl"><thead><tr><th>เวลา</th>${showWho?'<th>ผู้เรียน</th>':''}<th>กิจกรรม</th><th>รายการ</th><th>ผล</th></tr></thead><tbody>${
    recs.sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).slice(0,12).map(r=>{
      const obj = r.object_type==='unit'||r.object_type==='quiz' ? (byId('Units',r.object_id)?.title||r.object_id) : r.object_type==='media' ? (byId('Media',r.object_id)?.title||r.object_id) : r.object_type==='group' ? (byId('Groups',r.object_id)?.name||r.object_id) : r.object_type==='cue' ? 'คำถามใน Interactive VDO' : r.object_id;
      return `<tr><td class="small">${fmtDT(r.timestamp)}</td>${showWho?`<td>${esc(byId('Members',r.member_id)?.name||r.member_id)}</td>`:''}<td>${VERB_LABEL[r.verb]||esc(r.verb)}${r.object_type==='quiz'?' (แบบฝึกหัด)':''}</td><td>${esc(obj)}</td><td>${r.max_score!==''&&r.max_score!=null&&+r.max_score>0?`${r.score}/${r.max_score}`:'-'}</td></tr>`; }).join('')||'<tr><td colspan="5" class="muted">ยังไม่มีข้อมูล</td></tr>'}</tbody></table></div>`;
}
function vDashboard(el,{lens,who,cls}){
  const lenses = ME.role==='admin'?[['admin','ผู้ดูแลระบบ'],['teacher','ผู้สอน'],['learner','ผู้เรียน']] : ME.role==='teacher'?[['teacher','ผู้สอน'],['learner','ผู้เรียน']] : [['learner','ผู้เรียน']];
  lens = lens || lenses[0][0];
  el.innerHTML=`<h1>Report & Dashboard</h1><div class="tabs">${lenses.map(([k,l])=>`<button data-go="dashboard" data-lens="${k}" class="${lens===k?'on':''}">สำหรับ${l}</button>`).join('')}</div><div id="dash"></div>`;
  const d=$('#dash');
  if(lens==='learner'){
    const students=isStaff()?list('Members').filter(isStudent):[ME];
    const m = byId('Members',who) || (isStudent(ME)?ME:students[0]);
    if(!m){ d.innerHTML='<div class="empty">ยังไม่มีผู้เรียน</div>'; return; }
    const recs=recsOf(m.member_id);
    const courseIds=[...new Set([...myClassesOf(m).map(k=>k.course_id), ...recs.map(r=>r.course_id).filter(Boolean)])];
    const s=avgScore(m.member_id);
    d.innerHTML=`${isStaff()?`<div class="row" style="margin-bottom:12px"><span>ผู้เรียน:</span><select id="who">${students.map(x=>`<option value="${x.member_id}" ${x.member_id===m.member_id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>`:''}
      <div class="tiles">${tile(courseIds.length,'รายวิชาที่เรียน')}${tile(doneUnits(m.member_id).size,'หน่วยที่เรียนจบ')}${tile(s===null?'-':s+'%','คะแนนแบบฝึกหัดเฉลี่ย')}${tile(recs.length,'กิจกรรมการเรียนทั้งหมด')}</div>
      <div class="two" style="grid-template-columns:1fr 1fr">
        <div class="card"><h3>ความก้าวหน้ารายวิชา</h3>${courseIds.map(cid=>{ const c=byId('Courses',cid); if(!c) return ''; const p=progress(m.member_id,cid), sc=avgScore(m.member_id,cid);
          return `<div class="hb"><a data-go="course" data-id="${cid}">${esc(c.title)}</a><div class="bar" data-tip="เรียนแล้ว ${p}%${sc!==null?' · คะแนนเฉลี่ย '+sc+'%':''}"><i style="width:${p}%"></i></div><b>${p}%</b></div>`; }).join('')||'<div class="muted">ยังไม่มีข้อมูล</div>'}</div>
        <div class="card"><h3>กิจกรรมการเรียน 14 วันล่าสุด</h3>${barChart(activityByDay(recs),{title:'จำนวนกิจกรรมต่อวัน',unit:' กิจกรรม',h:180})}</div>
      </div>
      <div class="card" style="margin-top:16px"><h3>บันทึกการเรียนล่าสุด (LRS)</h3>${recTable(recs,false)}</div>`;
    const w=$('#who'); if(w) w.onchange=()=>go('dashboard',{lens,who:w.value});
    return;
  }
  if(lens==='teacher'){
    const classes=myClasses(); const k=byId('Classes',cls)||classes[0];
    if(!k){ d.innerHTML='<div class="card empty">ยังไม่มีห้องเรียน — สร้างได้ที่เมนู LMS</div>'; return; }
    const r=rosterOf(k.class_id), mids=new Set(r.map(m=>m.member_id));
    const recs=list('LearningRecords').filter(x=>mids.has(x.member_id)&&(x.course_id===k.course_id||!x.course_id));
    const ps=r.map(m=>progress(m.member_id,k.course_id)), ss=r.map(m=>avgScore(m.member_id,k.course_id)).filter(x=>x!==null);
    const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length):null;
    const units=unitsOf(k.course_id);
    d.innerHTML=`<div class="row" style="margin-bottom:12px"><span>ห้องเรียน:</span>${classes.map(x=>`<button class="btn sm ${x.class_id===k.class_id?'navy':''}" data-go="dashboard" data-lens="teacher" data-cls="${x.class_id}">${esc(x.name)}</button>`).join('')}</div>
      <div class="tiles">${tile(r.length,'ผู้เรียนในห้อง')}${tile(avg(ps)===null?'-':avg(ps)+'%','ความก้าวหน้าเฉลี่ย')}${tile(avg(ss)===null?'-':avg(ss)+'%','คะแนนเฉลี่ยของห้อง')}${tile(r.filter(m=>recsOf(m.member_id).some(x=>Date.now()-new Date(x.timestamp)<7*864e5)).length+'/'+r.length,'เข้าเรียนใน 7 วัน')}</div>
      <div class="two" style="grid-template-columns:1fr 1fr">
        <div class="card"><h3>จำนวนผู้เรียนที่จบแต่ละหน่วย</h3>${units.length?barChart(units.map(u=>({label:'หน่วย '+u.seq,value:r.filter(m=>doneUnits(m.member_id).has(u.unit_id)).length})),{title:'ผู้เรียนที่จบแต่ละหน่วย',unit:' คน',h:180}):'<div class="muted">ยังไม่มีหน่วยการเรียน</div>'}</div>
        <div class="card"><h3>กิจกรรมของห้อง 14 วันล่าสุด</h3>${barChart(activityByDay(recs),{title:'กิจกรรมต่อวัน',unit:' กิจกรรม',h:180})}</div>
      </div>
      <div class="card" style="margin-top:16px"><h3>ผลการเรียนรายบุคคล</h3><div class="scroll"><table class="tbl"><thead><tr><th>ผู้เรียน</th>${units.map(u=>`<th title="${esc(u.title)}">หน่วย ${esc(u.seq)}</th>`).join('')}<th>ความก้าวหน้า</th><th>คะแนนเฉลี่ย</th><th></th></tr></thead><tbody>
      ${r.map(m=>{ const du=doneUnits(m.member_id), sc=avgScore(m.member_id,k.course_id); return `<tr><td><b>${esc(m.name)}</b></td>${units.map(u=>`<td>${du.has(u.unit_id)?'<span class="ok">✓ จบ</span>':'<span class="muted">–</span>'}</td>`).join('')}<td>${progress(m.member_id,k.course_id)}%</td><td>${sc===null?'-':sc+'%'}</td><td><button class="btn sm" data-go="dashboard" data-lens="learner" data-who="${m.member_id}">รายละเอียด</button></td></tr>`; }).join('')||'<tr><td class="muted">ยังไม่มีผู้เรียน</td></tr>'}
      </tbody></table></div></div>`;
    return;
  }
  // admin
  const M=list('Members'), R=list('LearningRecords');
  const roleCount=Object.keys(ROLE_LABEL).map(k=>({label:ROLE_LABEL[k],value:M.filter(m=>m.role===k).length}));
  const typeCount=MEDIA_TYPES.map(([k,l])=>({label:k,value:list('Media').filter(m=>m.type===k).length})).filter(x=>x.value);
  d.innerHTML=`<div class="tiles">${tile(M.length,'สมาชิกทั้งหมด')}${tile(M.filter(m=>m.age_group==='under13').length,'ผู้เรียนอายุต่ำกว่า 13 ปี')}${tile(list('Courses').filter(c=>c.status==='published').length+'/'+list('Courses').length,'รายวิชาที่เผยแพร่')}${tile(list('Media').length,'สื่อในคลัง')}${tile(list('Questions').length,'ข้อสอบในคลัง')}${tile(R.length,'บันทึกใน LRS')}</div>
    <div class="card"><h3>กิจกรรมการเรียนทั้งระบบ 14 วันล่าสุด</h3>${barChart(activityByDay(R),{title:'กิจกรรมต่อวัน',unit:' กิจกรรม'})}</div>
    <div class="two" style="grid-template-columns:1fr 1fr;margin-top:16px">
      <div class="card"><h3>สมาชิกตามประเภท</h3>${roleCount.map(x=>`<div class="hb"><span>${esc(x.label)}</span><div class="bar" data-tip="${x.value} คน"><i style="width:${M.length?x.value/M.length*100:0}%"></i></div><b>${x.value}</b></div>`).join('')}
        <p class="small muted" style="margin-top:10px">ยินยอม PDPA แล้ว ${M.filter(m=>m.pdpa_consent==='true').length}/${M.length} บัญชี</p></div>
      <div class="card"><h3>สื่อในคลังตามประเภท</h3>${typeCount.map(x=>`<div class="hb"><span>${esc(x.label)}</span><div class="bar" data-tip="${x.value} รายการ"><i style="width:${x.value/Math.max(...typeCount.map(t=>t.value))*100}%"></i></div><b>${x.value}</b></div>`).join('')}</div>
    </div>
    <div class="card" style="margin-top:16px"><h3>บันทึกล่าสุดใน LRS</h3>${recTable(R.slice(),true)}</div>`;
}
function myClassesOf(m){ const mine=new Set(list('Enrollments').filter(e=>e.member_id===m.member_id).map(e=>e.class_id)); return list('Classes').filter(c=>mine.has(c.class_id)); }

// ===== client/views/Members =====
/* View: จัดการสมาชิก (admin) */
// =========================================================
//  VIEW: จัดการสมาชิก (ผู้ดูแลระบบ)
// =========================================================
function vMembers(el){
  el.innerHTML=`<h1>สมาชิก</h1><div class="card scroll" style="padding:6px"><table class="tbl"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>ช่องทาง</th><th>อายุ / ผู้ปกครอง</th><th>PDPA</th><th>สิทธิ์</th><th>สมัครเมื่อ</th></tr></thead><tbody>
  ${list('Members').map(m=>`<tr><td class="small muted">${m.member_id}</td><td><b>${esc(m.name)}</b><div class="small muted">${esc(m.email)}</div></td><td>${PROVIDER_LABEL[m.provider]||esc(m.provider)}</td>
    <td class="small">${m.birthdate?`${ageFrom(m.birthdate)} ปี`:'-'}${m.guardian_name?`<br>ผู้ปกครอง: ${esc(m.guardian_name)}`:''}</td>
    <td>${m.pdpa_consent==='true'?`<span class="st done">✓ ยินยอม</span><div class="small muted">${fmtDate(m.consent_at)}</div>`:'<span class="st todo">ยังไม่ยินยอม</span>'}</td>
    <td><select data-role="${m.member_id}" ${m.member_id===ME.member_id?'disabled':''}>${Object.entries(ROLE_LABEL).map(([k,l])=>`<option value="${k}" ${m.role===k?'selected':''}>${l}</option>`).join('')}</select></td>
    <td class="small">${fmtDate(m.created_at)}</td></tr>`).join('')}</tbody></table></div>`;
  $$('[data-role]',el).forEach(s=>s.onchange=async()=>{ try{ await save('Members',{role:s.value},s.dataset.role); toast('เปลี่ยนสิทธิ์แล้ว'); }catch(e){ toast(e.message); } });
}

// ===== client/js/Seed =====
/* Seed: ข้อมูลตัวอย่าง */
// =========================================================
//  ข้อมูลตัวอย่าง (ใส่อัตโนมัติเมื่อฐานข้อมูลว่าง)
// =========================================================
function SEED(){
  const counter={HTML:`<!doctype html><html><body style="font-family:sans-serif;text-align:center;padding:16px">
<h2>นับผลไม้ 🍎</h2><div id="a" style="font-size:44px;min-height:60px"></div>
<button onclick="n=Math.min(10,n+1);d()" style="font-size:20px;padding:6px 16px">+1</button>
<button onclick="n=Math.max(0,n-1);d()" style="font-size:20px;padding:6px 16px">-1</button>
<p id="t" style="font-size:24px"></p>
<script>var n=3;var w=['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า','สิบ'];function d(){a.textContent='🍎'.repeat(n);t.textContent=n+' — '+w[n]}d()<\/script></body></html>`};
  let L=0; const rec=(dg,h,m,verb,ot,oid,cid,s='',mx='')=>({record_id:'LRS-'+String(++L).padStart(4,'0'),timestamp:daysAgo(dg,h),member_id:m,verb,object_type:ot,object_id:oid,course_id:cid,score:s,max_score:mx});
  return {
    Members:[
      {member_id:'MEM-0001',role:'admin',name:'ผู้ดูแลระบบ DLTV',email:'admin@dltv.example',provider:'email',birthdate:'1985-04-01',age_group:'13plus',pdpa_consent:'true',consent_at:daysAgo(40),created_at:daysAgo(40)},
      {member_id:'MEM-0002',role:'teacher',name:'ครูสมศรี ใจดี',email:'somsri.teacher@dltv.example',provider:'google',birthdate:'1990-09-12',age_group:'13plus',pdpa_consent:'true',consent_at:daysAgo(30),created_at:daysAgo(30)},
      {member_id:'MEM-0003',role:'student',name:'นายภูมิ รักเรียน',email:'phum@example.com',provider:'facebook',birthdate:'2012-05-14',age_group:'13plus',pdpa_consent:'true',consent_at:daysAgo(20),created_at:daysAgo(20)},
      {member_id:'MEM-0004',role:'student_u13',name:'ด.ญ.มะลิ ใจงาม',email:'mali@example.com',provider:'email',birthdate:'2019-01-20',age_group:'under13',guardian_name:'นางมาลี ใจงาม',guardian_email:'malee.parent@example.com',pdpa_consent:'true',consent_at:daysAgo(15),created_at:daysAgo(15)},
      {member_id:'MEM-0005',role:'student_u13',name:'ด.ช.ต้นกล้า สดใส',email:'tonkla@example.com',provider:'google',birthdate:'2016-08-02',age_group:'under13',guardian_name:'นายสมชาย สดใส',guardian_email:'somchai.parent@example.com',pdpa_consent:'true',consent_at:daysAgo(14),created_at:daysAgo(14)}
    ],
    Media:[
      {media_id:'MED-0001',title:'ลิงก์: เว็บไซต์ DLTV',type:'Link',url:'https://www.dltv.ac.th',subject:'',grade:'',tags:'ลิงก์ภายนอก',created_by:'MEM-0002',created_at:daysAgo(25)},
      {media_id:'MED-0002',title:'เสียงคำรามของสัตว์ (ตัวอย่างเสียง)',type:'MP3',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',subject:'วิทยาศาสตร์',grade:'ป.4',tags:'เสียง,สัตว์',created_by:'MEM-0002',created_at:daysAgo(25)},
      {media_id:'MED-0003',title:'กิจกรรมนับผลไม้ 1–10',type:'HTML',url:counter.HTML,subject:'คณิตศาสตร์',grade:'ป.1',tags:'กิจกรรม,การนับ',created_by:'MEM-0002',created_at:daysAgo(24)},
      {media_id:'MED-0004',title:'ภาพตัดขวางผลส้มโอ',type:'Picture',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg',subject:'วิทยาศาสตร์',grade:'ป.4',tags:'ภาพ,พืช',created_by:'MEM-0002',created_at:daysAgo(24)},
      {media_id:'MED-0005',title:'วิดีโอ: ดอกไม้บาน (Interactive)',type:'InteractiveVDO',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',subject:'วิทยาศาสตร์',grade:'ป.4',tags:'วิดีโอ,พืช',created_by:'MEM-0002',created_at:daysAgo(23)}
    ],
    InteractiveCues:[
      {cue_id:'CUE-0001',media_id:'MED-0005',time_sec:'1.5',question_id:'Q-0006',created_at:daysAgo(23)},
      {cue_id:'CUE-0002',media_id:'MED-0005',time_sec:'3.5',question_id:'Q-0005',created_at:daysAgo(23)}
    ],
    Questions:[
      {question_id:'Q-0001',type:'mcq',question:'3 + 2 เท่ากับเท่าไร',choices:JSON.stringify(['4','5','6','7']),answer:'1',subject:'คณิตศาสตร์',grade:'ป.1',difficulty:'easy',created_by:'MEM-0002'},
      {question_id:'Q-0002',type:'tf',question:'เลข 5 มากกว่าเลข 3',choices:'',answer:'true',subject:'คณิตศาสตร์',grade:'ป.1',difficulty:'easy',created_by:'MEM-0002'},
      {question_id:'Q-0003',type:'short',question:'4 + 4 = ? (ตอบเป็นตัวเลข)',choices:'',answer:'8',subject:'คณิตศาสตร์',grade:'ป.1',difficulty:'easy',created_by:'MEM-0002'},
      {question_id:'Q-0004',type:'mcq',question:'พืชใช้ส่วนใดในการสร้างอาหาร',choices:JSON.stringify(['ราก','ลำต้น','ใบ','ดอก']),answer:'2',subject:'วิทยาศาสตร์',grade:'ป.4',difficulty:'medium',created_by:'MEM-0002'},
      {question_id:'Q-0005',type:'tf',question:'ดอกเป็นส่วนที่ช่วยในการสืบพันธุ์ของพืช',choices:'',answer:'true',subject:'วิทยาศาสตร์',grade:'ป.4',difficulty:'easy',created_by:'MEM-0002'},
      {question_id:'Q-0006',type:'mcq',question:'สิ่งใดจำเป็นต่อการเจริญเติบโตของพืช',choices:JSON.stringify(['แสงแดด','พลาสติก','ทราย','ก้อนหิน']),answer:'0',subject:'วิทยาศาสตร์',grade:'ป.4',difficulty:'easy',created_by:'MEM-0002'}
    ],
    Courses:[
      {course_id:'CRS-0001',title:'จำนวนนับ 1 ถึง 10',subject:'คณิตศาสตร์',grade:'ป.1',description:'ฝึกนับจำนวน อ่าน เขียนตัวเลข และการบวกเบื้องต้น',status:'published',created_by:'MEM-0002',created_at:daysAgo(22)},
      {course_id:'CRS-0002',title:'พืชและสัตว์รอบตัวเรา',subject:'วิทยาศาสตร์',grade:'ป.4',description:'เรียนรู้ส่วนประกอบของพืช การเจริญเติบโต และเสียงของสัตว์',status:'published',created_by:'MEM-0002',created_at:daysAgo(22)},
      {course_id:'CRS-0003',title:'มาตราตัวสะกด',subject:'ภาษาไทย',grade:'ป.2',description:'รู้จักมาตราตัวสะกดทั้ง 8 มาตรา',status:'draft',created_by:'MEM-0002',created_at:daysAgo(5)}
    ],
    Units:[
      {unit_id:'UNT-0001',course_id:'CRS-0001',seq:'1',title:'นับจำนวน 1–5',media_ids:'MED-0003',question_ids:'Q-0001,Q-0002'},
      {unit_id:'UNT-0002',course_id:'CRS-0001',seq:'2',title:'การบวกเบื้องต้น',media_ids:'MED-0003,MED-0001',question_ids:'Q-0003'},
      {unit_id:'UNT-0003',course_id:'CRS-0002',seq:'1',title:'การเจริญเติบโตของพืช',media_ids:'MED-0005,MED-0004',question_ids:'Q-0004'},
      {unit_id:'UNT-0004',course_id:'CRS-0002',seq:'2',title:'เสียงของสัตว์',media_ids:'MED-0002',question_ids:'Q-0005'}
    ].map(u=>({...u,created_at:daysAgo(21)})),
    Classes:[
      {class_id:'CLS-0001',course_id:'CRS-0001',name:'ป.1/1 (ห้องตัวอย่าง)',teacher_id:'MEM-0002',term:'2/2569',created_at:daysAgo(18)},
      {class_id:'CLS-0002',course_id:'CRS-0002',name:'ป.4/2 (ห้องตัวอย่าง)',teacher_id:'MEM-0002',term:'2/2569',created_at:daysAgo(18)}
    ],
    Enrollments:[
      {enroll_id:'ENR-0001',class_id:'CLS-0001',member_id:'MEM-0004',created_at:daysAgo(15)},
      {enroll_id:'ENR-0002',class_id:'CLS-0002',member_id:'MEM-0005',created_at:daysAgo(14)},
      {enroll_id:'ENR-0003',class_id:'CLS-0002',member_id:'MEM-0003',created_at:daysAgo(14)}
    ],
    Groups:[
      {group_id:'GRP-0001',class_id:'CLS-0002',name:'ทีมต้นไม้',member_ids:'MEM-0003,MEM-0005',task:'สำรวจพืช 5 ชนิดรอบโรงเรียน ถ่ายภาพและบันทึกส่วนประกอบ',status:'doing',created_at:daysAgo(10)},
      {group_id:'GRP-0002',class_id:'CLS-0001',name:'ทีมนับเลข',member_ids:'MEM-0004',task:'ทำบัตรตัวเลข 1–10 พร้อมภาพประกอบ',status:'todo',created_at:daysAgo(6)}
    ],
    LearningRecords:[
      rec(12,9,'MEM-0003','viewed','unit','UNT-0003','CRS-0002'),
      rec(12,9,'MEM-0003','answered','quiz','UNT-0003','CRS-0002',0,1),
      rec(9,14,'MEM-0005','viewed','unit','UNT-0003','CRS-0002'),
      rec(9,14,'MEM-0005','answered','cue','CUE-0001','CRS-0002',1,1),
      rec(9,14,'MEM-0005','answered','quiz','UNT-0003','CRS-0002',1,1),
      rec(9,14,'MEM-0005','completed','unit','UNT-0003','CRS-0002'),
      rec(6,10,'MEM-0004','viewed','unit','UNT-0001','CRS-0001'),
      rec(6,10,'MEM-0004','answered','quiz','UNT-0001','CRS-0001',2,2),
      rec(6,10,'MEM-0004','completed','unit','UNT-0001','CRS-0001'),
      rec(4,19,'MEM-0003','viewed','unit','UNT-0003','CRS-0002'),
      rec(4,19,'MEM-0003','answered','quiz','UNT-0003','CRS-0002',1,1),
      rec(4,19,'MEM-0003','completed','unit','UNT-0003','CRS-0002'),
      rec(3,11,'MEM-0004','viewed','unit','UNT-0002','CRS-0001'),
      rec(3,11,'MEM-0004','answered','quiz','UNT-0002','CRS-0001',0,1),
      rec(2,15,'MEM-0005','viewed','unit','UNT-0004','CRS-0002'),
      rec(2,15,'MEM-0005','updated','group','GRP-0001',''),
      rec(1,20,'MEM-0003','viewed','unit','UNT-0004','CRS-0002'),
      rec(1,20,'MEM-0003','answered','quiz','UNT-0004','CRS-0002',1,1),
      rec(1,20,'MEM-0003','completed','unit','UNT-0004','CRS-0002'),
      rec(0,9,'MEM-0004','viewed','unit','UNT-0002','CRS-0001')
    ]
  };
}

// ===== client/js/Router =====
/* Router: เมนู, สิทธิ์, การเปลี่ยนหน้า */
// ---------- Router ----------
const ROUTES = {
  home:{label:'หน้าหลัก', fn:vHome},
  course:{fn:vCourse},
  login:{fn:vLogin},
  lms:{label:'ห้องเรียน LMS', auth:true, fn:vLMS},
  csm:{label:'กลุ่ม CSM', auth:true, fn:vCSM},
  dashboard:{label:'รายงาน LRS', auth:true, fn:vDashboard},
  studio:{label:'คลังสื่อ', roles:['teacher','admin'], fn:vStudio},
  lcms:{label:'เนื้อหา LCMS', roles:['teacher','admin'], fn:vLCMS},
  members:{label:'สมาชิก', roles:['admin'], fn:vMembers}
};
function allowed(name){ const r=ROUTES[name]; if(!r) return false; if(r.roles) return ME && r.roles.includes(ME.role); if(r.auth) return !!ME; return true; }
function go(name, params={}){ VIEW={name, params}; render(); window.scrollTo(0,0); }
function render(){
  const navOrder = ME ? (isStaff()? ['home','studio','lcms','lms','csm','dashboard','members'] : ['home','lms','csm','dashboard']) : ['home'];
  $('#nav').innerHTML = navOrder.filter(allowed).map(n=>`<button data-go="${n}" class="${VIEW.name===n?'on':''}">${ROUTES[n].label}</button>`).join('');
  $('#me').innerHTML = ME
    ? `<span class="role">${esc(ROLE_LABEL[ME.role]||ME.role)}</span><div class="avatar" title="${esc(ME.email)}">${esc(ME.name.replace(/^(ด\.ช\.|ด\.ญ\.|นาย|นางสาว|นาง|ครู)/,'').trim().charAt(0)||'?')}</div><button class="btn sm ghost" id="logout">ออกจากระบบ</button>`
    : `<button class="btn primary sm" data-go="login">เข้าสู่ระบบ / สมัครสมาชิก</button>`;
  const lo=$('#logout'); if(lo) lo.onclick=()=>{ ME=null; store.del('dltv_me'); toast('ออกจากระบบแล้ว'); go('home'); };
  const app=$('#app');
  if(!allowed(VIEW.name)){
    app.innerHTML = `<div class="card empty"><h3>ต้องเข้าสู่ระบบด้วยสิทธิ์ที่เหมาะสม</h3><p>หน้านี้สำหรับ${ROUTES[VIEW.name]?.roles?'ผู้สอน/ผู้ดูแลระบบ':'สมาชิก'}</p><button class="btn primary" data-go="login">เข้าสู่ระบบ</button></div>`;
    return;
  }
  ROUTES[VIEW.name].fn(app, VIEW.params||{});
}
document.addEventListener('click', e=>{
  const g=e.target.closest('[data-go]'); if(!g) return;
  e.preventDefault(); const {go:name, ...p}=g.dataset; go(name,p);
});
// tooltip สำหรับกราฟ
document.addEventListener('mousemove', e=>{
  const t=e.target.closest('[data-tip]'), tip=$('#tip');
  if(!t){ tip.style.opacity=0; return; }
  tip.textContent=t.dataset.tip; tip.style.opacity=1;
  tip.style.left=Math.min(e.clientX+12, innerWidth-tip.offsetWidth-8)+'px'; tip.style.top=(e.clientY-34)+'px';
});

// ===== client/js/Main =====
/* Main: เริ่มต้นแอป */
// ---------- Start ----------
// ใส่โลโก้จาก BRAND; ถ้าโหลดรูปไม่ได้จะแสดงตัวอักษรแทน
function brandImg(el,src,onOk){ if(!el||!src) return; el.onload=()=>{ el.classList.remove('hidden'); if(onOk) onOk(); }; el.onerror=()=>el.remove(); el.src=src; }
function applyBrand(){
  brandImg($('#brandLogo'), BRAND.logo, ()=>$('.logo').classList.add('has-img'));
  brandImg($('#foundationLogo'), BRAND.foundationLogo);
  $('#foundationName').textContent = BRAND.foundationName;
  document.title = BRAND.name;
}
const logoTag = (src,cls,alt) => src ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" onerror="this.remove()">` : '';

async function init(){
  applyBrand();
  try{
    DB = await call('bootstrap');
    if(!DB.Members || !DB.Members.length){ await call('seed',{data:SEED()}); DB = await call('bootstrap'); }
  }catch(e){
    $('#app').innerHTML=`<div class="card empty"><h3>เชื่อมต่อฐานข้อมูลไม่สำเร็จ</h3><p>${esc(e.message)}</p><p class="small">${MODE==='api'?'ตรวจ API_URL ใน config.js และการ Deploy Apps Script (Who has access: Anyone)':'ตรวจว่ารันฟังก์ชัน <b>setup</b> ใน Apps Script แล้ว'}</p></div>`; return;
  }
  ME = byId('Members', store.get('dltv_me')) || null;
  if(MODE==='mock'){ $('#demoBar').classList.remove('hidden'); $('#resetDemo').onclick=async()=>{ if(await askConfirm('ล้างข้อมูลทั้งหมดและโหลดข้อมูลตัวอย่างใหม่?')){ store.del(DBKEY); store.del('dltv_me'); location.reload(); } }; }
  render();
}
init();
