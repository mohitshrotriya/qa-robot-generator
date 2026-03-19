import { useState, useEffect, useRef } from "react";
import { callGemini, buildRobotFile, buildXML, buildCSV, T } from "../helpers.js";
import { fileToB64 } from "../helpers.js";
import { Btn, Card, SectionTitle, Badge, Tag, Input } from "./UI.jsx";

// ════════════════════════════════════════════════════════════
//  PAGE: GENERATE
// ════════════════════════════════════════════════════════════
export function PageGenerate({ activeProject, setActiveProject, settings }) {
  const [selectedPage, setSelectedPage] = useState(null);
  const [screenshot, setScreenshot]     = useState(null);
  const [testTypes, setTestTypes]       = useState({ happy: true, positive: true, negative: true });
  const [generating, setGenerating]     = useState(false);
  const [log, setLog]                   = useState([]);
  const fileRef = useRef();
  const logRef  = useRef();

  useEffect(() => {
    if (activeProject?.pages?.length && !selectedPage) setSelectedPage(activeProject.pages[0]);
  }, [activeProject]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  if (!activeProject) return (
    <div style={{ padding: 32, color: T.text2, textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
      <p>Select a project first</p>
    </div>
  );

  const addLog = (msg, type = "info") =>
    setLog(p => [...p, { msg, type, t: new Date().toLocaleTimeString() }]);

  const generate = async () => {
    const apiKey = settings.apiKey;
    if (!apiKey) { addLog("❌ API key not set! Go to Settings tab.", "error"); return; }
    const page = activeProject.pages?.find(p => p.id === selectedPage?.id);
    if (!page) { addLog("❌ Select a page first", "error"); return; }
    const elements = page.elements || [];

    setGenerating(true);
    setLog([]);
    const typesWanted = Object.entries(testTypes).filter(([, v]) => v).map(([k]) => k).join(", ");
    addLog(`Starting: ${page.name} | Types: ${typesWanted}`);

    const prompt = `You are a senior Robot Framework QA automation engineer using Browser Library (Playwright).

Project: ${activeProject.name}
Page: ${page.name}
URL: ${page.url || activeProject.baseUrl || "https://your-app.com"}
${elements.length > 0 ? `\nElements:\n${elements.map(e => `  - "${e.label}" | type:${e.type} | locator:${e.locator || e.id || e.xpath} | desc:${e.description || ""}`).join("\n")}` : ""}

Generate test cases for types: ${typesWanted}

STRICT RULES:
1. Browser Library syntax ONLY
2. Each test MUST have [Documentation], [Tags], Take Screenshot
3. Tags: type + feature + P1/P2
4. id=xxx locators preferred
5. Happy: success. Positive: valid edge. Negative: invalid/empty
6. Max 4-5 steps per test only

Return ONLY valid JSON (no markdown, no backticks):
{
  "suite_name": "Page Name Tests",
  "test_cases": [
    {
      "name": "Login With Valid Credentials",
      "type": "happy",
      "documentation": "Verify user can login with valid credentials",
      "tags": ["happy", "login", "smoke", "P1"],
      "steps": [
        "Fill Text    id=username    valid@test.com",
        "Take Screenshot    \${SS_DIR}/fill_username.png",
        "Fill Text    id=password    ValidPass@123",
        "Click    id=login-btn",
        "Take Screenshot    \${SS_DIR}/after_login.png",
        "Get Text    css=.dashboard-title    ==    Dashboard"
      ]
    }
  ],
  "keywords": [
    {
      "name": "Fill Login Form",
      "doc": "Fills username and password",
      "args": ["\${username}", "\${password}"],
      "steps": ["Fill Text    id=username    \${username}", "Fill Text    id=password    \${password}"]
    }
  ]
}`;

    try {
      addLog("Calling Gemini AI...");
      const parts = [{ text: prompt }];
      if (screenshot) {
        parts.push({ inline_data: { mime_type: screenshot.mime, data: screenshot.data } });
        parts.push({ text: "Use the screenshot above for better test accuracy." });
        addLog("Screenshot attached — AI analyzing UI...");
      }
      const raw = await callGemini(apiKey, parts);
      addLog("Parsing response...");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      addLog(`✓ ${parsed.test_cases?.length} test cases, ${parsed.keywords?.length || 0} keywords`, "success");

      const pages = activeProject.pages.map(p =>
        p.id === page.id ? { ...p, generated: parsed, generatedAt: new Date().toLocaleString() } : p
      );
      setActiveProject({ ...activeProject, pages });
    } catch (err) {
      addLog("❌ Error: " + err.message, "error");
    }
    setGenerating(false);
  };

  const curPage   = activeProject.pages?.find(p => p.id === selectedPage?.id);
  const generated = curPage?.generated;
  const typeColor = { happy: T.green, positive: T.blue, negative: T.red };

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Generate Tests</h1>
        <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>AI generates complete Robot Framework test cases</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Config */}
        <Card>
          <SectionTitle>Configuration</SectionTitle>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>SELECT PAGE</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(activeProject.pages || []).map(p => (
                <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: selectedPage?.id === p.id ? T.accent + "15" : T.bg2, border: `1px solid ${selectedPage?.id === p.id ? T.accent + "50" : T.border}` }}>
                  <input type="radio" checked={selectedPage?.id === p.id} onChange={() => setSelectedPage(p)} style={{ accentColor: T.accent }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: T.text2 }}>{p.elements?.length || 0} elements</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>TEST TYPES</label>
            {[["happy", "✅", "Happy Path", T.green], ["positive", "➕", "Positive", T.blue], ["negative", "❌", "Negative", T.red]].map(([k, icon, label, color]) => (
              <label key={k} onClick={() => setTestTypes(p => ({ ...p, [k]: !p[k] }))}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: testTypes[k] ? color + "10" : T.bg2, border: `1px solid ${testTypes[k] ? color + "40" : T.border}` }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${testTypes[k] ? color : T.border}`, background: testTypes[k] ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {testTypes[k] && <span style={{ color: "#fff", fontSize: 10 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Screenshot */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: T.text2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>
              SCREENSHOT <span style={{ color: T.text2, fontWeight: 400, textTransform: "none" }}>(optional)</span>
            </label>
            <div onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${screenshot ? T.green : T.border}`, borderRadius: 10, padding: "16px 12px", textAlign: "center", cursor: "pointer", background: screenshot ? T.green + "08" : T.bg2 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={async e => { const f = e.target.files[0]; if (f) { const b64 = await fileToB64(f); setScreenshot({ data: b64, mime: f.type, name: f.name }); } }} />
              {screenshot ? (
                <div>
                  <img src={`data:${screenshot.mime};base64,${screenshot.data}`} alt="" style={{ maxHeight: 80, borderRadius: 6, marginBottom: 6, objectFit: "contain" }} />
                  <div style={{ fontSize: 11, color: T.green }}>✓ {screenshot.name}</div>
                  <button onClick={e => { e.stopPropagation(); setScreenshot(null); }} style={{ marginTop: 4, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 11 }}>Remove</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🖼️</div>
                  <div style={{ fontSize: 12, color: T.text2 }}>Upload page screenshot for better accuracy</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Log */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <SectionTitle>Generation Log</SectionTitle>
            <Btn onClick={() => setLog([])} variant="ghost" size="sm">Clear</Btn>
          </div>
          <div ref={logRef} style={{ background: "#1e293b", borderRadius: 8, padding: 12, height: 280, overflowY: "auto", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>
            {log.length === 0 ? <span style={{ color: T.text2 }}>$ Waiting...</span> :
              log.map((l, i) => (
                <div key={i} style={{ color: l.type === "error" ? T.red : l.type === "success" ? T.green : T.text2 }}>
                  <span style={{ color: T.text2 }}>[{l.t}]</span> {l.msg}
                </div>
              ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Btn onClick={generate} disabled={generating || !settings.apiKey} variant="primary" style={{ width: "100%" }}>
              {generating ? "⏳ Generating..." : "⚡ Generate with Gemini AI"}
            </Btn>
            {!settings.apiKey && <div style={{ fontSize: 11, color: T.amber, marginTop: 6, textAlign: "center" }}>⚠️ Set Gemini API key in Settings first</div>}
          </div>
        </Card>
      </div>

      {/* Preview */}
      {generated && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{generated.suite_name}</div>
              <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>Generated: {curPage?.generatedAt} · {generated.test_cases?.length} test cases</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Badge color={T.green}>{generated.test_cases?.filter(t => t.type === "happy").length} happy</Badge>
              <Badge color={T.blue}>{generated.test_cases?.filter(t => t.type === "positive").length} positive</Badge>
              <Badge color={T.red}>{generated.test_cases?.filter(t => t.type === "negative").length} negative</Badge>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
            {generated.test_cases?.map((tc, i) => (
              <div key={i} style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", border: `1px solid ${(typeColor[tc.type] || T.border)}30` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{tc.name}</div>
                    <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>{tc.documentation}</div>
                  </div>
                  <Badge color={typeColor[tc.type] || T.blue}>{tc.type}</Badge>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {tc.tags?.map(t => <Tag key={t} label={t} />)}
                </div>
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                  {tc.steps?.slice(0, 4).map((s, j) => (
                    <div key={j} style={{ fontSize: 11, fontFamily: "monospace", color: "#166534", padding: "1px 0 1px 10px", borderLeft: `2px solid ${T.border}`, marginBottom: 2 }}>{s}</div>
                  ))}
                  {(tc.steps?.length || 0) > 4 && <div style={{ fontSize: 10, color: T.text2, paddingLeft: 10, marginTop: 2 }}>+{tc.steps.length - 4} more steps...</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PAGE: EDITOR
// ════════════════════════════════════════════════════════════
export function PageEditor({ activeProject }) {
  const [selectedPage, setSelectedPage] = useState(null);

  useEffect(() => {
    if (activeProject?.pages?.length && !selectedPage) {
      const withGen = activeProject.pages.find(p => p.generated);
      setSelectedPage(withGen || activeProject.pages[0]);
    }
  }, [activeProject]);

  if (!activeProject) return (
    <div style={{ padding: 32, color: T.text2, textAlign: "center", paddingTop: 80 }}>
      <p>Select a project first</p>
    </div>
  );

  const page = activeProject.pages?.find(p => p.id === selectedPage?.id);
  const gen  = page?.generated;
  const typeColor = { happy: T.green, positive: T.blue, negative: T.red };

  return (
    <div style={{ padding: 28, maxWidth: 960 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Test Editor</h1>
          <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>Review generated test cases</p>
        </div>
        <select value={selectedPage?.id || ""} onChange={e => setSelectedPage(activeProject.pages?.find(pg => pg.id === e.target.value) || null)}
          style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, color: T.text, fontFamily: "inherit", outline: "none" }}>
          {(activeProject.pages || []).map(p => <option key={p.id} value={p.id}>{p.name} {p.generated ? "✓" : ""}</option>)}
        </select>
      </div>

      {!gen ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✎</div>
          <p style={{ color: T.text2 }}>No generated tests yet. Go to Generate tab first.</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label: "Total Tests", value: gen.test_cases?.length || 0, color: T.accent },
              { label: "Happy Path",  value: gen.test_cases?.filter(t => t.type === "happy").length || 0, color: T.green },
              { label: "Positive",    value: gen.test_cases?.filter(t => t.type === "positive").length || 0, color: T.blue },
              { label: "Negative",    value: gen.test_cases?.filter(t => t.type === "negative").length || 0, color: T.red },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 11, color: T.text2, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          {gen.test_cases?.map((tc, i) => {
            const borderColor = typeColor[tc.type] || T.border;
            return (
              <Card key={i} style={{ borderLeft: `3px solid ${borderColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{tc.name}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>[Documentation] {tc.documentation}</div>
                  </div>
                  <Badge color={borderColor}>{tc.type}</Badge>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                  {tc.tags?.map(t => <Tag key={t} label={t} />)}
                </div>
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 12 }}>
                  {tc.steps?.map((s, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, padding: "3px 0", borderBottom: j < tc.steps.length - 1 ? `1px solid ${T.border}22` : "none" }}>
                      <span style={{ fontSize: 10, color: T.text2, minWidth: 20, paddingTop: 2 }}>{j + 1}</span>
                      <code style={{ fontSize: 11, color: s.includes("Take Screenshot") ? "#fbbf24" : s.includes("Should") ? "#34d399" : s.includes("Click") ? "#60a5fa" : "#e2e8f0", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.6 }}>{s}</code>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PAGE: EXPORT
// ════════════════════════════════════════════════════════════
export function PageExport({ activeProject, settings }) {
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeTab, setActiveTab]       = useState("robot");
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (activeProject?.pages?.length && !selectedPage) {
      const withGen = activeProject.pages.find(p => p.generated);
      setSelectedPage(withGen || activeProject.pages[0]);
    }
  }, [activeProject]);

  if (!activeProject) return (
    <div style={{ padding: 32, color: T.text2, textAlign: "center", paddingTop: 80 }}>
      <p>Select a project first</p>
    </div>
  );

  const page = activeProject.pages?.find(p => p.id === selectedPage?.id);
  const gen  = page?.generated;

  const robotContent = gen ? buildRobotFile(activeProject, page, gen.test_cases || [], gen.keywords || [], settings.browserMode || "headless") : "";
  const xmlContent   = gen ? buildXML(activeProject, page, gen.test_cases || []) : "";
  const csvContent   = gen ? buildCSV(activeProject, page, gen.test_cases || []) : "";
  const fileName     = (page?.name || "suite").replace(/\s+/g, "_").toLowerCase();

  const ghYAML = `name: Robot Framework Tests
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install robotframework
          pip install robotframework-browser
          rfbrowser init
      - name: Run Tests
        run: robot --outputdir results ${fileName}.robot
      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: robot-results
          path: results/`;

  const download = (content, name, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = name; a.click();
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: "robot",  label: "🤖 .robot File"    },
    { id: "xml",    label: "📋 XML Export"      },
    { id: "csv",    label: "📊 Google Sheet"    },
    { id: "github", label: "⚙ GitHub Actions"  },
    { id: "setup",  label: "📖 Setup Guide"     },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 900 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Export</h1>
          <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>Download .robot, XML, CSV or GitHub Actions</p>
        </div>
        <select value={selectedPage?.id || ""} onChange={e => setSelectedPage(activeProject.pages?.find(pg => pg.id === e.target.value) || null)}
          style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, color: T.text, fontFamily: "inherit", outline: "none" }}>
          {(activeProject.pages || []).map(p => <option key={p.id} value={p.id}>{p.name} {p.generated ? "✓" : ""}</option>)}
        </select>
      </div>

      {!gen ? (
        <Card style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>↓</div>
          <p style={{ color: T.text2 }}>Generate tests first from the Generate tab</p>
        </Card>
      ) : (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { l: "Test Cases", v: gen.test_cases?.length || 0,       c: T.accent },
              { l: "Keywords",   v: (gen.keywords?.length || 0) + 3,   c: "#8b5cf6" },
              { l: "Browser",    v: settings.browserMode || "headless", c: T.text2  },
              { l: "Suite",      v: gen.suite_name || "—",              c: T.text2  },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: c, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div>
                <div style={{ fontSize: 10, color: T.text2, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: T.bg2, padding: 4, borderRadius: 10, marginBottom: 16, border: `1px solid ${T.border}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex: 1, padding: "8px 0", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit", background: activeTab === t.id ? T.accent : "transparent", color: activeTab === t.id ? "#fff" : T.text3, transition: "all 0.12s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Robot File */}
          {activeTab === "robot" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "monospace" }}>{fileName}.robot</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant={copied ? "success" : "ghost"} size="sm" onClick={() => copy(robotContent)}>{copied ? "✓ Copied" : "Copy"}</Btn>
                  <Btn variant="primary" size="sm" onClick={() => download(robotContent, `${fileName}.robot`)}>⬇ Download</Btn>
                </div>
              </div>
              <pre style={{ background: "#1e293b", borderRadius: 8, padding: 14, margin: 0, fontSize: 11, color: "#86efac", fontFamily: "'JetBrains Mono',monospace", overflow: "auto", maxHeight: 380, lineHeight: 1.7 }}>{robotContent}</pre>
            </Card>
          )}

          {/* XML Export */}
          {activeTab === "xml" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{fileName}.xml</div>
                  <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>Robot Framework compatible XML output format</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => copy(xmlContent)}>Copy</Btn>
                  <Btn variant="primary" size="sm" onClick={() => download(xmlContent, `${fileName}.xml`, "application/xml")}>⬇ Download XML</Btn>
                </div>
              </div>
              <pre style={{ background: "#1e293b", borderRadius: 8, padding: 14, margin: 0, fontSize: 11, color: "#93c5fd", fontFamily: "'JetBrains Mono',monospace", overflow: "auto", maxHeight: 380, lineHeight: 1.7 }}>{xmlContent}</pre>
            </Card>
          )}

          {/* CSV / Google Sheet */}
          {activeTab === "csv" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{fileName}.csv</div>
                  <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>Import directly into Google Sheets</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => copy(csvContent)}>Copy</Btn>
                  <Btn variant="primary" size="sm" onClick={() => download(csvContent, `${fileName}.csv`, "text/csv")}>⬇ Download CSV</Btn>
                </div>
              </div>
              <div style={{ background: `${T.green}10`, border: `1px solid ${T.green}30`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#86efac" }}>
                📊 <strong>Google Sheets me import kaise karein:</strong> Google Sheets kholo → File → Import → Upload → CSV file select karo → Import Data
              </div>
              <pre style={{ background: "#1e293b", borderRadius: 8, padding: 14, margin: 0, fontSize: 11, color: "#fde68a", fontFamily: "'JetBrains Mono',monospace", overflow: "auto", maxHeight: 380, lineHeight: 1.7 }}>{csvContent}</pre>
            </Card>
          )}

          {/* GitHub Actions */}
          {activeTab === "github" && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>robot-tests.yml</div>
                  <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>Save as .github/workflows/robot-tests.yml</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => copy(ghYAML)}>Copy</Btn>
                  <Btn variant="primary" size="sm" onClick={() => download(ghYAML, "robot-tests.yml")}>⬇ Download</Btn>
                </div>
              </div>
              <pre style={{ background: "#1e293b", borderRadius: 8, padding: 14, margin: 0, fontSize: 11, color: "#93c5fd", fontFamily: "'JetBrains Mono',monospace", overflow: "auto", maxHeight: 380, lineHeight: 1.7 }}>{ghYAML}</pre>
            </Card>
          )}

          {/* Setup Guide */}
          {activeTab === "setup" && (
            <Card>
              <SectionTitle>Run Karne Ka Tarika</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { n: "1", title: "Python Install Karo",      cmd: "python.org/downloads",                  note: "Download LTS · ek baar" },
                  { n: "2", title: "Robot Framework",          cmd: "pip install robotframework",             note: "Terminal me chalao" },
                  { n: "3", title: "Browser Library",          cmd: "pip install robotframework-browser",     note: "Playwright-based" },
                  { n: "4", title: "Playwright Browsers",      cmd: "rfbrowser init",                         note: "Chromium install hoga" },
                  { n: "5", title: `Tests Run Karo`,           cmd: `robot ${fileName}.robot`,                note: `${settings.browserMode || "headless"} mode` },
                  { n: "6", title: "Report Open Karo",         cmd: "xdg-open report.html",                  note: "Screenshots bhi honge" },
                ].map(({ n, title, cmd, note }) => (
                  <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "12px 14px", background: T.bg2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent + "30", border: `1px solid ${T.accent}60`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: T.accentHov, flexShrink: 0 }}>{n}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{title} <span style={{ color: T.text2, fontSize: 11, fontWeight: 400 }}>— {note}</span></div>
                      <code style={{ fontSize: 12, color: "#4ade80", fontFamily: "monospace", background: T.bg, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>{cmd}</code>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PAGE: SETTINGS
// ════════════════════════════════════════════════════════════
export function PageSettings({ settings, setSettings }) {
  const [saved, setSaved] = useState(false);

  const save = () => {
    try { localStorage.setItem("qa_robot_settings", JSON.stringify(settings)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 32, maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: T.text2, marginTop: 4 }}>Configure API key and preferences</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* API Key */}
        <Card>
          <SectionTitle sub="Get free key from aistudio.google.com (1500 req/day)">🔑 Gemini API Key</SectionTitle>
          <Input label="API Key" value={settings.apiKey}
            onChange={v => setSettings(p => ({ ...p, apiKey: v }))}
            placeholder="AIzaSy..." type="password" />
          <div style={{ marginTop: 10, fontSize: 12, color: T.text2 }}>
            Free tier: <span style={{ color: T.green }}>1500 requests/day</span> ·
            Get it at <span style={{ color: T.accent }}>aistudio.google.com</span>
          </div>
        </Card>

        {/* Browser Mode */}
        <Card>
          <SectionTitle>🌐 Default Browser Mode</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { val: "headless", icon: "👻", label: "Headless", desc: "Browser nahi dikhega. CI/CD ke liye best." },
              { val: "headed",   icon: "👁️", label: "Headed",   desc: "Browser dikhega. Debug ke liye best." },
            ].map(({ val, icon, label, desc }) => (
              <button key={val} onClick={() => setSettings(p => ({ ...p, browserMode: val }))}
                style={{ padding: 14, borderRadius: 10, textAlign: "left", cursor: "pointer", fontFamily: "inherit", border: `1px solid ${settings.browserMode === val ? T.accent + "80" : T.border}`, background: settings.browserMode === val ? T.accent + "12" : T.bg2 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</div>
                <div style={{ fontSize: 11, color: T.text2, marginTop: 4, lineHeight: 1.4 }}>{desc}</div>
              </button>
            ))}
          </div>
        </Card>

        <Btn onClick={save} variant={saved ? "success" : "primary"} size="lg" style={{ alignSelf: "flex-start" }}>
          {saved ? "✓ Saved!" : "Save Settings"}
        </Btn>
      </div>
    </div>
  );
}
