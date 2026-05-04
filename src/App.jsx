import { useState, useEffect } from "react";

// ── THEME ─────────────────────────────────────────────────────────
const T = {
  bg:       "#080808",
  bg1:      "#0d0d0d",
  bg2:      "#111111",
  border:   "#1a1a1a",
  border2:  "#252525",
  green:    "#39ff14",
  violet:   "#b44fff",
  greenDim: "#39ff1422",
  violetDim:"#b44fff22",
  greenMid: "#39ff1444",
  violetMid:"#b44fff44",
  text:     "#ffffff",
  textDim:  "#666666",
  textMid:  "#999999",
  danger:   "#ff4444",
};

// ── STORAGE ───────────────────────────────────────────────────────
const KEY = "stickerslab_v2";
function load() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} }

// ── DEFAULT DATA ──────────────────────────────────────────────────
const DEF = {
  drops: [
    { id: 1, nom: "Drop 01 — Été Chaotique", statut: "En création", type: "Design perso", lancement: "2026-06-15", cloture: "", nbDesigns: 3, qte: 100, prix: 4.5, cout: 85, vendus: 0, canaux: ["Instagram Shop"], bilan: "" },
  ],
  partenariats: [
    { id: 1, nom: "LucieDraws", plateforme: "Instagram", followers: "45k", engagement: "4.8", univers: "Illustration", type: "Collab artistique", statut: "En discussion", contact: "@luciedraws", date: "2026-04-20", notes: "Fan de stickers, a déjà fait des produits physiques" },
  ],
  designs: [],
  production: [],
  taches: [
    { id: 1, tache: "Contacter LucieDraws", module: "Partenariats", priorite: "Haute", deadline: "2026-05-10", statut: "À faire" },
    { id: 2, tache: "Commander samples imprimeur", module: "Production", priorite: "Moyenne", deadline: "2026-05-20", statut: "À faire" },
  ],
  finance: {
    objectifCA: 5000,
    depenses: [],
  },
  nextId: 100,
};

// ── CONSTANTS ─────────────────────────────────────────────────────
const MODULES = [
  { id: "home",         icon: "⬡", label: "Hub"          },
  { id: "drops",        icon: "◈", label: "Drops"        },
  { id: "partenariats", icon: "◎", label: "Collabs"      },
  { id: "finance",      icon: "◇", label: "Finance"      },
  { id: "designs",      icon: "◻", label: "Designs"      },
  { id: "taches",       icon: "▷", label: "Tâches"       },
];

const DROP_STATUTS  = ["Idée","En création","En production","Annoncé","Lancé","Sold out"];
const DROP_TYPES    = ["Design perso","Collab artiste","Licensing","Série limitée"];
const CANAUX        = ["Instagram Shop","TikTok Shop","Site perso"];
const PART_STATUTS  = ["À contacter","Contacté","En discussion","Collab confirmée","Archivé"];
const PART_TYPES    = ["Collab artistique","Licensing"];
const PLATEFORMES   = ["Instagram","TikTok","YouTube","Twitch","Pinterest","Autre"];
const UNIVERS       = ["Illustration","Gaming","Humour","Manga","Street/Skate","Culture pop","Autre"];
const PRIORITES     = ["Haute","Moyenne","Basse"];
const TACHE_STATUTS = ["À faire","En cours","Fait"];
const TACHE_MODULES = ["Drops","Partenariats","Designs","Production","Finance","Autre"];

const STATUT_ACCENT = {
  "Idée":             T.violet,
  "En création":      T.violet,
  "En production":    "#ffaa00",
  "Annoncé":          "#00cfff",
  "Lancé":            T.green,
  "Sold out":         "#ff4db8",
  "À contacter":      T.violet,
  "Contacté":         "#00cfff",
  "En discussion":    "#ffaa00",
  "Collab confirmée": T.green,
  "Archivé":          T.textDim,
  "À faire":          "#ffaa00",
  "En cours":         "#00cfff",
  "Fait":             T.green,
  "Haute":            "#ff4db8",
  "Moyenne":          "#ffaa00",
  "Basse":            T.textDim,
};

// ── UTILS ─────────────────────────────────────────────────────────
const fmtEur = (n) => n !== "" && n !== null && n !== undefined ? `${parseFloat(n).toFixed(0)}€` : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day:"numeric", month:"short" }) : "—";

// ── BASE COMPONENTS ───────────────────────────────────────────────
function Badge({ label, color }) {
  const c = color || STATUT_ACCENT[label] || T.textDim;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:c+"22", border:`1px solid ${c}55`, color:c, borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, letterSpacing:0.5, whiteSpace:"nowrap" }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:c }} />{label}
    </span>
  );
}

function NeonCard({ children, accent, style }) {
  const c = accent || T.green;
  return (
    <div style={{ background:T.bg1, border:`1px solid ${c}33`, borderRadius:14, padding:"18px 20px", boxShadow:`0 0 20px ${c}11`, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent, sub }) {
  const c = accent || T.green;
  return (
    <div style={{ background:T.bg1, border:`1px solid ${c}33`, borderRadius:14, padding:"16px 18px", flex:1, minWidth:110, boxShadow:`0 0 16px ${c}0a` }}>
      <div style={{ fontSize:24, fontWeight:800, color:c, fontFamily:"'DM Mono',monospace", letterSpacing:-1 }}>{value}</div>
      <div style={{ fontSize:10, color:T.textDim, textTransform:"uppercase", letterSpacing:2, marginTop:3 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:T.textMid, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type="text", placeholder }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label && <label style={{ display:"block", fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>{label}</label>}
      <input type={type} value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:T.bg, border:`1px solid ${T.border2}`, borderRadius:8, padding:"10px 13px", color:T.text, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label && <label style={{ display:"block", fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>{label}</label>}
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:T.bg, border:`1px solid ${T.border2}`, borderRadius:8, padding:"10px 13px", color:T.text, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit" }}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows=3 }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label && <label style={{ display:"block", fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>{label}</label>}
      <textarea value={value||""} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", background:T.bg, border:`1px solid ${T.border2}`, borderRadius:8, padding:"10px 13px", color:T.text, fontSize:14, boxSizing:"border-box", outline:"none", fontFamily:"inherit", resize:"vertical" }} />
    </div>
  );
}

function MultiSelect({ label, value=[], onChange, options }) {
  const toggle = o => onChange(value.includes(o) ? value.filter(v=>v!==o) : [...value, o]);
  return (
    <div style={{ marginBottom:13 }}>
      {label && <label style={{ display:"block", fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>{label}</label>}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {options.map(o=>(
          <button key={o} onClick={()=>toggle(o)} style={{ padding:"5px 12px", borderRadius:20, fontSize:12, cursor:"pointer", background:value.includes(o)?T.greenDim:T.bg1, border:`1px solid ${value.includes(o)?T.green:T.border2}`, color:value.includes(o)?T.green:T.textDim }}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant="primary", small }) {
  const styles = {
    primary: { bg:T.green,    border:"none",                      color:"#000", fw:700 },
    violet:  { bg:T.violet,   border:"none",                      color:"#fff", fw:700 },
    ghost:   { bg:"transparent", border:`1px solid ${T.border2}`, color:T.textMid, fw:400 },
    danger:  { bg:"transparent", border:`1px solid ${T.danger}44`,color:T.danger, fw:400 },
  };
  const s = styles[variant] || styles.primary;
  return (
    <button onClick={onClick} style={{ padding:small?"6px 13px":"11px 20px", background:s.bg, border:s.border, borderRadius:9, color:s.color, fontSize:small?11:14, fontWeight:s.fw, cursor:"pointer", fontFamily:"inherit" }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div style={{ background:T.bg2, borderTop:`1px solid ${T.border2}`, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:520, padding:"24px 24px 40px", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div style={{ fontSize:17, fontWeight:700, color:T.text }}>{title}</div>
          <button onClick={onClose} style={{ background:T.bg1, border:`1px solid ${T.border2}`, borderRadius:8, color:T.textDim, fontSize:18, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── LOGO COMPONENT ────────────────────────────────────────────────
function Logo({ size=32 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:size, height:size, borderRadius:size*0.25, background:`linear-gradient(135deg, ${T.violet}, ${T.green})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.5, boxShadow:`0 0 16px ${T.green}55` }}>
        ⬡
      </div>
      <div>
        <div style={{ fontSize:size*0.5, fontWeight:800, color:T.text, letterSpacing:-0.5, lineHeight:1 }}>Stickers<span style={{ color:T.green }}>Lab</span></div>
        {size > 28 && <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase" }}>Business Hub</div>}
      </div>
    </div>
  );
}

// ── MODULE: HOME ──────────────────────────────────────────────────
function Home({ data, setModule }) {
  const drops = data.drops || [];
  const parts = data.partenariats || [];
  const taches = data.taches || [];
  const fin = data.finance || {};

  const totalRevenu = drops.reduce((s,d)=>s+(d.vendus||0)*(d.prix||0),0);
  const totalCout   = drops.reduce((s,d)=>s+(d.cout||0),0);
  const marge       = totalRevenu - totalCout;
  const objectif    = fin.objectifCA || 0;
  const pctCA       = objectif > 0 ? Math.min(100, Math.round((totalRevenu/objectif)*100)) : 0;

  const dropsActifs = drops.filter(d=>!["Idée","Sold out"].includes(d.statut)).length;
  const tachesDues  = taches.filter(t=>t.statut!=="Fait").length;
  const partEnCours = parts.filter(p=>["En discussion","Contacté"].includes(p.statut)).length;

  const prochainDrop = drops.filter(d=>d.lancement && d.statut!=="Sold out").sort((a,b)=>new Date(a.lancement)-new Date(b.lancement))[0];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <Logo size={36} />
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <StatCard label="Drops actifs"   value={dropsActifs}  accent={T.violet} />
        <StatCard label="Collabs"        value={partEnCours}  accent={T.green}  sub="en cours" />
        <StatCard label="Tâches"         value={tachesDues}   accent="#ffaa00"  sub="à faire" />
      </div>

      {/* CA Progress */}
      <NeonCard accent={T.green} style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ fontSize:11, color:T.textDim, letterSpacing:2, textTransform:"uppercase" }}>Objectif CA</div>
          <div style={{ fontSize:12, color:T.green, fontFamily:"'DM Mono',monospace" }}>{Math.round(totalRevenu)}€ / {objectif}€</div>
        </div>
        <div style={{ background:T.bg, borderRadius:6, height:6, overflow:"hidden" }}>
          <div style={{ width:`${pctCA}%`, height:"100%", background:`linear-gradient(90deg,${T.violet},${T.green})`, borderRadius:6, transition:"width 0.5s", boxShadow:`0 0 8px ${T.green}` }} />
        </div>
        <div style={{ fontSize:11, color:T.textDim, marginTop:6 }}>{pctCA}% atteint · Marge nette : <span style={{ color:marge>=0?T.green:T.danger }}>{Math.round(marge)}€</span></div>
      </NeonCard>

      {prochainDrop && (
        <NeonCard accent={T.violet} style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Prochain drop</div>
          <div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:8 }}>{prochainDrop.nom}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <Badge label={prochainDrop.statut} />
            <span style={{ fontSize:11, color:T.textDim }}>{fmtDate(prochainDrop.lancement)}</span>
          </div>
        </NeonCard>
      )}

      <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Modules</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {MODULES.filter(m=>m.id!=="home").map(m=>(
          <button key={m.id} onClick={()=>setModule(m.id)} style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 16px", textAlign:"left", cursor:"pointer" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.green+"66";e.currentTarget.style.boxShadow=`0 0 16px ${T.green}11`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}>
            <div style={{ fontSize:22, marginBottom:6, color:T.green }}>{m.icon}</div>
            <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MODULE: DROPS ─────────────────────────────────────────────────
function Drops({ data, setData }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const drops = data.drops || [];
  const filtered = filter==="Tous" ? drops : drops.filter(d=>d.statut===filter);

  const blank = () => ({ id:null,nom:"",statut:"Idée",type:"Design perso",lancement:"",cloture:"",nbDesigns:"",qte:"",prix:"",cout:"",vendus:0,canaux:[],bilan:"" });

  const save = form => {
    setData(d=>{
      const id = form.id||d.nextId;
      const drops = form.id ? d.drops.map(x=>x.id===form.id?{...form}:x) : [...d.drops,{...form,id}];
      return {...d, drops, nextId:form.id?d.nextId:d.nextId+1};
    });
    setModal(null);
  };

  const del = id => { if(!confirm("Supprimer ce drop ?"))return; setData(d=>({...d,drops:d.drops.filter(x=>x.id!==id)})); };
  const marge = dr => (dr.vendus||0)*(dr.prix||0)-(dr.cout||0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase" }}>Module</div>
          <div style={{ fontSize:22, fontWeight:800, color:T.text }}>Drops <span style={{ color:T.green }}>& Collections</span></div>
        </div>
        <Btn onClick={()=>setModal(blank())}>+ Nouveau</Btn>
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
        {["Tous",...DROP_STATUTS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 12px", borderRadius:20, fontSize:11, cursor:"pointer", background:filter===s?T.greenDim:T.bg1, border:`1px solid ${filter===s?T.green:T.border}`, color:filter===s?T.green:T.textDim }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(dr=>(
          <NeonCard key={dr.id} accent={STATUT_ACCENT[dr.statut]||T.green}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:6 }}>{dr.nom}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Badge label={dr.statut} />
                  {dr.type && <Badge label={dr.type} color={T.violet} />}
                </div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
              {[
                { label:"PRIX",    val: dr.prix?`${dr.prix}€`:"—" },
                { label:"VENDUS",  val: `${dr.vendus||0}/${dr.qte||"?"}` },
                { label:"MARGE",   val: dr.prix&&dr.cout?`${Math.round(marge(dr))}€`:"—", color:marge(dr)>=0?T.green:T.danger },
              ].map(({label,val,color})=>(
                <div key={label} style={{ background:T.bg, borderRadius:8, padding:"8px 10px" }}>
                  <div style={{ fontSize:9, color:T.textDim, marginBottom:3, letterSpacing:1 }}>{label}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:color||T.text, fontFamily:"'DM Mono',monospace" }}>{val}</div>
                </div>
              ))}
            </div>
            {dr.lancement && <div style={{ fontSize:11, color:T.textDim, marginTop:10 }}>📅 {fmtDate(dr.lancement)}{dr.cloture?` → ${fmtDate(dr.cloture)}`:""}</div>}
            <div style={{ display:"flex", gap:8, marginTop:14 }}>
              <Btn small onClick={()=>setModal({...dr})}>Modifier</Btn>
              <Btn small variant="danger" onClick={()=>del(dr.id)}>Supprimer</Btn>
            </div>
          </NeonCard>
        ))}
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:T.textDim }}>Aucun drop — crée le premier ↗</div>}
      </div>

      {modal && (
        <Modal title={modal.id?"Modifier le drop":"Nouveau drop"} onClose={()=>setModal(null)}>
          <Input label="Nom du drop" value={modal.nom} onChange={v=>setModal(m=>({...m,nom:v}))} placeholder="ex: Drop 01 — Été Chaotique" />
          <Select label="Statut" value={modal.statut} onChange={v=>setModal(m=>({...m,statut:v}))} options={DROP_STATUTS} />
          <Select label="Type" value={modal.type} onChange={v=>setModal(m=>({...m,type:v}))} options={DROP_TYPES} />
          <Input label="Date de lancement" value={modal.lancement} onChange={v=>setModal(m=>({...m,lancement:v}))} type="date" />
          <Input label="Date de clôture" value={modal.cloture} onChange={v=>setModal(m=>({...m,cloture:v}))} type="date" />
          <Input label="Nombre de designs" value={modal.nbDesigns} onChange={v=>setModal(m=>({...m,nbDesigns:v}))} type="number" />
          <Input label="Quantité produite" value={modal.qte} onChange={v=>setModal(m=>({...m,qte:v}))} type="number" />
          <Input label="Prix de vente (€)" value={modal.prix} onChange={v=>setModal(m=>({...m,prix:v}))} type="number" />
          <Input label="Coût de production (€)" value={modal.cout} onChange={v=>setModal(m=>({...m,cout:v}))} type="number" />
          <Input label="Unités vendues" value={modal.vendus} onChange={v=>setModal(m=>({...m,vendus:v}))} type="number" />
          <MultiSelect label="Canaux de vente" value={modal.canaux} onChange={v=>setModal(m=>({...m,canaux:v}))} options={CANAUX} />
          <Textarea label="Bilan / notes" value={modal.bilan} onChange={v=>setModal(m=>({...m,bilan:v}))} />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={()=>save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MODULE: PARTENARIATS ──────────────────────────────────────────
function Partenariats({ data, setData }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const parts = data.partenariats || [];
  const filtered = filter==="Tous" ? parts : parts.filter(p=>p.statut===filter);

  const blank = () => ({ id:null,nom:"",plateforme:"Instagram",followers:"",engagement:"",univers:"Illustration",type:"Collab artistique",statut:"À contacter",contact:"",date:"",notes:"" });

  const save = form => {
    setData(d=>{
      const id = form.id||d.nextId;
      const partenariats = form.id ? d.partenariats.map(x=>x.id===form.id?{...form}:x) : [...d.partenariats,{...form,id}];
      return {...d, partenariats, nextId:form.id?d.nextId:d.nextId+1};
    });
    setModal(null);
  };

  const del = id => { if(!confirm("Supprimer ?"))return; setData(d=>({...d,partenariats:d.partenariats.filter(x=>x.id!==id)})); };
  const engColor = v => { const n=parseFloat(v); if(!n)return T.textDim; return n>=5?T.green:n>=3?"#ffaa00":T.danger; };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase" }}>Module</div>
          <div style={{ fontSize:22, fontWeight:800, color:T.text }}>Collabs <span style={{ color:T.violet }}>&amp; Partenariats</span></div>
        </div>
        <Btn variant="violet" onClick={()=>setModal(blank())}>+ Ajouter</Btn>
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
        {["Tous",...PART_STATUTS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 12px", borderRadius:20, fontSize:11, cursor:"pointer", background:filter===s?T.violetDim:T.bg1, border:`1px solid ${filter===s?T.violet:T.border}`, color:filter===s?T.violet:T.textDim }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(p=>(
          <NeonCard key={p.id} accent={STATUT_ACCENT[p.statut]||T.violet}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:T.text, marginBottom:4 }}>{p.nom}</div>
                <div style={{ fontSize:11, color:T.textDim }}>{p.plateforme} · {p.followers||"?"} followers</div>
              </div>
              <Badge label={p.statut} />
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
              {p.univers && <Badge label={p.univers} color={T.violet} />}
              {p.type && <Badge label={p.type} color={T.green} />}
              {p.engagement && <span style={{ fontSize:12, color:engColor(p.engagement), fontFamily:"'DM Mono',monospace" }}>◈ {p.engagement}%</span>}
            </div>
            {p.notes && <div style={{ fontSize:12, color:T.textMid, borderTop:`1px solid ${T.border}`, paddingTop:8, lineHeight:1.5 }}>{p.notes.slice(0,100)}{p.notes.length>100?"…":""}</div>}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <Btn small onClick={()=>setModal({...p})}>Modifier</Btn>
              <Btn small variant="danger" onClick={()=>del(p.id)}>Supprimer</Btn>
            </div>
          </NeonCard>
        ))}
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:T.textDim }}>Aucun partenaire</div>}
      </div>

      {modal && (
        <Modal title={modal.id?"Modifier":"Nouveau partenaire"} onClose={()=>setModal(null)}>
          <Input label="Nom / Pseudo" value={modal.nom} onChange={v=>setModal(m=>({...m,nom:v}))} placeholder="ex: LucieDraws" />
          <Input label="Contact" value={modal.contact} onChange={v=>setModal(m=>({...m,contact:v}))} placeholder="ex: @luciedraws" />
          <Select label="Plateforme" value={modal.plateforme} onChange={v=>setModal(m=>({...m,plateforme:v}))} options={PLATEFORMES} />
          <Input label="Followers" value={modal.followers} onChange={v=>setModal(m=>({...m,followers:v}))} placeholder="ex: 45k" />
          <Input label="Taux d'engagement (%)" value={modal.engagement} onChange={v=>setModal(m=>({...m,engagement:v}))} placeholder="ex: 4.8" />
          <Select label="Univers" value={modal.univers} onChange={v=>setModal(m=>({...m,univers:v}))} options={UNIVERS} />
          <Select label="Type" value={modal.type} onChange={v=>setModal(m=>({...m,type:v}))} options={PART_TYPES} />
          <Select label="Statut" value={modal.statut} onChange={v=>setModal(m=>({...m,statut:v}))} options={PART_STATUTS} />
          <Input label="Date de contact" value={modal.date} onChange={v=>setModal(m=>({...m,date:v}))} type="date" />
          <Textarea label="Notes" value={modal.notes} onChange={v=>setModal(m=>({...m,notes:v}))} placeholder="Historique, prochaine étape..." />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn variant="violet" onClick={()=>save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MODULE: FINANCE ───────────────────────────────────────────────
function Finance({ data, setData }) {
  const [editObjectif, setEditObjectif] = useState(false);
  const [tmpObj, setTmpObj] = useState("");
  const [modalDep, setModalDep] = useState(null);

  const drops = data.drops || [];
  const fin = data.finance || { objectifCA:0, depenses:[] };
  const depenses = fin.depenses || [];

  const totalRevenu  = drops.reduce((s,d)=>s+(d.vendus||0)*(d.prix||0),0);
  const totalCout    = drops.reduce((s,d)=>s+(d.cout||0),0);
  const totalDep     = depenses.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
  const margeNette   = totalRevenu - totalCout - totalDep;
  const pctCA        = fin.objectifCA>0 ? Math.min(100,Math.round((totalRevenu/fin.objectifCA)*100)) : 0;

  const saveObjectif = () => {
    setData(d=>({...d, finance:{...d.finance, objectifCA:parseFloat(tmpObj)||0}}));
    setEditObjectif(false);
  };

  const saveDep = form => {
    setData(d=>{
      const id = form.id||d.nextId;
      const depenses = form.id ? (d.finance.depenses||[]).map(x=>x.id===form.id?{...form}:x) : [...(d.finance.depenses||[]),{...form,id}];
      return {...d, finance:{...d.finance,depenses}, nextId:form.id?d.nextId:d.nextId+1};
    });
    setModalDep(null);
  };

  const delDep = id => { if(!confirm("Supprimer ?"))return; setData(d=>({...d,finance:{...d.finance,depenses:(d.finance.depenses||[]).filter(x=>x.id!==id)}})); };

  const DEP_CATS = ["Impression","Matériel","Marketing","Logistique","Plateforme","Autre"];

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase" }}>Module</div>
        <div style={{ fontSize:22, fontWeight:800, color:T.text }}>Finance <span style={{ color:T.green }}>&amp; Marges</span></div>
      </div>

      {/* Objectif CA */}
      <NeonCard accent={T.green} style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase" }}>Objectif CA annuel</div>
          <button onClick={()=>{setTmpObj(fin.objectifCA);setEditObjectif(true);}} style={{ background:"none", border:"none", color:T.green, cursor:"pointer", fontSize:12 }}>Modifier</button>
        </div>
        {editObjectif ? (
          <div style={{ display:"flex", gap:8 }}>
            <input type="number" value={tmpObj} onChange={e=>setTmpObj(e.target.value)} style={{ flex:1, background:T.bg, border:`1px solid ${T.green}`, borderRadius:8, padding:"8px 12px", color:T.text, fontSize:14, outline:"none", fontFamily:"inherit" }} />
            <Btn small onClick={saveObjectif}>OK</Btn>
          </div>
        ) : (
          <>
            <div style={{ fontSize:28, fontWeight:800, color:T.green, fontFamily:"'DM Mono',monospace", marginBottom:10 }}>{fmtEur(fin.objectifCA)}</div>
            <div style={{ background:T.bg, borderRadius:6, height:6, overflow:"hidden", marginBottom:6 }}>
              <div style={{ width:`${pctCA}%`, height:"100%", background:`linear-gradient(90deg,${T.violet},${T.green})`, borderRadius:6, boxShadow:`0 0 8px ${T.green}` }} />
            </div>
            <div style={{ fontSize:11, color:T.textDim }}>{pctCA}% atteint · {fmtEur(totalRevenu)} générés</div>
          </>
        )}
      </NeonCard>

      {/* Stats drops */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <StatCard label="Revenu brut"   value={fmtEur(totalRevenu)} accent={T.green} />
        <StatCard label="Coûts prod."   value={fmtEur(totalCout)}   accent="#ffaa00" />
        <StatCard label="Marge nette"   value={fmtEur(margeNette)}  accent={margeNette>=0?T.green:T.danger} />
      </div>

      {/* Revenu par drop */}
      <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Revenu par drop</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
        {drops.length===0 && <div style={{ color:T.textDim, fontSize:13 }}>Aucun drop enregistré</div>}
        {drops.map(dr=>{
          const rev = (dr.vendus||0)*(dr.prix||0);
          const mg  = rev-(dr.cout||0);
          const pct = dr.qte>0?Math.round(((dr.vendus||0)/dr.qte)*100):0;
          return (
            <div key={dr.id} style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{dr.nom}</div>
                <Badge label={dr.statut} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6 }}>
                {[
                  { l:"Vendus",  v:`${dr.vendus||0}/${dr.qte||"?"}` },
                  { l:"Revenu",  v:fmtEur(rev) },
                  { l:"Coût",    v:fmtEur(dr.cout) },
                  { l:"Marge",   v:fmtEur(mg), c:mg>=0?T.green:T.danger },
                ].map(({l,v,c})=>(
                  <div key={l} style={{ background:T.bg, borderRadius:6, padding:"6px 8px" }}>
                    <div style={{ fontSize:9, color:T.textDim, marginBottom:2, letterSpacing:1 }}>{l}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:c||T.text, fontFamily:"'DM Mono',monospace" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:8 }}>
                <div style={{ background:T.bg, borderRadius:4, height:3, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:T.green, boxShadow:`0 0 6px ${T.green}` }} />
                </div>
                <div style={{ fontSize:10, color:T.textDim, marginTop:3 }}>{pct}% écoulé</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dépenses générales */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ fontSize:10, color:T.textDim, letterSpacing:2, textTransform:"uppercase" }}>Dépenses générales</div>
        <Btn small onClick={()=>setModalDep({id:null,libelle:"",montant:"",categorie:"Impression",date:""})}>+ Ajouter</Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {depenses.map(dep=>(
          <div key={dep.id} style={{ background:T.bg1, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, color:T.text, marginBottom:3 }}>{dep.libelle}</div>
              <div style={{ display:"flex", gap:6 }}>
                <Badge label={dep.categorie} color={T.violet} />
                {dep.date && <span style={{ fontSize:10, color:T.textDim }}>{fmtDate(dep.date)}</span>}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:15, fontWeight:700, color:T.danger, fontFamily:"'DM Mono',monospace" }}>-{fmtEur(dep.montant)}</div>
              <button onClick={()=>delDep(dep.id)} style={{ background:"none", border:"none", color:T.textDim, cursor:"pointer", fontSize:16 }}>×</button>
            </div>
          </div>
        ))}
        {depenses.length===0 && <div style={{ color:T.textDim, fontSize:13 }}>Aucune dépense enregistrée</div>}
      </div>
      {totalDep>0 && <div style={{ fontSize:12, color:T.danger, marginTop:10, textAlign:"right" }}>Total dépenses : -{fmtEur(totalDep)}</div>}

      {modalDep && (
        <Modal title={modalDep.id?"Modifier la dépense":"Nouvelle dépense"} onClose={()=>setModalDep(null)}>
          <Input label="Libellé" value={modalDep.libelle} onChange={v=>setModalDep(m=>({...m,libelle:v}))} placeholder="ex: Commande StickerMule" />
          <Input label="Montant (€)" value={modalDep.montant} onChange={v=>setModalDep(m=>({...m,montant:v}))} type="number" placeholder="ex: 85" />
          <Select label="Catégorie" value={modalDep.categorie} onChange={v=>setModalDep(m=>({...m,categorie:v}))} options={DEP_CATS} />
          <Input label="Date" value={modalDep.date} onChange={v=>setModalDep(m=>({...m,date:v}))} type="date" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModalDep(null)}>Annuler</Btn>
            <Btn onClick={()=>saveDep(modalDep)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MODULE: DESIGNS ───────────────────────────────────────────────
function Designs({ data, setData }) {
  const [modal, setModal] = useState(null);
  const designs = data.designs || [];
  const DESIGN_STATUTS = ["Concept","En cours","Finalisé","Validé","Imprimé"];
  const FORMATS = ["Die-cut","Rectangle","Rond","Holographique","Vinyle mat","Vinyle brillant"];

  const save = form => {
    setData(d=>{
      const id = form.id||d.nextId;
      const designs = form.id ? d.designs.map(x=>x.id===form.id?{...form}:x) : [...d.designs,{...form,id}];
      return {...d, designs, nextId:form.id?d.nextId:d.nextId+1};
    });
    setModal(null);
  };
  const del = id => { if(!confirm("Supprimer ?"))return; setData(d=>({...d,designs:d.designs.filter(x=>x.id!==id)})); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase" }}>Module</div>
          <div style={{ fontSize:22, fontWeight:800, color:T.text }}>Mes <span style={{ color:T.green }}>Designs</span></div>
        </div>
        <Btn onClick={()=>setModal({id:null,nom:"",statut:"Concept",format:"Die-cut",drop:"",notes:""})}>+ Ajouter</Btn>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {designs.map(d=>(
          <NeonCard key={d.id} accent={STATUT_ACCENT[d.statut]||T.green} style={{ textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:8, color:T.green, textShadow:`0 0 20px ${T.green}` }}>◇</div>
            <div style={{ fontWeight:700, fontSize:13, color:T.text, marginBottom:6 }}>{d.nom}</div>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:6 }}><Badge label={d.statut} /></div>
            {d.format && <div style={{ fontSize:10, color:T.textDim, marginBottom:10 }}>{d.format}</div>}
            <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
              <Btn small onClick={()=>setModal({...d})}>✎</Btn>
              <Btn small variant="danger" onClick={()=>del(d.id)}>×</Btn>
            </div>
          </NeonCard>
        ))}
        {designs.length===0 && <div style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 0", color:T.textDim }}>Aucun design — crée le premier ↗</div>}
      </div>
      {modal && (
        <Modal title={modal.id?"Modifier":"Nouveau design"} onClose={()=>setModal(null)}>
          <Input label="Nom du design" value={modal.nom} onChange={v=>setModal(m=>({...m,nom:v}))} placeholder="ex: Chaos Cat v1" />
          <Select label="Statut" value={modal.statut} onChange={v=>setModal(m=>({...m,statut:v}))} options={DESIGN_STATUTS} />
          <Select label="Format" value={modal.format} onChange={v=>setModal(m=>({...m,format:v}))} options={FORMATS} />
          <Input label="Drop associé" value={modal.drop} onChange={v=>setModal(m=>({...m,drop:v}))} placeholder="ex: Drop 01" />
          <Textarea label="Notes créa" value={modal.notes} onChange={v=>setModal(m=>({...m,notes:v}))} />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn onClick={()=>save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MODULE: TÂCHES ────────────────────────────────────────────────
function Taches({ data, setData }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Tous");
  const taches = data.taches || [];
  const filtered = filter==="Tous" ? taches : taches.filter(t=>t.statut===filter);

  const save = form => {
    setData(d=>{
      const id = form.id||d.nextId;
      const taches = form.id ? d.taches.map(x=>x.id===form.id?{...form}:x) : [...d.taches,{...form,id}];
      return {...d, taches, nextId:form.id?d.nextId:d.nextId+1};
    });
    setModal(null);
  };

  const toggle = t => {
    const next = t.statut==="À faire"?"En cours":t.statut==="En cours"?"Fait":"À faire";
    setData(d=>({...d,taches:d.taches.map(x=>x.id===t.id?{...x,statut:next}:x)}));
  };

  const del = id => { if(!confirm("Supprimer ?"))return; setData(d=>({...d,taches:d.taches.filter(x=>x.id!==id)})); };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:10, color:T.textDim, letterSpacing:3, textTransform:"uppercase" }}>Module</div>
          <div style={{ fontSize:22, fontWeight:800, color:T.text }}>Mes <span style={{ color:T.violet }}>Tâches</span></div>
        </div>
        <Btn variant="violet" onClick={()=>setModal({id:null,tache:"",module:"Drops",priorite:"Moyenne",deadline:"",statut:"À faire"})}>+ Ajouter</Btn>
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
        {["Tous",...TACHE_STATUTS].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:"5px 12px", borderRadius:20, fontSize:11, cursor:"pointer", background:filter===s?T.violetDim:T.bg1, border:`1px solid ${filter===s?T.violet:T.border}`, color:filter===s?T.violet:T.textDim }}>
            {s}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map(t=>(
          <div key={t.id} style={{ background:T.bg1, border:`1px solid ${t.statut==="Fait"?T.border:T.border2}`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12, alignItems:"center", opacity:t.statut==="Fait"?0.5:1 }}>
            <button onClick={()=>toggle(t)} style={{ width:24, height:24, borderRadius:6, border:`1px solid ${STATUT_ACCENT[t.statut]||T.border2}`, background:t.statut==="Fait"?T.green:t.statut==="En cours"?"#ffaa0033":"transparent", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:T.text, fontSize:11 }}>
              {t.statut==="Fait"?"✓":t.statut==="En cours"?"▶":""}
            </button>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, color:t.statut==="Fait"?T.textDim:T.text, textDecoration:t.statut==="Fait"?"line-through":"none", marginBottom:5 }}>{t.tache}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Badge label={t.priorite} />
                <Badge label={t.module} color={T.violet} />
                {t.deadline && <span style={{ fontSize:10, color:T.textDim }}>{fmtDate(t.deadline)}</span>}
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <Btn small onClick={()=>setModal({...t})}>✎</Btn>
              <Btn small variant="danger" onClick={()=>del(t.id)}>×</Btn>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:T.textDim }}>Aucune tâche</div>}
      </div>

      {modal && (
        <Modal title={modal.id?"Modifier":"Nouvelle tâche"} onClose={()=>setModal(null)}>
          <Input label="Tâche" value={modal.tache} onChange={v=>setModal(m=>({...m,tache:v}))} placeholder="ex: Contacter LucieDraws" />
          <Select label="Module" value={modal.module} onChange={v=>setModal(m=>({...m,module:v}))} options={TACHE_MODULES} />
          <Select label="Priorité" value={modal.priorite} onChange={v=>setModal(m=>({...m,priorite:v}))} options={PRIORITES} />
          <Select label="Statut" value={modal.statut} onChange={v=>setModal(m=>({...m,statut:v}))} options={TACHE_STATUTS} />
          <Input label="Deadline" value={modal.deadline} onChange={v=>setModal(m=>({...m,deadline:v}))} type="date" />
          <div style={{ display:"flex", gap:10, marginTop:8 }}>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
            <Btn variant="violet" onClick={()=>save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(()=>load()||DEF);
  const [module, setModule] = useState("home");

  useEffect(()=>{ save(data); },[data]);

  const render = () => {
    switch(module) {
      case "home":         return <Home data={data} setModule={setModule} />;
      case "drops":        return <Drops data={data} setData={setData} />;
      case "partenariats": return <Partenariats data={data} setData={setData} />;
      case "finance":      return <Finance data={data} setData={setData} />;
      case "designs":      return <Designs data={data} setData={setData} />;
      case "taches":       return <Taches data={data} setData={setData} />;
      default:             return <Home data={data} setModule={setModule} />;
    }
  };

  return (
    <div style={{ background:T.bg, minHeight:"100vh", color:T.text, fontFamily:"'DM Sans',sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:90 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ padding:"28px 20px 20px" }}>{render()}</div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"rgba(8,8,8,0.97)", borderTop:`1px solid ${T.border}`, backdropFilter:"blur(20px)", padding:"10px 4px 22px", display:"flex", justifyContent:"space-around", zIndex:100 }}>
        {MODULES.map(m=>{
          const active = module===m.id;
          return (
            <button key={m.id} onClick={()=>setModule(m.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"6px 8px", borderRadius:10, minWidth:52 }}>
              <span style={{ fontSize:17, color:active?T.green:"#2a2a2a", textShadow:active?`0 0 12px ${T.green}`:""  }}>{m.icon}</span>
              <span style={{ fontSize:9, color:active?T.green:"#333", fontWeight:active?700:400, letterSpacing:0.5, textTransform:"uppercase" }}>{m.label}</span>
              {active && <div style={{ width:16, height:2, background:T.green, borderRadius:2, boxShadow:`0 0 6px ${T.green}` }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
