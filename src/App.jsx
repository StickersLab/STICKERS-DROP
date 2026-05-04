import { useState, useEffect, useCallback } from "react";

// ── STORAGE HELPERS ──────────────────────────────────────────────
const STORAGE_KEY = "sticker_biz_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// ── DEFAULT DATA ──────────────────────────────────────────────────
const defaultData = {
  drops: [
    {
      id: 1, nom: "Drop 01 — Été Chaotique", statut: "En création",
      type: "Design perso", lancement: "2026-06-15", cloture: "",
      nbDesigns: 3, qte: 100, prix: 4.5, cout: 85, vendus: 0,
      canaux: ["Instagram Shop"], bilan: "", partenaireId: null,
    },
  ],
  partenariats: [
    {
      id: 1, nom: "LucieDraws", plateforme: "Instagram", followers: "45k",
      engagement: "4.8", univers: "Illustration", type: "Collab artistique",
      statut: "En discussion", contact: "@luciedraws", date: "2026-04-20", notes: "Fan de stickers, a déjà fait des produits physiques",
    },
  ],
  designs: [],
  production: [],
  taches: [
    { id: 1, tache: "Contacter LucieDraws pour collab", module: "Partenariats", priorite: "Haute", deadline: "2026-05-10", statut: "À faire" },
    { id: 2, tache: "Commander samples imprimeur", module: "Production", priorite: "Moyenne", deadline: "2026-05-20", statut: "À faire" },
  ],
  finance: [],
  nextId: 100,
};

// ── CONSTANTS ─────────────────────────────────────────────────────
const MODULES = [
  { id: "home",          icon: "◈",  label: "Hub"           },
  { id: "drops",         icon: "⬡",  label: "Drops"         },
  { id: "partenariats",  icon: "◎",  label: "Partenariats"  },
  { id: "designs",       icon: "◇",  label: "Designs"       },
  { id: "production",    icon: "⬒",  label: "Production"    },
  { id: "taches",        icon: "◻",  label: "Tâches"        },
];

const DROP_STATUTS = ["Idée", "En création", "En production", "Annoncé", "Lancé", "Sold out"];
const DROP_TYPES   = ["Design perso", "Collab artiste", "Licensing", "Série limitée"];
const CANAUX       = ["Instagram Shop", "TikTok Shop", "Site perso"];
const PART_STATUTS = ["À contacter", "Contacté", "En discussion", "Collab confirmée", "Archivé"];
const PART_TYPES   = ["Collab artistique", "Licensing"];
const PLATEFORMES  = ["Instagram", "TikTok", "YouTube", "Twitch", "Pinterest", "Autre"];
const UNIVERS      = ["Illustration", "Gaming", "Humour", "Manga", "Street/Skate", "Culture pop", "Autre"];
const PRIORITES    = ["Haute", "Moyenne", "Basse"];
const TACHE_STATUTS= ["À faire", "En cours", "Fait"];
const TACHE_MODULES= ["Drops", "Partenariats", "Designs", "Production", "Finance", "Comm", "Autre"];

const STATUT_COLORS = {
  "Idée":            "#6366f1",
  "En création":     "#8b5cf6",
  "En production":   "#f59e0b",
  "Annoncé":         "#06b6d4",
  "Lancé":           "#10b981",
  "Sold out":        "#ec4899",
  "À contacter":     "#6366f1",
  "Contacté":        "#8b5cf6",
  "En discussion":   "#f59e0b",
  "Collab confirmée":"#10b981",
  "Archivé":         "#6b7280",
  "À faire":         "#f59e0b",
  "En cours":        "#06b6d4",
  "Fait":            "#10b981",
  "Haute":           "#ec4899",
  "Moyenne":         "#f59e0b",
  "Basse":           "#6b7280",
};

// ── UTILS ─────────────────────────────────────────────────────────
const fmt = (n) => n ? `${parseFloat(n).toFixed(2).replace(".", ",")} €` : "—";
const pct = (a, b) => (b && b > 0) ? Math.round((a / b) * 100) + "%" : "—";

// ── COMPONENTS ───────────────────────────────────────────────────

function Badge({ label, color }) {
  const c = color || STATUT_COLORS[label] || "#6b7280";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c + "22", border: `1px solid ${c}44`,
      color: c, borderRadius: 20, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "inline-block" }} />
      {label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#0f0f0f", border: "1px solid #1f1f1f",
      borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 120,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#fff", fontFamily: "'DM Mono', monospace", letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
      <input
        type={type} value={value || ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#0a0a0a", border: "1px solid #222",
          borderRadius: 8, padding: "10px 13px", color: "#fff",
          fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit",
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
      <select
        value={value || ""} onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#0a0a0a", border: "1px solid #222",
          borderRadius: 8, padding: "10px 13px", color: "#fff",
          fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
      <textarea
        value={value || ""} rows={rows} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: "#0a0a0a", border: "1px solid #222",
          borderRadius: 8, padding: "10px 13px", color: "#fff",
          fontSize: 14, boxSizing: "border-box", outline: "none",
          fontFamily: "inherit", resize: "vertical",
        }}
      />
    </div>
  );
}

function MultiSelect({ label, value = [], onChange, options }) {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt];
    onChange(next);
  };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>{label}</label>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: value.includes(opt) ? "#6366f133" : "#111",
            border: value.includes(opt) ? "1px solid #6366f1" : "1px solid #222",
            color: value.includes(opt) ? "#818cf8" : "#555",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small }) {
  const bg = variant === "primary" ? "#6366f1" : variant === "danger" ? "#dc262622" : "#111";
  const border = variant === "primary" ? "none" : variant === "danger" ? "1px solid #dc262644" : "1px solid #222";
  const color = variant === "danger" ? "#f87171" : "#fff";
  return (
    <button onClick={onClick} style={{
      padding: small ? "7px 14px" : "11px 20px",
      background: bg, border, borderRadius: 9, color,
      fontSize: small ? 12 : 14, fontWeight: 600, cursor: "pointer",
      fontFamily: "inherit",
    }}>{children}</button>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
      zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: 0,
    }}>
      <div style={{
        background: "#111", borderTop: "1px solid #222",
        borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600,
        padding: "24px 24px 40px", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{title}</div>
          <button onClick={onClose} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, color: "#666", fontSize: 18, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── MODULE: HOME ──────────────────────────────────────────────────
function Home({ data, setModule }) {
  const drops = data.drops || [];
  const parts = data.partenariats || [];
  const taches = data.taches || [];

  const totalRevenu = drops.reduce((s, d) => s + (d.vendus || 0) * (d.prix || 0), 0);
  const totalCout   = drops.reduce((s, d) => s + (d.cout || 0), 0);
  const marge       = totalRevenu - totalCout;
  const dropsActifs = drops.filter(d => !["Idée", "Archivé"].includes(d.statut)).length;
  const tachesDues  = taches.filter(t => t.statut !== "Fait").length;
  const partEnCours = parts.filter(p => ["En discussion", "Contacté"].includes(p.statut)).length;

  const prochainDrop = drops
    .filter(d => d.lancement && d.statut !== "Sold out")
    .sort((a, b) => new Date(a.lancement) - new Date(b.lancement))[0];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Tableau de bord</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>Sticker Business</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Drops actifs"    value={dropsActifs}                  accent="#6366f1" />
        <StatCard label="Partenaires"     value={partEnCours}  sub="en cours"  accent="#f59e0b" />
        <StatCard label="Tâches à faire"  value={tachesDues}                   accent="#ec4899" />
        <StatCard label="Marge nette"     value={marge >= 0 ? `+${Math.round(marge)}€` : `${Math.round(marge)}€`} accent="#10b981" />
      </div>

      {prochainDrop && (
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Prochain drop</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 6 }}>{prochainDrop.nom}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge label={prochainDrop.statut} />
            {prochainDrop.lancement && (
              <span style={{ fontSize: 12, color: "#555" }}>
                {new Date(prochainDrop.lancement).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Accès rapide</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {MODULES.filter(m => m.id !== "home").map(m => (
          <button key={m.id} onClick={() => setModule(m.id)} style={{
            background: "#0f0f0f", border: "1px solid #1f1f1f",
            borderRadius: 14, padding: "16px", textAlign: "left",
            cursor: "pointer", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#333"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#1f1f1f"}
          >
            <div style={{ fontSize: 22, marginBottom: 6, color: "#6366f1" }}>{m.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{m.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── MODULE: DROPS ────────────────────────────────────────────────
function Drops({ data, setData }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("Tous");

  const drops = data.drops || [];
  const filtered = filter === "Tous" ? drops : drops.filter(d => d.statut === filter);

  const newDrop = () => setModal({
    id: null, nom: "", statut: "Idée", type: "Design perso",
    lancement: "", cloture: "", nbDesigns: "", qte: "", prix: "",
    cout: "", vendus: "", canaux: [], bilan: "",
  });

  const save = (form) => {
    setData(d => {
      const id = form.id || d.nextId;
      const drops = form.id
        ? d.drops.map(x => x.id === form.id ? { ...form } : x)
        : [...d.drops, { ...form, id }];
      return { ...d, drops, nextId: form.id ? d.nextId : d.nextId + 1 };
    });
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer ce drop ?")) return;
    setData(d => ({ ...d, drops: d.drops.filter(x => x.id !== id) }));
  };

  const marge = (dr) => {
    const rev = (dr.vendus || 0) * (dr.prix || 0);
    return rev - (dr.cout || 0);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>Module</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Drops & Collections</div>
        </div>
        <Btn onClick={newDrop}>+ Nouveau</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["Tous", ...DROP_STATUTS].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === s ? "#6366f133" : "#0f0f0f",
            border: filter === s ? "1px solid #6366f1" : "1px solid #1f1f1f",
            color: filter === s ? "#818cf8" : "#555",
          }}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>Aucun drop — crée le premier ↗</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(dr => (
            <div key={dr.id} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 6 }}>{dr.nom}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Badge label={dr.statut} />
                    {dr.type && <Badge label={dr.type} color="#8b5cf6" />}
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>PRIX</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{dr.prix ? `${dr.prix}€` : "—"}</div>
                </div>
                <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>VENDUS</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{dr.vendus || 0} / {dr.qte || "?"}</div>
                </div>
                <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "#444", marginBottom: 2 }}>MARGE</div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: marge(dr) >= 0 ? "#10b981" : "#f87171" }}>
                    {dr.prix && dr.cout ? `${Math.round(marge(dr))}€` : "—"}
                  </div>
                </div>
              </div>
              {dr.lancement && (
                <div style={{ fontSize: 12, color: "#444", marginTop: 10 }}>
                  Lancement : {new Date(dr.lancement).toLocaleDateString("fr-FR")}
                  {dr.cloture ? ` → ${new Date(dr.cloture).toLocaleDateString("fr-FR")}` : ""}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Btn small onClick={() => setModal({ ...dr })}>Modifier</Btn>
                <Btn small variant="danger" onClick={() => del(dr.id)}>Supprimer</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal.id ? "Modifier le drop" : "Nouveau drop"} onClose={() => setModal(null)}>
          <Input label="Nom du drop" value={modal.nom} onChange={v => setModal(m => ({ ...m, nom: v }))} placeholder="ex: Drop 01 — Été Chaotique" />
          <Select label="Statut" value={modal.statut} onChange={v => setModal(m => ({ ...m, statut: v }))} options={DROP_STATUTS} />
          <Select label="Type" value={modal.type} onChange={v => setModal(m => ({ ...m, type: v }))} options={DROP_TYPES} />
          <Input label="Date de lancement" value={modal.lancement} onChange={v => setModal(m => ({ ...m, lancement: v }))} type="date" />
          <Input label="Date de clôture" value={modal.cloture} onChange={v => setModal(m => ({ ...m, cloture: v }))} type="date" />
          <Input label="Nombre de designs" value={modal.nbDesigns} onChange={v => setModal(m => ({ ...m, nbDesigns: v }))} type="number" placeholder="ex: 3" />
          <Input label="Quantité produite" value={modal.qte} onChange={v => setModal(m => ({ ...m, qte: v }))} type="number" placeholder="ex: 100" />
          <Input label="Prix de vente (€)" value={modal.prix} onChange={v => setModal(m => ({ ...m, prix: v }))} type="number" placeholder="ex: 4.5" />
          <Input label="Coût de production (€)" value={modal.cout} onChange={v => setModal(m => ({ ...m, cout: v }))} type="number" placeholder="ex: 85" />
          <Input label="Unités vendues" value={modal.vendus} onChange={v => setModal(m => ({ ...m, vendus: v }))} type="number" placeholder="ex: 42" />
          <MultiSelect label="Canaux de vente" value={modal.canaux} onChange={v => setModal(m => ({ ...m, canaux: v }))} options={CANAUX} />
          <Textarea label="Bilan / notes" value={modal.bilan} onChange={v => setModal(m => ({ ...m, bilan: v }))} placeholder="Retour après le drop..." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={() => save(modal)}>Sauvegarder</Btn>
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
  const filtered = filter === "Tous" ? parts : parts.filter(p => p.statut === filter);

  const newPart = () => setModal({
    id: null, nom: "", plateforme: "Instagram", followers: "",
    engagement: "", univers: "Illustration", type: "Collab artistique",
    statut: "À contacter", contact: "", date: "", notes: "",
  });

  const save = (form) => {
    setData(d => {
      const id = form.id || d.nextId;
      const partenariats = form.id
        ? d.partenariats.map(x => x.id === form.id ? { ...form } : x)
        : [...d.partenariats, { ...form, id }];
      return { ...d, partenariats, nextId: form.id ? d.nextId : d.nextId + 1 };
    });
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    setData(d => ({ ...d, partenariats: d.partenariats.filter(x => x.id !== id) }));
  };

  const engColor = (v) => {
    const n = parseFloat(v);
    if (!n) return "#555";
    if (n >= 5) return "#10b981";
    if (n >= 3) return "#f59e0b";
    return "#f87171";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>Module</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Partenariats</div>
        </div>
        <Btn onClick={newPart}>+ Ajouter</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["Tous", ...PART_STATUTS].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === s ? "#f59e0b22" : "#0f0f0f",
            border: filter === s ? "1px solid #f59e0b" : "1px solid #1f1f1f",
            color: filter === s ? "#fbbf24" : "#555",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4 }}>{p.nom}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{p.plateforme} · {p.followers || "?"} followers</div>
              </div>
              <Badge label={p.statut} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {p.univers && <Badge label={p.univers} color="#8b5cf6" />}
              {p.type && <Badge label={p.type} color="#6366f1" />}
              {p.engagement && (
                <span style={{ fontSize: 12, color: engColor(p.engagement), fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center" }}>
                  ◈ {p.engagement}% eng.
                </span>
              )}
            </div>
            {p.notes && <div style={{ fontSize: 12, color: "#555", borderTop: "1px solid #1a1a1a", paddingTop: 10, lineHeight: 1.5 }}>{p.notes.slice(0, 100)}{p.notes.length > 100 ? "…" : ""}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn small onClick={() => setModal({ ...p })}>Modifier</Btn>
              <Btn small variant="danger" onClick={() => del(p.id)}>Supprimer</Btn>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>Aucun partenaire trouvé</div>}
      </div>

      {modal && (
        <Modal title={modal.id ? "Modifier" : "Nouveau partenaire"} onClose={() => setModal(null)}>
          <Input label="Nom / Pseudo" value={modal.nom} onChange={v => setModal(m => ({ ...m, nom: v }))} placeholder="ex: LucieDraws" />
          <Input label="Contact (handle / email)" value={modal.contact} onChange={v => setModal(m => ({ ...m, contact: v }))} placeholder="ex: @luciedraws" />
          <Select label="Plateforme" value={modal.plateforme} onChange={v => setModal(m => ({ ...m, plateforme: v }))} options={PLATEFORMES} />
          <Input label="Followers" value={modal.followers} onChange={v => setModal(m => ({ ...m, followers: v }))} placeholder="ex: 45k" />
          <Input label="Taux d'engagement (%)" value={modal.engagement} onChange={v => setModal(m => ({ ...m, engagement: v }))} placeholder="ex: 4.8" />
          <Select label="Univers" value={modal.univers} onChange={v => setModal(m => ({ ...m, univers: v }))} options={UNIVERS} />
          <Select label="Type de partenariat" value={modal.type} onChange={v => setModal(m => ({ ...m, type: v }))} options={PART_TYPES} />
          <Select label="Statut" value={modal.statut} onChange={v => setModal(m => ({ ...m, statut: v }))} options={PART_STATUTS} />
          <Input label="Date de contact" value={modal.date} onChange={v => setModal(m => ({ ...m, date: v }))} type="date" />
          <Textarea label="Notes" value={modal.notes} onChange={v => setModal(m => ({ ...m, notes: v }))} placeholder="Historique, prochaine étape..." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={() => save(modal)}>Sauvegarder</Btn>
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
  const filtered = filter === "Tous" ? taches : taches.filter(t => t.statut === filter);

  const newTache = () => setModal({ id: null, tache: "", module: "Drops", priorite: "Moyenne", deadline: "", statut: "À faire" });

  const save = (form) => {
    setData(d => {
      const id = form.id || d.nextId;
      const taches = form.id
        ? d.taches.map(x => x.id === form.id ? { ...form } : x)
        : [...d.taches, { ...form, id }];
      return { ...d, taches, nextId: form.id ? d.nextId : d.nextId + 1 };
    });
    setModal(null);
  };

  const toggleStatut = (t) => {
    const next = t.statut === "À faire" ? "En cours" : t.statut === "En cours" ? "Fait" : "À faire";
    setData(d => ({ ...d, taches: d.taches.map(x => x.id === t.id ? { ...x, statut: next } : x) }));
  };

  const del = (id) => {
    if (!confirm("Supprimer ?")) return;
    setData(d => ({ ...d, taches: d.taches.filter(x => x.id !== id) }));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>Module</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Tâches</div>
        </div>
        <Btn onClick={newTache}>+ Ajouter</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["Tous", ...TACHE_STATUTS].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12, cursor: "pointer",
            background: filter === s ? "#ec489922" : "#0f0f0f",
            border: filter === s ? "1px solid #ec4899" : "1px solid #1f1f1f",
            color: filter === s ? "#f472b6" : "#555",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(t => (
          <div key={t.id} style={{
            background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 12,
            padding: "14px 16px", display: "flex", gap: 12, alignItems: "center",
            opacity: t.statut === "Fait" ? 0.5 : 1,
          }}>
            <button onClick={() => toggleStatut(t)} style={{
              width: 22, height: 22, borderRadius: 6, border: "1px solid #333",
              background: t.statut === "Fait" ? "#10b981" : t.statut === "En cours" ? "#f59e0b" : "transparent",
              cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11,
            }}>{t.statut === "Fait" ? "✓" : t.statut === "En cours" ? "▶" : ""}</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: t.statut === "Fait" ? "#555" : "#fff", textDecoration: t.statut === "Fait" ? "line-through" : "none", marginBottom: 4 }}>{t.tache}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge label={t.priorite} />
                <Badge label={t.module} color="#6366f1" />
                {t.deadline && <span style={{ fontSize: 11, color: "#444" }}>{new Date(t.deadline).toLocaleDateString("fr-FR")}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small onClick={() => setModal({ ...t })}>✎</Btn>
              <Btn small variant="danger" onClick={() => del(t.id)}>×</Btn>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>Aucune tâche</div>}
      </div>

      {modal && (
        <Modal title={modal.id ? "Modifier la tâche" : "Nouvelle tâche"} onClose={() => setModal(null)}>
          <Input label="Tâche" value={modal.tache} onChange={v => setModal(m => ({ ...m, tache: v }))} placeholder="ex: Contacter LucieDraws" />
          <Select label="Module" value={modal.module} onChange={v => setModal(m => ({ ...m, module: v }))} options={TACHE_MODULES} />
          <Select label="Priorité" value={modal.priorite} onChange={v => setModal(m => ({ ...m, priorite: v }))} options={PRIORITES} />
          <Select label="Statut" value={modal.statut} onChange={v => setModal(m => ({ ...m, statut: v }))} options={TACHE_STATUTS} />
          <Input label="Deadline" value={modal.deadline} onChange={v => setModal(m => ({ ...m, deadline: v }))} type="date" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={() => save(modal)}>Sauvegarder</Btn>
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

  const DESIGN_STATUTS = ["Concept", "En cours", "Finalisé", "Validé", "Imprimé"];
  const FORMATS = ["Die-cut", "Rectangle", "Rond", "Holographique", "Vinyle mat", "Vinyle brillant"];

  const save = (form) => {
    setData(d => {
      const id = form.id || d.nextId;
      const designs = form.id
        ? d.designs.map(x => x.id === form.id ? { ...form } : x)
        : [...d.designs, { ...form, id }];
      return { ...d, designs, nextId: form.id ? d.nextId : d.nextId + 1 };
    });
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer ?")) return;
    setData(d => ({ ...d, designs: d.designs.filter(x => x.id !== id) }));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>Module</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Designs</div>
        </div>
        <Btn onClick={() => setModal({ id: null, nom: "", statut: "Concept", format: "Die-cut", drop: "", notes: "" })}>+ Ajouter</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {designs.map(d => (
          <div key={d.id} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 14, padding: "16px" }}>
            <div style={{ fontSize: 28, textAlign: "center", marginBottom: 10, color: "#6366f1" }}>◇</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 6, textAlign: "center" }}>{d.nom}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              <Badge label={d.statut} />
            </div>
            {d.format && <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginBottom: 10 }}>{d.format}</div>}
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              <Btn small onClick={() => setModal({ ...d })}>✎</Btn>
              <Btn small variant="danger" onClick={() => del(d.id)}>×</Btn>
            </div>
          </div>
        ))}
        {designs.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#333" }}>Aucun design — crée le premier ↗</div>
        )}
      </div>
      {modal && (
        <Modal title={modal.id ? "Modifier le design" : "Nouveau design"} onClose={() => setModal(null)}>
          <Input label="Nom du design" value={modal.nom} onChange={v => setModal(m => ({ ...m, nom: v }))} placeholder="ex: Chaos Cat v1" />
          <Select label="Statut" value={modal.statut} onChange={v => setModal(m => ({ ...m, statut: v }))} options={DESIGN_STATUTS} />
          <Select label="Format" value={modal.format} onChange={v => setModal(m => ({ ...m, format: v }))} options={FORMATS} />
          <Input label="Drop associé (nom)" value={modal.drop} onChange={v => setModal(m => ({ ...m, drop: v }))} placeholder="ex: Drop 01" />
          <Textarea label="Notes créa" value={modal.notes} onChange={v => setModal(m => ({ ...m, notes: v }))} placeholder="Idées, références, retours..." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={() => save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── MODULE: PRODUCTION ────────────────────────────────────────────
function Production({ data, setData }) {
  const [modal, setModal] = useState(null);
  const imprimeurs = data.production || [];

  const QUALITES = ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"];
  const STATUTS_IMP = ["À tester", "Sample commandé", "Validé", "Fournisseur principal", "Écarté"];

  const save = (form) => {
    setData(d => {
      const id = form.id || d.nextId;
      const production = form.id
        ? d.production.map(x => x.id === form.id ? { ...form } : x)
        : [...d.production, { ...form, id }];
      return { ...d, production, nextId: form.id ? d.nextId : d.nextId + 1 };
    });
    setModal(null);
  };

  const del = (id) => {
    if (!confirm("Supprimer ?")) return;
    setData(d => ({ ...d, production: d.production.filter(x => x.id !== id) }));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>Module</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>Production</div>
        </div>
        <Btn onClick={() => setModal({ id: null, nom: "", site: "", prixCent: "", delai: "", qualite: "⭐⭐⭐", formats: "", cmdMin: "", statut: "À tester", notes: "" })}>+ Ajouter</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {imprimeurs.map(imp => (
          <div key={imp.id} style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{imp.nom}</div>
              <Badge label={imp.statut} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 2 }}>PRIX / 100</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{imp.prixCent ? `${imp.prixCent}€` : "—"}</div>
              </div>
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 2 }}>DÉLAI</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{imp.delai || "—"}</div>
              </div>
              <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: "#444", marginBottom: 2 }}>QUALITÉ</div>
                <div style={{ fontSize: 13 }}>{imp.qualite || "—"}</div>
              </div>
            </div>
            {imp.notes && <div style={{ fontSize: 12, color: "#555", marginBottom: 10, lineHeight: 1.5 }}>{imp.notes}</div>}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small onClick={() => setModal({ ...imp })}>Modifier</Btn>
              <Btn small variant="danger" onClick={() => del(imp.id)}>Supprimer</Btn>
            </div>
          </div>
        ))}
        {imprimeurs.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>Ajoute ton premier imprimeur ↗</div>}
      </div>
      {modal && (
        <Modal title={modal.id ? "Modifier" : "Nouvel imprimeur"} onClose={() => setModal(null)}>
          <Input label="Nom de l'imprimeur" value={modal.nom} onChange={v => setModal(m => ({ ...m, nom: v }))} placeholder="ex: StickerMule, Stickerkid..." />
          <Input label="Site web" value={modal.site} onChange={v => setModal(m => ({ ...m, site: v }))} placeholder="ex: stickermule.com" />
          <Input label="Prix pour 100 stickers (€)" value={modal.prixCent} onChange={v => setModal(m => ({ ...m, prixCent: v }))} type="number" placeholder="ex: 85" />
          <Input label="Délai de livraison" value={modal.delai} onChange={v => setModal(m => ({ ...m, delai: v }))} placeholder="ex: 10-14 jours" />
          <Select label="Qualité perçue" value={modal.qualite} onChange={v => setModal(m => ({ ...m, qualite: v }))} options={QUALITES} />
          <Input label="Commande minimum" value={modal.cmdMin} onChange={v => setModal(m => ({ ...m, cmdMin: v }))} placeholder="ex: 50 unités" />
          <Input label="Formats disponibles" value={modal.formats} onChange={v => setModal(m => ({ ...m, formats: v }))} placeholder="ex: Die-cut, Rectangle, Rond" />
          <Select label="Statut" value={modal.statut} onChange={v => setModal(m => ({ ...m, statut: v }))} options={STATUTS_IMP} />
          <Textarea label="Notes" value={modal.notes} onChange={v => setModal(m => ({ ...m, notes: v }))} placeholder="Qualité d'impression, SAV, retour..." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Annuler</Btn>
            <Btn onClick={() => save(modal)}>Sauvegarder</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData() || defaultData);
  const [module, setModule] = useState("home");

  useEffect(() => { saveData(data); }, [data]);

  const nav = MODULES.find(m => m.id === module);

  const renderModule = () => {
    switch (module) {
      case "home":         return <Home data={data} setModule={setModule} />;
      case "drops":        return <Drops data={data} setData={setData} />;
      case "partenariats": return <Partenariats data={data} setData={setData} />;
      case "taches":       return <Taches data={data} setData={setData} />;
      case "designs":      return <Designs data={data} setData={setData} />;
      case "production":   return <Production data={data} setData={setData} />;
      default:             return <Home data={data} setModule={setModule} />;
    }
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans', sans-serif", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 90 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Content */}
      <div style={{ padding: "28px 20px 20px" }}>
        {renderModule()}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "rgba(8,8,8,0.95)", borderTop: "1px solid #1a1a1a",
        backdropFilter: "blur(20px)", padding: "10px 8px 20px",
        display: "flex", justifyContent: "space-around", zIndex: 100,
      }}>
        {MODULES.map(m => (
          <button key={m.id} onClick={() => setModule(m.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 10px", borderRadius: 10,
            transition: "background 0.15s",
          }}>
            <span style={{ fontSize: 18, color: module === m.id ? "#6366f1" : "#333", transition: "color 0.15s" }}>{m.icon}</span>
            <span style={{ fontSize: 10, color: module === m.id ? "#818cf8" : "#333", fontWeight: module === m.id ? 600 : 400, letterSpacing: 0.5 }}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
