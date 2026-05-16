const STEPS = [
  {
    num: "01",
    icon: "💬",
    title: "Décris ta sortie",
    desc: "Dis-nous où tu es, ton niveau et ce que tu veux faire. En langage naturel — pas de formulaire interminable.",
    example: '"Rafting débutant ce weekend en Bretagne"',
  },
  {
    num: "02",
    icon: "🎯",
    title: "On trouve le bon spot",
    desc: "L'IA croise météo du jour, profil, disponibilité et accès pour te proposer exactement ce qui correspond.",
    example: "Vent 12 km/h · Débit idéal · 45 min de toi",
  },
  {
    num: "03",
    icon: "🛶",
    title: "Tu pars à l'eau",
    desc: "Conditions vérifiées, spot présenté en détail. Réserve un prestataire ou pars en autonomie — tu choisis.",
    example: "Accès libre · Parking · Niveau 2/5",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="hiw-heading"
      style={{ padding: "88px 24px", background: "#f7faf9" }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
            La solution
          </p>
          <h2 id="hiw-heading" style={{ fontSize: "clamp(1.7rem,4vw,2.6rem)", fontWeight: 900, color: "#1a2e28", letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: "14px", fontFamily: "'Fraunces', Georgia, serif" }}>
            De l'idée au spot en 3 étapes.
          </h2>
          <p style={{ color: "#6a8a80", fontSize: "1rem", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
            FleuVibe combine météo en temps réel, IA de recommandation
            et base de spots vérifiés — dans une seule interface.
          </p>
        </div>

        {/* Steps */}
        <ol
          aria-label="Comment fonctionne FleuVibe"
          style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "32px" }}
        >
          {STEPS.map((step, i) => (
            <li key={step.num} style={{ position: "relative" }}>

              {/* Connector (desktop only via CSS) */}
              {i < STEPS.length - 1 && (
                <div aria-hidden="true" style={{ display: "none" }} />
              )}

              <div style={{ background: "#fff", border: "1px solid #e8f0ed", borderRadius: "24px", padding: "32px 26px", height: "100%", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>

                {/* Step number + icon */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(26,158,110,0.12),rgba(8,145,178,0.1))", border: "2px solid rgba(26,158,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, position: "relative" }}>
                    {step.icon}
                    <span aria-hidden="true" style={{ position: "absolute", top: -6, right: -6, width: "20px", height: "20px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.58rem", fontWeight: 900, color: "#fff" }}>
                      {step.num.slice(1)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1a2e28", lineHeight: 1.2 }}>{step.title}</h3>
                </div>

                <p style={{ fontSize: "0.87rem", color: "#6a8a80", lineHeight: 1.65 }}>{step.desc}</p>

                {/* Example bubble */}
                <div style={{ marginTop: "auto", padding: "10px 14px", background: "rgba(26,158,110,0.06)", border: "1px solid rgba(26,158,110,0.15)", borderRadius: "12px", fontSize: "0.78rem", color: "#1a9e6e", fontStyle: "italic", fontWeight: 500 }}>
                  {step.example}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
