#!/usr/bin/env node
/**
 * Seed script — inserts all 68 routes (SPOTS + WORLD_ROUTES) into the Supabase
 * `spots` table.  Requires VITE_SUPABASE_KEY in .env (or env vars).
 *
 * Usage:  node scripts/seed-spots.js
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mdfzrqehdhvvhrqvinpo.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;
if (!SUPABASE_KEY) { console.error("Missing SUPABASE_SERVICE_KEY / VITE_SUPABASE_KEY"); process.exit(1); }
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Country → Continent mapping (subset covering all seeded routes) ──────────
const CONTINENT = {
  BE:"EU",FR:"EU",SI:"EU",NO:"EU",DE:"EU",CH:"EU",HR:"EU",PT:"EU",
  GR:"EU",IS:"EU",IT:"EU",
  US:"AM",CA:"AM",BR:"AM",CO:"AM",CL:"AM",MX:"AM",CR:"AM",EC:"AM",PE:"AM",
  NP:"AS",VN:"AS",ID:"AS",PH:"AS",IN:"AS",CN:"AS",
  ZM:"AF",MA:"AF",ZA:"AF",UG:"AF",MW:"AF",BW:"AF",
  AU:"OC",NZ:"OC",PF:"OC",FJ:"OC",
};

// ─── SPOTS (IDs 1-40, from src/App.jsx) ──────────────────────────────────────
const SPOTS = [
  { id:1,  type:"RIVER", country:"BE", name:"Lesse · Houyet → Anseremme",   river:"Lesse",          region:"Wallonie",           distance:"21 km",  duration:"4–5h",        difficulty:"Facile",        activities:["Kayak","Canoë"],                          description:"Le parcours emblématique de Belgique, entre falaises calcaires et forêts denses.",        color:"#1a9e6e", emoji:"🏞️", open:true,  sponsored:"Ardennes Belges",  camping:true,  waterPoints:true  },
  { id:2,  type:"RIVER", country:"BE", name:"Ourthe · La Roche → Hotton",   river:"Ourthe",          region:"Wallonie",           distance:"18 km",  duration:"3–4h",        difficulty:"Intermédiaire", activities:["Kayak","Rafting"],                        description:"Méandres spectaculaires avec quelques rapides dans les Ardennes.",                        color:"#2563eb", emoji:"🌊", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:3,  type:"RIVER", country:"BE", name:"Semois · Bouillon → Alle",     river:"Semois",          region:"Gaume",              distance:"34 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Kayak","Camping"],                        description:"Immersion totale dans la nature gaumaise avec nuit en camping.",                          color:"#7c3aed", emoji:"⛺", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:4,  type:"RIVER", country:"BE", name:"Meuse · Namur → Dinant",       river:"Meuse",           region:"Wallonie",           distance:"30 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Canoë","Kayak"],                          description:"Longer la Meuse entre citadelles médiévales et villages pittoresques.",                   color:"#0891b2", emoji:"🏰", open:true,  sponsored:"Ardennes Belges",  camping:false, waterPoints:true  },
  { id:5,  type:"LAKE",  country:"BE", name:"Lacs de l'Eau d'Heure",        river:"Eau d'Heure",     region:"Namur",              distance:"15 km",  duration:"3h",          difficulty:"Facile",        activities:["Kayak","SUP","Voile","Baignade"],          description:"Le plus grand lac artificiel de Belgique. Parfait pour toutes les activités nautiques.",  color:"#06b6d4", emoji:"🏖️", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:6,  type:"RIVER", country:"FR", name:"Ardèche · Vallon-Pont-d'Arc",  river:"Ardèche",         region:"Ardèche",            distance:"30 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Kayak","Canoë","Camping"],                description:"Le parcours mythique de France. Gorges sous le Pont d'Arc.",                              color:"#dc2626", emoji:"🌉", open:true,  sponsored:"Ardèche Tourisme", camping:true,  waterPoints:true  },
  { id:7,  type:"RIVER", country:"FR", name:"Verdon · Gorges",              river:"Verdon",          region:"PACA",               distance:"22 km",  duration:"2 jours",     difficulty:"Sportif",       activities:["Kayak","Rafting"],                        description:"Le Grand Canyon européen. Eaux turquoise et falaises à pic de 700m.",                    color:"#06b6d4", emoji:"💎", open:true,  sponsored:null,               camping:true,  waterPoints:false },
  { id:8,  type:"RIVER", country:"FR", name:"Dordogne · Argentat",          river:"Dordogne",        region:"Corrèze",            distance:"28 km",  duration:"1 journée",   difficulty:"Intermédiaire", activities:["Kayak","Canoë"],                          description:"Les gorges de la Dordogne entre falaises et villages médiévaux.",                         color:"#f97316", emoji:"🦅", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:9,  type:"RIVER", country:"FR", name:"Loire · Amboise → Tours",      river:"Loire",           region:"Indre-et-Loire",     distance:"26 km",  duration:"5h",          difficulty:"Facile",        activities:["Kayak","Canoë","SUP"],                    description:"Glisser sur la Loire au fil des châteaux Renaissance UNESCO.",                            color:"#f59e0b", emoji:"👑", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:10, type:"LAKE",  country:"FR", name:"Lac d'Annecy · Tour complet",  river:"Lac d'Annecy",    region:"Haute-Savoie",       distance:"35 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Kayak","SUP","Voile","Baignade"],          description:"Le lac le plus pur d'Europe entouré par les Alpes.",                                      color:"#0891b2", emoji:"🏔️", open:true,  sponsored:"Lac d'Annecy",     camping:false, waterPoints:true,  popular:true  },
  { id:11, type:"RIVER", country:"SI", name:"Soča · Bovec → Tolmin",        river:"Soča",            region:"Primorska",          distance:"55 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Kayak","Rafting","SUP"],                  description:"La Soča aux eaux émeraude — l'une des plus belles rivières du monde.",                   color:"#10b981", emoji:"💚", open:true,  sponsored:"Visit Slovenia",   camping:true,  waterPoints:true,  popular:true,  unsplash_id:"1502920493886-4d3bfa1578d8" },
  { id:12, type:"RIVER", country:"NO", name:"Sjoa · Åmot → Harpefoss",      river:"Sjoa",            region:"Innlandet",          distance:"18 km",  duration:"4h",          difficulty:"Sportif",       activities:["Kayak","Rafting"],                        description:"L'une des meilleures rivières de white-water en Europe.",                                 color:"#dc2626", emoji:"🐺", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:13, type:"SEA",   country:"NO", name:"Fjords de Norvège",            river:"Sognefjord",      region:"Vestland",           distance:"50 km",  duration:"3 jours",     difficulty:"Intermédiaire", activities:["Kayak","Camping"],                        description:"Pagayer dans les fjords entre cascades et villages colorés.",                             color:"#1a9e6e", emoji:"🏔️", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:14, type:"RIVER", country:"DE", name:"Rhin · Vallée Romantique",     river:"Rhin",            region:"Rhénanie",           distance:"65 km",  duration:"3 jours",     difficulty:"Intermédiaire", activities:["Kayak","Canoë"],                          description:"La vallée du Rhin romantique entre châteaux et vignobles UNESCO.",                        color:"#dc2626", emoji:"🏰", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:15, type:"LAKE",  country:"CH", name:"Lac Léman · Lausanne",         river:"Lac Léman",       region:"Vaud",               distance:"60 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Kayak","Voile","SUP"],                    description:"Le plus grand lac d'Europe occidentale entre vignobles et Alpes.",                        color:"#2563eb", emoji:"🍇", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:16, type:"SEA",   country:"HR", name:"Îles Dalmates · Croatie",      river:"Mer Adriatique",  region:"Dalmatie",           distance:"40 km",  duration:"3 jours",     difficulty:"Intermédiaire", activities:["Kayak","Voile","Plongée"],                description:"Longer les îles dalmates en kayak. Criques secrètes et eau turquoise.",                   color:"#06b6d4", emoji:"⛵", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:17, type:"SEA",   country:"PT", name:"Algarve · Grottes Marines",    river:"Côte Algarve",    region:"Algarve",            distance:"15 km",  duration:"3h",          difficulty:"Facile",        activities:["Kayak","Plongée","Baignade","SUP"],        description:"Les grottes et arches naturelles de l'Algarve.",                                          color:"#f59e0b", emoji:"🌊", open:true,  sponsored:"Algarve Tourism",  camping:false, waterPoints:true,  popular:true,  unsplash_id:"1507525428034-b723cf961d3e" },
  { id:18, type:"SEA",   country:"GR", name:"Îles Ioniques · Grèce",        river:"Mer Ionienne",    region:"Îles Ioniennes",     distance:"30 km",  duration:"2 jours",     difficulty:"Facile",        activities:["Kayak","Plongée","Baignade"],              description:"Pagayer entre les îles grecques aux eaux cristallines.",                                  color:"#2563eb", emoji:"🏛️", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:19, type:"LAKE",  country:"IS", name:"Þingvallavatn · Islande",       river:"Þingvallavatn",   region:"Suðurland",          distance:"12 km",  duration:"3h",          difficulty:"Facile",        activities:["Kayak","Plongée","SUP"],                  description:"Plongée dans les failles tectoniques entre deux continents.",                             color:"#7c3aed", emoji:"🌋", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:20, type:"RIVER", country:"US", name:"Colorado · Grand Canyon",      river:"Colorado",        region:"Arizona",            distance:"360 km", duration:"14 jours",    difficulty:"Sportif",       activities:["Rafting","Kayak","Camping"],               description:"L'expédition ultime dans le Grand Canyon.",                                               color:"#f97316", emoji:"🏜️", open:true,  sponsored:null,               camping:true,  waterPoints:false },
  { id:21, type:"SEA",   country:"US", name:"Hawaï · Surf & Kayak",         river:"Pacifique",       region:"Hawaï",              distance:"10 km",  duration:"2h",          difficulty:"Facile",        activities:["Surf","Kayak","SUP"],                     description:"Les vagues légendaires d'Hawaï.",                                                         color:"#f59e0b", emoji:"🌺", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:22, type:"RIVER", country:"CA", name:"Nahanni · Virginia Falls",     river:"Nahanni",         region:"Territoires NW",     distance:"300 km", duration:"10 jours",    difficulty:"Sportif",       activities:["Kayak","Canoë","Camping"],                description:"Top 10 mondial. Chutes deux fois plus hautes que Niagara.",                               color:"#7c3aed", emoji:"🐻", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:23, type:"RIVER", country:"BR", name:"Amazone · Manaus",             river:"Amazone",         region:"Amazonas",           distance:"150 km", duration:"5 jours",     difficulty:"Facile",        activities:["Bateau électrique","Canoë"],              description:"S'enfoncer dans la jungle amazonienne depuis Manaus.",                                    color:"#16a34a", emoji:"🦜", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:24, type:"RIVER", country:"CO", name:"Caño Cristales · Arc-en-ciel", river:"Caño Cristales",  region:"Meta",               distance:"8 km",   duration:"2h",          difficulty:"Facile",        activities:["Kayak","Baignade"],                       description:"La rivière aux 5 couleurs. La plus belle rivière du monde.",                               color:"#dc2626", emoji:"🌈", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:25, type:"RIVER", country:"CL", name:"Futaleufú · Patagonie",        river:"Futaleufú",       region:"Los Lagos",          distance:"20 km",  duration:"2 jours",     difficulty:"Sportif",       activities:["Rafting","Kayak"],                        description:"Top 5 mondial white water. Eaux turquoise en Patagonie.",                                 color:"#06b6d4", emoji:"🏔️", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:26, type:"SEA",   country:"MX", name:"Riviera Maya · Cenotes",       river:"Mer des Caraïbes", region:"Quintana Roo",      distance:"8 km",   duration:"2h",          difficulty:"Facile",        activities:["Kayak","Plongée","Baignade"],              description:"Explorer les cenotes et la mer des Caraïbes turquoise.",                                  color:"#06b6d4", emoji:"🐠", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:27, type:"RIVER", country:"CR", name:"Pacuare · Costa Rica",         river:"Río Pacuare",     region:"Turrialba",          distance:"28 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Rafting","Kayak","Camping"],               description:"Le meilleur rafting d'Amérique Centrale.",                                                color:"#16a34a", emoji:"🐊", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:28, type:"RIVER", country:"NP", name:"Trisuli · Himalaya",           river:"Trisuli",         region:"Gandaki",            distance:"50 km",  duration:"2 jours",     difficulty:"Intermédiaire", activities:["Rafting","Kayak"],                        description:"Rafting dans l'Himalaya depuis Katmandou.",                                               color:"#dc2626", emoji:"🏔️", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:29, type:"SEA",   country:"VN", name:"Baie d'Halong · Kayak",        river:"Baie d'Halong",   region:"Quảng Ninh",         distance:"10 km",  duration:"2h",          difficulty:"Facile",        activities:["Kayak","SUP"],                            description:"Explorer les grottes secrètes de la Baie d'Halong.",                                      color:"#10b981", emoji:"🌅", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:30, type:"SEA",   country:"ID", name:"Bali · Surf & SUP",            river:"Océan Indien",    region:"Bali",               distance:"10 km",  duration:"2h",          difficulty:"Intermédiaire", activities:["Surf","SUP","Plongée"],                   description:"Les vagues légendaires de Bali pour surfeurs et paddlers.",                                color:"#f97316", emoji:"🏄", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:31, type:"SEA",   country:"PH", name:"El Nido · Palawan",            river:"Mer de Chine",    region:"Palawan",            distance:"20 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Kayak","Plongée","Baignade"],              description:"Les lagons cachés de Palawan. Eaux cristallines.",                                        color:"#06b6d4", emoji:"🏝️", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:32, type:"RIVER", country:"IN", name:"Gange · Rishikesh Rafting",    river:"Gange",           region:"Uttarakhand",        distance:"16 km",  duration:"3h",          difficulty:"Intermédiaire", activities:["Rafting","Kayak"],                        description:"Rafting sacré sur le Gange à Rishikesh.",                                                 color:"#f59e0b", emoji:"🕉️", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:33, type:"RIVER", country:"ZM", name:"Zambèze · Chutes Victoria",    river:"Zambèze",         region:"Livingstone",        distance:"70 km",  duration:"3 jours",     difficulty:"Sportif",       activities:["Rafting","Kayak","Camping"],               description:"Rafting sous les embruns des Chutes Victoria.",                                           color:"#f97316", emoji:"🦁", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:34, type:"SEA",   country:"MA", name:"Essaouira · Kitesurf",         river:"Atlantique",      region:"Marrakech-Safi",     distance:"10 km",  duration:"2h",          difficulty:"Intermédiaire", activities:["Kitesurf","Surf","SUP"],                  description:"La capitale mondiale du kitesurf. Alizés constants.",                                     color:"#f59e0b", emoji:"🪁", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:35, type:"SEA",   country:"ZA", name:"Cape Town · Kayak Baleines",   river:"Atlantique",      region:"Western Cape",       distance:"12 km",  duration:"3h",          difficulty:"Facile",        activities:["Kayak","Plongée","Baignade"],              description:"Kayak avec pingouins et baleines. Table Mountain en fond.",                               color:"#7c3aed", emoji:"🐋", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:36, type:"SEA",   country:"AU", name:"Great Barrier Reef",           river:"Mer de Corail",   region:"Queensland",         distance:"20 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Kayak","Plongée","SUP"],                  description:"Pagayer au-dessus de la plus grande barrière de corail.",                                 color:"#10b981", emoji:"🐢", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:37, type:"RIVER", country:"NZ", name:"Whanganui · Great Journey",    river:"Whanganui",       region:"Manawatū",           distance:"145 km", duration:"5 jours",     difficulty:"Facile",        activities:["Canoë","Kayak","Camping"],                description:"L'une des Great Walks de Nouvelle-Zélande sur l'eau.",                                    color:"#16a34a", emoji:"🥝", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:38, type:"SEA",   country:"PF", name:"Bora Bora · SUP Lagon",        river:"Pacifique",       region:"Polynésie française", distance:"10 km", duration:"2h",          difficulty:"Facile",        activities:["SUP","Kayak","Plongée"],                  description:"SUP dans le lagon de Bora Bora. Raies mantas et eau à 28°C.",                             color:"#7c3aed", emoji:"🌺", open:true,  sponsored:null,               camping:false, waterPoints:true  },
  { id:39, type:"SEA",   country:"FJ", name:"Fidji · Kayak Îles",           river:"Pacifique",       region:"Viti Levu",          distance:"15 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Kayak","Plongée","SUP"],                  description:"Pagayer entre les îles paradisiaques des Fidji.",                                         color:"#06b6d4", emoji:"🌴", open:true,  sponsored:null,               camping:true,  waterPoints:true  },
  { id:40, type:"LAKE",  country:"PE", name:"Lac Titicaca · Uros",          river:"Lac Titicaca",    region:"Puno",               distance:"20 km",  duration:"1 journée",   difficulty:"Facile",        activities:["Kayak","Bateau traditionnel"],             description:"Le plus haut lac navigable du monde à 3800m.",                                            color:"#0891b2", emoji:"🌄", open:true,  sponsored:null,               camping:false, waterPoints:true  },
];

// ─── WORLD_ROUTES enrichment helpers (mirrors src/data.js _enrich) ─────────────
const DIFF_COLOR = { Facile:"#10b981", "Intermédiaire":"#f59e0b", Sportif:"#ef4444" };
const ACT_BY_TYPE = {
  RIVER: ["Kayak","Rafting","Canoë"],
  LAKE:  ["Kayak","SUP","Baignade"],
  SEA:   ["Kayak","SUP","Plongée"],
};
const EMOJI_BY_TYPE = { RIVER:"🏞️", LAKE:"🏔️", SEA:"🌊" };

const enrich = (r) => {
  const km = parseInt(r.distance);
  return {
    emoji:       r.emoji || EMOJI_BY_TYPE[r.type] || "🌊",
    color:       DIFF_COLOR[r.difficulty] || "#1a9e6e",
    activities:  ACT_BY_TYPE[r.type] || ["Kayak"],
    open:        true,
    camping:     km > 50,
    waterPoints: true,
    description: `Découvrez ${r.name} — un spot ${r.difficulty.toLowerCase()} exceptionnel en ${r.river || r.type}.`,
    region:      r.country,
    duration:    km > 100 ? "Plusieurs jours" : km > 30 ? "1 journée" : "3-4h",
    ...r,
  };
};

const WORLD_ROUTES = [
  // AFRIQUE
  { id:1001, name:"Nil Blanc · Jinja",       country:"UG", river:"Nil",       difficulty:"Sportif",       distance:"25 km", type:"RIVER", coords:[0.450,   33.200],  emoji:"🌊" },
  { id:1002, name:"Zambèze · Livingstone",   country:"ZM", river:"Zambèze",   difficulty:"Sportif",       distance:"35 km", type:"RIVER", coords:[-17.930, 25.856],  emoji:"🦁" },
  { id:1003, name:"Atlas · Ourika",          country:"MA", river:"Ourika",    difficulty:"Intermédiaire", distance:"15 km", type:"RIVER", coords:[31.800,  -6.200],  emoji:"🏔️" },
  { id:1004, name:"Lac Malawi",              country:"MW", river:"Lac Malawi",difficulty:"Facile",        distance:"30 km", type:"LAKE",  coords:[-11.500, 34.600],  emoji:"💧" },
  { id:1005, name:"Delta Okavango",          country:"BW", river:"Okavango",  difficulty:"Facile",        distance:"40 km", type:"RIVER", coords:[-19.000, 23.000],  emoji:"🐘" },
  { id:1006, name:"Cape Peninsula",          country:"ZA", river:"Océan",     difficulty:"Intermédiaire", distance:"20 km", type:"SEA",   coords:[-34.357, 18.474],  emoji:"🐋" },
  // AMÉRIQUES
  { id:2001, name:"Grand Canyon · Colorado", country:"US", river:"Colorado",  difficulty:"Sportif",       distance:"360 km",type:"RIVER", coords:[36.100, -112.100], emoji:"🏜️" },
  { id:2002, name:"Banff · Lac Louise",      country:"CA", river:"Lac Louise",difficulty:"Facile",        distance:"15 km", type:"LAKE",  coords:[51.416, -116.177], emoji:"🏔️" },
  { id:2003, name:"Amazone · Jungle",        country:"BR", river:"Amazone",   difficulty:"Facile",        distance:"100 km",type:"RIVER", coords:[-3.100,  -60.025], emoji:"🌳" },
  { id:2004, name:"Futaleufú · Patagonie",   country:"CL", river:"Futaleufú", difficulty:"Sportif",       distance:"30 km", type:"RIVER", coords:[-43.200, -71.860], emoji:"🏔️" },
  { id:2005, name:"Pacuare · Costa Rica",    country:"CR", river:"Pacuare",   difficulty:"Intermédiaire", distance:"28 km", type:"RIVER", coords:[9.900,   -83.680], emoji:"🌴" },
  { id:2006, name:"Cénotes · Mexique",       country:"MX", river:"Cenotes",   difficulty:"Facile",        distance:"10 km", type:"LAKE",  coords:[20.630,  -87.080], emoji:"💧" },
  { id:2007, name:"Galápagos · Kayak",       country:"EC", river:"Océan",     difficulty:"Intermédiaire", distance:"25 km", type:"SEA",   coords:[-0.460,  -91.000], emoji:"🐢" },
  // ASIE
  { id:3001, name:"Gange · Rishikesh",       country:"IN", river:"Ganges",    difficulty:"Intermédiaire", distance:"25 km", type:"RIVER", coords:[30.086,   78.296], emoji:"🕉️" },
  { id:3002, name:"Rivière Li · Yangshuo",   country:"CN", river:"Li",        difficulty:"Facile",        distance:"50 km", type:"RIVER", coords:[24.930,  110.250], emoji:"🐉" },
  { id:3003, name:"Bali · Surf & SUP",       country:"ID", river:"Océan",     difficulty:"Intermédiaire", distance:"15 km", type:"SEA",   coords:[-8.409,  115.188], emoji:"🏄" },
  { id:3004, name:"Baie d'Halong",           country:"VN", river:"Mer",       difficulty:"Facile",        distance:"20 km", type:"SEA",   coords:[20.910,  107.184], emoji:"⛰️" },
  { id:3005, name:"El Nido · Palawan",       country:"PH", river:"Mer",       difficulty:"Facile",        distance:"30 km", type:"SEA",   coords:[11.177,  119.388], emoji:"🏝️" },
  { id:3006, name:"Trisuli · Himalaya",      country:"NP", river:"Trisuli",   difficulty:"Intermédiaire", distance:"45 km", type:"RIVER", coords:[27.800,   84.400], emoji:"🏔️" },
  // EUROPE
  { id:4001, name:"Ardèche · Gorges",        country:"FR", river:"Ardèche",   difficulty:"Intermédiaire", distance:"30 km", type:"RIVER", coords:[44.400,    4.390], emoji:"🦅" },
  { id:4002, name:"Lac d'Annecy",            country:"FR", river:"Lac",       difficulty:"Facile",        distance:"35 km", type:"LAKE",  coords:[45.866,    6.165], emoji:"🏔️" },
  { id:4003, name:"Soča · Slovénie",         country:"SI", river:"Soča",      difficulty:"Intermédiaire", distance:"55 km", type:"RIVER", coords:[46.240,   13.650], emoji:"💚" },
  { id:4004, name:"Algarve · Portugal",      country:"PT", river:"Océan",     difficulty:"Facile",        distance:"25 km", type:"SEA",   coords:[37.085,   -8.668], emoji:"🌊" },
  { id:4005, name:"Lac de Côme",             country:"IT", river:"Lac",       difficulty:"Facile",        distance:"45 km", type:"LAKE",  coords:[46.000,    9.250], emoji:"⛵" },
  { id:4006, name:"Fjords Norvégiens",        country:"NO", river:"Fjord",     difficulty:"Intermédiaire", distance:"60 km", type:"SEA",   coords:[61.050,    6.850], emoji:"🏔️" },
  // OCÉANIE
  { id:5001, name:"Great Barrier Reef",       country:"AU", river:"Mer",       difficulty:"Facile",        distance:"50 km", type:"SEA",   coords:[-18.286, 147.699], emoji:"🐢" },
  { id:5002, name:"Milford Sound",            country:"NZ", river:"Fjord",     difficulty:"Intermédiaire", distance:"30 km", type:"SEA",   coords:[-44.700, 167.900], emoji:"🥝" },
  { id:5003, name:"Fidji · Îles",             country:"FJ", river:"Océan",     difficulty:"Facile",        distance:"40 km", type:"SEA",   coords:[-17.713, 178.065], emoji:"🌴" },
].map(enrich);

// ─── Normalise a route to the spots table shape ────────────────────────────────
const toRow = (s, sponsorMap) => ({
  id:                  s.id,
  name:                s.name,
  river:               s.river   || null,
  region:              s.region  || null,
  country:             s.country,
  continent:           CONTINENT[s.country] || null,
  type:                s.type,
  distance:            s.distance || null,
  duration:            s.duration || null,
  difficulty:          s.difficulty,
  activities:          s.activities || [],
  description:         s.description || null,
  // coords stored as { x: lat, y: lon } for Supabase POINT
  coords:              Array.isArray(s.coords) ? `(${s.coords[0]},${s.coords[1]})` : null,
  path:                s.path    || null,
  emoji:               s.emoji   || null,
  color:               s.color   || null,
  open:                s.open    !== false,
  sponsored_region_id: s.sponsored ? (sponsorMap[s.sponsored] ?? null) : null,
  popular:             s.popular === true,
  camping:             s.camping === true,
  water_points:        s.waterPoints !== false,
  unsplash_id:         s.unsplash_id || null,
});

async function main() {
  // 1. Upsert sponsored regions
  const uniqueSponsors = [...new Set(SPOTS.map(s => s.sponsored).filter(Boolean))];
  const sponsorMap = {};
  for (const name of uniqueSponsors) {
    const { data, error } = await supabase
      .from("sponsored_regions")
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single();
    if (error) { console.error(`Failed to upsert sponsor "${name}":`, error.message); process.exit(1); }
    sponsorMap[name] = data.id;
    console.log(`  sponsor: "${name}" → id ${data.id}`);
  }

  // 2. Upsert all routes
  const rows = [...SPOTS, ...WORLD_ROUTES].map(s => toRow(s, sponsorMap));
  const { error } = await supabase
    .from("spots")
    .upsert(rows, { onConflict: "id" });
  if (error) { console.error("Upsert failed:", error.message); process.exit(1); }

  console.log(`\n✅  Seeded ${rows.length} spots (${SPOTS.length} SPOTS + ${WORLD_ROUTES.length} WORLD_ROUTES)`);
}

main().catch(e => { console.error(e); process.exit(1); });
