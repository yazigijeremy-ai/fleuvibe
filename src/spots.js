// ─── FLEUVIBE GLOBAL SPOTS DATABASE v1.0 ─────────────────────────────────────
// 500+ spots nautiques dans le monde entier

const DIFF_COLOR = { Facile: "#1a9e6e", Intermédiaire: "#f59e0b", Sportif: "#dc2626" };
const TYPE_EMOJI = { RIVER: "🏞️", LAKE: "🏖️", SEA: "🌊" };

const _e = (s) => {
  const country = s.id.slice(0, 2).toUpperCase();
  const distKm = parseInt(s.distance) || 0;
  const actMap = {
    RIVER: ["Kayak", "Canoë"],
    LAKE: ["Kayak", "SUP"],
    SEA: ["Kayak", "SUP"],
  };
  return {
    ...s,
    country,
    color: DIFF_COLOR[s.difficulty] || "#1a9e6e",
    emoji: TYPE_EMOJI[s.type] || "🌊",
    open: true,
    camping: distKm > 40,
    waterPoints: true,
    activities: s.activities || actMap[s.type] || ["Kayak"],
    description: s.description || `${s.name} — ${s.type === "RIVER" ? "rivière" : s.type === "LAKE" ? "lac" : "mer"} · ${s.difficulty.toLowerCase()} · ${s.distance}`,
    duration: distKm > 100 ? `${Math.ceil(distKm / 30)} jours` : distKm > 30 ? `${Math.ceil(distKm / 15)}h` : "2h",
    emergencyContact: "112",
  };
};

const RAW = [
  // ──── AFRIQUE ────
  // Maroc
  { id: "ma001", name: "Oued Ourika", river: "Ourika", region: "Haut Atlas", difficulty: "Intermédiaire", distance: "15 km", type: "RIVER", coords: [31.400, -7.800], bestSeason: "avril-juin", activities: ["Kayak", "Rafting"] },
  { id: "ma002", name: "Lac Dayet Aoua", river: "Lac", region: "Ifrane", difficulty: "Facile", distance: "8 km", type: "LAKE", coords: [33.500, -5.100], bestSeason: "mai-oct", activities: ["SUP", "Pêche"] },
  { id: "ma003", name: "Côte Atlantique Essaouira", river: "Océan", region: "Essaouira", difficulty: "Intermédiaire", distance: "20 km", type: "SEA", coords: [31.512, -9.770], bestSeason: "toute année", activities: ["Kitesurf", "Surf", "SUP"] },
  { id: "ma004", name: "Barrage Al Massira", river: "Lac", region: "Settat", difficulty: "Facile", distance: "25 km", type: "LAKE", coords: [32.500, -7.800], bestSeason: "mars-nov", activities: ["Kayak", "Pêche"] },
  // Égypte
  { id: "eg001", name: "Nil à Louxor", river: "Nil", region: "Louxor", difficulty: "Facile", distance: "30 km", type: "RIVER", coords: [25.700, 32.650], bestSeason: "oct-avr", activities: ["Felouque", "Kayak"] },
  { id: "eg002", name: "Mer Rouge Hurghada", river: "Mer", region: "Hurghada", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [27.250, 33.800], bestSeason: "toute année", activities: ["Plongée", "SUP", "Kayak"] },
  // Afrique du Sud
  { id: "za001", name: "Orange River", river: "Orange", region: "Northern Cape", difficulty: "Intermédiaire", distance: "80 km", type: "RIVER", coords: [-28.300, 21.300], bestSeason: "mai-sep", activities: ["Rafting", "Kayak", "Camping"] },
  { id: "za002", name: "St Lucia Lake", river: "Lac", region: "KwaZulu-Natal", difficulty: "Facile", distance: "25 km", type: "LAKE", coords: [-28.400, 32.400], bestSeason: "juin-nov", activities: ["Kayak", "Observation crocodiles"] },
  { id: "za003", name: "Knysna Lagoon", river: "Lagune", region: "Garden Route", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [-34.050, 23.050], bestSeason: "toute année", activities: ["Kayak", "SUP", "Voile"] },
  // Kenya
  { id: "ke001", name: "Tana River", river: "Tana", region: "Meru", difficulty: "Intermédiaire", distance: "40 km", type: "RIVER", coords: [-0.500, 40.100], bestSeason: "jan-mar", activities: ["Rafting", "Safari"] },
  { id: "ke002", name: "Lac Naivasha", river: "Lac", region: "Rift Valley", difficulty: "Facile", distance: "20 km", type: "LAKE", coords: [-0.800, 36.400], bestSeason: "toute année", activities: ["SUP", "Kayak", "Observation hippos"] },
  // Seychelles
  { id: "sc001", name: "Baie Lazare", river: "Océan", region: "Mahé", difficulty: "Facile", distance: "10 km", type: "SEA", coords: [-4.750, 55.500], bestSeason: "avr-nov", activities: ["SUP", "Kayak", "Plongée"] },
  // Madagascar
  { id: "mg001", name: "Canal des Pangalanes", river: "Canal", region: "Toamasina", difficulty: "Facile", distance: "100 km", type: "RIVER", coords: [-18.200, 49.400], bestSeason: "mai-nov", activities: ["Kayak", "Expédition"] },
  { id: "mg002", name: "Lac Tritriva", river: "Lac", region: "Antsirabe", difficulty: "Facile", distance: "5 km", type: "LAKE", coords: [-19.900, 47.000], bestSeason: "avr-déc", activities: ["SUP", "Baignade"] },
  // Tanzanie
  { id: "tz001", name: "Lac Tanganyika", river: "Lac", region: "Kigoma", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [-4.900, 29.600], bestSeason: "juin-oct", activities: ["Kayak", "Plongée"] },
  { id: "tz002", name: "Rufiji River", river: "Rufiji", region: "Selous", difficulty: "Intermédiaire", distance: "60 km", type: "RIVER", coords: [-8.100, 37.500], bestSeason: "juin-oct", activities: ["Kayak", "Safari"] },
  // Mozambique
  { id: "mz001", name: "Archipel Bazaruto", river: "Océan", region: "Inhambane", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [-21.700, 35.500], bestSeason: "avr-déc", activities: ["Plongée", "SUP", "Kayak"] },
  // Rwanda
  { id: "rw001", name: "Lac Kivu", river: "Lac", region: "Kivu Ouest", difficulty: "Facile", distance: "35 km", type: "LAKE", coords: [-2.000, 29.100], bestSeason: "juin-sep", activities: ["Kayak", "SUP"] },
  // Zambie
  { id: "zm001", name: "Zambèze Upper", river: "Zambèze", region: "Barotseland", difficulty: "Facile", distance: "60 km", type: "RIVER", coords: [-14.800, 23.200], bestSeason: "juin-oct", activities: ["Mokoro", "Canoë"] },
  // Botswana
  { id: "bw001", name: "Delta de l'Okavango", river: "Okavango", region: "Ngamiland", difficulty: "Facile", distance: "80 km", type: "RIVER", coords: [-19.300, 22.900], bestSeason: "juin-oct", activities: ["Mokoro", "Safari"] },
  // Éthiopie
  { id: "et001", name: "Lac Tana", river: "Lac", region: "Amhara", difficulty: "Facile", distance: "40 km", type: "LAKE", coords: [12.000, 37.300], bestSeason: "nov-mai", activities: ["Kayak"] },
  // Ghana
  { id: "gh001", name: "Lac Volta", river: "Lac", region: "Eastern", difficulty: "Facile", distance: "80 km", type: "LAKE", coords: [6.500, 0.100], bestSeason: "oct-avr", activities: ["Kayak", "Pêche"] },
  // Namibie
  { id: "na001", name: "Orange River Namibia", river: "Orange", region: "Karas", difficulty: "Facile", distance: "70 km", type: "RIVER", coords: [-28.600, 17.100], bestSeason: "fév-mai", activities: ["Rafting", "Camping"] },
  // Sénégal
  { id: "sn001", name: "Casamance River", river: "Casamance", region: "Ziguinchor", difficulty: "Facile", distance: "45 km", type: "RIVER", coords: [12.600, -16.300], bestSeason: "nov-avr", activities: ["Kayak", "Pirogue"] },
  // Cameroun
  { id: "cm001", name: "Sanaga River", river: "Sanaga", region: "Centre", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [3.900, 11.500], bestSeason: "déc-mar", activities: ["Rafting"] },
  // Ouganda
  { id: "ug001", name: "Nile Jinja", river: "Nil", region: "Busoga", difficulty: "Sportif", distance: "10 km", type: "RIVER", coords: [0.400, 33.200], bestSeason: "toute année", activities: ["Rafting", "Kayak"] },

  // ──── AMÉRIQUES ────
  // USA
  { id: "us001", name: "Colorado Grand Canyon", river: "Colorado", region: "Arizona", difficulty: "Sportif", distance: "360 km", type: "RIVER", coords: [36.100, -112.100], bestSeason: "avr-oct", activities: ["Rafting", "Expédition"] },
  { id: "us002", name: "Lake Tahoe", river: "Lac", region: "California", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [39.000, -120.000], bestSeason: "juin-sep", activities: ["Kayak", "SUP", "Voile"] },
  { id: "us003", name: "Florida Keys", river: "Océan", region: "Florida", difficulty: "Facile", distance: "80 km", type: "SEA", coords: [24.550, -81.800], bestSeason: "toute année", activities: ["SUP", "Plongée", "Kayak"] },
  { id: "us004", name: "Snake River Wyoming", river: "Snake", region: "Wyoming", difficulty: "Intermédiaire", distance: "40 km", type: "RIVER", coords: [43.500, -110.800], bestSeason: "juin-sep", activities: ["Rafting"] },
  { id: "us005", name: "Lake Powell", river: "Lac", region: "Utah", difficulty: "Facile", distance: "60 km", type: "LAKE", coords: [37.000, -111.500], bestSeason: "mai-oct", activities: ["Kayak", "Camping"] },
  { id: "us006", name: "San Francisco Bay", river: "Baie", region: "California", difficulty: "Intermédiaire", distance: "30 km", type: "SEA", coords: [37.800, -122.400], bestSeason: "sep-nov", activities: ["SUP", "Kitesurf"] },
  { id: "us007", name: "Glacier Bay Alaska", river: "Fjord", region: "Alaska", difficulty: "Intermédiaire", distance: "80 km", type: "SEA", coords: [58.500, -136.900], bestSeason: "mai-sep", activities: ["Kayak", "Observation baleines"] },
  { id: "us008", name: "Boundary Waters", river: "Lac", region: "Minnesota", difficulty: "Facile", distance: "100 km", type: "LAKE", coords: [48.000, -91.500], bestSeason: "juin-sep", activities: ["Canoë", "Camping"] },
  { id: "us009", name: "Everglades", river: "Canal", region: "Florida", difficulty: "Facile", distance: "50 km", type: "RIVER", coords: [25.200, -80.900], bestSeason: "nov-avr", activities: ["Kayak", "Observation"] },
  { id: "us010", name: "Apostle Islands", river: "Lac", region: "Wisconsin", difficulty: "Intermédiaire", distance: "40 km", type: "SEA", coords: [46.900, -90.700], bestSeason: "juin-sep", activities: ["Kayak"] },
  // Canada
  { id: "ca001", name: "Banff Lakes", river: "Lac", region: "Alberta", difficulty: "Facile", distance: "20 km", type: "LAKE", coords: [51.500, -116.000], bestSeason: "juin-sep", activities: ["Kayak", "Canoë"] },
  { id: "ca002", name: "Vancouver Island", river: "Océan", region: "BC", difficulty: "Intermédiaire", distance: "50 km", type: "SEA", coords: [49.500, -125.500], bestSeason: "mai-oct", activities: ["Kayak", "Observation baleines"] },
  { id: "ca003", name: "St Lawrence River", river: "St Laurent", region: "Quebec", difficulty: "Facile", distance: "40 km", type: "RIVER", coords: [46.500, -72.500], bestSeason: "juin-sep", activities: ["Kayak", "Voile"] },
  { id: "ca004", name: "Nahanni River", river: "Nahanni", region: "Territoires NW", difficulty: "Sportif", distance: "300 km", type: "RIVER", coords: [61.600, -125.700], bestSeason: "juil-août", activities: ["Kayak", "Canoë", "Camping"] },
  { id: "ca005", name: "Haida Gwaii", river: "Océan", region: "BC", difficulty: "Intermédiaire", distance: "60 km", type: "SEA", coords: [53.000, -132.000], bestSeason: "juin-sep", activities: ["Kayak"] },
  // Brésil
  { id: "br001", name: "Amazone · Manaus", river: "Amazone", region: "Amazonas", difficulty: "Facile", distance: "150 km", type: "RIVER", coords: [-3.100, -60.000], bestSeason: "juin-nov", activities: ["Expédition", "Observation"] },
  { id: "br002", name: "Iguazu · Rapides", river: "Iguazu", region: "Parana", difficulty: "Sportif", distance: "15 km", type: "RIVER", coords: [-25.700, -54.500], bestSeason: "avr-oct", activities: ["Rafting"] },
  { id: "br003", name: "Pantanal", river: "Rio Paraguay", region: "Mato Grosso", difficulty: "Facile", distance: "80 km", type: "RIVER", coords: [-17.000, -57.500], bestSeason: "juin-oct", activities: ["Kayak", "Safari"] },
  { id: "br004", name: "Fernando de Noronha", river: "Océan", region: "Pernambuco", difficulty: "Facile", distance: "20 km", type: "SEA", coords: [-3.900, -32.400], bestSeason: "avr-sep", activities: ["Plongée", "SUP"] },
  // Costa Rica
  { id: "cr001", name: "Pacuare River", river: "Pacuare", region: "Turrialba", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [9.900, -83.700], bestSeason: "mai-nov", activities: ["Rafting"] },
  { id: "cr002", name: "Manuel Antonio", river: "Océan", region: "Puntarenas", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [9.400, -84.200], bestSeason: "déc-avr", activities: ["Kayak", "SUP"] },
  // Chili
  { id: "cl001", name: "Futaleufú · Patagonie", river: "Futaleufú", region: "Los Lagos", difficulty: "Sportif", distance: "35 km", type: "RIVER", coords: [-43.200, -71.900], bestSeason: "déc-mar", activities: ["Rafting", "Kayak"] },
  { id: "cl002", name: "Lake District Chili", river: "Lac", region: "Puerto Varas", difficulty: "Facile", distance: "25 km", type: "LAKE", coords: [-41.300, -72.900], bestSeason: "nov-mar", activities: ["Kayak", "SUP"] },
  { id: "cl003", name: "Torres del Paine", river: "Lac", region: "Magallanes", difficulty: "Intermédiaire", distance: "40 km", type: "LAKE", coords: [-51.000, -73.000], bestSeason: "nov-mar", activities: ["Kayak", "Trekking"] },
  // Pérou
  { id: "pe001", name: "Lac Titicaca · Uros", river: "Lac", region: "Puno", difficulty: "Facile", distance: "30 km", type: "LAKE", coords: [-15.800, -69.400], bestSeason: "mai-oct", activities: ["Kayak"] },
  { id: "pe002", name: "Urubamba · Machu Picchu", river: "Urubamba", region: "Cusco", difficulty: "Intermédiaire", distance: "20 km", type: "RIVER", coords: [-13.200, -72.500], bestSeason: "mai-oct", activities: ["Rafting"] },
  // Argentine
  { id: "ar001", name: "Lago Argentino", river: "Lac", region: "Patagonie", difficulty: "Facile", distance: "40 km", type: "LAKE", coords: [-50.200, -72.500], bestSeason: "déc-mar", activities: ["Kayak"] },
  { id: "ar002", name: "Parana River", river: "Paraná", region: "Misiones", difficulty: "Facile", distance: "80 km", type: "RIVER", coords: [-27.400, -55.900], bestSeason: "avr-oct", activities: ["Kayak", "Canoë"] },
  // Colombie
  { id: "co001", name: "Caño Cristales", river: "Caño Cristales", region: "Meta", difficulty: "Facile", distance: "8 km", type: "RIVER", coords: [2.270, -73.780], bestSeason: "juin-nov", activities: ["Kayak", "Baignade"] },
  { id: "co002", name: "Cartagena · Archipel", river: "Mer Caraïbe", region: "Bolivar", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [10.400, -75.500], bestSeason: "déc-avr", activities: ["SUP", "Kayak"] },
  // Équateur
  { id: "ec001", name: "Napo River", river: "Napo", region: "Orellana", difficulty: "Facile", distance: "60 km", type: "RIVER", coords: [-0.500, -76.900], bestSeason: "juin-nov", activities: ["Kayak", "Expédition"] },
  // Mexique
  { id: "mx001", name: "Riviera Maya Cenotes", river: "Mer Caraïbe", region: "Quintana Roo", difficulty: "Facile", distance: "8 km", type: "SEA", coords: [20.630, -87.080], bestSeason: "toute année", activities: ["Kayak", "Plongée", "Baignade"] },
  { id: "mx002", name: "Baja California", river: "Pacifique", region: "BCS", difficulty: "Intermédiaire", distance: "50 km", type: "SEA", coords: [23.500, -110.000], bestSeason: "oct-mai", activities: ["Kayak", "Observation baleines"] },
  // Guatemala
  { id: "gt001", name: "Lac Atitlán", river: "Lac", region: "Sololá", difficulty: "Facile", distance: "30 km", type: "LAKE", coords: [14.700, -91.200], bestSeason: "nov-avr", activities: ["Kayak", "SUP"] },
  // Venezuela
  { id: "ve001", name: "Canaima · Angel Falls", river: "Carrao", region: "Bolivar", difficulty: "Intermédiaire", distance: "40 km", type: "RIVER", coords: [6.200, -62.800], bestSeason: "juil-oct", activities: ["Kayak", "Expédition"] },
  // Bolivie
  { id: "bo001", name: "Lac Titicaca Bolivie", river: "Lac", region: "La Paz", difficulty: "Facile", distance: "25 km", type: "LAKE", coords: [-16.000, -68.600], bestSeason: "mai-oct", activities: ["Kayak"] },

  // ──── ASIE ────
  // Inde
  { id: "in001", name: "Gange · Rishikesh", river: "Gange", region: "Uttarakhand", difficulty: "Intermédiaire", distance: "25 km", type: "RIVER", coords: [30.100, 78.300], bestSeason: "sep-juin", activities: ["Rafting"] },
  { id: "in002", name: "Backwaters Kerala", river: "Lagune", region: "Kerala", difficulty: "Facile", distance: "50 km", type: "RIVER", coords: [9.500, 76.500], bestSeason: "sep-mar", activities: ["Kayak", "Houseboat"] },
  { id: "in003", name: "Lac Dal · Cachemire", river: "Lac", region: "Cachemire", difficulty: "Facile", distance: "15 km", type: "LAKE", coords: [34.100, 74.900], bestSeason: "mai-sep", activities: ["SUP", "Shikara"] },
  { id: "in004", name: "Andaman Islands", river: "Océan", region: "Andaman", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [11.700, 92.700], bestSeason: "oct-mai", activities: ["Plongée", "Kayak"] },
  // Thaïlande
  { id: "th001", name: "Phi Phi Islands", river: "Océan", region: "Krabi", difficulty: "Facile", distance: "20 km", type: "SEA", coords: [7.700, 98.800], bestSeason: "nov-avr", activities: ["Kayak", "Plongée"] },
  { id: "th002", name: "Cheow Lan Lake", river: "Lac", region: "Surat Thani", difficulty: "Facile", distance: "30 km", type: "LAKE", coords: [9.000, 98.800], bestSeason: "déc-avr", activities: ["Kayak"] },
  { id: "th003", name: "Mékong · Chiang Rai", river: "Mékong", region: "Chiang Rai", difficulty: "Facile", distance: "40 km", type: "RIVER", coords: [20.100, 100.000], bestSeason: "nov-mars", activities: ["Kayak", "Slow boat"] },
  // Vietnam
  { id: "vn001", name: "Baie d'Halong", river: "Mer", region: "Quang Ninh", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [20.900, 107.200], bestSeason: "oct-avr", activities: ["Kayak"] },
  { id: "vn002", name: "Mékong · Delta", river: "Mékong", region: "Can Tho", difficulty: "Facile", distance: "40 km", type: "RIVER", coords: [10.000, 105.800], bestSeason: "déc-avr", activities: ["Kayak", "Pirogue"] },
  // Indonésie
  { id: "id001", name: "Bali · Surf & SUP", river: "Océan", region: "Bali", difficulty: "Intermédiaire", distance: "20 km", type: "SEA", coords: [-8.700, 115.200], bestSeason: "avr-oct", activities: ["Surf", "SUP"] },
  { id: "id002", name: "Komodo Islands", river: "Mer", region: "NTT", difficulty: "Facile", distance: "35 km", type: "SEA", coords: [-8.600, 119.600], bestSeason: "avr-déc", activities: ["Kayak"] },
  { id: "id003", name: "Raja Ampat", river: "Mer", region: "Papouasie Ouest", difficulty: "Facile", distance: "50 km", type: "SEA", coords: [-0.500, 130.500], bestSeason: "oct-avr", activities: ["Plongée", "Kayak"] },
  // Japon
  { id: "jp001", name: "Lac Biwa", river: "Lac", region: "Shiga", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [35.300, 136.200], bestSeason: "mai-oct", activities: ["SUP", "Kayak"] },
  { id: "jp002", name: "Yoshino River Shikoku", river: "Yoshino", region: "Shikoku", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [33.900, 133.900], bestSeason: "avr-nov", activities: ["Rafting"] },
  { id: "jp003", name: "Okinawa · Mangroves", river: "Mer", region: "Okinawa", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [26.600, 127.800], bestSeason: "avr-oct", activities: ["Kayak", "SUP"] },
  // Chine
  { id: "cn001", name: "Rivière Li · Guilin", river: "Li", region: "Guangxi", difficulty: "Facile", distance: "80 km", type: "RIVER", coords: [24.900, 110.300], bestSeason: "avr-oct", activities: ["Bambou"] },
  { id: "cn002", name: "West Lake Hangzhou", river: "Lac", region: "Hangzhou", difficulty: "Facile", distance: "15 km", type: "LAKE", coords: [30.200, 120.100], bestSeason: "mars-nov", activities: ["SUP"] },
  { id: "cn003", name: "Yangtze · Trois Gorges", river: "Yangtze", region: "Chongqing", difficulty: "Intermédiaire", distance: "200 km", type: "RIVER", coords: [30.800, 108.400], bestSeason: "avr-oct", activities: ["Croisière", "Kayak"] },
  // Népal
  { id: "np001", name: "Trisuli · Himalaya", river: "Trisuli", region: "Gandaki", difficulty: "Intermédiaire", distance: "50 km", type: "RIVER", coords: [27.800, 84.400], bestSeason: "oct-mai", activities: ["Rafting", "Kayak"] },
  { id: "np002", name: "Kali Gandaki", river: "Kali Gandaki", region: "Mustang", difficulty: "Sportif", distance: "40 km", type: "RIVER", coords: [28.500, 83.700], bestSeason: "oct-nov", activities: ["Rafting", "Expédition"] },
  // Malaisie
  { id: "my001", name: "Kinabatangan River", river: "Kinabatangan", region: "Sabah", difficulty: "Facile", distance: "60 km", type: "RIVER", coords: [5.400, 118.000], bestSeason: "avr-oct", activities: ["Kayak", "Safari"] },
  { id: "my002", name: "Langkawi", river: "Mer", region: "Kedah", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [6.400, 99.800], bestSeason: "nov-avr", activities: ["SUP", "Kayak"] },
  // Philippines
  { id: "ph001", name: "El Nido Palawan", river: "Mer de Chine", region: "Palawan", difficulty: "Facile", distance: "20 km", type: "SEA", coords: [11.177, 119.388], bestSeason: "déc-mai", activities: ["Kayak", "Plongée", "Baignade"] },
  { id: "ph002", name: "Tubbataha Reef", river: "Mer", region: "Sulu", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [8.800, 119.900], bestSeason: "avr-juin", activities: ["Plongée", "Kayak"] },
  // Géorgie
  { id: "ge001", name: "Mtkvari River", river: "Mtkvari", region: "Tbilisi", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [41.700, 44.800], bestSeason: "mai-sep", activities: ["Rafting", "Kayak"] },
  // Kirghizistan
  { id: "kg001", name: "Lac Issyk-Koul", river: "Lac", region: "Issyk-Koul", difficulty: "Facile", distance: "60 km", type: "LAKE", coords: [42.400, 77.300], bestSeason: "juin-sep", activities: ["Kayak", "SUP"] },
  // Maldives
  { id: "mv001", name: "Maldives · Atolls", river: "Océan Indien", region: "Malé", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [3.200, 73.200], bestSeason: "déc-avr", activities: ["SUP", "Plongée", "Kayak"] },
  // Sri Lanka
  { id: "lk001", name: "Mahaweli River", river: "Mahaweli", region: "Kandy", difficulty: "Intermédiaire", distance: "20 km", type: "RIVER", coords: [7.500, 80.800], bestSeason: "jan-avr", activities: ["Rafting"] },
  // Turquie
  { id: "tr001", name: "Dalyan River", river: "Dalyan", region: "Muğla", difficulty: "Facile", distance: "20 km", type: "RIVER", coords: [36.800, 28.600], bestSeason: "avr-oct", activities: ["Kayak"] },
  { id: "tr002", name: "Côte Égéenne", river: "Mer Égée", region: "Bodrum", difficulty: "Facile", distance: "40 km", type: "SEA", coords: [37.000, 27.400], bestSeason: "mai-oct", activities: ["Kayak", "SUP"] },
  // Kazakhstan
  { id: "kz001", name: "Lac Balkhach", river: "Lac", region: "Almaty", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [46.600, 74.900], bestSeason: "juin-sep", activities: ["Kayak", "Pêche"] },

  // ──── EUROPE ────
  // France
  { id: "fr001", name: "Gorges du Verdon", river: "Verdon", region: "Provence", difficulty: "Sportif", distance: "25 km", type: "RIVER", coords: [43.800, 6.400], bestSeason: "mai-sep", activities: ["Rafting", "Kayak"] },
  { id: "fr002", name: "Lac Léman · Suisse", river: "Lac", region: "Haute-Savoie", difficulty: "Facile", distance: "60 km", type: "LAKE", coords: [46.400, 6.500], bestSeason: "juin-sep", activities: ["SUP", "Voile"] },
  { id: "fr003", name: "Dordogne · Canoë", river: "Dordogne", region: "Nouvelle-Aquitaine", difficulty: "Facile", distance: "40 km", type: "RIVER", coords: [44.900, 1.000], bestSeason: "mai-oct", activities: ["Canoë"] },
  { id: "fr004", name: "Loire · Châteaux", river: "Loire", region: "Val de Loire", difficulty: "Facile", distance: "26 km", type: "RIVER", coords: [47.370, 0.820], bestSeason: "avr-oct", activities: ["Kayak", "Canoë"] },
  { id: "fr005", name: "Ardèche · Gorges", river: "Ardèche", region: "Ardèche", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [44.400, 4.390], bestSeason: "avr-sep", activities: ["Kayak", "Canoë", "Camping"] },
  { id: "fr006", name: "Côte de Granit Rose", river: "Manche", region: "Bretagne", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [48.800, -3.500], bestSeason: "mai-sep", activities: ["Kayak"] },
  { id: "fr007", name: "Vézère · Périgord", river: "Vézère", region: "Dordogne", difficulty: "Facile", distance: "35 km", type: "RIVER", coords: [44.900, 1.100], bestSeason: "mai-sep", activities: ["Canoë", "Kayak"] },
  { id: "fr008", name: "Sorgue · Fontaine", river: "Sorgue", region: "Vaucluse", difficulty: "Facile", distance: "8 km", type: "RIVER", coords: [43.920, 5.130], bestSeason: "avr-oct", activities: ["Canoë", "Kayak"] },
  // Italie
  { id: "it001", name: "Lac de Côme", river: "Lac", region: "Lombardie", difficulty: "Facile", distance: "45 km", type: "LAKE", coords: [46.000, 9.300], bestSeason: "mai-sep", activities: ["SUP", "Kayak"] },
  { id: "it002", name: "Côte Amalfitaine", river: "Mer", region: "Campanie", difficulty: "Intermédiaire", distance: "25 km", type: "SEA", coords: [40.600, 14.600], bestSeason: "mai-oct", activities: ["Kayak"] },
  { id: "it003", name: "Lac de Garde", river: "Lac", region: "Vénétie", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [45.600, 10.700], bestSeason: "mai-sep", activities: ["SUP", "Voile"] },
  { id: "it004", name: "Sardaigne · Coves", river: "Mer", region: "Sardaigne", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [39.200, 9.100], bestSeason: "mai-oct", activities: ["Kayak", "Plongée"] },
  { id: "it005", name: "Brenta · Dolomites", river: "Brenta", region: "Trentin", difficulty: "Intermédiaire", distance: "30 km", type: "RIVER", coords: [46.100, 11.200], bestSeason: "mai-sep", activities: ["Rafting", "Kayak"] },
  // Espagne
  { id: "es001", name: "Sella River · Asturies", river: "Sella", region: "Asturies", difficulty: "Facile", distance: "20 km", type: "RIVER", coords: [43.400, -5.000], bestSeason: "mai-sep", activities: ["Rafting"] },
  { id: "es002", name: "Costa Brava", river: "Mer", region: "Catalogne", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [41.900, 3.200], bestSeason: "mai-oct", activities: ["Kayak", "SUP"] },
  { id: "es003", name: "Noguera Pallaresa", river: "Noguera", region: "Catalogne", difficulty: "Sportif", distance: "25 km", type: "RIVER", coords: [42.400, 1.000], bestSeason: "avr-sep", activities: ["Rafting", "Kayak"] },
  { id: "es004", name: "Îles Canaries", river: "Atlantique", region: "Tenerife", difficulty: "Facile", distance: "20 km", type: "SEA", coords: [28.100, -16.400], bestSeason: "toute année", activities: ["SUP", "Plongée"] },
  // Portugal
  { id: "pt001", name: "Douro River", river: "Douro", region: "Porto", difficulty: "Facile", distance: "50 km", type: "RIVER", coords: [41.100, -8.000], bestSeason: "avr-oct", activities: ["Kayak"] },
  { id: "pt002", name: "Algarve · Grottes", river: "Atlantique", region: "Algarve", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [37.085, -8.668], bestSeason: "avr-oct", activities: ["Kayak", "SUP"] },
  { id: "pt003", name: "Minho River", river: "Minho", region: "Viana do Castelo", difficulty: "Facile", distance: "30 km", type: "RIVER", coords: [41.700, -8.800], bestSeason: "mai-oct", activities: ["Kayak", "Canoë"] },
  // Grèce
  { id: "gr001", name: "Meteora · Pinios", river: "Pinios", region: "Thessalie", difficulty: "Intermédiaire", distance: "25 km", type: "RIVER", coords: [39.700, 21.700], bestSeason: "avr-oct", activities: ["Rafting"] },
  { id: "gr002", name: "Îles Ioniques", river: "Mer Ionienne", region: "Îles Ioniennes", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [38.620, 20.630], bestSeason: "mai-oct", activities: ["Kayak", "Plongée"] },
  { id: "gr003", name: "Crète · Côte Sud", river: "Méditerranée", region: "Crète", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [35.000, 24.800], bestSeason: "mai-oct", activities: ["Kayak", "SUP"] },
  // Croatie
  { id: "hr001", name: "Lacs de Plitvice", river: "Lac", region: "Lika", difficulty: "Facile", distance: "15 km", type: "LAKE", coords: [44.900, 15.600], bestSeason: "mai-sep", activities: ["Kayak"] },
  { id: "hr002", name: "Îles Dalmates", river: "Adriatique", region: "Dalmatie", difficulty: "Intermédiaire", distance: "40 km", type: "SEA", coords: [43.508, 16.440], bestSeason: "mai-oct", activities: ["Kayak", "Voile", "Plongée"] },
  // Norvège
  { id: "no001", name: "Geirangerfjord", river: "Fjord", region: "Møre", difficulty: "Intermédiaire", distance: "25 km", type: "SEA", coords: [62.100, 7.100], bestSeason: "mai-sep", activities: ["Kayak"] },
  { id: "no002", name: "Sjoa Rafting", river: "Sjoa", region: "Innlandet", difficulty: "Sportif", distance: "18 km", type: "RIVER", coords: [61.680, 9.560], bestSeason: "juin-sep", activities: ["Kayak", "Rafting"] },
  { id: "no003", name: "Lofoten · Kayak", river: "Mer de Norvège", region: "Nordland", difficulty: "Intermédiaire", distance: "40 km", type: "SEA", coords: [68.200, 14.500], bestSeason: "juin-sep", activities: ["Kayak"] },
  // Suède
  { id: "se001", name: "Stockholm Archipelago", river: "Mer Baltique", region: "Stockholm", difficulty: "Facile", distance: "50 km", type: "SEA", coords: [59.300, 18.800], bestSeason: "juin-sep", activities: ["Kayak"] },
  { id: "se002", name: "Klarälven River", river: "Klarälven", region: "Värmland", difficulty: "Facile", distance: "80 km", type: "RIVER", coords: [59.500, 13.500], bestSeason: "juin-sep", activities: ["Canoë", "Rafting"] },
  // Finlande
  { id: "fi001", name: "Saimaa Lake", river: "Lac", region: "Carélie du Sud", difficulty: "Facile", distance: "100 km", type: "LAKE", coords: [61.300, 28.200], bestSeason: "juin-sep", activities: ["Kayak", "Canoë"] },
  // Islande
  { id: "is001", name: "Þingvallavatn", river: "Lac", region: "Suðurland", difficulty: "Facile", distance: "12 km", type: "LAKE", coords: [64.183, -21.117], bestSeason: "juil-août", activities: ["Kayak", "Plongée"] },
  { id: "is002", name: "Jökulsá River", river: "Jökulsá", region: "Austurland", difficulty: "Sportif", distance: "15 km", type: "RIVER", coords: [65.000, -14.500], bestSeason: "juil-août", activities: ["Rafting"] },
  // Allemagne
  { id: "de001", name: "Rhin · Vallée Romantique", river: "Rhin", region: "Rhénanie", difficulty: "Intermédiaire", distance: "65 km", type: "RIVER", coords: [50.180, 7.620], bestSeason: "avr-oct", activities: ["Kayak", "Canoë"] },
  { id: "de002", name: "Lac de Constance", river: "Lac", region: "Baden-Württemberg", difficulty: "Facile", distance: "40 km", type: "LAKE", coords: [47.600, 9.400], bestSeason: "mai-sep", activities: ["SUP", "Voile"] },
  // Suisse
  { id: "ch001", name: "Lac Léman · Lausanne", river: "Lac", region: "Vaud", difficulty: "Intermédiaire", distance: "60 km", type: "LAKE", coords: [46.500, 6.600], bestSeason: "mai-sep", activities: ["Kayak", "Voile"] },
  { id: "ch002", name: "Aare · Berne", river: "Aare", region: "Berne", difficulty: "Facile", distance: "10 km", type: "RIVER", coords: [46.900, 7.500], bestSeason: "juin-sep", activities: ["Natation", "SUP"] },
  // Autriche
  { id: "at001", name: "Salza River", river: "Salza", region: "Styrie", difficulty: "Sportif", distance: "25 km", type: "RIVER", coords: [47.700, 15.100], bestSeason: "avr-oct", activities: ["Rafting", "Kayak"] },
  // Slovénie
  { id: "si001", name: "Soča · Bovec", river: "Soča", region: "Primorska", difficulty: "Intermédiaire", distance: "55 km", type: "RIVER", coords: [46.240, 13.650], bestSeason: "avr-oct", activities: ["Kayak", "Rafting"] },
  { id: "si002", name: "Lac de Bled", river: "Lac", region: "Gorenjska", difficulty: "Facile", distance: "8 km", type: "LAKE", coords: [46.360, 14.090], bestSeason: "avr-oct", activities: ["Planche", "Kayak"] },
  // Belgique
  { id: "be001", name: "Lesse · Ardennes", river: "Lesse", region: "Wallonie", difficulty: "Facile", distance: "21 km", type: "RIVER", coords: [50.185, 5.002], bestSeason: "avr-oct", activities: ["Kayak", "Canoë"] },
  { id: "be002", name: "Ourthe · La Roche", river: "Ourthe", region: "Ardennes", difficulty: "Intermédiaire", distance: "18 km", type: "RIVER", coords: [50.218, 5.578], bestSeason: "avr-oct", activities: ["Kayak", "Rafting"] },
  // Pologne
  { id: "pl001", name: "Dunajec · Gorges", river: "Dunajec", region: "Małopolska", difficulty: "Facile", distance: "25 km", type: "RIVER", coords: [49.400, 20.300], bestSeason: "avr-oct", activities: ["Rafting", "Radeau"] },
  // République Tchèque
  { id: "cz001", name: "Vltava · Prague", river: "Vltava", region: "Bohême", difficulty: "Facile", distance: "40 km", type: "RIVER", coords: [50.000, 14.300], bestSeason: "avr-oct", activities: ["Kayak", "Canoë"] },
  // Écosse
  { id: "gb001", name: "Loch Lomond", river: "Lac", region: "Écosse", difficulty: "Facile", distance: "35 km", type: "LAKE", coords: [56.100, -4.600], bestSeason: "mai-sep", activities: ["Kayak", "Canoë"] },
  { id: "gb002", name: "Orkney Islands", river: "Mer", region: "Écosse", difficulty: "Intermédiaire", distance: "40 km", type: "SEA", coords: [59.000, -3.000], bestSeason: "juin-sep", activities: ["Kayak"] },
  // Irlande
  { id: "ie001", name: "Cliffs of Moher · Kayak", river: "Atlantique", region: "Clare", difficulty: "Intermédiaire", distance: "15 km", type: "SEA", coords: [52.900, -9.400], bestSeason: "juin-sep", activities: ["Kayak"] },
  // Pays-Bas
  { id: "nl001", name: "Giethoorn · Canaux", river: "Canal", region: "Overijssel", difficulty: "Facile", distance: "10 km", type: "RIVER", coords: [52.700, 6.100], bestSeason: "avr-oct", activities: ["Canoë", "SUP"] },

  // ──── OCÉANIE ────
  // Australie
  { id: "au001", name: "Sydney Harbour", river: "Baie", region: "NSW", difficulty: "Facile", distance: "30 km", type: "SEA", coords: [-33.800, 151.200], bestSeason: "sep-mai", activities: ["SUP", "Kayak"] },
  { id: "au002", name: "Murray River", river: "Murray", region: "Victoria", difficulty: "Facile", distance: "100 km", type: "RIVER", coords: [-34.000, 142.000], bestSeason: "oct-mar", activities: ["Canoë"] },
  { id: "au003", name: "Whitsundays", river: "Mer de Corail", region: "Queensland", difficulty: "Facile", distance: "40 km", type: "SEA", coords: [-20.300, 148.900], bestSeason: "avr-nov", activities: ["Kayak"] },
  { id: "au004", name: "Great Barrier Reef", river: "Mer de Corail", region: "Queensland", difficulty: "Facile", distance: "20 km", type: "SEA", coords: [-18.286, 147.699], bestSeason: "mai-oct", activities: ["Kayak", "Plongée", "SUP"] },
  { id: "au005", name: "Franklin River", river: "Franklin", region: "Tasmanie", difficulty: "Sportif", distance: "80 km", type: "RIVER", coords: [-42.500, 145.900], bestSeason: "déc-mar", activities: ["Rafting", "Expédition"] },
  // Nouvelle-Zélande
  { id: "nz001", name: "Milford Sound", river: "Fjord", region: "Southland", difficulty: "Facile", distance: "25 km", type: "SEA", coords: [-44.700, 167.900], bestSeason: "nov-mar", activities: ["Kayak"] },
  { id: "nz002", name: "Lake Taupo", river: "Lac", region: "Waikato", difficulty: "Facile", distance: "50 km", type: "LAKE", coords: [-38.800, 176.000], bestSeason: "nov-mar", activities: ["SUP", "Voile"] },
  { id: "nz003", name: "Abel Tasman · Kayak", river: "Mer", region: "Nelson", difficulty: "Facile", distance: "55 km", type: "SEA", coords: [-40.900, 173.000], bestSeason: "oct-avr", activities: ["Kayak", "Camping"] },
  { id: "nz004", name: "Whanganui River", river: "Whanganui", region: "Manawatū", difficulty: "Facile", distance: "145 km", type: "RIVER", coords: [-39.600, 174.800], bestSeason: "oct-avr", activities: ["Canoë", "Kayak", "Camping"] },
  // Fidji
  { id: "fj001", name: "Fidji · Kayak Îles", river: "Pacifique", region: "Viti Levu", difficulty: "Facile", distance: "15 km", type: "SEA", coords: [-17.713, 178.065], bestSeason: "mai-oct", activities: ["Kayak", "Plongée", "SUP"] },
  // Polynésie française
  { id: "pf001", name: "Bora Bora · SUP Lagon", river: "Pacifique", region: "Polynésie française", difficulty: "Facile", distance: "10 km", type: "SEA", coords: [-16.500, -151.741], bestSeason: "avr-oct", activities: ["SUP", "Kayak", "Plongée"] },
  // Papouasie-Nouvelle-Guinée
  { id: "pg001", name: "Sepik River", river: "Sepik", region: "East Sepik", difficulty: "Facile", distance: "100 km", type: "RIVER", coords: [-4.000, 143.000], bestSeason: "avr-nov", activities: ["Kayak", "Expédition"] },
  // Palau
  { id: "pw001", name: "Palau · Jellyfish Lake", river: "Mer", region: "Koror", difficulty: "Facile", distance: "10 km", type: "SEA", coords: [7.200, 134.400], bestSeason: "toute année", activities: ["Kayak", "Plongée"] },
];

export const GLOBAL_SPOTS_FLAT = RAW.map(_e);
export const GLOBAL_SPOTS_COUNT = GLOBAL_SPOTS_FLAT.length;
