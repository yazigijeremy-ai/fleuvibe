import { useState, useEffect } from "react";

const routes = [
  {
    id: 1,
    name: "Lesse · Houyet → Anseremme",
    river: "Lesse",
    region: "Wallonie",
    distance: "21 km",
    duration: "4–5h",
    difficulty: "Facile",
    activities: ["Kayak", "Canoë"],
    tags: ["Famille", "Nature", "Grottes"],
    description: "Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses. Idéal pour débuter.",
    color: "#1a9e6e",
    emoji: "🏞️",
    open: true,
    level: "Normal",
  },
  {
    id: 2,
    name: "Ourthe · La Roche → Hotton",
    river: "Ourthe",
    region: "Wallonie",
    distance: "18 km",
    duration: "3–4h",
    difficulty: "Intermédiaire",
    activities: ["Kayak", "Rafting"],
    tags: ["Sportif", "Paysages", "Ardennes"],
    description: "Une rivière sinueuse aux méandres spectaculaires, avec quelques rapides pour pimenter la sortie.",
    color: "#2563eb",
    emoji: "🌊",
    open: true,
    level: "Normal",
  },
  {
    id: 3,
    name: "Semois · Bouillon → Alle",
    river: "Semois",
    region: "Wallonie",
    distance: "34 km",
    duration: "2 jours",
    difficulty: "Intermédiaire",
    activities: ["Kayak", "Canoë", "Camping"],
    tags: ["Multi-jours", "Sauvage", "Bivouac"],
    description: "Une immersion totale dans la nature gaumaise, avec nuit en camping au bord de l'eau.",
    color: "#7c3aed",
    emoji: "⛺",
    open: true,
    level: "Normal",
  },
  {
    id: 4,
    name: "Amblève · Stoumont → Comblain",
    river: "Amblève",
    region: "Wallonie",
    distance: "12 km",
    duration: "2–3h",
    difficulty: "Facile",
    activities: ["Kayak", "SUP"],
    tags: ["Famille", "Court", "Débutants"],
    description: "Un parcours court et accessible, parfait pour une première expérience sur l'eau en famille.",
    color: "#f59e0b",
    emoji: "🌿",
    open: true,
    level: "Normal",
  },
  {
    id: 5,
    name: "Meuse · Namur → Dinant",
    river: "Meuse",
    region: "Wallonie",
    distance: "30 km",
    duration: "1 journée",
    difficulty: "Facile",
    activities: ["Canoë", "Kayak", "Bateau électrique"],
    tags: ["Patrimoine", "Villes", "Large"],
    description: "Longer la Meuse entre citadelles et villages pittoresques, sur un fleuve large et calme.",
    color: "#0891b2",
    emoji: "🏰",
    open: true,
    level: "Normal",
  },
  {
    id: 6,
    name: "Leie · Gand → Deinze",
    river: "Leie",
    region: "Flandre",
    distance: "16 km",
    duration: "3h",
    difficulty: "Facile",
    activities: ["Kayak", "SUP", "Pédalo"],
    tags: ["Urbain", "Culturel", "Gand"],
    description: "Pagayer au cœur de Gand puis glisser vers la campagne flamande longeant les prairies verdoyantes.",
    color: "#16a34a",
    emoji: "🏙️",
    open: true,
    level: "Normal",
  },
  {
    id: 7,
    name: "Salm · Vielsalm → Trois-Ponts",
    river: "Salm",
    region: "Wallonie",
    distance: "9 km",
    duration: "2h",
    difficulty: "Sportif",
    activities: ["Kayak", "Rafting"],
    tags: ["Technique", "Rapides", "Expert"],
    description: "Réservé aux pagayeurs expérimentés. Rapides techniques et passages exigeants dans les Hautes Fagnes.",
    color: "#dc2626",
    emoji: "🔥",
    open: false,
    level: "Haut",
  },
];

const activities = ["Tous", "Kayak", "Canoë", "SUP", "Rafting", "Bateau électrique", "Pédalo"];
const difficulties = ["Toutes", "Facile", "Intermédiaire", "Sportif"];
const regions = ["Toutes", "Wallonie", "Flandre"];

const difficultyColor = {
  Facile: "#1a9e6e",
  Intermédiaire: "#f59e0b",
  Sportif: "#dc2626",
};

const WaveIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <path d="M2 20 C6 14, 10 26, 16 20 C22 14, 26 26, 30 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M2 24 C6 18, 10 30, 16 24 C22 18, 26 30, 30 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    <circle cx="16" cy="10" r="4" fill="currentColor" opacity="0.9"/>
    <path d="M12 8 L10 4 M20 8 L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const RulerIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 6.5l-1.5-1.5-2 2-1-1L18 4l-1.5-1.5L15 4l-1-1 1.5-1.5L14 0 0 14l1.5 1.5L3 14l1 1-1.5 1.5L4 18l2-2 1 1-2 2 1.5 1.5L21 6.5zM4.5 15L3 13.5l9-9L13.5 6l-9 9z"/>
  </svg>
);

export default function FleuVibe() {
  const [selected, setSelected] = useState(null);
  const [activity, setActivity] = useState("Tous");
  const [difficulty, setDifficulty] = useState("Toutes");
  const [region, setRegion] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const filtered = routes.filter((r) => {
    if (activity !== "Tous" && !r.activities.includes(activity)) return false;
    if (difficulty !== "Toutes" && r.difficulty !== difficulty) return false;
    if (region !== "Toutes" && r.region !== region) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.river.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a1628 0%, #0d2240 40%, #0a3d2e 100%)",
      fontFamily: "'Outfit', 'DM Sans', sans-serif",
      color: "#e8f4f0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@1,700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26,158,110,0.4); border-radius: 2px; }
        .card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .card:hover { transform: translateY(-4px); }
        .pill { transition: all 0.18s ease; cursor: pointer; }
        .pill:hover { transform: scale(1.05); }
        .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade-in.loaded { opacity: 1; transform: translateY(0); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes ripple { 0%{transform:scale(0.95);opacity:0.5} 100%{transform:scale(2.5);opacity:0} }
        @keyframes wave { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .wave-bg { animation: wave 18s linear infinite; }
        .status-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
      `}</style>

      {/* Animated background waves */}
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: "180px", overflow: "hidden", opacity: 0.12, pointerEvents: "none", zIndex: 0 }}>
        <div className="wave-bg" style={{ display: "flex", width: "200%" }}>
          <svg viewBox="0 0 1440 180" style={{ width: "50%", minWidth: "720px" }} fill="#1a9e6e">
            <path d="M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,180 L0,180 Z" />
          </svg>
          <svg viewBox="0 0 1440 180" style={{ width: "50%", minWidth: "720px" }} fill="#1a9e6e">
            <path d="M0,80 C240,140 480,20 720,80 C960,140 1200,20 1440,80 L1440,180 L0,180 Z" />
          </svg>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ color: "#1a9e6e", animation: "float 3s ease-in-out infinite" }}>
              <WaveIcon />
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "clamp(2rem, 6vw, 3.2rem)",
              fontWeight: 800,
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #a8edcf 0%, #1a9e6e 50%, #38bdf8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>FleuVibe</h1>
          </div>
          <p style={{ color: "#7ecfb0", fontSize: "1rem", margin: 0, fontWeight: 300, letterSpacing: "0.05em" }}>
            Explorer les rivières de Belgique · Kayak · Canoë · SUP · Rafting
          </p>
        </div>

        {/* Search bar */}
        <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "0.1s", marginBottom: "20px" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Rechercher une rivière ou un parcours..."
            style={{
              width: "100%",
              padding: "14px 20px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(26,158,110,0.3)",
              borderRadius: "14px",
              color: "#e8f4f0",
              fontSize: "0.95rem",
              outline: "none",
              backdropFilter: "blur(10px)",
            }}
          />
        </div>

        {/* Filters */}
        <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "0.15s", marginBottom: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {activities.map(a => (
              <button key={a} className="pill" onClick={() => setActivity(a)} style={{
                padding: "7px 16px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: activity === a ? "#1a9e6e" : "rgba(255,255,255,0.1)",
                background: activity === a ? "rgba(26,158,110,0.25)" : "rgba(255,255,255,0.04)",
                color: activity === a ? "#a8edcf" : "#8fb5a8",
                fontSize: "0.82rem",
                fontWeight: 500,
                cursor: "pointer",
              }}>{a}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {difficulties.map(d => (
              <button key={d} className="pill" onClick={() => setDifficulty(d)} style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: difficulty === d ? (difficultyColor[d] || "#2563eb") : "rgba(255,255,255,0.08)",
                background: difficulty === d ? `${difficultyColor[d] || "#2563eb"}22` : "rgba(255,255,255,0.03)",
                color: difficulty === d ? (difficultyColor[d] || "#7eb4f5") : "#8fb5a8",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}>{d}</button>
            ))}
            {regions.map(r => (
              <button key={r} className="pill" onClick={() => setRegion(r)} style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: region === r ? "#7c3aed" : "rgba(255,255,255,0.08)",
                background: region === r ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                color: region === r ? "#c4b5fd" : "#8fb5a8",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ color: "#5a8a78", fontSize: "0.8rem", marginBottom: "16px", fontWeight: 500 }}>
          {filtered.length} parcours trouvé{filtered.length !== 1 ? "s" : ""}
        </div>

        {/* Route cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((route, i) => (
            <div
              key={route.id}
              className={`card fade-in ${loaded ? "loaded" : ""}`}
              style={{ transitionDelay: `${0.2 + i * 0.07}s` }}
              onClick={() => setSelected(selected?.id === route.id ? null : route)}
            >
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${selected?.id === route.id ? route.color + "80" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "18px",
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: selected?.id === route.id ? `0 0 30px ${route.color}20` : "none",
                backdropFilter: "blur(10px)",
              }}>
                {/* Card top bar */}
                <div style={{
                  height: "3px",
                  background: `linear-gradient(90deg, ${route.color}, transparent)`,
                }} />

                <div style={{ padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "1.4rem" }}>{route.emoji}</span>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#daf0e8" }}>{route.name}</h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6da892", fontSize: "0.82rem" }}>
                        <MapPin />
                        <span>{route.river} · {route.region}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: `${difficultyColor[route.difficulty]}22`,
                        color: difficultyColor[route.difficulty],
                        border: `1px solid ${difficultyColor[route.difficulty]}44`,
                      }}>{route.difficulty}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.75rem" }}>
                        <span className="status-dot" style={{ background: route.open ? "#1a9e6e" : "#dc2626" }} />
                        <span style={{ color: route.open ? "#7ecfb0" : "#f87171" }}>
                          {route.open ? "Navigable" : "Fermé"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#8fb5a8", fontSize: "0.82rem" }}>
                      <RulerIcon /><span>{route.distance}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#8fb5a8", fontSize: "0.82rem" }}>
                      <ClockIcon /><span>{route.duration}</span>
                    </div>
                    <div style={{ color: "#5a8a78", fontSize: "0.75rem" }}>
                      Niveau : <span style={{ color: "#a8d4c4" }}>{route.level}</span>
                    </div>
                  </div>

                  {/* Activities */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {route.activities.map(a => (
                      <span key={a} style={{
                        padding: "3px 10px",
                        background: `${route.color}18`,
                        border: `1px solid ${route.color}35`,
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        color: route.color === "#2563eb" ? "#93c5fd" : "#a8edcf",
                        fontWeight: 500,
                      }}>{a}</span>
                    ))}
                    {route.tags.map(t => (
                      <span key={t} style={{
                        padding: "3px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "0.72rem",
                        color: "#6a9a8c",
                      }}>#{t}</span>
                    ))}
                  </div>

                  {/* Expanded description */}
                  {selected?.id === route.id && (
                    <div style={{
                      marginTop: "16px",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      animation: "fadeIn 0.3s ease",
                    }}>
                      <p style={{ color: "#a8c8bc", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 16px 0" }}>
                        {route.description}
                      </p>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button style={{
                          padding: "10px 22px",
                          background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
                          border: "none",
                          borderRadius: "10px",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          boxShadow: `0 4px 15px ${route.color}40`,
                        }}>🛶 Voir le parcours</button>
                        <button style={{
                          padding: "10px 18px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "10px",
                          color: "#a8c8bc",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}>📍 Voir sur la carte</button>
                        <button style={{
                          padding: "10px 18px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "10px",
                          color: "#a8c8bc",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}>❤️ Sauvegarder</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a7a6a" }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🌊</div>
              <p style={{ fontSize: "1rem" }}>Aucun parcours ne correspond à tes filtres.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "48px", padding: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", color: "#3a6a5a", fontSize: "0.78rem" }}>
          <p style={{ margin: 0 }}>FleuVibe · Prototype v0.1 · Données : SPW Wallonie + Sport Vlaanderen</p>
          <p style={{ margin: "4px 0 0" }}>Toujours vérifier la navigabilité en temps réel avant de partir 🛶</p>
        </div>
      </div>
    </div>
  );
}
