export default function HeroSection({ spots, search, setSearch, handleAISearch, aiSearchLoading, setShowAuth, handlePageChange }) {
  return (
    <section
      aria-label="Présentation FleuVibe"
      style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {/* Background image with slow-zoom animation */}
      <img
        src="/images/hero-kayaking.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "slowZoom 20s ease-in-out infinite" }}
      />
      {/* Multi-stop gradient for readability at all scroll positions */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,12,24,0.55) 0%, rgba(4,12,24,0.35) 40%, rgba(4,12,24,0.75) 100%)" }} />

      {/* Subtle animated grain overlay */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "160px" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "56px 24px 48px", maxWidth: "900px", width: "100%" }}>

        {/* Eyebrow pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "7px 20px", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "40px", marginBottom: "32px", fontSize: "0.75rem", color: "rgba(255,255,255,0.9)", fontWeight: 600, letterSpacing: "0.2px" }}>
          <span style={{ width: 7, height: 7, background: "#4ade80", borderRadius: "50%", flexShrink: 0, boxShadow: "0 0 8px #4ade80" }} aria-hidden="true" />
          Saison 2026 — {spots.length}+ spots vérifiés dans le monde
        </div>

        {/* H1 */}
        <h1 style={{ fontSize: "clamp(2.6rem,7vw,5.2rem)", fontWeight: 900, color: "#fff", lineHeight: 1.05, marginBottom: "22px", letterSpacing: "-2px", fontFamily: "'Fraunces', Georgia, serif" }}>
          Le bon spot.{" "}
          <br />
          <span style={{ background: "linear-gradient(90deg,#4ade80 0%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Les bonnes conditions.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto 36px" }}>
          Dis-nous où tu es et ce que tu veux faire.
          On trouve le spot parfait avec la météo du jour — en 10 secondes.
        </p>

        {/* Search bar */}
        <div
          role="search"
          style={{ background: "rgba(255,255,255,0.97)", borderRadius: "20px", padding: "8px", boxShadow: "0 32px 80px rgba(0,0,0,0.4)", display: "flex", gap: "6px", maxWidth: "660px", margin: "0 auto 24px" }}
        >
          <label htmlFor="hero-search" style={{ display: "flex", flex: 1, alignItems: "center", gap: "12px", padding: "10px 18px" }}>
            <span aria-hidden="true" style={{ fontSize: "1.1rem", flexShrink: 0 }}>📍</span>
            <input
              id="hero-search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAISearch()}
              placeholder='Essaie : "rafting débutant Ardèche" ou "paddle lac calme"'
              aria-label="Rechercher un spot nautique par activité, lieu ou niveau"
              style={{ border: "none", background: "transparent", width: "100%", fontSize: "0.92rem", color: "#1a2e28", outline: "none" }}
            />
          </label>
          <button
            onClick={handleAISearch}
            disabled={aiSearchLoading}
            aria-label="Lancer la recherche intelligente"
            style={{ padding: "13px 28px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "14px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", whiteSpace: "nowrap", flexShrink: 0, opacity: aiSearchLoading ? 0.7 : 1, transition: "transform 0.15s,opacity 0.15s" }}
          >
            {aiSearchLoading ? "⏳ Recherche…" : "🔍 Trouver mon spot"}
          </button>
        </div>

        {/* Suggestion pills */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          {["🛶 Kayak rivière", "🏄 Paddle lac", "🌊 Rafting sportif", "⛵ Voile côtière"].map(pill => (
            <button
              key={pill}
              onClick={() => { setSearch(pill.split(' ').slice(1).join(' ')); handleAISearch(); }}
              style={{ padding: "7px 16px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "40px", color: "rgba(255,255,255,0.85)", fontSize: "0.78rem", fontWeight: 500 }}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
          <button
            onClick={() => setShowAuth(true)}
            aria-label="Créer un compte gratuit"
            style={{ padding: "14px 36px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "40px", color: "#fff", fontWeight: 700, fontSize: "0.92rem", boxShadow: "0 12px 32px rgba(26,158,110,0.45)" }}
          >
            Commencer gratuitement →
          </button>
          <button
            onClick={() => handlePageChange("map")}
            aria-label="Voir la carte des spots"
            style={{ padding: "14px 28px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: "40px", color: "#fff", fontWeight: 600, fontSize: "0.92rem" }}
          >
            🗺️ Voir les {spots.length} spots
          </button>
        </div>

        {/* Micro social proof */}
        <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.42)", letterSpacing: "0.3px" }}>
          <strong style={{ color: "rgba(255,255,255,0.65)" }}>2 000+ pagayeurs</strong> ont planifié leur sortie ici · Gratuit, sans carte bancaire
        </p>
      </div>

      {/* Scroll hint */}
      <div aria-hidden="true" style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", opacity: 0.4 }}>
        <span style={{ fontSize: "0.62rem", color: "#fff", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>Défiler</span>
        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom,rgba(255,255,255,0.6),transparent)" }} />
      </div>
    </section>
  );
}
