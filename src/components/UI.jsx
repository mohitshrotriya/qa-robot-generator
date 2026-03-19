import { T } from "../helpers.js";

export function Btn({ children, onClick, variant = "primary", disabled = false, size = "md", style = {} }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600,
    borderRadius: 6, border: "1px solid", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1, transition: "all 0.15s",
    fontSize: size === "sm" ? 12 : size === "lg" ? 14 : 13,
    padding: size === "sm" ? "5px 12px" : size === "lg" ? "10px 22px" : "7px 16px",
    fontFamily: "inherit",
  };
  const variants = {
    primary: { background: T.accent, borderColor: T.accent, color: "#fff" },
    ghost:   { background: "transparent", borderColor: T.border, color: T.text2 },
    danger:  { background: "#fee2e2", borderColor: "#fca5a5", color: "#dc2626" },
    success: { background: "#dcfce7", borderColor: "#86efac", color: "#16a34a" },
    outline: { background: "transparent", borderColor: T.accent, color: T.accent },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, placeholder, type = "text", mono = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 12px",
          fontSize: 13, color: T.text, outline: "none", fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
          width: "100%", boxSizing: "border-box", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 6, mono = true }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.text3, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 12px",
          fontSize: 12, color: T.text, outline: "none", resize: "vertical",
          fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
          width: "100%", boxSizing: "border-box", lineHeight: 1.6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }} />
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", ...style }}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{children}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

export function Badge({ color = "#2563eb", children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
      background: color + "15", color, border: `1px solid ${color}30`,
      letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block" }}>
      {children}
    </span>
  );
}

export function Tag({ label }) {
  return (
    <span style={{ fontSize: 10, background: T.bg2, color: T.text3, padding: "1px 7px",
      borderRadius: 4, border: `1px solid ${T.border}`, fontFamily: "monospace" }}>[{label}]</span>
  );
}

function QAMSLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="38" rx="9" fill="#ffffff" fillOpacity="0.15"/>
      <rect x="1" y="1" width="36" height="36" rx="8" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
      <text x="19" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="system-ui,sans-serif">QAMS</text>
      <text x="19" y="25" textAnchor="middle" fill="#93c5fd" fontSize="5.5" fontWeight="600" fontFamily="system-ui,sans-serif">QA ROBOT</text>
      <line x1="7" y1="28" x2="31" y2="28" stroke="white" strokeOpacity="0.2" strokeWidth="0.8"/>
    </svg>
  );
}

export function Sidebar({ active, setActive, project, onExport, onImport }) {
  const NAV_ITEMS = [
    { id: "projects", icon: "▣", label: "Projects"  },
    { id: "elements", icon: "◈", label: "Elements"  },
    { id: "generate", icon: "▶", label: "Generate"  },
    { id: "editor",   icon: "≡", label: "Editor"    },
    { id: "export",   icon: "↓", label: "Export"    },
    { id: "settings", icon: "⚙", label: "Settings"  },
  ];

  return (
    <div style={{ width: 230, background: T.sidebar, borderRight: "none",
      display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0,
      boxShadow: "2px 0 12px rgba(0,0,0,0.15)" }}>

      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <QAMSLogo />
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>QAMS QA Robot</div>
            <div style={{ fontSize: 10, color: T.sidebarSub, marginTop: 1 }}>AI Test Generator</div>
          </div>
        </div>
      </div>

      {/* Active Project */}
      {project && (
        <div style={{ margin: "12px 12px 4px", background: "rgba(255,255,255,0.08)", borderRadius: 8,
          padding: "8px 12px", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 10, color: T.sidebarSub, marginBottom: 2, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.06em" }}>Active Project</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</div>
          <div style={{ fontSize: 10, color: T.sidebarSub, marginTop: 1 }}>{project.pages?.length || 0} pages</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 7, border: "none", cursor: "pointer", textAlign: "left",
              background: active === item.id ? "rgba(255,255,255,0.15)" : "transparent",
              color: active === item.id ? "#ffffff" : T.sidebarText,
              fontFamily: "inherit", fontSize: 13,
              fontWeight: active === item.id ? 600 : 400, transition: "all 0.12s",
              borderLeft: active === item.id ? "3px solid #60a5fa" : "3px solid transparent" }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center",
              color: active === item.id ? "#60a5fa" : T.sidebarSub }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.1)",
        fontSize: 10, color: T.sidebarSub, lineHeight: 1.6 }}>
        <div style={{ fontWeight: 700, color: T.sidebarText, fontSize: 11, marginBottom: 2 }}>QAMS AI Testing Tool</div>
        <div>Developed by <span style={{ color: "#60a5fa", fontWeight: 600 }}>Mohit Shrotriya</span></div>
      </div>

      {/* Backup / Restore */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 6 }}>
        <button onClick={onExport}
          style={{ flex: 1, background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: 6, color: "#86efac", fontSize: 11, padding: "6px 0",
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
          Backup
        </button>
        <label style={{ flex: 1, background: "rgba(96,165,250,0.2)", border: "1px solid rgba(96,165,250,0.4)",
          borderRadius: 6, color: "#93c5fd", fontSize: 11, padding: "6px 0",
          cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          textAlign: "center", display: "block" }}>
          Restore
          <input type="file" accept=".json" style={{ display: "none" }} onChange={onImport} />
        </label>
      </div>
    </div>
  );
}
