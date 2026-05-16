const MONTHLY_URL = import.meta.env.VITE_STRIPE_MONTHLY_URL || "#";
const ANNUAL_URL  = import.meta.env.VITE_STRIPE_ANNUAL_URL  || "#";

const FREE_FEATURES = [
  "🗺️  Carte des 40 spots",
  "🔍  Recherche par type et niveau",
  "🌤️  Météo sur chaque spot",
  "❤️  5 spots en favoris",
];

const PREMIUM_FEATURES = [
  "🤖  Recherche intelligente illimitée",
  "💎  Pépites cachées + spots secrets",
  "👥  Groupes d'expédition privés",
  "🏆  XP, badges et défis communauté",
];

function PlanCard({ tag, name, price, period, subline, features, cta, ctaSecondary, accent, href, onCta, badge }) {
  return (
    <div
      style={{
        flex: "1 1 280px",
        maxWidth: "380px",
        background: accent ? "linear-gradient(145deg,#0d1f1a,#0a1a28)" : "#fff",
        border: accent ? "2px solid rgba(26,158,110,0.6)" : "2px solid #e8f0ed",
        borderRadius: "24px",
        padding: "32px 28px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        boxShadow: accent ? "0 24px 64px rgba(26,158,110,0.18)" : "0 4px 20px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {badge && (
        <div aria-label={badge} style={{ position: "absolute", top: "18px", right: "18px", padding: "4px 12px", background: "linear-gradient(135deg,#f59e0b,#ef4444)", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 800, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
          {badge}
        </div>
      )}

      {/* Decorative blur for premium */}
      {accent && <div aria-hidden="true" style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", background: "radial-gradient(circle,rgba(26,158,110,0.15),transparent 70%)", pointerEvents: "none" }} />}

      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: accent ? "#4ade80" : "#1a9e6e", marginBottom: "8px" }}>{tag}</p>
        <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: accent ? "#fff" : "#1a2e28", marginBottom: "6px" }}>{name}</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontSize: "2.8rem", fontWeight: 900, color: accent ? "#fff" : "#1a2e28", letterSpacing: "-1px" }}>{price}</span>
          {period && <span style={{ fontSize: "0.85rem", color: accent ? "rgba(255,255,255,0.5)" : "#9ab0a8" }}>{period}</span>}
        </div>
        {subline && <p style={{ fontSize: "0.78rem", color: accent ? "rgba(255,255,255,0.45)" : "#9ab0a8", marginTop: "4px" }}>{subline}</p>}
      </div>

      <ul aria-label={`Fonctionnalités du plan ${name}`} style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
        {features.map(f => (
          <li key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: accent ? "rgba(255,255,255,0.82)" : "#3a5a50" }}>
            {f}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={cta}
            style={{ display: "block", textAlign: "center", padding: "14px 24px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", borderRadius: "14px", color: "#fff", fontWeight: 700, fontSize: "0.92rem", textDecoration: "none", cursor: "pointer" }}
          >
            {cta}
          </a>
        ) : (
          <button
            onClick={onCta}
            aria-label={cta}
            style={{ padding: "14px 24px", background: "#f0f6f4", border: "none", borderRadius: "14px", color: "#1a9e6e", fontWeight: 700, fontSize: "0.92rem", cursor: "pointer" }}
          >
            {cta}
          </button>
        )}
        {ctaSecondary && (
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: accent ? "rgba(255,255,255,0.38)" : "#9ab0a8" }}>{ctaSecondary}</p>
        )}
      </div>
    </div>
  );
}

export default function PricingSection({ setShowAuth, setShowPremium }) {
  return (
    <section
      aria-labelledby="pricing-heading"
      style={{ padding: "72px 24px", background: "#fff", textAlign: "center" }}
    >
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a9e6e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
        Tarifs transparents
      </p>
      <h2 id="pricing-heading" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#1a2e28", marginBottom: "8px", letterSpacing: "-0.5px" }}>
        Commence gratis. Passe au niveau suivant.
      </h2>
      <p style={{ color: "#6a8a80", fontSize: "0.95rem", maxWidth: "440px", margin: "0 auto 52px", lineHeight: 1.6 }}>
        Le plan gratuit couvre déjà 90% des besoins. Le Premium t'emmène là où les autres ne vont pas.
      </p>

      <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", maxWidth: "860px", margin: "0 auto 24px" }}>
        <PlanCard
          tag="Pour explorer"
          name="Explorateur"
          price="Gratuit"
          subline="Pour toujours"
          features={FREE_FEATURES}
          cta="Créer mon compte"
          ctaSecondary="Sans carte bancaire · En 30 secondes"
          onCta={() => setShowAuth(true)}
        />
        <PlanCard
          tag="Pour progresser"
          name="Navigateur"
          price="4,99€"
          period="/mois"
          subline="ou 39,99€/an — 2 mois offerts"
          features={PREMIUM_FEATURES}
          cta="Passer Premium →"
          ctaSecondary="Annulable à tout moment · Aucun engagement"
          accent
          href={MONTHLY_URL}
          badge="Le plus populaire"
        />
      </div>

      {/* Urgency / social proof */}
      <p style={{ fontSize: "0.8rem", color: "#9ab0a8", maxWidth: "380px", margin: "0 auto" }}>
        🔥 <strong style={{ color: "#ef4444" }}>+320 abonnés</strong> ce mois-ci · Offre de lancement encore disponible
      </p>
    </section>
  );
}
