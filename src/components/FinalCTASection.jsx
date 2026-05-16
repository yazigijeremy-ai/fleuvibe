export default function FinalCTASection({ setShowAuth }) {
  return (
    <section
      aria-labelledby="final-cta-heading"
      style={{ padding: "88px 24px", background: "linear-gradient(135deg,#0d1f1a 0%,#0a1a28 100%)", position: "relative", overflow: "hidden" }}
    >
      {/* Decorative blobs */}
      <div aria-hidden="true" style={{ position: "absolute", top: "-80px", right: "-80px", width: "320px", height: "320px", background: "radial-gradient(circle,rgba(26,158,110,0.18),transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", background: "radial-gradient(circle,rgba(8,145,178,0.15),transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />

      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>

        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "40px", marginBottom: "28px", fontSize: "0.75rem", color: "#4ade80", fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px #4ade80" }} aria-hidden="true" />
          Saison 2026 ouverte
        </div>

        {/* Headline */}
        <h2 id="final-cta-heading" style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: "18px", fontFamily: "'Fraunces', Georgia, serif" }}>
          Prêt à trouver ton prochain spot ?
        </h2>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.65, marginBottom: "36px", maxWidth: "460px", margin: "0 auto 36px" }}>
          Rejoins 1 200+ pagayeurs qui planifient leurs sorties avec les vraies conditions du jour. Gratuit, en 30 secondes.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
          <button
            onClick={() => setShowAuth(true)}
            aria-label="Créer un compte gratuit"
            style={{ padding: "16px 44px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "40px", color: "#fff", fontWeight: 800, fontSize: "1rem", boxShadow: "0 16px 48px rgba(26,158,110,0.5)", letterSpacing: "-0.3px" }}
          >
            Commencer gratuitement →
          </button>
        </div>

        <p style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.3)" }}>
          Sans carte bancaire · Annulable à tout moment · 100% des fonctions de base offertes
        </p>
      </div>
    </section>
  );
}
