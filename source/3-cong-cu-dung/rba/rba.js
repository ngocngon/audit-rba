/* ======================================================================
   Audit RBA v1.8.0 — Chọn nhanh hạng mục (BH101→CM403), đa hạng mục, xóa nhanh,
   bố cục Excel chuẩn 220×165 (tối đa 3 ảnh/dòng, tối đa 8 ảnh +n, hàng đồng đều 150pt,
   in vừa 1 trang ngang khổ A4) & PDF mỗi trang 1 ảnh theo đúng thứ tự hạng mục.
   ====================================================================== */
(function(){
const RBA_VN={
  BH101:'Giấy phép, chứng chỉ & kiểm định an toàn',
  BH102:'Nơi làm việc an toàn, điện, PPE & nâng hạ',
  BH103:'Bảo vệ lao động nữ & thai sản',
  BH201:'Hệ thống báo cháy, chữa cháy & bình PCCC',
  BH202:'Kế hoạch & quy trình ứng phó khẩn cấp',
  BH203:'Lối thoát nạn, cửa thoát hiểm & đèn EXIT',
  BH204:'Diễn tập sơ tán & chữa cháy định kỳ',
  BH301:'Ghi chép, điều tra TNLĐ & bệnh nghề nghiệp',
  BH302:'Sơ cấp cứu, tủ thuốc & nhân viên y tế',
  BH401:'Hóa chất, nhãn GHS, khay chống tràn & thông gió',
  BH501:'Công thái học & công việc nặng nhọc',
  BH601:'Che chắn an toàn máy móc, liên động & E-Stop',
  BH701:'Ký túc xá & hạ tầng sinh hoạt người lao động',
  BH702:'Nhà ăn, bếp, an toàn thực phẩm & nhà vệ sinh',
  BM101:'Tuân thủ pháp luật & yêu cầu KH về ATVSLĐ',
  BM102:'Nhận diện mối nguy & đánh giá rủi ro ATVSLĐ',
  BM201:'Phân công trách nhiệm & người phụ trách ATVSLĐ',
  BM202:'Chính sách & quy trình kiểm soát ATVSLĐ',
  BM203:'Đào tạo & huấn luyện ATVSLĐ',
  BM301:'Truyền thông & niêm yết thông tin ATVSLĐ',
  BM302:'Tiếp nhận góp ý, phản ánh & khiếu nại ATVSLĐ',
  BM401:'Xem xét của lãnh đạo về ATVSLĐ',
  BM402:'Tự kiểm tra, đánh giá nội bộ ATVSLĐ',
  BM403:'Hành động khắc phục & phòng ngừa ATVSLĐ',
  CE101:'Giấy phép & báo cáo môi trường',
  CE201:'Quản lý & lưu giữ chất thải nguy hại',
  CE301:'Quản lý & phân loại chất thải rắn thông thường',
  CE401:'Hệ thống xử lý khí thải & bụi',
  CE402:'Tiếng ồn môi trường',
  CE501:'Quản lý nước thải & thoát nước mưa',
  CE601:'Tiêu thụ năng lượng & phát thải khí nhà kính',
  CM101:'Tuân thủ pháp luật & yêu cầu KH về môi trường',
  CM102:'Nhận diện khía cạnh & đánh giá rủi ro môi trường',
  CM201:'Phân công trách nhiệm & người phụ trách môi trường',
  CM202:'Chính sách & quy trình kiểm soát môi trường',
  CM203:'Đào tạo & huấn luyện bảo vệ môi trường',
  CM301:'Truyền thông & niêm yết thông tin môi trường',
  CM302:'Tiếp nhận phản ánh & khiếu nại môi trường',
  CM401:'Xem xét của lãnh đạo về môi trường',
  CM402:'Tự kiểm tra, đánh giá nội bộ môi trường',
  CM403:'Hành động khắc phục & phòng ngừa môi trường',
  EH000:'Lỗi EHS khác (ngoài 41 mã RBA)'
};
const RBA_GRP_LABEL=c=>/^BH/.test(c)?'1. An toàn & sức khỏe — Thực hành (BH101–BH702)':/^BM/.test(c)?'2. Hệ thống quản lý An toàn & sức khỏe (BM101–BM403)':/^CE/.test(c)?'3. Môi trường — Thực hành (CE101–CE601)':/^CM/.test(c)?'4. Hệ thống quản lý Môi trường (CM101–CM403)':'5. Ngoài 41 mã RBA';
const RBA_SEC_RANK=c=>/^BH/.test(c)?1:/^BM/.test(c)?2:/^CE/.test(c)?3:/^CM/.test(c)?4:9;

function rbaOrder(){
  return Object.keys(RBA.codes||{}).filter(c=>c!=='EH000').sort((a,b)=>RBA_SEC_RANK(a)-RBA_SEC_RANK(b)||a.localeCompare(b,'en',{numeric:true}));
}
function rbaHasCode(c){return c==='EH000'||!!(c&&RBA.codes&&RBA.codes[c])}
function rbaTitle(c){
  if(c==='EH000')return RBA_VN.EH000;
  if(RBA_VN[c])return RBA_VN[c];
  const v=RBA.codes&&RBA.codes[c],m=RBA.tpl&&RBA.tpl.map&&RBA.tpl.map[c];
  return (v&&v.t&&v.t!=='Đi tham quan vendor trực tiếp'?v.t:(m&&m[2])||(v&&v.t)||c);
}
function rbaShortLabel(c){return rbaHasCode(c)?`${c} · ${rbaTitle(c)}`:'— Chưa chọn hạng mục —'}
function rbaCanEdit(){try{if(typeof RO==='function'&&RO()){toast('Bạn chỉ được xem audit này, không chỉnh sửa được.');return false}}catch{}return true}

/* Tắt xuất ảnh ghép ảo (collage) mặc định để Excel hiện từng ảnh 220×165 và PDF mỗi trang 1 ảnh riêng */
try{if(window.__QX&&window.__QX.cfg){const raw=localStorage.getItem('soat-ehs-qx');if(!raw||!('"groupExport"' in JSON.parse(raw)))window.__QX.cfg.groupExport=false}}catch{}

/* Giữ nguyên mã EH000 hoặc mã do người dùng tự chọn tay khi gọi resolveRbaCode */
{const _res=resolveRbaCode;resolveRbaCode=window.resolveRbaCode=function(f,p){
  if(!f)return '';
  if(f.code==='EH000'){if(!f.req)f.req='EH000';if(!f.sev)f.sev='Major';if(!f.cause)f.cause='Administrative';return 'EH000'}
  if(f.codeManual&&f.code&&RBA.codes[f.code]){
    const v=RBA.codes[f.code];
    if(!f.req&&v.r&&v.r[0])f.req=v.r[0][0];
    if(!f.law&&v.l&&v.l[0])f.law=v.l[0][1];
    if(!f.sev)f.sev='Major';if(!f.cause)f.cause='Administrative';
    return f.code;
  }
  return _res(f,p);
}}

/* Lưu lựa chọn đa hạng mục trên p.analysis.rba để giữ nguyên sau khi tải lại trang và đồng bộ Cloud */
const RBA_PF={rbaSel:'sel',rbaSeen:'seen',rbaMain:'main'};
function rbaPhotoProps(p){
  if(!p||p._rbap)return p;
  try{
    Object.defineProperty(p,'_rbap',{value:true});
    const mem={};
    for(const[k,a]of Object.entries(RBA_PF)){
      Object.defineProperty(p,k,{configurable:true,enumerable:false,
        get(){const rb=p.analysis&&p.analysis.rba;return rb&&rb[a]!==undefined?rb[a]:mem[a]!==undefined?mem[a]:null},
        set(v){mem[a]=v;if(!p.analysis)p.analysis={scene:'',ok:[],verify:[]};p.analysis.rba=p.analysis.rba||{};p.analysis.rba[a]=v}});
    }
  }catch(e){console.warn(e)}
  return p;
}
{const _mp=makePhoto;makePhoto=function(o){return rbaPhotoProps(_mp(o))}}
try{for(const p of S.photos)rbaPhotoProps(p)}catch{}

function rbaCodeOf(f,p){
  if(!f)return '';
  try{resolveRbaCode(f,p)}catch{}
  return f.code==='EH000'?'EH000':(f.code&&RBA.codes[f.code]?f.code:'BH102');
}
function rbaRank(c){
  if(!c)return 980;
  if(c==='EH000')return 900;
  const ord=rbaOrder(),idx=ord.indexOf(c);
  return idx>=0?idx+1:890;
}
const rbaSevRank=f=>{const k=SEV.indexOf(f.sev);return k<0?9:k};

/* Hạng mục trọng tâm & danh sách hạng mục ứng viên của một ảnh */
function rbaMain(p){
  rbaPhotoProps(p);
  if(p.rbaSel&&p.rbaSel.length&&rbaHasCode(p.rbaSel[0])&&p.rbaSel[0]!=='EH000')return p.rbaSel[0];
  const fs=(p.findings||[]).filter(f=>done(f)),codes=new Map();
  for(const f of fs){
    const c=rbaCodeOf(f,p);if(!c||c==='EH000')continue;
    const e=codes.get(c)||{c,n:0,ok:0,best:9,first:1e9};
    e.n++;if(f.ok)e.ok++;e.best=Math.min(e.best,rbaSevRank(f));e.first=Math.min(e.first,p.findings.indexOf(f));
    codes.set(c,e);
  }
  if(!codes.size)return '';
  if(p.rbaMain&&codes.has(p.rbaMain))return p.rbaMain;
  const ai=p.analysis&&p.analysis.mainCode;if(ai&&codes.has(ai))return ai;
  return[...codes.values()].sort((a,b)=>a.best-b.best||b.n-a.n||rbaRank(a.c)-rbaRank(b.c)||a.first-b.first)[0].c;
}
function rbaCands(p){
  const m=rbaMain(p),set=new Map();
  const add=(c,f,ex)=>{if(!c||c==='EH000'||!RBA.codes[c])return;if(!set.has(c))set.set(c,{c,fs:[],ex:[]});(ex?set.get(c).ex:set.get(c).fs).push(f)};
  for(const f of p.findings||[]){
    if(!done(f))continue;
    const c=rbaCodeOf(f,p);add(c,f,false);
    if(c!=='EH000')for(const x of f.xCand||[])if(x!==c)add(x,f,true);
  }
  return[...set.values()].sort((a,b)=>a.c===m?-1:b.c===m?1:rbaRank(a.c)-rbaRank(b.c));
}
function rbaDecided(p){rbaPhotoProps(p);return!!(p&&p.rbaSel&&p.rbaSeen)&&rbaCands(p).every(x=>p.rbaSeen.includes(x.c))}
function rbaNeedAsk(p){return!!p&&!p.sample&&rbaCands(p).length>1&&!rbaDecided(p)}
function rbaCodesOf(p,f){
  const c=rbaCodeOf(f,p);if(!c||c==='EH000')return c==='EH000'?['EH000']:[];
  const out=[c];
  if(rbaDecided(p))for(const x of f.xItems||[])if(x!==c&&RBA.codes[x]&&!out.includes(x))out.push(x);
  return out;
}

/* Thứ tự sắp xếp toàn ứng dụng: BH101 → CM403 → Lỗi EHS khác (EH000) → Đã soát không lỗi → Ảnh chưa soát */
function rbaPhotoRank(p){
  if(!p||p.sample)return -1;
  const m=rbaMain(p);if(m)return rbaRank(m);
  const hasEh=(p.findings||[]).some(f=>done(f)&&rbaCodeOf(f,p)==='EH000');
  if(hasEh)return 900;
  return (p.analysis||(p.findings&&p.findings.length))?950:990;
}
function rbaSortPhotos(arr){
  const idx=new Map(S.photos.map((p,i)=>[p,i]));
  return (arr||[]).slice().sort((a,b)=>rbaPhotoRank(a)-rbaPhotoRank(b)||(idx.get(a)??0)-(idx.get(b)??0));
}
function rbaFindRank(p,f){return done(f)?rbaRank(rbaCodeOf(f,p)):985}
function rbaRowCmp(a,b){return rbaFindRank(a.p,a.f)-rbaFindRank(b.p,b.f)||rbaPhotoRank(a.p)-rbaPhotoRank(b.p)||a.pi-b.pi||a.n-b.n}

/* Thay đổi hạng mục / mã RBA của một lỗi */
function rbaSetCode(f,c){
  if(!rbaHasCode(c)||f.code===c)return false;
  if(c==='EH000'){
    f.code='EH000';f.req='EH000';f.law='';f.rule='';
  }else{
    const v=RBA.codes[c];
    f.code=c;
    f.req=v&&v.r&&v.r[0]?v.r[0][0]:c+'-01';
    f.law=v&&v.l&&v.l[0]?v.l[0][1]:'';
    if(f.rule&&RULES[f.rule]&&RULES[f.rule].c!==c)f.rule='';
  }
  f.codeManual=true;f.userEdited=true;
  return true;
}
function rbaRefreshAll(){
  try{renderAll()}catch{}
  try{if(typeof renderDesk==='function')renderDesk()}catch{}
  try{rbaRenderHubAlt()}catch{}
  try{if(typeof renderExportCheck==='function')renderExportCheck()}catch{}
}
function rbaConfirmSel(p,sel){
  if(!rbaCanEdit())return;
  rbaPhotoProps(p);
  const cands=rbaCands(p),all=cands.map(x=>x.c);
  sel=all.filter(c=>sel.includes(c));
  if(!sel.length)return toast('Hãy chọn ít nhất một mã hạng mục.');
  hist(p);
  for(const f of p.findings){
    if(!done(f))continue;
    const c=rbaCodeOf(f,p);if(c==='EH000')continue;
    if(!sel.includes(c)){const t=(f.xCand||[]).find(x=>sel.includes(x))||sel[0];rbaSetCode(f,t)}
    f.xItems=(f.xCand||[]).filter(x=>sel.includes(x)&&x!==f.code);
  }
  p.rbaSel=sel;p.rbaMain=sel[0];p.rbaSeen=[...new Set([...all,...rbaCands(p).map(x=>x.c)])];
  Store.touch(p);
  toast(sel.length>1?`Đã chốt ${sel.length} hạng mục cho ảnh: ${sel.join(', ')}.`:`Ảnh này tính cho hạng mục ${rbaShortLabel(sel[0])}.`);
  rbaRefreshAll();
}
function rbaResetSel(p){
  if(!rbaCanEdit())return;
  rbaPhotoProps(p);p.rbaSel=null;p.rbaSeen=null;
  for(const f of p.findings)f.xItems=[];
  Store.touch(p);rbaRefreshAll();
}
function rbaAskList(){return rbaSortPhotos(S.photos.filter(p=>!p.sample&&rbaNeedAsk(p)))}

/* Hộp thoại & khung chọn 1 hoặc nhiều mã hạng mục cho ảnh liên quan nhiều hạng mục */
function rbaChooser(p,onDone){
  const cs=rbaCands(p),m=rbaMain(p);if(cs.length<2)return null;
  const curSel=(p.rbaSel&&p.rbaSel.length)?p.rbaSel:[m];
  const rows=cs.map(x=>{
    const cb=h('input',{type:'checkbox'});cb.checked=curSel.includes(x.c);
    const ts=[...x.fs.map(f=>f.title),...x.ex.map(f=>'(liên quan) '+f.title)].filter((t,i,a)=>t&&a.indexOf(t)===i).slice(0,3);
    return{c:x.c,cb,el:h('label',{class:'pc-ch'},cb,h('span',null,h('b',null,rbaShortLabel(x.c)),x.c===m?h('i',null,'Hạng mục trọng tâm'):null,h('small',null,ts.join(' · '))))};
  });
  const fin=sel=>{rbaConfirmSel(p,sel);if(onDone)onDone()};
  return h('div',{class:'pc-alt pc-chs',onclick:e=>e.stopPropagation()},
    h('b',null,`⚠ Ảnh này liên quan ${cs.length} hạng mục RBA. Chọn một hoặc nhiều hạng mục áp dụng:`),
    ...rows.map(r=>r.el),
    h('div',{class:'pc-altb'},
      h('button',{type:'button',class:'btn sm primary',onclick:()=>fin(rows.filter(r=>r.cb.checked).map(r=>r.c))},'Xác nhận lựa chọn'),
      h('button',{type:'button',class:'btn sm',onclick:()=>fin([m])},`Chỉ tính ${m} (trọng tâm)`)),
    h('small',{class:'pc-chh'},'Chọn nhiều mã nếu ảnh vi phạm đồng thời nhiều hạng mục; bỏ chọn mã phụ để gộp lỗi về mã đã chọn.'));
}
function rbaAskDlg(p){
  const ov=h('div',{class:'pc-ov',onclick:e=>{if(e.target===ov)ov.remove()}}),done1=()=>ov.remove(),ch=rbaChooser(p,done1);
  if(!ch)return;
  ov.append(h('div',{class:'pc-ovb',role:'dialog','aria-label':'Chọn mã hạng mục cho ảnh'},
    h('div',{class:'pc-ovh'},h('img',{src:p.thumb,alt:''}),h('div',null,h('b',null,p.area||p.name||'Ảnh hiện trường'),h('small',{style:'display:block;color:var(--muted)'},`${p.findings.length} lỗi trên ảnh`))),
    ch,
    h('button',{type:'button',class:'btn sm',onclick:done1},'Để sau')));
  document.body.append(ov);
}

/* Ô <select> chọn hạng mục chuẩn BH101 → CM403 + EH000 */
function rbaCodeSelect(curCode,onPick){
  const groups=[];
  for(const c of rbaOrder()){
    const gn=RBA_GRP_LABEL(c);
    let g=groups[groups.length-1];if(!g||g.n!==gn){g={n:gn,l:[]};groups.push(g)}
    g.l.push(c);
  }
  return h('select',{class:'pc-hm','aria-label':'Hạng mục vi phạm',onchange:e=>{if(e.target.value)onPick(e.target.value)}},
    rbaHasCode(curCode)?null:h('option',{value:'',selected:true},'— Chọn hạng mục —'),
    ...groups.map(g=>h('optgroup',{label:g.n},...g.l.map(c=>h('option',{value:c,selected:c===curCode},rbaShortLabel(c))))),
    h('optgroup',{label:'5. Ngoài 41 mã RBA'},h('option',{value:'EH000',selected:curCode==='EH000'},rbaShortLabel('EH000'))));
}

/* Nút chọn nhanh hạng mục ngay trên dòng lỗi (bảng Xác nhận lỗi & điện thoại) */
function rbaQuick(p,f,mob){
  const c0=rbaCodeOf(f,p),cur=rbaHasCode(c0)?c0:'';
  const s=rbaCodeSelect(cur,nc=>{
    if(!rbaCanEdit()){s.value=cur;return}
    try{hist(p)}catch{}
    if(rbaSetCode(f,nc)){
      rbaPhotoProps(p);
      if(p.rbaSel&&p.rbaSeen&&nc!=='EH000'){if(!p.rbaSel.includes(nc))p.rbaSel.push(nc);if(!p.rbaSeen.includes(nc))p.rbaSeen.push(nc)}
      Store.touch(p);
      toast(`Đã chuyển lỗi sang ${rbaShortLabel(nc)}.`);
      rbaRefreshAll();
    }
  });
  s.classList.add('pc-q');
  s.title='Bấm để chọn lại mã / hạng mục RBA nếu AI phán định sai';
  for(const ev of['click','mousedown','pointerdown','touchstart','keydown'])s.addEventListener(ev,e=>e.stopPropagation());
  const ask=rbaNeedAsk(p),xs=done(f)&&rbaDecided(p)?(f.xItems||[]).filter(x=>x!==c0&&RBA.codes[x]):[];
  const stop=e=>e.stopPropagation();
  return h('span',{class:'pc-qw'+(mob?' mob':'')+(cur?'':' empty')},
    h('span',{class:'pc-ql',text:mob?'Hạng mục:':'▾'}),
    s,
    ...xs.map(x=>h('span',{class:'pc-qx',title:'Lỗi này được tính thêm cho hạng mục '+rbaShortLabel(x)},`+${x}`)),
    ask?h('button',{type:'button',class:'pc-qa',title:'Ảnh này liên quan nhiều hạng mục: bấm để chọn một hoặc nhiều mã hạng mục',onclick:e=>{stop(e);rbaAskDlg(p)},onpointerdown:stop},'⚠ Chọn mã'):null);
}

/* Nút 🗑 Xóa nhanh trên dòng lỗi (bấm 2 lần) */
function rbaDelBtn(p,f){
  return h('button',{type:'button',class:'btn sm danger pc-del',title:f.src==='ai'&&!f.ok?'Xóa: không phải lỗi (bấm 2 lần, AI tự học để không báo lại)':'Xóa lỗi này (bấm 2 lần)',onclick:e=>{e.stopPropagation();if(!rbaCanEdit())return;iDel(e.currentTarget,p,f,f.src==='ai'&&!f.ok?'reject':'')}},'🗑 Xóa');
}

/* Nút × xóa ảnh nếu ảnh sai (bấm 2 lần an toàn) */
function rbaArmDelPhoto(btn,p,origText){
  if(!rbaCanEdit())return;
  if(!btn.dataset.arm){
    btn.dataset.arm='1';btn.classList.add('is-armed');btn.textContent='Xóa?';
    setTimeout(()=>{if(btn.isConnected){delete btn.dataset.arm;btn.classList.remove('is-armed');btn.textContent=origText||'×'}},3500);
    return;
  }
  delete btn.dataset.arm;btn.classList.remove('is-armed');
  removePhoto(p.id);toast('Đã xóa ảnh.');
}
function rbaDelPhotoBtn(p){
  if(!p||p.sample)return null;
  return h('button',{type:'button',class:'tthumb-x','aria-label':'Xóa ảnh '+(p.area||p.name||''),'title':'Xóa ảnh này nếu ảnh sai (bấm 2 lần)',onclick:e=>{e.stopPropagation();rbaArmDelPhoto(e.currentTarget,p,'×')},onpointerdown:e=>e.stopPropagation()},'×');
}

/* Đồng bộ nút × trên khung xem ảnh chính (#btnStageDel) & cột ảnh trái (#thumbs .x) */
{
  const sd=$('btnStageDel');
  if(sd)sd.addEventListener('click',e=>{e.stopPropagation();const p=cur();if(p&&!p.sample)rbaArmDelPhoto(sd,p,'× Xóa ảnh')});
  const _rt=renderThumbs;renderThumbs=function(...a){
    const r=_rt.apply(this,a);
    try{
      document.querySelectorAll('#thumbs .thumb').forEach(el=>{
        const pid=el.dataset.pid,p=S.photos.find(x=>x.id===pid),xb=el.querySelector('button.x');
        if(xb&&p&&!p.sample){xb.title='Xóa ảnh này nếu ảnh sai (bấm 2 lần)';xb.onclick=ev=>{ev.stopPropagation();rbaArmDelPhoto(xb,p,'×')}}
      });
    }catch(e){console.warn(e)}
    return r;
  };
  const _ui=uiState;uiState=function(...a){
    const r=_ui.apply(this,a);
    try{
      const p=cur(),sdEl=$('btnStageDel');
      if(sdEl){sdEl.hidden=!p||!!p.sample;if(!sdEl.dataset.arm)sdEl.textContent='× Xóa ảnh'}
    }catch{}
    return r;
  };
}

/* Lọc danh sách lỗi mẫu theo mã hạng mục đang chọn trong khung Sửa & Sửa nhóm */
function rbaFilterRules(sel,c){
  if(!sel)return;let any=false;
  for(const og of sel.querySelectorAll('optgroup')){
    let n=0;
    for(const o of og.querySelectorAll('option')){const r=RULES[o.value],on=!c||c==='EH000'||!r||r.c===c;o.hidden=!on;o.disabled=!on;if(on)n++}
    og.hidden=!n;og.disabled=!n;if(n)any=true;
  }
  const first=sel.querySelector('option[value=""]');
  if(first&&!sel.value)first.textContent=any?'— Chọn lỗi mẫu thuộc hạng mục này (không bắt buộc) —':'— Hạng mục này chưa có lỗi mẫu riêng —';
}
{const _ie=iEditor;iEditor=function(p,f,n){
  const el=_ie(p,f,n);
  try{
    const c0=rbaCodeOf(f,p),box=el.querySelector('.ifs'),sRule=el.querySelector('select[aria-label="Loại lỗi theo danh mục"]');
    const sHm=rbaCodeSelect(c0,c=>{
      if(!rbaCanEdit()){sHm.value=c0;return}
      hist(p);
      if(rbaSetCode(f,c)){
        Store.touch(p);
        toast(`Đã chuyển lỗi sang ${rbaShortLabel(c)}.`);
        rbaRefreshAll();
      }
    });
    const lab=h('label',{class:'pc-hml'},
      h('span',null,'Hạng mục / Mã vi phạm RBA (bấm đổi nếu AI phán định sai)'),
      sHm,
      h('small',{class:'pc-hmh'},c0==='EH000'?'Lỗi EHS ngoài 41 mã RBA: ghi riêng ở cuối PDF, không đưa vào bảng 41 mã.':`Mã đang chọn: ${rbaShortLabel(c0)}${f.codeManual?' · Đã chọn tay':''}`));
    rbaFilterRules(sRule,c0);
    if(box){const ref=box.querySelector('.g2')||box.firstChild;box.insertBefore(lab,ref)}
    if(box&&rbaNeedAsk(p)){const ab=rbaChooser(p);if(ab)box.insertBefore(ab,lab)}
    else if(box&&rbaDecided(p)&&p.rbaSel&&p.rbaSel.length>1){
      box.insertBefore(h('p',{class:'pc-altok'},`Ảnh này đang tính cho ${p.rbaSel.length} hạng mục: ${p.rbaSel.join(', ')}.`,h('button',{type:'button',class:'btn sm',onclick:()=>rbaResetSel(p)},'Chọn lại')),lab);
    }
  }catch(e){console.warn(e)}
  return el;
}}
{const _cf=cardForm;cardForm=function(f){
  const el=_cf(f);
  try{
    const p=cur();if(!p)return el;
    const c0=rbaCodeOf(f,p),sRule=el.querySelector('.fcat select');
    const sHm=rbaCodeSelect(c0,c=>{
      if(!rbaCanEdit()){sHm.value=c0;return}
      hist(p);if(rbaSetCode(f,c)){Store.touch(p);toast(`Đã chuyển lỗi sang ${rbaShortLabel(c)}.`);rbaRefreshAll()}
    });
    const lab=h('label',{class:'pc-hml'},h('span',null,'Hạng mục / Mã vi phạm RBA'),sHm);
    rbaFilterRules(sRule,c0);
    el.prepend(lab);
    if(rbaNeedAsk(p)){const ab=rbaChooser(p);if(ab)el.prepend(ab)}
  }catch(e){console.warn(e)}
  return el;
}}
if(typeof gxEdit==='function'){const _gx=gxEdit;gxEdit=function(g){
  const r=_gx(g);
  try{
    const d=$('gxDlg'),body=d&&d.querySelector('.gxbody'),sR=d&&d.querySelector('select[aria-label="Loại lỗi theo danh mục"]'),R=g.rep.f,c0=rbaCodeOf(R,g.rep.p);
    const sHm=rbaCodeSelect(c0,c=>{
      if(!rbaCanEdit()){sHm.value=c0;return}
      const touched=new Set();
      for(const x of g.items){if(!touched.has(x.p)){hist(x.p);touched.add(x.p)}rbaSetCode(x.f,c)}
      for(const p of touched)Store.touch(p);
      rbaFilterRules(sR,c);if(sR)sR.value='';
      toast(`Đã chuyển ${g.items.length} lỗi của nhóm sang ${rbaShortLabel(c)}.`);
    });
    rbaFilterRules(sR,c0);
    const lab=h('label',{class:'gxf pc-hml'},h('span',null,'Hạng mục / Mã RBA (áp dụng cho cả nhóm)'),sHm);
    const anchor=sR&&sR.closest('label');if(body&&anchor)body.insertBefore(lab,anchor);
  }catch(e){console.warn(e)}
  return r;
}}

/* Danh mục lỗi chuẩn (#dlgCat): xếp đúng thứ tự BH101 → CM403 → EH000 */
catGroups=function(fn){
  const out=[];
  for(const c of [...rbaOrder(),'EH000']){
    const l=RBA.rules.filter(r=>r.c===c&&(!fn||fn(r))).sort((a,b)=>sevRank(a.v)-sevRank(b.v)||a.id.localeCompare(b.id,'vi',{numeric:true}));
    if(!l.length)continue;
    const lb=rbaShortLabel(c);
    if(typeof CAT_TIER==='object'&&CAT_TIER)CAT_TIER[lb]=RBA_GRP_LABEL(c);
    out.push([lb,l]);
  }
  return out;
};

/* Nhắc chọn mã đa hạng mục ở màn Báo cáo & kiểm tra điều kiện xuất */
function rbaRenderHubAlt(){
  const box=$('rbaAltBox');if(!box)return;
  const asks=rbaAskList();
  box.hidden=!asks.length;
  if(!asks.length){box.replaceChildren();return}
  box.replaceChildren(h('div',{class:'pc-altlist'},
    h('h4',null,`⚠ Ảnh liên quan nhiều hạng mục: ${asks.length} ảnh có nhiều mã RBA`),
    h('p',{class:'hint'},'Bấm chọn một hoặc nhiều mã hạng mục áp dụng cho từng ảnh (hoặc bấm "Chỉ tính mã trọng tâm" để gộp về 1 mã).'),
    ...asks.map(p=>h('div',{class:'pc-alti'},
      h('button',{type:'button',class:'pcth',title:'Mở ảnh',onclick:()=>{S.listAll=false;S.cur=p.id;if(isMobile())setView('review');else setDView('review');renderAll();fit()}},h('img',{src:p.thumb,alt:''})),
      h('div',null,h('b',null,p.area||p.name||'Ảnh hiện trường'),rbaChooser(p))))));
}
{const _rh=renderHub;renderHub=function(...a){const r=_rh.apply(this,a);try{rbaRenderHubAlt()}catch(e){console.warn(e)}return r}}
{const _er=exportReady;exportReady=function(...a){
  const r=_er.apply(this,a);
  try{
    const asks=rbaAskList();
    if(asks.length&&Array.isArray(r.checks)){
      r.checks.push({ok:false,warn:true,t:`Có ${asks.length} ảnh liên quan nhiều hạng mục RBA (nên kiểm tra nút ⚠ Chọn mã)`,btn:['Chọn mã ›',()=>rbaAskDlg(asks[0]),'primary']});
    }
  }catch(e){console.warn(e)}
  return r;
}}

/* Nhận also_codes / main_code từ AI nếu có */
{const _aw=applyWhole;applyWhole=function(p,data,quiet){
  const r=_aw(p,data,quiet);
  try{
    rbaPhotoProps(p);
    const m=String((data&&(data.main_code||data.main_item))||'').toUpperCase().match(/\b([BC][HM E]\d{3}|EH000)\b/);
    if(p.analysis&&m)p.analysis.mainCode=m[1];
    p.rbaMain='';p.rbaSel=null;p.rbaSeen=null;Store.touch(p);
    if(rbaNeedAsk(p)&&!quiet)setTimeout(()=>toast(`Ảnh có lỗi liên quan ${rbaCands(p).length} hạng mục RBA. Bấm "⚠ Chọn mã" để chốt hạng mục.`),1100);
  }catch(e){console.warn(e)}
  return r;
}}
{const _fa=fillAI;fillAI=function(f,a,k){
  const r=_fa(f,a,k);
  try{
    const raw=Array.isArray(a&&(a.also_codes||a.also_items))?(a.also_codes||a.also_items):[];
    const xs=raw.map(x=>{const m=String(x||'').toUpperCase().match(/\b([BC][HME]\d{3})\b/);return m?m[1]:''}).filter(c=>c&&RBA.codes[c]&&c!==f.code);
    f.xCand=[...new Set(xs)].slice(0,2);f.xItems=[];
  }catch(e){console.warn(e)}
  return r;
}}

/* Gom dữ liệu xuất theo đúng thứ tự BH101 → CM403, cuối cùng là EH000 */
{const _ga=gather;gather=function(){
  const sorted=rbaSortPhotos(S.photos),out=[];
  for(const p of sorted){
    if(p.sample)continue;
    const items=p.findings.map((f,i)=>({f,n:i+1})).filter(x=>fin(x.f));
    if(items.length)out.push({p,items});
  }
  return out;
}}

function rbaCollect(){
  const by=new Map(),ehs=[];
  const photos=rbaSortPhotos(S.photos.filter(p=>!p.sample));
  for(const p of photos){
    const byC=new Map();
    p.findings.forEach((f,idx)=>{
      if(!fin(f))return;
      const codes=rbaCodesOf(p,f);
      for(const c of (codes.length?codes:[rbaCodeOf(f,p)])){
        if(!byC.has(c))byC.set(c,[]);
        byC.get(c).push({f,n:idx+1});
      }
    });
    for(const[c,items]of byC){
      if(c==='EH000'){ehs.push({p,items:items.map((x,k)=>({f:x.f,n:k+1}))});continue}
      if(!by.has(c))by.set(c,[]);
      by.get(c).push({p,items});
    }
  }
  const rows=[];
  for(const c of rbaOrder()){
    const gs=by.get(c)||[];
    const pics=[],ent=[],fixes=[],areas=[];
    let n=0;
    for(const g of gs){
      const a=String(g.p.area||'').trim();if(a&&!areas.includes(a))areas.push(a);
      const localItems=g.items.map((x,k)=>({f:x.f,n:k+1}));
      pics.push({p:g.p,items:localItems});
      for(const x of g.items){
        n++;
        ent.push({n,a,f:x.f,t:String(x.f.title||'').trim(),fix:CFG.fixes?planVi(x.f):''});
        if(CFG.fixes){const fx=planVi(x.f);if(fx)fixes.push({n,a,t:fx})}
      }
    }
    rows.push({c,gs,pics,ent,fixes,areas,has:ent.length>0});
  }
  return{rows,violRows:rows.filter(r=>r.has),ehs};
}

/* ======================================================================
   3 & 4. FILE EXCEL: Ảnh 220×165 phủ kín 4:3, không viền đen, tối đa 3 ảnh/dòng,
   căn giữa, tối đa 8 ảnh (+n), hàng đồng đều 150pt (chỉ cao hơn khi chữ quá dài
   hoặc nhiều dòng ảnh), in vừa 1 trang ngang khổ A4, giữ cố định mẫu & công thức.
   ====================================================================== */
const RBA_ROWPT=150;
const RBA_PCI={w:220,h:165,gap:6,pad:10,scale:4,perLine:3,max:8,emu:9525};

async function rbaTile(pic,more){
  const W=RBA_PCI.w*RBA_PCI.scale,H=RBA_PCI.h*RBA_PCI.scale,c=mk(W,H),g=c.getContext('2d');
  await fonts();
  g.fillStyle='#FFFFFF';g.fillRect(0,0,W,H);
  const im=await ensureImg(pic.p);
  if(im){
    const cleanItems=(pic.items||[]).filter(x=>x&&x.f&&x.f.s&&!x.f.whole);
    drawUniform43(g,im,pic.p,cleanItems,0,0,W,H,{cover:true,lw:Math.max(3,W/180),r:clamp(W/18,16,38),minFrac:.62});
  }
  if(more>0){
    g.fillStyle='rgba(15,23,42,.62)';g.fillRect(0,0,W,H);
    g.fillStyle='#FFFFFF';g.font=`700 ${Math.round(H/3.2)}px ${fontD}`;
    g.textAlign='center';g.textBaseline='middle';g.fillText(`+${more}`,W/2,H/2);
  }
  return toBlob(c,'image/jpeg',.89);
}
function rbaTileLayout(n){
  if(!n)return{m:0,lines:0,bh:0,needPt:0};
  const m=Math.min(n,RBA_PCI.max),lines=Math.ceil(m/RBA_PCI.perLine),bh=lines*RBA_PCI.h+(lines-1)*RBA_PCI.gap;
  return{m,lines,bh,needPt:(bh+2*RBA_PCI.pad)*.75};
}
function rbaEstPt(text,fontPt,colPx){
  if(!text)return 24;
  const px=fontPt*4/3,usable=Math.max(80,colPx-14);
  let lines=0;
  for(const l of String(text).split('\n')){
    let w=0;
    for(const ch of l)w+=/[ᄀ-ᇿ⺀-鿿가-힣＀-￯]/.test(ch)?px*1.02:/[A-ZĐ0-9]/.test(ch)?px*.64:ch===' '?px*.28:px*.55;
    lines+=Math.max(1,Math.ceil(w*1.12/usable));
  }
  return lines*fontPt*1.32+14;
}
/* Bổ sung 2 cỡ chữ nhỏ (9.5pt, 8pt) vào styles.xml của Findings.xlsm để tự thu nhỏ chữ trước khi tăng chiều cao hàng */
function rbaInjectShrinkStyles(stylesXml){
  const fm=stylesXml.match(/<fonts count="(\d+)"/);
  const xm=stylesXml.match(/<cellXfs count="(\d+)"/);
  if(!fm||!xm)return{xml:stylesXml,g:[32,32,32],m:[2,2,2]};
  const nf=+fm[1],nx=+xm[1];
  const fAdd='<font><sz val="9.5"/><color theme="1"/><name val="Calibri"/><family val="3"/><charset val="129"/></font>'
            +'<font><sz val="8"/><color theme="1"/><name val="Calibri"/><family val="3"/><charset val="129"/></font>';
  const xfG=fid=>`<xf numFmtId="0" fontId="${fid}" fillId="0" borderId="10" xfId="0" quotePrefix="1" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>`;
  const xfM=fid=>`<xf numFmtId="0" fontId="${fid}" fillId="0" borderId="10" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>`;
  const xml=stylesXml
    .replace(`<fonts count="${nf}"`,`<fonts count="${nf+2}"`)
    .replace('</fonts>',fAdd+'</fonts>')
    .replace(`<cellXfs count="${nx}"`,`<cellXfs count="${nx+4}"`)
    .replace('</cellXfs>',xfG(nf)+xfG(nf+1)+xfM(nf)+xfM(nf+1)+'</cellXfs>');
  return{xml,g:[32,nx,nx+1],m:[2,nx+2,nx+3]};
}
function rbaPickStyle(text,colPx,maxPt,styleIds){
  const pts=[11,9.5,8];
  let last={s:styleIds[0],pt:24};
  for(let i=0;i<pts.length;i++){
    const hpt=rbaEstPt(text,pts[i],colPx);
    last={s:styleIds[i],pt:hpt};
    if(hpt<=maxPt)return last;
  }
  return last;
}
function rbaPageSetupLandscapeA4(sh,nsPrefix){
  const p=nsPrefix||'';
  sh=sh.replace(/customHeight="[^"]*"/g,'customHeight="1"');
  if(new RegExp(`<${p}sheetPr\\s*/>`).test(sh)){
    sh=sh.replace(new RegExp(`<${p}sheetPr\\s*/>`),`<${p}sheetPr><${p}pageSetUpPr fitToPage="1"/></${p}sheetPr>`);
  }else if(new RegExp(`<${p}sheetPr[^>]*>`).test(sh)&&!sh.includes('fitToPage="1"')){
    sh=sh.replace(new RegExp(`(<${p}sheetPr[^>]*>)`),`$1<${p}pageSetUpPr fitToPage="1"/>`);
  }else if(!new RegExp(`<${p}sheetPr`).test(sh)){
    sh=sh.replace(new RegExp(`(<${p}worksheet[^>]*>)`),`$1<${p}sheetPr><${p}pageSetUpPr fitToPage="1"/></${p}sheetPr>`);
  }
  const psRx=new RegExp(`<${p}pageSetup\\b([^>]*?)/>`);
  if(psRx.test(sh)){
    sh=sh.replace(psRx,(_,a)=>{
      const clean=a.replace(/\s*(?:paperSize|scale|fitToWidth|fitToHeight|orientation)="[^"]*"/g,'');
      return `<${p}pageSetup${clean} paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>`;
    });
  }
  return sh;
}

/* Ghi đè exportFindings: xuất Findings.xlsm theo hạng mục BH101→CM403, ảnh 220×165 tối đa 3 ảnh/dòng, hàng 150pt, in A4 ngang */
exportFindings=async function(){
  if(exporting)return;
  if(!gateExport())return;
  if(!window.JSZip)return toast('Thư viện tạo file chưa tải xong. Hãy thử lại sau vài giây.');
  const col=rbaCollect();
  if(!col.violRows.length)return toast(col.ehs.length?'Các lỗi hiện tại thuộc nhóm "Lỗi EHS khác" (chỉ xuất trong PDF). Chọn mã BH101–CM403 nếu muốn đưa vào Findings.':'Chưa có lỗi nào được xác nhận.');
  const B=$('btnFind'),B2=$('btnFind2'),old1=B?B.textContent:'',old2=B2?B2.textContent:'';
  exporting=true;if(B){B.disabled=true;B.textContent='Đang tạo…'}if(B2){B2.disabled=true;B2.textContent='Đang tạo…'}
  try{
    const L=typeof lxL==='function'?lxL():'en',tr=t=>L?(typeof lxT==='function'?lxT(L,t):(TR.get(String(t||'').trim())||'')):'';
    const allTexts=col.violRows.flatMap(r=>[...r.areas,...r.ent.flatMap(e=>[e.t,e.fix])]).filter(Boolean);
    let miss=0;
    if(L){
      busy(cur(),`Đang dịch nội dung sang ${(typeof CAPN!=='undefined'&&CAPN[L])||'tiếng Anh'}…`);
      try{miss=typeof lxEnsure==='function'?await lxEnsure(L,allTexts,t=>busy(cur(),t)):0}catch(e){console.warn(e)}finally{busy(null)}
    }
    const z=await JSZip.loadAsync(RBA.tpl.b64,{base64:true}),put=(k,v)=>z.file(k,v,{createFolders:false});
    const styInfo=rbaInjectShrinkStyles(await z.file('xl/styles.xml').async('string'));
    put('xl/styles.xml',styInfo.xml);

    const colGW=68,colMW=44,colJW=34;
    const gPx=Math.floor(colGW*7+5),mPx=Math.floor(colMW*7+5),jOnePx=Math.floor(colJW*7+5),jTotPx=jOnePx*3;
    let rowsXml='',picsXml='',relsXml='',merges=[],imgNo=0;
    const mediaTasks=[];

    col.violRows.forEach((it,idx)=>{
      const no=idx+1,r=6+no,[Bval,Cval,Eval]=tplMetaFor(it.c),Dval=it.c;
      const k=it.ent.length,num=i=>k>1?`${i+1}. `:'';
      const areaVi=it.areas.length?it.areas.join('; '):'Hiện trường';
      const areaTr=L?(it.areas.length?it.areas.map(a=>tr(a)||a).join('; '):(typeof LX_SITE!=='undefined'&&LX_SITE[L])||'Site'):'';
      const Fval=areaTr&&areaTr!==areaVi?`${areaTr}\n${areaVi}`:areaVi;

      const gVi=it.ent.map((e,i)=>`${num(i)}${it.areas.length>1&&e.a?`[${e.a}] `:''}${e.t}`).join('\n');
      const gTr=L?it.ent.map((e,i)=>{const x=tr(e.t);return x?`${num(i)}${it.areas.length>1&&e.a?`[${tr(e.a)||e.a}] `:''}${x}`:''}).filter(Boolean).join('\n'):'';
      const Gval=gTr?`${gTr}\n\n${gVi}`:gVi;

      const mVi=CFG.fixes?it.ent.map((e,i)=>e.fix?`${num(i)}${e.fix}`:'').filter(Boolean).join('\n'):'';
      const mTr=(CFG.fixes&&L)?it.ent.map((e,i)=>{const x=e.fix?tr(e.fix):'';return x?`${num(i)}${x}`:''}).filter(Boolean).join('\n'):'';
      const Mval=mTr?`${mTr}\n\n${mVi}`:mVi;

      const fs=it.ent.map(e=>e.f);
      const cause=fs.some(f=>(f.cause||'Administrative')==='Facility')?'Facility':'Administrative';
      const mand=fs.some(f=>f.mand);
      const cs=Cval.includes('\n')?31:Cval==='Environment'?4:9;

      const TL=rbaTileLayout(it.pics.length);
      let pt=Math.max(RBA_ROWPT,TL.needPt);
      const gSty=rbaPickStyle(Gval,gPx,pt,styInfo.g);
      const mSty=rbaPickStyle(Mval,mPx,pt,styInfo.m);
      pt=Math.min(409,Math.max(pt,gSty.pt,mSty.pt));

      rowsXml+=`<row r="${r}" spans="1:19" ht="${pt.toFixed(1)}" customHeight="1">`
        +`<c r="A${r}" s="4"><v>${no}</v></c>`
        +`${xText('B'+r,31,Bval)}${xText('C'+r,cs,Cval)}${xText('D'+r,31,Dval)}${xText('E'+r,7,Eval)}`
        +`${xText('F'+r,31,Fval)}${xText('G'+r,gSty.s,Gval)}${xText('H'+r,78,cause)}${xText('I'+r,48,mand?'mandatory':'')}`
        +`<c r="J${r}" s="4"/><c r="K${r}" s="4"/><c r="L${r}" s="4"/>`
        +`${xText('M'+r,mSty.s,Mval)}<c r="N${r}" s="4"/><c r="O${r}" s="1"/><c r="P${r}" s="1"/><c r="Q${r}" s="1"/><c r="R${r}" s="1"/><c r="S${r}" s="1"/></row>`;
      merges.push(`<mergeCell ref="J${r}:L${r}"/>`);

      if(TL.m){
        const rowPx=pt/.75,y0=Math.max(2,Math.round((rowPx-TL.bh)/2));
        for(let q=0;q<TL.m;q++){
          const line=Math.floor(q/RBA_PCI.perLine),inLine=Math.min(RBA_PCI.perLine,TL.m-line*RBA_PCI.perLine),cIdx=q%RBA_PCI.perLine;
          const lw=inLine*RBA_PCI.w+(inLine-1)*RBA_PCI.gap;
          const gx=Math.max(2,Math.round((jTotPx-lw)/2)+cIdx*(RBA_PCI.w+RBA_PCI.gap));
          const gy=y0+line*(RBA_PCI.h+RBA_PCI.gap);
          const ancCol=9+Math.min(2,Math.floor(gx/jOnePx)),colOff=(gx-ancCol*jOnePx+9*jOnePx)*RBA_PCI.emu;
          imgNo++;
          const more=(q===TL.m-1&&it.pics.length>TL.m)?(it.pics.length-TL.m+1):0;
          mediaTasks.push({no:imgNo,pic:it.pics[q],more});
          relsXml+=`<Relationship Id="rId${imgNo}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${imgNo}.jpeg"/>`;
          picsXml+=`<xdr:oneCellAnchor><xdr:from><xdr:col>${ancCol}</xdr:col><xdr:colOff>${colOff}</xdr:colOff><xdr:row>${r-1}</xdr:row><xdr:rowOff>${gy*RBA_PCI.emu}</xdr:rowOff></xdr:from><xdr:ext cx="${RBA_PCI.w*RBA_PCI.emu}" cy="${RBA_PCI.h*RBA_PCI.emu}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${imgNo+1}" name="${it.c} photo ${q+1}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${imgNo}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${RBA_PCI.w*RBA_PCI.emu}" cy="${RBA_PCI.h*RBA_PCI.emu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
        }
      }
    });

    for(const t of mediaTasks)put(`xl/media/image${t.no}.jpeg`,await rbaTile(t.pic,t.more));

    const last=Math.max(19,6+col.violRows.length),sumLast=Math.max(500,last),date=$('mDate').value||today();
    let sh=await z.file('xl/worksheets/sheet2.xml').async('string');
    sh=sh.replace(/<col min="7" max="7" width="[\d.]+"/,`<col min="7" max="7" width="${colGW}"`)
      .replace(/<col min="10" max="11" width="[\d.]+"[^>]*\/><col min="12" max="12" width="[\d.]+"[^>]*\/>/,`<col min="10" max="12" width="${colJW}" style="6" customWidth="1"/>`)
      .replace(/<col min="10" max="10" width="[\d.]+"/,`<col min="10" max="10" width="${colJW}"`)
      .replace(/<col min="13" max="13" width="[\d.]+"/,`<col min="13" max="13" width="${colMW}"`)
      .replace('__C1__',esc($('mSub').value.trim())).replace('__C2__',esc($('mUnit').value.trim())).replace('__C3__',esc(vnDate(date))).replace('__C4__',esc($('mWho').value.trim()))
      .replace('</sheetData>',rowsXml+'</sheetData>')
      .replace('__DV__',String(Math.max(47,last)))
      .split('__LAST__').join(String(last));
    if(merges.length){
      sh=sh.replace(/<mergeCells count="(\d+)">([\s\S]*?)<\/mergeCells>/,(_,cnt,inner)=>`<mergeCells count="${(+cnt)+merges.length}">${inner}${merges.join('')}</mergeCells>`);
    }
    sh=rbaPageSetupLandscapeA4(sh,'');
    put('xl/worksheets/sheet2.xml',sh);

    if(z.file('xl/worksheets/sheet1.xml')){
      let s1=await z.file('xl/worksheets/sheet1.xml').async('string');
      s1=s1.replace(/Findings!\$D\$7:\$?D\$?\d+/g,`Findings!$D$7:$D$${sumLast}`);
      s1=rbaPageSetupLandscapeA4(s1,'');
      put('xl/worksheets/sheet1.xml',s1);
    }
    put('xl/workbook.xml',(await z.file('xl/workbook.xml').async('string')).replace('__LAST__',String(last)));
    put('xl/drawings/drawing1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${picsXml}</xdr:wsDr>`);
    put('xl/drawings/_rels/drawing1.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsXml}</Relationships>`);

    const xl=await z.generateAsync({type:'uint8array',compression:'DEFLATE'});
    const name=`Findings_${safeName($('mUnit').value||'audit')}_${date}`;
    if(window.claude){
      const outer=new JSZip();outer.file(`${name}.xlsm`,xl,{createFolders:false});
      await saveFile(`${name}.zip`,await outer.generateAsync({type:'blob'}));
    }else{
      await saveFile(`${name}.xlsm`,new Blob([xl],{type:'application/vnd.ms-excel.sheet.macroEnabled.12'}));
    }
    inheritAfterExport(col.violRows.flatMap(r=>r.gs)).catch(e=>console.error(e));
    const notes=[`${col.violRows.length} hạng mục vi phạm`];
    if(miss>0)notes.push(`${miss} câu chưa dịch được nên tạm ghi tiếng Việt`);
    if(col.ehs.length)notes.push(`${col.ehs.reduce((s,g)=>s+g.items.length,0)} lỗi EHS khác ghi riêng trong PDF`);
    toast('Đã xuất file Findings: '+notes.join('; ')+'.');
  }catch(e){console.error(e);toast('Không tạo được file Findings. Hãy thử lại.')}
  finally{exporting=false;if(B)B.textContent=old1||'Xuất file Findings';if(B2)B2.textContent=old2||'Xuất file Findings (.xlsm)';uiState();try{renderExportCheck()}catch{}}
};

/* Ghi đè exportReview: Checklist Đánh giá 41 mã (GUIDER_B64) giữ cố định hạng mục, điểm, công thức;
   hàng đồng đều 150pt, ảnh 220×165 phủ kín 4:3, tối đa 3 ảnh/dòng căn giữa trong cột N, in vừa 1 trang A4 ngang */
{
  exportReview=async function(){
    if(!gateExport())return;
    if(reviewing)return;if(!window.JSZip)return toast('Thư viện tạo file chưa tải xong. Hãy thử lại sau vài giây.');
    const col=rbaCollect();if(!col.violRows.length&&!S.photos.some(p=>!p.sample))return toast('Chưa có dữ liệu để đối chiếu.');
    reviewing=true;const B=$('btnRev');if(B)B.disabled=true;
    try{
      const L=typeof lxL==='function'?lxL():'';
      if(L&&col.violRows.length){
        busy(cur(),`Đang dịch nội dung sang ${CAPN[L]}…`);
        try{await lxEnsure(L,col.violRows.flatMap(r=>r.ent.flatMap(e=>[e.t,e.fix])),t=>busy(cur(),t))}catch(e){console.warn(e)}finally{busy(null)}
      }
      const bi=t=>{const v=String(t||'').trim(),x=L?lxT(L,v):'';return x?`${v.replace(/[.。]$/,'')} / ${x}`:v};
      const X=await xlsxOpen(GUIDER.file||b64bytes(GUIDER_B64)),date=$('mDate').value||today(),ser=excelDate(date),who=$('mWho').value.trim(),unit=$('mUnit').value.trim();
      const byCode=new Map(col.rows.map(r=>[r.c,r])),byReq=new Map();
      col.violRows.forEach((r,ri)=>r.ent.forEach((e,ei)=>{
        const rq=e.f.req;if(!rq)return;
        if(!byReq.has(rq))byReq.set(rq,[]);
        byReq.get(rq).push({f:e.f,ref:`${ri+1}.${ei+1}`});
      }));
      const worst=fs=>fs.map(f=>f.sev).filter(Boolean).sort((a,b)=>SEV.indexOf(a)-SEV.indexOf(b))[0]||'Minor';
      const due=fs=>fs.map(dueOf).filter(Boolean).sort()[0]||'';
      const codeRow=new Map();let nCap=0,nReq=0;

      await editSheet(X,'Đánh giá 41 mã',ed=>{
        const H=ed.header('Mã RBA');if(!H)throw new Error('Không nhận ra tiêu đề sheet "Đánh giá 41 mã".');
        const C=k=>H.col(k),put=(k,n,v,num)=>{const c=C(k);if(c)num?ed.num(c+n,v):ed.text(c+n,v)};
        for(const n of ed.nums)if(n>H.row){const code=ed.get(C('mã rba')+n).trim();if(code)codeRow.set(code,n)}
        for(const[code,n]of codeRow){
          const r=byCode.get(code);
          put('ngày đánh giá',n,ser,true);if(who)put('người đánh giá',n,who);
          if(!r||!r.has){
            if(ed.get(C('kết quả đánh giá')+n).trim()==='Chưa đánh giá')put('kết quả đánh giá',n,'Conformance');
            continue;
          }
          const fs=r.ent.map(e=>e.f),d=due(fs),nv=fs.filter(f=>kindOf(f)==='violation').length;
          const findTxt=r.ent.map((e,k)=>`${r.ent.length>1?`${k+1}. `:''}${e.a?`[${e.a}] `:''}${bi(e.t)} (${e.f.sev||'Major'})`).join('\n');
          put('kết quả đánh giá',n,worst(fs));
          put('hạn hoàn thành',n,d?excelDate(d):'',true);
          put('phát hiện',n,findTxt);
          put('bằng chứng',n,'');
          put('ghi chú',n,`Soát ảnh: ${fs.length} lỗi (${nv} vi phạm, ${fs.length-nv} mối nguy), ${r.pics.length} ảnh.`);
        }
      });
      await editSheet(X,'CAP',ed=>{
        const H=ed.header('Mã RBA');if(!H)return;
        const C=k=>H.col(k),put=(k,n,v,num)=>{const c=C(k);if(c)num?ed.num(c+n,v):ed.text(c+n,v)},inv=new Map([...codeRow].map(([c,n])=>[n,c]));
        for(const n of ed.nums){
          if(n<=H.row)continue;
          const m=ed.formula(C('mã rba')+n).match(/!\$?[A-Z]+\$?(\d+)/),code=m?inv.get(+m[1]):ed.get(C('mã rba')+n).trim(),r=code&&byCode.get(code);
          if(!r||!r.has)continue;
          const fs=r.ent.map(e=>e.f),d=due(fs);
          const causes=['Facility','Administrative'].map(cs=>{const ks=r.ent.filter(e=>(e.f.cause||'Administrative')===cs).map((_,i)=>i+1);return ks.length?`${cs}: mục ${ks.join(', ')}`:''}).filter(Boolean).join('\n');
          const acts=r.ent.map((e,i)=>`${r.ent.length>1?`${i+1}. `:''}${bi(planVi(e.f))}`).join('\n');
          put('nguyên nhân gốc',n,causes);put('hành động khắc phục',n,acts);put('ngày mở',n,ser,true);put('hạn hoàn thành',n,d?excelDate(d):'',true);
          const st=C('trạng thái');if(st&&!ed.get(st+n).trim())ed.text(st+n,'Chưa bắt đầu');nCap++;
        }
      });
      await editSheet(X,'Guider chi tiết',ed=>{
        const H=ed.header('ID yêu cầu');if(!H)return;
        const C=k=>H.col(k),put=(k,n,v,num)=>{const c=C(k);if(c)num?ed.num(c+n,v):ed.text(c+n,v)};
        for(const n of ed.nums){
          if(n<=H.row)continue;
          const l=byReq.get(ed.get(C('id yêu cầu')+n).trim());if(!l)continue;
          put('đánh giá chi tiết',n,worst(l.map(x=>x.f)));
          put('ghi chú',n,l.map(x=>`${x.ref} ${bi(x.f.title)}`).join('\n'));
          put('ngày cập nhật',n,ser,true);nReq++;
        }
      });

      /* Chuẩn hóa bố cục sheet2.xml ("Đánh giá 41 mã"): 41 hàng đồng đều 150pt, cột N rộng 104 chứa 3 ảnh 220×165/dòng, in A4 ngang */
      let sh2=await X.z.file('xl/worksheets/sheet2.xml').async('string');
      const ns=sh2.includes('<x:worksheet')?'x:':'';
      const colMW2=56,colNW2=104,mPx2=Math.floor(colMW2*7+5),nPx2=Math.floor(colNW2*7+5);
      sh2=sh2.replace(new RegExp(`<${ns}col min="13" max="13" width="[\\d.]+"`),`<${ns}col min="13" max="13" width="${colMW2}"`)
             .replace(new RegExp(`<${ns}col min="14" max="14" width="[\\d.]+"`),`<${ns}col min="14" max="14" width="${colNW2}"`);
      sh2=rbaPageSetupLandscapeA4(sh2,ns);

      const rowByNum=new Map([...codeRow].map(([c,rn])=>[rn,byCode.get(c)]));
      let pics2='',rels2='',imgNo2=0;const media2=[];
      const rowRx=new RegExp(`<${ns}row r="(\\d+)"([^>]*)>([\\s\\S]*?)</${ns}row>`,'g');
      sh2=sh2.replace(rowRx,(m,rnS,attrs,body)=>{
        const rn=+rnS,it=rowByNum.get(rn);
        if(!it)return m;
        const TL=rbaTileLayout(it.pics.length);
        const findTxt=it.has?it.ent.map((e,k)=>`${it.ent.length>1?`${k+1}. `:''}${e.a?`[${e.a}] `:''}${bi(e.t)}`).join('\n'):'';
        let pt=Math.max(RBA_ROWPT,TL.needPt,it.has?rbaEstPt(findTxt,10,mPx2):0);
        pt=Math.min(409,pt);
        attrs=/ht="/.test(attrs)?attrs.replace(/ht="[\d.]+"/,`ht="${pt.toFixed(1)}"`):attrs+` ht="${pt.toFixed(1)}"`;
        if(!/customHeight=/.test(attrs))attrs+=' customHeight="1"';
        if(TL.m){
          const rowPx=pt/.75,y0=Math.max(2,Math.round((rowPx-TL.bh)/2));
          for(let q=0;q<TL.m;q++){
            const line=Math.floor(q/RBA_PCI.perLine),inLine=Math.min(RBA_PCI.perLine,TL.m-line*RBA_PCI.perLine),cIdx=q%RBA_PCI.perLine;
            const lw=inLine*RBA_PCI.w+(inLine-1)*RBA_PCI.gap;
            const x=Math.max(2,Math.round((nPx2-lw)/2)+cIdx*(RBA_PCI.w+RBA_PCI.gap)),y=y0+line*(RBA_PCI.h+RBA_PCI.gap);
            imgNo2++;
            const more=(q===TL.m-1&&it.pics.length>TL.m)?(it.pics.length-TL.m+1):0;
            media2.push({no:imgNo2,pic:it.pics[q],more});
            rels2+=`<Relationship Id="rId${imgNo2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${imgNo2}.jpeg"/>`;
            pics2+=`<xdr:oneCellAnchor><xdr:from><xdr:col>13</xdr:col><xdr:colOff>${x*RBA_PCI.emu}</xdr:colOff><xdr:row>${rn-1}</xdr:row><xdr:rowOff>${y*RBA_PCI.emu}</xdr:rowOff></xdr:from><xdr:ext cx="${RBA_PCI.w*RBA_PCI.emu}" cy="${RBA_PCI.h*RBA_PCI.emu}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${imgNo2+1}" name="${it.c} anh ${q+1}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId${imgNo2}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${RBA_PCI.w*RBA_PCI.emu}" cy="${RBA_PCI.h*RBA_PCI.emu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
          }
        }
        return `<${ns}row r="${rnS}"${attrs}>${body}</${ns}row>`;
      });

      if(!new RegExp(`<${ns}pageSetup\\b`).test(sh2)){
        sh2=sh2.replace(new RegExp(`(<${ns}pageMargins[^>]*/>)`),`$1<${ns}pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>`);
      }
      if(media2.length){
        for(const t of media2)X.z.file(`xl/media/image${t.no}.jpeg`,await rbaTile(t.pic,t.more),{createFolders:false});
        if(!new RegExp(`<${ns}drawing\\b`).test(sh2)){
          sh2=sh2.replace(new RegExp(`(<${ns}tableParts\\b)`),`<${ns}drawing r:id="rIdDr1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>$1`);
        }
        let s2rels=await X.z.file('xl/worksheets/_rels/sheet2.xml.rels').async('string');
        if(!s2rels.includes('rIdDr1')){
          s2rels=s2rels.replace('</Relationships>','<Relationship Id="rIdDr1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>');
          X.z.file('xl/worksheets/_rels/sheet2.xml.rels',s2rels,{createFolders:false});
        }
        X.z.file('xl/drawings/drawing1.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${pics2}</xdr:wsDr>`,{createFolders:false});
        X.z.file('xl/drawings/_rels/drawing1.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels2}</Relationships>`,{createFolders:false});
        let ct=await X.z.file('[Content_Types].xml').async('string');
        if(!ct.includes('Extension="jpeg"'))ct=ct.replace('<Types ','<Types ').replace('</Types>','<Default Extension="jpeg" ContentType="image/jpeg"/></Types>');
        if(!ct.includes('/xl/drawings/drawing1.xml'))ct=ct.replace('</Types>','<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>');
        X.z.file('[Content_Types].xml',ct,{createFolders:false});
      }
      X.z.file('xl/worksheets/sheet2.xml',sh2,{createFolders:false});

      const wb=X.wbx,root=wb.documentElement,pre=root.prefix?root.prefix+':':'';let cp=els(wb,'calcPr')[0];
      if(!cp){cp=wb.createElementNS(NS_MAIN,pre+'calcPr');const after=[...root.children].find(x=>['oleSize','customWorkbookViews','pivotCaches','smartTagPr','smartTagTypes','webPublishing','fileRecoveryPr','webPublishObjects','extLst'].includes(x.localName));root.insertBefore(cp,after||null)}
      cp.setAttribute('fullCalcOnLoad','1');X.z.file('xl/workbook.xml',serX(wb),{createFolders:false});
      const data=await X.z.generateAsync({type:'blob',compression:'DEFLATE',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      await saveFile(`Doi-chieu-Guider_${safeName(unit||'audit')}_${date}.xlsx`,data);
      toast(`Đã xuất Checklist 41 mã RBA: ${col.violRows.length} mã có phát hiện, ${nCap} dòng CAP, ${nReq} yêu cầu chi tiết.`);
    }catch(e){console.error(e);toast(e&&e.message&&/^(Không|File)/.test(e.message)?e.message:'Không tạo được file đối chiếu. Hãy thử lại.')}
    finally{reviewing=false;uiState()}
  };
}

/* ======================================================================
   5. FILE PDF: Xếp đúng thứ tự hạng mục từ BH101 trở đi (EH000 cuối),
   mỗi trang là MỘT ảnh của MỘT hạng mục (không gộp), ảnh phủ kín khung 4:3.
   ====================================================================== */
function rbaChip(g,x,y,text,bg,FB,size){
  g.font=`700 ${size}px ${FB}`;
  const w=g.measureText(text).width+size*1.15,hh=size*1.58;
  g.fillStyle=bg;rrect(g,x,y,w,hh,hh/2);g.fill();
  g.fillStyle='#FFFFFF';g.textBaseline='middle';g.textAlign='left';
  g.fillText(text,x+size*.58,y+hh/2+1);g.textBaseline='alphabetic';
  return w;
}
async function rbaSlide(p,items,idx,L,page,total,code){
  const im=await ensureImg(p);await fonts();
  const FB=fontL(L),W=SLW,H=SLH,M=64,c=mk(W,H),g=c.getContext('2d');
  g.fillStyle='#FFFFFF';g.fillRect(0,0,W,H);g.textBaseline='alphabetic';g.textAlign='left';
  g.fillStyle='#14324A';g.fillRect(0,0,W,10);
  rrect(g,M,40,88,88,16);g.fill();
  g.fillStyle='#FFFFFF';g.font=`700 46px ${fontD}`;g.textAlign='center';g.textBaseline='middle';
  g.fillText(String(idx+1).padStart(2,'0'),M+44,86);
  g.textAlign='left';g.textBaseline='alphabetic';

  const area=String(p.area||'').trim()||`${CAPL.vi.photo} ${idx+1}`,areaX=L==='vi'?'':capOf(L,p.area),hx=M+116,hw=W-M-hx-640;
  g.fillStyle='#14191C';fitFont(g,area,hw,`700 #px ${FB}`,46,26);g.fillText(trunc(g,area,hw),hx,areaX?82:100);
  if(areaX){g.fillStyle='#1F4E8C';fitFont(g,areaX,hw,`500 #px ${FB}`,32,20);g.fillText(trunc(g,areaX,hw),hx,126)}

  g.textAlign='right';const ven=$('mUnit').value.trim();
  if(ven){g.fillStyle='#14191C';fitFont(g,ven,600,`600 #px ${FB}`,28,20);g.fillText(trunc(g,ven,600),W-M,80)}
  g.fillStyle='#55626A';g.font=`400 24px ${FB}`;g.fillText(vnDate($('mDate').value),W-M,ven?118:96);
  g.textAlign='left';g.fillStyle='#E3E8EA';g.fillRect(M,158,W-2*M,2);

  const top=188,bot=H-82,bh=bot-top,FW=980,FH=735,px=M,py=top+(bh-FH)/2;
  const nos=items.map((x,k)=>({f:{...x.f,sev:''},n:k+1}));
  drawUniform43(g,im,p,nos,px,py,FW,FH,{cover:true,lw:Math.max(3.5,FW/340),r:clamp(FW/46,18,26),minFrac:.82});
  g.strokeStyle='#D8E0EA';g.lineWidth=2;g.strokeRect(px,py,FW,FH);

  const single=items.length<=1,x0=px+FW+52,tx=x0+(single?24:66),tw=W-M-tx,cols=colorsOf(nos);
  let F=null;
  for(const z of[34,31,28,26,24,22,20,18,16]){
    const lh=Math.round(z*1.3),xs=Math.round(z*.88),xlh=Math.round(xs*1.3),cs=Math.max(15,Math.round(z*.62)),ch=Math.round(cs*1.58)+10,gap=Math.round(z*.88);
    let tot=ch;
    const bl=nos.map(({f,n})=>{
      g.font=`600 ${z}px ${FB}`;const tl=wrapX(g,f.title,tw),tr=L==='vi'?'':capOf(L,f.title);
      g.font=`500 ${xs}px ${FB}`;const xl=tr?wrapX(g,tr,tw):[];
      const hh=tl.length*lh+(xl.length?8+xl.length*xlh:0);tot+=hh+gap;
      return{f,n,tl,xl,hh};
    });
    tot-=gap;F={z,lh,xs,xlh,cs,ch,gap,bl,tot};if(tot<=bh)break;
  }

  g.save();g.beginPath();g.rect(x0-6,top-6,W-M-x0+12,bh+12);g.clip();
  let y=top+Math.max(0,(bh-F.tot)/2);
  const isEh=code==='EH000',chipTxt=isEh?'EHS khác':code,chipBg=isEh?'#6D28D9':'#0F4C81';
  const cw=rbaChip(g,x0,y,chipTxt,chipBg,FB,F.cs);
  g.fillStyle='#475569';g.font=`600 ${F.cs}px ${FB}`;
  g.fillText(trunc(g,rbaTitle(code),W-M-(x0+cw+12)),x0+cw+12,y+F.cs*1.15);
  y+=F.ch;

  F.bl.forEach((b,i)=>{
    let ty=y;
    if(single){g.fillStyle=cols[b.f.id][0];rrect(g,x0,ty+4,8,Math.max(24,b.hh-8),4);g.fill()}
    else badge(g,b.n,'',x0+26,ty+F.lh*.5,clamp(F.z*.6,14,23),cols[b.f.id]);
    g.textAlign='left';g.textBaseline='alphabetic';
    g.fillStyle='#14191C';g.font=`600 ${F.z}px ${FB}`;
    b.tl.forEach(l=>{g.fillText(l,tx,ty+F.lh*.78);ty+=F.lh});
    if(b.xl.length){ty+=8;g.fillStyle='#1F4E8C';g.font=`500 ${F.xs}px ${FB}`;b.xl.forEach(l=>{g.fillText(l,tx,ty+F.xlh*.78);ty+=F.xlh})}
    y+=b.hh;
    if(i<F.bl.length-1){g.fillStyle='#E3E8EA';g.fillRect(x0,y+F.gap/2-1,W-M-x0,2);y+=F.gap}
  });
  g.restore();
  g.fillStyle='#8A979D';g.font=`400 22px ${FB}`;g.textAlign='left';g.fillText(capLab('rep',L),M,H-36);
  g.textAlign='right';g.fillText(`${page} / ${total}`,W-M,H-36);g.textAlign='left';
  return c;
}

exportPdf=async function(){
  if(pdfBusy)return;if(!gateExport())return;
  const col=rbaCollect();
  const slides=[
    ...col.violRows.flatMap(r=>r.pics.map(pc=>({p:pc.p,items:pc.items,code:r.c}))),
    ...col.ehs.map(g=>({p:g.p,items:g.items,code:'EH000'}))
  ];
  if(!slides.length)return toast('Chưa có lỗi nào đã xác nhận.');
  const L=capLang(),btns=['btnPdf','prevPdf'].map(id=>$(id)).filter(Boolean),old=btns.map(b=>b.textContent),say=t=>btns.forEach(b=>{b.textContent=t;b.disabled=true});
  pdfBusy=true;
  try{
    let miss=0;
    if(L!=='vi'){
      say('Đang dịch phụ đề…');
      const texts=slides.flatMap(s=>[s.p.area,...s.items.map(x=>x.f.title)]).filter(Boolean);
      try{miss=typeof lxEnsure==='function'?await lxEnsure(L,texts,say):await ensureCap(L,slides.map(s=>s.p),say)}catch(e){console.warn(e)}
    }
    const N=1+slides.length,pages=[];
    const push=async(c,q)=>{pages.push({blob:await toBlob(c,'image/jpeg',q||.88),w:c.width,h:c.height});c.width=c.height=0;await new Promise(r=>setTimeout(r,0))};
    say(`Đang tạo PDF 1/${N}…`);
    await push(await coverCanvas(slides,L),.9);
    for(const[i,sl]of slides.entries()){
      say(`Đang tạo PDF ${i+2}/${N}…`);
      await push(await rbaSlide(sl.p,sl.items,i,L,i+2,N,sl.code),.87);
    }
    const ven=$('mUnit').value.trim(),date=$('mDate').value||today();
    const blob=await buildPdf(pages,`${CAPL.vi.rep}${ven?' – '+ven:''} – ${vnDate(date)}`);
    await saveFile(`Trinh-chieu-EHS_${safeName(ven||'audit')}_${date}.pdf`,blob);
    if(miss>0)toast(`Lưu ý: ${miss} câu chưa dịch được (chưa có mạng hoặc key AI), phụ đề tạm hiện tiếng Việt.`);
  }catch(e){console.error(e);toast('Không tạo được PDF. Hãy thử lại.')}
  finally{pdfBusy=false;btns.forEach((b,k)=>{b.textContent=old[k];b.disabled=false});syncCap();try{renderExportCheck()}catch{}}
};

/* Xuất các hàm ra global cho UI trong soat-anh-ehs-rba.html & kiểm thử tự động */
Object.assign(window,{
  rbaOrder,rbaRank,rbaCodeOf,rbaShortLabel,rbaTitle,
  rbaSortPhotos,rbaRowCmp,rbaQuick,rbaDelBtn,rbaDelPhotoBtn,
  rbaSetCode,rbaCollect,rbaNeedAsk,rbaAskDlg,rbaConfirmSel,rbaResetSel,
  __RBA18:{order:rbaOrder,collect:rbaCollect,pci:RBA_PCI,rowPt:RBA_ROWPT,tile:rbaTile,layout:rbaTileLayout}
});
})();
