import { useState, useCallback, useRef, useMemo, useEffect } from "react";

/**
 * INSTALLATION
 * npm install qrcode
 * npm install --save-dev @types/qrcode
 */
import QRCode from "qrcode";

/* ─── Thèmes ─── */
const THEMES = {
  dark: {
    "--bg-app": "#0a0a0f",
    "--bg-panel": "#111118",
    "--border": "rgba(255,255,255,0.06)",
    "--text-main": "#f0f0f5",
    "--text-muted": "#6b6b80",
    "--bg-inp": "#0a0a0f",
    "--bg-ghost": "#1a1a24",
    "--primary": "#7c6af7",
  },
  light: {
    "--bg-app": "#f3f4f6",
    "--bg-panel": "#ffffff",
    "--border": "#e5e7eb",
    "--text-main": "#111827",
    "--text-muted": "#6b7280",
    "--bg-inp": "#f9fafb",
    "--bg-ghost": "#f3f4f6",
    "--primary": "#6366f1",
  },
};

/* ─── Styles partagés ─── */
const s = {
  panel: {
    background: "var(--bg-panel)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 24,
    display: "flex", flexDirection: "column", gap: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: 500, color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 6,
    fontFamily: "'Inter', sans-serif",
  },
  inp: {
    width: "100%",
    background: "var(--bg-inp)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "var(--text-main)",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
  },
  range: { width: "100%", accentColor: "#a78bfa" },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "var(--primary)",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--bg-ghost)",
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  tog: {
    flex: 1,
    padding: "8px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "center",
    fontFamily: "'Inter', sans-serif",
  },
  togActive: {
    background: "rgba(124,106,247,0.12)",
    borderColor: "#7c6af7",
    color: "#a78bfa",
  },
  outputBox: {
    background: "#0a0a0f",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 8,
    padding: 14,
    position: "relative",
  },
  copyBtn: {
    background: "#1a1a24",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    color: "#6b6b80",
  },
};

/* ─── QR Generator ─── */
function QRGenerator({ isDark }) {
  const [val, setVal]     = useState("");
  const [size, setSize]   = useState(250);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef(null);

  const generate = useCallback(() => {
    if (!val.trim() || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, val.trim(), {
      width: size,
      margin: 2,
      // Adaptation des couleurs du QR selon le thème pour qu'il reste lisible
      color: { dark: isDark ? "#a78bfa" : "#4f46e5", light: isDark ? "#0a0a0f" : "#ffffff" },
      errorCorrectionLevel: "H",
    }, (err) => { if (!err) setReady(true); });
  }, [val, size, isDark]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.download = "qrcode.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div style={s.panel}>
      <div>
        <p style={s.label}>Contenu</p>
        <input
          style={s.inp}
          placeholder="https://example.com ou n'importe quel texte..."
          value={val}
          onChange={(e) => { setVal(e.target.value); setReady(false); }}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
      </div>
      <div>
        <p style={s.label}>Taille — {size}px</p>
        <input type="range" min="150" max="400" step="50" value={size}
          onChange={(e) => { setSize(+e.target.value); setReady(false); }}
          style={s.range} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={s.btnPrimary} onClick={generate} title="Créer le QR Code">Générer</button>
        {ready && <button style={s.btnGhost} onClick={download} title="Enregistrer l'image PNG">↓ Télécharger</button>}
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <canvas ref={canvasRef}
          style={{ borderRadius: 10, border: "1px solid var(--border)", display: ready ? "block" : "none" }} />
      </div>
    </div>
  );
}

/* ─── Base64 ─── */
function Base64Tool() {
  const [mode, setMode]     = useState("encode");
  const [inp, setInp]       = useState("");
  const [out, setOut]       = useState("");
  const [err, setErr]       = useState(false);
  const [copied, setCopied] = useState(false);

  const run = () => {
    setErr(false);
    try {
      setOut(mode === "encode"
        ? btoa(unescape(encodeURIComponent(inp)))
        : decodeURIComponent(escape(atob(inp))));
    } catch { setErr(true); setOut(""); }
  };

  const copy = () => {
    navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const swap = () => {
    setInp(out); setOut("");
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div style={s.panel}>
      <div style={{ display: "flex", gap: 6 }}>
        {["encode", "decode"].map((m) => (
          <button key={m}
            onClick={() => { setMode(m); setOut(""); setErr(false); }}
            style={{ ...s.tog, ...(mode === m ? s.togActive : {}) }}
            title={m === "encode" ? "Convertir du texte vers Base64" : "Convertir du Base64 vers texte"}>
            {m === "encode" ? "Encoder" : "Décoder"}
          </button>
        ))}
      </div>
      <div>
        <p style={s.label}>{mode === "encode" ? "Texte à encoder" : "Base64 à décoder"}</p>
        <textarea
          style={{ ...s.inp, resize: "none" }} rows={4}
          placeholder={mode === "encode" ? "Entrez votre texte..." : "Entrez une chaîne Base64..."}
          value={inp} onChange={(e) => setInp(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={s.btnPrimary} onClick={run} title="Lancer la conversion">Convertir</button>
        {out && <button style={s.btnGhost} onClick={swap} title="Inverser l'entrée et la sortie">⇄ Swap</button>}
      </div>
      {err && <p style={{ fontSize: 12, color: "#f87171", fontFamily: "'Inter',sans-serif" }}>⚠ Chaîne Base64 invalide</p>}
      {out && (
        <div style={s.outputBox}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, wordBreak: "break-all", lineHeight: 1.7, color: "var(--text-main)", paddingRight: 60, display: "block" }}>
            {out}
          </span>
          <button onClick={copy}
            title="Copier le résultat dans le presse-papier"
            style={{ ...s.copyBtn, position: "absolute", top: 8, right: 8, color: copied ? "#34d399" : "#6b6b80" }}>
            {copied ? "✓" : "Copier"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Password Generator ─── */
const CHARS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  num:   "0123456789",
  sym:   "!@#$%^&*()-_=+[]{}|;:,.?",
};
const OPT_LABELS = {
  upper: "A–Z majuscules",
  lower: "a–z minuscules",
  num:   "0–9 chiffres",
  sym:   "!@# symboles",
};
const STR_COLORS = ["#6b6b80", "#f87171", "#fbbf24", "#34d399", "#a78bfa"];
const STR_LABELS = ["—", "Faible", "Moyen", "Fort", "Très fort"];

function PasswordGenerator() {
  const [len, setLen]       = useState(16);
  const [opts, setOpts]     = useState({ upper: true, lower: true, num: true, sym: true });
  const [pw, setPw]         = useState("");
  const [copied, setCopied] = useState(false);

  const toggle = (k) => setOpts((o) => ({ ...o, [k]: !o[k] }));

  const pool = useMemo(() => Object.entries(opts).filter(([, v]) => v).map(([k]) => CHARS[k]).join(""), [opts]);

  const gen = useCallback(() => {
    if (!pool) return;
    setPw(Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join(""));
    setCopied(false);
  }, [len, pool]);

  const copy = () => {
    navigator.clipboard.writeText(pw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const strength = (() => {
    if (!pw) return 0;
    let sc = 0;
    if (pw.length >= 12) sc++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) sc++;
    if (/[0-9]/.test(pw)) sc++;
    if (/[^a-zA-Z0-9]/.test(pw)) sc++;
    return Math.min(sc, 4);
  })();

  const entropy = pool.length ? (Math.log2(pool.length) * len).toFixed(1) : "0";

  return (
    <div style={s.panel}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ ...s.label, marginBottom: 0 }}>Longueur</p>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#a78bfa" }}>{len}</span>
        </div>
        <input type="range" min="8" max="64" value={len} step="1"
          onChange={(e) => setLen(+e.target.value)} style={s.range} />
      </div>
      <div>
        <p style={{ ...s.label, marginBottom: 8 }}>Options</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.keys(opts).map((k) => (
            <div key={k} onClick={() => toggle(k)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: opts[k] ? "rgba(124,106,247,0.08)" : "var(--bg-inp)",
              border: `1px solid ${opts[k] ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 8, padding: "10px 12px", cursor: "pointer",
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                background: opts[k] ? "var(--primary)" : "transparent",
                border: `1px solid ${opts[k] ? "var(--primary)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {opts[k] && <span style={{ color: "white", fontSize: 10, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, fontFamily: "'Inter',sans-serif", color: opts[k] ? "var(--text-main)" : "var(--text-muted)" }}>
                {OPT_LABELS[k]}
              </span>
            </div>
          ))}
        </div>
      </div>
      <button style={{ ...s.btnPrimary, alignSelf: "flex-start" }} onClick={gen} title="Créer un nouveau mot de passe aléatoire">Générer</button>
      {pw && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-inp)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, letterSpacing: "0.04em", flex: 1, wordBreak: "break-all", color: "var(--text-main)" }}>
              {pw}
            </span>
            <button onClick={copy} style={{ ...s.copyBtn, color: copied ? "#34d399" : "#6b6b80" }} title="Copier le mot de passe">
              {copied ? "✓" : "Copier"}
            </button>
          </div>
          <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ height: "100%", width: `${(strength / 4) * 100}%`, background: STR_COLORS[strength], borderRadius: 2, transition: "width .4s, background .4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: STR_COLORS[strength], fontFamily: "'Inter',sans-serif" }}>{STR_LABELS[strength]}</span>
            <span style={{ fontSize: 11, color: "#6b6b80", fontFamily: "'Inter',sans-serif" }}>{entropy} bits d'entropie</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── App Shell ─── */
const TOOLS = [
  { id: "qr",  label: "QR Code"  },
  { id: "b64", label: "Base64"   },
  { id: "pw",  label: "Password" },
];

export default function App() {
  const [active, setActive] = useState("qr");
  // Initialisation paresseuse (lazy) pour lire le localStorage une seule fois au chargement
  const [theme, setTheme]   = useState(() => localStorage.getItem("utilkit_theme") || "dark");

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Sauvegarde dans le localStorage à chaque changement de thème
  useEffect(() => {
    localStorage.setItem("utilkit_theme", theme);
  }, [theme]);

  return (
    <div style={{ ...THEMES[theme], background: "var(--bg-app)", minHeight: "100vh", fontFamily: "'Inter', sans-serif", transition: "background 0.3s" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" />
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 16 }}>⬡</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-main)" }}>UtilKit</span>
          </div>
          <button onClick={toggleTheme} style={{
            background: theme === "dark" ? "#ffffff" : "#111118", // Fond blanc en mode sombre, fond noir en mode clair
            color: theme === "dark" ? "#000000" : "#ffffff",      // Icône noire en mode sombre, icône blanche en mode clair
            border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s"
          }}
          title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}>
            {theme === "dark" ? "☼" : "☾"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 28, paddingLeft: 42 }}>Outils developer — 100% client-side</p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              flex: 1, padding: "8px", border: "none",
              background: active === t.id ? "var(--bg-ghost)" : "transparent",
              color: active === t.id ? "var(--text-main)" : "var(--text-muted)",
              borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
              transition: "all .18s", fontFamily: "'Inter', sans-serif",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {active === "qr"  && <QRGenerator isDark={theme === "dark"} />}
        {active === "b64" && <Base64Tool />}
        {active === "pw"  && <PasswordGenerator />}

        <div style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>UtilKit</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>zero tracking · zero server</span>
        </div>
      </div>
    </div>
  );
}
