import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";
const SUPABASE_KEY = "sb_publishable_L4n6vcDAs6Q2ujgsZqCKTw_mNRBX0pA";

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
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/get-weather?lat=${lat}&lon=${lon}`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
};

const CONTINENTS = {
  ALL:{name:"Monde entier",flag:"🌍"}, EU:{name:"Europe",flag:"🇪🇺"}, AM:{name:"Amériques",flag:"🌎"},
  AS:{name:"Asie",flag:"🌏"}, AF:{name:"Afrique",flag:"🌍"}, OC:{name:"Océanie",flag:"🌊"}
};

const COUNTRIES = {
  // Europe
  BE:{name:"Belgique",flag:"🇧🇪",continent:"EU"}, FR:{name:"France",flag:"🇫🇷",continent:"EU"},
  DE:{name:"Allemagne",flag:"🇩🇪",continent:"EU"}, CH:{name:"Suisse",flag:"🇨🇭",continent:"EU"},
  AT:{name:"Autriche",flag:"🇦🇹",continent:"EU"}, NO:{name:"Norvège",flag:"🇳🇴",continent:"EU"},
  SI:{name:"Slovénie",flag:"🇸🇮",continent:"EU"}, IT:{name:"Italie",flag:"🇮🇹",continent:"EU"},
  HR:{name:"Croatie",flag:"🇭🇷",continent:"EU"}, PT:{name:"Portugal",flag:"🇵🇹",continent:"EU"},
  ES:{name:"Espagne",flag:"🇪🇸",continent:"EU"}, IS:{name:"Islande",flag:"🇮🇸",continent:"EU"},
  GR:{name:"Grèce",flag:"🇬🇷",continent:"EU"}, TR:{name:"Turquie",flag:"🇹🇷",continent:"EU"},
  SE:{name:"Suède",flag:"🇸🇪",continent:"EU"}, FI:{name:"Finlande",flag:"🇫🇮",continent:"EU"},
  HU:{name:"Hongrie",flag:"🇭🇺",continent:"EU"}, SK:{name:"Slovaquie",flag:"🇸🇰",continent:"EU"},
  // Amériques
  US:{name:"États-Unis",flag:"🇺🇸",continent:"AM"}, CA:{name:"Canada",flag:"🇨🇦",continent:"AM"},
  BR:{name:"Brésil",flag:"🇧🇷",continent:"AM"}, CL:{name:"Chili",flag:"🇨🇱",continent:"AM"},
  MX:{name:"Mexique",flag:"🇲🇽",continent:"AM"}, CO:{name:"Colombie",flag:"🇨🇴",continent:"AM"},
  PE:{name:"Pérou",flag:"🇵🇪",continent:"AM"}, AR:{name:"Argentine",flag:"🇦🇷",continent:"AM"},
  CR:{name:"Costa Rica",flag:"🇨🇷",continent:"AM"}, EC:{name:"Équateur",flag:"🇪🇨",continent:"AM"},
  // Océanie
  NZ:{name:"Nouvelle-Zélande",flag:"🇳🇿",continent:"OC"}, AU:{name:"Australie",flag:"🇦🇺",continent:"OC"},
  FJ:{name:"Fidji",flag:"🇫🇯",continent:"OC"}, PF:{name:"Polynésie",flag:"🇵🇫",continent:"OC"},
  // Asie
  NP:{name:"Népal",flag:"🇳🇵",continent:"AS"}, TH:{name:"Thaïlande",flag:"🇹🇭",continent:"AS"},
  VN:{name:"Vietnam",flag:"🇻🇳",continent:"AS"}, ID:{name:"Indonésie",flag:"🇮🇩",continent:"AS"},
  JP:{name:"Japon",flag:"🇯🇵",continent:"AS"}, IN:{name:"Inde",flag:"🇮🇳",continent:"AS"},
  KG:{name:"Kirghizistan",flag:"🇰🇬",continent:"AS"}, CN:{name:"Chine",flag:"🇨🇳",continent:"AS"},
  PH:{name:"Philippines",flag:"🇵🇭",continent:"AS"}, LK:{name:"Sri Lanka",flag:"🇱🇰",continent:"AS"},
  // Afrique
  ZM:{name:"Zambie",flag:"🇿🇲",continent:"AF"}, MA:{name:"Maroc",flag:"🇲🇦",continent:"AF"},
  ZA:{name:"Afrique du Sud",flag:"🇿🇦",continent:"AF"}, KE:{name:"Kenya",flag:"🇰🇪",continent:"AF"},
  UG:{name:"Ouganda",flag:"🇺🇬",continent:"AF"}, MG:{name:"Madagascar",flag:"🇲🇬",continent:"AF"},
  ET:{name:"Éthiopie",flag:"🇪🇹",continent:"AF"}, TZ:{name:"Tanzanie",flag:"🇹🇿",continent:"AF"},
};

const WATER_TYPES = {
  ALL:{ name:"Tous", icon:"🌊", color:"#1a9e6e" },
  RIVER:{ name:"Rivières", icon:"🏞️", color:"#2563eb" },
  LAKE:{ name:"Lacs", icon:"🏔️", color:"#0891b2" },
  SEA:{ name:"Mers & Côtes", icon:"🌊", color:"#7c3aed" },
};

const DIFF_COLOR = { Facile:"#1a9e6e", Intermédiaire:"#f59e0b", Sportif:"#dc2626" };
const PROVIDER_TYPE_COLOR = { Location:"#1a9e6e", Guide:"#2563eb", Rafting:"#dc2626", Expédition:"#7c3aed" };

const SPONSORED_REGIONS = [
  { id:"s1", name:"Ardennes Belges", country:"BE", flag:"🇧🇪", description:"450 km de rivières navigables en Wallonie.", image:"🏞️", color:"#1a9e6e", badge:"Partenaire Officiel", highlights:["450 km","10+ rivières","Toute l'année"] },
  { id:"s2", name:"Ardèche Tourisme", country:"FR", flag:"🇫🇷", description:"Les gorges de l'Ardèche, joyau naturel classé.", image:"🌉", color:"#dc2626", badge:"Région Spotlight", highlights:["30 km gorges","Camping","Cristallin"] },
  { id:"s3", name:"Visit Slovenia", country:"SI", flag:"🇸🇮", description:"La Soča aux eaux émeraude — plus belle rivière d'Europe.", image:"💚", color:"#10b981", badge:"Coup de Cœur", highlights:["Émeraude","Alpes","UNESCO"] },
  { id:"s4", name:"Lac d'Annecy", country:"FR", flag:"🇫🇷", description:"Le lac le plus pur d'Europe. SUP, kayak et voile.", image:"🏔️", color:"#0891b2", badge:"Lac Partenaire", highlights:["Eau pure","Cadre alpin","Activités"] },
  { id:"s5", name:"Algarve Tourism", country:"PT", flag:"🇵🇹", description:"Les côtes rocheuses de l'Algarve, paradis du kayak.", image:"🌊", color:"#7c3aed", badge:"Côte Partenaire", highlights:["Grottes","Turquoise","Soleil"] },
];

const PROVIDERS = [
  { id:"p1", name:"Kayaks de Lesse", type:"Location", country:"BE", region:"Wallonie", river:"Lesse", description:"Location kayak et canoë sur la Lesse. Navettes incluses.", price:25, currency:"€", priceLabel:"/ pers.", rating:4.8, reviews:234, activities:["Kayak","Canoë"], available:true, emoji:"🛶", badges:["Top Prestataire"], commission:12, routeIds:[1] },
  { id:"p2", name:"Ardèche Aventures", type:"Guide", country:"FR", region:"Ardèche", river:"Ardèche", description:"Guides certifiés pour les gorges de l'Ardèche.", price:89, currency:"€", priceLabel:"/ pers. 2j", rating:4.9, reviews:412, activities:["Kayak","Camping"], available:true, emoji:"🌉", badges:["N°1 Ardèche"], commission:15, routeIds:[5] },
  { id:"p3", name:"Soča Rafting Center", type:"Rafting", country:"SI", region:"Primorska", river:"Soča", description:"Centre de rafting sur la Soča émeraude.", price:45, currency:"€", priceLabel:"/ pers.", rating:4.7, reviews:189, activities:["Rafting","Kayak"], available:true, emoji:"💚", badges:["Certifié EU"], commission:12, routeIds:[7] },
  { id:"p4", name:"Annecy SUP & Kayak", type:"Location", country:"FR", region:"Haute-Savoie", river:"Lac d'Annecy", description:"Location SUP, kayak et pédalos sur le lac d'Annecy.", price:18, currency:"€", priceLabel:"/ heure", rating:4.8, reviews:312, activities:["SUP","Kayak"], available:true, emoji:"🏔️", badges:["Lac Premium"], commission:12, routeIds:[11] },
  { id:"p5", name:"Algarve Sea Kayak", type:"Guide", country:"PT", region:"Algarve", river:"Côte Algarve", description:"Exploration kayak des grottes marines de l'Algarve.", price:55, currency:"€", priceLabel:"/ pers.", rating:4.9, reviews:278, activities:["Kayak","Plongée"], available:true, emoji:"🌊", badges:["Top Côte"], commission:13, routeIds:[35] },
  { id:"p6", name:"Bali Surf School", type:"Guide", country:"ID", region:"Bali", river:"Côte Bali", description:"Cours de surf sur les meilleures vagues de Bali.", price:35, currency:"€", priceLabel:"/ pers.", rating:4.8, reviews:567, activities:["Surf","SUP"], available:true, emoji:"🏄", badges:["Top Surf"], commission:12, routeIds:[56] },
];

const BASE_ROUTES = [
  // ═══ BELGIQUE ═══
  {id:1,type:"RIVER",country:"BE",name:"Lesse · Houyet → Anseremme",river:"Lesse",region:"Wallonie",distance:"21 km",duration:"4–5h",difficulty:"Facile",activities:["Kayak","Canoë"],description:"Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses.",color:"#1a9e6e",emoji:"🏞️",open:true,coords:[50.185,5.002],path:[[50.196,4.972],[50.185,5.002],[50.171,5.031]],sponsoredRegion:"s1"},
  {id:2,type:"RIVER",country:"BE",name:"Ourthe · La Roche → Hotton",river:"Ourthe",region:"Wallonie",distance:"18 km",duration:"3–4h",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Méandres spectaculaires avec quelques rapides dans les Ardennes.",color:"#2563eb",emoji:"🌊",open:true,coords:[50.218,5.578],path:[[50.183,5.571],[50.218,5.578],[50.241,5.540]],sponsoredRegion:"s1"},
  {id:3,type:"RIVER",country:"BE",name:"Semois · Bouillon → Alle",river:"Semois",region:"Gaume",distance:"34 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Camping"],description:"Immersion totale dans la nature gaumaise avec nuit en camping.",color:"#7c3aed",emoji:"⛺",open:true,coords:[49.870,5.060],path:[[49.795,5.067],[49.870,5.060],[49.920,5.048]]},
  {id:4,type:"RIVER",country:"BE",name:"Meuse · Namur → Dinant",river:"Meuse",region:"Wallonie",distance:"30 km",duration:"1 journée",difficulty:"Facile",activities:["Canoë","Kayak"],description:"Longer la Meuse entre citadelles et villages pittoresques.",color:"#0891b2",emoji:"🏰",open:true,coords:[50.362,4.860],path:[[50.465,4.867],[50.362,4.860],[50.265,4.913]],sponsoredRegion:"s1"},
  {id:5,type:"LAKE",country:"BE",name:"Lacs de l'Eau d'Heure",river:"Eau d'Heure",region:"Namur",distance:"15 km",duration:"3h",difficulty:"Facile",activities:["Kayak","SUP","Voile","Baignade"],description:"Le plus grand lac artificiel de Belgique. Parfait pour toutes les activités nautiques.",color:"#06b6d4",emoji:"🏖️",open:true,coords:[50.188,4.558],path:[[50.175,4.530],[50.188,4.558],[50.198,4.580]]},

  // ═══ FRANCE ═══
  {id:6,type:"RIVER",country:"FR",name:"Ardèche · Vallon-Pont-d'Arc",river:"Ardèche",region:"Ardèche",distance:"30 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Canoë","Camping"],description:"Le parcours mythique de France sous le Pont d'Arc.",color:"#dc2626",emoji:"🌉",open:true,coords:[44.400,4.390],path:[[44.408,4.398],[44.400,4.390],[44.375,4.360]],sponsoredRegion:"s2"},
  {id:7,type:"RIVER",country:"FR",name:"Verdon · Gorges",river:"Verdon",region:"Alpes-de-Haute-Provence",distance:"22 km",duration:"2 jours",difficulty:"Sportif",activities:["Kayak","Rafting"],description:"Le Grand Canyon européen. Eaux turquoise et falaises à pic de 700m.",color:"#06b6d4",emoji:"💎",open:true,coords:[43.760,6.340],path:[[43.848,6.516],[43.760,6.340],[43.730,6.220]]},
  {id:8,type:"RIVER",country:"FR",name:"Dordogne · Argentat → Beaulieu",river:"Dordogne",region:"Corrèze",distance:"28 km",duration:"1 journée",difficulty:"Intermédiaire",activities:["Kayak","Canoë"],description:"Les gorges de la Dordogne entre falaises et villages médiévaux.",color:"#f97316",emoji:"🦅",open:true,coords:[45.090,1.940],path:[[45.100,1.930],[45.090,1.940],[45.070,1.970]]},
  {id:9,type:"RIVER",country:"FR",name:"Loire · Amboise → Tours",river:"Loire",region:"Indre-et-Loire",distance:"26 km",duration:"5h",difficulty:"Facile",activities:["Kayak","Canoë","SUP"],description:"Glisser sur la Loire au fil des châteaux Renaissance.",color:"#f59e0b",emoji:"👑",open:true,coords:[47.370,0.820],path:[[47.413,0.985],[47.370,0.820],[47.356,0.700]]},
  {id:10,type:"RIVER",country:"FR",name:"Tarn · Millau Gorges",river:"Tarn",region:"Aveyron",distance:"24 km",duration:"1 journée",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Pagayer sous le Viaduc de Millau dans les gorges du Tarn.",color:"#7c3aed",emoji:"🌁",open:true,coords:[44.100,3.080],path:[[44.098,3.078],[44.100,3.080],[44.110,3.100]]},
  {id:11,type:"LAKE",country:"FR",name:"Lac d'Annecy · Tour complet",river:"Lac d'Annecy",region:"Haute-Savoie",distance:"35 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","SUP","Voile","Baignade"],description:"Le lac le plus pur d'Europe entouré par les Alpes.",color:"#0891b2",emoji:"🏔️",open:true,coords:[45.866,6.165],path:[[45.900,6.120],[45.866,6.165],[45.820,6.160]],sponsoredRegion:"s4"},

  // ═══ EUROPE ═══
  {id:12,type:"RIVER",country:"SI",name:"Soča · Bovec → Tolmin",river:"Soča",region:"Primorska",distance:"55 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Rafting","SUP"],description:"La Soča aux eaux émeraude — l'une des plus belles rivières du monde.",color:"#10b981",emoji:"💚",open:true,coords:[46.240,13.650],path:[[46.336,13.553],[46.240,13.650],[46.188,13.733]],sponsoredRegion:"s3"},
  {id:13,type:"RIVER",country:"NO",name:"Sjoa · Åmot → Harpefoss",river:"Sjoa",region:"Innlandet",distance:"18 km",duration:"4h",difficulty:"Sportif",activities:["Kayak","Rafting"],description:"L'une des meilleures rivières de white-water en Europe.",color:"#dc2626",emoji:"🐺",open:true,coords:[61.680,9.560],path:[[61.650,9.600],[61.680,9.560],[61.710,9.520]]},
  {id:14,type:"RIVER",country:"DE",name:"Rhin · Vallée Romantique",river:"Rhin",region:"Rhénanie",distance:"65 km",duration:"3 jours",difficulty:"Intermédiaire",activities:["Kayak","Canoë"],description:"La vallée du Rhin romantique entre châteaux et vignobles UNESCO.",color:"#dc2626",emoji:"🏰",open:true,coords:[50.180,7.620],path:[[49.967,7.900],[50.180,7.620],[50.356,7.594]]},
  {id:15,type:"RIVER",country:"CH",name:"Aare · Meiringen → Interlaken",river:"Aare",region:"Oberland bernois",distance:"35 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Descente alpine depuis les gorges de Meiringen. Eaux cristallines.",color:"#0891b2",emoji:"🏔️",open:true,coords:[46.690,8.050],path:[[46.723,8.188],[46.690,8.050],[46.683,7.868]]},
  {id:16,type:"RIVER",country:"SK",name:"Dunajec · Gorges · Slovaquie/Pologne",river:"Dunajec",region:"Hautes Tatras",distance:"18 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Canoë","Radeau"],description:"Descente en radeau traditionnel dans les gorges des Tatras. Paysages époustouflants.",color:"#1a9e6e",emoji:"⛵",open:true,coords:[49.408,20.368],path:[[49.420,20.350],[49.408,20.368],[49.390,20.390]]},
  {id:17,type:"RIVER",country:"HU",name:"Danube · Budapest",river:"Danube",region:"Budapest",distance:"20 km",duration:"4h",difficulty:"Facile",activities:["Kayak","Canoë","Bateau électrique"],description:"Pagayer sur le Danube au cœur de Budapest. Vue sur le Parlement et les ponts historiques.",color:"#2563eb",emoji:"🏛️",open:true,coords:[47.497,19.040],path:[[47.510,19.020],[47.497,19.040],[47.480,19.060]]},
  {id:18,type:"RIVER",country:"ES",name:"Sella · Asturie Descente",river:"Sella",region:"Asturies",distance:"16 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Canoë"],description:"Le Descenso del Sella, la plus grande fête du kayak d'Europe. Milliers de participants.",color:"#f59e0b",emoji:"🎉",open:true,coords:[43.365,-5.847],path:[[43.380,-5.870],[43.365,-5.847],[43.350,-5.820]]},
  {id:19,type:"RIVER",country:"GR",name:"Voidomatis · Gorges Vikos",river:"Voidomatis",region:"Épire",distance:"14 km",duration:"3h",difficulty:"Intermédiaire",activities:["Kayak","Rafting"],description:"Rivière aux eaux turquoise dans les gorges les plus profondes d'Europe.",color:"#06b6d4",emoji:"🌿",open:true,coords:[39.890,20.740],path:[[39.900,20.720],[39.890,20.740],[39.875,20.760]]},
  {id:20,type:"RIVER",country:"TR",name:"Köprüçay · Antalya Rafting",river:"Köprüçay",region:"Antalya",distance:"14 km",duration:"3h",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans les gorges du Taurus. L'activité nautique n°1 en Turquie.",color:"#dc2626",emoji:"🏛️",open:true,coords:[37.120,31.070],path:[[37.130,31.050],[37.120,31.070],[37.110,31.090]]},
  {id:21,type:"RIVER",country:"SE",name:"Klarälven · Värmland Canoë",river:"Klarälven",region:"Värmland",distance:"100 km",duration:"5 jours",difficulty:"Facile",activities:["Canoë","Camping","Pêche"],description:"Construire son propre radeau et dériver sur le Klarälven en Suède. Expérience unique.",color:"#16a34a",emoji:"🌲",open:true,coords:[59.800,13.500],path:[[60.100,13.400],[59.800,13.500],[59.500,13.600]]},
  {id:22,type:"RIVER",country:"FI",name:"Ounasjoki · Laponie",river:"Ounasjoki",region:"Laponie",distance:"50 km",duration:"3 jours",difficulty:"Facile",activities:["Canoë","Camping","Pêche"],description:"Pagayer en Laponie finlandaise sous le soleil de minuit. Rennes et aurores boréales.",color:"#7c3aed",emoji:"🦌",open:true,coords:[67.500,25.700],path:[[68.000,25.500],[67.500,25.700],[67.000,25.900]]},
  // Lacs Europe
  {id:23,type:"LAKE",country:"CH",name:"Lac Léman · Lausanne → Genève",river:"Lac Léman",region:"Vaud",distance:"60 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Voile","SUP"],description:"Le plus grand lac d'Europe occidentale entre vignobles UNESCO et Alpes.",color:"#2563eb",emoji:"🍇",open:true,coords:[46.500,6.600],path:[[46.520,6.635],[46.500,6.600],[46.206,6.142]]},
  {id:24,type:"LAKE",country:"AT",name:"Hallstätter See · Autriche",river:"Hallstätter See",region:"Haute-Autriche",distance:"8 km",duration:"2h",difficulty:"Facile",activities:["Kayak","SUP","Baignade"],description:"L'un des plus beaux lacs du monde au cœur des Alpes autrichiennes. Village UNESCO.",color:"#06b6d4",emoji:"🏘️",open:true,coords:[47.562,13.649],path:[[47.580,13.630],[47.562,13.649],[47.540,13.660]]},
  {id:25,type:"LAKE",country:"IT",name:"Lac de Garde · Kitesurf",river:"Lago di Garda",region:"Trentin",distance:"20 km",duration:"4h",difficulty:"Intermédiaire",activities:["Kayak","Voile","Kitesurf","SUP"],description:"Le paradis du kitesurf en Europe. Vents réguliers garantis entre les montagnes.",color:"#f97316",emoji:"🌬️",open:true,coords:[45.886,10.840],path:[[45.900,10.820],[45.886,10.840],[45.870,10.860]]},
  {id:26,type:"LAKE",country:"IS",name:"Þingvallavatn · Islande",river:"Þingvallavatn",region:"Suðurland",distance:"12 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Plongée","SUP"],description:"Plongée unique dans les failles tectoniques entre deux continents.",color:"#7c3aed",emoji:"🌋",open:true,coords:[64.183,-21.117],path:[[64.190,-21.130],[64.183,-21.117],[64.175,-21.100]]},
  // Côtes Europe
  {id:27,type:"SEA",country:"HR",name:"Îles Dalmates · Croatie",river:"Mer Adriatique",region:"Dalmatie",distance:"40 km",duration:"3 jours",difficulty:"Intermédiaire",activities:["Kayak","Voile","Plongée","Baignade"],description:"Longer les îles dalmates en kayak. Criques secrètes et eau turquoise.",color:"#06b6d4",emoji:"⛵",open:true,coords:[43.508,16.440],path:[[43.520,16.420],[43.508,16.440],[43.490,16.460]]},
  {id:28,type:"SEA",country:"GR",name:"Îles Ioniques · Kayak",river:"Mer Ionienne",region:"Îles Ioniennes",distance:"30 km",duration:"2 jours",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Pagayer entre les îles grecques aux eaux cristallines. Grottes marines et plages sauvages.",color:"#2563eb",emoji:"🏛️",open:true,coords:[38.620,20.630],path:[[38.630,20.610],[38.620,20.630],[38.605,20.655]]},
  {id:29,type:"SEA",country:"NO",name:"Fjords de Norvège · Sognefjord",river:"Sognefjord",region:"Vestland",distance:"50 km",duration:"3 jours",difficulty:"Intermédiaire",activities:["Kayak","Camping"],description:"Pagayer dans les fjords entre cascades et villages colorés.",color:"#1a9e6e",emoji:"🏔️",open:true,coords:[61.050,6.850],path:[[61.070,6.820],[61.050,6.850],[61.030,6.880]]},
  {id:30,type:"SEA",country:"PT",name:"Algarve · Grottes Marines",river:"Côte Algarve",region:"Algarve",distance:"15 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Les grottes et arches naturelles de l'Algarve. Falaises dorées spectaculaires.",color:"#f59e0b",emoji:"🌊",open:true,coords:[37.085,-8.668],path:[[37.090,-8.680],[37.085,-8.668],[37.078,-8.655]],sponsoredRegion:"s5"},
  {id:31,type:"SEA",country:"ES",name:"Costa Brava · Kayak",river:"Méditerranée",region:"Catalogne",distance:"20 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","SUP","Baignade"],description:"Les calanques et criques sauvages de la Costa Brava en kayak.",color:"#f59e0b",emoji:"🌞",open:true,coords:[41.820,3.060],path:[[41.830,3.040],[41.820,3.060],[41.808,3.080]]},

  // ═══ AMÉRIQUES ═══
  {id:32,type:"RIVER",country:"US",name:"Colorado · Grand Canyon",river:"Colorado",region:"Arizona",distance:"360 km",duration:"2 semaines",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"L'expédition ultime dans le Grand Canyon.",color:"#f97316",emoji:"🏜️",open:true,coords:[36.100,-112.100],path:[[36.868,-111.590],[36.100,-112.100],[35.780,-114.048]]},
  {id:33,type:"RIVER",country:"US",name:"Snake River · Grand Teton",river:"Snake River",region:"Wyoming",distance:"25 km",duration:"4h",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting avec vue sur les Grand Tetons. Aigles et orignaux.",color:"#a16207",emoji:"🦅",open:true,coords:[43.480,-110.760],path:[[43.640,-110.700],[43.480,-110.760],[43.290,-110.800]]},
  {id:34,type:"RIVER",country:"CA",name:"Nahanni · Virginia Falls",river:"Nahanni",region:"Territoires du Nord-Ouest",distance:"300 km",duration:"10 jours",difficulty:"Sportif",activities:["Kayak","Canoë","Camping"],description:"Top 10 mondial. Chutes deux fois plus hautes que Niagara.",color:"#7c3aed",emoji:"🐻",open:true,coords:[61.600,-125.700],path:[[61.900,-125.000],[61.600,-125.700],[61.050,-123.390]]},
  {id:35,type:"RIVER",country:"BR",name:"Amazone · Manaus",river:"Amazone",region:"Amazonas",distance:"150 km",duration:"5 jours",difficulty:"Facile",activities:["Bateau électrique","Canoë","Camping"],description:"S'enfoncer dans la jungle amazonienne depuis Manaus.",color:"#16a34a",emoji:"🦜",open:true,coords:[-3.100,-60.025],path:[[-3.100,-60.025],[-3.800,-62.500]]},
  {id:36,type:"RIVER",country:"CO",name:"Río Caño Cristales · Rivière Arc-en-ciel",river:"Caño Cristales",region:"Meta",distance:"8 km",duration:"2h",difficulty:"Facile",activities:["Kayak","Baignade","SUP"],description:"La rivière aux 5 couleurs. Algues rouges, jaunes et vertes. La plus belle rivière du monde.",color:"#dc2626",emoji:"🌈",open:true,coords:[2.270,-73.780],path:[[2.275,-73.790],[2.270,-73.780],[2.262,-73.768]]},
  {id:37,type:"RIVER",country:"PE",name:"Apurímac · Source de l'Amazone",river:"Apurímac",region:"Cusco",distance:"80 km",duration:"4 jours",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"Descendre la source de l'Amazone dans les Andes. Rapides classe IV/V.",color:"#f97316",emoji:"🦙",open:true,coords:[-13.500,-72.800],path:[[-13.200,-72.600],[-13.500,-72.800],[-13.800,-73.100]]},
  {id:38,type:"RIVER",country:"CL",name:"Futaleufú · Patagonie",river:"Futaleufú",region:"Los Lagos",distance:"20 km",duration:"2 jours",difficulty:"Sportif",activities:["Rafting","Kayak"],description:"Top 5 mondial white water. Eaux turquoise en Patagonie.",color:"#06b6d4",emoji:"🏔️",open:true,coords:[-43.200,-71.860],path:[[-43.100,-71.780],[-43.200,-71.860],[-43.350,-71.920]]},
  {id:39,type:"RIVER",country:"AR",name:"Río Limay · Patagonie Argentine",river:"Río Limay",region:"Neuquén",distance:"40 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Kayak","Rafting","Camping"],description:"Descente en Patagonie argentine entre volcans enneigés et steppes sauvages.",color:"#7c3aed",emoji:"🌋",open:true,coords:[-40.800,-71.200],path:[[-40.700,-71.300],[-40.800,-71.200],[-40.900,-71.100]]},
  {id:40,type:"RIVER",country:"CR",name:"Pacuare · Costa Rica",river:"Río Pacuare",region:"Turrialba",distance:"28 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Rafting","Kayak","Camping"],description:"Le meilleur rafting d'Amérique Centrale. Jungle tropicale et rapides classe III/IV.",color:"#16a34a",emoji:"🐊",open:true,coords:[9.900,-83.680],path:[[9.920,-83.700],[9.900,-83.680],[9.875,-83.650]]},
  {id:41,type:"RIVER",country:"EC",name:"Río Napo · Amazonie Équateur",river:"Río Napo",region:"Orellana",distance:"50 km",duration:"3 jours",difficulty:"Facile",activities:["Kayak","Canoë","Camping"],description:"Naviguer dans l'Amazonie équatorienne. Dauphins roses et biodiversité unique.",color:"#1a9e6e",emoji:"🐬",open:true,coords:[-0.460,-76.990],path:[[-0.440,-77.010],[-0.460,-76.990],[-0.490,-76.960]]},
  // Lacs Amériques
  {id:42,type:"LAKE",country:"CA",name:"Lac Louise · Banff",river:"Lac Louise",region:"Alberta",distance:"5 km",duration:"1h30",difficulty:"Facile",activities:["Kayak","Canoë"],description:"L'un des lacs les plus photographiés au monde. Eaux turquoise glaciaires.",color:"#06b6d4",emoji:"🏔️",open:true,coords:[51.416,116.177],path:[[51.420,116.170],[51.416,116.177],[51.412,116.184]]},
  {id:43,type:"LAKE",country:"US",name:"Lac Crater · Oregon",river:"Crater Lake",region:"Oregon",distance:"15 km",duration:"3h",difficulty:"Facile",activities:["Kayak","SUP","Baignade"],description:"Le lac le plus profond des USA dans un cratère volcanique. Eau bleue cobalt extraordinaire.",color:"#2563eb",emoji:"🌋",open:true,coords:[42.940,-122.110],path:[[42.950,-122.125],[42.940,-122.110],[42.928,-122.095]]},
  {id:44,type:"LAKE",country:"PE",name:"Lac Titicaca · Bolivia/Pérou",river:"Lac Titicaca",region:"Puno",distance:"20 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Bateau électrique","Voile"],description:"Le plus haut lac navigable du monde à 3800m. Îles flottantes des Uros.",color:"#0891b2",emoji:"🌄",open:true,coords:[-15.840,-69.330],path:[[-15.820,-69.350],[-15.840,-69.330],[-15.860,-69.310]]},
  // Côtes Amériques
  {id:45,type:"SEA",country:"MX",name:"Riviera Maya · Cenotes",river:"Mer des Caraïbes",region:"Quintana Roo",distance:"8 km",duration:"2h",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Explorer les cenotes et la mer des Caraïbes. Eau turquoise et fonds marins.",color:"#06b6d4",emoji:"🐠",open:true,coords:[20.630,-87.080],path:[[20.640,-87.090],[20.630,-87.080],[20.620,-87.070]]},
  {id:46,type:"SEA",country:"CR",name:"Manuel Antonio · Kayak Mangroves",river:"Pacifique",region:"Puntarenas",distance:"12 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Plongée","Baignade"],description:"Kayak dans les mangroves du parc national Manuel Antonio. Singes et dauphins.",color:"#16a34a",emoji:"🐒",open:true,coords:[9.390,-84.140],path:[[9.400,-84.150],[9.390,-84.140],[9.378,-84.128]]},

  // ═══ ASIE ═══
  {id:47,type:"RIVER",country:"NP",name:"Trisuli · Himalaya",river:"Trisuli",region:"Gandaki",distance:"50 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans l'Himalaya depuis Katmandou.",color:"#dc2626",emoji:"🏔️",open:true,coords:[27.800,84.400],path:[[27.950,84.450],[27.800,84.400],[27.500,84.300]]},
  {id:48,type:"RIVER",country:"NP",name:"Kali Gandaki · Gorges Profondes",river:"Kali Gandaki",region:"Gandaki",distance:"100 km",duration:"5 jours",difficulty:"Sportif",activities:["Kayak","Rafting","Camping"],description:"Les gorges les plus profondes du monde entre Annapurna et Dhaulagiri.",color:"#7c3aed",emoji:"🌄",open:true,coords:[28.400,83.700],path:[[28.700,83.600],[28.400,83.700],[28.100,83.800]]},
  {id:49,type:"RIVER",country:"IN",name:"Ganga · Rishikesh Rafting",river:"Gange",region:"Uttarakhand",distance:"16 km",duration:"3h",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting sacré sur le Gange à Rishikesh. Rapides classe III/IV entre forêts himalayennes.",color:"#f59e0b",emoji:"🕉️",open:true,coords:[30.086,78.296],path:[[30.100,78.270],[30.086,78.296],[30.070,78.320]]},
  {id:50,type:"RIVER",country:"KG",name:"Tchouï · Kirghizistan",river:"Tchouï",region:"Chüy",distance:"30 km",duration:"2 jours",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"Rafting sauvage au Kirghizistan entre montagnes de l'Asie centrale.",color:"#dc2626",emoji:"🏕️",open:true,coords:[42.870,74.590],path:[[42.880,74.560],[42.870,74.590],[42.855,74.620]]},
  {id:51,type:"RIVER",country:"CN",name:"Li River · Yangshuo",river:"Li River",region:"Guangxi",distance:"80 km",duration:"1 journée",difficulty:"Facile",activities:["Bambou","Bateau électrique","Kayak"],description:"Les karsts calcaires de Yangshuo sur la rivière Li. Le paysage chinois par excellence.",color:"#16a34a",emoji:"🐉",open:true,coords:[24.930,110.250],path:[[25.290,110.490],[25.050,110.350],[24.930,110.250]]},
  {id:52,type:"RIVER",country:"JP",name:"Yoshino · Descente Traditionelle",river:"Yoshino",region:"Nara",distance:"12 km",duration:"2h30",difficulty:"Facile",activities:["Kayak","Canoë","Bateau traditionnel"],description:"Descente en bateau traditionnel dans les gorges de Yoshino. Cerisiers en fleur au printemps.",color:"#f97316",emoji:"🌸",open:true,coords:[34.390,135.860],path:[[34.400,135.840],[34.390,135.860],[34.375,135.880]]},
  {id:53,type:"RIVER",country:"TH",name:"Mae Taeng · Chiang Mai",river:"Mae Taeng",region:"Chiang Mai",distance:"15 km",duration:"3h",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans la jungle de Chiang Mai. Éléphants et temples.",color:"#f59e0b",emoji:"🐘",open:true,coords:[19.150,98.680],path:[[19.200,98.650],[19.150,98.680],[19.100,98.710]]},
  // Lacs Asie
  {id:54,type:"LAKE",country:"CN",name:"Lac Jiuzhaigou · Sichuan",river:"Jiuzhaigou",region:"Sichuan",distance:"10 km",duration:"2h",difficulty:"Facile",activities:["Kayak","SUP","Baignade"],description:"Les lacs multicolores de Jiuzhaigou. Eaux turquoise, émeraude et azur dans un cadre féérique.",color:"#06b6d4",emoji:"🌈",open:true,coords:[33.260,103.920],path:[[33.270,103.910],[33.260,103.920],[33.248,103.932]]},
  {id:55,type:"LAKE",country:"LK",name:"Lac Kandy · Sri Lanka",river:"Lac Kandy",region:"Province Centrale",distance:"5 km",duration:"1h30",difficulty:"Facile",activities:["Kayak","SUP","Pédalo"],description:"Tour du lac sacré de Kandy autour du Temple de la Dent du Bouddha.",color:"#f59e0b",emoji:"🛕",open:true,coords:[7.291,80.641],path:[[7.295,80.635],[7.291,80.641],[7.285,80.648]]},
  // Côtes Asie
  {id:56,type:"SEA",country:"VN",name:"Baie d'Halong · Kayak Grottes",river:"Baie d'Halong",region:"Quảng Ninh",distance:"10 km",duration:"2h",difficulty:"Facile",activities:["Kayak","SUP"],description:"Explorer les grottes et criques secrètes de la Baie d'Halong.",color:"#10b981",emoji:"🌅",open:true,coords:[20.910,107.184],path:[[20.920,107.170],[20.910,107.184],[20.900,107.200]]},
  {id:57,type:"SEA",country:"ID",name:"Bali · Surf & SUP",river:"Océan Indien",region:"Bali",distance:"10 km",duration:"2h",difficulty:"Intermédiaire",activities:["Surf","SUP","Plongée"],description:"Les vagues légendaires de Bali pour surfeurs et paddlers.",color:"#f97316",emoji:"🏄",open:true,coords:[-8.409,115.188],path:[[-8.400,115.170],[-8.409,115.188],[-8.420,115.200]]},
  {id:58,type:"SEA",country:"PH",name:"El Nido · Palawan Kayak",river:"Mer de Chine",region:"Palawan",distance:"20 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Les lagons cachés de Palawan en kayak. Parmi les plus belles eaux du monde.",color:"#06b6d4",emoji:"🏝️",open:true,coords:[11.177,119.388],path:[[11.185,119.375],[11.177,119.388],[11.168,119.402]]},
  {id:59,type:"SEA",country:"JP",name:"Îles Kerama · Plongée Kayak",river:"Mer de Chine",region:"Okinawa",distance:"15 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Les eaux cristallines d'Okinawa. Tortues et coraux parmi les plus beaux d'Asie.",color:"#0891b2",emoji:"🐢",open:true,coords:[26.213,127.268],path:[[26.220,127.255],[26.213,127.268],[26.205,127.282]]},

  // ═══ AFRIQUE ═══
  {id:60,type:"RIVER",country:"ZM",name:"Zambèze · Chutes Victoria",river:"Zambèze",region:"Livingstone",distance:"70 km",duration:"3 jours",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"Rafting sous les embruns des Chutes Victoria. Hippopotames et rapides classe V.",color:"#f97316",emoji:"🦁",open:true,coords:[-17.930,25.856],path:[[-17.930,25.856],[-16.000,29.000]]},
  {id:61,type:"RIVER",country:"UG",name:"Nil Blanc · Source du Nil",river:"Nil Blanc",region:"Jinja",distance:"12 km",duration:"1 journée",difficulty:"Sportif",activities:["Rafting","Kayak"],description:"Rafting à la source du Nil. Meilleur white water d'Afrique.",color:"#1a9e6e",emoji:"🐊",open:true,coords:[0.450,33.200],path:[[0.380,33.180],[0.450,33.200],[0.520,33.220]]},
  {id:62,type:"RIVER",country:"MA",name:"Ahansal · Haut Atlas",river:"Ahansal",region:"Azilal",distance:"30 km",duration:"2 jours",difficulty:"Sportif",activities:["Kayak","Canyoning"],description:"Gorges sauvages du Haut Atlas marocain entre parois rouges.",color:"#dc2626",emoji:"🐪",open:true,coords:[31.800,-6.200],path:[[31.900,-6.100],[31.800,-6.200],[31.700,-6.300]]},
  {id:63,type:"RIVER",country:"ET",name:"Omo River · Éthiopie Sauvage",river:"Omo River",region:"SNNP",distance:"80 km",duration:"5 jours",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"Expédition sauvage sur l'Omo. Tribus ancestrales et hippopotames.",color:"#f59e0b",emoji:"🦛",open:true,coords:[5.800,36.100],path:[[6.100,36.000],[5.800,36.100],[5.400,36.200]]},
  {id:64,type:"RIVER",country:"KE",name:"Tana River · Kenya",river:"Tana River",region:"Tana River County",distance:"40 km",duration:"2 jours",difficulty:"Intermédiaire",activities:["Rafting","Kayak","Safari"],description:"Descente du Tana River avec safari aquatique. Crocodiles, hippopotames et aigles pêcheurs.",color:"#16a34a",emoji:"🦒",open:true,coords:[-0.500,40.100],path:[[-0.450,40.050],[-0.500,40.100],[-0.560,40.160]]},
  // Lacs Afrique
  {id:65,type:"LAKE",country:"TZ",name:"Lac Malawi · Plongée Kayak",river:"Lac Malawi",region:"Tanzanie/Malawi",distance:"25 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","Baignade","SUP"],description:"Le lac des poissons arc-en-ciel. Milliers d'espèces de cichlidés endémiques.",color:"#06b6d4",emoji:"🐟",open:true,coords:[-11.500,34.600],path:[[-11.480,34.580],[-11.500,34.600],[-11.520,34.622]]},
  {id:66,type:"LAKE",country:"MG",name:"Lac Vert · Madagascar",river:"Lac Vert",region:"Antananarivo",distance:"8 km",duration:"2h",difficulty:"Facile",activities:["Kayak","SUP","Baignade"],description:"Lac volcanique aux eaux vertes au cœur de Madagascar. Lémuriens sur les rives.",color:"#16a34a",emoji:"🦎",open:true,coords:[-19.100,47.000],path:[[-19.090,46.990],[-19.100,47.000],[-19.112,47.012]]},
  // Côtes Afrique
  {id:67,type:"SEA",country:"ZA",name:"Cape Town · Kayak Baleines",river:"Océan Atlantique",region:"Western Cape",distance:"12 km",duration:"3h",difficulty:"Facile",activities:["Kayak","Plongée","Baignade"],description:"Kayak avec pingouins et baleines. Table Mountain en toile de fond.",color:"#7c3aed",emoji:"🐋",open:true,coords:[-34.357,18.474],path:[[-34.340,18.460],[-34.357,18.474],[-34.370,18.490]]},
  {id:68,type:"SEA",country:"MA",name:"Essaouira · Kitesurf Atlantique",river:"Océan Atlantique",region:"Marrakech-Safi",distance:"10 km",duration:"2h",difficulty:"Intermédiaire",activities:["Kitesurf","Surf","SUP"],description:"La capitale mondiale du kitesurf. Vents d'alizés constants toute l'année.",color:"#f59e0b",emoji:"🪁",open:true,coords:[31.512,-9.770],path:[[31.520,-9.785],[31.512,-9.770],[31.502,-9.755]]},

  // ═══ OCÉANIE ═══
  {id:69,type:"RIVER",country:"NZ",name:"Whanganui · Great Journey",river:"Whanganui",region:"Manawatū",distance:"145 km",duration:"5 jours",difficulty:"Facile",activities:["Canoë","Kayak","Camping"],description:"L'une des Great Walks de Nouvelle-Zélande sur l'eau.",color:"#16a34a",emoji:"🥝",open:true,coords:[-39.600,174.800],path:[[-38.900,175.100],[-39.600,174.800],[-39.960,175.049]]},
  {id:70,type:"RIVER",country:"AU",name:"Franklin · Tasmanie Sauvage",river:"Franklin River",region:"Tasmanie",distance:"80 km",duration:"7 jours",difficulty:"Sportif",activities:["Rafting","Kayak","Camping"],description:"La Franklin en Tasmanie — dernière rivière vraiment sauvage. Expédition mythique.",color:"#7c3aed",emoji:"🦘",open:true,coords:[-42.500,145.800],path:[[-42.200,145.900],[-42.500,145.800],[-42.800,145.700]]},
  {id:71,type:"RIVER",country:"NZ",name:"Buller · Murchison Gorges",river:"Buller River",region:"Tasman",distance:"22 km",duration:"4h",difficulty:"Intermédiaire",activities:["Rafting","Kayak"],description:"Rafting dans les gorges sauvages de la Buller River. La meilleure rivière de Nouvelle-Zélande.",color:"#dc2626",emoji:"🌿",open:true,coords:[-41.800,172.020],path:[[-41.780,171.990],[-41.800,172.020],[-41.825,172.055]]},
  // Lacs Océanie
  {id:72,type:"LAKE",country:"NZ",name:"Lac Taupo · Île du Nord",river:"Lac Taupo",region:"Waikato",distance:"25 km",duration:"5h",difficulty:"Facile",activities:["Kayak","SUP","Voile","Pêche"],description:"Le plus grand lac de NZ formé par un supervolcan. Eaux cristallines.",color:"#16a34a",emoji:"🌋",open:true,coords:[-38.780,175.977],path:[[-38.760,175.950],[-38.780,175.977],[-38.800,176.000]]},
  {id:73,type:"LAKE",country:"AU",name:"Lac Eyre · Australie Centrale",river:"Kati Thanda",region:"Australie du Sud",distance:"20 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","SUP"],description:"Le plus grand lac d'Australie, recouvert d'eau seulement quelques années par décennie. Phénomène rare.",color:"#f59e0b",emoji:"🦢",open:true,coords:[-28.700,137.300],path:[[-28.680,137.280],[-28.700,137.300],[-28.722,137.322]]},
  // Côtes Océanie
  {id:74,type:"SEA",country:"AU",name:"Great Barrier Reef · Kayak",river:"Mer de Corail",region:"Queensland",distance:"20 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","SUP","Baignade"],description:"Pagayer au-dessus de la plus grande barrière de corail. Tortues et poissons tropicaux.",color:"#10b981",emoji:"🐢",open:true,coords:[-18.286,147.699],path:[[-18.270,147.680],[-18.286,147.699],[-18.300,147.720]]},
  {id:75,type:"SEA",country:"FJ",name:"Fidji · Kayak Îles",river:"Océan Pacifique",region:"Viti Levu",distance:"15 km",duration:"1 journée",difficulty:"Facile",activities:["Kayak","Plongée","SUP","Baignade"],description:"Pagayer entre les îles paradisiaques des Fidji. Récifs coralliens et villages traditionnels.",color:"#06b6d4",emoji:"🌴",open:true,coords:[-17.713,178.065],path:[[-17.700,178.050],[-17.713,178.065],[-17.728,178.080]]},
  {id:76,type:"SEA",country:"PF",name:"Tahiti · Lagon SUP",river:"Océan Pacifique",region:"Polynésie française",distance:"10 km",duration:"2h",difficulty:"Facile",activities:["SUP","Kayak","Plongée","Baignade"],description:"SUP dans le lagon de Tahiti. Eaux chaudes transparentes et raies manta.",color:"#7c3aed",emoji:"🌺",open:true,coords:[-17.650,-149.433],path:[[-17.640,-149.445],[-17.650,-149.433],[-17.663,-149.420]]},
];

const EMPTY_FORM = { name:"", river:"", country:"BE", region:"", distance:"", duration:"", difficulty:"Facile", activities:[], description:"", coords:"", emoji:"🛶", type:"RIVER" };

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

function BookingModal({ provider, onClose }) {
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [done, setDone] = useState(false);
  const confirm = () => { if (!date) return; setDone(true); setTimeout(() => onClose(), 3500); };
  return (
    <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"18px",padding:"22px",maxWidth:"400px",width:"100%",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
        {done ? (
          <div style={{textAlign:"center",padding:"20px 0"}}><div style={{fontSize:"2.8rem",marginBottom:"10px"}}>🎉</div><h3 style={{color:"#a8edcf",fontSize:"1rem",marginBottom:"6px"}}>Réservation confirmée !</h3><p style={{color:"#5a8a78",fontSize:"0.82rem"}}>Confirmation de <strong style={{color:"#a8edcf"}}>{provider.name}</strong> sous 24h.</p></div>
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
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"3px"}}><span style={{color:"#5a8a78",fontSize:"0.76rem"}}>{pax} × {provider.price}{provider.currency}</span><span style={{color:"#a8edcf",fontWeight:700,fontSize:"0.86rem"}}>{(pax*provider.price).toFixed(2)}{provider.currency}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#3a6a5a",fontSize:"0.68rem"}}>Commission FleuVibe ({provider.commission}%)</span><span style={{color:"#3a8a60",fontSize:"0.68rem"}}>{(pax*provider.price*provider.commission/100).toFixed(2)}{provider.currency}</span></div>
              </div>
              <button onClick={confirm} style={{padding:"10px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.86rem",cursor:"pointer",boxShadow:"0 3px 12px rgba(26,158,110,0.25)"}}>✅ Confirmer</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubmitModal({ onClose, onAdd, session, showAuth }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const f = (k,v) => setForm(x=>({...x,[k]:v}));
  const submit = () => {
    if (!form.name||!form.river) return;
    if (!session) { showAuth(); return; }
    const c = form.coords.split(",").map(s=>parseFloat(s.trim()));
    const newSpot = { ...form, id:Date.now(), open:true, color:"#1a9e6e", verified:false, coords:c.length===2&&!isNaN(c[0])?c:[0,0], path:c.length===2?[[c[0]-0.05,c[1]-0.05],c,[c[0]+0.05,c[1]+0.05]]:[], activities:form.activities.length?form.activities:["Kayak"], tags:["Communauté"] };
    onAdd(newSpot);
    setSubmitted(true);
    setTimeout(()=>{setSubmitted(false);onClose();},2500);
  };
  const inp = {width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(26,158,110,0.2)",borderRadius:"9px",color:"#e8f4f0",fontSize:"0.83rem",outline:"none"};
  const lbl = {display:"block",color:"#6a9a8c",fontSize:"0.73rem",marginBottom:"4px",fontWeight:500};
  return (
    <div className="modal-bg" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.28)",borderRadius:"18px",padding:"20px",maxWidth:"480px",width:"100%",maxHeight:"88vh",overflowY:"auto",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.55)"}}>
        {submitted ? (
          <div style={{textAlign:"center",padding:"28px 0"}}><div style={{fontSize:"2.8rem",marginBottom:"10px"}}>🎉</div><h3 style={{color:"#a8edcf",fontSize:"1.1rem",marginBottom:"6px"}}>Spot ajouté !</h3><p style={{color:"#5a8a78",fontSize:"0.84rem"}}>Merci pour ta contribution à FleuVibe !</p></div>
        ) : (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
              <h2 style={{fontSize:"1rem",fontWeight:700,color:"#daf0e8"}}>➕ Ajouter un spot</h2>
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"#5a8a78",borderRadius:"7px",padding:"4px 8px",cursor:"pointer"}}>✕</button>
            </div>
            {!session&&<div style={{padding:"9px 12px",background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.22)",borderRadius:"9px",color:"#fbbf24",fontSize:"0.78rem",marginBottom:"12px"}}>🔐 Tu devras être connecté pour soumettre un spot.</div>}
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div>
                <label style={lbl}>Type de plan d'eau</label>
                <div style={{display:"flex",gap:"5px"}}>
                  {Object.entries(WATER_TYPES).filter(([k])=>k!=="ALL").map(([code,wt])=>(
                    <button key={code} onClick={()=>f("type",code)} style={{flex:1,padding:"7px",borderRadius:"8px",border:`1px solid ${form.type===code?wt.color:"rgba(255,255,255,0.08)"}`,background:form.type===code?`${wt.color}18`:"rgba(255,255,255,0.02)",color:form.type===code?wt.color:"#4a7a6a",fontSize:"0.73rem",fontWeight:600,cursor:"pointer"}}>{wt.icon} {wt.name.split(" ")[0]}</button>
                  ))}
                </div>
              </div>
              {[["Nom du spot *","name","text","Ex: Lesse · Houyet → Anseremme"],["Rivière / Lac / Mer *","river","text","Ex: Lesse"],["Région","region","text","Ex: Wallonie"],["Distance","distance","text","Ex: 21 km"],["Durée","duration","text","Ex: 4–5h"],["Coordonnées GPS (lat, lng)","coords","text","Ex: 50.185, 5.002"],["Description","description","textarea","Décris ce spot..."]].map(([label,key,type,ph])=>(
                <div key={key}>
                  <label style={lbl}>{label}</label>
                  {type==="textarea"?<textarea value={form[key]} onChange={e=>f(key,e.target.value)} placeholder={ph} rows={2} style={{...inp,resize:"vertical"}}/>:<input value={form[key]} onChange={e=>f(key,e.target.value)} placeholder={ph} style={inp}/>}
                </div>
              ))}
              <div>
                <label style={lbl}>Pays</label>
                <select value={form.country} onChange={e=>f("country",e.target.value)} style={{...inp,background:"#0d2240"}}>
                  {Object.entries(COUNTRIES).sort((a,b)=>a[1].name.localeCompare(b[1].name)).map(([code,c])=><option key={code} value={code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Difficulté</label>
                <div style={{display:"flex",gap:"5px"}}>
                  {["Facile","Intermédiaire","Sportif"].map(d=><button key={d} onClick={()=>f("difficulty",d)} style={{flex:1,padding:"7px",borderRadius:"8px",border:`1px solid ${form.difficulty===d?DIFF_COLOR[d]:"rgba(255,255,255,0.07)"}`,background:form.difficulty===d?`${DIFF_COLOR[d]}18`:"rgba(255,255,255,0.02)",color:form.difficulty===d?DIFF_COLOR[d]:"#4a7a6a",fontSize:"0.73rem",fontWeight:600,cursor:"pointer"}}>{d}</button>)}
                </div>
              </div>
              <div>
                <label style={lbl}>Activités</label>
                <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                  {["Kayak","Canoë","SUP","Rafting","Surf","Voile","Kitesurf","Plongée","Baignade","Camping","Pêche"].map(a=>{const sel=form.activities.includes(a);return<button key={a} onClick={()=>f("activities",sel?form.activities.filter(x=>x!==a):[...form.activities,a])} style={{padding:"4px 9px",borderRadius:"8px",border:`1px solid ${sel?"#1a9e6e":"rgba(255,255,255,0.07)"}`,background:sel?"rgba(26,158,110,0.16)":"rgba(255,255,255,0.02)",color:sel?"#a8edcf":"#4a7a6a",fontSize:"0.71rem",fontWeight:500,cursor:"pointer"}}>{a}</button>;})}
                </div>
              </div>
              <button onClick={submit} style={{padding:"10px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"10px",color:"#fff",fontWeight:700,fontSize:"0.86rem",cursor:"pointer",boxShadow:"0 3px 12px rgba(26,158,110,0.25)",marginTop:"3px"}}>🌊 Soumettre le spot</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// APP
export default function FleuVibe() {
  const [routes, setRoutes] = useState(BASE_ROUTES);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [authPage, setAuthPage] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [authForm, setAuthForm] = useState({email:"",password:"",fullName:""});
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [page, setPage] = useState("explore");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [continent, setContinent] = useState("ALL");
  const [waterType, setWaterType] = useState("ALL");
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

  const filteredRoutes = routes.filter(r=>{
    if(page==="favorites")return favorites.includes(r.id);
    if(waterType!=="ALL"&&r.type!==waterType)return false;
    if(continent!=="ALL"&&COUNTRIES[r.country]?.continent!==continent)return false;
    if(search&&!r.name.toLowerCase().includes(search.toLowerCase())&&!r.river.toLowerCase().includes(search.toLowerCase())&&!COUNTRIES[r.country]?.name.toLowerCase().includes(search.toLowerCase()))return false;
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
  const communityCount = routes.filter(r=>!r.verified&&r.id>1000).length;

  const RouteCard=({route,i})=>{
    const isSel=selectedRoute?.id===route.id;
    const isFav=favorites.includes(route.id);
    const routeProviders=PROVIDERS.filter(p=>p.routeIds.includes(route.id));
    const region=SPONSORED_REGIONS.find(s=>s.id===route.sponsoredRegion);
    const typeInfo=WATER_TYPES[route.type]||WATER_TYPES.RIVER;
    return(
      <div className={`card fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.08+Math.min(i,15)*0.03}s`}} onClick={()=>setSelectedRoute(r=>r?.id===route.id?null:route)}>
        <div style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${isSel?route.color+"55":"rgba(255,255,255,0.06)"}`,borderRadius:"13px",overflow:"hidden",boxShadow:isSel?`0 0 18px ${route.color}10`:"none"}}>
          <div style={{height:"2.5px",background:`linear-gradient(90deg,${route.color},transparent)`}}/>
          {region&&<div style={{padding:"3px 12px",background:`${region.color}10`,borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:"0.62rem",color:region.color,fontWeight:700}}>⭐ {region.name.toUpperCase()}</div>}
          <div style={{padding:"12px 13px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"1.05rem"}}>{route.emoji}</span>
                  <h3 style={{fontSize:"0.88rem",fontWeight:700,color:"#daf0e8"}}>{route.name}</h3>
                  <span style={{fontSize:"0.8rem"}}>{COUNTRIES[route.country]?.flag}</span>
                  <span style={{padding:"1px 5px",background:`${typeInfo.color}18`,border:`1px solid ${typeInfo.color}30`,borderRadius:"6px",fontSize:"0.6rem",color:typeInfo.color,fontWeight:600}}>{typeInfo.icon}</span>
                  {!route.verified&&route.id>1000&&<span style={{fontSize:"0.6rem",background:"rgba(245,158,11,0.12)",color:"#fbbf24",border:"1px solid rgba(245,158,11,0.22)",borderRadius:"5px",padding:"1px 4px"}}>Communauté</span>}
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
                          <div><div style={{fontSize:"0.78rem",fontWeight:600,color:"#c8e8d8"}}>{p.emoji} {p.name}</div><div style={{fontSize:"0.67rem",color:"#3a6a5a"}}>{"⭐".repeat(Math.floor(p.rating))} {p.rating} ({p.reviews})</div></div>
                          <button className="btn" onClick={e=>{e.stopPropagation();setBookingProvider(p);}} style={{padding:"6px 12px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.74rem"}}>
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
        input:focus,textarea:focus,select:focus{border-color:rgba(26,158,110,0.55)!important;outline:none}
        select option{background:#0d2240}
      `}</style>

      <div style={{position:"fixed",bottom:0,left:0,width:"100%",height:"130px",overflow:"hidden",opacity:0.07,pointerEvents:"none",zIndex:0}}>
        <div className="wave-bg" style={{display:"flex",width:"200%"}}>
          {[0,1].map(i=><svg key={i} viewBox="0 0 1440 130" style={{width:"50%",minWidth:"720px"}} fill="#1a9e6e"><path d="M0,65 C240,110 480,20 720,65 C960,110 1200,20 1440,65 L1440,130 L0,130 Z"/></svg>)}
        </div>
      </div>

      <div style={{position:"relative",zIndex:1,maxWidth:"980px",margin:"0 auto",padding:"14px 14px"}}>

        {/* HEADER */}
        <div className={`fade-in ${loaded?"loaded":""}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <span style={{fontSize:"1.6rem",animation:"float 3s ease-in-out infinite"}}>🌊</span>
            <h1 style={{fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:800,letterSpacing:"-0.5px",background:"linear-gradient(135deg,#a8edcf 0%,#1a9e6e 50%,#38bdf8 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>FleuVibe</h1>
            <span style={{background:"rgba(26,158,110,0.2)",border:"1px solid rgba(26,158,110,0.4)",borderRadius:"6px",padding:"2px 6px",fontSize:"0.6rem",color:"#7ecfb0",fontWeight:700}}>WORLD</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            <button className="btn" onClick={()=>setShowSubmit(true)} style={{padding:"7px 12px",background:"rgba(26,158,110,0.12)",border:"1px solid rgba(26,158,110,0.28)",borderRadius:"9px",color:"#7ecfb0",fontSize:"0.76rem",fontWeight:600}}>
              ➕ Ajouter{communityCount>0?` · ${communityCount}🌟`:""}
            </button>
            {session?(
              <button className="btn" onClick={()=>setShowProfile(true)} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 12px",background:"rgba(26,158,110,0.15)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"9px",color:"#a8edcf",fontSize:"0.79rem",fontWeight:600}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.78rem",fontWeight:700,color:"#fff"}}>{userName[0].toUpperCase()}</div>
                {userName}
              </button>
            ):(
              <button className="btn" onClick={()=>setShowAuth(true)} style={{padding:"7px 14px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",borderRadius:"9px",color:"#fff",fontWeight:700,fontSize:"0.78rem",boxShadow:"0 3px 10px rgba(26,158,110,0.25)"}}>🔐 Connexion</button>
            )}
          </div>
        </div>

        {/* STATS BAR */}
        <div className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:"0.04s",display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
          {[
            [`🌊 ${routes.length}`, "spots"],
            [`🌍 ${Object.keys(COUNTRIES).length}`, "pays"],
            [`🏞️ ${routes.filter(r=>r.type==="RIVER").length}`, "rivières"],
            [`🏔️ ${routes.filter(r=>r.type==="LAKE").length}`, "lacs"],
            [`🌊 ${routes.filter(r=>r.type==="SEA").length}`, "côtes"],
          ].map(([val,label])=>(
            <div key={label} style={{flex:1,minWidth:"70px",padding:"7px 10px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",textAlign:"center"}}>
              <div style={{fontSize:"0.82rem",fontWeight:700,color:"#a8edcf"}}>{val}</div>
              <div style={{fontSize:"0.62rem",color:"#3a6a5a"}}>{label}</div>
            </div>
          ))}
        </div>

        {/* NAV */}
        <div className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:"0.06s",display:"flex",gap:"4px",marginBottom:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"13px",padding:"4px",flexWrap:"wrap"}}>
          {[["explore","🗺️ Explorer"],["providers","🛶 Prestataires"],["tourism","⭐ Destinations"],["weather","🌤️ Météo"],["favorites",`❤️${favorites.length>0?` (${favorites.length})`:""}`]].map(([id,label])=>(
            <button key={id} className="btn" onClick={()=>{setPage(id);setSearch("");}} style={{flex:1,minWidth:"65px",padding:"8px 5px",borderRadius:"9px",background:page===id?"rgba(26,158,110,0.22)":"transparent",border:page===id?"1px solid rgba(26,158,110,0.4)":"1px solid transparent",color:page===id?"#a8edcf":"#4a7a6a",fontSize:"0.73rem",fontWeight:page===id?700:500}}>{label}</button>
          ))}
        </div>

        {/* EXPLORE */}
        {page==="explore"&&(
          <div>
            {/* Water type */}
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"center",marginBottom:"9px"}}>
              {Object.entries(WATER_TYPES).map(([code,wt])=>{
                const count=code==="ALL"?routes.length:routes.filter(r=>r.type===code).length;
                return <button key={code} className="btn" onClick={()=>setWaterType(code)} style={{padding:"5px 11px",borderRadius:"9px",background:waterType===code?`${wt.color}20`:"rgba(255,255,255,0.03)",border:`1px solid ${waterType===code?wt.color:"rgba(255,255,255,0.07)"}`,color:waterType===code?wt.color:"#4a7a6a",fontSize:"0.73rem",fontWeight:600}}>{wt.icon} {wt.name} ({count})</button>;
              })}
            </div>

            {/* Continent */}
            <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"center",marginBottom:"10px"}}>
              {Object.entries(CONTINENTS).map(([code,c])=>{
                const count=code==="ALL"?filteredRoutes.length:routes.filter(r=>COUNTRIES[r.country]?.continent===code&&(waterType==="ALL"||r.type===waterType)).length;
                return <button key={code} className="btn" onClick={()=>setContinent(code)} style={{padding:"4px 9px",borderRadius:"8px",background:continent===code?"rgba(26,158,110,0.18)":"rgba(255,255,255,0.02)",border:`1px solid ${continent===code?"#1a9e6e":"rgba(255,255,255,0.06)"}`,color:continent===code?"#a8edcf":"#4a7a6a",fontSize:"0.69rem",fontWeight:600}}>{c.flag} {c.name} ({count})</button>;
              })}
            </div>

            <div style={{display:"flex",gap:"7px",marginBottom:"10px"}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Rechercher..." style={{...inp,flex:1}}/>
              <div style={{display:"flex",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",overflow:"hidden"}}>
                {[["list","📋"],["map","🗺️"]].map(([v,ic])=><button key={v} className="btn" onClick={()=>setView(v)} style={{padding:"0 12px",background:view===v?"rgba(26,158,110,0.25)":"transparent",color:view===v?"#a8edcf":"#4a7a6a",fontSize:"0.95rem"}}>{ic}</button>)}
              </div>
            </div>

            <div style={{color:"#2a5a4a",fontSize:"0.7rem",marginBottom:"10px"}}>{filteredRoutes.length} spots · {[...new Set(filteredRoutes.map(r=>r.country))].length} pays</div>

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
                    <WeatherBadge coords={selectedRoute.coords}/>
                    <ReviewsSection route={selectedRoute} session={session} userName={userName}/>
                  </div>
                )}
              </div>
            )}
            {view==="list"&&(
              <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                {filteredRoutes.length===0?<div style={{textAlign:"center",padding:"40px",color:"#3a6a5a"}}><div style={{fontSize:"2.5rem",marginBottom:"10px"}}>🌊</div><p style={{marginBottom:"12px"}}>Aucun spot trouvé.</p><button className="btn" onClick={()=>setShowSubmit(true)} style={{padding:"8px 16px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"9px",color:"#fff",fontWeight:700,fontSize:"0.8rem"}}>➕ Ajouter le premier</button></div>:filteredRoutes.map((r,i)=><RouteCard key={r.id} route={r} i={i}/>)}
              </div>
            )}
          </div>
        )}

        {/* PROVIDERS */}
        {page==="providers"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:"15px"}}><h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#a8edcf",marginBottom:"4px"}}>🛶 Prestataires</h2><p style={{color:"#4a7a6a",fontSize:"0.79rem"}}>Clubs, guides et loueurs partenaires FleuVibe</p></div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {PROVIDERS.map((p,i)=>(
                <div key={p.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.08+i*0.04}s`,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"13px",overflow:"hidden"}}>
                  <div style={{height:"2.5px",background:`linear-gradient(90deg,${PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"},transparent)`}}/>
                  <div style={{padding:"13px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px",flexWrap:"wrap"}}>
                          <span style={{fontSize:"1.15rem"}}>{p.emoji}</span>
                          <h3 style={{fontSize:"0.88rem",fontWeight:700,color:"#daf0e8"}}>{p.name}</h3>
                          <span style={{padding:"2px 5px",borderRadius:"6px",fontSize:"0.63rem",fontWeight:700,background:`${PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"}18`,color:PROVIDER_TYPE_COLOR[p.type]||"#1a9e6e"}}>{p.type}</span>
                          {COUNTRIES[p.country]&&<span style={{fontSize:"0.78rem"}}>{COUNTRIES[p.country].flag}</span>}
                        </div>
                        <div style={{color:"#3a5a50",fontSize:"0.7rem"}}>📍 {p.river} · {p.region}</div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:"0.97rem",fontWeight:800,color:"#a8edcf"}}>{p.price}{p.currency}</div><div style={{fontSize:"0.64rem",color:"#4a7a6a"}}>{p.priceLabel}</div></div>
                    </div>
                    <div style={{display:"flex",gap:"7px",alignItems:"center",marginBottom:"6px",flexWrap:"wrap"}}>
                      {p.rating>0&&<span style={{fontSize:"0.7rem",color:"#f59e0b",fontWeight:600}}>{"⭐".repeat(Math.floor(p.rating))} {p.rating} <span style={{color:"#4a7a6a"}}>({p.reviews})</span></span>}
                      <span style={{fontSize:"0.64rem",color:"#2a8a60",background:"rgba(26,158,110,0.07)",padding:"2px 5px",borderRadius:"5px"}}>Commission: {p.commission}%</span>
                    </div>
                    <p style={{color:"#7a9a90",fontSize:"0.78rem",lineHeight:1.5,marginBottom:"8px"}}>{p.description}</p>
                    <button className="btn" onClick={()=>setBookingProvider(p)} style={{padding:"7px 16px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"8px",color:"#fff",fontWeight:700,fontSize:"0.78rem",boxShadow:"0 3px 9px rgba(26,158,110,0.22)"}}>
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
            <div style={{textAlign:"center",marginBottom:"15px"}}><h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#a8edcf",marginBottom:"4px"}}>⭐ Destinations Partenaires</h2><p style={{color:"#4a7a6a",fontSize:"0.79rem"}}>Régions officielles partenaires de FleuVibe</p></div>
            <div style={{display:"flex",flexDirection:"column",gap:"11px",marginBottom:"18px"}}>
              {SPONSORED_REGIONS.map((r,i)=>(
                <div key={r.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.07+i*0.06}s`,background:`linear-gradient(135deg,${r.color}07,rgba(255,255,255,0.02))`,border:`1px solid ${r.color}26`,borderRadius:"13px",overflow:"hidden"}}>
                  <div style={{height:"3px",background:`linear-gradient(90deg,${r.color},${r.color}40)`}}/>
                  <div style={{padding:"14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"7px"}}>
                      <span style={{fontSize:"1.7rem"}}>{r.image}</span>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"2px"}}><h3 style={{fontSize:"0.93rem",fontWeight:700,color:"#daf0e8"}}>{r.name}</h3><span style={{fontSize:"0.83rem"}}>{r.flag}</span></div>
                        <span style={{padding:"2px 6px",background:`${r.color}14`,border:`1px solid ${r.color}28`,borderRadius:"5px",fontSize:"0.6rem",color:r.color,fontWeight:700}}>⭐ {r.badge}</span>
                      </div>
                    </div>
                    <p style={{color:"#8ab8b0",fontSize:"0.8rem",lineHeight:1.6,marginBottom:"8px"}}>{r.description}</p>
                    <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"8px"}}>
                      {r.highlights.map(h=><span key={h} style={{padding:"2px 7px",background:`${r.color}0e`,border:`1px solid ${r.color}1e`,borderRadius:"6px",fontSize:"0.68rem",color:"#8ae8cc",fontWeight:500}}>✓ {h}</span>)}
                    </div>
                    <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                      {routes.filter(route=>route.sponsoredRegion===r.id).map(route=>(
                        <button key={route.id} className="btn" onClick={()=>{setPage("explore");setSelectedRoute(route);}} style={{padding:"3px 7px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"6px",color:"#7ecfb0",fontSize:"0.69rem",fontWeight:600}}>{route.emoji} {route.name.split("·")[0]}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:"linear-gradient(135deg,rgba(26,158,110,0.06),rgba(8,145,178,0.06))",border:"1px solid rgba(26,158,110,0.14)",borderRadius:"12px",padding:"16px",textAlign:"center"}}>
              <div style={{fontSize:"1.6rem",marginBottom:"6px"}}>🌍</div>
              <h3 style={{fontSize:"0.93rem",fontWeight:700,color:"#a8edcf",marginBottom:"5px"}}>Vous êtes un office du tourisme ?</h3>
              <p style={{color:"#4a7a6a",fontSize:"0.79rem",lineHeight:1.6,marginBottom:"10px"}}>Mettez votre région en avant sur FleuVibe auprès de passionnés nautiques du monde entier.</p>
              <button className="btn" style={{padding:"8px 18px",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",border:"none",borderRadius:"9px",color:"#fff",fontWeight:700,fontSize:"0.8rem",boxShadow:"0 3px 10px rgba(26,158,110,0.2)"}}>📩 Nous contacter</button>
            </div>
          </div>
        )}

        {/* WEATHER */}
        {page==="weather"&&(
          <div>
            <div style={{textAlign:"center",marginBottom:"14px"}}><h2 style={{fontSize:"1.05rem",fontWeight:700,color:"#a8edcf",marginBottom:"4px"}}>🌤️ Conditions en temps réel</h2><p style={{color:"#4a7a6a",fontSize:"0.79rem"}}>Météo actuelle sur chaque spot.</p></div>
            <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"center",marginBottom:"11px"}}>
              {Object.entries(WATER_TYPES).map(([code,wt])=><button key={code} className="btn" onClick={()=>setWaterType(code)} style={{padding:"4px 9px",borderRadius:"8px",background:waterType===code?`${wt.color}18`:"rgba(255,255,255,0.03)",border:`1px solid ${waterType===code?wt.color:"rgba(255,255,255,0.06)"}`,color:waterType===code?wt.color:"#4a7a6a",fontSize:"0.71rem",fontWeight:600}}>{wt.icon} {wt.name.split(" ")[0]}</button>)}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {routes.filter(r=>waterType==="ALL"||r.type===waterType).slice(0,20).map((r,i)=>(
                <div key={r.id} className={`fade-in ${loaded?"loaded":""}`} style={{transitionDelay:`${0.05+i*0.025}s`,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:"11px",overflow:"hidden"}}>
                  <div style={{height:"2.5px",background:`linear-gradient(90deg,${r.color},transparent)`}}/>
                  <div style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"7px"}}>
                      <span style={{fontSize:"1rem"}}>{r.emoji}</span>
                      <div style={{flex:1}}><h3 style={{fontSize:"0.84rem",fontWeight:700,color:"#daf0e8"}}>{r.name} {COUNTRIES[r.country]?.flag}</h3><p style={{color:"#3a5a50",fontSize:"0.68rem"}}>{r.river} · {r.region}</p></div>
                      <span style={{padding:"1px 5px",background:`${WATER_TYPES[r.type]?.color||"#1a9e6e"}16`,borderRadius:"5px",fontSize:"0.58rem",color:WATER_TYPES[r.type]?.color||"#1a9e6e",fontWeight:600}}>{WATER_TYPES[r.type]?.icon}</span>
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
            {session&&favorites.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{routes.filter(r=>favorites.includes(r.id)).map((r,i)=><RouteCard key={r.id} route={r} i={i}/>)}</div>}
          </div>
        )}

        <div style={{textAlign:"center",marginTop:"24px",paddingTop:"12px",borderTop:"1px solid rgba(255,255,255,0.04)",color:"#1a4a3a",fontSize:"0.67rem"}}>
          <p>FleuVibe World · v11.0 · {routes.length} spots · {Object.keys(COUNTRIES).length} pays · Rivières · Lacs · Mers · Côtes</p>
        </div>
      </div>

      {bookingProvider&&<BookingModal provider={bookingProvider} onClose={()=>setBookingProvider(null)}/>}
      {showSubmit&&<SubmitModal onClose={()=>setShowSubmit(false)} onAdd={r=>setRoutes(x=>[...x,r])} session={session} showAuth={()=>{setShowSubmit(false);setShowAuth(true);}}/>}

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
          <div style={{background:"linear-gradient(160deg,#0d2240,#0a3d2e)",border:"1px solid rgba(26,158,110,0.3)",borderRadius:"18px",padding:"20px",maxWidth:"360px",width:"100%",animation:"pop 0.25s ease",boxShadow:"0 20px 60px rgba(0,0,0,0.6)"}}>
            <div style={{textAlign:"center",marginBottom:"16px"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#1a9e6e,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",fontWeight:700,color:"#fff",margin:"0 auto 10px"}}>{userName[0].toUpperCase()}</div>
              <h2 style={{fontSize:"1rem",fontWeight:700,color:"#daf0e8"}}>{userName}</h2>
              <p style={{color:"#4a7a6a",fontSize:"0.74rem",marginTop:"2px"}}>{session.user.email}</p>
            </div>
            <div style={{display:"flex",gap:"7px",marginBottom:"14px"}}>
              {[["❤️",favorites.length,"Favoris"],["🌊",routes.length,"Spots"],["🌟",communityCount,"Ajoutés"]].map(([ic,val,label])=>(
                <div key={label} style={{flex:1,padding:"9px 6px",background:"rgba(26,158,110,0.07)",border:"1px solid rgba(26,158,110,0.14)",borderRadius:"9px",textAlign:"center"}}>
                  <div style={{fontSize:"1rem"}}>{ic}</div>
                  <div style={{fontSize:"0.9rem",fontWeight:800,color:"#a8edcf"}}>{val}</div>
                  <div style={{fontSize:"0.6rem",color:"#4a7a6a"}}>{label}</div>
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
