const TESTIMONIALS = [
  {
    quote: "J'ai trouvé mon spot parfait en 2 minutes chrono. J'ai tapé \"kayak calme avec vue montagne\" et l'IA m'a sorti exactement ce que je voulais. Depuis, je l'utilise avant chaque sortie.",
    name: "Alex M.",
    role: "Kayakiste · 6 ans de pratique",
    avatar: "🧔",
    stars: 5,
  },
  {
    quote: "La météo en temps réel sur chaque spot, c'est un game changer absolu. Avant je me prenais des mauvaises surprises une fois sur trois. Depuis FleuVibe, plus jamais.",
    name: "Marie T.",
    role: "Pagayeuse · Niveau intermédiaire",
    avatar: "👩‍🦱",
    stars: 5,
  },
  {
    quote: "Je suis guide kayak et je recommande FleuVibe à tous mes clients pour préparer leurs sorties. Les spots vérifiés et les niveaux de difficulté sont honnêtes — c'est rare.",
    name: "Thomas R.",
    role: "Guide professionnel · Ardèche",
    avatar: "🧑‍🏫",
    stars: 5,
  },
];

function Stars({ n }) {
  return (
    <div aria-label={`${n} étoiles sur 5`} style={{ display: "flex", gap: "2px" }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} aria-hidden="true" style={{ color: "#f59e0b", fontSize: "0.85rem" }}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      style={{ padding: "88px 24px", background: "#f7faf9" }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
            Témoignages
          </p>
          <h2 id="testimonials-heading" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 900, color: "#1a2e28", letterSpacing: "-0.8px", lineHeight: 1.15, fontFamily: "'Fraunces', Georgia, serif" }}>
            Ils ont trouvé leur spot.
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: "20px", marginBottom: "52px" }}>
          {TESTIMONIALS.map(({ quote, name, role, avatar, stars }) => (
            <figure
              key={name}
              style={{ background: "#fff", border: "1px solid #e8f0ed", borderRadius: "20px", padding: "28px 24px", margin: 0, display: "flex", flexDirection: "column", gap: "18px" }}
            >
              <Stars n={stars} />
              <blockquote style={{ margin: 0, fontSize: "0.9rem", color: "#3a5a50", lineHeight: 1.7, fontStyle: "italic" }}>
                "{quote}"
              </blockquote>
              <figcaption style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,rgba(26,158,110,0.15),rgba(8,145,178,0.1))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>
                  {avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a2e28" }}>{name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#8aa89e" }}>{role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Aggregate trust signal */}
        <div style={{ textAlign: "center", padding: "24px", background: "#fff", border: "1px solid #e8f0ed", borderRadius: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginBottom: "8px" }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: "#f59e0b", fontSize: "1.1rem" }}>★</span>)}
          </div>
          <p style={{ fontSize: "0.88rem", color: "#3a5a50", fontWeight: 600 }}>
            <strong style={{ color: "#1a9e6e" }}>4.9/5</strong> — Note moyenne · Basée sur 340+ avis communauté
          </p>
        </div>
      </div>
    </section>
  );
}
