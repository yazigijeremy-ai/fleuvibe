export default function HeroSection({ spots, search, setSearch, handleAISearch, aiSearchLoading, setShowAuth, handlePageChange }) {
  return (
    <section
      aria-label="Présentation FleuVibe"
      style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {/* Background */}
      <img
        src="/images/hero-kayaking.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,15,30,0.45) 0%, rgba(3,10,20,0.78) 100%)" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "48px 24px", maxWidth: "860px", width: "100%" }}>

        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "40px", marginBottom: "28px", fontSize: "0.78rem", color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", display: "inline-block", animation: "pulse 2s infinite" }} />
          Saison 2026 — {spots.length}+ spots vérifiés
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(2.4rem,6.5vw,4.8rem)", fontWeight: 900, color: "#fff", lineHeight: 1.08, marginBottom: "20px", letterSpacing: "-1.5px" }}>
          Le bon spot,{" "}
          <span style={{ background: "linear-gradient(90deg,#4ade80 0%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            au bon moment.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(0.95rem,2.5vw,1.15rem)", lineHeight: 1.65, maxWidth: "540px", margin: "0 auto 20px" }}>
          FleuVibe analyse la météo du jour et te propose les meilleurs spots kayak,
          paddle et rafting à ta portée — avec les conditions réelles, pas les moyennes.
        </p>

        {/* Value bullets */}
        <ul
          aria-label="Avantages clés"
          style={{ listStyle: "none", padding: 0, margin: "0 auto 36px", display: "flex", flexDirection: "column", gap: "10px", maxWidth: "440px", textAlign: "left" }}
        >
          {[
            ["🌤️", "Conditions en temps réel", "— pas de mauvaises surprises à l'arrivée"],
            ["🗺️", "40 spots vérifiés", "— rivières, lacs et côtes à travers l'Europe"],
            ["👥", "Une communauté de pagayeurs", "— expéditions, avis, spots secrets"],
          ].map(([icon, strong, rest]) => (
            <li key={strong} style={{ display: "flex", alignItems: "baseline", gap: "10px", fontSize: "0.9rem", color: "rgba(255,255,255,0.82)" }}>
              <span aria-hidden="true" style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
              <span><strong style={{ color: "#fff", fontWeight: 700 }}>{strong}</strong>{rest}</span>
            </li>
          ))}
        </ul>

        {/* Search bar */}
        <div
          role="search"
          style={{ background: "rgba(255,255,255,0.97)", borderRadius: "18px", padding: "8px", boxShadow: "0 30px 60px rgba(0,0,0,0.35)", display: "flex", gap: "6px", maxWidth: "640px", margin: "0 auto 20px" }}
        >
          <label htmlFor="hero-search" style={{ display: "flex", flex: 1, alignItems: "center", gap: "10px", padding: "10px 16px" }}>
            <span aria-hidden="true" style={{ fontSize: "1.1rem" }}>📍</span>
            <input
              id="hero-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAISearch()}
              placeholder="Destination, rivière, activité..."
              aria-label="Rechercher un spot nautique"
              style={{ border: "none", background: "transparent", width: "100%", fontSize: "0.95rem", color: "#1a2e28", outline: "none" }}
            />
          </label>
          <button
            onClick={handleAISearch}
            disabled={aiSearchLoading}
            aria-label="Lancer la recherche"
            style={{ padding: "13px 28px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "12px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", opacity: aiSearchLoading ? 0.7 : 1 }}
          >
            {aiSearchLoading ? "⏳" : "🔍 Trouver mon spot"}
          </button>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAuth(true)}
            aria-label="Créer un compte gratuit"
            style={{ padding: "13px 32px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "40px", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
          >
            Commencer gratuitement
          </button>
          <button
            onClick={() => handlePageChange("map")}
            aria-label="Voir la carte des spots"
            style={{ padding: "13px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "40px", color: "rgba(255,255,255,0.78)", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer" }}
          >
            🗺️ Voir les {spots.length} spots
          </button>
        </div>

        {/* Social proof */}
        <p style={{ marginTop: "22px", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", letterSpacing: "0.3px" }}>
          Déjà <strong style={{ color: "rgba(255,255,255,0.7)" }}>1 200+ pagayeurs</strong> ont planifié leur prochaine sortie ici · Sans carte bancaire
        </p>
      </div>
    </section>
  );
}
