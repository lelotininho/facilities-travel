import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const DEMO_USER = { email: "voce@email.com", name: "Wesley", pin: "1234", phone: "+55 (11) 9****-8821", avatar: "WS" };
const SESSION_TIMEOUT_MS = 5 * 60 * 1000;
const BIOMETRIC_SUPPORTED = typeof window !== "undefined" && !!(window.PublicKeyCredential || navigator.credentials);

// ─── Accessibility Context ────────────────────────────────────────────────────
const A11yContext = createContext(null);
const useA11y = () => useContext(A11yContext);

function A11yProvider({ children }) {
  const [fontSize, setFontSize] = useState(1);       // 0.85 | 1 | 1.2 | 1.5
  const [highContrast, setHighContrast] = useState(false);
  const [colorBlind, setColorBlind] = useState("none"); // none | deuteranopia | protanopia | monochrome
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [largeTargets, setLargeTargets] = useState(false);
  const [announce, setAnnounce] = useState("");

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setReduceMotion(true);
  }, []);

  const speak = useCallback((msg) => {
    setAnnounce(msg);
    if (screenReader && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      u.lang = "pt-BR";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    }
    setTimeout(() => setAnnounce(""), 3000);
  }, [screenReader]);

  // Color blind CSS filters
  const cbFilter = {
    none: "none",
    deuteranopia: "url(#deuteranopia)",
    protanopia: "url(#protanopia)",
    monochrome: "grayscale(100%)",
  }[colorBlind];

  const colors = highContrast ? {
    teal: "#00FFD0", fg: "#FFFFFF", bg: "#000000",
    card: "#111111", border: "#FFFFFF", muted: "rgba(255,255,255,0.7)",
    accent: "#FFFF00", danger: "#FF4444", warn: "#FFAA00",
    surface: "#1A1A1A",
  } : {
    teal: "#1AD9A4", fg: "#F0EDE8", bg: "#070A12",
    card: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.06)", muted: "rgba(240,237,232,0.45)",
    accent: "#FFD93D", danger: "#FF6B6B", warn: "#FF8C42",
    surface: "rgba(255,255,255,0.03)",
  };

  return (
    <A11yContext.Provider value={{ fontSize, setFontSize, highContrast, setHighContrast, colorBlind, setColorBlind, reduceMotion, setReduceMotion, screenReader, setScreenReader, largeTargets, setLargeTargets, speak, colors, cbFilter }}>
      {/* SVG color-blind filters */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
      {/* Live region for screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true"
        style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
        {announce}
      </div>
      {children}
    </A11yContext.Provider>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const destinations = [
  { id: 1, name: "Lisboa", country: "Portugal", emoji: "🇵🇹", tag: "Cultural", price: "R$ 2.890", rawPrice: 2890, miles: "45.000 pts", img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80", temp: "22°C", tip: "Passe de bonde + museus grátis aos domingos", saving: "60%", iata: "LIS", a11y: { wheelchair: true, braille: true, audioGuide: true, signLang: false } },
  { id: 2, name: "Buenos Aires", country: "Argentina", emoji: "🇦🇷", tag: "Gastronomia", price: "R$ 1.200", rawPrice: 1200, miles: "18.000 pts", img: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80", temp: "18°C", tip: "Carnes incríveis por menos de R$20", saving: "45%", iata: "EZE", a11y: { wheelchair: true, braille: false, audioGuide: true, signLang: true } },
  { id: 3, name: "Tóquio", country: "Japão", emoji: "🇯🇵", tag: "Aventura", price: "R$ 5.400", rawPrice: 5400, miles: "72.000 pts", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", temp: "16°C", tip: "7-Eleven supera restaurantes caros", saving: "40%", iata: "NRT", a11y: { wheelchair: true, braille: true, audioGuide: true, signLang: true } },
  { id: 4, name: "Medellín", country: "Colômbia", emoji: "🇨🇴", tag: "Natureza", price: "R$ 980", rawPrice: 980, miles: "14.000 pts", img: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=600&q=80", temp: "24°C", tip: "Metrô + teleférico = tour completo por R$8", saving: "70%", iata: "MDE", a11y: { wheelchair: false, braille: false, audioGuide: false, signLang: true } },
  { id: 5, name: "Roma", country: "Itália", emoji: "🇮🇹", tag: "História", price: "R$ 4.100", rawPrice: 4100, miles: "58.000 pts", img: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&q=80", temp: "20°C", tip: "Coliseu gratuito para menores de 18 anos", saving: "35%", iata: "FCO", a11y: { wheelchair: true, braille: true, audioGuide: true, signLang: false } },
  { id: 6, name: "Bali", country: "Indonésia", emoji: "🇮🇩", tag: "Praia", price: "R$ 4.800", rawPrice: 4800, miles: "65.000 pts", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", temp: "30°C", tip: "Warung locais custam 1/5 dos turísticos", saving: "55%", iata: "DPS", a11y: { wheelchair: false, braille: false, audioGuide: true, signLang: false } },
  // Destinos adicionais
  { id: 7, name: "San Andrés", country: "Colômbia", emoji: "🇨🇴", tag: "Praia", price: "R$ 2.100", rawPrice: 2100, miles: "32.000 pts", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", temp: "28°C", tip: "Mar dos 7 cores e snorkeling incrível por menos de R$50", saving: "50%", iata: "ADZ", a11y: { wheelchair: false, braille: false, audioGuide: false, signLang: false } },
  { id: 8, name: "Florianópolis", country: "Brasil", emoji: "🇧🇷", tag: "Praia", price: "R$ 450", rawPrice: 450, miles: "8.000 pts", img: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600&q=80", temp: "26°C", tip: "42 praias — pegue o ônibus intermunicipal por R$5", saving: "65%", iata: "FLN", a11y: { wheelchair: true, braille: false, audioGuide: false, signLang: false } },
  { id: 9, name: "Fernando de Noronha", country: "Brasil", emoji: "🇧🇷", tag: "Praia", price: "R$ 1.200", rawPrice: 1200, miles: "18.000 pts", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80", temp: "29°C", tip: "Alugue buggy com amigos e divida o custo — economia de 60%", saving: "40%", iata: "FEN", a11y: { wheelchair: false, braille: false, audioGuide: false, signLang: false } },
  { id: 10, name: "Cancún", country: "México", emoji: "🇲🇽", tag: "Praia", price: "R$ 3.200", rawPrice: 3200, miles: "48.000 pts", img: "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=600&q=80", temp: "30°C", tip: "Zona hoteleira tem praias públicas — sem pagar resort", saving: "45%", iata: "CUN", a11y: { wheelchair: true, braille: false, audioGuide: true, signLang: false } },
  { id: 11, name: "Miami", country: "EUA", emoji: "🇺🇸", tag: "Praia", price: "R$ 4.600", rawPrice: 4600, miles: "62.000 pts", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", temp: "29°C", tip: "South Beach é pública e gratuita — evite os caros beach clubs", saving: "35%", iata: "MIA", a11y: { wheelchair: true, braille: true, audioGuide: true, signLang: true } },
  { id: 12, name: "Paris", country: "França", emoji: "🇫🇷", tag: "Cultural", price: "R$ 4.900", rawPrice: 4900, miles: "66.000 pts", img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80", temp: "18°C", tip: "Museu d'Orsay e Louvre são gratuitos no primeiro domingo do mês", saving: "38%", iata: "CDG", a11y: { wheelchair: true, braille: true, audioGuide: true, signLang: true } },
  { id: 13, name: "Chapada Diamantina", country: "Brasil", emoji: "🇧🇷", tag: "Natureza", price: "R$ 600", rawPrice: 600, miles: "10.000 pts", img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80", temp: "24°C", tip: "Guias locais cobram R$80/dia por grupo — divida com outros turistas", saving: "55%", iata: "LEC", a11y: { wheelchair: false, braille: false, audioGuide: false, signLang: false } },
  { id: 14, name: "Cartagena", country: "Colômbia", emoji: "🇨🇴", tag: "Praia", price: "R$ 1.800", rawPrice: 1800, miles: "28.000 pts", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", temp: "32°C", tip: "Ciudad amurallada: passeio histórico gratuito ao pôr do sol", saving: "48%", iata: "CTG", a11y: { wheelchair: true, braille: false, audioGuide: true, signLang: false } },
  { id: 15, name: "Bonito", country: "Brasil", emoji: "🇧🇷", tag: "Natureza", price: "R$ 700", rawPrice: 700, miles: "11.000 pts", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", temp: "27°C", tip: "Pacotes com múltiplos passeios saem 40% mais baratos que avulsos", saving: "50%", iata: "BYO", a11y: { wheelchair: false, braille: false, audioGuide: false, signLang: false } },
];

const a11yTips = [
  { icon: "♿", title: "Cadeirantes", desc: "Filtre destinos com rampas, metrô acessível e hotéis adaptados certificados", color: "#4EC3FF" },
  { icon: "👁️‍🗨️", title: "Deficiência Visual", desc: "Audioguias disponíveis, roteiros em Braille e aplicativos com descrição de imagem", color: "#9C8FFF" },
  { icon: "👂", title: "Deficiência Auditiva", desc: "Destinos com intérpretes de Libras, legendas e alertas visuais em museus", color: "#FFD93D" },
  { icon: "🧠", title: "Deficiência Cognitiva", desc: "Roteiros simplificados, pictogramas e guias com linguagem clara e pausada", color: "#FF8C42" },
  { icon: "🦯", title: "Mobilidade Reduzida", desc: "Hostels e hotéis com banheiros adaptados, elevadores e corrimãos", color: "#1AD9A4" },
  { icon: "🗣️", title: "Comunicação Aumentativa", desc: "Suporte a pranchas de comunicação e apps de voz para viajantes não-verbais", color: "#FF6B6B" },
];

const paymentModes = [
  { id: "cash", label: "Dinheiro", icon: "💵" },
  { id: "miles", label: "Milhas", icon: "✈️" },
  { id: "hybrid", label: "Híbrido", icon: "⚡" },
  { id: "points", label: "Pontos", icon: "💎" },
];

const tags = ["Todos", "Praia", "Cultural", "Aventura", "Gastronomia", "História", "Natureza"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const maskEmail = (e) => { const [u, d] = e.split("@"); return u.slice(0, 2) + "•••@" + d; };
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Claude API ───────────────────────────────────────────────────────────────
async function askClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao gerar resposta da IA");
  }
  return data.text || "";
}

// ─── Accessibility Panel ──────────────────────────────────────────────────────
function A11yPanel({ onClose }) {
  const { fontSize, setFontSize, highContrast, setHighContrast, colorBlind, setColorBlind,
    reduceMotion, setReduceMotion, screenReader, setScreenReader, largeTargets, setLargeTargets, speak, colors } = useA11y();

  const fs = colors;
  const row = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${fs.border}` };
  const toggle = (on) => ({
    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
    background: on ? fs.teal : "rgba(255,255,255,0.12)",
    position: "relative", transition: "background 0.25s",
    display: "flex", alignItems: "center", padding: "0 3px",
  });
  const thumb = (on) => ({
    width: 18, height: 18, borderRadius: "50%", background: "#fff",
    transition: "transform 0.25s", transform: on ? "translateX(20px)" : "translateX(0)",
  });

  return (
    <div role="dialog" aria-modal="true" aria-label="Painel de Acessibilidade" style={{ padding: "22px 18px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 18 * fontSize, fontWeight: 800 }} id="a11y-title">♿ Acessibilidade</h2>
          <p style={{ fontSize: 11 * fontSize, color: fs.muted, marginTop: 2 }}>Personalize sua experiência</p>
        </div>
        <button onClick={onClose} aria-label="Fechar painel de acessibilidade"
          style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${fs.border}`, color: fs.fg, width: 32, height: 32, borderRadius: "50%", fontSize: 14, cursor: "pointer" }}>✕</button>
      </div>

      {/* WCAG badge */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["WCAG 2.1 AA", "ARIA 1.2", "Libras", "Braille"].map(b => (
          <span key={b} style={{ fontSize: 9, fontWeight: 700, background: `${fs.teal}22`, color: fs.teal, border: `1px solid ${fs.teal}44`, padding: "3px 9px", borderRadius: 8, letterSpacing: 0.5 }}>{b}</span>
        ))}
      </div>

      {/* Font Size */}
      <div style={row}>
        <div>
          <div style={{ fontSize: 13 * fontSize, fontWeight: 700 }}>Tamanho do texto</div>
          <div style={{ fontSize: 10 * fontSize, color: fs.muted }}>Ajuste conforme sua necessidade</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[{ v: 0.85, l: "A", s: 11 }, { v: 1, l: "A", s: 14 }, { v: 1.2, l: "A", s: 17 }, { v: 1.5, l: "A", s: 21 }].map(opt => (
            <button key={opt.v} onClick={() => { setFontSize(opt.v); speak(`Tamanho de texto: ${opt.l}`); }}
              aria-label={`Tamanho ${opt.l}`} aria-pressed={fontSize === opt.v}
              style={{ width: 36, height: 36, borderRadius: 10, border: `2px solid ${fontSize === opt.v ? fs.teal : fs.border}`, background: fontSize === opt.v ? `${fs.teal}22` : "rgba(255,255,255,0.04)", color: fontSize === opt.v ? fs.teal : fs.fg, fontSize: opt.s, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* High Contrast */}
      <div style={row}>
        <div>
          <div style={{ fontSize: 13 * fontSize, fontWeight: 700 }}>Alto contraste</div>
          <div style={{ fontSize: 10 * fontSize, color: fs.muted }}>Preto e branco com maior legibilidade</div>
        </div>
        <button role="switch" aria-checked={highContrast} aria-label="Ativar alto contraste"
          onClick={() => { setHighContrast(v => !v); speak(highContrast ? "Alto contraste desativado" : "Alto contraste ativado"); }}
          style={toggle(highContrast)}><div style={thumb(highContrast)} /></button>
      </div>

      {/* Reduce Motion */}
      <div style={row}>
        <div>
          <div style={{ fontSize: 13 * fontSize, fontWeight: 700 }}>Reduzir animações</div>
          <div style={{ fontSize: 10 * fontSize, color: fs.muted }}>Para sensibilidade a movimentos</div>
        </div>
        <button role="switch" aria-checked={reduceMotion} aria-label="Reduzir animações"
          onClick={() => { setReduceMotion(v => !v); speak(reduceMotion ? "Animações restauradas" : "Animações reduzidas"); }}
          style={toggle(reduceMotion)}><div style={thumb(reduceMotion)} /></button>
      </div>

      {/* Screen Reader */}
      <div style={row}>
        <div>
          <div style={{ fontSize: 13 * fontSize, fontWeight: 700 }}>Leitor de tela (voz)</div>
          <div style={{ fontSize: 10 * fontSize, color: fs.muted }}>Narração em português brasileiro</div>
        </div>
        <button role="switch" aria-checked={screenReader} aria-label="Ativar leitor de tela"
          onClick={() => { setScreenReader(v => !v); setTimeout(() => speak("Leitor de tela ativado. Bem-vindo ao Facilities Travel."), 300); }}
          style={toggle(screenReader)}><div style={thumb(screenReader)} /></button>
      </div>

      {/* Large Targets */}
      <div style={row}>
        <div>
          <div style={{ fontSize: 13 * fontSize, fontWeight: 700 }}>Alvos de toque maiores</div>
          <div style={{ fontSize: 10 * fontSize, color: fs.muted }}>Botões e links com área ampliada</div>
        </div>
        <button role="switch" aria-checked={largeTargets} aria-label="Alvos de toque maiores"
          onClick={() => { setLargeTargets(v => !v); speak(largeTargets ? "Alvos normais" : "Alvos ampliados ativados"); }}
          style={toggle(largeTargets)}><div style={thumb(largeTargets)} /></button>
      </div>

      {/* Color Blind */}
      <div style={{ padding: "13px 0", borderBottom: `1px solid ${fs.border}` }}>
        <div style={{ fontSize: 13 * fontSize, fontWeight: 700, marginBottom: 3 }}>Modo daltônico</div>
        <div style={{ fontSize: 10 * fontSize, color: fs.muted, marginBottom: 10 }}>Adaptação de cores para diferentes tipos</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { v: "none", l: "Padrão" },
            { v: "deuteranopia", l: "Deuteranopia" },
            { v: "protanopia", l: "Protanopia" },
            { v: "monochrome", l: "Monocromático" },
          ].map(opt => (
            <button key={opt.v} onClick={() => { setColorBlind(opt.v); speak(`Modo ${opt.l} ativado`); }}
              aria-pressed={colorBlind === opt.v}
              style={{ padding: "6px 12px", borderRadius: 10, border: `2px solid ${colorBlind === opt.v ? fs.teal : fs.border}`, background: colorBlind === opt.v ? `${fs.teal}22` : "rgba(255,255,255,0.04)", color: colorBlind === opt.v ? fs.teal : fs.muted, fontSize: 10 * fontSize, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button onClick={() => { setFontSize(1); setHighContrast(false); setColorBlind("none"); setReduceMotion(false); setScreenReader(false); setLargeTargets(false); speak("Configurações resetadas"); }}
        style={{ marginTop: 18, width: "100%", padding: "11px", borderRadius: 13, border: `1px solid ${fs.border}`, background: "rgba(255,255,255,0.04)", color: fs.muted, fontSize: 12 * fontSize, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
        ↺ Restaurar configurações padrão
      </button>
    </div>
  );
}

// ─── Social provider config ───────────────────────────────────────────────────
const SOCIAL_PROVIDERS = [
  { id: "google",   label: "Continuar com Google",   bg: "#fff",     color: "#1F1F1F", border: "rgba(0,0,0,0.12)", logo: (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2c-7.7 0-14.4 4.4-17.7 10.7z" transform="translate(0,2)"/>
      <path fill="#FBBC05" d="M24 46c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.7 37.3 27 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.7 41.6 15.3 46 24 46z" transform="translate(0,-1)"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.6 5.4C41.6 36.8 44.5 31 44.5 24c0-1.3-.2-2.7-.5-4z" transform="translate(0,-4)"/>
    </svg>
  )},
  { id: "facebook", label: "Continuar com Facebook", bg: "#1877F2", color: "#fff",    border: "transparent",      logo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )},
  { id: "microsoft", label: "Continuar com Outlook",  bg: "#0078D4", color: "#fff",   border: "transparent",      logo: (
    <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F35325"/>
      <rect x="12" y="1" width="10" height="10" fill="#81BC06"/>
      <rect x="1" y="12" width="10" height="10" fill="#05A6F0"/>
      <rect x="12" y="12" width="10" height="10" fill="#FFBA08"/>
    </svg>
  )},
  { id: "apple",    label: "Continuar com Apple",    bg: "#000",     color: "#fff",    border: "rgba(255,255,255,0.15)", logo: (
    <svg width="17" height="18" viewBox="0 0 814 1000" fill="white" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 391.3 0 276.2 0 166.3C0 74.5 64.2 24 124.1 24c61.1 0 105.9 40.5 147.5 40.5 37.4 0 88.3-44 158.3-44 27.2 0 96.6 3.9 149.3 61.6z"/>
      <path d="M549.3 32.7c2.5-15.9 4-31.9 4-48.6 0-45.5-16.2-97.8-45-133.5-29.2-37.1-80.6-64.4-122.6-64.4-1 0-2 .1-3 .2 2.5 17.1 4 34.2 4 50.2 0 45.2-14.4 95.5-42.5 131.1-27.2 34.2-77.3 61.5-120.6 61.5-.8 0-1.6-.1-2.5-.1 2.5 17.3 8.9 35.1 18.4 50.6 20.3 33.1 57.9 57.8 98.5 57.8 34.2 0 72.2-21.5 99.3-21.5 28.3 0 70.6 21.5 112.5 21.5z"/>
    </svg>
  )},
];

// ─── SCREEN: Login / Cadastro ─────────────────────────────────────────────────
function LoginScreen({ onNext }) {
  const { colors: C, fontSize, largeTargets, speak, highContrast } = useA11y();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [bioLoading, setBioLoading] = useState(false);
  const btnH = largeTargets ? 54 : 48;

  const inputRow = (focused) => ({
    display: "flex", alignItems: "center", gap: 11,
    background: highContrast ? "#1A1A1A" : "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: `${largeTargets ? 14 : 12}px 15px`,
    border: `1.5px solid ${focused ? C.teal + "90" : C.border}`, transition: "all 0.22s",
  });

  const [foci, setFoci] = useState({});
  const focus = (k) => setFoci(p => ({ ...p, [k]: true }));
  const blur  = (k) => setFoci(p => ({ ...p, [k]: false }));

  const handleLogin = () => {
    setError(""); setSuccess("");
    if (!email || !pass) { const m = "Preencha e-mail e senha."; setError(m); speak(m); return; }
    setLoading(true);
    speak("Verificando credenciais, aguarde.");
    setTimeout(() => {
      if (email === DEMO_USER.email && pass === "123456") {
        speak("Login realizado. Enviando código de verificação.");
        onNext("2fa");
      } else {
        const m = "Credenciais inválidas. Demo: voce@email.com / 123456";
        setError(m); speak(m); setLoading(false);
      }
    }, 1200);
  };

  const handleSignup = () => {
    setError(""); setSuccess("");
    if (!name || !email || !phone || !pass || !confirmPass) { const m = "Preencha todos os campos."; setError(m); speak(m); return; }
    if (pass !== confirmPass) { const m = "As senhas não coincidem."; setError(m); speak(m); return; }
    if (pass.length < 6) { const m = "A senha deve ter pelo menos 6 caracteres."; setError(m); speak(m); return; }
    if (!acceptTerms) { const m = "Aceite os termos para continuar."; setError(m); speak(m); return; }
    setLoading(true);
    speak("Criando sua conta, aguarde.");
    setTimeout(() => {
      setSuccess("Conta criada com sucesso! Fazendo login…");
      speak("Conta criada com sucesso. Enviando código de verificação.");
      setTimeout(() => onNext("2fa"), 1200);
    }, 1400);
  };

  const handleSocial = (provider) => {
    setSocialLoading(provider.id);
    speak(`Conectando com ${provider.label}`);
    setTimeout(() => {
      setSocialLoading(null);
      speak(`Conectado com ${provider.label}. Bem-vindo ao Facilities Travel.`);
      onNext("app");
    }, 1800);
  };

  const handleBiometric = async () => {
    setBioLoading(true);
    speak("Iniciando verificação biométrica.");
    try {
      await new Promise(r => setTimeout(r, 1600));
      speak("Biometria verificada. Bem-vindo ao Facilities Travel.");
      onNext("app");
    } catch { setError("Biometria não disponível."); }
    finally { setBioLoading(false); }
  };

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
      <div style={{ flex: 1, height: 1, background: C.border }} />
      <span style={{ fontSize: `${0.65 * fontSize}rem`, color: C.muted }}>ou continue com</span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );

  return (
    <main role="main" aria-label={mode === "login" ? "Tela de login" : "Tela de cadastro"}
      style={{ ...authContainer(C), fontSize: `${fontSize}rem`, overflowY: "auto", paddingBottom: 50 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${C.teal}1A 0%, transparent 65%)`, pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 24, position: "relative" }}>
        <div style={logoBox(C)} aria-hidden="true"><span style={{ fontSize: 24 }}>🛡️</span></div>
        <h1 style={{ fontSize: `${1.7 * fontSize}rem`, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
          Facilities<span style={{ color: C.teal }}>Travel</span>
        </h1>
        <p style={{ fontSize: `${0.72 * fontSize}rem`, color: C.muted }}>Viagens acessíveis e seguras para todos</p>
      </div>

      {/* Mode toggle */}
      <div role="tablist" aria-label="Selecione login ou cadastro"
        style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 4, marginBottom: 20 }}>
        {[{ id: "login", label: "Entrar" }, { id: "signup", label: "Criar conta" }].map(m => (
          <button key={m.id} role="tab" aria-selected={mode === m.id}
            onClick={() => { setMode(m.id); setError(""); setSuccess(""); speak(`Aba ${m.label}`); }}
            style={{ flex: 1, padding: `${largeTargets ? 12 : 9}px`, borderRadius: 11, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: `${0.82 * fontSize}rem`, transition: "all 0.2s", background: mode === m.id ? C.teal : "transparent", color: mode === m.id ? "#070A12" : C.muted }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Security badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.teal}0E`, border: `1px solid ${C.teal}28`, borderRadius: 11, padding: "6px 12px", marginBottom: 18, justifyContent: "center" }} role="note">
        <span aria-hidden="true">🔒</span>
        <span style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, color: C.teal }}>SSL 256-bit · WCAG 2.1 AA · Dados protegidos</span>
      </div>

      {/* ── LOGIN FORM ── */}
      {mode === "login" && (
        <div style={{ position: "relative" }}>
          <label htmlFor="li-email" style={{ position: "absolute", left: -9999 }}>E-mail</label>
          <div style={{ ...inputRow(foci.email), marginBottom: 10 }}>
            <span aria-hidden="true">📧</span>
            <input id="li-email" style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.88 * fontSize}rem`, flex: 1 }} type="email" placeholder="Seu e-mail" value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} onFocus={() => focus("email")} onBlur={() => blur("email")} aria-required="true" />
          </div>

          <label htmlFor="li-pass" style={{ position: "absolute", left: -9999 }}>Senha</label>
          <div style={{ ...inputRow(foci.pass), marginBottom: 14 }}>
            <span aria-hidden="true">🔑</span>
            <input id="li-pass" style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.88 * fontSize}rem`, flex: 1 }} type={showPass ? "text" : "password"} placeholder="Senha" value={pass} autoComplete="current-password" onChange={e => setPass(e.target.value)} onFocus={() => focus("pass")} onBlur={() => blur("pass")} onKeyDown={e => e.key === "Enter" && handleLogin()} aria-required="true" />
            <button onClick={() => { setShowPass(v => !v); speak(showPass ? "Senha ocultada" : "Senha visível"); }} aria-label={showPass ? "Ocultar senha" : "Mostrar senha"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.muted }}>{showPass ? "🙈" : "👁️"}</button>
          </div>

          {error && <div role="alert" aria-live="assertive" style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.danger, marginBottom: 12, lineHeight: 1.5 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading} aria-busy={loading}
            style={{ width: "100%", height: btnH, borderRadius: 15, border: "none", background: `linear-gradient(135deg, ${C.teal}, #0EB886)`, color: "#070A12", fontSize: `${0.85 * fontSize}rem`, fontWeight: 800, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6, opacity: loading ? 0.75 : 1, fontFamily: "inherit" }}>
            {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-hidden="true" />}
            {loading ? "Verificando…" : "Entrar com segurança"}
          </button>

          <button onClick={() => { speak("Redefinição de senha — funcionalidade em breve"); setSuccess("Link de redefinição enviado para seu e-mail."); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.teal, fontSize: `${0.7 * fontSize}rem`, fontWeight: 600, display: "block", margin: "0 auto 14px", fontFamily: "inherit" }}>
            Esqueci minha senha
          </button>
        </div>
      )}

      {/* ── SIGNUP FORM ── */}
      {mode === "signup" && (
        <div style={{ position: "relative" }}>
          {[
            { id: "sg-name",  icon: "👤", placeholder: "Nome completo",     type: "text",     val: name,        set: setName,        key: "name",    autoComplete: "name" },
            { id: "sg-email", icon: "📧", placeholder: "E-mail",             type: "email",    val: email,       set: setEmail,       key: "email2",  autoComplete: "email" },
            { id: "sg-phone", icon: "📱", placeholder: "Telefone (WhatsApp)",type: "tel",      val: phone,       set: setPhone,       key: "phone",   autoComplete: "tel" },
          ].map(f => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <label htmlFor={f.id} style={{ position: "absolute", left: -9999 }}>{f.placeholder}</label>
              <div style={inputRow(foci[f.key])}>
                <span aria-hidden="true">{f.icon}</span>
                <input id={f.id} style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.88 * fontSize}rem`, flex: 1 }} type={f.type} placeholder={f.placeholder} value={f.val} autoComplete={f.autoComplete} onChange={e => f.set(e.target.value)} onFocus={() => focus(f.key)} onBlur={() => blur(f.key)} aria-required="true" />
              </div>
            </div>
          ))}
          {[
            { id: "sg-pass", icon: "🔑", placeholder: "Senha (mín. 6 caracteres)", val: confirmPass === "" ? pass : pass, set: setPass, key: "spass", show: showPass, toggle: () => { setShowPass(v => !v); speak(showPass ? "Senha ocultada" : "Senha visível"); } },
            { id: "sg-conf", icon: "🔒", placeholder: "Confirmar senha",            val: confirmPass,                       set: setConfirmPass, key: "sconf", show: showConfirm, toggle: () => { setShowConfirm(v => !v); } },
          ].map(f => (
            <div key={f.id} style={{ marginBottom: 10 }}>
              <label htmlFor={f.id} style={{ position: "absolute", left: -9999 }}>{f.placeholder}</label>
              <div style={inputRow(foci[f.key])}>
                <span aria-hidden="true">{f.icon}</span>
                <input id={f.id} style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.88 * fontSize}rem`, flex: 1 }} type={f.show ? "text" : "password"} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} onFocus={() => focus(f.key)} onBlur={() => blur(f.key)} aria-required="true" />
                <button onClick={f.toggle} aria-label={f.show ? "Ocultar" : "Mostrar"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: C.muted }}>{f.show ? "🙈" : "👁️"}</button>
              </div>
            </div>
          ))}

          {/* Password strength indicator */}
          {pass.length > 0 && (
            <div style={{ marginBottom: 12 }} aria-live="polite">
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1,2,3,4].map(i => {
                  const strength = pass.length < 4 ? 1 : pass.length < 7 ? 2 : /[A-Z]/.test(pass) && /\d/.test(pass) ? 4 : 3;
                  const clr = ["#FF6B6B","#FF8C42","#FFD93D","#1AD9A4"][strength - 1];
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: i <= strength ? clr : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />;
                })}
              </div>
              <span style={{ fontSize: `${0.62 * fontSize}rem`, color: C.muted }}>
                Força: {pass.length < 4 ? "Fraca" : pass.length < 7 ? "Razoável" : /[A-Z]/.test(pass) && /\d/.test(pass) ? "Forte" : "Boa"}
              </span>
            </div>
          )}

          {/* Terms */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}` }}>
            <button role="checkbox" aria-checked={acceptTerms} aria-label="Aceitar termos de uso e política de privacidade"
              onClick={() => { setAcceptTerms(v => !v); speak(acceptTerms ? "Termos desmarcados" : "Termos aceitos"); }}
              style={{ width: largeTargets ? 26 : 20, height: largeTargets ? 26 : 20, borderRadius: 6, border: `2px solid ${acceptTerms ? C.teal : C.border}`, background: acceptTerms ? C.teal : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color: "#070A12", transition: "all 0.2s" }}>
              {acceptTerms ? "✓" : ""}
            </button>
            <span style={{ fontSize: `${0.68 * fontSize}rem`, color: C.muted, lineHeight: 1.5 }}>
              Li e aceito os <span style={{ color: C.teal, cursor: "pointer" }}>Termos de Uso</span> e a <span style={{ color: C.teal, cursor: "pointer" }}>Política de Privacidade</span> do Facilities Travel.
            </span>
          </div>

          {error && <div role="alert" style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.danger, marginBottom: 12, lineHeight: 1.5 }}>{error}</div>}
          {success && <div role="status" style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.teal, marginBottom: 12 }}>{success}</div>}

          <button onClick={handleSignup} disabled={loading} aria-busy={loading}
            style={{ width: "100%", height: btnH, borderRadius: 15, border: "none", background: `linear-gradient(135deg, ${C.teal}, #0EB886)`, color: "#070A12", fontSize: `${0.85 * fontSize}rem`, fontWeight: 800, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4, opacity: loading ? 0.75 : 1, fontFamily: "inherit" }}>
            {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-hidden="true" />}
            {loading ? "Criando conta…" : "Criar minha conta"}
          </button>
        </div>
      )}

      {success && mode === "login" && <div role="status" style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.teal, marginBottom: 12 }}>{success}</div>}

      {/* Divider */}
      {divider}

      {/* Social login buttons */}
      <div role="group" aria-label="Entrar com conta social" style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
        {SOCIAL_PROVIDERS.map(p => (
          <button key={p.id} onClick={() => handleSocial(p)} disabled={!!socialLoading}
            aria-label={p.label} aria-busy={socialLoading === p.id}
            style={{ width: "100%", height: largeTargets ? 52 : 44, borderRadius: 14, border: `1.5px solid ${p.border}`, background: p.bg, color: p.color, fontSize: `${0.82 * fontSize}rem`, fontWeight: 600, cursor: socialLoading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: socialLoading && socialLoading !== p.id ? 0.45 : 1, transition: "opacity 0.2s, transform 0.15s", fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.015)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            {socialLoading === p.id
              ? <span style={{ width: 16, height: 16, border: `2px solid ${p.color}44`, borderTopColor: p.color, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-hidden="true" />
              : p.logo}
            {socialLoading === p.id ? "Conectando…" : p.label}
          </button>
        ))}
      </div>

      {/* Biometric */}
      <button onClick={handleBiometric} disabled={bioLoading}
        aria-label="Entrar com Face ID ou Touch ID"
        style={{ width: "100%", height: largeTargets ? 52 : 44, borderRadius: 14, border: `2px solid ${C.teal}45`, background: `${C.teal}0A`, color: C.teal, fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, cursor: bioLoading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", opacity: bioLoading ? 0.75 : 1, marginBottom: 18 }}>
        {bioLoading ? <span style={{ width: 14, height: 14, border: `2px solid ${C.teal}40`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-hidden="true" /> : <span aria-hidden="true" style={{ fontSize: 20 }}>🫆</span>}
        {bioLoading ? "Verificando biometria…" : "Face ID / Touch ID / Biometria"}
      </button>

      <p style={{ textAlign: "center", fontSize: `${0.6 * fontSize}rem`, color: C.muted, lineHeight: 1.7 }}>
        Criptografia de ponta a ponta · WCAG 2.1 AA<br />
        Seus dados nunca são compartilhados ou vendidos.
      </p>
    </main>
  );
}

// ─── SCREEN: 2FA ─────────────────────────────────────────────────────────────
function TwoFAScreen({ onVerified, onBack }) {
  const { colors: C, fontSize, largeTargets, speak } = useA11y();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [correctOtp] = useState(generateOTP());
  const refs = useRef([]);

  useEffect(() => { speak(`Código de verificação enviado para ${DEMO_USER.phone}. Insira os 6 dígitos.`); }, []);
  useEffect(() => { if (countdown <= 0) return; const t = setTimeout(() => setCountdown(c => c - 1), 1000); return () => clearTimeout(t); }, [countdown]);

  const handleDigit = (i, val) => {
    const v = val.replace(/\D/, "").slice(-1);
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d)) setTimeout(() => verify(next.join("")), 150);
  };
  const handleKeyDown = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };

  const verify = (code) => {
    setLoading(true);
    setTimeout(() => {
      if (code === correctOtp || code === "123456") { speak("Código verificado. Acesse seu PIN."); onVerified(); }
      else { const msg = "Código inválido. Tente novamente."; setError(msg); speak(msg); setOtp(["", "", "", "", "", ""]); refs.current[0]?.focus(); setLoading(false); }
    }, 900);
  };

  return (
    <main role="main" aria-label="Verificação em dois fatores" style={{ ...authContainer(C), fontSize: `${fontSize}rem` }}>
      <button onClick={onBack} aria-label="Voltar para o login" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", marginBottom: 24, fontSize: `${0.82 * fontSize}rem`, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ ...logoBox(C), background: "rgba(108,99,255,0.12)", borderColor: "rgba(108,99,255,0.3)" }} aria-hidden="true"><span style={{ fontSize: 24 }}>📱</span></div>
        <h1 style={{ fontSize: `${1.4 * fontSize}rem`, fontWeight: 800, marginBottom: 6 }}>Verificação em 2 Etapas</h1>
        <p style={{ fontSize: `${0.75 * fontSize}rem`, color: C.muted, lineHeight: 1.6 }}>
          Código enviado para <strong style={{ color: C.teal }}>{DEMO_USER.phone}</strong>
        </p>
      </div>

      <fieldset style={{ border: "none", padding: 0, marginBottom: 28 }} aria-label="Insira os 6 dígitos do código">
        <legend style={{ position: "absolute", left: -9999 }}>Código de verificação de 6 dígitos</legend>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {otp.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el} value={d} onChange={e => handleDigit(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
              maxLength={1} inputMode="numeric" aria-label={`Dígito ${i + 1} do código`}
              style={{ width: largeTargets ? 52 : 44, height: largeTargets ? 60 : 52, borderRadius: 13, textAlign: "center", fontSize: `${1.4 * fontSize}rem`, fontWeight: 800, background: d ? `${C.teal}18` : "rgba(255,255,255,0.05)", border: `2px solid ${d ? C.teal + "80" : C.border}`, color: C.fg, outline: "none", transition: "all 0.2s" }} />
          ))}
        </div>
      </fieldset>

      {error && <div role="alert" style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.danger, marginBottom: 14 }}>{error}</div>}
      {loading && <div aria-live="polite" style={{ textAlign: "center", marginBottom: 12 }}><span style={{ width: 16, height: 16, border: `2px solid ${C.teal}30`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-label="Verificando código" /></div>}

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        {countdown > 0
          ? <p style={{ fontSize: `${0.75 * fontSize}rem`, color: C.muted }} aria-live="polite">Reenviar em <strong style={{ color: C.teal }}>{countdown}s</strong></p>
          : <button onClick={() => { setCountdown(30); speak("Novo código enviado."); }} aria-label="Reenviar código por SMS" style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 13, color: C.muted, padding: "9px 18px", fontSize: `${0.7 * fontSize}rem`, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>📲 Reenviar código</button>}
      </div>
    </main>
  );
}

// ─── SCREEN: PIN ──────────────────────────────────────────────────────────────
function PinScreen({ onUnlock, onLogout, isRelock }) {
  const { colors: C, fontSize, largeTargets, speak } = useA11y();
  const [pin, setPin] = useState([]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const digits = [1,2,3,4,5,6,7,8,9,null,0,"⌫"];
  const keySize = largeTargets ? 72 : 56;

  useEffect(() => { speak(isRelock ? "Sessão bloqueada. Insira seu PIN de 4 dígitos." : `Olá ${DEMO_USER.name}. Insira seu PIN de 4 dígitos.`); }, []);

  const addDigit = (d) => {
    if (d === "⌫") { setPin(p => { const n = p.slice(0,-1); speak(`${n.length} dígitos inseridos`); return n; }); return; }
    if (d === null) return;
    const next = [...pin, d];
    setPin(next);
    speak(`${next.length} dígitos`);
    if (next.length === 4) {
      setTimeout(() => {
        if (next.join("") === DEMO_USER.pin) { speak("PIN correto. Bem-vindo ao Facilities Travel."); onUnlock(); }
        else { speak("PIN incorreto. Tente novamente."); setShake(true); setError(true); setPin([]); setTimeout(() => { setShake(false); setError(false); }, 700); }
      }, 180);
    }
  };

  return (
    <main role="main" aria-label={isRelock ? "Sessão bloqueada — insira o PIN" : "Tela de PIN"} style={{ ...authContainer(C), fontSize: `${fontSize}rem` }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={logoBox(C)} aria-hidden="true"><span style={{ fontSize: 24 }}>🛡️</span></div>
        <h1 style={{ fontSize: `${1.35 * fontSize}rem`, fontWeight: 800, marginBottom: 5 }}>{isRelock ? "Sessão bloqueada" : "PIN de segurança"}</h1>
        <p style={{ fontSize: `${0.75 * fontSize}rem`, color: C.muted }}>{isRelock ? "Insira seu PIN para continuar" : `Olá de volta, ${DEMO_USER.name}!`}</p>
      </div>

      <div role="group" aria-label={`${pin.length} de 4 dígitos inseridos`}
        style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 32, animation: shake ? "shake 0.4s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} aria-hidden="true" style={{ width: largeTargets ? 20 : 15, height: largeTargets ? 20 : 15, borderRadius: "50%", background: error ? C.danger : pin.length > i ? C.teal : "rgba(255,255,255,0.12)", border: `2px solid ${error ? C.danger : pin.length > i ? C.teal : "rgba(255,255,255,0.18)"}`, transition: "all 0.2s" }} />
        ))}
      </div>

      <div role="group" aria-label="Teclado numérico" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: largeTargets ? 14 : 11, maxWidth: largeTargets ? 320 : 256, margin: "0 auto 26px" }}>
        {digits.map((d, i) => (
          <button key={i} onClick={() => addDigit(d)}
            aria-label={d === "⌫" ? "Apagar último dígito" : d === null ? "" : `Dígito ${d}`}
            disabled={d === null} tabIndex={d === null ? -1 : 0}
            style={{ width: "100%", height: keySize, borderRadius: 16, border: `1px solid ${C.border}`, background: d === "⌫" ? `${C.danger}18` : "rgba(255,255,255,0.05)", color: d === "⌫" ? C.danger : d === null ? "transparent" : C.fg, fontSize: d === "⌫" ? 18 : `${1.4 * fontSize}rem`, fontWeight: 700, cursor: d === null ? "default" : "pointer", fontFamily: "inherit", pointerEvents: d === null ? "none" : "auto" }}>
            {d}
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 13, color: C.muted, padding: "9px 18px", fontSize: `${0.7 * fontSize}rem`, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "block", margin: "0 auto" }}>
        Trocar conta
      </button>
    </main>
  );
}

// ─── AI Flight Panel ──────────────────────────────────────────────────────────
function AIFlightPanel({ dest, onClose, dataHidden }) {
  const { colors: C, fontSize, speak } = useA11y();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [origin, setOrigin] = useState("GRU");
  const [date, setDate] = useState("2025-09-15");
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setLoading(true); setResult(null);
    speak(`Buscando voos de ${origin} para ${dest.name} em ${date}. Aguarde.`);
    try {
      const text = await askClaude(`Você é um assistente de viagens para brasileiros.
Busque voos de ${origin} para ${dest.iata} (${dest.name}, ${dest.country}). Data: ${date}.
Responda APENAS em JSON puro sem markdown:
{"rota":"${origin} → ${dest.iata}","destino":"${dest.name}","melhorPreco":"R$ X.XXX","companhias":[{"nome":"...","preco":"R$ X.XXX","duracao":"Xh Xmin","escalas":0,"pontuacao":4.5}],"melhorEmMilhas":{"programa":"...","pontos":"XX.XXX pts","complemento":"R$ XXX"},"dicaEconomia":"...","melhorDia":"...","alertaPreco":"...","economiaVsMedia":"X%","hospedagemSugerida":[{"nome":"...","tipo":"hostel/hotel","preco":"R$ XXX/noite","avaliacao":"4.8⭐"}],"acessibilidade":{"aeroportoAdaptado":true,"assistenciaMobilidade":true,"refeicaoEspecial":true}}`);
      let clean = text.trim().replace(/```json?|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      speak(`Resultado encontrado. Melhor preço: ${parsed.melhorPreco}.`);
    } catch { setResult({ error: "Não foi possível buscar. Tente novamente." }); speak("Erro na busca. Tente novamente."); }
    setLoading(false); setSearched(true);
  };

  return (
    <section aria-label={`Busca de voos para ${dest.name}`} style={{ paddingBottom: 40 }}>
      <div style={{ position: "relative" }}>
        <img src={dest.img} style={{ width: "100%", height: 180, objectFit: "cover" }} alt={`Vista de ${dest.name}, ${dest.country}`} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0C1018 0%, transparent 55%)" }} aria-hidden="true" />
        <button onClick={onClose} aria-label={`Fechar busca para ${dest.name}`} style={{ position: "absolute", top: 13, right: 13, background: "rgba(7,10,18,0.72)", border: "none", color: C.fg, width: 32, height: 32, borderRadius: "50%", fontSize: 15, cursor: "pointer" }}>✕</button>
        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "12px 18px" }}>
          <h2 style={{ fontSize: `${1.5 * fontSize}rem`, fontWeight: 800 }}>{dest.emoji} {dest.name}</h2>
          <p style={{ fontSize: `${0.68 * fontSize}rem`, color: "rgba(240,237,232,0.5)" }}>{dest.country} · Busca inteligente por IA</p>
        </div>
      </div>
      <div style={{ padding: "18px 18px 0" }}>
        <div style={{ background: `${C.teal}0A`, border: `1px solid ${C.teal}33`, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span aria-hidden="true" style={{ fontSize: 16 }}>🤖</span>
            <span style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, color: C.teal }}>Busca com IA — Claude</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="origin-select" style={{ fontSize: `${0.55 * fontSize}rem`, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Origem</label>
              <select id="origin-select" value={origin} onChange={e => setOrigin(e.target.value)} aria-label="Selecione o aeroporto de origem"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "9px 12px", color: C.fg, fontSize: `${0.82 * fontSize}rem` }}>
                {["GRU","CGH","GIG","BSB","FOR","REC","SSA"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="date-select" style={{ fontSize: `${0.55 * fontSize}rem`, color: C.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Data</label>
              <input id="date-select" type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Data de partida"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "9px 12px", color: C.fg, fontSize: `${0.82 * fontSize}rem` }} />
            </div>
          </div>
          <button onClick={search} disabled={loading} aria-busy={loading} aria-label="Buscar melhores preços com inteligência artificial"
            style={{ width: "100%", padding: "12px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.teal}, #0EB886)`, color: "#070A12", fontSize: `${0.82 * fontSize}rem`, fontWeight: 800, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.75 : 1, fontFamily: "inherit" }}>
            {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.25)", borderTopColor: "#000", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} aria-hidden="true" />}
            {loading ? "Buscando com IA…" : "🔍 Buscar Melhores Preços"}
          </button>
        </div>

        {loading && <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[80,60,90].map((w,i) => <div key={i} style={{ height: 16, width: `${w}%`, background: "rgba(255,255,255,0.06)", borderRadius: 8, animation: "shimmer 1.5s infinite" }} aria-hidden="true" />)}</div>}

        {result && !result.error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }} aria-live="polite">
            <div style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}40`, borderRadius: 16, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: `${0.68 * fontSize}rem`, color: C.muted, marginBottom: 2 }}>Melhor preço encontrado</div>
                <div style={{ fontSize: `${1.4 * fontSize}rem`, fontWeight: 800, color: C.teal }}>{dataHidden ? "R$ ••••" : result.melhorPreco}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: `${0.62 * fontSize}rem`, color: C.accent, fontWeight: 700, background: `${C.accent}22`, padding: "3px 10px", borderRadius: 10 }}>Economize {result.economiaVsMedia}</div>
                <div style={{ fontSize: `${0.62 * fontSize}rem`, color: C.muted, marginTop: 4 }}>{result.melhorDia}</div>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 16, padding: 15 }}>
              <h3 style={{ fontSize: `${0.75 * fontSize}rem`, fontWeight: 700, color: C.teal, marginBottom: 12 }}>✈️ Companhias Aéreas</h3>
              {result.companhias?.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < result.companhias.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700 }}>{c.nome}</div>
                    <div style={{ fontSize: `${0.62 * fontSize}rem`, color: C.muted }}>{c.duracao} · {c.escalas === 0 ? "Direto" : `${c.escalas} escala`} · {c.pontuacao}⭐</div>
                  </div>
                  <div style={{ fontWeight: 800, color: C.teal, fontSize: `${0.95 * fontSize}rem` }}>{dataHidden ? "R$ ••••" : c.preco}</div>
                </div>
              ))}
            </div>

            {/* Accessibility at destination */}
            {result.acessibilidade && (
              <div style={{ background: "rgba(78,195,255,0.08)", border: "1px solid rgba(78,195,255,0.25)", borderRadius: 16, padding: 15 }}>
                <h3 style={{ fontSize: `${0.75 * fontSize}rem`, fontWeight: 700, color: "#4EC3FF", marginBottom: 12 }}>♿ Acessibilidade no voo</h3>
                {[
                  [result.acessibilidade.aeroportoAdaptado, "Aeroporto adaptado para cadeirantes"],
                  [result.acessibilidade.assistenciaMobilidade, "Assistência de mobilidade disponível"],
                  [result.acessibilidade.refeicaoEspecial, "Refeição especial sob solicitação"],
                ].map(([ok, lbl], i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0" }}>
                    <span style={{ color: ok ? C.teal : C.danger, fontSize: 14 }}>{ok ? "✓" : "✗"}</span>
                    <span style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted }}>{lbl}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "rgba(255,217,61,0.07)", border: "1px solid rgba(255,217,61,0.18)", borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: `${0.68 * fontSize}rem`, fontWeight: 700, color: C.accent, marginBottom: 6 }}>💡 Dica da IA</div>
              <p style={{ fontSize: `${0.68 * fontSize}rem`, color: C.muted, lineHeight: 1.6 }}>{result.dicaEconomia}</p>
            </div>
          </div>
        )}

        {result?.error && <div role="alert" style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}44`, borderRadius: 11, padding: "9px 13px", fontSize: `${0.7 * fontSize}rem`, color: C.danger }}>{result.error}</div>}

        {!searched && !loading && (
          <div style={{ textAlign: "center", padding: "30px 0", color: C.muted }}>
            <div style={{ fontSize: 42, marginBottom: 10 }} aria-hidden="true">🤖</div>
            <p style={{ fontSize: `${0.82 * fontSize}rem` }}>Clique em buscar para a IA encontrar as melhores opções</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Full Travel Search (Booking-style) ──────────────────────────────────────
const AIRPORTS = [
  // Brasil
  { code: "GRU", city: "São Paulo", name: "Guarulhos", country: "Brasil", emoji: "🇧🇷" },
  { code: "CGH", city: "São Paulo", name: "Congonhas", country: "Brasil", emoji: "🇧🇷" },
  { code: "GIG", city: "Rio de Janeiro", name: "Galeão", country: "Brasil", emoji: "🇧🇷" },
  { code: "SDU", city: "Rio de Janeiro", name: "Santos Dumont", country: "Brasil", emoji: "🇧🇷" },
  { code: "BSB", city: "Brasília", name: "Juscelino Kubitschek", country: "Brasil", emoji: "🇧🇷" },
  { code: "SSA", city: "Salvador", name: "Dep. Luís Eduardo", country: "Brasil", emoji: "🇧🇷" },
  { code: "FOR", city: "Fortaleza", name: "Pinto Martins", country: "Brasil", emoji: "🇧🇷" },
  { code: "REC", city: "Recife", name: "Guararapes", country: "Brasil", emoji: "🇧🇷" },
  { code: "POA", city: "Porto Alegre", name: "Salgado Filho", country: "Brasil", emoji: "🇧🇷" },
  { code: "CWB", city: "Curitiba", name: "Afonso Pena", country: "Brasil", emoji: "🇧🇷" },
  { code: "BEL", city: "Belém", name: "Val-de-Cans", country: "Brasil", emoji: "🇧🇷" },
  { code: "MAO", city: "Manaus", name: "Eduardo Gomes", country: "Brasil", emoji: "🇧🇷" },
  { code: "FLN", city: "Florianópolis", name: "Hercílio Luz", country: "Brasil", emoji: "🇧🇷" },
  { code: "MCZ", city: "Maceió", name: "Zumbi dos Palmares", country: "Brasil", emoji: "🇧🇷" },
  { code: "NAT", city: "Natal", name: "São Gonçalo do Amarante", country: "Brasil", emoji: "🇧🇷" },
  { code: "THE", city: "Teresina", name: "Senador Petrônio Portella", country: "Brasil", emoji: "🇧🇷" },
  { code: "VIX", city: "Vitória", name: "Eurico de Aguiar Salles", country: "Brasil", emoji: "🇧🇷" },
  { code: "GYN", city: "Goiânia", name: "Santa Genoveva", country: "Brasil", emoji: "🇧🇷" },
  { code: "CGB", city: "Cuiabá", name: "Marechal Rondon", country: "Brasil", emoji: "🇧🇷" },
  { code: "CGR", city: "Campo Grande", name: "Campo Grande", country: "Brasil", emoji: "🇧🇷" },
  { code: "LEC", city: "Lençóis", name: "Horácio de Mattos", country: "Brasil", emoji: "🇧🇷" },
  { code: "FEN", city: "Fernando de Noronha", name: "Gov. Carlos Wilson", country: "Brasil", emoji: "🇧🇷" },
  // Américas
  { code: "EZE", city: "Buenos Aires", name: "Ministro Pistarini", country: "Argentina", emoji: "🇦🇷" },
  { code: "SCL", city: "Santiago", name: "Arturo Merino Benítez", country: "Chile", emoji: "🇨🇱" },
  { code: "LIM", city: "Lima", name: "Jorge Chávez", country: "Peru", emoji: "🇵🇪" },
  { code: "BOG", city: "Bogotá", name: "El Dorado", country: "Colômbia", emoji: "🇨🇴" },
  { code: "MDE", city: "Medellín", name: "José María Córdova", country: "Colômbia", emoji: "🇨🇴" },
  { code: "CTG", city: "Cartagena", name: "Rafael Núñez", country: "Colômbia", emoji: "🇨🇴" },
  { code: "ADZ", city: "San Andrés", name: "Gustavo Rojas Pinilla", country: "Colômbia", emoji: "🇨🇴" },
  { code: "MEX", city: "Cidade do México", name: "Benito Juárez", country: "México", emoji: "🇲🇽" },
  { code: "CUN", city: "Cancún", name: "Internacional Cancún", country: "México", emoji: "🇲🇽" },
  { code: "MIA", city: "Miami", name: "Miami International", country: "EUA", emoji: "🇺🇸" },
  { code: "JFK", city: "Nova York", name: "John F. Kennedy", country: "EUA", emoji: "🇺🇸" },
  { code: "MCO", city: "Orlando", name: "Orlando International", country: "EUA", emoji: "🇺🇸" },
  { code: "LAS", city: "Las Vegas", name: "Harry Reid", country: "EUA", emoji: "🇺🇸" },
  // Europa
  { code: "LIS", city: "Lisboa", name: "Humberto Delgado", country: "Portugal", emoji: "🇵🇹" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "França", emoji: "🇫🇷" },
  { code: "LHR", city: "Londres", name: "Heathrow", country: "Reino Unido", emoji: "🇬🇧" },
  { code: "MAD", city: "Madri", name: "Adolfo Suárez", country: "Espanha", emoji: "🇪🇸" },
  { code: "BCN", city: "Barcelona", name: "El Prat", country: "Espanha", emoji: "🇪🇸" },
  { code: "FCO", city: "Roma", name: "Leonardo da Vinci", country: "Itália", emoji: "🇮🇹" },
  { code: "MXP", city: "Milão", name: "Malpensa", country: "Itália", emoji: "🇮🇹" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", country: "Holanda", emoji: "🇳🇱" },
  { code: "IST", city: "Istambul", name: "Istanbul Airport", country: "Turquia", emoji: "🇹🇷" },
  // Ásia & Oceania
  { code: "NRT", city: "Tóquio", name: "Narita", country: "Japão", emoji: "🇯🇵" },
  { code: "HND", city: "Tóquio", name: "Haneda", country: "Japão", emoji: "🇯🇵" },
  { code: "ICN", city: "Seul", name: "Incheon", country: "Coreia do Sul", emoji: "🇰🇷" },
  { code: "DXB", city: "Dubai", name: "Dubai International", country: "Emirados Árabes", emoji: "🇦🇪" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Tailândia", emoji: "🇹🇭" },
  { code: "DPS", city: "Bali", name: "Ngurah Rai", country: "Indonésia", emoji: "🇮🇩" },
  { code: "SYD", city: "Sydney", name: "Kingsford Smith", country: "Austrália", emoji: "🇦🇺" },
  { code: "SIN", city: "Singapura", name: "Changi", country: "Singapura", emoji: "🇸🇬" },
  { code: "MLE", city: "Maldivas", name: "Velana International", country: "Maldivas", emoji: "🇲🇻" },
];

const AIRLINES = [
  { id: "all",  label: "Todas as cias", logo: "✈️" },
  { id: "G3",   label: "Gol", logo: "🟠" },
  { id: "AD",   label: "Azul", logo: "🔵" },
  { id: "LA",   label: "LATAM", logo: "🔴" },
  { id: "AA",   label: "American", logo: "🇺🇸" },
  { id: "TP",   label: "TAP", logo: "🇵🇹" },
  { id: "IB",   label: "Iberia", logo: "🇪🇸" },
  { id: "LH",   label: "Lufthansa", logo: "🇩🇪" },
  { id: "AF",   label: "Air France", logo: "🇫🇷" },
  { id: "EK",   label: "Emirates", logo: "🇦🇪" },
];

const TODAY = new Date().toISOString().split("T")[0];
const IN7 = new Date(Date.now() + 7*86400000).toISOString().split("T")[0];
const IN14 = new Date(Date.now() + 14*86400000).toISOString().split("T")[0];

function AirportPicker({ value, onChange, label, placeholder, C, fontSize, exclude }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);
  const selected = AIRPORTS.find(a => a.code === value);

  const filtered = AIRPORTS
    .filter(a => a.code !== exclude)
    .filter(a => {
      if (!q) return true;
      const qn = q.toLowerCase();
      return a.code.toLowerCase().includes(qn) || a.city.toLowerCase().includes(qn) ||
             a.country.toLowerCase().includes(qn) || a.name.toLowerCase().includes(qn);
    }).slice(0, 12);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <label style={{ fontSize: `${0.55 * fontSize}rem`, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>
      <button onClick={() => { setOpen(v => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "11px 13px", background: "rgba(255,255,255,0.06)", border: `1.5px solid ${open ? C.teal + "70" : C.border}`, borderRadius: 13, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
        <span style={{ fontSize: 18 }}>{selected ? selected.emoji : "🌍"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected
            ? <><div style={{ fontSize: `${0.88 * fontSize}rem`, fontWeight: 800, color: C.fg, lineHeight: 1.2 }}>{selected.code}</div>
                <div style={{ fontSize: `${0.62 * fontSize}rem`, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selected.city}</div></>
            : <div style={{ fontSize: `${0.82 * fontSize}rem`, color: C.muted }}>{placeholder}</div>
          }
        </div>
        <span style={{ color: C.muted, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0B1019", border: `1.5px solid ${C.teal}45`, borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.7)", zIndex: 300, maxHeight: 280, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 12px 6px" }}>
            <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder="Cidade, país ou código…"
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", color: C.fg, fontSize: `${0.82 * fontSize}rem`, fontFamily: "inherit" }} />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.map((a, i) => (
              <button key={a.code} onClick={() => { onChange(a.code); setQ(""); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: a.code === value ? `${C.teal}18` : "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: i < filtered.length-1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = a.code === value ? `${C.teal}18` : "none"}>
                <span style={{ fontSize: 20 }}>{a.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: `${0.88 * fontSize}rem`, fontWeight: 800, color: a.code === value ? C.teal : C.fg }}>{a.code}</span>
                    <span style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted }}>{a.city}</span>
                  </div>
                  <div style={{ fontSize: `${0.6 * fontSize}rem`, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                </div>
                <span style={{ fontSize: `${0.6 * fontSize}rem`, color: C.muted }}>{a.country}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FullSearchPanel({ C, fontSize, largeTargets, speak, setAiPanel, dataHidden }) {
  const [tripType, setTripType] = useState("roundtrip"); // roundtrip | oneway | multicity
  const [searchType, setSearchType] = useState("flight"); // flight | hotel | package | car
  const [origin, setOrigin] = useState("GRU");
  const [dest, setDest] = useState("ADZ");
  const [dateOut, setDateOut] = useState(IN7);
  const [dateBack, setDateBack] = useState(IN14);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [airline, setAirline] = useState("all");
  const [directOnly, setDirectOnly] = useState(false);
  const [flexDates, setFlexDates] = useState(false);
  const [budgetMax, setBudgetMax] = useState("");
  const [payMode, setPayMode] = useState("cash");
  const [hotelStars, setHotelStars] = useState(0);
  const [hotelType, setHotelType] = useState("any");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [showPax, setShowPax] = useState(false);
  const paxRef = useRef(null);

  const totalPax = adults + children + infants;
  const cabinLabels = { economy: "Econômica", premium: "Premium Eco", business: "Executiva", first: "Primeira Classe" };
  const hotelTypes = ["any","hotel","hostel","resort","pousada","airbnb","apart"];
  const hotelTypeLabels = { any:"Qualquer tipo", hotel:"Hotel", hostel:"Hostel", resort:"Resort", pousada:"Pousada", airbnb:"Airbnb", apart:"Apart-hotel" };

  useEffect(() => {
    const handler = (e) => { if (paxRef.current && !paxRef.current.contains(e.target)) setShowPax(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler); };
  }, []);

  const swap = () => { const t = origin; setOrigin(dest); setDest(t); };

  const doSearch = async () => {
    if (!origin || !dest) { speak("Selecione origem e destino"); return; }
    setLoading(true);
    setResults(null);
    const originAp = AIRPORTS.find(a => a.code === origin);
    const destAp = AIRPORTS.find(a => a.code === dest);
    speak(`Buscando ${searchType === "flight" ? "voos" : searchType === "hotel" ? "hotéis" : "pacotes"} de ${originAp?.city} para ${destAp?.city}`);

    const paxStr = `${adults} adulto${adults>1?"s":""} ${children>0?", "+children+" criança"+( children>1?"s":""): ""} ${infants>0?", "+infants+" bebê"+(infants>1?"s":""):""}`.trim();

    const prompt =
      `Você é um buscador de viagens como Booking, Decolar e CVC para brasileiros.
` +
      `Busca: ${searchType === "flight" ? "VOO" : searchType === "hotel" ? "HOTEL" : searchType === "package" ? "PACOTE VOO+HOTEL" : "CARRO"}.
` +
      `Origem: ${origin} (${originAp?.city}, ${originAp?.country})
` +
      `Destino: ${dest} (${destAp?.city}, ${destAp?.country})
` +
      `Data ida: ${dateOut} | ${tripType === "roundtrip" ? "Data volta: "+dateBack : "Somente ida"}
` +
      `Passageiros: ${paxStr}
` +
      `Classe: ${cabinLabels[cabinClass]}
` +
      (airline !== "all" ? `Companhia preferida: ${AIRLINES.find(a=>a.id===airline)?.label}
` : "") +
      (directOnly ? `Apenas voos diretos
` : "") +
      (flexDates ? `Datas flexíveis ±3 dias
` : "") +
      (budgetMax ? `Orçamento máximo: R$ ${budgetMax}
` : "") +
      (payMode === "miles" ? `Prefere pagar com milhas
` : payMode === "hybrid" ? `Aceita milhas + complemento
` : "") +
      (searchType === "hotel" && hotelStars > 0 ? `Hotel ${hotelStars} estrelas ou mais
` : "") +
      (searchType === "hotel" && hotelType !== "any" ? `Tipo: ${hotelTypeLabels[hotelType]}
` : "") +
      `
Responda SOMENTE em JSON puro sem markdown:
` +
      `{"destino":"...","cidade":"...","resumo":"frase resumindo a busca","voos":[{"companhia":"...","saida":"HH:MM","chegada":"HH:MM","duracao":"Xh Xmin","escalas":0,"preco":"R$ X.XXX","milhas":"XX.XXX pts","classe":"...","bagagem":"incluída/paga","destaque":"..."}],"hoteis":[{"nome":"...","tipo":"...","estrelas":4,"bairro":"...","preco":"R$ XXX/noite","avaliacao":9.2,"inclui":"...","destaque":"..."}],"pacote":{"preco":"R$ X.XXX","economia":"X%","inclui":"..."},"dicaMelhorData":"...","alertaOcupacao":"...","melhorOpcao":"voo ou hotel nome","economiaTotal":"X%"}`;

    try {
      const text = await askClaude(prompt);
      let clean = text.trim().replace(/```json?|```/g,"").trim();
      const m = clean.match(/\{[\s\S]*\}/);
      if (m) clean = m[0];
      setResults(JSON.parse(clean));
      speak("Resultados encontrados para " + destAp?.city);
    } catch(e) {
      setResults({ error: true });
      speak("Erro na busca, tente novamente");
    }
    setLoading(false);
  };

  const C2 = C; const fs = fontSize;
  const inp = { background: "rgba(255,255,255,0.06)", border: `1px solid ${C2.border}`, borderRadius: 11, padding: "9px 12px", color: C2.fg, fontSize: `${0.82*fs}rem`, fontFamily: "inherit", width: "100%" };
  const chip = (active) => ({ padding: "6px 13px", borderRadius: 20, border: `1.5px solid ${active ? C2.teal : C2.border}`, background: active ? `${C2.teal}22` : "rgba(255,255,255,0.04)", color: active ? C2.teal : C2.muted, fontSize: `${0.72*fs}rem`, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s", whiteSpace: "nowrap" });

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Search type tabs */}
      <div role="tablist" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {[
          { id: "flight",  icon: "✈️", label: "Voos" },
          { id: "hotel",   icon: "🏨", label: "Hotéis" },
          { id: "package", icon: "📦", label: "Pacotes" },
          { id: "car",     icon: "🚗", label: "Carros" },
        ].map(t => (
          <button key={t.id} onClick={() => setSearchType(t.id)} role="tab" aria-selected={searchType === t.id}
            style={{ ...chip(searchType === t.id), display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Trip type (flights only) */}
      {(searchType === "flight" || searchType === "package") && (
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["roundtrip","⇄ Ida e volta"],["oneway","→ Só ida"],["multicity","⊕ Multi-trecho"]].map(([id, label]) => (
            <button key={id} onClick={() => setTripType(id)} style={chip(tripType === id)}>{label}</button>
          ))}
        </div>
      )}

      {/* Origin / Destination */}
      {searchType !== "hotel" && (
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <AirportPicker value={origin} onChange={setOrigin} label="De" placeholder="Origem" C={C2} fontSize={fs} exclude={dest} />
            <button onClick={swap} aria-label="Trocar origem e destino"
              style={{ width: 38, height: 38, borderRadius: "50%", background: `${C2.teal}22`, border: `1.5px solid ${C2.teal}55`, color: C2.teal, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>⇄</button>
            <AirportPicker value={dest} onChange={setDest} label="Para" placeholder="Destino" C={C2} fontSize={fs} exclude={origin} />
          </div>
        </div>
      )}

      {/* Hotel destination only */}
      {searchType === "hotel" && (
        <div style={{ marginBottom: 12 }}>
          <AirportPicker value={dest} onChange={setDest} label="Destino" placeholder="Cidade ou aeroporto" C={C2} fontSize={fs} exclude={null} />
        </div>
      )}

      {/* Dates */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            {searchType === "hotel" ? "Check-in" : "Ida"}
          </label>
          <input type="date" value={dateOut} onChange={e => setDateOut(e.target.value)} min={TODAY} style={inp} />
        </div>
        {(tripType === "roundtrip" || searchType === "hotel" || searchType === "package") && (
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
              {searchType === "hotel" ? "Check-out" : "Volta"}
            </label>
            <input type="date" value={dateBack} onChange={e => setDateBack(e.target.value)} min={dateOut} style={inp} />
          </div>
        )}
      </div>

      {/* Passengers + Class */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div ref={paxRef} style={{ flex: 1, position: "relative" }}>
          <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Passageiros</label>
          <button onClick={() => setShowPax(v => !v)}
            style={{ ...inp, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", border: `1px solid ${showPax ? C2.teal + "70" : C2.border}` }}>
            <span>👥</span>
            <span style={{ flex: 1, textAlign: "left" }}>{totalPax} passageiro{totalPax !== 1 ? "s" : ""}</span>
            <span style={{ fontSize: 10, color: C2.muted }}>{showPax ? "▲" : "▼"}</span>
          </button>
          {showPax && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0B1019", border: `1.5px solid ${C2.teal}45`, borderRadius: 14, padding: 14, zIndex: 300, boxShadow: "0 16px 40px rgba(0,0,0,0.7)" }}>
              {[
                { label: "Adultos", sub: "12+ anos", val: adults, set: setAdults, min: 1 },
                { label: "Crianças", sub: "2–11 anos", val: children, set: setChildren, min: 0 },
                { label: "Bebês", sub: "0–23 meses", val: infants, set: setInfants, min: 0 },
              ].map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
                  <div>
                    <div style={{ fontSize: `${0.82*fs}rem`, fontWeight: 700, color: C2.fg }}>{p.label}</div>
                    <div style={{ fontSize: `${0.62*fs}rem`, color: C2.muted }}>{p.sub}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={() => p.set(v => Math.max(p.min, v-1))} disabled={p.val <= p.min}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${C2.border}`, background: "rgba(255,255,255,0.06)", color: C2.fg, cursor: p.val <= p.min ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", opacity: p.val <= p.min ? 0.3 : 1 }}>−</button>
                    <span style={{ fontSize: `${1*fs}rem`, fontWeight: 800, color: C2.fg, minWidth: 20, textAlign: "center" }}>{p.val}</span>
                    <button onClick={() => p.set(v => Math.min(9, v+1))}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${C2.teal}55`, background: `${C2.teal}18`, color: C2.teal, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {searchType !== "hotel" && (
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Classe</label>
            <select value={cabinClass} onChange={e => setCabinClass(e.target.value)} style={inp}>
              {Object.entries(cabinLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Hotel specific */}
      {(searchType === "hotel" || searchType === "package") && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Tipo de hospedagem</label>
            <select value={hotelType} onChange={e => setHotelType(e.target.value)} style={inp}>
              {Object.entries(hotelTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>Estrelas mínimas</label>
            <div style={{ display: "flex", gap: 5, paddingTop: 6 }}>
              {[0,3,4,5].map(s => (
                <button key={s} onClick={() => setHotelStars(s)}
                  style={{ flex: 1, padding: "7px 4px", borderRadius: 9, border: `1.5px solid ${hotelStars === s ? C2.accent : C2.border}`, background: hotelStars === s ? `${C2.accent}22` : "rgba(255,255,255,0.04)", color: hotelStars === s ? C2.accent : C2.muted, fontSize: `${0.65*fs}rem`, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {s === 0 ? "Todos" : "★".repeat(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment mode */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: `${0.55*fs}rem`, fontWeight: 700, color: C2.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 7 }}>Como pagar?</label>
        <div style={{ display: "flex", gap: 7 }}>
          {[["cash","💵","Dinheiro"],["miles","✈️","Milhas"],["hybrid","⚡","Híbrido"],["points","💎","Pontos"]].map(([id,icon,label]) => (
            <button key={id} onClick={() => setPayMode(id)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 11, border: `1.5px solid ${payMode === id ? C2.teal : C2.border}`, background: payMode === id ? `${C2.teal}22` : "rgba(255,255,255,0.04)", color: payMode === id ? C2.teal : C2.muted, cursor: "pointer", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontSize: `${0.58*fs}rem`, fontWeight: 700 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced filters */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C2.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: `${0.65*fs}rem`, fontWeight: 700, color: C2.muted, marginBottom: 10 }}>⚙️ Filtros avançados</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Airline */}
          {searchType !== "hotel" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: `${0.75*fs}rem`, fontWeight: 600, color: C2.fg }}>Companhia aérea</span>
              <select value={airline} onChange={e => setAirline(e.target.value)}
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${C2.border}`, borderRadius: 9, padding: "5px 10px", color: C2.fg, fontSize: `${0.72*fs}rem`, fontFamily: "inherit" }}>
                {AIRLINES.map(a => <option key={a.id} value={a.id}>{a.logo} {a.label}</option>)}
              </select>
            </div>
          )}
          {/* Direct only */}
          {searchType !== "hotel" && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: `${0.75*fs}rem`, fontWeight: 600, color: C2.fg }}>Apenas voos diretos</div>
                <div style={{ fontSize: `${0.6*fs}rem`, color: C2.muted }}>Sem escalas ou conexões</div>
              </div>
              <button role="switch" aria-checked={directOnly} onClick={() => setDirectOnly(v => !v)}
                style={{ width: 42, height: 23, borderRadius: 12, border: "none", cursor: "pointer", background: directOnly ? C2.teal : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.22s" }}>
                <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "transform 0.22s", transform: directOnly ? "translateX(19px)" : "none" }} />
              </button>
            </div>
          )}
          {/* Flex dates */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: `${0.75*fs}rem`, fontWeight: 600, color: C2.fg }}>Datas flexíveis ±3 dias</div>
              <div style={{ fontSize: `${0.6*fs}rem`, color: C2.muted }}>Encontra preços mais baratos</div>
            </div>
            <button role="switch" aria-checked={flexDates} onClick={() => setFlexDates(v => !v)}
              style={{ width: 42, height: 23, borderRadius: 12, border: "none", cursor: "pointer", background: flexDates ? C2.teal : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", padding: "0 3px", transition: "background 0.22s" }}>
              <div style={{ width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "transform 0.22s", transform: flexDates ? "translateX(19px)" : "none" }} />
            </button>
          </div>
          {/* Budget */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: `${0.75*fs}rem`, fontWeight: 600, color: C2.fg, marginBottom: 4 }}>Orçamento máximo (R$)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${C2.border}`, borderRadius: 9, padding: "6px 10px" }}>
                <span style={{ color: C2.muted, fontSize: `${0.75*fs}rem` }}>R$</span>
                <input type="number" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} placeholder="Sem limite"
                  style={{ background: "none", border: "none", color: C2.fg, fontSize: `${0.8*fs}rem`, flex: 1, fontFamily: "inherit" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search button */}
      <button onClick={doSearch} disabled={loading} aria-busy={loading}
        style={{ width: "100%", padding: "15px", borderRadius: 16, border: "none", background: loading ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${C2.teal}, #0EB886)`, color: loading ? C2.muted : "#070A12", fontSize: `${0.9*fs}rem`, fontWeight: 800, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", transition: "all 0.2s" }}>
        {loading
          ? <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: C2.muted, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />Buscando com IA…</>
          : <>{searchType === "flight" ? "🔍 Buscar Voos" : searchType === "hotel" ? "🏨 Buscar Hotéis" : searchType === "package" ? "📦 Buscar Pacotes" : "🚗 Buscar Carros"}</>
        }
      </button>

      {/* Results */}
      {results && !results.error && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Summary */}
          <div style={{ background: `${C2.teal}12`, border: `1px solid ${C2.teal}35`, borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: `${0.7*fs}rem`, color: C2.muted, marginBottom: 4 }}>Resultado para</div>
            <div style={{ fontSize: `${1*fs}rem`, fontWeight: 800, color: C2.fg }}>{results.destino} · {results.cidade}</div>
            {results.resumo && <div style={{ fontSize: `${0.7*fs}rem`, color: C2.muted, marginTop: 4 }}>{results.resumo}</div>}
            {results.melhorOpcao && <div style={{ marginTop: 8, display: "inline-block", background: `${C2.accent}22`, color: C2.accent, fontSize: `${0.62*fs}rem`, fontWeight: 700, padding: "3px 10px", borderRadius: 9 }}>⭐ Melhor opção: {results.melhorOpcao}</div>}
          </div>

          {/* Flights */}
          {results.voos?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C2.border}`, borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: `${0.72*fs}rem`, fontWeight: 700, color: C2.teal, marginBottom: 12 }}>✈️ Melhores Voos</div>
              {results.voos.map((v, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < results.voos.length-1 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: `${0.9*fs}rem`, fontWeight: 800, color: C2.fg }}>{v.companhia}</div>
                      <div style={{ fontSize: `${0.65*fs}rem`, color: C2.muted, marginTop: 2 }}>
                        {v.saida} → {v.chegada} · {v.duracao} · {v.escalas === 0 ? "✅ Direto" : `${v.escalas} escala`} · {v.classe}
                      </div>
                      <div style={{ fontSize: `${0.62*fs}rem`, color: v.bagagem?.includes("incluída") ? C2.teal : C2.muted, marginTop: 2 }}>🧳 {v.bagagem}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: `${1.1*fs}rem`, fontWeight: 800, color: C2.teal }}>{dataHidden ? "R$ ••••" : v.preco}</div>
                      <div style={{ fontSize: `${0.6*fs}rem`, color: "rgba(108,99,255,0.9)" }}>ou {dataHidden ? "•••• pts" : v.milhas}</div>
                    </div>
                  </div>
                  {v.destaque && <div style={{ fontSize: `${0.62*fs}rem`, background: `${C2.accent}18`, color: C2.accent, padding: "3px 9px", borderRadius: 8, display: "inline-block" }}>💡 {v.destaque}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Hotels */}
          {results.hoteis?.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C2.border}`, borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: `${0.72*fs}rem`, fontWeight: 700, color: "#FF8C42", marginBottom: 12 }}>🏨 Hospedagens</div>
              {results.hoteis.map((h, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < results.hoteis.length-1 ? `1px solid rgba(255,255,255,0.05)` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div>
                      <div style={{ fontSize: `${0.9*fs}rem`, fontWeight: 800, color: C2.fg }}>{h.nome}</div>
                      <div style={{ fontSize: `${0.65*fs}rem`, color: C2.muted, marginTop: 2 }}>{"★".repeat(Math.min(h.estrelas||0,5))} · {h.tipo} · {h.bairro}</div>
                      <div style={{ fontSize: `${0.62*fs}rem`, color: C2.teal, marginTop: 2 }}>✓ {h.inclui}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: `${1*fs}rem`, fontWeight: 800, color: "#FF8C42" }}>{dataHidden ? "R$ ••/noite" : h.preco}</div>
                      <div style={{ fontSize: `${0.6*fs}rem`, color: C2.teal }}>⭐ {h.avaliacao}/10</div>
                    </div>
                  </div>
                  {h.destaque && <div style={{ fontSize: `${0.62*fs}rem`, background: "rgba(255,140,66,0.15)", color: "#FF8C42", padding: "3px 9px", borderRadius: 8, display: "inline-block" }}>🔥 {h.destaque}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Package */}
          {results.pacote && results.pacote.preco && (
            <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: `${0.72*fs}rem`, fontWeight: 700, color: "#9C8FFF", marginBottom: 8 }}>📦 Pacote Completo</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: `${0.78*fs}rem`, color: C2.muted }}>Voo + Hotel incluso</div>
                  <div style={{ fontSize: `${0.68*fs}rem`, color: C2.muted, marginTop: 3 }}>✓ {results.pacote.inclui}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: `${1.2*fs}rem`, fontWeight: 800, color: "#9C8FFF" }}>{dataHidden ? "R$ ••••" : results.pacote.preco}</div>
                  <div style={{ fontSize: `${0.62*fs}rem`, background: "rgba(255,217,61,0.2)", color: C2.accent, padding: "2px 8px", borderRadius: 8 }}>Economize {results.pacote.economia}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {results.dicaMelhorData && (
            <div style={{ background: "rgba(255,217,61,0.07)", border: "1px solid rgba(255,217,61,0.2)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: `${0.65*fs}rem`, fontWeight: 700, color: C2.accent, marginBottom: 4 }}>📅 Melhor data</div>
              <div style={{ fontSize: `${0.68*fs}rem`, color: C2.muted, lineHeight: 1.5 }}>{results.dicaMelhorData}</div>
            </div>
          )}
          {results.alertaOcupacao && (
            <div style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.22)", borderRadius: 14, padding: 12 }}>
              <div style={{ fontSize: `${0.65*fs}rem`, fontWeight: 700, color: C2.danger, marginBottom: 4 }}>⚠️ Atenção</div>
              <div style={{ fontSize: `${0.68*fs}rem`, color: C2.muted, lineHeight: 1.5 }}>{results.alertaOcupacao}</div>
            </div>
          )}
        </div>
      )}

      {results?.error && (
        <div style={{ marginTop: 16, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: 14, padding: 14, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>😕</div>
          <div style={{ fontSize: `${0.82*fs}rem`, fontWeight: 700, color: C2.danger }}>Erro na busca</div>
          <div style={{ fontSize: `${0.7*fs}rem`, color: C2.muted, marginTop: 4 }}>Verifique sua conexão e tente novamente</div>
          <button onClick={doSearch} style={{ marginTop: 12, padding: "8px 20px", borderRadius: 12, border: "none", background: `${C2.teal}22`, color: C2.teal, cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: `${0.75*fs}rem` }}>Tentar novamente</button>
        </div>
      )}
    </div>
  );
}

// ─── Smart Search Database ────────────────────────────────────────────────────
const SEARCH_DB = [
  // Destinos já no app
  { name: "Lisboa", country: "Portugal", iata: "LIS", emoji: "🇵🇹", tag: "Cultural", hint: "Vinhos, pastéis e história", aliases: ["lisbon","lx"] },
  { name: "Buenos Aires", country: "Argentina", iata: "EZE", emoji: "🇦🇷", tag: "Gastronomia", hint: "Tango, churrasco e cultura", aliases: ["ba","bsas"] },
  { name: "Tóquio", country: "Japão", iata: "NRT", emoji: "🇯🇵", tag: "Aventura", hint: "Tecnologia, culinária e tradição", aliases: ["tokyo","tokio","japao","japan"] },
  { name: "Medellín", country: "Colômbia", iata: "MDE", emoji: "🇨🇴", tag: "Natureza", hint: "Primavera eterna e metrô moderno", aliases: ["medellin","colombia","colombo"] },
  { name: "Roma", country: "Itália", iata: "FCO", emoji: "🇮🇹", tag: "História", hint: "Coliseu, arte e gastronomia", aliases: ["rome","italia","italy"] },
  { name: "Bali", country: "Indonésia", iata: "DPS", emoji: "🇮🇩", tag: "Praia", hint: "Praias, templos e natureza tropical", aliases: ["indonesia","indonésia"] },
  // Caribe & Colômbia
  { name: "San Andrés", country: "Colômbia", iata: "ADZ", emoji: "🇨🇴", tag: "Praia", hint: "Mar dos 7 cores e snorkeling incrível", aliases: ["san andres","san andrés","san andress","san andrés","san andrees","sandres","sanandres","ilha san andres","isla san andres","san andres colombia","san andres island"] },
  { name: "Providencia", country: "Colômbia", iata: "PVA", emoji: "🇨🇴", tag: "Praia", hint: "Paraíso caribenho quase intocado", aliases: ["providencia colombia"] },
  { name: "Cartagena", country: "Colômbia", iata: "CTG", emoji: "🇨🇴", tag: "Praia", hint: "Cidade colonial e mar caribenho", aliases: ["cartagena colombia","cartajena"] },
  { name: "Bogotá", country: "Colômbia", iata: "BOG", emoji: "🇨🇴", tag: "Cultural", hint: "Arte, café e cidade moderna", aliases: ["bogota","colombia","santa fe de bogota"] },
  { name: "Cancún", country: "México", iata: "CUN", emoji: "🇲🇽", tag: "Praia", hint: "Caribe mexicano e ruínas maias", aliases: ["cancun","cancunes","mexico"] },
  { name: "Punta Cana", country: "Rep. Dominicana", iata: "PUJ", emoji: "🇩🇴", tag: "Praia", hint: "All-inclusive e praias paradisíacas", aliases: ["puntacana","rep dominicana","república dominicana","dominicana"] },
  { name: "Havana", country: "Cuba", iata: "HAV", emoji: "🇨🇺", tag: "Cultural", hint: "Carros antigos, rum e ritmo caribenho", aliases: ["habana","la habana","cuba"] },
  { name: "San José (Costa Rica)", country: "Costa Rica", iata: "SJO", emoji: "🇨🇷", tag: "Natureza", hint: "Selvas, vulcões e biodiversidade", aliases: ["costa rica","costarica","san jose"] },
  // Europa
  { name: "Paris", country: "França", iata: "CDG", emoji: "🇫🇷", tag: "Cultural", hint: "Torre Eiffel, moda e gastronomia", aliases: ["franca","france"] },
  { name: "Londres", country: "Reino Unido", iata: "LHR", emoji: "🇬🇧", tag: "Cultural", hint: "Big Ben, museus e teatros", aliases: ["london","uk","england","inglaterra"] },
  { name: "Barcelona", country: "Espanha", iata: "BCN", emoji: "🇪🇸", tag: "Cultural", hint: "Gaudí, praias e vida noturna", aliases: ["espanha","spain","espana"] },
  { name: "Madri", country: "Espanha", iata: "MAD", emoji: "🇪🇸", tag: "Cultural", hint: "Prado, flamenco e gastronomia", aliases: ["madrid","madri","espanha"] },
  { name: "Amsterdam", country: "Holanda", iata: "AMS", emoji: "🇳🇱", tag: "Cultural", hint: "Canais, museus e bicicletas", aliases: ["holanda","netherlands","países baixos"] },
  { name: "Roma", country: "Itália", iata: "FCO", emoji: "🇮🇹", tag: "História", hint: "Coliseu, arte e gastronomia", aliases: ["rome","italia"] },
  { name: "Milão", country: "Itália", iata: "MXP", emoji: "🇮🇹", tag: "Luxo", hint: "Moda, design e Duomo", aliases: ["milan","milano","italia"] },
  { name: "Praga", country: "República Tcheca", iata: "PRG", emoji: "🇨🇿", tag: "História", hint: "Castelo medieval e cerveja artesanal", aliases: ["prague","tcheca"] },
  { name: "Viena", country: "Áustria", iata: "VIE", emoji: "🇦🇹", tag: "Cultural", hint: "Música clássica, arte e café", aliases: ["vienna","austria","austria"] },
  { name: "Istambul", country: "Turquia", iata: "IST", emoji: "🇹🇷", tag: "História", hint: "Entre Europa e Ásia, mil culturas", aliases: ["istanbul","turquia","turkey"] },
  { name: "Santorini", country: "Grécia", iata: "JTR", emoji: "🇬🇷", tag: "Praia", hint: "Casas brancas, pôr do sol e Mar Egeu", aliases: ["grecia","greece","grécia"] },
  // Américas
  { name: "Nova York", country: "EUA", iata: "JFK", emoji: "🇺🇸", tag: "Urbano", hint: "Manhattan, Broadway e Central Park", aliases: ["new york","newyork","nyc","ny","eua","usa"] },
  { name: "Miami", country: "EUA", iata: "MIA", emoji: "🇺🇸", tag: "Praia", hint: "South Beach, vida noturna e sol", aliases: ["eua","usa","florida"] },
  { name: "Orlando", country: "EUA", iata: "MCO", emoji: "🇺🇸", tag: "Aventura", hint: "Disney, Universal e parques temáticos", aliases: ["disney","universal","florida","eua","usa"] },
  { name: "Las Vegas", country: "EUA", iata: "LAS", emoji: "🇺🇸", tag: "Urbano", hint: "Cassinos, shows e entretenimento 24h", aliases: ["vegas","eua","usa"] },
  { name: "Toronto", country: "Canadá", iata: "YYZ", emoji: "🇨🇦", tag: "Urbano", hint: "Multiculturalismo e Cataratas do Niágara", aliases: ["canada","canadá"] },
  { name: "Vancouver", country: "Canadá", iata: "YVR", emoji: "🇨🇦", tag: "Natureza", hint: "Montanhas, mar e natureza exuberante", aliases: ["canada","canadá"] },
  { name: "Ciudad de México", country: "México", iata: "MEX", emoji: "🇲🇽", tag: "Cultural", hint: "Pirâmides astecas e gastronomia", aliases: ["mexico city","cdmx","mexico","méxico"] },
  { name: "Santiago", country: "Chile", iata: "SCL", emoji: "🇨🇱", tag: "Natureza", hint: "Andes, vinhos e Patagônia", aliases: ["chile"] },
  { name: "Lima", country: "Peru", iata: "LIM", emoji: "🇵🇪", tag: "Gastronomia", hint: "Machu Picchu e a melhor cozinha da América", aliases: ["peru"] },
  { name: "Cusco", country: "Peru", iata: "CUZ", emoji: "🇵🇪", tag: "História", hint: "Portal para Machu Picchu", aliases: ["cuzco","peru","machu picchu"] },
  { name: "Ilha de Páscoa", country: "Chile", iata: "IPC", emoji: "🗿", tag: "Aventura", hint: "Moais misteriosos no Pacífico", aliases: ["easter island","pascoa","chile"] },
  // Brasil
  { name: "Florianópolis", country: "Brasil", iata: "FLN", emoji: "🇧🇷", tag: "Praia", hint: "42 praias e natureza catarinense", aliases: ["floripa","santa catarina"] },
  { name: "Fernando de Noronha", country: "Brasil", iata: "FEN", emoji: "🇧🇷", tag: "Praia", hint: "Mergulho e paraíso ecológico", aliases: ["noronha"] },
  { name: "Gramado", country: "Brasil", iata: "GRU", emoji: "🇧🇷", tag: "Natureza", hint: "Serra gaúcha, fondue e Natal Luz", aliases: ["rio grande do sul","rs"] },
  { name: "Bonito", country: "Brasil", iata: "BYO", emoji: "🇧🇷", tag: "Natureza", hint: "Rios cristalinos e ecoturismo", aliases: ["mato grosso do sul","ms"] },
  { name: "Chapada Diamantina", country: "Brasil", iata: "LEC", emoji: "🇧🇷", tag: "Natureza", hint: "Cachoeiras, trilhas e cavernas", aliases: ["bahia","chapada","lençóis"] },
  { name: "Porto de Galinhas", country: "Brasil", iata: "REC", emoji: "🇧🇷", tag: "Praia", hint: "Piscinas naturais de água cristalina", aliases: ["pernambuco","pe","recife"] },
  // Ásia & Oceania
  { name: "Dubai", country: "Emirados Árabes", iata: "DXB", emoji: "🇦🇪", tag: "Luxo", hint: "Arranha-céus, deserto e shopping", aliases: ["emirados","uae"] },
  { name: "Bangkok", country: "Tailândia", iata: "BKK", emoji: "🇹🇭", tag: "Aventura", hint: "Templos budistas e street food", aliases: ["tailandia","thailand","tailândia"] },
  { name: "Phuket", country: "Tailândia", iata: "HKT", emoji: "🇹🇭", tag: "Praia", hint: "Praias paradisíacas e vida noturna", aliases: ["tailandia","tailândia"] },
  { name: "Seul", country: "Coreia do Sul", iata: "ICN", emoji: "🇰🇷", tag: "Urbano", hint: "K-pop, tecnologia e gastronomia", aliases: ["seoul","korea","coreia","corea"] },
  { name: "Singapura", country: "Singapura", iata: "SIN", emoji: "🇸🇬", tag: "Luxo", hint: "Cidade-estado futurista e gastronomia", aliases: ["singapore"] },
  { name: "Sydney", country: "Austrália", iata: "SYD", emoji: "🇦🇺", tag: "Aventura", hint: "Ópera, praias e vida selvagem", aliases: ["australia","austrália"] },
  // África & Oriente Médio
  { name: "Marrakech", country: "Marrocos", iata: "RAK", emoji: "🇲🇦", tag: "Cultural", hint: "Souks, riads e Saara", aliases: ["marraquexe","marrocos","morocco"] },
  { name: "Cairo", country: "Egito", iata: "CAI", emoji: "🇪🇬", tag: "História", hint: "Pirâmides de Gizé e Rio Nilo", aliases: ["egypt","egito","pyramids","piramides"] },
  { name: "Cidade do Cabo", country: "África do Sul", iata: "CPT", emoji: "🇿🇦", tag: "Aventura", hint: "Table Mountain, vinhos e vida selvagem", aliases: ["cape town","africa do sul","south africa"] },
  // Ilhas
  { name: "Maldivas", country: "Maldivas", iata: "MLE", emoji: "🇲🇻", tag: "Praia", hint: "Bangalôs sobre água cristalina", aliases: ["maldives"] },
  { name: "Ibiza", country: "Espanha", iata: "IBZ", emoji: "🇪🇸", tag: "Praia", hint: "Festas, praias e pôr do sol", aliases: ["espanha","spain"] },
  { name: "Maldivas", country: "Maldivas", iata: "MLE", emoji: "🇲🇻", tag: "Praia", hint: "Bangalôs sobre água cristalina", aliases: [] },
];

// Normalize: remove acentos, lowercase, trim
const norm = (s) => s?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";

// Levenshtein distance for typo tolerance
function levenshtein(a, b) {
  if (!a) return b.length; if (!b) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

// Smart scorer: returns relevance score (lower = better)
function scoreMatch(dest, rawQuery) {
  const q = norm(rawQuery);
  const words = q.split(/\s+/).filter(Boolean);
  const fields = [
    norm(dest.name), norm(dest.country), dest.iata.toLowerCase(),
    norm(dest.tag), norm(dest.hint),
    ...(dest.aliases || []).map(norm),
  ];

  // Exact match → highest priority
  if (fields.some(f => f === q)) return 0;
  // Starts-with match
  if (fields.some(f => f.startsWith(q))) return 1;
  // Contains full query
  if (fields.some(f => f.includes(q))) return 2;
  // All words present somewhere
  if (words.every(w => fields.some(f => f.includes(w)))) return 3;
  // Any word present
  if (words.some(w => fields.some(f => f.includes(w)))) return 4;
  // Typo tolerance: levenshtein <= 2 on any word vs any field-word
  const fieldWords = fields.flatMap(f => f.split(/\s+/));
  if (words.some(w => w.length >= 4 && fieldWords.some(fw => fw.length >= 4 && levenshtein(w, fw) <= 2))) return 5;
  return 99;
}

const POPULAR_SEARCHES = [
  { label: "🔥 Promoções", query: "Lisboa" },
  { label: "🏖️ Praias", query: "Bali" },
  { label: "🗺️ Europa", query: "Roma" },
  { label: "🌎 América", query: "Buenos Aires" },
  { label: "🎌 Ásia", query: "Tóquio" },
  { label: "🌴 Caribe", query: "Cancún" },
];

// ─── Smart Search Component ───────────────────────────────────────────────────
function SmartSearch({ searchQuery, setSearchQuery, setActiveTab, setAiPanel, speak, C, fontSize, largeTargets, savedSearches = [], setSavedSearches }) {
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const aiTimer = useRef(null);
  const currentQuery = useRef("");

  useEffect(() => {
    const raw = searchQuery.trim();
    currentQuery.current = raw;
    if (!raw) { setResults([]); setAiLoading(false); clearTimeout(aiTimer.current); return; }

    // 1. Instant local scoring
    const seen = new Set();
    const localHits = SEARCH_DB
      .filter(d => { const k = d.iata + "|" + norm(d.name); if (seen.has(k)) return false; seen.add(k); return true; })
      .map(d => ({ ...d, _score: scoreMatch(d, raw), _src: "local" }))
      .filter(d => d._score < 99)
      .sort((a, b) => a._score - b._score)
      .slice(0, 6);
    setResults(localHits);

    // 2. Always fire AI after 480ms debounce
    clearTimeout(aiTimer.current);
    setAiLoading(true);
    aiTimer.current = setTimeout(async () => {
      try {
        const prompt =
          `Você é especialista em viagens para brasileiros. O usuário digitou: "${raw}".\n` +
          `Pode ter erros de digitação, inglês, espanhol ou abreviações.\n` +
          `Interprete e sugira até 4 destinos relevantes (nacionais ou internacionais).\n` +
          `Exemplos obrigatórios: "san andres" ou "san andress" ou "san andrés" → San Andrés ilha Colômbia IATA ADZ; ` +
          `"floripa" → Florianópolis FLN; "noronha" → Fernando de Noronha FEN; ` +
          `"ilheus" → Ilhéus IOS; "pantanal" → Corumbá CMG; "chapada" → Lençóis LEC.\n` +
          `Responda SOMENTE com JSON array, sem markdown, sem backticks, sem texto antes ou depois:\n` +
          `[{"name":"...","country":"...","iata":"...","emoji":"...","tag":"...","hint":"frase curta"}]\n` +
          `Tags válidas: Praia, Cultural, Aventura, Gastronomia, História, Natureza, Luxo, Urbano.\n` +
          `Use o código IATA real do aeroporto principal mais próximo. Nomes em português.`;

        const text = await askClaude(prompt);
        if (currentQuery.current !== raw) return;
        let clean = text.trim().replace(/```json?|```/g, "").trim();
        const m = clean.match(/\[[\s\S]*?\]/);
        if (m) clean = m[0];
        const parsed = JSON.parse(clean);
        if (!Array.isArray(parsed)) return;
        setResults(prev => {
          const prevKeys = new Set(prev.map(d => norm(d.name)));
          const aiNew = parsed
            .filter(a => a.name && !prevKeys.has(norm(a.name)))
            .map(a => ({ ...a, _score: 10, _src: "ai" }));
          return [...prev, ...aiNew].slice(0, 7);
        });
      } catch (e) { /* silent */ }
      finally { if (currentQuery.current === raw) setAiLoading(false); }
    }, 480);

    return () => clearTimeout(aiTimer.current);
  }, [searchQuery]);

  const handleSelect = (dest) => {
    setSearchQuery(dest.name);
    setResults([]);
    setShowDropdown(false);
    speak("Destino: " + dest.name + ", " + dest.country);
    const known = destinations.find(d => d.iata === dest.iata || norm(d.name) === norm(dest.name));
    if (known) setTimeout(() => setAiPanel(known), 150);
  };

  const saveSearch = (query, tag = "") => {
    if (!query.trim()) return;
    setSavedSearches(prev => {
      if (prev.find(s => s.query.toLowerCase() === query.toLowerCase())) return prev;
      const newEntry = { id: Date.now(), query: query.trim(), tag, date: "agora" };
      speak("Pesquisa salva: " + query);
      return [newEntry, ...prev].slice(0, 20);
    });
  };

  const removeSearch = (id) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    speak("Pesquisa removida");
  };

  const tagColor = { Praia: "#4EC3FF", Cultural: "#9C8FFF", Aventura: "#FF8C42", Gastronomia: "#FFD93D", História: "#FF6B6B", Natureza: "#1AD9A4", Luxo: "#FFD700", Urbano: "#A0AEC0" };
  const fs2 = fontSize;

  return (
    <div style={{ padding: "0 20px 14px", position: "relative", zIndex: 50 }}>
      <label htmlFor="dest-search" style={{ position: "absolute", left: -9999 }}>Buscar destino</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: focused ? `${C.teal}0C` : "rgba(255,255,255,0.04)", border: `1.5px solid ${focused ? C.teal + "80" : C.border}`, borderRadius: (showDropdown && (results.length > 0 || !searchQuery)) ? "14px 14px 0 0" : 14, padding: "12px 15px", transition: "all 0.22s" }}>
        <span aria-hidden="true" style={{ fontSize: 16, opacity: 0.5 }}>🔍</span>
        <input
          id="dest-search" ref={inputRef}
          style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.88 * fs2}rem`, flex: 1, fontFamily: "inherit" }}
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => { setFocused(true); setShowDropdown(true); }}
          onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 300); }}
          onKeyDown={e => { if (e.key === "Escape") { setShowDropdown(false); setSearchQuery(""); inputRef.current?.blur(); } }}
          placeholder="🌍 Destino, cidade, praia, país…"
          aria-label="Buscar destinos nacionais e internacionais"
          role="combobox" aria-expanded={showDropdown}
          aria-autocomplete="list" aria-controls="search-listbox"
          autoComplete="off"
        />
        {aiLoading && <span style={{ width: 13, height: 13, border: `2px solid ${C.teal}40`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />}
        {searchQuery
          ? <button onClick={(e) => { e.preventDefault(); setSearchQuery(""); setResults([]); speak("Busca limpa"); inputRef.current?.focus(); }} aria-label="Limpar busca" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: 2, flexShrink: 0 }}>✕</button>
          : <span style={{ fontSize: 10, color: C.teal, fontWeight: 800, flexShrink: 0, opacity: 0.8 }}>IA</span>
        }
      </div>

      {showDropdown && (
        <div id="search-listbox" role="listbox"
          style={{ position: "absolute", left: 20, right: 20, background: "#0B1019", border: `1.5px solid ${C.teal}45`, borderTop: "none", borderRadius: "0 0 16px 16px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.7)", zIndex: 200, maxHeight: 420, overflowY: "auto" }}>

          {!searchQuery && (
            <div style={{ padding: "14px 14px 16px" }}>
              <p style={{ fontSize: `${0.58 * fs2}rem`, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Buscas populares</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                {[
                  { label: "🔥 Promoções", query: "Lisboa" },
                  { label: "🏖️ Praias BR", query: "Florianópolis" },
                  { label: "🌴 Caribe", query: "San Andrés" },
                  { label: "🗺️ Europa", query: "Roma" },
                  { label: "🎌 Ásia", query: "Tóquio" },
                  { label: "🇧🇷 Brasil", query: "Fernando de Noronha" },
                  { label: "✈️ Milhas", query: "Miami" },
                  { label: "🏔️ Natureza", query: "Chapada Diamantina" },
                  { label: "🎡 Parques", query: "Orlando" },
                  { label: "🍷 Gourmet", query: "Lima" },
                ].map((p, i) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); setSearchQuery(p.query); setShowDropdown(true); speak("Buscando " + p.label); inputRef.current?.focus(); }}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.05)", color: C.muted, fontSize: `${0.68 * fs2}rem`, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${C.teal}22`; e.currentTarget.style.color = C.teal; e.currentTarget.style.borderColor = `${C.teal}55`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = C.muted; e.currentTarget.style.borderColor = C.border; }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: `${0.58 * fs2}rem`, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Em alta agora 🔥</p>
              {[
                { name: "San Andrés", country: "Colômbia", emoji: "🇨🇴", hint: "Mar dos 7 cores — alta demanda", iata: "ADZ", tag: "Praia", _src: "local" },
                { name: "Florianópolis", country: "Brasil", emoji: "🇧🇷", hint: "Melhor verão do sul do Brasil", iata: "FLN", tag: "Praia", _src: "local" },
                { name: "Maldivas", country: "Maldivas", emoji: "🇲🇻", hint: "Bangalôs sobre água cristalina", iata: "MLE", tag: "Praia", _src: "local" },
                { name: "Seul", country: "Coreia do Sul", emoji: "🇰🇷", hint: "K-pop, tecnologia e gastronomia", iata: "ICN", tag: "Urbano", _src: "local" },
              ].map((dest, i, arr) => (
                <button key={i} onClick={(e) => { e.preventDefault(); handleSelect(dest); }} role="option"
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 2px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span style={{ fontSize: 22 }}>{dest.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: `${0.84 * fs2}rem`, fontWeight: 700, color: C.fg }}>{dest.name}</span>
                    <span style={{ fontSize: `${0.65 * fs2}rem`, color: C.muted, marginLeft: 7 }}>{dest.country}</span>
                    <div style={{ fontSize: `${0.62 * fs2}rem`, color: C.muted, marginTop: 1 }}>{dest.hint}</div>
                  </div>
                  <span style={{ fontSize: `${0.55 * fs2}rem`, fontWeight: 700, color: tagColor[dest.tag] || C.teal, background: `${tagColor[dest.tag] || C.teal}1A`, padding: "2px 8px", borderRadius: 7, flexShrink: 0 }}>{dest.tag}</span>
                </button>
              ))}
            </div>
          )}

          {searchQuery && results.length > 0 && (
            <div>
              {results.map((dest, i) => (
                <button key={dest.iata + i} onClick={(e) => { e.preventDefault(); handleSelect(dest); }} role="option"
                  aria-label={`${dest.name}, ${dest.country}`}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderBottom: i < results.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>{dest.emoji || "🌍"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                      <span style={{ fontSize: `${0.9 * fs2}rem`, fontWeight: 800, color: C.fg }}>{dest.name}</span>
                      <span style={{ fontSize: `${0.65 * fs2}rem`, color: C.muted }}>{dest.country}</span>
                      {dest._src === "ai" && <span style={{ fontSize: `${0.52 * fs2}rem`, fontWeight: 800, background: `${C.teal}25`, color: C.teal, padding: "1px 6px", borderRadius: 6 }}>IA</span>}
                    </div>
                    <div style={{ fontSize: `${0.65 * fs2}rem`, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dest.hint}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: `${0.57 * fs2}rem`, fontWeight: 700, color: tagColor[dest.tag] || C.teal, background: `${tagColor[dest.tag] || C.teal}1A`, padding: "2px 8px", borderRadius: 7 }}>{dest.tag}</span>
                    <span style={{ fontSize: `${0.52 * fs2}rem`, color: "rgba(255,255,255,0.22)", fontWeight: 600 }}>{dest.iata}</span>
                  </div>
                </button>
              ))}
              <button onClick={(e) => { e.preventDefault(); setShowDropdown(false); const m = results[0]; if (m) { const k = destinations.find(d => d.iata === m.iata || norm(d.name) === norm(m.name)); if (k) setAiPanel(k); } }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: `${C.teal}0C`, border: "none", cursor: "pointer", textAlign: "left", borderTop: `1px solid ${C.teal}25` }}>
                <span style={{ fontSize: 18 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: `${0.8 * fs2}rem`, fontWeight: 700, color: C.teal }}>Buscar passagens para "{searchQuery}"</div>
                  <div style={{ fontSize: `${0.63 * fs2}rem`, color: C.muted }}>IA encontra melhores preços, milhas e hospedagem</div>
                </div>
                <span style={{ color: C.teal, fontSize: 18, fontWeight: 700 }}>→</span>
              </button>
            </div>
          )}

          {searchQuery && results.length === 0 && aiLoading && (
            <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 16, height: 16, border: `2px solid ${C.teal}35`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              <div>
                <div style={{ fontSize: `${0.8 * fs2}rem`, fontWeight: 700, color: C.fg }}>Buscando "{searchQuery}"…</div>
                <div style={{ fontSize: `${0.63 * fs2}rem`, color: C.muted }}>IA interpretando o destino</div>
              </div>
            </div>
          )}

          {searchQuery && results.length === 0 && !aiLoading && (
            <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🌐</span>
              <div>
                <div style={{ fontSize: `${0.8 * fs2}rem`, fontWeight: 700, color: C.fg }}>Nenhum resultado para "{searchQuery}"</div>
                <div style={{ fontSize: `${0.65 * fs2}rem`, color: C.muted }}>Tente outro nome ou aguarde a IA</div>
              </div>
            </div>
          )}

          {searchQuery && aiLoading && results.length > 0 && (
            <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ width: 11, height: 11, border: `2px solid ${C.teal}35`, borderTopColor: C.teal, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
              <span style={{ fontSize: `${0.6 * fs2}rem`, color: C.muted }}>IA buscando mais sugestões…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AppInner() {
  const { colors: C, fontSize, largeTargets, reduceMotion, cbFilter, speak, highContrast, setHighContrast } = useA11y();
  const [screen, setScreen] = useState("login");
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedDest, setSelectedDest] = useState(null);
  const [aiPanel, setAiPanel] = useState(null);
  const [payMode, setPayMode] = useState("cash");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("Todos");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [savedDests, setSavedDests] = useState([1, 3]);
  const [savedSearches, setSavedSearches] = useState([
    { id: 1, query: "San Andrés", tag: "Praia", date: "hoje" },
    { id: 2, query: "Florianópolis", tag: "Praia", date: "ontem" },
  ]);
  const [saveSearchInput, setSaveSearchInput] = useState("");
  const [animIn, setAnimIn] = useState(true);
  const [secPanel, setSecPanel] = useState(false);
  const [a11yPanel, setA11yPanel] = useState(false);
  const [dataHidden, setDataHidden] = useState(false);
  const [a11yFilter, setA11yFilter] = useState(false);
  const idleTimer = useRef(null);
  const mainRef = useRef(null);
  const skipRef = useRef(null);

  const resetIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    if (screen === "app") idleTimer.current = setTimeout(() => setScreen("locked"), SESSION_TIMEOUT_MS);
  }, [screen]);

  useEffect(() => {
    window.addEventListener("click", resetIdle);
    window.addEventListener("keydown", resetIdle);
    resetIdle();
    return () => { window.removeEventListener("click", resetIdle); window.removeEventListener("keydown", resetIdle); clearTimeout(idleTimer.current); };
  }, [resetIdle]);

  useEffect(() => {
    setAnimIn(false);
    const t = setTimeout(() => setAnimIn(true), 50);
    return () => clearTimeout(t);
  }, [activeTab]);

  const handleTabChange = (id, label) => { setActiveTab(id); speak(`Aba ${label} selecionada`); mainRef.current?.focus(); };

  const filtered = destinations.filter(d => {
    const ms = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.country.toLowerCase().includes(searchQuery.toLowerCase());
    const mt = filterTag === "Todos" || d.tag === filterTag;
    const ma = !a11yFilter || d.a11y.wheelchair;
    return ms && mt && ma;
  });

  const toggleSave = (id, name) => { setSavedDests(p => { const n = p.includes(id) ? p.filter(x => x !== id) : [...p, id]; speak(p.includes(id) ? `${name} removido dos salvos` : `${name} salvo`); return n; }); };

  if (screen === "login") return <LoginScreen onNext={s => setScreen(s)} />;
  if (screen === "2fa") return <TwoFAScreen onVerified={() => setScreen("pin")} onBack={() => setScreen("login")} />;
  if (screen === "pin") return <PinScreen onUnlock={() => setScreen("app")} onLogout={() => setScreen("login")} isRelock={false} />;
  if (screen === "locked") return <PinScreen onUnlock={() => setScreen("app")} onLogout={() => setScreen("login")} isRelock={true} />;

  const btnH = largeTargets ? 52 : 40;

  return (
    <div style={{ ...rootStyle(C), filter: cbFilter, fontSize: `${fontSize}rem` }}>
      {/* Ambient */}
      {!highContrast && <div aria-hidden="true" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${C.teal}18 0%, transparent 60%)`, pointerEvents: "none", zIndex: 0 }} />}

      {/* Skip to content */}
      <a href="#main-content" ref={skipRef} onFocus={e => e.target.style.left = "16px"} onBlur={e => e.target.style.left = "-9999px"}
        style={{ position: "fixed", top: 16, left: -9999, zIndex: 9999, background: C.teal, color: "#070A12", padding: "10px 18px", borderRadius: 12, fontWeight: 800, fontSize: `${0.82 * fontSize}rem`, textDecoration: "none" }}>
        Ir para o conteúdo principal
      </a>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header role="banner" style={{ padding: "46px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }} aria-hidden="true">
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, animation: reduceMotion ? "none" : "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: `${0.62 * fontSize}rem`, letterSpacing: 2, textTransform: "uppercase", color: C.teal, fontWeight: 700 }}>seguro · ao vivo</span>
            </div>
            <h1 style={{ fontSize: `${1.6 * fontSize}rem`, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>
              Facilities<span style={{ color: C.teal }}>Travel</span>
            </h1>
            <p style={{ fontSize: `${0.75 * fontSize}rem`, color: C.muted, marginTop: 1 }}>Olá, {DEMO_USER.name} 👋</p>
          </div>
          <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={() => { setDataHidden(v => !v); speak(dataHidden ? "Valores visíveis" : "Valores ocultados"); }} aria-label={dataHidden ? "Mostrar valores" : "Ocultar valores financeiros"} aria-pressed={dataHidden}
              style={{ ...chipBtn(C, dataHidden ? `${C.danger}20` : "rgba(255,255,255,0.06)", dataHidden ? `${C.danger}50` : C.border), minWidth: largeTargets ? 44 : 34, minHeight: largeTargets ? 44 : 34 }}>
              {dataHidden ? "🙈" : "👁️"}
            </button>
            <button onClick={() => { setA11yPanel(true); speak("Painel de acessibilidade aberto"); }} aria-label="Abrir painel de acessibilidade" aria-haspopup="dialog"
              style={{ ...chipBtn(C, "rgba(78,195,255,0.1)", "rgba(78,195,255,0.28)"), minWidth: largeTargets ? 44 : 34, minHeight: largeTargets ? 44 : 34 }}>
              ♿
            </button>
            <button onClick={() => { setSecPanel(true); speak("Central de segurança aberta"); }} aria-label="Abrir central de segurança" aria-haspopup="dialog"
              style={{ ...chipBtn(C, `${C.teal}18`, `${C.teal}35`), minWidth: largeTargets ? 44 : 34, minHeight: largeTargets ? 44 : 34 }}>
              🛡️
            </button>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 11, padding: "6px 11px", fontSize: `${0.65 * fontSize}rem`, fontWeight: 700, color: C.accent, border: `1px solid ${C.accent}30` }} aria-label="Seus pontos de milhas">
              ✈️ {dataHidden ? "••••" : "48.200"}
            </div>
          </div>
        </header>

        {/* Sec strip */}
        <div style={{ padding: "0 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.teal}08`, border: `1px solid ${C.teal}20`, borderRadius: 11, padding: "6px 12px" }} role="note" aria-label="Status de segurança">
            <span aria-hidden="true">🔒</span>
            <span style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, color: C.teal }}>SSL · 2FA · Biometria · WCAG 2.1 AA</span>
            <span style={{ fontSize: `${0.6 * fontSize}rem`, color: C.muted, marginLeft: "auto" }}>{maskEmail(DEMO_USER.email)}</span>
          </div>
        </div>

        {/* Smart Search */}
        <SmartSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setActiveTab={setActiveTab}
          setAiPanel={setAiPanel}
          speak={speak}
          C={C}
          fontSize={fontSize}
          largeTargets={largeTargets}
          reduceMotion={reduceMotion}
          savedSearches={savedSearches}
          setSavedSearches={setSavedSearches}
        />

        {/* Accessibility filter */}
        <div style={{ padding: "0 20px 12px" }}>
          <button onClick={() => { setA11yFilter(v => !v); speak(a11yFilter ? "Filtro de acessibilidade removido" : "Mostrando apenas destinos acessíveis para cadeirantes"); }}
            aria-pressed={a11yFilter} aria-label="Filtrar apenas destinos acessíveis"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 20, border: `1px solid ${a11yFilter ? "#4EC3FF" : C.border}`, background: a11yFilter ? "rgba(78,195,255,0.12)" : "transparent", color: a11yFilter ? "#4EC3FF" : C.muted, fontSize: `${0.72 * fontSize}rem`, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
            <span>♿</span> {a11yFilter ? "Acessível — filtro ativo" : "Filtrar destinos acessíveis"}
          </button>
        </div>

        {/* Nav */}
        <nav role="navigation" aria-label="Navegação principal" style={{ display: "flex", padding: "0 20px", gap: 5, marginBottom: 18 }}>
          {[{ id: "search", label: "Buscar", icon: "🔍" }, { id: "discover", label: "Descobrir", icon: "🌍" }, { id: "deals", label: "Ofertas", icon: "⚡" }, { id: "tips", label: "Dicas", icon: "💡" }, { id: "saved", label: "Salvos", icon: "❤️" }].map(t => (
            <button key={t.id} onClick={() => handleTabChange(t.id, t.label)}
              role="tab" aria-selected={activeTab === t.id} aria-controls={`panel-${t.id}`}
              style={{ flex: 1, padding: "7px 2px", borderRadius: 11, fontSize: `${0.6 * fontSize}rem`, fontFamily: "inherit", border: `2px solid ${activeTab === t.id ? C.teal : "transparent"}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", background: activeTab === t.id ? C.teal : C.surface, color: activeTab === t.id ? "#070A12" : C.muted, fontWeight: activeTab === t.id ? 700 : 500, minHeight: largeTargets ? 56 : 44 }}>
              <span style={{ fontSize: 14 }} aria-hidden="true">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main id="main-content" ref={mainRef} tabIndex={-1} role="tabpanel" aria-label={`Conteúdo da aba ${activeTab}`}
          style={{ opacity: animIn ? 1 : 0, transition: reduceMotion ? "none" : "opacity 0.3s", paddingBottom: 110 }}>

          {/* ── SEARCH ── */}
          {activeTab === "search" && (
            <div>
              <div style={{ padding: "0 20px 6px" }}>
                <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, marginBottom: 2 }}>🔍 Busca Avançada</h2>
                <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, marginBottom: 16 }}>Voos, hotéis e pacotes — tudo em um lugar</p>
              </div>
              <FullSearchPanel C={C} fontSize={fontSize} largeTargets={largeTargets} speak={speak} setAiPanel={setAiPanel} dataHidden={dataHidden} />
            </div>
          )}

          {/* ── DISCOVER ── */}
          {activeTab === "discover" && (
            <div>
              <div style={{ padding: "0 20px 14px" }}>
                <p style={{ fontSize: `${0.6 * fontSize}rem`, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 9, fontWeight: 700 }} id="pay-label">Como pagar?</p>
                <div role="radiogroup" aria-labelledby="pay-label" style={{ display: "flex", gap: 7 }}>
                  {paymentModes.map(pm => (
                    <div key={pm.id} onClick={() => { setPayMode(pm.id); speak(`Modo de pagamento: ${pm.label}`); }}
                      role="radio" aria-checked={payMode === pm.id} tabIndex={0}
                      onKeyDown={e => (e.key === "Enter" || e.key === " ") && setPayMode(pm.id)}
                      style={{ flex: 1, padding: "9px 4px", borderRadius: 12, textAlign: "center", cursor: "pointer", background: payMode === pm.id ? `${C.teal}28` : C.surface, border: `2px solid ${payMode === pm.id ? C.teal : C.border}`, transition: "all 0.2s", minHeight: largeTargets ? 64 : 52 }}>
                      <div style={{ fontSize: 17 }} aria-hidden="true">{pm.icon}</div>
                      <div style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, color: payMode === pm.id ? C.teal : C.muted }}>{pm.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div role="group" aria-label="Filtrar por categoria" style={{ padding: "0 20px 14px", display: "flex", gap: 7, overflowX: "auto" }}>
                {tags.map(tag => (
                  <button key={tag} onClick={() => { setFilterTag(tag); speak(`Categoria: ${tag}`); }} aria-pressed={filterTag === tag}
                    style={{ padding: largeTargets ? "8px 16px" : "5px 13px", borderRadius: 20, fontSize: `${0.7 * fontSize}rem`, whiteSpace: "nowrap", fontFamily: "inherit", fontWeight: 600, border: `2px solid ${filterTag === tag ? C.teal : C.border}`, cursor: "pointer", background: filterTag === tag ? C.teal : C.surface, color: filterTag === tag ? "#070A12" : C.muted }}>
                    {tag}
                  </button>
                ))}
              </div>

              <ul role="list" aria-label="Lista de destinos" style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14, listStyle: "none" }}>
                {filtered.map((dest, i) => (
                  <li key={dest.id} role="listitem" style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}`, animation: reduceMotion ? "none" : `fadeUp 0.45s ease ${i * 0.07}s forwards`, opacity: reduceMotion ? 1 : 0 }}>
                    <article aria-label={`${dest.name}, ${dest.country}`}>
                      <div style={{ position: "relative", height: largeTargets ? 200 : 170 }}>
                        <img src={dest.img} alt={`Vista de ${dest.name} em ${dest.country}, temperatura ${dest.temp}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,10,18,0.95) 0%, transparent 55%)" }} />
                        <button className="save-btn" onClick={e => { e.stopPropagation(); toggleSave(dest.id, dest.name); }}
                          aria-label={savedDests.includes(dest.id) ? `Remover ${dest.name} dos salvos` : `Salvar ${dest.name}`} aria-pressed={savedDests.includes(dest.id)}
                          style={{ position: "absolute", top: 11, right: 11, fontSize: 19, minWidth: largeTargets ? 44 : 32, minHeight: largeTargets ? 44 : 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {savedDests.includes(dest.id) ? "❤️" : "🤍"}
                        </button>
                        {/* Accessibility badges */}
                        <div style={{ position: "absolute", top: 11, left: 11, display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <span style={{ background: "rgba(7,10,18,0.65)", backdropFilter: "blur(8px)", padding: "3px 10px", borderRadius: 20, fontSize: `${0.55 * fontSize}rem`, fontWeight: 700, color: C.teal, border: `1px solid ${C.teal}40` }}>{dest.tag}</span>
                          {dest.a11y.wheelchair && <span aria-label="Destino acessível para cadeirantes" title="Acessível ♿" style={{ background: "rgba(78,195,255,0.2)", border: "1px solid rgba(78,195,255,0.4)", borderRadius: 20, padding: "3px 7px", fontSize: 11 }}>♿</span>}
                          {dest.a11y.audioGuide && <span aria-label="Audioguia disponível" title="Audioguia" style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.4)", borderRadius: 20, padding: "3px 7px", fontSize: 11 }}>🔊</span>}
                          {dest.a11y.signLang && <span aria-label="Intérprete de Libras disponível" title="Libras" style={{ background: "rgba(255,217,61,0.2)", border: "1px solid rgba(255,217,61,0.4)", borderRadius: 20, padding: "3px 7px", fontSize: 11 }}>🤟</span>}
                        </div>
                        <button onClick={() => { setSelectedDest(dest); speak(`Detalhes de ${dest.name}, ${dest.country}. Temperatura: ${dest.temp}. Melhor preço: ${dest.price}.`); }}
                          aria-label={`Ver detalhes de ${dest.name}, ${dest.country}`}
                          style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", background: "none", border: "none", cursor: "pointer", width: "100%" }}>
                          <div style={{ textAlign: "left" }}>
                            <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1, color: C.fg }}>{dest.emoji} {dest.name}</h2>
                            <p style={{ fontSize: `${0.65 * fontSize}rem`, color: C.muted, marginTop: 2 }}>{dest.country} · {dest.temp}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: `${1 * fontSize}rem`, fontWeight: 800, color: C.teal }}>{dataHidden ? "R$ ••••" : payMode === "miles" ? dest.miles : payMode === "hybrid" ? dest.miles.split(" ")[0] + "+R$400" : dest.price}</div>
                            <div style={{ fontSize: `${0.55 * fontSize}rem`, background: `${C.accent}22`, color: C.accent, padding: "2px 7px", borderRadius: 8, fontWeight: 700, marginTop: 2 }}>Economize {dest.saving}</div>
                          </div>
                        </button>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.025)", padding: "8px 13px", display: "flex", gap: 7, alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: `${0.65 * fontSize}rem`, color: C.muted, lineHeight: 1.3 }}>💡 {dest.tip}</p>
                        <button onClick={() => { setAiPanel(dest); speak(`Abrindo busca com inteligência artificial para ${dest.name}`); }} aria-label={`Buscar voos para ${dest.name} com inteligência artificial`}
                          style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}35`, borderRadius: 10, padding: largeTargets ? "8px 14px" : "5px 10px", fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, color: C.teal, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                          🤖 IA
                        </button>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── PcD INFO TAB ── */}
          {activeTab === "a11yinfo" && (
            <div style={{ padding: "0 20px" }}>
              <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, marginBottom: 3 }}>♿ Viagem para Todos</h2>
              <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, marginBottom: 20 }}>Recursos, dicas e destinos acessíveis</p>

              {/* Compliance badges */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["WCAG 2.1 AA", "ARIA 1.2", "NBR 9050", "Lei 13.146/2015", "ABNT NBR 15599"].map(b => (
                  <span key={b} style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, background: "rgba(78,195,255,0.12)", color: "#4EC3FF", border: "1px solid rgba(78,195,255,0.3)", padding: "4px 10px", borderRadius: 9 }}>{b}</span>
                ))}
              </div>

              {/* A11y tips */}
              <ul aria-label="Dicas de acessibilidade por tipo de deficiência" style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, listStyle: "none" }}>
                {a11yTips.map((tip, i) => (
                  <li key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div role="img" aria-label={tip.title} style={{ width: largeTargets ? 50 : 42, height: largeTargets ? 50 : 42, borderRadius: 14, fontSize: largeTargets ? 22 : 18, background: `${tip.color}22`, border: `1px solid ${tip.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tip.icon}</div>
                    <div>
                      <h3 style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, marginBottom: 4, color: tip.color }}>{tip.title}</h3>
                      <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, lineHeight: 1.5 }}>{tip.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Accessibility legend */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <h3 style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, marginBottom: 14 }}>🔍 Legenda de ícones nos destinos</h3>
                {[
                  { icon: "♿", color: "#4EC3FF", label: "Acessível para cadeirantes" },
                  { icon: "🔊", color: "#9C8FFF", label: "Audioguia disponível" },
                  { icon: "🤟", color: "#FFD93D", label: "Intérprete de Libras" },
                  { icon: "⠃", color: "#1AD9A4", label: "Material em Braille" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: 22, background: `${item.color}22`, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: `1px solid ${item.color}44` }}>{item.icon}</span>
                    <span style={{ fontSize: `${0.78 * fontSize}rem`, fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Emergency contacts */}
              <div style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.22)", borderRadius: 16, padding: 16 }}>
                <h3 style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, marginBottom: 12, color: C.danger }}>🆘 Contatos de Emergência PcD</h3>
                {[
                  ["ANAC — Assistência em Aeroportos", "0800 725 4445"],
                  ["ANVISA — Medicamentos em Viagem", "0800 642 9782"],
                  ["Emergência geral no Brasil", "190 / 192"],
                ].map(([label, num], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ fontSize: `${0.68 * fontSize}rem`, color: C.muted }}>{label}</span>
                    <a href={`tel:${num.replace(/\D/g,"")}`} aria-label={`Ligar para ${label}: ${num}`}
                      style={{ fontSize: `${0.75 * fontSize}rem`, fontWeight: 800, color: C.danger, textDecoration: "none" }}>{num}</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DEALS ── */}
          {activeTab === "deals" && (
            <div style={{ padding: "0 20px" }}>
              <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, marginBottom: 3 }}>⚡ Ofertas Relâmpago</h2>
              <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, marginBottom: 18 }}>Monitorado em tempo real · IA ativa</p>
              <div style={{ background: `${C.danger}0C`, border: `1px solid ${C.danger}35`, borderRadius: 16, padding: 15, marginBottom: 16 }} role="alert" aria-live="polite">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}><span aria-hidden="true" style={{ fontSize: 17 }}>🔥</span><span style={{ fontWeight: 700, color: C.danger, fontSize: `${0.82 * fontSize}rem` }}>Alerta: São Paulo → Lisboa</span></div>
                <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, lineHeight: 1.5 }}>Caiu <strong style={{ color: C.danger }}>{dataHidden ? "R$ ••••" : "R$ 340"}</strong> desde ontem. Melhor preço em 90 dias!</p>
              </div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 15 }}>
                <h3 style={{ fontSize: `${0.78 * fontSize}rem`, fontWeight: 700, marginBottom: 12, color: C.teal }}>📊 Comparativo</h3>
                {[["GRU → LIS","R$ 2.890","45k pts","30k+R$600"],["GRU → EZE","R$ 1.200","18k pts","10k+R$400"],["GRU → NRT","R$ 5.400","72k pts","50k+R$800"]].map(([route,...v], i) => (
                  <div key={i} style={{ padding: "11px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, marginBottom: 7 }}>{route}</div>
                    <div style={{ display: "flex", gap: 7 }}>
                      {["💵","✈️","⚡"].map((ic,j) => (
                        <div key={j} style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 9, padding: "6px 4px", textAlign: "center" }}>
                          <div style={{ fontSize: 11 }} aria-hidden="true">{ic}</div>
                          <div style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, marginTop: 2 }}>{dataHidden ? "••••" : v[j]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TIPS ── */}
          {activeTab === "tips" && (
            <div style={{ padding: "0 20px" }}>
              <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, marginBottom: 3 }}>💡 Viagem Inteligente</h2>
              <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, marginBottom: 18 }}>Viaje bem gastando menos</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 11, listStyle: "none", marginBottom: 20 }}>
                {[
                  { icon: "✈️", title: "Alertas de Preço", desc: "Receba notificações quando passagens caírem de preço", color: C.teal },
                  { icon: "🏨", title: "Hostels Premium", desc: "Quartos privados por até 70% menos que hotéis convencionais", color: C.danger },
                  { icon: "🍜", title: "Coma como local", desc: "Mercados e feiras locais: experiência real com 5x menos gasto", color: C.accent },
                  { icon: "🌙", title: "Voos Noturnos", desc: "Economize em hospedagem viajando à noite", color: C.warn },
                  { icon: "📅", title: "Temporada Baixa", desc: "Destinos incríveis com até 60% de desconto fora do pico", color: "#4ECDC4" },
                ].map((tip, i) => (
                  <li key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, display: "flex", gap: 13, alignItems: "flex-start" }}>
                    <div role="img" aria-label={tip.title} style={{ width: largeTargets ? 48 : 40, height: largeTargets ? 48 : 40, borderRadius: 13, fontSize: largeTargets ? 22 : 18, background: `${tip.color}22`, border: `1px solid ${tip.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tip.icon}</div>
                    <div><h3 style={{ fontSize: `${0.82 * fontSize}rem`, fontWeight: 700, marginBottom: 3, color: tip.color }}>{tip.title}</h3><p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, lineHeight: 1.5 }}>{tip.desc}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── SAVED ── */}
          {activeTab === "saved" && (
            <div style={{ padding: "0 20px" }}>
              <h2 style={{ fontSize: `${1.25 * fontSize}rem`, fontWeight: 800, marginBottom: 3 }}>❤️ Salvos</h2>
              <p style={{ fontSize: `${0.7 * fontSize}rem`, color: C.muted, marginBottom: 18 }}>{savedDests.length} destino{savedDests.length !== 1 ? "s" : ""} na lista</p>

              {/* ── Saved Searches ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: `${0.9 * fontSize}rem`, fontWeight: 700 }}>🔖 Pesquisas salvas</h3>
                  <span style={{ fontSize: `${0.65 * fontSize}rem`, color: C.muted }}>{savedSearches.length} salva{savedSearches.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Add search input */}
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px" }}>
                    <span style={{ fontSize: 14, opacity: 0.5 }}>🔍</span>
                    <input
                      value={saveSearchInput}
                      onChange={e => setSaveSearchInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && saveSearchInput.trim()) { setSavedSearches(prev => { if (prev.find(s => s.query.toLowerCase() === saveSearchInput.toLowerCase())) return prev; return [{ id: Date.now(), query: saveSearchInput.trim(), tag: "", date: "agora" }, ...prev].slice(0,20); }); setSaveSearchInput(""); speak("Pesquisa salva"); } }}
                      placeholder="Salvar nova pesquisa…"
                      style={{ background: "none", border: "none", color: C.fg, fontSize: `${0.82 * fontSize}rem`, flex: 1, fontFamily: "inherit" }}
                    />
                  </div>
                  <button
                    onClick={() => { if (saveSearchInput.trim()) { setSavedSearches(prev => { if (prev.find(s => s.query.toLowerCase() === saveSearchInput.toLowerCase())) return prev; return [{ id: Date.now(), query: saveSearchInput.trim(), tag: "", date: "agora" }, ...prev].slice(0,20); }); setSaveSearchInput(""); speak("Pesquisa salva"); } }}
                    aria-label="Salvar pesquisa"
                    style={{ padding: "10px 16px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.teal}, #0EB886)`, color: "#070A12", fontWeight: 800, cursor: "pointer", fontSize: `${0.75 * fontSize}rem`, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                    + Salvar
                  </button>
                </div>

                {savedSearches.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, fontSize: `${0.78 * fontSize}rem` }}>
                    Nenhuma pesquisa salva ainda.<br/>Use o botão 🔖 nos resultados de busca.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {savedSearches.map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "10px 14px" }}>
                        <span style={{ fontSize: 18 }}>🔍</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: `${0.85 * fontSize}rem`, fontWeight: 700, color: C.fg }}>{s.query}</div>
                          <div style={{ fontSize: `${0.62 * fontSize}rem`, color: C.muted, marginTop: 1 }}>{s.tag && <span style={{ color: "#4EC3FF", marginRight: 6 }}>{s.tag}</span>}{s.date}</div>
                        </div>
                        <button
                          onClick={() => { setSearchQuery(s.query); setActiveTab("discover"); speak("Buscando " + s.query); }}
                          style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}35`, borderRadius: 10, padding: "5px 10px", fontSize: `${0.65 * fontSize}rem`, fontWeight: 700, color: C.teal, cursor: "pointer", fontFamily: "inherit" }}>
                          Buscar
                        </button>
                        <button
                          onClick={() => { setSavedSearches(prev => prev.filter(x => x.id !== s.id)); speak("Pesquisa removida"); }}
                          aria-label={`Remover pesquisa ${s.query}`}
                          style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, padding: "2px 4px" }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 20 }} />
              {savedDests.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 0" }} role="status"><div style={{ fontSize: 46, marginBottom: 12 }} aria-hidden="true">🌍</div><p style={{ color: C.muted, fontSize: `${0.82 * fontSize}rem` }}>Salve destinos para planejar</p></div>
                : <ul aria-label="Destinos salvos" style={{ display: "flex", flexDirection: "column", gap: 11, listStyle: "none" }}>
                  {destinations.filter(d => savedDests.includes(d.id)).map((dest) => (
                    <li key={dest.id}>
                      <button onClick={() => { setSelectedDest(dest); speak(`Detalhes de ${dest.name}`); }} aria-label={`Ver detalhes de ${dest.name}, ${dest.country}, preço ${dest.price}`}
                        style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: "hidden", display: "flex", cursor: "pointer", textAlign: "left" }}>
                        <img src={dest.img} style={{ width: largeTargets ? 100 : 82, height: largeTargets ? 100 : 82, objectFit: "cover", flexShrink: 0 }} alt={dest.name} loading="lazy" />
                        <div style={{ padding: "12px 13px", flex: 1 }}>
                          <div style={{ fontSize: `${0.95 * fontSize}rem`, fontWeight: 800, marginBottom: 2, color: C.fg }}>{dest.emoji} {dest.name}</div>
                          <div style={{ fontSize: `${0.65 * fontSize}rem`, color: C.muted, marginBottom: 8 }}>{dest.country}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: `${0.88 * fontSize}rem`, fontWeight: 800, color: C.teal }}>{dataHidden ? "R$ ••••" : dest.price}</span>
                            <span style={{ fontSize: `${0.55 * fontSize}rem`, background: `${C.accent}22`, color: C.accent, padding: "2px 7px", borderRadius: 8, fontWeight: 700 }}>-{dest.saving}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              }
            </div>
          )}
        </main>
      </div>

      {/* Bottom Nav */}
      <nav role="navigation" aria-label="Navegação por abas" style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: highContrast ? "#000000" : "rgba(7,10,18,0.92)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, padding: `10px 20px ${largeTargets ? 32 : 25}px`, display: "flex", justifyContent: "space-around", zIndex: 100 }}>
        {[{ id: "discover", icon: "🌍", label: "Explorar" }, { id: "deals", icon: "⚡", label: "Ofertas" }, { id: "tips", icon: "💡", label: "Dicas" }, { id: "a11yinfo", icon: "♿", label: "PcD" }, { id: "saved", icon: "❤️", label: "Salvos" }].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id, t.label)} role="tab" aria-selected={activeTab === t.id} aria-controls={`panel-${t.id}`}
            style={{ background: "none", border: activeTab === t.id ? `2px solid ${C.teal}` : "2px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: largeTargets ? "8px 12px" : "4px 8px", borderRadius: 12, cursor: "pointer", color: activeTab === t.id ? C.teal : C.muted, transition: "color 0.2s", minWidth: largeTargets ? 52 : 40, minHeight: largeTargets ? 52 : 40 }}>
            <span style={{ fontSize: largeTargets ? 22 : 19 }} aria-hidden="true">{t.icon}</span>
            <span style={{ fontSize: `${0.55 * fontSize}rem`, fontWeight: 700, fontFamily: "inherit" }}>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Modals */}
      {selectedDest && (
        <div onClick={() => setSelectedDest(null)} role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedDest.name}`}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: highContrast ? "#0A0A0A" : "#0C1018", borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ position: "relative" }}>
              <img src={selectedDest.img} style={{ width: "100%", height: 200, objectFit: "cover" }} alt={`Vista de ${selectedDest.name}`} />
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0C1018 0%, transparent 55%)" }} />
              <button onClick={() => setSelectedDest(null)} aria-label={`Fechar detalhes de ${selectedDest.name}`}
                style={{ position: "absolute", top: 13, right: 13, background: "rgba(7,10,18,0.72)", border: "none", color: C.fg, width: largeTargets ? 44 : 32, height: largeTargets ? 44 : 32, borderRadius: "50%", fontSize: 15, cursor: "pointer" }}>✕</button>
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "13px 17px" }}>
                <h2 style={{ fontSize: `${1.5 * fontSize}rem`, fontWeight: 800, color: C.fg }}>{selectedDest.emoji} {selectedDest.name}</h2>
                <p style={{ fontSize: `${0.68 * fontSize}rem`, color: C.muted }}>{selectedDest.country} · {selectedDest.temp}</p>
                <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                  {selectedDest.a11y.wheelchair && <span aria-label="Acessível para cadeirantes" style={{ background: "rgba(78,195,255,0.2)", border: "1px solid rgba(78,195,255,0.4)", borderRadius: 20, padding: "3px 8px", fontSize: 11 }}>♿ Acessível</span>}
                  {selectedDest.a11y.audioGuide && <span aria-label="Audioguia disponível" style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.4)", borderRadius: 20, padding: "3px 8px", fontSize: 11 }}>🔊 Audioguia</span>}
                  {selectedDest.a11y.signLang && <span aria-label="Libras disponível" style={{ background: "rgba(255,217,61,0.2)", border: "1px solid rgba(255,217,61,0.4)", borderRadius: 20, padding: "3px 8px", fontSize: 11 }}>🤟 Libras</span>}
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 17px 40px" }}>
              <button onClick={() => { setSelectedDest(null); setAiPanel(selectedDest); }} aria-label={`Buscar voos para ${selectedDest.name} com inteligência artificial`}
                style={{ width: "100%", padding: "14px", borderRadius: 16, border: "none", background: `linear-gradient(135deg, ${C.teal}, #0EB886)`, color: "#070A12", fontSize: `${0.82 * fontSize}rem`, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10, fontFamily: "inherit" }}>
                🤖 Buscar com IA — Claude
              </button>
            </div>
          </div>
        </div>
      )}

      {aiPanel && (
        <div onClick={() => setAiPanel(null)} role="dialog" aria-modal="true" aria-label={`Busca de voos para ${aiPanel.name}`}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: highContrast ? "#0A0A0A" : "#0C1018", borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
            <AIFlightPanel dest={aiPanel} onClose={() => setAiPanel(null)} dataHidden={dataHidden} />
          </div>
        </div>
      )}

      {a11yPanel && (
        <div onClick={() => setA11yPanel(false)} role="dialog" aria-modal="true" aria-labelledby="a11y-title"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: highContrast ? "#0A0A0A" : "#0C1018", borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
            <A11yPanel onClose={() => setA11yPanel(false)} />
          </div>
        </div>
      )}

      {secPanel && (
        <div onClick={() => setSecPanel(false)} role="dialog" aria-modal="true" aria-label="Central de segurança"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(5px)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: highContrast ? "#0A0A0A" : "#0C1018", borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ padding: "22px 18px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: `${1.1 * fontSize}rem`, fontWeight: 800 }}>🛡️ Central de Segurança</h2>
                <button onClick={() => setSecPanel(false)} aria-label="Fechar central de segurança" style={{ background: "rgba(255,255,255,0.06)", border: "none", color: C.fg, width: 30, height: 30, borderRadius: "50%", fontSize: 13, cursor: "pointer" }}>✕</button>
              </div>
              {[["🔒","Criptografia SSL 256-bit","Ativo",true],["📱","2FA por SMS","Verificado",true],["🫆","Biometria","Disponível",BIOMETRIC_SUPPORTED],["🔢","PIN de segurança","Configurado",true],["⏱️","Bloqueio automático 5 min","Ativo",true],["👁️","Ocultação de dados","Ativo",dataHidden],["♿","WCAG 2.1 AA","Conforme",true],["🚫","Dados nunca vendidos","Garantido",true]].map(([icon,label,status,ok],i,arr) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <span aria-hidden="true" style={{ fontSize: 18 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: `${0.78 * fontSize}rem`, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: `${0.6 * fontSize}rem`, color: C.muted, marginTop: 1 }}>{status}</div>
                  </div>
                  <div aria-label={ok ? "Ativo" : "Inativo"} style={{ fontSize: `${0.6 * fontSize}rem`, fontWeight: 700, padding: "2px 9px", borderRadius: 9, background: ok ? `${C.teal}22` : "rgba(255,255,255,0.04)", color: ok ? C.teal : C.muted }}>{ok ? "✓" : "—"}</div>
                </div>
              ))}
              <button onClick={() => { setSecPanel(false); setScreen("login"); speak("Saindo da conta com segurança."); }}
                aria-label="Sair da conta com segurança"
                style={{ background: "none", border: `1px solid ${C.danger}40`, borderRadius: 13, color: C.danger, padding: "11px", fontSize: `${0.75 * fontSize}rem`, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%", marginTop: 16 }}>
                🚪 Sair da conta com segurança
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilitiesTravel() {
  return (
    <A11yProvider>
      <AppInner />
      <GS />
    </A11yProvider>
  );
}

// ─── Style Helpers ────────────────────────────────────────────────────────────
const authContainer = (C) => ({ fontFamily: "'Syne','DM Sans',system-ui,sans-serif", background: C.bg, minHeight: "100vh", color: C.fg, maxWidth: 430, margin: "0 auto", padding: "64px 26px 40px", position: "relative", overflow: "hidden" });
const logoBox = (C) => ({ width: 58, height: 58, borderRadius: 20, background: `${C.teal}20`, border: `2px solid ${C.teal}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 13px" });
const rootStyle = (C) => ({ fontFamily: "'Syne','DM Sans',system-ui,sans-serif", background: C.bg, minHeight: "100vh", color: C.fg, maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden" });
const chipBtn = (C, bg, border) => ({ background: bg, border: `1px solid ${border}`, borderRadius: 10, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34 });

function GS() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{display:none;}
      input,select{font-family:'DM Sans',system-ui,sans-serif;}
      input:focus,select:focus{outline:2px solid #1AD9A4;outline-offset:2px;}
      button:focus-visible{outline:3px solid #1AD9A4;outline-offset:3px;}
      a:focus-visible{outline:3px solid #1AD9A4;outline-offset:3px;}
      button{font-family:'Syne',system-ui,sans-serif;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}
      @keyframes shimmer{0%{opacity:0.4}50%{opacity:0.8}100%{opacity:0.4}}
      .save-btn{border:none;cursor:pointer;background:none;transition:transform 0.2s ease;}
      .save-btn:active{transform:scale(1.35);}
      @media (prefers-reduced-motion: reduce){*{animation-duration:0.01ms !important;transition-duration:0.01ms !important;}}
    `}</style>
  );
}


// Entry point alias
const App = FacilitiesTravel;
export { App };
