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
    desc: "40+ spots vérifiés sur carte. Filtre par type (rivière, lac, mer), difficulté, activité et pays d'un seul geste.",
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

export default function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      style={{ padding: "88px 24px", background: "#fff" }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
            Fonctionnalités
          </p>
          <h2 id="features-heading" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 900, color: "#1a2e28", letterSpacing: "-0.8px", lineHeight: 1.15, fontFamily: "'Fraunces', Georgia, serif" }}>
            Tout ce dont tu as besoin.
            <br />
            <span style={{ color: "#1a9e6e" }}>Rien de superflu.</span>
          </h2>
        </div>

        {/* Feature grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "20px" }}>
          {FEATURES.map(({ icon, title, desc, tag, tagColor }) => (
            <div
              key={title}
              style={{ background: "#f7faf9", border: "1px solid #e8f0ed", borderRadius: "20px", padding: "26px 22px", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
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
