import { useState, useCallback, useEffect } from "react";
import { T } from "./helpers.js";
import { Sidebar } from "./components/UI.jsx";
import { PageProjects, PageElements } from "./components/Pages1.jsx";
import { PageGenerate, PageEditor, PageExport, PageSettings } from "./components/Pages2.jsx";

const DEFAULT_SETTINGS = { apiKey: "", browserMode: "headless" };
const STORAGE_KEY = "qa_robot_projects";

function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

export default function App() {
  const [nav, setNav]           = useState("projects");
  const [projects, setProjects] = useState(() => loadProjects());
  const [activeProject, _setActiveProject] = useState(null);
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem("qa_robot_settings");
      return s ? JSON.parse(s) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  // Auto-save to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch {}
  }, [projects]);

  // Restore last active project on load
  useEffect(() => {
    try {
      const lastId = localStorage.getItem("qa_robot_active_project");
      if (lastId) {
        const found = loadProjects().find(p => p.id === lastId);
        if (found) _setActiveProject(found);
      }
    } catch {}
  }, []);

  const setActiveProject = useCallback((p) => {
    _setActiveProject(p);
    if (!p) return;
    try { localStorage.setItem("qa_robot_active_project", p.id); } catch {}
    setProjects(prev =>
      prev.some(x => x.id === p.id)
        ? prev.map(x => x.id === p.id ? p : x)
        : [...prev, p]
    );
  }, []);

  // Backup to JSON file
  const exportJSON = () => {
    const data = { projects, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "qa-robot-backup.json"; a.click();
  };

  // Restore from JSON file
  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.projects) {
          setProjects(data.projects);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.projects));
          alert("✅ Projects restored successfully!");
        }
      } catch { alert("❌ Invalid backup file!"); }
    };
    r.readAsText(file);
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:'#f4f6f9', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:T.text }}>
      <Sidebar active={nav} setActive={setNav} project={activeProject} onExport={exportJSON} onImport={importJSON} />
      <main style={{ flex:1, overflow:"auto" }}>
        {nav==="projects" && <PageProjects projects={projects} setProjects={setProjects} activeProject={activeProject} setActiveProject={setActiveProject} setNav={setNav} />}
        {nav==="elements" && <PageElements activeProject={activeProject} setActiveProject={setActiveProject} />}
        {nav==="generate" && <PageGenerate activeProject={activeProject} setActiveProject={setActiveProject} settings={settings} />}
        {nav==="editor"   && <PageEditor activeProject={activeProject} />}
        {nav==="export"   && <PageExport activeProject={activeProject} settings={settings} />}
        {nav==="settings" && <PageSettings settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  );
}
