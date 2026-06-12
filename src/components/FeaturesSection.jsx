import { useState } from "react";

const FEATURES = [
  {
    icon: "🌤️",
    title: "Météo en temps réel par spot",
    desc: "Vent, température de l'air et de l'eau, débit pour les rivières. Pas les moyennes — la réalité d'aujourd'hui.",
    tag: "Gratuit",
    tagColor: "#1a9e6e",
  },
  {
    icon: "🤖",
    title: "Recherche intelligente",
    desc: 'Tape "rafting débutant ce weekend près de Lyon" et l\'IA comprend ta demande pour te renvoyer les spots qui matchent vraiment.',
    tag: "IA",
    tagColor: "#6366f1",
  },
  {
    icon: "🗺️",
    title: "Carte interactive",
    desc: "150+ spots vérifiés sur carte. Filtre par type (rivière, lac, mer), difficulté, activité et pays d'un seul geste.",
    tag: "Gratuit",
    tagColor: "#1a9e6e",
  },
  {
    icon: "💎",
    title: "Spots secrets & pépites",
    desc: "Les spots que les guides touristiques ne mentionnent pas. Sélection curatée par la communauté, réservée aux membres Premium.",
    tag: "Premium",
    tagColor: "#f59e0b",
  },
  {
    icon: "👥",
    title: "Communauté & expéditions",
    desc: "Rejoins des groupes d'expédition, partage tes retours terrain, suis les sorties récentes de la communauté.",
    tag: "Premium",
    tagColor: "#f59e0b",
  },
];

function FeatureIllustration() {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div style={{
        borderRadius: "20px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f0faf6 0%, #e8f7f3 50%, #e0f4fb 100%)",
        border: "1px solid #d0ece4",
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        marginBottom: "48px",
      }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "🌤️", label: "Météo live", color: "#1a9e6e" },
            { icon: "🤖", label: "Recherche IA", color: "#6366f1" },
            { icon: "🗺️", label: "Carte interactive", color: "#0891b2" },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{
              background: "#fff",
              border: `1px solid ${color}30`,
              borderRadius: "16px",
              padding: "20px 28px",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              minWidth: "140px",
            }}>
              <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>{icon}</div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color, letterSpacing: "0.2px" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "48px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
      <img
        src="/images/features-illustration.png"
        alt="Aperçu des fonctionnalités FleuVibe — météo, IA, carte interactive"
        onError={() => setImgError(true)}
        style={{ width: "100%", display: "block", maxHeight: "400px", objectFit: "cover" }}
      />
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      style={{ padding: "88px 24px", background: "#fff" }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
            Fonctionnalités
          </p>
          <h2 id="features-heading" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 900, color: "#1a2e28", letterSpacing: "-0.8px", lineHeight: 1.15, fontFamily: "'Fraunces', Georgia, serif" }}>
            Tout ce dont tu as besoin.
            <br />
            <span style={{ color: "#1a9e6e" }}>Rien de superflu.</span>
          </h2>
        </div>

        {/* Illustration Canva */}
        <FeatureIllustration />

        {/* Feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
          {FEATURES.map(({ icon, title, desc, tag, tagColor }) => (
            <div
              key={title}
              style={{ background: "#fff", border: "1px solid #e8f0ed", borderRadius: "20px", padding: "26px 22px", transition: "transform 0.2s,box-shadow 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <span style={{ fontSize: "1.9rem" }}>{icon}</span>
                <span style={{ padding: "3px 10px", background: `${tagColor}18`, border: `1px solid ${tagColor}44`, borderRadius: "20px", fontSize: "0.62rem", fontWeight: 700, color: tagColor, letterSpacing: "0.5px" }}>
                  {tag}
                </span>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e28", marginBottom: "8px", lineHeight: 1.25 }}>{title}</h3>
              <p style={{ fontSize: "0.85rem", color: "#6a8a80", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
