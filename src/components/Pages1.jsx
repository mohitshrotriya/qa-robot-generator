import { useState, useEffect } from "react";
import { uid, extractElementsFromHTML, ELEMENT_TYPES, T } from "../helpers.js";
import { Btn, Input, Textarea, Card, SectionTitle, Badge } from "./UI.jsx";

// ════════════════════════════════════════════════════════════
//  PAGE: PROJECTS
// ════════════════════════════════════════════════════════════
export function PageProjects({ projects, setProjects, activeProject, setActiveProject, setNav }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", baseUrl: "", description: "" });

  const createProject = () => {
    if (!form.name) return;
    const p = {
      id: uid(), name: form.name, baseUrl: form.baseUrl,
      description: form.description, pages: [],
      createdAt: new Date().toLocaleDateString()
    };
    const updated = [...projects, p];
    setProjects(updated);
    setActiveProject(p);
    setForm({ name: "", baseUrl: "", description: "" });
    setShowNew(false);
  };

  const deleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (activeProject?.id === id) setActiveProject(updated[0] || null);
  };

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Projects</h1>
          <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>Manage your test automation projects</p>
        </div>
        <Btn onClick={() => setShowNew(!showNew)}>+ New Project</Btn>
      </div>

      {showNew && (
        <Card style={{ marginBottom: 24, borderColor: T.accent + "44" }}>
          <SectionTitle>Create New Project</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <Input label="Project Name *" value={form.name}
              onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. E-commerce App" />
            <Input label="Base URL" value={form.baseUrl}
              onChange={v => setForm(p => ({ ...p, baseUrl: v }))} placeholder="https://your-app.com" />
          </div>
          <Input label="Description" value={form.description}
            onChange={v => setForm(p => ({ ...p, description: v }))} placeholder="Brief description..." />
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn onClick={createProject} disabled={!form.name}>Create Project</Btn>
            <Btn variant="ghost" onClick={() => setShowNew(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: T.text2 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⬡</div>
          <p style={{ fontSize: 14 }}>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {projects.map(p => (
            <div key={p.id}
              onClick={() => { setActiveProject(p); setNav("elements"); }}
              style={{
                background: T.bg1,
                border: `1px solid ${activeProject?.id === p.id ? T.accent : T.border}`,
                borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.15s",
                boxShadow: activeProject?.id === p.id ? `0 0 0 1px ${T.accent}40` : "none"
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: T.accent + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: T.accent
                }}>⬡</div>
                <button onClick={e => { e.stopPropagation(); deleteProject(p.id); }}
                  style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>{p.name}</div>
              {p.description && (
                <div style={{ fontSize: 12, color: T.text2, marginBottom: 10, lineHeight: 1.4 }}>{p.description}</div>
              )}
              <div style={{ fontSize: 11, color: T.text2 }}>{p.baseUrl || "No URL set"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}` }}>
                <Badge color={T.blue}>{p.pages?.length || 0} pages</Badge>
                <span style={{ fontSize: 11, color: T.text2, marginLeft: "auto" }}>{p.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PAGE: ELEMENTS
// ════════════════════════════════════════════════════════════
export function PageElements({ activeProject, setActiveProject }) {
  const [activePage, setActivePage] = useState(null);
  const [showNewPage, setShowNewPage] = useState(false);
  const [pageForm, setPageForm] = useState({ name: "", url: "" });
  const [elementForm, setElementForm] = useState({ label: "", type: "input", id: "", xpath: "", description: "" });
  const [htmlInput, setHtmlInput] = useState("");
  const [extractMsg, setExtractMsg] = useState("");
  const [inputTab, setInputTab] = useState("manual");

  useEffect(() => {
    if (activeProject?.pages?.length && !activePage) setActivePage(activeProject.pages[0]);
  }, [activeProject]);

  if (!activeProject) return (
    <div style={{ padding: 32, color: T.text2, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⬡</div>
      <p>Select or create a project first from Projects tab</p>
    </div>
  );

  const updateProject = (updated) => setActiveProject({ ...activeProject, ...updated });

  const addPage = () => {
    if (!pageForm.name) return;
    const newPage = { id: uid(), name: pageForm.name, url: pageForm.url, elements: [] };
    const pages = [...(activeProject.pages || []), newPage];
    updateProject({ pages });
    setActivePage(newPage);
    setPageForm({ name: "", url: "" });
    setShowNewPage(false);
  };

  const deletePage = (pid) => {
    const pages = activeProject.pages.filter(p => p.id !== pid);
    updateProject({ pages });
    setActivePage(pages[0] || null);
  };

  const getCurrentPage = () => activeProject.pages?.find(p => p.id === activePage?.id) || activePage;

  const addElement = () => {
    if (!elementForm.label || !activePage) return;
    const el = {
      ...elementForm, uid: uid(),
      locator: elementForm.id ? `id=${elementForm.id}` : elementForm.xpath || ""
    };
    const pages = activeProject.pages.map(p =>
      p.id === activePage.id ? { ...p, elements: [...(p.elements || []), el] } : p
    );
    updateProject({ pages });
    setElementForm({ label: "", type: "input", id: "", xpath: "", description: "" });
  };

  const removeElement = (eid) => {
    const pages = activeProject.pages.map(p =>
      p.id === activePage.id ? { ...p, elements: p.elements.filter(e => e.uid !== eid) } : p
    );
    updateProject({ pages });
  };

  const extractFromHTML = () => {
    if (!htmlInput.trim() || !activePage) return;
    const found = extractElementsFromHTML(htmlInput);
    if (found.length > 0) {
      const pages = activeProject.pages.map(p =>
        p.id === activePage.id ? { ...p, elements: [...(p.elements || []), ...found] } : p
      );
      updateProject({ pages });
      setExtractMsg(`✓ ${found.length} elements extracted!`);
      setHtmlInput("");
    } else {
      setExtractMsg("No elements found. Try pasting more complete HTML.");
    }
    setTimeout(() => setExtractMsg(""), 3000);
  };

  const curPage = getCurrentPage();
  const elements = curPage?.elements || [];

  const typeColor = {
    input: "#3b82f6", password: "#8b5cf6", email: "#06b6d4",
    button: "#22c55e", link: "#f59e0b", dropdown: "#ec4899",
    checkbox: "#f97316", radio: "#84cc16", textarea: "#6366f1", custom: "#94a3b8"
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Pages sidebar */}
      <div style={{
        width: 200, background: T.bg2, borderRight: `1px solid ${T.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0
      }}>
        <div style={{ padding: "16px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pages</span>
          <button onClick={() => setShowNewPage(!showNewPage)}
            style={{
              background: T.accent, border: "none", borderRadius: 5, color: "#fff",
              width: 22, height: 22, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>+</button>
        </div>

        {showNewPage && (
          <div style={{ padding: "0 10px 12px" }}>
            <input value={pageForm.name} onChange={e => setPageForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Page name"
              style={{
                width: "100%", background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 6, padding: "5px 8px", fontSize: 12, color: T.text,
                marginBottom: 5, boxSizing: "border-box", fontFamily: "inherit", outline: "none"
              }} />
            <input value={pageForm.url} onChange={e => setPageForm(p => ({ ...p, url: e.target.value }))}
              placeholder="URL (optional)"
              style={{
                width: "100%", background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 6, padding: "5px 8px", fontSize: 12, color: T.text,
                marginBottom: 6, boxSizing: "border-box", fontFamily: "inherit", outline: "none"
              }} />
            <div style={{ display: "flex", gap: 5 }}>
              <button onClick={addPage} disabled={!pageForm.name}
                style={{
                  flex: 1, background: T.accent, border: "none", borderRadius: 5, color: "#fff",
                  padding: "5px 0", fontSize: 11, cursor: "pointer", fontFamily: "inherit"
                }}>Add</button>
              <button onClick={() => setShowNewPage(false)}
                style={{
                  flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 5,
                  color: T.text2, padding: "5px 0", fontSize: 11, cursor: "pointer", fontFamily: "inherit"
                }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflow: "auto", padding: "0 8px 8px" }}>
          {(activeProject.pages || []).length === 0 ? (
            <div style={{ padding: "20px 8px", fontSize: 11, color: T.text2, textAlign: "center" }}>No pages yet</div>
          ) : (
            activeProject.pages.map(page => (
              <div key={page.id} onClick={() => setActivePage(page)}
                style={{
                  padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 2,
                  background: activePage?.id === page.id ? T.accent + "22" : "transparent",
                  border: activePage?.id === page.id ? `1px solid ${T.accent}44` : "1px solid transparent",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: activePage?.id === page.id ? 600 : 400, color: activePage?.id === page.id ? T.accentHov : T.text2 }}>{page.name}</div>
                  <div style={{ fontSize: 10, color: T.text2 }}>{page.elements?.length || 0} elements</div>
                </div>
                <button onClick={e => { e.stopPropagation(); deletePage(page.id); }}
                  style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 12 }}>✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {!activePage ? (
          <div style={{ textAlign: "center", paddingTop: 60, color: T.text2 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>◈</div>
            <p>Create a page to start adding elements</p>
          </div>
        ) : (
          <div style={{ maxWidth: 860 }}>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.text }}>{curPage?.name}</h2>
                {curPage?.url && <div style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>{curPage.url}</div>}
              </div>
              <Badge color={T.blue}>{elements.length} elements</Badge>
            </div>

            <Card style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16, background: T.bg2, padding: 4, borderRadius: 8 }}>
                {[["manual", "✏️ Manual"], ["html", "⟨/⟩ Paste HTML"]].map(([id, label]) => (
                  <button key={id} onClick={() => setInputTab(id)}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                      background: inputTab === id ? T.accent : "transparent",
                      color: inputTab === id ? "#fff" : T.text3, transition: "all 0.12s"
                    }}>{label}</button>
                ))}
              </div>

              {inputTab === "manual" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <Input label="Element Label *" value={elementForm.label}
                      onChange={v => setElementForm(p => ({ ...p, label: v }))} placeholder="e.g. Username Input" />
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>TYPE</label>
                      <select value={elementForm.type} onChange={e => setElementForm(p => ({ ...p, type: e.target.value }))}
                        style={{ width: "100%", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, color: T.text, fontFamily: "inherit", outline: "none" }}>
                        {ELEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <Input label="ID Attribute" value={elementForm.id}
                      onChange={v => setElementForm(p => ({ ...p, id: v }))} placeholder="e.g. username-input" mono />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <Input label="XPath (optional)" value={elementForm.xpath}
                      onChange={v => setElementForm(p => ({ ...p, xpath: v }))} placeholder="//input[@name='username']" mono />
                    <Input label="Description" value={elementForm.description}
                      onChange={v => setElementForm(p => ({ ...p, description: v }))} placeholder="What does this element do?" />
                  </div>
                  <Btn onClick={addElement} disabled={!elementForm.label}>+ Add Element</Btn>
                </div>
              )}

              {inputTab === "html" && (
                <div>
                  <div style={{ background: `${T.blue}10`, border: `1px solid ${T.blue}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#93c5fd", lineHeight: 1.5 }}>
                    💡 <strong>Kaise kare:</strong> App open karo → Right Click → View Page Source (Ctrl+U) → Sab select (Ctrl+A) → Copy → Paste karo
                  </div>
                  <Textarea label="HTML Source Code" value={htmlInput} onChange={setHtmlInput} rows={8}
                    placeholder={"<html>\n  <body>\n    <input id='username' type='text'/>\n    <button id='login-btn'>Login</button>\n  </body>\n</html>"} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                    <Btn onClick={extractFromHTML} disabled={!htmlInput.trim()}>⚡ Auto Extract Elements</Btn>
                    {extractMsg && <span style={{ fontSize: 12, color: extractMsg.startsWith("✓") ? T.green : T.amber }}>{extractMsg}</span>}
                  </div>
                </div>
              )}
            </Card>

            {elements.length > 0 && (
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <SectionTitle>Elements ({elements.length})</SectionTitle>
                  <Btn variant="danger" size="sm"
                    onClick={() => { const pages = activeProject.pages.map(p => p.id === activePage.id ? { ...p, elements: [] } : p); updateProject({ pages }); }}>
                    Clear All
                  </Btn>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                        {["Label", "Type", "Locator", "Description", ""].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "6px 10px", fontSize: 10, color: T.text2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {elements.map(el => (
                        <tr key={el.uid} style={{ borderBottom: `1px solid ${T.border}22` }}>
                          <td style={{ padding: "8px 10px", color: T.text, fontWeight: 500 }}>{el.label}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: (typeColor[el.type] || "#94a3b8") + "20", color: typeColor[el.type] || "#94a3b8", border: `1px solid ${(typeColor[el.type] || "#94a3b8")}40` }}>
                              {el.type}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#0369a1", fontSize: 11 }}>{el.locator || el.id || el.xpath || "—"}</td>
                          <td style={{ padding: "8px 10px", color: T.text2 }}>{el.description || "—"}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <button onClick={() => removeElement(el.uid)}
                              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
