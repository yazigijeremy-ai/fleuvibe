const PAINS = [
  {
    icon: "🔍",
    title: "Tu cherches, tu cherches, tu cherches.",
    desc: "Google te renvoie des blogs vieux de 5 ans. Les forums parlent de spots que tu connais déjà. Tu passes 1h à planifier pour 2h sur l'eau.",
  },
  {
    icon: "😬",
    title: "Tu arrives au spot. C'est décevant.",
    desc: "Le vent a tourné. Le débit est trop fort. L'accès est fermé. Personne ne t'avait prévenu — parce que personne ne vérifiait en temps réel.",
  },
  {
    icon: "❓",
    title: "Tu ne sais pas si le spot est pour toi.",
    desc: "Niveau requis, équipement, dangers, saison idéale : l'info existe, mais elle est éparpillée partout. Tu y vas, tu espères.",
  },
];

export default function ProblemSection() {
  return (
    <section
      aria-labelledby="problem-heading"
      style={{ padding: "80px 24px", background: "#fff" }}
    >
      <div style={{ maxWidth: "940px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ef4444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
            Le problème
          </p>
          <h2 id="problem-heading" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 900, color: "#1a2e28", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "14px", fontFamily: "'Fraunces', Georgia, serif" }}>
            Planifier une sortie nautique,
            <br />c'est encore trop compliqué.
          </h2>
          <p style={{ color: "#6a8a80", fontSize: "1rem", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
            Même les pagayeurs expérimentés perdent du temps à agrégrer météo, niveau, accès et retours terrain.
          </p>
        </div>

        {/* Pain cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "24px" }}>
          {PAINS.map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "20px", padding: "28px 24px" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "14px" }}>{icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1a2e28", marginBottom: "8px", lineHeight: 1.3 }}>{title}</h3>
              <p style={{ fontSize: "0.87rem", color: "#6a8a80", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
