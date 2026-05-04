import { useState, useEffect } from "react";

const T = {
  bg:"#080808",bg1:"#0d0d0d",bg2:"#111111",border:"#1a1a1a",border2:"#252525",
  green:"#39ff14",violet:"#b44fff",greenDim:"#39ff1422",violetDim:"#b44fff22",
  text:"#ffffff",textDim:"#555555",textMid:"#999999",danger:"#ff4444",amber:"#ffaa00",cyan:"#00cfff",
};

const KEY = "stickerslab_v7";
function load() { try { const r=localStorage.getItem(KEY); return r?JSON.parse(r):null; } catch { return null; } }
function save(d) { try { localStorage.setItem(KEY,JSON.stringify(d)); } catch {} }

const STATUTS = ["À contacter","En attente de réponse","Relancer","Collab confirmée","Drop en cours","Terminé","Archivé"];
const STATUTS_ACTIFS = STATUTS.filter(s=>s!=="Archivé");

const STATUT_NEXT = {
  "À contacter":"En attente de réponse",
  "En attente de réponse":"Relancer",
  "Relancer":"Collab confirmée",
  "Collab confirmée":"Drop en cours",
  "Drop en cours":"Terminé",
  "Terminé":"Archivé",
  "Archivé":"À contacter",
};

const SACENT = {
  "À contacter":T.violet,
  "En attente de réponse":T.amber,
  "Relancer":"#ff4db8",
  "Collab confirmée":T.green,
  "Drop en cours":T.cyan,
  "Terminé":T.textMid,
  "Archivé":T.textDim,
};

const PLATEFORMES = ["Instagram","TikTok","YouTube","Twitch","Pinterest","Autre"];
const UNIVERS = ["Illustration","Gaming","Humour","Manga","Street/Skate","Culture pop","Autre"];
const TYPES = ["Collab artistique","Licensing"];
const CONTENUS = ["Motivation","Spiritualité","Gaming","Humour","Lifestyle","Fitness","Art","Musique","Mode","Cuisine","Voyage","Tech","Éducation","Autre"];

const MY_INSTAGRAM = "https://www.instagram.com/stickerslab.officiel?igsh=ZTBsaDFjM3N3MjBr&utm_source=qr";

const fmtEur = n => n!==""&&n!==null&&n!==undefined ? `${parseFloat(n).toFixed(0)}€` : "—";
const fmtDateShort = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : "—";
const fmtDateLong = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "_______________";
const today = () => new Date().toISOString().split("T")[0];
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r.toISOString().split("T")[0]; };
const daysDiff = d => { if(!d)return null; return Math.floor((new Date(d)-new Date())/(1000*60*60*24)); };
const isConfirmed = c => ["Collab confirmée","Drop en cours","Terminé"].includes(c.statut);

const DEF = {
  collabs:[
    {id:1,nom:"LucieDraws",instagram:"https://instagram.com/luciedraws",plateforme:"Instagram",followers:"45k",engagement:"4.8",univers:"Illustration",type:"Collab artistique",statut:"Collab confirmée",dateContact:today(),delaiRelance:7,notes:"Fan de stickers, communauté très engagée",contenus:["Art","Lifestyle"],deal:{prix:"4.50",quantite:"100",pourcentage:"30"},contrat:{notesSup:""}},
    {id:2,nom:"PixelTom",instagram:"https://instagram.com/pixeltom",plateforme:"Instagram",followers:"80k",engagement:"3.2",univers:"Gaming",type:"Collab artistique",statut:"En attente de réponse",dateContact:today(),delaiRelance:7,notes:"",contenus:["Gaming","Humour"],deal:{},contrat:{notesSup:""}},
  ],
  finance:{objectifCA:5000,depenses:[]},
  nextId:100,
};

const MODULES = [
  { id:"home",    icon:"🚚", label:"Hub",      iconColor:T.green  },
  { id:"collabs", icon:"⚡", label:"Collabs",  iconColor:T.violet },
  { id:"finance", icon:"$",  label:"Finance",  iconColor:T.green  },
];

// ── WORD GENERATOR ────────────────────────────────────────────────
async function genWordContrat(c) {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat, UnderlineType
  } = await import("https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js");

  const deal=c.deal||{};const ct=c.contrat||{};
  const pct=parseFloat(deal.pourcentage||30);const partSL=100-pct;
  const revEstime=deal.prix&&deal.quantite?Math.round(parseFloat(deal.prix)*parseInt(deal.quantite)):null;
  const gainCreateur=revEstime?Math.round(revEstime*pct/100):null;

  const bd={style:BorderStyle.SINGLE,size:4,color:"333333"};
  const borders={top:bd,bottom:bd,left:bd,right:bd};
  const nb={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
  const noBorders={top:nb,bottom:nb,left:nb,right:nb};
  const sp={before:80,after:80};

  const hr=()=>new Paragraph({spacing:{before:100,after:100},border:{bottom:{style:BorderStyle.SINGLE,size:6,color:"222222",space:1}},children:[]});
  const empty=()=>new Paragraph({spacing:{before:60,after:60},children:[]});
  const ttl=t=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:60},children:[new TextRun({text:t,bold:true,size:32,font:"Arial"})]});
  const sub=t=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:0,after:240},children:[new TextRun({text:t,size:22,font:"Arial",italics:true,color:"444444"})]});
  const sec=(n,t)=>new Paragraph({spacing:{before:280,after:100},children:[new TextRun({text:`${n}. `,bold:true,size:24,font:"Arial"}),new TextRun({text:t,bold:true,size:24,font:"Arial",underline:{type:UnderlineType.SINGLE}})]});
  const fld=(label,val)=>new Paragraph({spacing:sp,children:[new TextRun({text:`${label} : `,bold:true,size:20,font:"Arial"}),new TextRun({text:val||"_______________",size:20,font:"Arial"})]});
  const body=t=>new Paragraph({spacing:sp,alignment:AlignmentType.JUSTIFIED,children:[new TextRun({text:t,size:20,font:"Arial"})]});
  const blt=t=>new Paragraph({numbering:{reference:"bullets",level:0},spacing:sp,children:[new TextRun({text:t,size:20,font:"Arial"})]});

  const hasSup=(ct.notesSup||"").trim().length>0;
  const sigNum=hasSup?"11":"10";

  const doc=new Document({
    numbering:{config:[{reference:"bullets",levels:[{level:0,format:LevelFormat.BULLET,text:"—",alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:360}}}}]}]},
    styles:{default:{document:{run:{font:"Arial",size:20}}}},
    sections:[{
      properties:{page:{size:{width:11906,height:16838},margin:{top:1440,right:1440,bottom:1440,left:1440}}},
      children:[
        ttl("STICKERS LAB"),sub("Contrat de collaboration — Édition de stickers personnalisés"),hr(),empty(),
        sec("1","Parties au contrat"),
        new Paragraph({spacing:sp,children:[new TextRun({text:"Le Créateur (Influenceur)",bold:true,size:20,font:"Arial"})]}),
        fld("Nom / Pseudo",c.nom),fld("Plateforme",c.plateforme),fld("URL de la page",c.instagram),
        empty(),
        new Paragraph({spacing:sp,children:[new TextRun({text:"Le Prestataire",bold:true,size:20,font:"Arial"})]}),
        body("Stickers Lab — Production, gestion des ventes et logistique"),
        fld("Représenté par","M. Besnard Florian"),fld("Email","Collabstickerslab@gmail.com"),
        empty(),hr(),
        sec("2","Objet du contrat"),
        body("Le présent contrat définit les conditions de collaboration entre le Créateur et Stickers Lab dans le cadre de la création, fabrication et commercialisation d'une collection de stickers personnalisés en lien avec l'identité visuelle et l'audience du Créateur."),
        empty(),
        fld("Prix unitaire du pack",deal.prix?`${deal.prix} €`:undefined),
        fld("Nombre de packs",deal.quantite||undefined),
        ...(revEstime?[fld("Revenu estimé (sold out)",`${revEstime} €`)]: []),
        empty(),hr(),
        sec("3","Répartition des revenus"),empty(),
        new Table({
          width:{size:9026,type:WidthType.DXA},columnWidths:[3000,2000,4026],
          rows:[
            new TableRow({tableHeader:true,children:[
              new TableCell({borders,width:{size:3000,type:WidthType.DXA},shading:{fill:"222222",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Partie",bold:true,size:20,font:"Arial",color:"FFFFFF"})]})]})  ,
              new TableCell({borders,width:{size:2000,type:WidthType.DXA},shading:{fill:"222222",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Part",bold:true,size:20,font:"Arial",color:"FFFFFF"})]})]})  ,
              new TableCell({borders,width:{size:4026,type:WidthType.DXA},shading:{fill:"222222",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Rôle",bold:true,size:20,font:"Arial",color:"FFFFFF"})]})]})  ,
            ]}),
            new TableRow({children:[
              new TableCell({borders,width:{size:3000,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Créateur",size:20,font:"Arial"})]})]})  ,
              new TableCell({borders,width:{size:2000,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:`${pct} %`,bold:true,size:20,font:"Arial"})]})]})  ,
              new TableCell({borders,width:{size:4026,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Promotion & audience",size:20,font:"Arial"})]})]})  ,
            ]}),
            new TableRow({children:[
              new TableCell({borders,width:{size:3000,type:WidthType.DXA},shading:{fill:"F5F5F5",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Stickers Lab",size:20,font:"Arial"})]})]})  ,
              new TableCell({borders,width:{size:2000,type:WidthType.DXA},shading:{fill:"F5F5F5",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:`${partSL} %`,bold:true,size:20,font:"Arial"})]})]})  ,
              new TableCell({borders,width:{size:4026,type:WidthType.DXA},shading:{fill:"F5F5F5",type:ShadingType.CLEAR},margins:{top:80,bottom:80,left:120,right:120},children:[new Paragraph({children:[new TextRun({text:"Production, vente, logistique",size:20,font:"Arial"})]})]})  ,
            ]}),
          ]
        }),
        empty(),
        body("Les revenus nets correspondent au chiffre d'affaires total encaissé, déduction faite des frais de production, d'impression, d'emballage et de livraison. La part du Créateur lui est versée en fin de mois, accompagnée d'un récapitulatif des ventes détaillé."),
        ...(gainCreateur?[empty(),new Paragraph({spacing:sp,children:[new TextRun({text:"Estimation si sold out : ",bold:true,size:20,font:"Arial"}),new TextRun({text:`${gainCreateur} € pour le Créateur`,size:20,font:"Arial"})]})]: []),
        empty(),hr(),
        sec("4","Obligations de Stickers Lab"),
        blt("Création graphique des stickers en accord avec l'identité visuelle du Créateur"),
        blt("Fabrication et contrôle qualité des stickers"),
        blt("Gestion de la boutique en ligne et des commandes"),
        blt("Expédition des commandes aux clients finaux"),
        blt("Service client et gestion des retours"),
        blt("Transmission mensuelle d'un rapport de ventes"),
        empty(),hr(),
        sec("5","Obligations du Créateur"),
        blt("Promotion de la collection auprès de son audience (stories, posts, lien en bio)"),
        blt("Validation des designs dans un délai de 5 jours ouvrés"),
        blt("Ne pas promouvoir de collections de stickers concurrentes pendant la durée du contrat"),
        empty(),hr(),
        sec("6","Validation des designs"),
        body("Stickers Lab soumet les designs au Créateur avant toute mise en production. Le Créateur dispose de 5 jours ouvrés pour valider ou demander des modifications. Sans retour dans ce délai, les designs sont considérés comme validés."),
        empty(),body("Toute modification demandée après validation et mise en production pourra entraîner des frais supplémentaires."),
        empty(),hr(),
        sec("7","Propriété intellectuelle"),
        body("Les designs créés par Stickers Lab pour cette collaboration restent la propriété de Stickers Lab. Le Créateur accorde à Stickers Lab le droit d'utiliser son nom, pseudo et identité visuelle dans le cadre exclusif de cette collaboration."),
        empty(),hr(),
        sec("8","Durée et résiliation"),
        body("Le contrat peut être résilié par l'une ou l'autre des parties avec un préavis de 30 jours par écrit. En cas de résiliation, les commandes en cours sont honorées. Le stock restant est liquidé et les bénéfices partagés selon la répartition définie à l'article 3."),
        empty(),hr(),
        sec("9","Confidentialité"),
        body("Les deux parties s'engagent à garder confidentielles les informations commerciales, financières et stratégiques échangées dans le cadre de cette collaboration."),
        empty(),hr(),
        ...(hasSup?[sec("10","Conditions particulières"),body(ct.notesSup),empty(),hr()]: []),
        sec(sigNum,"Signatures"),
        body("Lu et approuvé par les deux parties :"),
        empty(),empty(),
        new Table({
          width:{size:9026,type:WidthType.DXA},columnWidths:[4513,4513],
          rows:[
            new TableRow({children:[
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:120},children:[new Paragraph({children:[new TextRun({text:"Le Créateur (Influenceur)",bold:true,size:20,font:"Arial"})]})]})  ,
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:0},children:[new Paragraph({children:[new TextRun({text:"Stickers Lab (Prestataire)",bold:true,size:20,font:"Arial"})]})]})  ,
            ]}),
            new TableRow({children:[
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:120},children:[fld("Nom",c.nom)]}),
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:0},children:[fld("Nom","Besnard Florian")]}),
            ]}),
            new TableRow({children:[
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:0,right:120},children:[fld("Date","_______________")]}),
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:80,bottom:80,left:120,right:0},children:[fld("Date","_______________")]}),
            ]}),
            new TableRow({children:[
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:160,bottom:80,left:0,right:120},children:[
                new Paragraph({spacing:sp,children:[new TextRun({text:"Signature :",size:20,font:"Arial"})]}),
                new Paragraph({spacing:{before:480,after:0},border:{bottom:{style:BorderStyle.SINGLE,size:4,color:"333333"}},children:[]}),
              ]}),
              new TableCell({borders:noBorders,width:{size:4513,type:WidthType.DXA},margins:{top:160,bottom:80,left:120,right:0},children:[
                new Paragraph({spacing:sp,children:[new TextRun({text:"Signature :",size:20,font:"Arial"})]}),
                new Paragraph({spacing:{before:480,after:0},border:{bottom:{style:BorderStyle.SINGLE,size:4,color:"333333"}},children:[]}),
              ]}),
            ]}),
          ]
        }),
        empty(),empty(),
        new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:240,after:0},children:[new TextRun({text:`Document généré par StickersLab Business Hub — ${new Date().toLocaleDateString("fr-FR")}`,size:16,font:"Arial",color:"999999",italics:true})]}),
      ]
    }]
  });

  const buf=await Packer.toBlob(doc);
  const url=URL.createObjectURL(buf);
  const a=document.createElement("a");
  a.href=url;a.download=`Contrat_${(c.nom||"Partenaire").replace(/\s+/g,"_")}_StickersLab.docx`;
  a.click();URL.revokeObjectURL(url);
}

// ── BASE COMPONENTS ───────────────────────────────────────────────
function Badge({label,color}){
  const c=color||SACENT[label]||T.textDim;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:c+"22",border:`1px solid ${c}55`,color:c,borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}><span style={{width:4,height:4,borderRadius:"50%",background:c}}/>{label}</span>;
}
function NeonCard({children,accent,style,onClick}){
  const c=accent||T.green;
  return <div onClick={onClick} style={{background:T.bg1,border:`1px solid ${c}33`,borderRadius:14,padding:"18px 20px",boxShadow:`0 0 20px ${c}0a`,cursor:onClick?"pointer":"default",...style}}>{children}</div>;
}
function StatCard({label,value,accent,sub}){
  const c=accent||T.green;
  return <div style={{background:T.bg1,border:`1px solid ${c}33`,borderRadius:14,padding:"14px 16px",flex:1,minWidth:80}}><div style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'DM Mono',monospace",letterSpacing:-1}}>{value}</div><div style={{fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:2,marginTop:3}}>{label}</div>{sub&&<div style={{fontSize:11,color:T.textMid,marginTop:3}}>{sub}</div>}</div>;
}
function Input({label,value,onChange,type="text",placeholder}){
  return <div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</label>}<input type={type} value={value||""} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 13px",color:T.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></div>;
}
function Select({label,value,onChange,options}){
  return <div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</label>}<select value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 13px",color:T.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select></div>;
}
function Textarea({label,value,onChange,placeholder,rows=3}){
  return <div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</label>}<textarea value={value||""} rows={rows} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border2}`,borderRadius:8,padding:"10px 13px",color:T.text,fontSize:14,boxSizing:"border-box",outline:"none",fontFamily:"inherit",resize:"vertical"}}/></div>;
}
function MultiSelect({label,value=[],onChange,options}){
  const toggle=o=>onChange(value.includes(o)?value.filter(v=>v!==o):[...value,o]);
  return <div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{label}</label>}<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{options.map(o=><button key={o} onClick={()=>toggle(o)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,cursor:"pointer",background:value.includes(o)?T.violetDim:T.bg1,border:`1px solid ${value.includes(o)?T.violet:T.border2}`,color:value.includes(o)?T.violet:T.textDim}}>{o}</button>)}</div></div>;
}
function Btn({children,onClick,variant="primary",small,loading}){
  const S={primary:{bg:T.green,border:"none",color:"#000",fw:700},violet:{bg:T.violet,border:"none",color:"#fff",fw:700},ghost:{bg:"transparent",border:`1px solid ${T.border2}`,color:T.textMid,fw:400},danger:{bg:"transparent",border:`1px solid ${T.danger}44`,color:T.danger,fw:400}};
  const s=S[variant]||S.primary;
  return <button onClick={onClick} disabled={loading} style={{padding:small?"6px 13px":"11px 20px",background:s.bg,border:s.border,borderRadius:9,color:s.color,fontSize:small?11:14,fontWeight:s.fw,cursor:loading?"wait":"pointer",fontFamily:"inherit",opacity:loading?0.7:1}}>{loading?"⏳ Génération...":children}</button>;
}
function Modal({title,onClose,children}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{background:T.bg2,borderTop:`1px solid ${T.border2}`,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,padding:"24px 24px 40px",maxHeight:"92vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div style={{fontSize:17,fontWeight:700,color:T.text}}>{title}</div><button onClick={onClose} style={{background:T.bg1,border:`1px solid ${T.border2}`,borderRadius:8,color:T.textDim,fontSize:18,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>{children}</div></div>;
}
function Logo({size=32}){
  return <div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:size,height:size,borderRadius:size*0.25,background:`linear-gradient(135deg,${T.violet},${T.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.55,boxShadow:`0 0 16px ${T.green}55`}}>⬡</div>
    <div>
      <div style={{fontSize:size*0.5,fontWeight:800,color:T.text,letterSpacing:-0.5,lineHeight:1}}>Stickers<span style={{color:T.green}}>Lab</span></div>
      {size>28&&<div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase"}}>Business Hub</div>}
    </div>
  </div>;
}

// ── MODULE: HOME ──────────────────────────────────────────────────
function Home({data,setModule}){
  const collabs=data.collabs||[];
  const fin=data.finance||{};

  const actives=collabs.filter(c=>!["Terminé","Archivé"].includes(c.statut)).length;
  const aRelancer=collabs.filter(c=>{
    if(c.statut!=="En attente de réponse")return false;
    return today()>=addDays(c.dateContact,c.delaiRelance||7);
  }).length;
  const totalEstime=collabs.filter(c=>["Collab confirmée","Drop en cours","Terminé"].includes(c.statut)).reduce((s,c)=>{
    const d=c.deal||{};return s+(parseFloat(d.prix||0)*parseInt(d.quantite||0));
  },0);
  const objectif=fin.objectifCA||0;
  const pctCA=objectif>0?Math.min(100,Math.round((totalEstime/objectif)*100)):0;

  return <div>
    <div style={{marginBottom:24}}><Logo size={36}/></div>

    {/* Lien Instagram StickersLab */}
    <a href={MY_INSTAGRAM} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:"#E1306C11",border:"1px solid #E1306C33",borderRadius:12,padding:"12px 16px",textDecoration:"none",marginBottom:20}}>
      <span style={{fontSize:20}}>📷</span>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:"#E1306C"}}>Mon Instagram</div>
        <div style={{fontSize:11,color:T.textDim}}>@stickerslab.officiel</div>
      </div>
      <span style={{marginLeft:"auto",fontSize:12,color:T.textDim}}>→</span>
    </a>

    {/* Alerte relance */}
    {aRelancer>0&&<div style={{background:"#ff4db822",border:"1px solid #ff4db855",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"center",cursor:"pointer"}} onClick={()=>setModule("collabs")}>
      <span style={{fontSize:20}}>🔔</span>
      <div><div style={{fontSize:13,fontWeight:700,color:"#ff4db8"}}>{aRelancer} collab{aRelancer>1?"s":""} à relancer !</div><div style={{fontSize:11,color:T.textMid}}>Appuie pour voir →</div></div>
    </div>}

    {/* Stats */}
    <div style={{display:"flex",gap:10,marginBottom:16}}>
      <StatCard label="Collabs actives" value={actives} accent={T.violet}/>
      <StatCard label="CA estimé" value={totalEstime>0?`${Math.round(totalEstime)}€`:"—"} accent={T.green}/>
    </div>

    {/* Objectif CA */}
    {objectif>0&&<NeonCard accent={T.green} style={{marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase"}}>Objectif CA</div>
        <div style={{fontSize:12,color:T.green,fontFamily:"'DM Mono',monospace"}}>{Math.round(totalEstime)}€ / {objectif}€</div>
      </div>
      <div style={{background:T.bg,borderRadius:6,height:6,overflow:"hidden"}}><div style={{width:`${pctCA}%`,height:"100%",background:`linear-gradient(90deg,${T.violet},${T.green})`,borderRadius:6,boxShadow:`0 0 8px ${T.green}`}}/></div>
      <div style={{fontSize:11,color:T.textDim,marginTop:6}}>{pctCA}% atteint</div>
    </NeonCard>}

    {/* Pipeline */}
    <div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Pipeline</div>
    {STATUTS_ACTIFS.map(s=>{
      const n=collabs.filter(c=>c.statut===s).length;
      const color=SACENT[s]||T.textDim;
      return <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:T.bg1,border:`1px solid ${n>0?color+"33":T.border}`,borderRadius:10,marginBottom:6,cursor:"pointer"}} onClick={()=>setModule("collabs")}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:n>0?color:T.border2,display:"inline-block"}}/>
          <span style={{fontSize:13,color:n>0?T.text:T.textDim}}>{s}</span>
        </div>
        <span style={{fontSize:13,fontWeight:700,color:n>0?color:T.textDim,fontFamily:"'DM Mono',monospace"}}>{n}</span>
      </div>;
    })}
  </div>;
}

// ── MODULE: COLLABS ───────────────────────────────────────────────
function Collabs({data,setData}){
  const [modal,setModal]=useState(null);
  const [detail,setDetail]=useState(null);
  const [filter,setFilter]=useState("Tous");
  const [genLoading,setGenLoading]=useState(false);
  const collabs=data.collabs||[];

  const aRelancer=collabs.filter(c=>{
    if(c.statut!=="En attente de réponse")return false;
    return today()>=addDays(c.dateContact,c.delaiRelance||7);
  });

  // "Tous" exclut les archivés
  const filtered=filter==="Tous"
    ?collabs.filter(c=>c.statut!=="Archivé")
    :collabs.filter(c=>c.statut===filter);

  const blank=()=>({id:null,nom:"",instagram:"",plateforme:"Instagram",followers:"",engagement:"",univers:"Illustration",type:"Collab artistique",statut:"À contacter",dateContact:today(),delaiRelance:7,notes:"",contenus:[],deal:{},contrat:{notesSup:""}});

  const save=form=>{
    setData(d=>{
      const id=form.id||d.nextId;
      const collabs=form.id?d.collabs.map(x=>x.id===form.id?{...form}:x):[...(d.collabs||[]),{...form,id}];
      return {...d,collabs,nextId:form.id?d.nextId:d.nextId+1};
    });
    setModal(null);
    if(detail&&form.id===detail.id)setDetail({...form});
  };

  const del=id=>{if(!confirm("Supprimer ?"))return;setData(d=>({...d,collabs:(d.collabs||[]).filter(x=>x.id!==id)}));setDetail(null);};

  const nextStatut=c=>{
    const next=STATUT_NEXT[c.statut]||c.statut;
    const updated={...c,statut:next};
    setData(d=>({...d,collabs:d.collabs.map(x=>x.id===c.id?updated:x)}));
    if(detail&&detail.id===c.id)setDetail(updated);
  };

  const downloadContrat=async c=>{setGenLoading(true);try{await genWordContrat(c);}catch(e){alert("Erreur : "+e.message);}setGenLoading(false);};
  const engColor=v=>{const n=parseFloat(v);if(!n)return T.textDim;return n>=5?T.green:n>=3?T.amber:T.danger;};

  // Tableau de bord collabs
  const nbParStatut=STATUTS_ACTIFS.reduce((acc,s)=>({...acc,[s]:collabs.filter(c=>c.statut===s).length}),{});
  const totalConfirmes=collabs.filter(c=>["Collab confirmée","Drop en cours"].includes(c.statut)).length;
  const caEstime=collabs.filter(c=>["Collab confirmée","Drop en cours","Terminé"].includes(c.statut)).reduce((s,c)=>{const d=c.deal||{};return s+(parseFloat(d.prix||0)*parseInt(d.quantite||0));},0);

  // ── DETAIL VIEW ─────────────────────────────────────────────────
  if(detail){
    const c=collabs.find(x=>x.id===detail.id)||detail;
    const deal=c.deal||{};
    const revEstime=deal.prix&&deal.quantite?Math.round(parseFloat(deal.prix)*parseInt(deal.quantite)):null;
    const gainCreateur=revEstime&&deal.pourcentage?Math.round(revEstime*parseFloat(deal.pourcentage)/100):null;
    const gainSL=revEstime&&gainCreateur?revEstime-gainCreateur:null;

    return <div>
      <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:T.green,cursor:"pointer",fontSize:13,marginBottom:16,padding:0,display:"flex",alignItems:"center",gap:6}}>← Collabs</button>

      <NeonCard accent={SACENT[c.statut]||T.violet} style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:4}}>{c.nom}</div>
            <div style={{fontSize:11,color:T.textDim}}>{c.plateforme}{c.followers?` · ${c.followers} followers`:""}</div>
          </div>
          <Badge label={c.statut}/>
        </div>

        {c.instagram&&<a href={c.instagram.startsWith("http")?c.instagram:`https://${c.instagram}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"#E1306C22",border:"1px solid #E1306C44",borderRadius:8,padding:"6px 12px",fontSize:12,color:"#E1306C",textDecoration:"none",marginBottom:10}}>
          📷 Ouvrir Instagram
        </a>}

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:(c.contenus?.length||c.notes)?10:0}}>
          {c.univers&&<Badge label={c.univers} color={T.violet}/>}
          {c.type&&<Badge label={c.type} color={T.green}/>}
          {c.engagement&&<span style={{fontSize:12,color:engColor(c.engagement),fontFamily:"'DM Mono',monospace"}}>◈ {c.engagement}%</span>}
        </div>

        {c.contenus?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:c.notes?10:0}}>
          {c.contenus.map(ct=><span key={ct} style={{fontSize:10,background:T.violetDim,border:`1px solid ${T.violet}33`,color:T.violet,borderRadius:6,padding:"2px 8px"}}>{ct}</span>)}
        </div>}

        {c.notes&&<div style={{fontSize:12,color:T.textMid,borderTop:`1px solid ${T.border}`,paddingTop:8,marginTop:8,lineHeight:1.6}}>{c.notes}</div>}
      </NeonCard>

      {/* Actions rapides */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {c.statut!=="Archivé"&&<Btn small onClick={()=>nextStatut(c)}>→ {STATUT_NEXT[c.statut]}</Btn>}
        <Btn small variant="ghost" onClick={()=>setModal({...c})}>✎ Modifier</Btn>
        <Btn small variant="danger" onClick={()=>del(c.id)}>Supprimer</Btn>
      </div>

      {/* Alerte relance */}
      {c.statut==="En attente de réponse"&&(()=>{
        const relanceDate=addDays(c.dateContact,c.delaiRelance||7);
        const diff=daysDiff(relanceDate);
        const urgent=diff<=0;const bientot=diff>0&&diff<=2;
        return <div style={{background:urgent?"#ff4db811":bientot?"#ffaa0011":T.bg1,border:`1px solid ${urgent?"#ff4db833":bientot?"#ffaa0033":T.border}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:12,color:urgent?"#ff4db8":bientot?T.amber:T.textMid}}>
            {urgent?`🔴 Relance due depuis ${Math.abs(diff)}j`:bientot?`🟡 Relance dans ${diff}j`:`Relance prévue le ${fmtDateShort(relanceDate)}`}
          </div>
        </div>;
      })()}

      {/* Deal */}
      {isConfirmed(c)&&<>
        <div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>💰 Le Deal</div>
        <NeonCard accent={T.green} style={{marginBottom:12}}>
          {deal.prix||deal.quantite?<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
              {[{l:"Prix du pack",v:deal.prix?`${deal.prix}€`:"—"},{l:"Nb de packs",v:deal.quantite||"—"},{l:"Part créateur",v:deal.pourcentage?`${deal.pourcentage}%`:"—"}].map(({l,v})=>(
                <div key={l} style={{background:T.bg,borderRadius:8,padding:"10px"}}>
                  <div style={{fontSize:9,color:T.textDim,marginBottom:3,letterSpacing:1}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:"'DM Mono',monospace"}}>{v}</div>
                </div>
              ))}
            </div>
            {revEstime&&<div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,display:"flex",gap:16}}>
              <div><div style={{fontSize:9,color:T.textDim,marginBottom:3,letterSpacing:1}}>TOTAL ESTIMÉ</div><div style={{fontSize:14,fontWeight:700,color:T.text,fontFamily:"'DM Mono',monospace"}}>{revEstime}€</div></div>
              {gainCreateur&&<div><div style={{fontSize:9,color:T.textDim,marginBottom:3,letterSpacing:1}}>CRÉATEUR</div><div style={{fontSize:14,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{gainCreateur}€</div></div>}
              {gainSL&&<div><div style={{fontSize:9,color:T.textDim,marginBottom:3,letterSpacing:1}}>STICKERS LAB</div><div style={{fontSize:14,fontWeight:700,color:T.violet,fontFamily:"'DM Mono',monospace"}}>{gainSL}€</div></div>}
            </div>}
          </>:<div style={{fontSize:13,color:T.textDim}}>Aucun deal renseigné — modifie la fiche</div>}
        </NeonCard>
      </>}

      {/* Contrat */}
      {isConfirmed(c)&&<>
        <div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>📄 Contrat</div>
        <NeonCard accent={T.violet} style={{marginBottom:20}}>
          <div style={{fontSize:13,color:T.textMid,marginBottom:14,lineHeight:1.6}}>Génère et télécharge le contrat Word officiel StickersLab, prêt à signer.</div>
          {c.contrat?.notesSup&&<div style={{background:T.bg,borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:T.textMid}}><span style={{color:T.textDim,fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>Conditions particulières · </span>{c.contrat.notesSup}</div>}
          <Btn variant="violet" loading={genLoading} onClick={()=>downloadContrat(c)}>⬇ Télécharger le contrat .docx</Btn>
        </NeonCard>
      </>}
    </div>;
  }

  // ── LIST VIEW ────────────────────────────────────────────────────
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div>
        <div style={{fontSize:10,color:T.textDim,letterSpacing:3,textTransform:"uppercase"}}>Module</div>
        <div style={{fontSize:22,fontWeight:800,color:T.text}}>Collabs <span style={{color:T.violet}}>&amp; Contrats</span></div>
      </div>
      <Btn variant="violet" onClick={()=>setModal(blank())}>+ Ajouter</Btn>
    </div>

    {/* Tableau de bord */}
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      <StatCard label="Actives" value={collabs.filter(c=>!["Terminé","Archivé"].includes(c.statut)).length} accent={T.violet}/>
      <StatCard label="Confirmées" value={totalConfirmes} accent={T.green}/>
      <StatCard label="CA estimé" value={caEstime>0?`${Math.round(caEstime)}€`:"—"} accent={T.green}/>
    </div>

    {/* Alerte relance */}
    {aRelancer.length>0&&<div style={{background:"#ff4db822",border:"1px solid #ff4db855",borderRadius:12,padding:"12px 16px",marginBottom:16,display:"flex",gap:10,alignItems:"center"}}>
      <span>🔔</span>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"#ff4db8"}}>{aRelancer.length} à relancer</div></div>
    </div>}

    {/* Filtres — sans doublon Relancer */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
      {["Tous",...STATUTS].map(s=>(
        <button key={s} onClick={()=>setFilter(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,cursor:"pointer",background:filter===s?T.violetDim:T.bg1,border:`1px solid ${filter===s?T.violet:T.border}`,color:filter===s?T.violet:T.textDim}}>{s}</button>
      ))}
    </div>

    {/* Liste */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {filtered.map(c=>{
        const color=SACENT[c.statut]||T.violet;
        const deal=c.deal||{};
        const revEstime=deal.prix&&deal.quantite?Math.round(parseFloat(deal.prix)*parseInt(deal.quantite)):null;
        const relanceDate=c.dateContact?addDays(c.dateContact,c.delaiRelance||7):null;
        const diff=relanceDate?daysDiff(relanceDate):null;
        const urgent=c.statut==="En attente de réponse"&&diff!==null&&diff<=0;

        return <div key={c.id} style={{background:T.bg1,border:`1px solid ${urgent?"#ff4db855":color+"33"}`,borderRadius:14,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,cursor:"pointer"}} onClick={()=>setDetail(c)}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:4}}>{c.nom}</div>
              <div style={{fontSize:11,color:T.textDim,display:"flex",alignItems:"center",gap:6}}>
                {c.plateforme}{c.followers?` · ${c.followers}`:""}
                {c.engagement&&<span style={{color:engColor(c.engagement)}}>· ◈ {c.engagement}%</span>}
              </div>
            </div>
            <Badge label={c.statut}/>
          </div>

          {c.contenus?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
            {c.contenus.map(ct=><span key={ct} style={{fontSize:10,background:T.violetDim,border:`1px solid ${T.violet}33`,color:T.violet,borderRadius:6,padding:"2px 8px"}}>{ct}</span>)}
          </div>}

          {urgent&&<div style={{background:"#ff4db811",border:"1px solid #ff4db833",borderRadius:8,padding:"6px 10px",marginBottom:10,fontSize:11,color:"#ff4db8"}}>🔴 Relance due depuis {Math.abs(diff)}j</div>}
          {revEstime&&<div style={{fontSize:12,color:T.green,fontFamily:"'DM Mono',monospace",marginBottom:10}}>💰 ~{revEstime}€ estimé</div>}

          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDetail(c)} style={{flex:1,background:"transparent",border:`1px solid ${T.border2}`,borderRadius:8,padding:"7px 0",color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Voir →</button>
            {c.statut!=="Archivé"&&<button onClick={e=>{e.stopPropagation();nextStatut(c);}} style={{background:color+"22",border:`1px solid ${color}44`,borderRadius:8,padding:"7px 12px",color:color,fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap"}}>→ {STATUT_NEXT[c.statut]}</button>}
          </div>
        </div>;
      })}
      {filtered.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:T.textDim}}>Aucune collab ici</div>}
    </div>

    {/* Modal */}
    {modal&&<Modal title={modal.id?"Modifier":"Nouvelle collab"} onClose={()=>setModal(null)}>
      <div style={{fontSize:10,color:T.violet,letterSpacing:2,textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>Le Créateur</div>
      <Input label="Nom / Pseudo" value={modal.nom} onChange={v=>setModal(m=>({...m,nom:v}))} placeholder="ex: LucieDraws"/>
      <Input label="Lien Instagram" value={modal.instagram} onChange={v=>setModal(m=>({...m,instagram:v}))} placeholder="https://instagram.com/luciedraws"/>
      <Select label="Plateforme" value={modal.plateforme} onChange={v=>setModal(m=>({...m,plateforme:v}))} options={PLATEFORMES}/>
      <Input label="Followers" value={modal.followers} onChange={v=>setModal(m=>({...m,followers:v}))} placeholder="ex: 45k"/>
      <Input label="Engagement (%)" value={modal.engagement} onChange={v=>setModal(m=>({...m,engagement:v}))} placeholder="ex: 4.8"/>
      <Select label="Univers" value={modal.univers} onChange={v=>setModal(m=>({...m,univers:v}))} options={UNIVERS}/>
      <Select label="Type" value={modal.type} onChange={v=>setModal(m=>({...m,type:v}))} options={TYPES}/>
      <MultiSelect label="Type de contenu" value={modal.contenus||[]} onChange={v=>setModal(m=>({...m,contenus:v}))} options={CONTENUS}/>
      <Select label="Statut" value={modal.statut} onChange={v=>setModal(m=>({...m,statut:v}))} options={STATUTS}/>
      <Input label="Date de contact" value={modal.dateContact} onChange={v=>setModal(m=>({...m,dateContact:v}))} type="date"/>
      <Input label="Délai relance (jours)" value={modal.delaiRelance} onChange={v=>setModal(m=>({...m,delaiRelance:parseInt(v)||7}))} type="number" placeholder="7"/>
      <Textarea label="Notes" value={modal.notes} onChange={v=>setModal(m=>({...m,notes:v}))} placeholder="Contexte, univers, points clés..."/>

      {isConfirmed(modal)&&<>
        <div style={{fontSize:10,color:T.violet,letterSpacing:2,textTransform:"uppercase",marginBottom:12,marginTop:8,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>💰 Le Deal</div>
        <Input label="Prix du pack (€)" value={modal.deal?.prix} onChange={v=>setModal(m=>({...m,deal:{...m.deal,prix:v}}))} type="number" placeholder="ex: 4.50"/>
        <Input label="Nombre de packs" value={modal.deal?.quantite} onChange={v=>setModal(m=>({...m,deal:{...m.deal,quantite:v}}))} type="number" placeholder="ex: 100"/>
        <Input label="Part créateur (%)" value={modal.deal?.pourcentage} onChange={v=>setModal(m=>({...m,deal:{...m.deal,pourcentage:v}}))} type="number" placeholder="30"/>
        {modal.deal?.prix&&modal.deal?.quantite&&modal.deal?.pourcentage&&(()=>{
          const rev=Math.round(parseFloat(modal.deal.prix)*parseInt(modal.deal.quantite));
          const gc=Math.round(rev*parseFloat(modal.deal.pourcentage)/100);
          return <div style={{background:T.greenDim,border:`1px solid ${T.green}33`,borderRadius:8,padding:"10px 14px",marginBottom:14,display:"flex",gap:16}}>
            <div><div style={{fontSize:10,color:T.textDim}}>Total</div><div style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:"'DM Mono',monospace"}}>{rev}€</div></div>
            <div><div style={{fontSize:10,color:T.textDim}}>Créateur</div><div style={{fontSize:15,fontWeight:700,color:T.green,fontFamily:"'DM Mono',monospace"}}>{gc}€</div></div>
            <div><div style={{fontSize:10,color:T.textDim}}>StickersLab</div><div style={{fontSize:15,fontWeight:700,color:T.violet,fontFamily:"'DM Mono',monospace"}}>{rev-gc}€</div></div>
          </div>;
        })()}
        <div style={{fontSize:10,color:T.violet,letterSpacing:2,textTransform:"uppercase",marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>📄 Conditions particulières</div>
        <Textarea label="" value={modal.contrat?.notesSup} onChange={v=>setModal(m=>({...m,contrat:{...m.contrat,notesSup:v}}))} placeholder="ex: Le créateur livrera 3 visuels minimum..." rows={3}/>
      </>}

      <div style={{display:"flex",gap:10,marginTop:8}}>
        <Btn variant="ghost" onClick={()=>setModal(null)}>Annuler</Btn>
        <Btn variant="violet" onClick={()=>save(modal)}>Sauvegarder</Btn>
      </div>
    </Modal>}
  </div>;
}

// ── MODULE: FINANCE ───────────────────────────────────────────────
function Finance({data,setData}){
  const [editObj,setEditObj]=useState(false);const [tmpObj,setTmpObj]=useState("");const [modalDep,setModalDep]=useState(null);
  const collabs=data.collabs||[];const fin=data.finance||{objectifCA:0,depenses:[]};const depenses=fin.depenses||[];
  const DEP_CATS=["Impression","Matériel","Marketing","Logistique","Plateforme","Autre"];
  const totalEstime=collabs.filter(c=>["Collab confirmée","Drop en cours","Terminé"].includes(c.statut)).reduce((s,c)=>{const d=c.deal||{};return s+(parseFloat(d.prix||0)*parseInt(d.quantite||0));},0);
  const totalDep=depenses.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
  const marge=totalEstime-totalDep;
  const pctCA=fin.objectifCA>0?Math.min(100,Math.round((totalEstime/fin.objectifCA)*100)):0;
  const saveObj=()=>{setData(d=>({...d,finance:{...d.finance,objectifCA:parseFloat(tmpObj)||0}}));setEditObj(false);};
  const saveDep=form=>{setData(d=>{const id=form.id||d.nextId;const depenses=form.id?(d.finance.depenses||[]).map(x=>x.id===form.id?{...form}:x):[...(d.finance.depenses||[]),{...form,id}];return {...d,finance:{...d.finance,depenses},nextId:form.id?d.nextId:d.nextId+1};});setModalDep(null);};
  const delDep=id=>{if(!confirm("Supprimer ?"))return;setData(d=>({...d,finance:{...d.finance,depenses:(d.finance.depenses||[]).filter(x=>x.id!==id)}}));};

  return <div>
    <div style={{marginBottom:20}}><div style={{fontSize:10,color:T.textDim,letterSpacing:3,textTransform:"uppercase"}}>Module</div><div style={{fontSize:22,fontWeight:800,color:T.text}}>Finance <span style={{color:T.green}}>&amp; Marges</span></div></div>
    <NeonCard accent={T.green} style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase"}}>Objectif CA annuel</div><button onClick={()=>{setTmpObj(fin.objectifCA);setEditObj(true);}} style={{background:"none",border:"none",color:T.green,cursor:"pointer",fontSize:12}}>Modifier</button></div>
      {editObj?<div style={{display:"flex",gap:8}}><input type="number" value={tmpObj} onChange={e=>setTmpObj(e.target.value)} style={{flex:1,background:T.bg,border:`1px solid ${T.green}`,borderRadius:8,padding:"8px 12px",color:T.text,fontSize:14,outline:"none",fontFamily:"inherit"}}/><Btn small onClick={saveObj}>OK</Btn></div>:<>
        <div style={{fontSize:28,fontWeight:800,color:T.green,fontFamily:"'DM Mono',monospace",marginBottom:10}}>{fmtEur(fin.objectifCA)}</div>
        <div style={{background:T.bg,borderRadius:6,height:6,overflow:"hidden",marginBottom:6}}><div style={{width:`${pctCA}%`,height:"100%",background:`linear-gradient(90deg,${T.violet},${T.green})`,borderRadius:6,boxShadow:`0 0 8px ${T.green}`}}/></div>
        <div style={{fontSize:11,color:T.textDim}}>{pctCA}% atteint</div>
      </>}
    </NeonCard>
    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <StatCard label="CA estimé" value={fmtEur(totalEstime)} accent={T.green}/>
      <StatCard label="Dépenses" value={fmtEur(totalDep)} accent={T.amber}/>
      <StatCard label="Marge" value={fmtEur(marge)} accent={marge>=0?T.green:T.danger}/>
    </div>
    <div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Revenus par collab</div>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
      {collabs.filter(c=>["Collab confirmée","Drop en cours","Terminé"].includes(c.statut)).map(c=>{
        const d=c.deal||{};const rev=Math.round(parseFloat(d.prix||0)*parseInt(d.quantite||0));const gc=d.pourcentage?Math.round(rev*parseFloat(d.pourcentage)/100):null;
        return <div key={c.id} style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{c.nom}</div><Badge label={c.statut}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[{l:"Packs",v:d.quantite||"—"},{l:"Total estimé",v:rev>0?fmtEur(rev):"—"},{l:"Créateur",v:gc?fmtEur(gc):"—",col:T.green}].map(({l,v,col})=>(
              <div key={l} style={{background:T.bg,borderRadius:6,padding:"6px 8px"}}><div style={{fontSize:9,color:T.textDim,marginBottom:2,letterSpacing:1}}>{l}</div><div style={{fontSize:12,fontWeight:700,color:col||T.text,fontFamily:"'DM Mono',monospace"}}>{v}</div></div>
            ))}
          </div>
        </div>;
      })}
      {collabs.filter(c=>["Collab confirmée","Drop en cours","Terminé"].includes(c.statut)).length===0&&<div style={{color:T.textDim,fontSize:13}}>Aucune collab confirmée</div>}
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:10,color:T.textDim,letterSpacing:2,textTransform:"uppercase"}}>Dépenses générales</div><Btn small onClick={()=>setModalDep({id:null,libelle:"",montant:"",categorie:"Impression",date:""})}>+ Ajouter</Btn></div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {depenses.map(dep=><div key={dep.id} style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:13,color:T.text,marginBottom:3}}>{dep.libelle}</div><div style={{display:"flex",gap:6}}><Badge label={dep.categorie} color={T.violet}/>{dep.date&&<span style={{fontSize:10,color:T.textDim}}>{fmtDateShort(dep.date)}</span>}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:15,fontWeight:700,color:T.danger,fontFamily:"'DM Mono',monospace"}}>-{fmtEur(dep.montant)}</div><button onClick={()=>delDep(dep.id)} style={{background:"none",border:"none",color:T.textDim,cursor:"pointer",fontSize:16}}>×</button></div>
      </div>)}
      {depenses.length===0&&<div style={{color:T.textDim,fontSize:13}}>Aucune dépense enregistrée</div>}
    </div>
    {modalDep&&<Modal title="Nouvelle dépense" onClose={()=>setModalDep(null)}>
      <Input label="Libellé" value={modalDep.libelle} onChange={v=>setModalDep(m=>({...m,libelle:v}))} placeholder="ex: Commande imprimeur"/>
      <Input label="Montant (€)" value={modalDep.montant} onChange={v=>setModalDep(m=>({...m,montant:v}))} type="number"/>
      <Select label="Catégorie" value={modalDep.categorie} onChange={v=>setModalDep(m=>({...m,categorie:v}))} options={DEP_CATS}/>
      <Input label="Date" value={modalDep.date} onChange={v=>setModalDep(m=>({...m,date:v}))} type="date"/>
      <div style={{display:"flex",gap:10,marginTop:8}}><Btn variant="ghost" onClick={()=>setModalDep(null)}>Annuler</Btn><Btn onClick={()=>saveDep(modalDep)}>Sauvegarder</Btn></div>
    </Modal>}
  </div>;
}

// ── APP ROOT ──────────────────────────────────────────────────────
export default function App(){
  const [data,setData]=useState(()=>load()||DEF);
  const [module,setModule]=useState("home");
  useEffect(()=>{save(data);},[data]);
  const render=()=>{
    switch(module){
      case "home":    return <Home data={data} setModule={setModule}/>;
      case "collabs": return <Collabs data={data} setData={setData}/>;
      case "finance": return <Finance data={data} setData={setData}/>;
      default:        return <Home data={data} setModule={setModule}/>;
    }
  };
  return <div style={{background:T.bg,minHeight:"100vh",color:T.text,fontFamily:"'DM Sans',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:90}}>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <div style={{padding:"28px 20px 20px"}}>{render()}</div>
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(8,8,8,0.97)",borderTop:`1px solid ${T.border}`,backdropFilter:"blur(20px)",padding:"10px 4px 24px",display:"flex",justifyContent:"space-around",zIndex:100}}>
      {MODULES.map(m=>{const active=module===m.id;const ic=m.iconColor||(active?T.green:"#2a2a2a");return <button key={m.id} onClick={()=>setModule(m.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 20px",minWidth:80}}>
        <span style={{fontSize:20,color:active?ic:"#2a2a2a",textShadow:active?`0 0 12px ${ic}`:"",fontFamily:m.icon==="$"?"'DM Mono',monospace":"inherit"}}>{m.icon}</span>
        <span style={{fontSize:9,color:active?ic:"#333",fontWeight:active?700:400,letterSpacing:0.5,textTransform:"uppercase"}}>{m.label}</span>
        {active&&<div style={{width:16,height:2,background:ic,borderRadius:2,boxShadow:`0 0 6px ${ic}`}}/>}
      </button>;})}
    </div>
  </div>;
}
