import { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";
const SUPABASE_KEY = "sb_publishable_L4n6vcDAs6Q2ujgsZqCKTw_mNRBX0pA";

const supabase = (() => {
  const headers = { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };
  const authHeaders = (token) => ({ ...headers, "Authorization": `Bearer ${token}` });

  return {
    auth: {
      signUp: async (email, password, fullName) => {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers, body: JSON.stringify({ email, password, data: { full_name: fullName } }) });
        return r.json();
      },
      signIn: async (email, password) => {
        const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers, body: JSON.stringify({ email, password }) });
        return r.json();
      },
      signOut: async (token) => {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: authHeaders(token) });
      },
    },
    profiles: {
      get: async (userId, token) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers: authHeaders(token) });
        const data = await r.json();
        return data[0] || null;
      },
      upsert: async (profile, token) => {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, { method: "POST", headers: { ...authHeaders(token), "Prefer": "resolution=merge-duplicates" }, body: JSON.stringify(profile) });
      },
      updateFavorites: async (userId, favorites, token) => {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ favorites: JSON.stringify(favorites) }) });
      },
    },
  };
})();

// ─── DATA ────────────────────────────────────────────────────────────────────
const CONTINENTS = {
  ALL:{name:"Monde entier",flag:"🌍"},EU:{name:"Europe",flag:"🇪🇺"},AM:{name:"Amériques",flag:"🌎"},
  AS:{name:"Asie",flag:"🌏"},AF:{name:"Afrique",flag:"🌍"},OC:{name:"Océanie",flag:"🌊"},
};
const COUNTRIES = {
  BE:{name:"Belgique",flag:"🇧🇪",continent:"EU"},FR:{name:"France",flag:"🇫🇷",continent:"EU"},
  DE:{name:"Allemagne",flag:"🇩🇪",continent:"EU"},CH:{name:"Suisse",flag:"🇨🇭",continent:"EU"},
  NO:{name:"Norvège",flag:"🇳🇴",continent:"EU"},SI:{name:"Slovénie",flag:"🇸🇮",continent:"EU"},
  HR:{name:"Croatie",flag:"🇭🇷",continent:"EU"},NL:{name:"Pays-Bas",flag:"🇳🇱",continent:"EU"},
  US:{name:"États-Unis",flag:"🇺🇸",continent:"AM"},CA:{name:"Canada",flag:"🇨🇦",continent:"AM"},
  BR:{name:"Brésil",flag:"🇧🇷",continent:"AM"},PE:{name:"Pérou",flag:"🇵🇪",continent:"AM"},
  CL:{name:"Chili",flag:"🇨🇱",continent:"AM"},NZ:{name:"Nouvelle-Zélande",flag:"🇳🇿",continent:"OC"},
  AU:{name:"Australie",flag:"🇦🇺",continent:"OC"},NP:{name:"Népal",flag:"🇳🇵",continent:"AS"},
  TH:{name:"Thaïlande",flag:"🇹🇭",continent:"AS"},VN:{name:"Vietnam",flag:"🇻🇳",continent:"AS"},
  ZM:{name:"Zambie",flag:"🇿🇲",continent:"AF"},UG:{name:"Ouganda",flag:"🇺🇬",continent:"AF"},
};

const ROUTES = [
  {id:1,country:"BE",name:"Lesse · Houyet → Anseremme",river:"Lesse",region:"Wallonie",distance:"21 km",duration:"4–5h",difficulty:"Facile",activities:["Kayak","Canoë"],description:"Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses.",color:"#1a9e6e",emoji:"🏞️",open:true,coords:[50.185,5.002],path:[[50.196,4.972],[50.185,5.002],[50.171,5.031]]},
  {id:2,country:"BE",name:"Ourthe · La Roche → Hotton",river:"Ourthe",region:"Wallonie",distance:"18 km",duration:"3–4h",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Méandres spectaculaires avec quelques rapides dans les Ardennes.",color:"#2563eb",emoji:"🌊",open:true,coords:[50.218,5.578],path:[[50.183,5.571],[50.218,5.578],[50.241,5.540]]},
  {id:3,country:"BE",name:"Semois · Bouillon → Alle",river:"Semois",region:"Gaume",distance:"34 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Camping"],description:"Immersion totale dans la nature gaumaise avec nuit en camping.",color:"#7c3aed",emoji:"⛺",open:true,coords:[49.870,5.060],path:[[49.795,5.067],[49.870,5.060],[49.920,5.048]]},
  {id:4,country:"BE",name:"Meuse · Namur → Dinant",river:"Meuse",region:"Wallonie",distance:"30 km",duration:"1 journée",difficulty:"Facile",activities:["Canoë","Kayak"],description:"Longer la Meuse entre citadelles et villages pittoresques.",color:"#0891b2",emoji:"🏰",open:true,coords:[50.362,4.860],path:[[50.465,4.867],[50.362,4.860],[50.265,4.913]]},
  {id:5,country:"FR",name:"Ardèche · Vallon-Pont-d'Arc",river:"Ardèche",region:"Ardèche",distance:"30 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Canoë","Camping"],description:"Le parcours mythique de France sous le Pont d'Arc.",color:"#dc2626",emoji:"🌉",open:true,coords:[44.400,4.390],path:[[44.408,4.398],[44.400,4.390],[44.375,4.360]]},
  {id:6,country:"FR",name:"Verdon · Gorges",river:"Verdon",region:"Alpes-de-Haute-Provence",distance:"22 km",duration:"2 jours",difficulty:"Sportif",activities:["Kayak","Rafting"],description:"Le Grand Canyon européen. Eaux turquoise et falaises à pic de 700m.",color:"#06b6d4",emoji:"💎",open:true,coords:[43.760,6.340],path:[[43.848,6.516],[43.760,6.340],[43.730,6.220]]},
  {id:7,country:"SI",name:"Soča · Bovec → Tolmin",river:"Soča",region:"Primorska",distance:"55 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Rafting","SUP"],description:"La Soča aux eaux émeraude — l'une des plus belles rivières du monde.",color:"#10b981",emoji:"💚",open:true,coords:[46.240,13.650],path:[[46.336,13.553],[46.240,13.650],[46.188,13.733]]},
  {id:8,country:"US",name:"Colorado · Grand Canyon",river:"Colorado",region:"Arizona",distance:"360 km",duration:"2 semaines",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"L'expédition ultime dans le Grand Canyon.",color:"#f97316",emoji:"🏜️",open:true,coords:[36.100,-112.100],path:[[36.868,-111.590],[36.100,-112.100],[35.780,-114.048]]},
  {id:9,country:"NP",name:"Trisuli · Himalaya",river:"Trisuli",region:"Gandaki",distance:"50 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans l'Himalaya depuis Katmandou.",color:"#dc2626",emoji:"🏔️",open:true,coords:[27.800,84.400],path:[[27.950,84.450],[27.800,84.400],[27.500,84.300]]},
  {id:10,country:"NZ",name:"Whanganui · Great Journey",river:"Whanganui",region:"Manawatū",distance:"145 km",duration:"5 jours",difficulty:"Facile",activities:["Canoë","Kayak","Camping"],description:"L'une des Great Walks de Nouvelle-Zélande sur l'eau.",color:"#16a34a",emoji:"🥝",open:true,coords:[-39.600,174.800],path:[[-38.900,175.100],[-39.600,174.800],[-39.960,175.049]]},
];

const DIFF_COLOR={Facile:"#1a9e6e",Intermédiaire:"#f59e0b",Sportif:"#dc2626"};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function FleuVibe() {
  const [session, setSession] = useState(null); // { user, token }
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [authPage, setAuthPage] = useState("login"); // login | signup
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [page, setPage] = useState("explore");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [continent, setContinent] = useState("ALL");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [loaded, setLoaded] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  // Load session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fleuvibe_session");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setSession(s);
        loadProfile(s.user.id, s.token);
      } catch {}
    }
  }, []);

  const loadProfile = async (userId, token) => {
    const p = await supabase.profiles.get(userId, token);
    if (p) {
      setProfile(p);
      try { setFavorites(JSON.parse(p.favorites || "[]")); } catch { setFavorites([]); }
    }
  };

  const handleSignUp = async () => {
    setAuthLoading(true); setAuthError("");
    const data = await supabase.auth.signUp(authForm.email, authForm.password, authForm.fullName);
    if (data.error) { setAuthError(data.error.message); setAuthLoading(false); return; }
    if (data.access_token) {
      const s = { user: data.user, token: data.access_token };
      setSession(s); localStorage.setItem("fleuvibe_session", JSON.stringify(s));
      await supabase.profiles.upsert({ id: data.user.id, full_name: authForm.fullName, username: authForm.email.split("@")[0], favorites: "[]" }, data.access_token);
      await loadProfile(data.user.id, data.access_token);
      setShowAuth(false); setAuthForm({ email: "", password: "", fullName: "" });
    } else {
      setAuthError("Vérifie ton email pour confirmer ton compte !");
    }
    setAuthLoading(false);
  };

  const handleSignIn = async () => {
    setAuthLoading(true); setAuthError("");
    const data = await supabase.auth.signIn(authForm.email, authForm.password);
    if (data.error) { setAuthError(data.error.message); setAuthLoading(false); return; }
    const s = { user: data.user, token: data.access_token };
    setSession(s); localStorage.setItem("fleuvibe_session", JSON.stringify(s));
    await loadProfile(data.user.id, data.access_token);
    setShowAuth(false); setAuthForm({ email: "", password: "", fullName: "" });
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    if (session) await supabase.auth.signOut(session.token);
    setSession(null); setProfile(null); setFavorites([]);
    localStorage.removeItem("fleuvibe_session");
    setShowProfile(false);
  };

  const toggleFavorite = async (routeId) => {
    if (!session) { setShowAuth(true); return; }
    const newFavs = favorites.includes(routeId) ? favorites.filter(f => f !== routeId) : [...favorites, routeId];
    setFavorites(newFavs);
    await supabase.profiles.updateFavorites(session.user.id, newFavs, session.token);
  };

  const filteredRoutes = ROUTES.filter(r => {
    if (page === "favorites") return favorites.includes(r.id);
    if (continent !== "ALL" && COUNTRIES[r.country]?.continent !== continent) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !r.river.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Map
  useEffect(() => {
    if (page !== "explore" || view !== "map") return;
    if (mapInstanceRef.current) { updateMap(); return; }
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"; document.head.appendChild(link);
    const script = document.createElement("script"); script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"; script.onload = initMap; document.head.appendChild(script);
  }, [page, view]);
  useEffect(() => { if (mapInstanceRef.current) updateMap(); }, [filteredRoutes, selectedRoute]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([20, 10], 2);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap © CARTO", subdomains: "abcd" }).addTo(map);
    mapInstanceRef.current = map; updateMap();
  };
  const updateMap = () => {
    const L = window.L; if (!L || !mapInstanceRef.current) return;
    layersRef.current.forEach(l => l.remove()); layersRef.current = [];
    filteredRoutes.forEach(route => {
      const isSel = selectedRoute?.id === route.id;
      if (route.path?.length > 1) { const poly = L.polyline(route.path, { color: route.color, weight: isSel ? 5 : 2.5, opacity: isSel ? 1 : 0.65 }).addTo(mapInstanceRef.current); layersRef.current.push(poly); }
      const icon = L.divIcon({ html: `<div style="background:${route.color};width:${isSel?36:26}px;height:${isSel?36:26}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"><span style="transform:rotate(45deg);font-size:${isSel?14:10}px;display:block;text-align:center;line-height:${isSel?32:22}px;">${route.emoji}</span></div>`, iconSize: [isSel?36:26, isSel?36:26], iconAnchor: [isSel?18:13, isSel?36:26], className: "" });
      const marker = L.marker(route.coords, { icon }).addTo(mapInstanceRef.current);
      marker.on("click", () => setSelectedRoute(r => r?.id === route.id ? null : route));
      layersRef.current.push(marker);
    });
  };

  const s = {
    inp: { width: "100%", padding: "10px 13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(26,158,110,0.25)", borderRadius: "10px", color: "#e8f4f0", fontSize: "0.85rem" },
    label: { display: "block", color: "#6a9a8c", fontSize: "0.74rem", marginBottom: "5px", fontWeight: 500 },
  };

  const userName = profile?.full_name || profile?.username || session?.user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0a1628 0%,#0d2240 45%,#0a3d2e 100%)", fontFamily: "'Outfit',sans-serif", color: "#e8f4f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(26,158,110,0.4);border-radius:2px}
        .card{transition:transform 0.2s ease;cursor:pointer}.card:hover{transform:translateY(-3px)}
        .btn{transition:all 0.17s ease;cursor:pointer;border:none}.btn:hover{opacity:0.85}
        .fade-in{opacity:0;transform:translateY(12px);transition:opacity 0.4s ease,transform 0.4s ease}
        .fade-in.loaded{opacity:1;transform:translateY(0)}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes wave{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pop{0%{transform:scale(0.9);opacity:0}100%{transform:scale(1);opacity:1}}
        .wave-bg{animation:wave 20s linear infinite}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(7px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
        input::placeholder{color:#3a6a5a}
        input:focus{border-color:rgba(26,158,110,0.55)!important;outline:none}
        .heart{transition:all 0.2s ease}.heart:hover{transform:scale(1.2)}
        .nav-btn{transition:all 0.18s ease;cursor:pointer;border:none;background:none}
      `}</style>

      {/* Wave BG */}
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", height: "130px", overflow: "hidden", opacity: 0.07, pointerEvents: "none", zIndex: 0 }}>
        <div className="wave-bg" style={{ display: "flex", width: "200%" }}>
          {[0, 1].map(i => <svg key={i} viewBox="0 0 1440 130" style={{ width: "50%", minWidth: "720px" }} fill="#1a9e6e"><path d="M0,65 C240,110 480,20 720,65 C960,110 1200,20 1440,65 L1440,130 L0,130 Z" /></svg>)}
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "980px", margin: "0 auto", padding: "16px 14px" }}>

        {/* ── HEADER ── */}
        <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.6rem", animation: "float 3s ease-in-out infinite" }}>🌊</span>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(135deg,#a8edcf 0%,#1a9e6e 50%,#38bdf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FleuVibe</h1>
            <span style={{ background: "rgba(26,158,110,0.2)", border: "1px solid rgba(26,158,110,0.4)", borderRadius: "6px", padding: "2px 6px", fontSize: "0.6rem", color: "#7ecfb0", fontWeight: 700 }}>WORLD</span>
          </div>

          {/* Auth button */}
          {session ? (
            <button className="btn" onClick={() => setShowProfile(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "rgba(26,158,110,0.15)", border: "1px solid rgba(26,158,110,0.3)", borderRadius: "10px", color: "#a8edcf", fontSize: "0.82rem", fontWeight: 600 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                {userName[0].toUpperCase()}
              </div>
              {userName}
            </button>
          ) : (
            <button className="btn" onClick={() => setShowAuth(true)} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "0.82rem", boxShadow: "0 3px 12px rgba(26,158,110,0.25)" }}>
              🔐 Connexion
            </button>
          )}
        </div>

        {/* ── NAV ── */}
        <div className={`fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: "0.06s", display: "flex", gap: "5px", marginBottom: "18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "13px", padding: "4px", flexWrap: "wrap" }}>
          {[
            ["explore", "🗺️ Explorer"],
            ["favorites", `❤️ Favoris${favorites.length > 0 ? ` (${favorites.length})` : ""}`],
          ].map(([id, label]) => (
            <button key={id} className="btn" onClick={() => setPage(id)} style={{ flex: 1, minWidth: "100px", padding: "9px 12px", borderRadius: "9px", background: page === id ? "rgba(26,158,110,0.22)" : "transparent", border: page === id ? "1px solid rgba(26,158,110,0.4)" : "1px solid transparent", color: page === id ? "#a8edcf" : "#4a7a6a", fontSize: "0.82rem", fontWeight: page === id ? 700 : 500 }}>{label}</button>
          ))}
        </div>

        {/* ── EXPLORE / FAVORITES ── */}
        {(page === "explore" || page === "favorites") && (
          <div>
            {page === "explore" && (
              <>
                {/* Continent filter */}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "center", marginBottom: "12px" }}>
                  {Object.entries(CONTINENTS).map(([code, c]) => {
                    const count = code === "ALL" ? ROUTES.length : ROUTES.filter(r => COUNTRIES[r.country]?.continent === code).length;
                    return <button key={code} className="btn" onClick={() => setContinent(code)} style={{ padding: "6px 11px", borderRadius: "9px", background: continent === code ? "rgba(26,158,110,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${continent === code ? "#1a9e6e" : "rgba(255,255,255,0.07)"}`, color: continent === code ? "#a8edcf" : "#4a7a6a", fontSize: "0.75rem", fontWeight: 600 }}>{c.flag} {c.name} ({count})</button>;
                  })}
                </div>

                {/* Search + view */}
                <div style={{ display: "flex", gap: "7px", marginBottom: "14px" }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Rechercher..." style={{ ...s.inp, flex: 1 }} />
                  <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
                    {[["list", "📋"], ["map", "🗺️"]].map(([v, ic]) => <button key={v} className="btn" onClick={() => setView(v)} style={{ padding: "0 13px", background: view === v ? "rgba(26,158,110,0.25)" : "transparent", color: view === v ? "#a8edcf" : "#4a7a6a", fontSize: "0.95rem" }}>{ic}</button>)}
                  </div>
                </div>
              </>
            )}

            {page === "favorites" && !session && (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>❤️</div>
                <h3 style={{ color: "#a8edcf", marginBottom: "8px" }}>Connecte-toi pour voir tes favoris</h3>
                <p style={{ color: "#4a7a6a", fontSize: "0.84rem", marginBottom: "16px" }}>Sauvegarde tes parcours préférés et retrouve-les partout.</p>
                <button className="btn" onClick={() => setShowAuth(true)} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", borderRadius: "10px", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>🔐 Se connecter</button>
              </div>
            )}

            {page === "favorites" && session && favorites.length === 0 && (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏞️</div>
                <h3 style={{ color: "#a8edcf", marginBottom: "8px" }}>Aucun favori pour l'instant</h3>
                <p style={{ color: "#4a7a6a", fontSize: "0.84rem", marginBottom: "16px" }}>Clique sur le ❤️ sur un parcours pour le sauvegarder ici.</p>
                <button className="btn" onClick={() => setPage("explore")} style={{ padding: "9px 20px", background: "rgba(26,158,110,0.15)", border: "1px solid rgba(26,158,110,0.3)", borderRadius: "10px", color: "#a8edcf", fontWeight: 600, fontSize: "0.83rem" }}>🗺️ Explorer les parcours</button>
              </div>
            )}

            {/* MAP */}
            {page === "explore" && view === "map" && (
              <div>
                <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(26,158,110,0.15)" }}>
                  <div ref={mapRef} style={{ height: "460px", width: "100%" }} />
                </div>
                {selectedRoute && (
                  <div style={{ marginTop: "11px", padding: "14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${selectedRoute.color}40`, borderRadius: "13px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <div>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#daf0e8" }}>{selectedRoute.emoji} {selectedRoute.name} {COUNTRIES[selectedRoute.country]?.flag}</h3>
                        <p style={{ color: "#4a7a6a", fontSize: "0.75rem" }}>{selectedRoute.river} · {selectedRoute.region}</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button className="heart btn" onClick={() => toggleFavorite(selectedRoute.id)} style={{ fontSize: "1.3rem", background: "none", color: favorites.includes(selectedRoute.id) ? "#ef4444" : "#4a7a6a" }}>{favorites.includes(selectedRoute.id) ? "❤️" : "🤍"}</button>
                        <button onClick={() => setSelectedRoute(null)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#5a8a78", borderRadius: "7px", padding: "4px 8px", cursor: "pointer", fontSize: "0.74rem" }}>✕</button>
                      </div>
                    </div>
                    <p style={{ color: "#8ab8b0", fontSize: "0.82rem", lineHeight: 1.6 }}>{selectedRoute.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* LIST */}
            {(page === "favorites" ? (session && favorites.length > 0) : view === "list") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredRoutes.map((route, i) => {
                  const isSel = selectedRoute?.id === route.id;
                  const isFav = favorites.includes(route.id);
                  return (
                    <div key={route.id} className={`card fade-in ${loaded ? "loaded" : ""}`} style={{ transitionDelay: `${0.1 + i * 0.03}s` }} onClick={() => setSelectedRoute(r => r?.id === route.id ? null : route)}>
                      <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${isSel ? route.color + "55" : "rgba(255,255,255,0.06)"}`, borderRadius: "13px", overflow: "hidden" }}>
                        <div style={{ height: "2.5px", background: `linear-gradient(90deg,${route.color},transparent)` }} />
                        <div style={{ padding: "12px 13px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "1.1rem" }}>{route.emoji}</span>
                                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#daf0e8" }}>{route.name}</h3>
                                <span style={{ fontSize: "0.82rem" }}>{COUNTRIES[route.country]?.flag}</span>
                              </div>
                              <div style={{ color: "#3a5a50", fontSize: "0.73rem" }}>📍 {route.river} · {COUNTRIES[route.country]?.name}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button className="heart btn" onClick={e => { e.stopPropagation(); toggleFavorite(route.id); }} style={{ fontSize: "1.2rem", background: "none", color: isFav ? "#ef4444" : "#3a5a50" }}>{isFav ? "❤️" : "🤍"}</button>
                              <span style={{ padding: "2px 7px", borderRadius: "20px", fontSize: "0.67rem", fontWeight: 600, background: `${DIFF_COLOR[route.difficulty]}16`, color: DIFF_COLOR[route.difficulty], border: `1px solid ${DIFF_COLOR[route.difficulty]}28` }}>{route.difficulty}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "12px", marginBottom: "7px" }}>
                            {[["📏", route.distance], ["⏱️", route.duration]].map(([ic, v]) => <span key={v} style={{ color: "#3a5a50", fontSize: "0.73rem" }}>{ic} {v}</span>)}
                          </div>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {route.activities.map(a => <span key={a} style={{ padding: "2px 6px", background: `${route.color}12`, border: `1px solid ${route.color}24`, borderRadius: "8px", fontSize: "0.67rem", color: "#8ae8cc", fontWeight: 500 }}>{a}</span>)}
                          </div>
                          {isSel && (
                            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                              <p style={{ color: "#8ab8b0", fontSize: "0.82rem", lineHeight: 1.6, marginBottom: "10px" }}>{route.description}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: route.open ? "#1a9e6e" : "#dc2626", display: "inline-block" }} />
                                <span style={{ fontSize: "0.74rem", color: route.open ? "#6ecfb0" : "#f87171" }}>{route.open ? "Navigable actuellement" : "Fermé actuellement"}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "28px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.04)", color: "#1a4a3a", fontSize: "0.69rem" }}>
          <p>FleuVibe World · v6.0 · Powered by Supabase</p>
        </div>
      </div>

      {/* ══ AUTH MODAL ══ */}
      {showAuth && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(26,158,110,0.3)", borderRadius: "18px", padding: "24px", maxWidth: "400px", width: "100%", animation: "pop 0.25s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "2rem" }}>🌊</span>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#daf0e8", marginTop: "6px" }}>{authPage === "login" ? "Connexion à FleuVibe" : "Créer un compte"}</h2>
            </div>

            {authError && <div style={{ padding: "9px 12px", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: "9px", color: "#f87171", fontSize: "0.8rem", marginBottom: "14px" }}>{authError}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {authPage === "signup" && (
                <div>
                  <label style={s.label}>Prénom et nom</label>
                  <input value={authForm.fullName} onChange={e => setAuthForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Jean Dupont" style={s.inp} />
                </div>
              )}
              <div>
                <label style={s.label}>Email</label>
                <input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@exemple.com" style={s.inp} />
              </div>
              <div>
                <label style={s.label}>Mot de passe</label>
                <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" style={s.inp} onKeyDown={e => e.key === "Enter" && (authPage === "login" ? handleSignIn() : handleSignUp())} />
              </div>

              <button className="btn" onClick={authPage === "login" ? handleSignIn : handleSignUp} disabled={authLoading} style={{ padding: "11px", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", border: "none", borderRadius: "11px", color: "#fff", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 4px 14px rgba(26,158,110,0.28)", opacity: authLoading ? 0.7 : 1, marginTop: "4px" }}>
                {authLoading ? "⏳ Chargement..." : authPage === "login" ? "🔐 Se connecter" : "✨ Créer mon compte"}
              </button>

              <div style={{ textAlign: "center", paddingTop: "4px" }}>
                <button className="btn" onClick={() => { setAuthPage(authPage === "login" ? "signup" : "login"); setAuthError(""); }} style={{ color: "#5a9a80", fontSize: "0.8rem", background: "none", textDecoration: "underline" }}>
                  {authPage === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PROFILE MODAL ══ */}
      {showProfile && session && (
        <div className="modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div style={{ background: "linear-gradient(160deg,#0d2240,#0a3d2e)", border: "1px solid rgba(26,158,110,0.3)", borderRadius: "18px", padding: "24px", maxWidth: "360px", width: "100%", animation: "pop 0.25s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1a9e6e,#0891b2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 auto 12px" }}>
                {userName[0].toUpperCase()}
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#daf0e8" }}>{userName}</h2>
              <p style={{ color: "#4a7a6a", fontSize: "0.78rem", marginTop: "3px" }}>{session.user.email}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
              {[["❤️", favorites.length, "Favoris"], ["🌍", ROUTES.length, "Parcours dispo"]].map(([ic, val, label]) => (
                <div key={label} style={{ flex: 1, padding: "12px", background: "rgba(26,158,110,0.08)", border: "1px solid rgba(26,158,110,0.18)", borderRadius: "11px", textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem" }}>{ic}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a8edcf" }}>{val}</div>
                  <div style={{ fontSize: "0.67rem", color: "#4a7a6a" }}>{label}</div>
                </div>
              ))}
            </div>

            {favorites.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: "#4a7a6a", fontSize: "0.72rem", fontWeight: 600, marginBottom: "8px" }}>MES PARCOURS FAVORIS</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {ROUTES.filter(r => favorites.includes(r.id)).map(r => (
                    <button key={r.id} className="btn" onClick={() => { setShowProfile(false); setPage("explore"); setSelectedRoute(r); }} style={{ padding: "7px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#a8c8bc", fontSize: "0.78rem", textAlign: "left", display: "flex", alignItems: "center", gap: "7px" }}>
                      <span>{r.emoji}</span><span>{r.name}</span><span style={{ marginLeft: "auto" }}>{COUNTRIES[r.country]?.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="btn" onClick={handleSignOut} style={{ width: "100%", padding: "10px", background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.22)", borderRadius: "10px", color: "#f87171", fontWeight: 600, fontSize: "0.84rem" }}>
              🚪 Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
