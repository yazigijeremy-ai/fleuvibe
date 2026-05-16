const STEPS = [
  {
    num: "01",
    title: "Décris ta sortie",
    desc: "Dis où tu es, ton niveau et ta dispo. En 10 secondes.",
    icon: "💬",
  },
  {
    num: "02",
    title: "On trouve le spot",
    desc: "Conditions météo du jour + recommandations adaptées à ton profil.",
    icon: "🎯",
  },
  {
    num: "03",
    title: "Tu pars à l'eau",
    desc: "Solo ou avec le groupe — le spot t'attend, conditions vérifiées.",
    icon: "🛶",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="hiw-heading"
      style={{ padding: "72px 24px", background: "#f7faf9", textAlign: "center" }}
    >
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
        Simple comme un coup de pagaie
      </p>
      <h2 id="hiw-heading" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#1a2e28", marginBottom: "8px", letterSpacing: "-0.5px" }}>
        Comment ça marche ?
      </h2>
      <p style={{ color: "#6a8a80", fontSize: "0.95rem", maxWidth: "420px", margin: "0 auto 52px", lineHeight: 1.6 }}>
        De l'idée à la mise à l'eau en quelques minutes.
      </p>

      <ol
        aria-label="Étapes pour trouver un spot"
        style={{ listStyle: "none", padding: 0, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "32px", maxWidth: "860px" }}
      >
        {STEPS.map((step, i) => (
          <li
            key={step.num}
            style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}
          >
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div aria-hidden="true" style={{ display: "none", position: "absolute", top: "28px", left: "calc(50% + 44px)", width: "calc(100% - 44px)", height: "2px", background: "linear-gradient(90deg,#1a9e6e33,transparent)", borderRadius: "2px" }} />
            )}

            {/* Icon circle */}
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,rgba(26,158,110,0.12),rgba(8,145,178,0.1))", border: "2px solid rgba(26,158,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", position: "relative" }}>
              {step.icon}
              <span aria-hidden="true" style={{ position: "absolute", top: -8, right: -8, width: "22px", height: "22px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 900, color: "#fff" }}>
                {step.num.slice(1)}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1a2e28", marginBottom: "6px" }}>{step.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "#6a8a80", lineHeight: 1.55, maxWidth: "220px", margin: "0 auto" }}>{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
