import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";
const SUPABASE_KEY = "sb_publishable_L4n6vcDAs6Q2ujgsZqCKTw_mNRBX0pA";
const WEATHER_KEY = "3a42db1ac015f3b988b8051c5f469bd7";

const supabase = (() => {
  const h = (token) => ({ "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token || SUPABASE_KEY}` });
  return {
    auth: {
      signUp: async (e, p, n) => (await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method:"POST", headers:h(), body:JSON.stringify({ email:e, password:p, data:{full_name:n} }) })).json(),
      signIn: async (e, p) => (await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method:"POST", headers:h(), body:JSON.stringify({ email:e, password:p }) })).json(),
      signOut: async (t) => fetch(`${SUPABASE_URL}/auth/v1/logout`, { method:"POST", headers:h(t) }),
    },
    profiles: {
      get: async (id, t) => { const d = await (await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*`, { headers:h(t) })).json(); return d[0]||null; },
      upsert: async (p, t) => fetch(`${SUPABASE_URL}/rest/v1/profiles`, { method:"POST", headers:{...h(t),"Prefer":"resolution=merge-duplicates"}, body:JSON.stringify(p) }),
      updateFavorites: async (id, favs, t) => fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, { method:"PATCH", headers:h(t), body:JSON.stringify({ favorites:JSON.stringify(favs) }) }),
    },
    reviews: {
      getForRoute: async (rid) => (await fetch(`${SUPABASE_URL}/rest/v1/reviews?route_id=eq.${rid}&select=*&order=created_at.desc`, { headers:h() })).json(),
      add: async (r, t) => fetch(`${SUPABASE_URL}/rest/v1/reviews`, { method:"POST", headers:{...h(t),"Prefer":"return=representation"}, body:JSON.stringify(r) }),
      delete: async (id, t) => fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, { method:"DELETE", headers:h(t) }),
    },
  };
})();

const fetchWeather = async (lat, lon) => {
  try {
    const d = await (await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=fr`)).json();
    if (d.cod !== 200) return null;
    const windKmh = Math.round(d.wind.speed * 3.6);
    const rain = d.rain?.["1h"] || 0;
    const condition = d.weather[0].main;
    let navStatus="good", navLabel="Conditions idéales", navColor="#1a9e6e";
    if (windKmh>40||rain>5) { navStatus="bad"; navLabel="Déconseillé"; navColor="#dc2626"; }
    else if (windKmh>25||rain>2||condition==="Thunderstorm") { navStatus="medium"; navLabel="Conditions difficiles"; navColor="#f59e0b"; }
    else if (condition==="Rain"||condition==="Drizzle") { navStatus="medium"; navLabel="Navigable avec prudence"; navColor="#f59e0b"; }
    const icon = {Clear:"☀️",Clouds:"⛅",Rain:"🌧️",Drizzle:"🌦️",Thunderstorm:"⛈️",Snow:"❄️",Mist:"🌫️",Fog:"🌫️"}[condition]||"🌤️";
    return { temp:Math.round(d.main.temp), description:d.weather[0].description, windKmh, rain, icon, navStatus, navLabel, navColor };
  } catch { return null; }
};

// DATA
const CONTINENTS = { ALL:{name:"Monde entier",flag:"🌍"}, EU:{name:"Europe",flag:"🇪🇺"}, AM:{name:"Amériques",flag:"🌎"}, AS:{name:"Asie",flag:"🌏"}, AF:{name:"Afrique",flag:"🌍"}, OC:{name:"Océanie",flag:"🌊"} };
const COUNTRIES = {
  BE:{name:"Belgique",flag:"🇧🇪",continent:"EU"}, FR:{name:"France",flag:"🇫🇷",continent:"EU"},
  DE:{name:"Allemagne",flag:"🇩🇪",continent:"EU"}, CH:{name:"Suisse",flag:"🇨🇭",continent:"EU"},
  NO:{name:"Norvège",flag:"🇳🇴",continent:"EU"}, SI:{name:"Slovénie",flag:"🇸🇮",continent:"EU"},
  US:{name:"États-Unis",flag:"🇺🇸",continent:"AM"}, CA:{name:"Canada",flag:"🇨🇦",continent:"AM"},
  BR:{name:"Brésil",flag:"🇧🇷",continent:"AM"}, CL:{name:"Chili",flag:"🇨🇱",continent:"AM"},
  NZ:{name:"Nouvelle-Zélande",flag:"🇳🇿",continent:"OC"}, AU:{name:"Australie",flag:"🇦🇺",continent:"OC"},
  NP:{name:"Népal",flag:"🇳🇵",continent:"AS"}, TH:{name:"Thaïlande",flag:"🇹🇭",continent:"AS"},
  VN:{name:"Vietnam",flag:"🇻🇳",continent:"AS"}, ZM:{name:"Zambie",flag:"🇿🇲",continent:"AF"},
};

const SPONSORED_REGIONS = [
  { id:"s1", name:"Ardennes Belges", country:"BE", flag:"🇧🇪", description:"Découvrez 450 km de rivières navigables en Wallonie. Kayak, canoë et rafting au cœur de la nature.", image:"🏞️", color:"#1a9e6e", badge:"Partenaire Officiel", highlights:["450 km navigables","10+ rivières","Toute l'année"] },
  { id:"s2", name:"Ardèche Tourisme", country:"FR", flag:"🇫🇷", description:"Les gorges de l'Ardèche, joyau naturel classé. Le parcours mythique sous le Pont d'Arc.", image:"🌉", color:"#dc2626", badge:"Région Spotlight", highlights:["30 km de gorges","Camping au bord","Eaux cristallines"] },
  { id:"s3", name:"Visit Slovenia", country:"SI", flag:"🇸🇮", description:"La Soča aux eaux émeraude — élue plus belle rivière d'Europe. Kayak dans les Alpes juliennes.", image:"💚", color:"#10b981", badge:"Destination Coup de Cœur", highlights:["Eaux émeraude","Alpes juliennes","UNESCO"] },
];

const PROVIDERS = [
  { id:"p1", name:"Kayaks de Lesse", type:"Location", country:"BE", region:"Wallonie", river:"Lesse", description:"Location kayak et canoë sur la Lesse. Navettes incluses, matériel fourni.", price:25, currency:"€", priceLabel:"/ pers.", rating:4.8, reviews:234, activities:["Kayak","Canoë"], available:true, emoji:"🛶", badges:["Top Prestataire","Réponse rapide"], commission:12, routeIds:[1] },
  { id:"p2", name:"Ardèche Aventures", type:"Guide", country:"FR", region:"Ardèche", river:"Ardèche", description:"Guides certifiés pour les gorges de l'Ardèche. Bivouac et camping inclus sur 2 jours.", price:89, currency:"€", priceLabel:"/ pers. 2j", rating:4.9, reviews:412, activities:["Kayak","Camping"], available:true, emoji:"🌉", badges:["N°1 Ardèche","Guide Certifié"], commission:15, routeIds:[5] },
  { id:"p3", name:"Soča Rafting Center", type:"Rafting", country:"SI", region:"Primorska", river:"Soča", description:"Centre de rafting sur la Soča émeraude. Groupes de 4 à 12 personnes.", price:45, currency:"€", priceLabel:"/ pers.", rating:4.7, reviews:189, activities:["Rafting","Kayak"], available:true, emoji:"💚", badges:["Certifié EU"], commission:12, routeIds:[7] },
  { id:"p4", name:"Norway Wilderness Kayak", type:"Expédition", country:"NO", region:"Innlandet", river:"Sjoa", description:"Expéditions guidées en kayak dans les fjords norvégiens. Multi-jours avec campements.", price:180, currency:"€", priceLabel:"/ pers. 2j", rating:5.0, reviews:67, activities:["Kayak","Camping"], available:true, emoji:"🐺", badges:["5 étoiles","Exclusif"], commission:10, routeIds:[] },
  { id:"p5", name:"Grand Canyon River Co.", type:"Rafting", country:"US", region:"Arizona", river:"Colorado", description:"Expéditions complètes dans le Grand Canyon. 7 à 14 jours, tout inclus.", price:2800, currency:"€", priceLabel:"/ pers. 14j", rating:4.8, reviews:521, activities:["Rafting","Camping"], available:true, emoji:"🏜️", badges:["Permis Officiel"], commission:8, routeIds:[8] },
  { id:"p6", name:"Kayaks Dinant", type:"Location", country:"BE", region:"Wallonie", river:"Meuse", description:"Location kayak sur la Meuse entre Dinant et Namur.", price:20, currency:"€", priceLabel:"/ pers.", rating:4.6, reviews:156, activities:["Kayak","Bateau électrique"], available:true, emoji:"🏰", badges:["Famille"], commission:12, routeIds:[4] },
];

const ROUTES = [
  {id:1,country:"BE",name:"Lesse · Houyet → Anseremme",river:"Lesse",region:"Wallonie",distance:"21 km",duration:"4–5h",difficulty:"Facile",activities:["Kayak","Canoë"],description:"Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses.",color:"#1a9e6e",emoji:"🏞️",open:true,coords:[50.185,5.002],path:[[50.196,4.972],[50.185,5.002],[50.171,5.031]],sponsoredRegion:"s1"},
  {id:2,country:"BE",name:"Ourthe · La Roche → Hotton",river:"Ourthe",region:"Wallonie",distance:"18 km",duration:"3–4h",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Méandres spectaculaires avec quelques rapides dans les Ardennes.",color:"#2563eb",emoji:"🌊",open:true,coords:[50.218,5.578],path:[[50.183,5.571],[50.218,5.578],[50.241,5.540]],sponsoredRegion:"s1"},
  {id:3,country:"BE",name:"Semois · Bouillon → Alle",river:"Semois",region:"Gaume",distance:"34 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Camping"],description:"Immersion totale dans la nature gaumaise avec nuit en camping.",color:"#7c3aed",emoji:"⛺",open:true,coords:[49.870,5.060],path:[[49.795,5.067],[49.870,5.060],[49.920,5.048]]},
  {id:4,country:"BE",name:"Meuse · Namur → Dinant",river:"Meuse",region:"Wallonie",distance:"30 km",duration:"1 journée",difficulty:"Facile",activities:["Canoë","Kayak"],description:"Longer la Meuse entre citadelles et villages pittoresques.",color:"#0891b2",emoji:"🏰",open:true,coords:[50.362,4.860],path:[[50.465,4.867],[50.362,4.860],[50.265,4.913]],sponsoredRegion:"s1"},
  {id:5,country:"FR",name:"Ardèche · Vallon-Pont-d'Arc",river:"Ardèche",region:"Ardèche",distance:"30 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Canoë","Camping"],description:"Le parcours mythique de France sous le Pont d'Arc.",color:"#dc2626",emoji:"🌉",open:true,coords:[44.400,4.390],path:[[44.408,4.398],[44.400,4.390],[44.375,4.360]],sponsoredRegion:"s2"},
  {id:6,country:"FR",name:"Verdon · Gorges",river:"Verdon",region:"Alpes-de-Haute-Provence",distance:"22 km",duration:"2 jours",difficulty:"Sportif",activities:["Kayak","Rafting"],description:"Le Grand Canyon européen. Eaux turquoise et falaises à pic de 700m.",color:"#06b6d4",emoji:"💎",open:true,coords:[43.760,6.340],path:[[43.848,6.516],[43.760,6.340],[43.730,6.220]]},
  {id:7,country:"SI",name:"Soča · Bovec → Tolmin",river:"Soča",region:"Primorska",distance:"55 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Rafting","SUP"],description:"La Soča aux eaux émeraude — l'une des plus belles rivières du monde.",color:"#10b981",emoji:"💚",open:true,coords:[46.240,13.650],path:[[46.336,13.553],[46.240,13.650],[46.188,13.733]],sponsoredRegion:"s3"},
  {id:8,country:"US",name:"Colorado · Grand Canyon",river:"Colorado",region:"Arizona",distance:"360 km",duration:"2 semaines",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"L'expédition ultime dans le Grand Canyon.",color:"#f97316",emoji:"🏜️",open:true,coords:[36.100,-112.100],path:[[36.868,-111.590],[36.100,-112.100],[35.780,-114.048]]},
  {id:9,country:"NP",name:"Trisuli · Himalaya",river:"Trisuli",region:"Gandaki",distance:"50 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans l'Himalaya depuis Katmandou.",color:"#dc2626",emoji:"🏔️",open:true,coords:[27.800,84.400],path:[[27.950,84.450],[27.800,84.400],[27.500,84.300]]},
  {id:10,country:"NZ",name:"Whanganui · Great Journey",river:"Whanganui",region:"Manawatū",distance:"145 km",duration:"5 jours",difficulty:"Facile",activities:["Canoë","Kayak","Camping"],description:"L'une des Great Walks de Nouvelle-Zélande sur l'eau.",color:"#16a34a",emoji:"🥝",open:true,coords:[-39.600,174.800],path:[[-38.900,175.100],[-39.600,174.800],[-39.960,175.049]]},
];

const DIFF_COLOR = { Facile:"#1a9e6e", Intermédiaire:"#f59e0b", Sportif:"#dc2626" };
const PROVIDER_TYPE_COLOR = { Location:"#1a9e6e", Guide:"#2563eb", Rafting:"#dc2626", Expédition:"#7c3aed" };

// COMPONENTS
function WeatherBadge({ coords, small=false }) {
  const [w, setW] = useState(null);
  useEffect(() => { fetchWeather(coords[0], coords[1]).then(setW); }, []);
  if (!w) return <span style={{fontSize:"0.68rem",color:"#3a6a5a"}}>🌤️ ...</span>;
  if (small) return <span style={{display:"inline-flex",alignItems:"center",gap:"3px",padding:"2px 7px",background:`${w.navColor}15`,border:`1px solid ${w.navColor}30`,borderRadius:"8px",fontSize:"0.67rem",color:w.navColor,fontWeight:600}}>{w.icon} {w.temp}°C</span>;
  return (
    <div style={{padding:"11px 13px",background:"rgba(255,255,255,0.04)",border:`1px solid ${w.navColor}40`,borderRadius:"11px",marginTop:"10px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"7px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
          <span style={{fontSize:"1.5rem"}}>{w.icon}</span>
          <div><div style={{fontSize:"1rem",fontWeight:800,color:"#daf0e8"}}>{w.temp}°C</div><div style={{fontSize:"0.7rem",color:"#5a8a78",textTransform:"capitalize"}}>{w.description}</div></div>
        </div>
        <div style={{padding:"3px 9px",background:`${w.navColor}20`,border:`1px solid ${w.navColor}40`,borderRadius:"7px",fontSize:"0.7rem",fontWeight:700,color:w.navColor}}>
          {w.navStatus==="good"?"✅":w.navStatus==="medium"?"⚠️":"🚫"} {w.navLabel}
        </div>
      </div>
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
        <span style={{fontSize:"0.7rem",color:"#4a7a6a"}}>💨 <strong style={{color:"#8ab8b0"}}>{w.windKmh} km/h</strong></span>
        <span style={{fontSize:"0.7rem",color:"#4a7a6a"}}>🌧️ <strong style={{color:"#8ab8b0"}}>{w.rain} mm/h</strong></span>
      </div>
    </div>
  );
}

function StarRating({ value, onChange, readonly=false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{display:"flex",gap:"3px"}}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={()=>!readonly&&onChange&&onChange(s)} onMouseEnter={()=>!readonly&&setHover(s)} onMouseLeave={()=>!readonly&&setHover(0)}
          style={{fontSize:readonly?"0.85rem":"1.3rem",cursor:readonly?"default":"pointer",color:s<=(hover||value)?"#f59e0b":"#2a4a40",transition:"color 0.15s"}}>★</span>
      ))}
    </div>
  );
}

function ReviewsSection({ route, session, userName }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, [route.id]);
  const load = async () => { setLoading(true); const d = await supabase.reviews.getForRoute(route.id); setReviews(Array.isArray(d)?d:[]); setLoading(false); };
  const avg = reviews.length>0 ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;

  const submit = async () => {
    if (!rating) { setError("Choisis une note !"); return; }
    if (!comment.trim()) { setError("Écris un commentaire !"); return; }
    setSubmitting(true); setError("");
    await supabase.reviews.add({ route_id:route.id, user_id:session.user.id, rating, comment:comment.trim(), user_name:userName }, session.token);
    setRating(0); setComment(""); setShowForm(false); await load(); setSubmitting(false);
  };

  return (
    <div style={{marginTop:"13px",paddingTop:"13px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:"0.8rem",fontWeight:700,color:"#a8edcf"}}>⭐ Avis</span>
          {avg && <><span style={{fontSize:"0.95rem",fontWeight:800,color:"#f59e0b"}}>{avg}</span><StarRating value={Math.round(avg)} readonly/><span style={{fontSize:"0.68rem",color:"#3a6a5a"}}>({reviews.length})</span></>}
        </div>
        {session && !showForm && <button onClick={()=>setShowForm(true)} style={{padding:"4px 11px",background:"rgba(26,158,110,0.12)",border:"1px solid rgba(26,158,110,0.28)",borderRadius:"7px",color:"#7ecfb0",fontSize:"0.73rem",fontWeight:600,cursor:"pointer"}}>✍️ Avis</button>}
      </div>
      {showForm && (
        <div style={{padding:"12px",background:"rgba(26,158,110,0.06)",border:"1px solid rgba(26,158,110,0.18)",borderRadius:"10px",marginBottom:"10px"}}>
          <div style={{marginBottom:"8px"}}><p style={{fontSize:"0.71rem",color:"#4a7a6a",marginBottom:"4px"}}>Note</p><StarRating value={rating} onChange={setRating}/></div>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ton expérience..." rows={2} style={{width:"100%",padding:"8px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(26,158,110,0.18)",borderRadius:"8px",color:"#e8f4f0",fontSize:"0.81rem",resize:"vertical",outline:"none",marginBottom:"8px"}}/>
          {error && <p style={{color:"#f87171",fontSize:"0.72rem",marginBottom:"6px"}}>{error}</p>}
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={submit} disabled={submitting} style={{padding:"6px 14px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.78rem",cursor:"pointer",opacity:submitting?0.7:1}}>{submitting?"⏳...":"✅ Publier"}</button>
            <button onClick={()=>{setShowForm(false);setRating(0);setComment("");setError("");}} style={{padding:"6px 11px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"8px",color:"#5a8a78",fontSize:"0.78rem",cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
      {!session && <p style={{fontSize:"0.72rem",color:"#3a6a5a",marginBottom:"8px"}}>🔐 Connecte-toi pour laisser un avis</p>}
      {loading ? <p style={{fontSize:"0.72rem",color:"#3a6a5a"}}>Chargement...</p> : reviews.length===0 ? <p style={{fontSize:"0.72rem",color:"#3a6a5a"}}>Aucun avis. Sois le premier ! 🚀</p> : (
        <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
          {reviews.map(r => (
            <div key={r.id} style={{padding:"9px 11px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"9px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"4px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.72rem",fontWeight:700,color:"#fff"}}>{(r.user_name||"?")[0].toUpperCase()}</div>
                  <div><span style={{fontSize:"0.76rem",fontWeight:600,color:"#c8e8d8"}}>{r.user_name||"Utilisateur"}</span><div style={{display:"flex",alignItems:"center",gap:"4px"}}><StarRating value={r.rating} readonly/><span style={{fontSize:"0.62rem",color:"#3a6a5a"}}>{new Date(r.created_at).toLocaleDateString("fr-BE")}</span></div></div>
                </div>
                {session&&session.user.id===r.user_id && <button onClick={()=>supabase.reviews.delete(r.id,session.token).then(load)} style={{background:"none",border:"none",color:"#3a6a5a",fontSize:"0.72rem",cursor:"pointer"}}>🗑️</button>}
              </div>
              {r.comment && <p style={{fontSize:"0.78rem",color:"#8ab8b0",lineHeight:1.5,marginTop:"4px"}}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// BOOKING MODAL
function BookingModal({ provider, onClose }) {
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [done, setDone] = useState(false);
  const total = (pax * provider.price).toFixed(2);
  const commission = (pax * provider.price * provider.commission / 100).toFixed(2);
  const confirm = () => { if (!date) return; setDone(true); setTimeout(() => onClose(), 3500); };
  return (
    <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"18px",padding:"22px",maxWidth:"400px",width:"100%",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        {done ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"2.8rem",marginBottom:"10px"}}>🎉</div>
            <h3 style={{color:"#a8edcf",fontSize:"1rem",marginBottom:"6px"}}>Réservation confirmée !</h3>
            <p style={{color:"#5a8a78",fontSize:"0.82rem"}}>Confirmation de <strong style={{color:"#a8edcf"}}>{provider.name}</strong> sous 24h.</p>
          </div>
        ) : (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <div><h2 style={{fontSize:"0.95rem",fontWeight:700,color:"#daf0e8",marginBottom:"2px"}}>📅 Réserver</h2><p style={{color:"#4a7a6a",fontSize:"0.76rem"}}>{provider.emoji} {provider.name}</p></div>
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"#5a8a78",borderRadius:"7px",padding:"4px 8px",cursor:"pointer"}}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"11px"}}>
              <div><label style={{display:"block",color:"#6a9a8c",fontSize:"0.73rem",marginBottom:"4px",fontWeight:500}}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(26,158,110,0.2)",borderRadius:"9px",color:"#e8f4f0",fontSize:"0.83rem",outline:"none"}}/></div>
              <div><label style={{display:"block",color:"#6a9a8c",fontSize:"0.73rem",marginBottom:"4px",fontWeight:500}}>Personnes</label>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <button onClick={()=>setPax(p=>Math.max(1,p-1))} style={{width:34,height:34,borderRadius:"8px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#a8edcf",fontSize:"1rem",cursor:"pointer"}}>−</button>
                  <span style={{fontSize:"1rem",fontWeight:700,color:"#daf0e8",minWidth:"24px",textAlign:"center"}}>{pax}</span>
                  <button onClick={()=>setPax(p=>p+1)} style={{width:34,height:34,borderRadius:"8px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"#a8edcf",fontSize:"1rem",cursor:"pointer"}}>+</button>
                </div>
              </div>
              <div style={{padding:"11px",background:"rgba(26,158,110,0.07)",border:"1px solid rgba(26,158,110,0.16)",borderRadius:"9px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{color:"#5a8a78",fontSize:"0.76rem"}}>{pax} × {provider.price}{provider.currency}</span><span style={{color:"#a8edcf",fontWeight:700,fontSize:"0.86rem"}}>{total}{provider.currency}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#3a6a5a",fontSize:"0.68rem"}}>Commission FleuVibe ({provider.commission}%)</span><span style={{color:"#3a8a60",fontSize:"0.68rem"}}>{commission}{provider.currency}</span></div>
              </div>
              <button onClick={confirm} style={{padding:"10px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.86rem",cursor:"pointer",boxShadow:"0 3px 12px rgba(26,158,110,0.25)"}}>✅ Confirmer la réservation</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// APP
export default function FleuVibe() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [authPage, setAuthPage] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authForm, setAuthForm] = useState({email:"",password:"",fullName:""});
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [page, setPage] = useState("explore");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [continent, setContinent] = useState("ALL");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [bookingProvider, setBookingProvider] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  useEffect(()=>{setTimeout(()=>setLoaded(true),100);},[]);
  useEffect(()=>{
    const s = localStorage.getItem("fleuvibe_session");
    if(s){try{const p=JSON.parse(s);setSession(p);loadProfile(p.user.id,p.token);}catch{}}
  },[]);

  const loadProfile = async(id,t)=>{const p=await supabase.profiles.get(id,t);if(p){setProfile(p);try{setFavorites(JSON.parse(p.favorites||"[]"));}catch{setFavorites([]);}}};
  const handleSignUp = async()=>{setAuthLoading(true);setAuthError("");const d=await supabase.auth.signUp(authForm.email,authForm.password,authForm.fullName);if(d.error){setAuthError(d.error.message);setAuthLoading(false);return;}if(d.access_token){const s={user:d.user,token:d.access_token};setSession(s);localStorage.setItem("fleuvibe_session",JSON.stringify(s));await supabase.profiles.upsert({id:d.user.id,full_name:authForm.fullName,username:authForm.email.split("@")[0],favorites:"[]"},d.access_token);await loadProfile(d.user.id,d.access_token);setShowAuth(false);setAuthForm({email:"",password:"",fullName:""});}else{setAuthError("Vérifie ton email !");}setAuthLoading(false);};
  const handleSignIn = async()=>{setAuthLoading(true);setAuthError("");const d=await supabase.auth.signIn(authForm.email,authForm.password);if(d.error){setAuthError(d.error.message);setAuthLoading(false);return;}const s={user:d.user,token:d.access_token};setSession(s);localStorage.setItem("fleuvibe_session",JSON.stringify(s));await loadProfile(d.user.id,d.access_token);setShowAuth(false);setAuthForm({email:"",password:"",fullName:""});setAuthLoading(false);};
  const handleSignOut = async()=>{if(session)await supabase.auth.signOut(session.token);setSession(null);setProfile(null);setFavorites([]);localStorage.removeItem("fleuvibe_session");setShowProfile(false);};
  const toggleFavorite = async(id)=>{if(!session){setShowAuth(true);return;}const n=favorites.includes(id)?favorites.filter(f=>f!==id):[...favorites,id];setFavorites(n);await supabase.profiles.updateFavorites(session.user.id,n,session.token);};

  const filteredRoutes = ROUTES.filter(r=>{
    if(page==="favorites")return favorites.includes(r.id);
    if(continent!=="ALL"&&COUNTRIES[r.country]?.continent!==continent)return false;
    if(search&&!r.name.toLowerCase().includes(search.toLowerCase())&&!r.river.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  useEffect(()=>{
    if(page!=="explore"||view!=="map")return;
    if(mapInstanceRef.current){updateMap();return;}
    const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);
    const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=initMap;document.head.appendChild(s);
  },[page,view]);
  useEffect(()=>{if(mapInstanceRef.current)updateMap();},[filteredRoutes,selectedRoute]);

  const initMap=()=>{if(!mapRef.current||mapInstanceRef.current)return;const L=window.L;const m=L.map(mapRef.current).setView([20,10],2);L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:"© OpenStreetMap © CARTO",subdomains:"abcd"}).addTo(m);mapInstanceRef.current=m;updateMap();};
  const updateMap=()=>{const L=window.L;if(!L||!mapInstanceRef.current)return;layersRef.current.forEach(l=>l.remove());layersRef.current=[];filteredRoutes.forEach(r=>{const iS=selectedRoute?.id===r.id;if(r.path?.length>1){const p=L.polyline(r.path,{color:r.color,weight:iS?5:2.5,opacity:iS?1:0.65}).addTo(mapInstanceRef.current);layersRef.current.push(p);}const ic=L.divIcon({html:`<div style="background:${r.color};width:${iS?36:26}px;height:${iS?36:26}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"><span style="transform:rotate(45deg);font-size:${iS?14:10}px;display:block;text-align:center;line-height:${iS?32:22}px;">${r.emoji}</span></div>`,iconSize:[iS?36:26,iS?36:26],iconAnchor:[iS?18:13,iS?36:26],className:""});const mk=L.marker(r.coords,{icon:ic}).addTo(mapInstanceRef.current);mk.on("click",()=>setSelectedRoute(x=>x?.id===r.id?null:r));layersRef.current.push(mk);});};

  const inp={width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(26,158,110,0.25)",borderRadius:"10px",color:"#e8f4f0",fontSize:"0.85rem"};
  const lbl={display:"block",color:"#6a9a8c",fontSize:"0.74rem",marginBottom:"5px",fontWeight:500};
  const userName=profile?.full_name||profile?.username||session?.user?.email?.split("@")[0]||"Utilisateur";

  const RouteCard=({route,i})=>{
    const isSel=selectedRoute?.id===route.id;
    const isFav=favorites.includes(route.id);
    const routeProviders=PROVIDERS.filter(p=>p.routeIds.includes(route.id));
    const region=SPONSORED_REGIONS.find(s=>s.id===route.sponsoredRegion);
    return(
      <div className={`card fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.1+i*0.03}s`}} onClick={()=>setSelectedRoute(r=>r?.id===route.id?null:route)}>
        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${isSel?route.color+"55":"rgba(255,255,255,0.06)"}`,borderRadius:"13px",overflow:"hidden",boxShadow:isSel?`0 0 18px ${route.color}10`:"none"}}>
          <div style={{height:"2.5px",background:`linear-gradient(90deg,${route.color},transparent)`}}/>
          {region&&<div style={{padding:"3px 12px",background:`${region.color}10`,borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"0.62rem",color:region.color,fontWeight:700}}>⭐ RÉGION PARTENAIRE · {region.name.toUpperCase()}</div>}
          <div style={{padding:"12px 13px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"1.05rem"}}>{route.emoji}</span>
                  <h3 style={{fontSize:"0.88rem",fontWeight:700,color:"#daf0e8"}}>{route.name}</h3>
                  <span style={{fontSize:"0.8rem"}}>{COUNTRIES[route.country]?.flag}</span>
                </div>
                <div style={{color:"#3a5a50",fontSize:"0.71rem"}}>📍 {route.river} · {COUNTRIES[route.country]?.name}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                <WeatherBadge coords={route.coords} small/>
                <button className="btn" onClick={e=>{e.stopPropagation();toggleFavorite(route.id);}} style={{fontSize:"1.05rem",background:"none",color:isFav?"#ef4444":"#3a5a50"}}>{isFav?"❤️":"🤍"}</button>
                <span style={{padding:"2px 6px",borderRadius:"20px",fontSize:"0.65rem",fontWeight:600,background:`${DIFF_COLOR[route.difficulty]}16`,color:DIFF_COLOR[route.difficulty],border:`1px solid ${DIFF_COLOR[route.difficulty]}28`}}>{route.difficulty}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:"11px",marginBottom:"7px"}}>
              {[["📏",route.distance],["⏱️",route.duration]].map(([ic,v])=><span key={v} style={{color:"#3a5a50",fontSize:"0.71rem"}}>{ic} {v}</span>)}
            </div>
            <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
              {route.activities.map(a=><span key={a} style={{padding:"2px 6px",background:`${route.color}12`,border:`1px solid ${route.color}22`,borderRadius:"8px",fontSize:"0.66rem",color:"#8ae8cc",fontWeight:500}}>{a}</span>)}
            </div>
            {isSel&&(
              <div style={{marginTop:"10px",paddingTop:"10px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                <p style={{color:"#8ab8b0",fontSize:"0.81rem",lineHeight:1.6,marginBottom:"9px"}}>{route.description}</p>
                <WeatherBadge coords={route.coords}/>
                {routeProviders.length>0&&(
                  <div style={{marginTop:"10px",padding:"11px",background:"rgba(26,158,110,0.06)",border:"1px solid rgba(26,158,110,0.16)",borderRadius:"10px"}}>
                    <p style={{color:"#3a9a70",fontSize:"0.7rem",fontWeight:700,marginBottom:"7px"}}>🛶 RÉSERVER VIA FLEUVIBE</p>
                    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
                      {routeProviders.map(p=>(
                        <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 9px",background:"rgba(255,255,255,0.03)",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.05)"}}>
                          <div><div style={{fontSize:"0.78rem",fontWeight:600,color:"#c8e8d8"}}>{p.emoji} {p.name}</div><div style={{fontSize:"0.67rem",color:"#3a6a5a"}}>{"⭐".repeat(Math.floor(p.rating))} {p.rating} ({p.reviews} avis)</div></div>
                          <button className="btn" onClick={e=>{e.stopPropagation();setBookingProvider(p);}} style={{padding:"6px 12px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.74rem",boxShadow:"0 2px 8px rgba(26,158,110,0.25)"}}>
                            {p.price}{p.currency} {p.priceLabel}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <ReviewsSection route={route} session={session} userName={userName}/>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0a1628 0%,#0d2240 45%,#0a3d2e 100%)",fontFamily:"'Outfit',sans-serif",color:"#e8f4f0"}}>
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
        input::placeholder,textarea::placeholder{color:#3a6a5a}
        input:focus,textarea:focus{border-color:rgba(26,158,110,0.55)!important;outline:none}
      `}</style>

      <div style={{position:"fixed",bottom:0,left:0,width:"100%",height:"130px",overflow:"hidden",opacity:0.07,pointerEvents:"none",zIndex:0}}>
        <div className="wave-bg" style={{display:"flex",width:"200%"}}>
          {[0,1].map(i=><svg key={i} viewBox="0 0 1440 130" style={{width:"50%",minWidth:"720px"}} fill="#1a9e6e"><path d="M0,65 C240,110 480,20 720,65 C960,110 1200,20 1440,65 L1440,130 L0,130 Z"/></svg>)}
        </div>
      </div>

      <div style={{position:"relative",zIndex:1,maxWidth:"980px",margin:"0 auto",padding:"16px 14px"}}>

        {/* HEADER */}
        <div className={`fade-in ${loaded?"loaded":""}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"1.6rem",animation:"float 3s ease-in-out infinite"}}>🌊</span>
            <h1 style={{fontSize:"clamp(1.5rem,4vw,2.2rem)",fontWeight:800,letterSpacing:"-0.5px",background:"linear-gradient(135deg,#a8edcf 0%,#1a9e6e 50%,#38bdf8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FleuVibe</h1>
            <span style={{background:"rgba(26,158,110,0.2)",border:"1px solid rgba(26,158,110,0.4)",borderRadius:"6px",padding:"2px 6px",fontSize:"0.6rem",color:"#7ecfb0",fontWeight:700}}>WORLD</span>
          </div>
          {session?(
            <button className="btn" onClick={()=>setShowProfile(true)} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 14px",background:"rgba(26,158,110,0.15)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"10px",color:"#a8edcf",fontSize:"0.82rem",fontWeight:600}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.85rem",fontWeight:700,color:"#fff"}}>{userName[0].toUpperCase()}</div>
              {userName}
            </button>
          ):(
            <button className="btn" onClick={()=>setShowAuth(true)} style={{padding:"8px 18px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.82rem",boxShadow:"0 3px 12px rgba(26,158,110,0.25)"}}>🔐 Connexion</button>
          )}
        </div>

        {/* NAV */}
        <div className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:"0.05s",display:"flex",gap:"4px",marginBottom:"16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"13px",padding:"4px",flexWrap:"wrap"}}>
          {[["explore","🗺️ Explorer"],["providers","🛶 Prestataires"],["tourism","⭐ Destinations"],["weather","🌤️ Météo"],["favorites",`❤️${favorites.length>0?` (${favorites.length})`:""}`]].map(([id,label])=>(
            <button key={id} className="btn" onClick={()=>{setPage(id);setSearch("");}} style={{flex:1,minWidth:"70px",padding:"8px 8px",borderRadius:"9px",background:page===id?"rgba(26,158,110,0.22)":"transparent",border:page===id?"1px solid rgba(26,158,110,0.4)":"1px solid transparent",color:page===id?"#a8edcf":"#4a7a6a",fontSize:"0.76rem",fontWeight:page===id?700:500}}>{label}</button>
          ))}
        </div>

        {/* EXPLORE */}
        {page==="explore"&&(
          <div>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"center",marginBottom:"11px"}}>
              {Object.entries(CONTINENTS).map(([code,c])=>{
                const count=code==="ALL"?ROUTES.length:ROUTES.filter(r=>COUNTRIES[r.country]?.continent===code).length;
                return <button key={code} className="btn" onClick={()=>setContinent(code)} style={{padding:"5px 10px",borderRadius:"9px",background:continent===code?"rgba(26,158,110,0.2)":"rgba(255,255,255,0.03)",border:`1px solid ${continent===code?"#1a9e6e":"rgba(255,255,255,0.07)"}`,color:continent===code?"#a8edcf":"#4a7a6a",fontSize:"0.73rem",fontWeight:600}}>{c.flag} {c.name} ({count})</button>;
              })}
            </div>
            <div style={{display:"flex",gap:"7px",marginBottom:"13px"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Rechercher..." style={{...inp,flex:1}}/>
              <div style={{display:"flex",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",overflow:"hidden"}}>
                {[["list","📋"],["map","🗺️"]].map(([v,ic])=><button key={v} className="btn" onClick={()=>setView(v)} style={{padding:"0 12px",background:view===v?"rgba(26,158,110,0.25)":"transparent",color:view===v?"#a8edcf":"#4a7a6a",fontSize:"0.95rem"}}>{ic}</button>)}
              </div>
            </div>
            {view==="map"&&(
              <div>
                <div style={{borderRadius:"16px",overflow:"hidden",border:"1px solid rgba(26,158,110,0.15)"}}><div ref={mapRef} style={{height:"420px",width:"100%"}}/></div>
                {selectedRoute&&(
                  <div style={{marginTop:"10px",padding:"13px",background:"rgba(255,255,255,0.04)",border:`1px solid ${selectedRoute.color}40`,borderRadius:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                      <div><h3 style={{fontSize:"0.93rem",fontWeight:700,color:"#daf0e8"}}>{selectedRoute.emoji} {selectedRoute.name} {COUNTRIES[selectedRoute.country]?.flag}</h3><p style={{color:"#4a7a6a",fontSize:"0.73rem"}}>{selectedRoute.river} · {selectedRoute.region}</p></div>
                      <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
                        <button className="btn" onClick={()=>toggleFavorite(selectedRoute.id)} style={{fontSize:"1.2rem",background:"none",color:favorites.includes(selectedRoute.id)?"#ef4444":"#4a7a6a"}}>{favorites.includes(selectedRoute.id)?"❤️":"🤍"}</button>
                        <button onClick={()=>setSelectedRoute(null)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"#5a8a78",borderRadius:"7px",padding:"4px 8px",cursor:"pointer",fontSize:"0.72rem"}}>✕</button>
                      </div>
                    </div>
                    <p style={{color:"#8ab8b0",fontSize:"0.8rem",lineHeight:1.6,marginBottom:"8px"}}>{selectedRoute.description}</p>
                    <WeatherBadge coords={selectedRoute.coords}/>
                    <ReviewsSection route={selectedRoute} session={session} userName={userName}/>
                  </div>
                )}
              </div>
            )}
            {view==="list"&&<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{filteredRoutes.map((r,i)=><RouteCard key={r.id} route={r} i={i}/>)}</div>}
          </div>
        )}

        {/* PROVIDERS */}
        {page==="providers"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:"18px"}}>
              <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"#a8edcf",marginBottom:"5px"}}>🛶 Prestataires</h2>
              <p style={{color:"#4a7a6a",fontSize:"0.81rem"}}>Clubs, guides et loueurs partenaires FleuVibe</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {PROVIDERS.map((p,i)=>(
                <div key={p.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.08+i*0.04}s`,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"14px",overflow:"hidden"}}>
                  <div style={{height:"2.5px",background:`linear-gradient(90deg,${PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"},transparent)`}}/>
                  <div style={{padding:"13px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"7px"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px",flexWrap:"wrap"}}>
                          <span style={{fontSize:"1.2rem"}}>{p.emoji}</span>
                          <h3 style={{fontSize:"0.9rem",fontWeight:700,color:"#daf0e8"}}>{p.name}</h3>
                          <span style={{padding:"2px 6px",borderRadius:"7px",fontSize:"0.64rem",fontWeight:700,background:`${PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"}18`,color:PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e",border:`1px solid ${PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"}28`}}>{p.type}</span>
                          {COUNTRIES[p.country]&&<span style={{fontSize:"0.8rem"}}>{COUNTRIES[p.country].flag}</span>}
                        </div>
                        <div style={{color:"#3a5a50",fontSize:"0.71rem"}}>📍 {p.river} · {p.region}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:"1rem",fontWeight:800,color:"#a8edcf"}}>{p.price}{p.currency}</div>
                        <div style={{fontSize:"0.66rem",color:"#4a7a6a"}}>{p.priceLabel}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"7px",flexWrap:"wrap"}}>
                      {p.rating>0&&<span style={{fontSize:"0.72rem",color:"#f59e0b",fontWeight:600}}>{"⭐".repeat(Math.floor(p.rating))} {p.rating} <span style={{color:"#4a7a6a"}}>({p.reviews})</span></span>}
                      <span style={{fontSize:"0.66rem",color:"#2a8a60",background:"rgba(26,158,110,0.08)",padding:"2px 6px",borderRadius:"5px"}}>Commission: {p.commission}%</span>
                      <div style={{display:"flex",alignItems:"center",gap:"3px"}}><span style={{width:5,height:5,borderRadius:"50%",background:p.available?"#1a9e6e":"#dc2626",display:"inline-block"}}/><span style={{fontSize:"0.66rem",color:p.available?"#6ecfb0":"#f87171"}}>{p.available?"Disponible":"Complet"}</span></div>
                    </div>
                    <p style={{color:"#7a9a90",fontSize:"0.79rem",lineHeight:1.5,marginBottom:"9px"}}>{p.description}</p>
                    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"9px"}}>
                      {p.badges?.map(b=><span key={b} style={{padding:"2px 6px",background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.18)",borderRadius:"6px",fontSize:"0.63rem",color:"#fbbf24",fontWeight:600}}>{b}</span>)}
                    </div>
                    <button className="btn" onClick={()=>setBookingProvider(p)} style={{padding:"8px 18px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"9px",color:"#fff",fontWeight:700,fontSize:"0.8rem",boxShadow:"0 3px 10px rgba(26,158,110,0.25)"}}>
                      📅 Réserver — {p.price}{p.currency} {p.priceLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOURISM */}
        {page==="tourism"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:"18px"}}>
              <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"#a8edcf",marginBottom:"5px"}}>⭐ Destinations Partenaires</h2>
              <p style={{color:"#4a7a6a",fontSize:"0.81rem"}}>Régions mises en avant grâce à nos partenariats officiers du tourisme</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"22px"}}>
              {SPONSORED_REGIONS.map((r,i)=>(
                <div key={r.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.08+i*0.07}s`,background:`linear-gradient(135deg,${r.color}08,rgba(255,255,255,0.02))`,border:`1px solid ${r.color}30`,borderRadius:"15px",overflow:"hidden"}}>
                  <div style={{height:"3px",background:`linear-gradient(90deg,${r.color},${r.color}55)`}}/>
                  <div style={{padding:"16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"9px",flexWrap:"wrap",gap:"8px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                        <span style={{fontSize:"2rem"}}>{r.image}</span>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px"}}>
                            <h3 style={{fontSize:"0.97rem",fontWeight:700,color:"#daf0e8"}}>{r.name}</h3>
                            <span style={{fontSize:"0.88rem"}}>{r.flag}</span>
                          </div>
                          <span style={{padding:"2px 7px",background:`${r.color}18`,border:`1px solid ${r.color}35`,borderRadius:"6px",fontSize:"0.63rem",color:r.color,fontWeight:700}}>⭐ {r.badge}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{color:"#8ab8b0",fontSize:"0.82rem",lineHeight:1.6,marginBottom:"10px"}}>{r.description}</p>
                    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"10px"}}>
                      {r.highlights.map(h=><span key={h} style={{padding:"3px 9px",background:`${r.color}10`,border:`1px solid ${r.color}22`,borderRadius:"8px",fontSize:"0.7rem",color:"#8ae8cc",fontWeight:500}}>✓ {h}</span>)}
                    </div>
                    <div>
                      <p style={{color:"#3a6a5a",fontSize:"0.68rem",fontWeight:600,marginBottom:"5px"}}>PARCOURS DANS CETTE RÉGION</p>
                      <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                        {ROUTES.filter(route=>route.sponsoredRegion===r.id).map(route=>(
                          <button key={route.id} className="btn" onClick={()=>{setPage("explore");setSelectedRoute(route);}} style={{padding:"4px 9px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"7px",color:"#7ecfb0",fontSize:"0.72rem",fontWeight:600}}>{route.emoji} {route.name.split("·")[0]}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"linear-gradient(135deg,rgba(26,158,110,0.08),rgba(8,145,178,0.08))",border:"1px solid rgba(26,158,110,0.18)",borderRadius:"14px",padding:"20px",textAlign:"center"}}>
              <div style={{fontSize:"1.8rem",marginBottom:"8px"}}>🌍</div>
              <h3 style={{fontSize:"0.97rem",fontWeight:700,color:"#a8edcf",marginBottom:"7px"}}>Vous êtes un office du tourisme ?</h3>
              <p style={{color:"#4a7a6a",fontSize:"0.81rem",lineHeight:1.6,marginBottom:"12px"}}>Mettez votre région en avant sur FleuVibe et touchez des milliers de passionnés nautiques.</p>
              <div style={{display:"flex",gap:"8px",justifyContent:"center",flexWrap:"wrap",marginBottom:"12px"}}>
                {["🎯 Visibilité mondiale","📊 Tableau de bord","🌟 Badge Officiel"].map(f=><span key={f} style={{padding:"4px 10px",background:"rgba(26,158,110,0.1)",border:"1px solid rgba(26,158,110,0.2)",borderRadius:"8px",fontSize:"0.72rem",color:"#7ecfb0",fontWeight:500}}>{f}</span>)}
              </div>
              <button className="btn" style={{padding:"9px 22px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.84rem",boxShadow:"0 3px 12px rgba(26,158,110,0.25)"}}>📩 Nous contacter</button>
            </div>
          </div>
        )}

        {/* WEATHER */}
        {page==="weather"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:"18px"}}>
              <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"#a8edcf",marginBottom:"5px"}}>🌤️ Conditions en temps réel</h2>
              <p style={{color:"#4a7a6a",fontSize:"0.81rem"}}>Météo actuelle sur chaque parcours pour planifier ta sortie.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
              {ROUTES.map((r,i)=>(
                <div key={r.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.07+i*0.04}s`,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"12px",overflow:"hidden"}}>
                  <div style={{height:"2.5px",background:`linear-gradient(90deg,${r.color},transparent)`}}/>
                  <div style={{padding:"12px 13px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
                      <span style={{fontSize:"1.05rem"}}>{r.emoji}</span>
                      <div><h3 style={{fontSize:"0.86rem",fontWeight:700,color:"#daf0e8"}}>{r.name} {COUNTRIES[r.country]?.flag}</h3><p style={{color:"#3a5a50",fontSize:"0.7rem"}}>{r.river} · {r.region}</p></div>
                    </div>
                    <WeatherBadge coords={r.coords}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAVORITES */}
        {page==="favorites"&&(
          <div>
            {!session&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>❤️</div><h3 style={{color:"#a8edcf",marginBottom:"8px"}}>Connecte-toi pour voir tes favoris</h3><button className="btn" onClick={()=>setShowAuth(true)} style={{padding:"10px 24px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.85rem"}}>🔐 Se connecter</button></div>}
            {session&&favorites.length===0&&<div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:"3rem",marginBottom:"12px"}}>🏞️</div><h3 style={{color:"#a8edcf",marginBottom:"8px"}}>Aucun favori</h3><button className="btn" onClick={()=>setPage("explore")} style={{padding:"9px 20px",background:"rgba(26,158,110,0.15)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"10px",color:"#a8edcf",fontWeight:600,fontSize:"0.83rem"}}>🗺️ Explorer</button></div>}
            {session&&favorites.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{ROUTES.filter(r=>favorites.includes(r.id)).map((r,i)=><RouteCard key={r.id} route={r} i={i}/>)}</div>}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:"28px",paddingTop:"14px",borderTop:"1px solid rgba(255,255,255,0.04)",color:"#1a4a3a",fontSize:"0.68rem"}}>
          <p>FleuVibe World · v9.0 · Météo · Avis · Prestataires · Destinations · Auth</p>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {bookingProvider&&<BookingModal provider={bookingProvider} onClose={()=>setBookingProvider(null)}/>}

      {/* AUTH MODAL */}
      {showAuth&&(
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowAuth(false);}}>
          <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"18px",padding:"22px",maxWidth:"400px",width:"100%",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{textAlign:"center",marginBottom:"18px"}}><span style={{fontSize:"2rem"}}>🌊</span><h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#daf0e8",marginTop:"5px"}}>{authPage==="login"?"Connexion à FleuVibe":"Créer un compte"}</h2></div>
            {authError&&<div style={{padding:"8px 11px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.22)",borderRadius:"8px",color:"#f87171",fontSize:"0.78rem",marginBottom:"12px"}}>{authError}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {authPage==="signup"&&<div><label style={lbl}>Prénom et nom</label><input value={authForm.fullName} onChange={e=>setAuthForm(f=>({...f,fullName:e.target.value}))} placeholder="Jean Dupont" style={inp}/></div>}
              <div><label style={lbl}>Email</label><input type="email" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))} placeholder="jean@exemple.com" style={inp}/></div>
              <div><label style={lbl}>Mot de passe</label><input type="password" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" style={inp} onKeyDown={e=>e.key==="Enter"&&(authPage==="login"?handleSignIn():handleSignUp())}/></div>
              <button className="btn" onClick={authPage==="login"?handleSignIn:handleSignUp} disabled={authLoading} style={{padding:"10px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.86rem",opacity:authLoading?0.7:1,marginTop:"3px"}}>{authLoading?"⏳ Chargement...":authPage==="login"?"🔐 Se connecter":"✨ Créer mon compte"}</button>
              <div style={{textAlign:"center"}}><button className="btn" onClick={()=>{setAuthPage(authPage==="login"?"signup":"login");setAuthError("");}} style={{color:"#5a9a80",fontSize:"0.78rem",background:"none",textDecoration:"underline"}}>{authPage==="login"?"Pas encore de compte ? S'inscrire":"Déjà un compte ? Se connecter"}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile&&session&&(
        <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)setShowProfile(false);}}>
          <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"18px",padding:"22px",maxWidth:"360px",width:"100%",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{textAlign:"center",marginBottom:"18px"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem",fontWeight:700,color:"#fff",margin:"0 auto 10px"}}>{userName[0].toUpperCase()}</div>
              <h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#daf0e8"}}>{userName}</h2>
              <p style={{color:"#4a7a6a",fontSize:"0.76rem",marginTop:"2px"}}>{session.user.email}</p>
            </div>
            <div style={{display:"flex",gap:"10px",marginBottom:"16px"}}>
              {[["❤️",favorites.length,"Favoris"],["🌍",ROUTES.length,"Parcours"]].map(([ic,val,label])=>(
                <div key={label} style={{flex:1,padding:"11px",background:"rgba(26,158,110,0.07)",border:"1px solid rgba(26,158,110,0.16)",borderRadius:"10px",textAlign:"center"}}>
                  <div style={{fontSize:"1.2rem"}}>{ic}</div>
                  <div style={{fontSize:"1rem",fontWeight:800,color:"#a8edcf"}}>{val}</div>
                  <div style={{fontSize:"0.65rem",color:"#4a7a6a"}}>{label}</div>
                </div>
              ))}
            </div>
            <button className="btn" onClick={handleSignOut} style={{width:"100%",padding:"9px",background:"rgba(220,38,38,0.1)",border:"1px solid rgba(220,38,38,0.2)",borderRadius:"9px",color:"#f87171",fontWeight:600,fontSize:"0.82rem"}}>🚪 Se déconnecter</button>
          </div>
        </div>
      )}
    </div>
  );
}
