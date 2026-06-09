// ─── FLEUVIBE DATA v6.0 ───────────────────────────────────────────────────────
// 195+ pays, 50+ partenaires, spots mondiaux, système de commissions
import { GLOBAL_SPOTS_FLAT } from './spots.js';

// ─── 195+ PAYS ───────────────────────────────────────────────────────────────
export const ALL_COUNTRIES = {
  // AFRIQUE
  DZ: { name: "Algérie",          flag: "🇩🇿", continent: "AF", code: "+213", currency: "DZD", language: "ar", commission: 15 },
  AO: { name: "Angola",           flag: "🇦🇴", continent: "AF", code: "+244", currency: "AOA", language: "pt", commission: 12 },
  BJ: { name: "Bénin",            flag: "🇧🇯", continent: "AF", code: "+229", currency: "XOF", language: "fr", commission: 10 },
  BW: { name: "Botswana",         flag: "🇧🇼", continent: "AF", code: "+267", currency: "BWP", language: "en", commission: 12 },
  BF: { name: "Burkina Faso",     flag: "🇧🇫", continent: "AF", code: "+226", currency: "XOF", language: "fr", commission: 10 },
  BI: { name: "Burundi",          flag: "🇧🇮", continent: "AF", code: "+257", currency: "BIF", language: "fr", commission: 10 },
  CM: { name: "Cameroun",         flag: "🇨🇲", continent: "AF", code: "+237", currency: "XAF", language: "fr", commission: 12 },
  CV: { name: "Cap-Vert",         flag: "🇨🇻", continent: "AF", code: "+238", currency: "CVE", language: "pt", commission: 15 },
  CF: { name: "Centrafrique",     flag: "🇨🇫", continent: "AF", code: "+236", currency: "XAF", language: "fr", commission: 10 },
  TD: { name: "Tchad",            flag: "🇹🇩", continent: "AF", code: "+235", currency: "XAF", language: "fr", commission: 10 },
  KM: { name: "Comores",          flag: "🇰🇲", continent: "AF", code: "+269", currency: "KMF", language: "fr", commission: 12 },
  CG: { name: "Congo",            flag: "🇨🇬", continent: "AF", code: "+242", currency: "XAF", language: "fr", commission: 12 },
  CD: { name: "RDC",              flag: "🇨🇩", continent: "AF", code: "+243", currency: "CDF", language: "fr", commission: 12 },
  CI: { name: "Côte d'Ivoire",    flag: "🇨🇮", continent: "AF", code: "+225", currency: "XOF", language: "fr", commission: 12 },
  DJ: { name: "Djibouti",         flag: "🇩🇯", continent: "AF", code: "+253", currency: "DJF", language: "fr", commission: 10 },
  EG: { name: "Égypte",           flag: "🇪🇬", continent: "AF", code: "+20",  currency: "EGP", language: "ar", commission: 15 },
  ER: { name: "Érythrée",         flag: "🇪🇷", continent: "AF", code: "+291", currency: "ERN", language: "ti", commission: 10 },
  SZ: { name: "Eswatini",         flag: "🇸🇿", continent: "AF", code: "+268", currency: "SZL", language: "en", commission: 10 },
  ET: { name: "Éthiopie",         flag: "🇪🇹", continent: "AF", code: "+251", currency: "ETB", language: "am", commission: 12 },
  GA: { name: "Gabon",            flag: "🇬🇦", continent: "AF", code: "+241", currency: "XAF", language: "fr", commission: 12 },
  GM: { name: "Gambie",           flag: "🇬🇲", continent: "AF", code: "+220", currency: "GMD", language: "en", commission: 10 },
  GH: { name: "Ghana",            flag: "🇬🇭", continent: "AF", code: "+233", currency: "GHS", language: "en", commission: 12 },
  GN: { name: "Guinée",           flag: "🇬🇳", continent: "AF", code: "+224", currency: "GNF", language: "fr", commission: 10 },
  GW: { name: "Guinée-Bissau",    flag: "🇬🇼", continent: "AF", code: "+245", currency: "XOF", language: "pt", commission: 10 },
  KE: { name: "Kenya",            flag: "🇰🇪", continent: "AF", code: "+254", currency: "KES", language: "sw", commission: 15 },
  LS: { name: "Lesotho",          flag: "🇱🇸", continent: "AF", code: "+266", currency: "LSL", language: "st", commission: 10 },
  LR: { name: "Libéria",          flag: "🇱🇷", continent: "AF", code: "+231", currency: "LRD", language: "en", commission: 10 },
  LY: { name: "Libye",            flag: "🇱🇾", continent: "AF", code: "+218", currency: "LYD", language: "ar", commission: 12 },
  MG: { name: "Madagascar",       flag: "🇲🇬", continent: "AF", code: "+261", currency: "MGA", language: "mg", commission: 12 },
  MW: { name: "Malawi",           flag: "🇲🇼", continent: "AF", code: "+265", currency: "MWK", language: "en", commission: 10 },
  ML: { name: "Mali",             flag: "🇲🇱", continent: "AF", code: "+223", currency: "XOF", language: "fr", commission: 10 },
  MR: { name: "Mauritanie",       flag: "🇲🇷", continent: "AF", code: "+222", currency: "MRU", language: "ar", commission: 10 },
  MU: { name: "Maurice",          flag: "🇲🇺", continent: "AF", code: "+230", currency: "MUR", language: "en", commission: 15 },
  MA: { name: "Maroc",            flag: "🇲🇦", continent: "AF", code: "+212", currency: "MAD", language: "ar", commission: 15 },
  MZ: { name: "Mozambique",       flag: "🇲🇿", continent: "AF", code: "+258", currency: "MZN", language: "pt", commission: 12 },
  NA: { name: "Namibie",          flag: "🇳🇦", continent: "AF", code: "+264", currency: "NAD", language: "en", commission: 12 },
  NE: { name: "Niger",            flag: "🇳🇪", continent: "AF", code: "+227", currency: "XOF", language: "fr", commission: 10 },
  NG: { name: "Nigéria",          flag: "🇳🇬", continent: "AF", code: "+234", currency: "NGN", language: "en", commission: 15 },
  RW: { name: "Rwanda",           flag: "🇷🇼", continent: "AF", code: "+250", currency: "RWF", language: "rw", commission: 12 },
  ST: { name: "São Tomé",         flag: "🇸🇹", continent: "AF", code: "+239", currency: "STN", language: "pt", commission: 10 },
  SN: { name: "Sénégal",          flag: "🇸🇳", continent: "AF", code: "+221", currency: "XOF", language: "fr", commission: 12 },
  SC: { name: "Seychelles",       flag: "🇸🇨", continent: "AF", code: "+248", currency: "SCR", language: "fr", commission: 15 },
  SL: { name: "Sierra Leone",     flag: "🇸🇱", continent: "AF", code: "+232", currency: "SLL", language: "en", commission: 10 },
  SO: { name: "Somalie",          flag: "🇸🇴", continent: "AF", code: "+252", currency: "SOS", language: "so", commission: 10 },
  ZA: { name: "Afrique du Sud",   flag: "🇿🇦", continent: "AF", code: "+27",  currency: "ZAR", language: "af", commission: 18 },
  SS: { name: "Soudan du Sud",    flag: "🇸🇸", continent: "AF", code: "+211", currency: "SSP", language: "en", commission: 10 },
  SD: { name: "Soudan",           flag: "🇸🇩", continent: "AF", code: "+249", currency: "SDG", language: "ar", commission: 10 },
  TZ: { name: "Tanzanie",         flag: "🇹🇿", continent: "AF", code: "+255", currency: "TZS", language: "sw", commission: 15 },
  TG: { name: "Togo",             flag: "🇹🇬", continent: "AF", code: "+228", currency: "XOF", language: "fr", commission: 10 },
  TN: { name: "Tunisie",          flag: "🇹🇳", continent: "AF", code: "+216", currency: "TND", language: "ar", commission: 15 },
  UG: { name: "Ouganda",          flag: "🇺🇬", continent: "AF", code: "+256", currency: "UGX", language: "sw", commission: 12 },
  ZM: { name: "Zambie",           flag: "🇿🇲", continent: "AF", code: "+260", currency: "ZMW", language: "en", commission: 12 },
  ZW: { name: "Zimbabwe",         flag: "🇿🇼", continent: "AF", code: "+263", currency: "ZWL", language: "en", commission: 12 },

  // AMÉRIQUES
  CA: { name: "Canada",                    flag: "🇨🇦", continent: "AM", code: "+1",   currency: "CAD", language: "fr", commission: 20 },
  US: { name: "États-Unis",               flag: "🇺🇸", continent: "AM", code: "+1",   currency: "USD", language: "en", commission: 20 },
  MX: { name: "Mexique",                  flag: "🇲🇽", continent: "AM", code: "+52",  currency: "MXN", language: "es", commission: 18 },
  GT: { name: "Guatemala",                flag: "🇬🇹", continent: "AM", code: "+502", currency: "GTQ", language: "es", commission: 12 },
  BZ: { name: "Belize",                   flag: "🇧🇿", continent: "AM", code: "+501", currency: "BZD", language: "en", commission: 15 },
  SV: { name: "Salvador",                 flag: "🇸🇻", continent: "AM", code: "+503", currency: "USD", language: "es", commission: 12 },
  HN: { name: "Honduras",                 flag: "🇭🇳", continent: "AM", code: "+504", currency: "HNL", language: "es", commission: 12 },
  NI: { name: "Nicaragua",                flag: "🇳🇮", continent: "AM", code: "+505", currency: "NIO", language: "es", commission: 12 },
  CR: { name: "Costa Rica",               flag: "🇨🇷", continent: "AM", code: "+506", currency: "CRC", language: "es", commission: 18 },
  PA: { name: "Panama",                   flag: "🇵🇦", continent: "AM", code: "+507", currency: "PAB", language: "es", commission: 15 },
  CU: { name: "Cuba",                     flag: "🇨🇺", continent: "AM", code: "+53",  currency: "CUP", language: "es", commission: 10 },
  JM: { name: "Jamaïque",                 flag: "🇯🇲", continent: "AM", code: "+1",   currency: "JMD", language: "en", commission: 15 },
  HT: { name: "Haïti",                    flag: "🇭🇹", continent: "AM", code: "+509", currency: "HTG", language: "fr", commission: 10 },
  DO: { name: "Rép. dominicaine",         flag: "🇩🇴", continent: "AM", code: "+1",   currency: "DOP", language: "es", commission: 15 },
  PR: { name: "Porto Rico",               flag: "🇵🇷", continent: "AM", code: "+1",   currency: "USD", language: "es", commission: 15 },
  BS: { name: "Bahamas",                  flag: "🇧🇸", continent: "AM", code: "+1",   currency: "BSD", language: "en", commission: 18 },
  TT: { name: "Trinité",                  flag: "🇹🇹", continent: "AM", code: "+1",   currency: "TTD", language: "en", commission: 12 },
  BB: { name: "Barbade",                  flag: "🇧🇧", continent: "AM", code: "+1",   currency: "BBD", language: "en", commission: 12 },
  LC: { name: "Sainte-Lucie",             flag: "🇱🇨", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  VC: { name: "Saint-Vincent",            flag: "🇻🇨", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  GD: { name: "Grenade",                  flag: "🇬🇩", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  AG: { name: "Antigua",                  flag: "🇦🇬", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  KN: { name: "Saint-Christophe",         flag: "🇰🇳", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  DM: { name: "Dominique",               flag: "🇩🇲", continent: "AM", code: "+1",   currency: "XCD", language: "en", commission: 12 },
  CO: { name: "Colombie",                 flag: "🇨🇴", continent: "AM", code: "+57",  currency: "COP", language: "es", commission: 15 },
  VE: { name: "Venezuela",               flag: "🇻🇪", continent: "AM", code: "+58",  currency: "VES", language: "es", commission: 12 },
  GY: { name: "Guyana",                   flag: "🇬🇾", continent: "AM", code: "+592", currency: "GYD", language: "en", commission: 10 },
  SR: { name: "Suriname",                 flag: "🇸🇷", continent: "AM", code: "+597", currency: "SRD", language: "nl", commission: 10 },
  GF: { name: "Guyane française",         flag: "🇬🇫", continent: "AM", code: "+594", currency: "EUR", language: "fr", commission: 15 },
  EC: { name: "Équateur",                 flag: "🇪🇨", continent: "AM", code: "+593", currency: "USD", language: "es", commission: 15 },
  PE: { name: "Pérou",                    flag: "🇵🇪", continent: "AM", code: "+51",  currency: "PEN", language: "es", commission: 15 },
  BO: { name: "Bolivie",                  flag: "🇧🇴", continent: "AM", code: "+591", currency: "BOB", language: "es", commission: 12 },
  BR: { name: "Brésil",                   flag: "🇧🇷", continent: "AM", code: "+55",  currency: "BRL", language: "pt", commission: 20 },
  PY: { name: "Paraguay",                 flag: "🇵🇾", continent: "AM", code: "+595", currency: "PYG", language: "es", commission: 12 },
  CL: { name: "Chili",                    flag: "🇨🇱", continent: "AM", code: "+56",  currency: "CLP", language: "es", commission: 15 },
  AR: { name: "Argentine",               flag: "🇦🇷", continent: "AM", code: "+54",  currency: "ARS", language: "es", commission: 18 },
  UY: { name: "Uruguay",                  flag: "🇺🇾", continent: "AM", code: "+598", currency: "UYU", language: "es", commission: 12 },
  FK: { name: "Malouines",               flag: "🇫🇰", continent: "AM", code: "+500", currency: "FKP", language: "en", commission: 10 },

  // ASIE
  RU: { name: "Russie",             flag: "🇷🇺", continent: "AS", code: "+7",   currency: "RUB", language: "ru", commission: 15 },
  GE: { name: "Géorgie",            flag: "🇬🇪", continent: "AS", code: "+995", currency: "GEL", language: "ka", commission: 12 },
  AM: { name: "Arménie",            flag: "🇦🇲", continent: "AS", code: "+374", currency: "AMD", language: "hy", commission: 10 },
  AZ: { name: "Azerbaïdjan",        flag: "🇦🇿", continent: "AS", code: "+994", currency: "AZN", language: "az", commission: 10 },
  KZ: { name: "Kazakhstan",         flag: "🇰🇿", continent: "AS", code: "+7",   currency: "KZT", language: "kk", commission: 12 },
  KG: { name: "Kirghizistan",       flag: "🇰🇬", continent: "AS", code: "+996", currency: "KGS", language: "ky", commission: 10 },
  TJ: { name: "Tadjikistan",        flag: "🇹🇯", continent: "AS", code: "+992", currency: "TJS", language: "tg", commission: 10 },
  TM: { name: "Turkménistan",       flag: "🇹🇲", continent: "AS", code: "+993", currency: "TMT", language: "tk", commission: 10 },
  UZ: { name: "Ouzbékistan",        flag: "🇺🇿", continent: "AS", code: "+998", currency: "UZS", language: "uz", commission: 10 },
  CN: { name: "Chine",              flag: "🇨🇳", continent: "AS", code: "+86",  currency: "CNY", language: "zh", commission: 18 },
  TW: { name: "Taïwan",             flag: "🇹🇼", continent: "AS", code: "+886", currency: "TWD", language: "zh", commission: 15 },
  JP: { name: "Japon",              flag: "🇯🇵", continent: "AS", code: "+81",  currency: "JPY", language: "ja", commission: 20 },
  KR: { name: "Corée du Sud",       flag: "🇰🇷", continent: "AS", code: "+82",  currency: "KRW", language: "ko", commission: 18 },
  KP: { name: "Corée du Nord",      flag: "🇰🇵", continent: "AS", code: "+850", currency: "KPW", language: "ko", commission: 5  },
  MN: { name: "Mongolie",           flag: "🇲🇳", continent: "AS", code: "+976", currency: "MNT", language: "mn", commission: 10 },
  AF: { name: "Afghanistan",        flag: "🇦🇫", continent: "AS", code: "+93",  currency: "AFN", language: "ps", commission: 8  },
  PK: { name: "Pakistan",           flag: "🇵🇰", continent: "AS", code: "+92",  currency: "PKR", language: "ur", commission: 12 },
  IN: { name: "Inde",               flag: "🇮🇳", continent: "AS", code: "+91",  currency: "INR", language: "hi", commission: 18 },
  NP: { name: "Népal",              flag: "🇳🇵", continent: "AS", code: "+977", currency: "NPR", language: "ne", commission: 15 },
  BT: { name: "Bhoutan",            flag: "🇧🇹", continent: "AS", code: "+975", currency: "BTN", language: "dz", commission: 12 },
  BD: { name: "Bangladesh",         flag: "🇧🇩", continent: "AS", code: "+880", currency: "BDT", language: "bn", commission: 12 },
  MM: { name: "Birmanie",           flag: "🇲🇲", continent: "AS", code: "+95",  currency: "MMK", language: "my", commission: 10 },
  TH: { name: "Thaïlande",          flag: "🇹🇭", continent: "AS", code: "+66",  currency: "THB", language: "th", commission: 18 },
  LA: { name: "Laos",               flag: "🇱🇦", continent: "AS", code: "+856", currency: "LAK", language: "lo", commission: 12 },
  KH: { name: "Cambodge",           flag: "🇰🇭", continent: "AS", code: "+855", currency: "KHR", language: "km", commission: 15 },
  VN: { name: "Vietnam",            flag: "🇻🇳", continent: "AS", code: "+84",  currency: "VND", language: "vi", commission: 15 },
  MY: { name: "Malaisie",           flag: "🇲🇾", continent: "AS", code: "+60",  currency: "MYR", language: "ms", commission: 15 },
  SG: { name: "Singapour",          flag: "🇸🇬", continent: "AS", code: "+65",  currency: "SGD", language: "en", commission: 20 },
  ID: { name: "Indonésie",          flag: "🇮🇩", continent: "AS", code: "+62",  currency: "IDR", language: "id", commission: 18 },
  PH: { name: "Philippines",        flag: "🇵🇭", continent: "AS", code: "+63",  currency: "PHP", language: "tl", commission: 15 },
  TL: { name: "Timor",              flag: "🇹🇱", continent: "AS", code: "+670", currency: "USD", language: "pt", commission: 10 },
  BN: { name: "Brunei",             flag: "🇧🇳", continent: "AS", code: "+673", currency: "BND", language: "ms", commission: 12 },
  LK: { name: "Sri Lanka",          flag: "🇱🇰", continent: "AS", code: "+94",  currency: "LKR", language: "si", commission: 15 },
  MV: { name: "Maldives",           flag: "🇲🇻", continent: "AS", code: "+960", currency: "MVR", language: "dv", commission: 20 },
  IR: { name: "Iran",               flag: "🇮🇷", continent: "AS", code: "+98",  currency: "IRR", language: "fa", commission: 10 },
  IQ: { name: "Irak",               flag: "🇮🇶", continent: "AS", code: "+964", currency: "IQD", language: "ar", commission: 10 },
  SA: { name: "Arabie saoudite",    flag: "🇸🇦", continent: "AS", code: "+966", currency: "SAR", language: "ar", commission: 15 },
  YE: { name: "Yémen",              flag: "🇾🇪", continent: "AS", code: "+967", currency: "YER", language: "ar", commission: 8  },
  OM: { name: "Oman",               flag: "🇴🇲", continent: "AS", code: "+968", currency: "OMR", language: "ar", commission: 12 },
  AE: { name: "EAU",                flag: "🇦🇪", continent: "AS", code: "+971", currency: "AED", language: "ar", commission: 20 },
  QA: { name: "Qatar",              flag: "🇶🇦", continent: "AS", code: "+974", currency: "QAR", language: "ar", commission: 18 },
  BH: { name: "Bahreïn",            flag: "🇧🇭", continent: "AS", code: "+973", currency: "BHD", language: "ar", commission: 15 },
  KW: { name: "Koweït",             flag: "🇰🇼", continent: "AS", code: "+965", currency: "KWD", language: "ar", commission: 15 },
  LB: { name: "Liban",              flag: "🇱🇧", continent: "AS", code: "+961", currency: "LBP", language: "ar", commission: 12 },
  JO: { name: "Jordanie",           flag: "🇯🇴", continent: "AS", code: "+962", currency: "JOD", language: "ar", commission: 12 },
  PS: { name: "Palestine",          flag: "🇵🇸", continent: "AS", code: "+970", currency: "ILS", language: "ar", commission: 10 },
  IL: { name: "Israël",             flag: "🇮🇱", continent: "AS", code: "+972", currency: "ILS", language: "he", commission: 18 },
  CY: { name: "Chypre",             flag: "🇨🇾", continent: "AS", code: "+357", currency: "EUR", language: "el", commission: 15 },
  TR: { name: "Turquie",            flag: "🇹🇷", continent: "AS", code: "+90",  currency: "TRY", language: "tr", commission: 18 },
  SY: { name: "Syrie",              flag: "🇸🇾", continent: "AS", code: "+963", currency: "SYP", language: "ar", commission: 8  },

  // EUROPE
  AL: { name: "Albanie",            flag: "🇦🇱", continent: "EU", code: "+355", currency: "ALL", language: "sq", commission: 12 },
  AD: { name: "Andorre",            flag: "🇦🇩", continent: "EU", code: "+376", currency: "EUR", language: "ca", commission: 12 },
  AT: { name: "Autriche",           flag: "🇦🇹", continent: "EU", code: "+43",  currency: "EUR", language: "de", commission: 18 },
  BY: { name: "Biélorussie",        flag: "🇧🇾", continent: "EU", code: "+375", currency: "BYN", language: "be", commission: 10 },
  BE: { name: "Belgique",           flag: "🇧🇪", continent: "EU", code: "+32",  currency: "EUR", language: "fr", commission: 18 },
  BA: { name: "Bosnie",             flag: "🇧🇦", continent: "EU", code: "+387", currency: "BAM", language: "bs", commission: 12 },
  BG: { name: "Bulgarie",           flag: "🇧🇬", continent: "EU", code: "+359", currency: "BGN", language: "bg", commission: 15 },
  HR: { name: "Croatie",            flag: "🇭🇷", continent: "EU", code: "+385", currency: "EUR", language: "hr", commission: 20 },
  CZ: { name: "Tchéquie",           flag: "🇨🇿", continent: "EU", code: "+420", currency: "CZK", language: "cs", commission: 15 },
  DK: { name: "Danemark",           flag: "🇩🇰", continent: "EU", code: "+45",  currency: "DKK", language: "da", commission: 20 },
  EE: { name: "Estonie",            flag: "🇪🇪", continent: "EU", code: "+372", currency: "EUR", language: "et", commission: 15 },
  FI: { name: "Finlande",           flag: "🇫🇮", continent: "EU", code: "+358", currency: "EUR", language: "fi", commission: 18 },
  FR: { name: "France",             flag: "🇫🇷", continent: "EU", code: "+33",  currency: "EUR", language: "fr", commission: 20 },
  DE: { name: "Allemagne",          flag: "🇩🇪", continent: "EU", code: "+49",  currency: "EUR", language: "de", commission: 20 },
  GR: { name: "Grèce",              flag: "🇬🇷", continent: "EU", code: "+30",  currency: "EUR", language: "el", commission: 20 },
  HU: { name: "Hongrie",            flag: "🇭🇺", continent: "EU", code: "+36",  currency: "HUF", language: "hu", commission: 15 },
  IS: { name: "Islande",            flag: "🇮🇸", continent: "EU", code: "+354", currency: "ISK", language: "is", commission: 20 },
  IE: { name: "Irlande",            flag: "🇮🇪", continent: "EU", code: "+353", currency: "EUR", language: "ga", commission: 18 },
  IT: { name: "Italie",             flag: "🇮🇹", continent: "EU", code: "+39",  currency: "EUR", language: "it", commission: 20 },
  XK: { name: "Kosovo",             flag: "🇽🇰", continent: "EU", code: "+383", currency: "EUR", language: "sq", commission: 12 },
  LV: { name: "Lettonie",           flag: "🇱🇻", continent: "EU", code: "+371", currency: "EUR", language: "lv", commission: 15 },
  LI: { name: "Liechtenstein",      flag: "🇱🇮", continent: "EU", code: "+423", currency: "CHF", language: "de", commission: 15 },
  LT: { name: "Lituanie",           flag: "🇱🇹", continent: "EU", code: "+370", currency: "EUR", language: "lt", commission: 15 },
  LU: { name: "Luxembourg",         flag: "🇱🇺", continent: "EU", code: "+352", currency: "EUR", language: "lb", commission: 18 },
  MT: { name: "Malte",              flag: "🇲🇹", continent: "EU", code: "+356", currency: "EUR", language: "mt", commission: 15 },
  MD: { name: "Moldavie",           flag: "🇲🇩", continent: "EU", code: "+373", currency: "MDL", language: "ro", commission: 10 },
  MC: { name: "Monaco",             flag: "🇲🇨", continent: "EU", code: "+377", currency: "EUR", language: "fr", commission: 18 },
  ME: { name: "Monténégro",         flag: "🇲🇪", continent: "EU", code: "+382", currency: "EUR", language: "sr", commission: 15 },
  NL: { name: "Pays-Bas",           flag: "🇳🇱", continent: "EU", code: "+31",  currency: "EUR", language: "nl", commission: 18 },
  MK: { name: "Macédoine",          flag: "🇲🇰", continent: "EU", code: "+389", currency: "MKD", language: "mk", commission: 12 },
  NO: { name: "Norvège",            flag: "🇳🇴", continent: "EU", code: "+47",  currency: "NOK", language: "no", commission: 20 },
  PL: { name: "Pologne",            flag: "🇵🇱", continent: "EU", code: "+48",  currency: "PLN", language: "pl", commission: 18 },
  PT: { name: "Portugal",           flag: "🇵🇹", continent: "EU", code: "+351", currency: "EUR", language: "pt", commission: 18 },
  RO: { name: "Roumanie",           flag: "🇷🇴", continent: "EU", code: "+40",  currency: "RON", language: "ro", commission: 15 },
  SM: { name: "Saint-Marin",        flag: "🇸🇲", continent: "EU", code: "+378", currency: "EUR", language: "it", commission: 12 },
  RS: { name: "Serbie",             flag: "🇷🇸", continent: "EU", code: "+381", currency: "RSD", language: "sr", commission: 15 },
  SK: { name: "Slovaquie",          flag: "🇸🇰", continent: "EU", code: "+421", currency: "EUR", language: "sk", commission: 15 },
  SI: { name: "Slovénie",           flag: "🇸🇮", continent: "EU", code: "+386", currency: "EUR", language: "sl", commission: 18 },
  ES: { name: "Espagne",            flag: "🇪🇸", continent: "EU", code: "+34",  currency: "EUR", language: "es", commission: 20 },
  SE: { name: "Suède",              flag: "🇸🇪", continent: "EU", code: "+46",  currency: "SEK", language: "sv", commission: 20 },
  CH: { name: "Suisse",             flag: "🇨🇭", continent: "EU", code: "+41",  currency: "CHF", language: "de", commission: 20 },
  UA: { name: "Ukraine",            flag: "🇺🇦", continent: "EU", code: "+380", currency: "UAH", language: "uk", commission: 12 },
  GB: { name: "Royaume-Uni",        flag: "🇬🇧", continent: "EU", code: "+44",  currency: "GBP", language: "en", commission: 20 },
  VA: { name: "Vatican",            flag: "🇻🇦", continent: "EU", code: "+379", currency: "EUR", language: "it", commission: 10 },

  // OCÉANIE
  AU: { name: "Australie",          flag: "🇦🇺", continent: "OC", code: "+61",  currency: "AUD", language: "en", commission: 20 },
  NZ: { name: "Nouvelle-Zélande",   flag: "🇳🇿", continent: "OC", code: "+64",  currency: "NZD", language: "en", commission: 20 },
  PG: { name: "Papouasie",          flag: "🇵🇬", continent: "OC", code: "+675", currency: "PGK", language: "en", commission: 10 },
  FJ: { name: "Fidji",              flag: "🇫🇯", continent: "OC", code: "+679", currency: "FJD", language: "en", commission: 18 },
  SB: { name: "Salomon",            flag: "🇸🇧", continent: "OC", code: "+677", currency: "SBD", language: "en", commission: 10 },
  VU: { name: "Vanuatu",            flag: "🇻🇺", continent: "OC", code: "+678", currency: "VUV", language: "bi", commission: 12 },
  NC: { name: "Nouvelle-Calédonie", flag: "🇳🇨", continent: "OC", code: "+687", currency: "XPF", language: "fr", commission: 15 },
  PF: { name: "Polynésie",          flag: "🇵🇫", continent: "OC", code: "+689", currency: "XPF", language: "fr", commission: 18 },
  WS: { name: "Samoa",              flag: "🇼🇸", continent: "OC", code: "+685", currency: "WST", language: "sm", commission: 12 },
  TO: { name: "Tonga",              flag: "🇹🇴", continent: "OC", code: "+676", currency: "TOP", language: "to", commission: 12 },
  KI: { name: "Kiribati",           flag: "🇰🇮", continent: "OC", code: "+686", currency: "AUD", language: "en", commission: 10 },
  MH: { name: "Marshall",           flag: "🇲🇭", continent: "OC", code: "+692", currency: "USD", language: "mh", commission: 10 },
  FM: { name: "Micronésie",         flag: "🇫🇲", continent: "OC", code: "+691", currency: "USD", language: "en", commission: 10 },
  PW: { name: "Palaos",             flag: "🇵🇼", continent: "OC", code: "+680", currency: "USD", language: "pau",commission: 12 },
};

// ─── 50+ PARTENAIRES MONDIAUX ─────────────────────────────────────────────────
export const GLOBAL_PARTNERS = [
  // AFRIQUE
  { id: "af001", name: "Nile Rafters",          country: "EG", type: "Rafting",   commission: 18, rating: 4.8, price: 45,  currency: "USD", description: "Rafting sur le Nil",             emoji: "🏜️", routeIds: [] },
  { id: "af002", name: "Zambezi Expeditions",    country: "ZM", type: "Expédition",commission: 20, rating: 4.9, price: 120, currency: "USD", description: "Descente des chutes Victoria",    emoji: "🌊", routeIds: [1002] },
  { id: "af003", name: "Moroccan Kayak Tours",   country: "MA", type: "Guide",     commission: 15, rating: 4.7, price: 65,  currency: "EUR", description: "Kayak sur l'Atlas",               emoji: "🏔️", routeIds: [1003] },
  { id: "af004", name: "Cape Town Surf",         country: "ZA", type: "Surf",      commission: 20, rating: 4.9, price: 40,  currency: "ZAR", description: "Surf à Cape Town",               emoji: "🏄", routeIds: [1006] },
  { id: "af005", name: "Kenya Rafting",          country: "KE", type: "Rafting",   commission: 15, rating: 4.6, price: 55,  currency: "USD", description: "Rafting Tana River",              emoji: "🦁", routeIds: [] },
  { id: "af006", name: "Madagascar Kayak",       country: "MG", type: "Location",  commission: 15, rating: 4.7, price: 35,  currency: "EUR", description: "Exploration des lacs",            emoji: "🦎", routeIds: [] },
  { id: "af007", name: "Tanzania SUP",           country: "TZ", type: "SUP",       commission: 15, rating: 4.8, price: 30,  currency: "USD", description: "SUP sur le lac Malawi",           emoji: "🏝️", routeIds: [1004] },
  { id: "af008", name: "Namibian Canoe",         country: "NA", type: "Canoë",     commission: 15, rating: 4.7, price: 50,  currency: "NAD", description: "Canoë sur l'Orange",              emoji: "🏜️", routeIds: [] },
  // AMÉRIQUES
  { id: "am001", name: "Grand Canyon Rafting",   country: "US", type: "Rafting",   commission: 22, rating: 5.0, price: 250, currency: "USD", description: "Expédition Grand Canyon",         emoji: "🏜️", routeIds: [2001] },
  { id: "am002", name: "Canadian Wilderness",    country: "CA", type: "Expédition",commission: 20, rating: 4.9, price: 180, currency: "CAD", description: "Kayak dans les Rocheuses",       emoji: "🏔️", routeIds: [2002] },
  { id: "am003", name: "Costa Rica Rafting",     country: "CR", type: "Rafting",   commission: 18, rating: 4.9, price: 75,  currency: "USD", description: "Rafting jungle Pacuare",          emoji: "🌴", routeIds: [2005] },
  { id: "am004", name: "Patagonia Kayak",        country: "CL", type: "Kayak",     commission: 18, rating: 4.9, price: 120, currency: "USD", description: "Kayak Futaleufú",                emoji: "🏔️", routeIds: [2004] },
  { id: "am005", name: "Amazon SUP",             country: "BR", type: "SUP",       commission: 15, rating: 4.7, price: 60,  currency: "BRL", description: "SUP sur l'Amazone",              emoji: "🌳", routeIds: [2003] },
  { id: "am006", name: "Mexico Cenotes",         country: "MX", type: "Plongée",   commission: 18, rating: 4.8, price: 85,  currency: "USD", description: "Kayak dans les cénotes",         emoji: "💧", routeIds: [2006] },
  { id: "am007", name: "Alaska Sea Kayak",       country: "US", type: "Expédition",commission: 20, rating: 4.9, price: 200, currency: "USD", description: "Kayak dans les fjords",          emoji: "🐻", routeIds: [] },
  { id: "am008", name: "Caribbean SUP",          country: "BS", type: "SUP",       commission: 18, rating: 4.8, price: 45,  currency: "USD", description: "SUP aux Bahamas",                emoji: "🏖️", routeIds: [] },
  { id: "am009", name: "Peru Rafting",           country: "PE", type: "Rafting",   commission: 15, rating: 4.7, price: 70,  currency: "USD", description: "Apurímac source Amazone",        emoji: "🏔️", routeIds: [] },
  { id: "am010", name: "Colombia Kayak",         country: "CO", type: "Kayak",     commission: 15, rating: 4.6, price: 50,  currency: "COP", description: "Kayak Caño Cristales",           emoji: "🌈", routeIds: [] },
  { id: "am011", name: "Venezuela Canoe",        country: "VE", type: "Canoë",     commission: 12, rating: 4.5, price: 40,  currency: "USD", description: "Angel Falls Canoe",              emoji: "💦", routeIds: [] },
  { id: "am012", name: "Argentina Fishing",      country: "AR", type: "Pêche",     commission: 15, rating: 4.7, price: 150, currency: "USD", description: "Pêche Patagonie",                emoji: "🎣", routeIds: [] },
  // ASIE
  { id: "as001", name: "Ganges Rafting",         country: "IN", type: "Rafting",   commission: 18, rating: 4.8, price: 45,  currency: "INR", description: "Rafting sacré sur le Gange",     emoji: "🕉️", routeIds: [3001] },
  { id: "as002", name: "Vietnam Halong",         country: "VN", type: "Kayak",     commission: 18, rating: 4.9, price: 55,  currency: "USD", description: "Kayak baie d'Halong",            emoji: "⛰️", routeIds: [3004] },
  { id: "as003", name: "Thailand SUP",           country: "TH", type: "SUP",       commission: 18, rating: 4.8, price: 35,  currency: "THB", description: "SUP à Phuket",                  emoji: "🏝️", routeIds: [] },
  { id: "as004", name: "Indonesia Surf",         country: "ID", type: "Surf",      commission: 20, rating: 4.9, price: 40,  currency: "USD", description: "Surf à Bali",                    emoji: "🏄", routeIds: [3003] },
  { id: "as005", name: "Philippines Kayak",      country: "PH", type: "Kayak",     commission: 18, rating: 4.8, price: 35,  currency: "PHP", description: "Kayak à Palawan",               emoji: "🏝️", routeIds: [3005] },
  { id: "as006", name: "Japan River Tours",      country: "JP", type: "Guide",     commission: 20, rating: 4.9, price: 80,  currency: "JPY", description: "Yoshino River",                 emoji: "🌸", routeIds: [] },
  { id: "as007", name: "China Li River",         country: "CN", type: "Bambou",    commission: 18, rating: 4.7, price: 30,  currency: "CNY", description: "Bambou à Yangshuo",             emoji: "🐉", routeIds: [3002] },
  { id: "as008", name: "Nepal Rafting",          country: "NP", type: "Rafting",   commission: 18, rating: 4.8, price: 50,  currency: "USD", description: "Rafting Trisuli",                emoji: "🏔️", routeIds: [3006] },
  { id: "as009", name: "Sri Lanka SUP",          country: "LK", type: "SUP",       commission: 15, rating: 4.7, price: 30,  currency: "LKR", description: "SUP à Kandy",                   emoji: "🐘", routeIds: [] },
  { id: "as010", name: "Malaysia Kayak",         country: "MY", type: "Kayak",     commission: 15, rating: 4.6, price: 40,  currency: "MYR", description: "Kayak Bornéo",                  emoji: "🐒", routeIds: [] },
  // EUROPE
  { id: "eu001", name: "French Alps Kayak",      country: "FR", type: "Kayak",     commission: 20, rating: 4.9, price: 65,  currency: "EUR", description: "Kayak lac d'Annecy",             emoji: "🏔️", routeIds: [4002] },
  { id: "eu002", name: "Italian Lakes",          country: "IT", type: "SUP",       commission: 20, rating: 4.8, price: 35,  currency: "EUR", description: "SUP Lac de Garde",               emoji: "🏖️", routeIds: [4005] },
  { id: "eu003", name: "Swiss Canoe",            country: "CH", type: "Canoë",     commission: 20, rating: 4.8, price: 55,  currency: "CHF", description: "Canoë Aare",                    emoji: "🏔️", routeIds: [] },
  { id: "eu004", name: "Norwegian Fjords",       country: "NO", type: "Expédition",commission: 20, rating: 4.9, price: 150, currency: "NOK", description: "Kayak fjords",                  emoji: "🏔️", routeIds: [4006] },
  { id: "eu005", name: "Croatia Sea Kayak",      country: "HR", type: "Kayak",     commission: 20, rating: 4.9, price: 45,  currency: "EUR", description: "Kayak Dalmatie",                emoji: "⛵", routeIds: [] },
  { id: "eu006", name: "Greek Islands SUP",      country: "GR", type: "SUP",       commission: 20, rating: 4.8, price: 35,  currency: "EUR", description: "SUP îles Ioniennes",             emoji: "🏛️", routeIds: [] },
  { id: "eu007", name: "Portugal Surf",          country: "PT", type: "Surf",      commission: 20, rating: 4.9, price: 30,  currency: "EUR", description: "Surf Algarve",                  emoji: "🌊", routeIds: [4004] },
  { id: "eu008", name: "Spain Rafting",          country: "ES", type: "Rafting",   commission: 18, rating: 4.7, price: 40,  currency: "EUR", description: "Sella River",                   emoji: "🎉", routeIds: [] },
  { id: "eu009", name: "Scotland Canoe",         country: "GB", type: "Canoë",     commission: 18, rating: 4.8, price: 50,  currency: "GBP", description: "Canoë Loch Ness",               emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", routeIds: [] },
  { id: "eu010", name: "Ireland SUP",            country: "IE", type: "SUP",       commission: 18, rating: 4.7, price: 35,  currency: "EUR", description: "SUP océan Atlantique",           emoji: "🍀", routeIds: [] },
  { id: "eu011", name: "Germany Rhine",          country: "DE", type: "Kayak",     commission: 18, rating: 4.7, price: 40,  currency: "EUR", description: "Vallée du Rhin",                emoji: "🏰", routeIds: [] },
  { id: "eu012", name: "Netherlands Canoe",      country: "NL", type: "Canoë",     commission: 18, rating: 4.6, price: 25,  currency: "EUR", description: "Canaux Amsterdam",              emoji: "🌷", routeIds: [] },
  { id: "eu013", name: "Belgium Kayak",          country: "BE", type: "Location",  commission: 18, rating: 4.8, price: 25,  currency: "EUR", description: "Lesse et Ourthe",               emoji: "🏞️", routeIds: [] },
  { id: "eu014", name: "Austria Rafting",        country: "AT", type: "Rafting",   commission: 18, rating: 4.8, price: 50,  currency: "EUR", description: "Alpes autrichiennes",            emoji: "🏔️", routeIds: [] },
  { id: "eu015", name: "Poland Kayak",           country: "PL", type: "Kayak",     commission: 15, rating: 4.7, price: 30,  currency: "PLN", description: "Masurie",                       emoji: "🏞️", routeIds: [] },
  { id: "eu016", name: "Czech SUP",              country: "CZ", type: "SUP",       commission: 15, rating: 4.6, price: 25,  currency: "CZK", description: "Vltava Prague",                 emoji: "🏰", routeIds: [] },
  { id: "eu017", name: "Hungary Kayak",          country: "HU", type: "Kayak",     commission: 15, rating: 4.7, price: 20,  currency: "HUF", description: "Danube Budapest",               emoji: "🏛️", routeIds: [] },
  { id: "eu018", name: "Slovenia Rafting",       country: "SI", type: "Rafting",   commission: 18, rating: 4.9, price: 45,  currency: "EUR", description: "Soča émeraude",                 emoji: "💚", routeIds: [4003] },
  { id: "eu019", name: "Sweden Canoe",           country: "SE", type: "Canoë",     commission: 18, rating: 4.8, price: 60,  currency: "SEK", description: "Klarälven raft",                emoji: "🌲", routeIds: [] },
  { id: "eu020", name: "Finland SUP",            country: "FI", type: "SUP",       commission: 18, rating: 4.7, price: 40,  currency: "EUR", description: "Laponie",                       emoji: "🦌", routeIds: [] },
  // OCÉANIE
  { id: "oc001", name: "Australian Surf",        country: "AU", type: "Surf",      commission: 20, rating: 4.9, price: 45,  currency: "AUD", description: "Surf Gold Coast",               emoji: "🏄", routeIds: [5001] },
  { id: "oc002", name: "NZ Kayak",               country: "NZ", type: "Kayak",     commission: 20, rating: 4.9, price: 60,  currency: "NZD", description: "Whanganui",                     emoji: "🥝", routeIds: [5002] },
  { id: "oc003", name: "Fiji SUP",               country: "FJ", type: "SUP",       commission: 18, rating: 4.8, price: 50,  currency: "FJD", description: "SUP paradis",                  emoji: "🌴", routeIds: [5003] },
  { id: "oc004", name: "Tahiti Surf",            country: "PF", type: "Surf",      commission: 18, rating: 4.9, price: 55,  currency: "XPF", description: "Surf légendaire",               emoji: "🌺", routeIds: [] },
];

// ─── WORLD ROUTES (spots supplémentaires enrichis) ───────────────────────────
const _diffColor = { Facile: "#10b981", Intermédiaire: "#f59e0b", Sportif: "#ef4444" };
const _actByType = {
  RIVER: ["Kayak", "Rafting", "Canoë"],
  LAKE:  ["Kayak", "SUP", "Baignade"],
  SEA:   ["Kayak", "SUP", "Plongée"],
};

const _enrich = (r) => ({
  emoji: r.emoji || ({ RIVER: "🏞️", LAKE: "🏔️", SEA: "🌊" }[r.type] || "🌊"),
  color: _diffColor[r.difficulty] || "#1a9e6e",
  activities: _actByType[r.type] || ["Kayak"],
  open: true,
  camping: parseInt(r.distance) > 50,
  waterPoints: true,
  description: `Découvrez ${r.name} — un spot ${r.difficulty.toLowerCase()} exceptionnel en ${r.river || r.type}.`,
  region: r.country,
  duration: parseInt(r.distance) > 100 ? "Plusieurs jours" : parseInt(r.distance) > 30 ? "1 journée" : "3-4h",
  ...r,
});

export const WORLD_ROUTES = [
  // AFRIQUE
  { id: 1001, name: "Nil Blanc · Jinja",       country: "UG", river: "Nil",      difficulty: "Sportif",      distance: "25 km", type: "RIVER", coords: [0.450,   33.200],  emoji: "🌊" },
  { id: 1002, name: "Zambèze · Livingstone",   country: "ZM", river: "Zambèze",  difficulty: "Sportif",      distance: "35 km", type: "RIVER", coords: [-17.930, 25.856],  emoji: "🦁" },
  { id: 1003, name: "Atlas · Ourika",          country: "MA", river: "Ourika",   difficulty: "Intermédiaire",distance: "15 km", type: "RIVER", coords: [31.800,  -6.200],  emoji: "🏔️" },
  { id: 1004, name: "Lac Malawi",              country: "MW", river: "Lac Malawi",difficulty: "Facile",       distance: "30 km", type: "LAKE",  coords: [-11.500, 34.600],  emoji: "💧" },
  { id: 1005, name: "Delta Okavango",          country: "BW", river: "Okavango", difficulty: "Facile",       distance: "40 km", type: "RIVER", coords: [-19.000, 23.000],  emoji: "🐘" },
  { id: 1006, name: "Cape Peninsula",          country: "ZA", river: "Océan",    difficulty: "Intermédiaire",distance: "20 km", type: "SEA",   coords: [-34.357, 18.474],  emoji: "🐋" },
  // AMÉRIQUES
  { id: 2001, name: "Grand Canyon · Colorado", country: "US", river: "Colorado", difficulty: "Sportif",      distance: "360 km",type: "RIVER", coords: [36.100, -112.100], emoji: "🏜️" },
  { id: 2002, name: "Banff · Lac Louise",      country: "CA", river: "Lac Louise",difficulty: "Facile",      distance: "15 km", type: "LAKE",  coords: [51.416, -116.177], emoji: "🏔️" },
  { id: 2003, name: "Amazone · Jungle",        country: "BR", river: "Amazone",  difficulty: "Facile",       distance: "100 km",type: "RIVER", coords: [-3.100,  -60.025], emoji: "🌳" },
  { id: 2004, name: "Futaleufú · Patagonie",   country: "CL", river: "Futaleufú",difficulty: "Sportif",      distance: "30 km", type: "RIVER", coords: [-43.200, -71.860], emoji: "🏔️" },
  { id: 2005, name: "Pacuare · Costa Rica",    country: "CR", river: "Pacuare",  difficulty: "Intermédiaire",distance: "28 km", type: "RIVER", coords: [9.900,   -83.680], emoji: "🌴" },
  { id: 2006, name: "Cénotes · Mexique",       country: "MX", river: "Cenotes",  difficulty: "Facile",       distance: "10 km", type: "LAKE",  coords: [20.630,  -87.080], emoji: "💧" },
  { id: 2007, name: "Galápagos · Kayak",       country: "EC", river: "Océan",    difficulty: "Intermédiaire",distance: "25 km", type: "SEA",   coords: [-0.460,  -91.000], emoji: "🐢" },
  // ASIE
  { id: 3001, name: "Gange · Rishikesh",       country: "IN", river: "Ganges",   difficulty: "Intermédiaire",distance: "25 km", type: "RIVER", coords: [30.086,   78.296], emoji: "🕉️" },
  { id: 3002, name: "Rivière Li · Yangshuo",   country: "CN", river: "Li",       difficulty: "Facile",       distance: "50 km", type: "RIVER", coords: [24.930,  110.250], emoji: "🐉" },
  { id: 3003, name: "Bali · Surf & SUP",       country: "ID", river: "Océan",    difficulty: "Intermédiaire",distance: "15 km", type: "SEA",   coords: [-8.409,  115.188], emoji: "🏄" },
  { id: 3004, name: "Baie d'Halong",           country: "VN", river: "Mer",      difficulty: "Facile",       distance: "20 km", type: "SEA",   coords: [20.910,  107.184], emoji: "⛰️" },
  { id: 3005, name: "El Nido · Palawan",       country: "PH", river: "Mer",      difficulty: "Facile",       distance: "30 km", type: "SEA",   coords: [11.177,  119.388], emoji: "🏝️" },
  { id: 3006, name: "Trisuli · Himalaya",      country: "NP", river: "Trisuli",  difficulty: "Intermédiaire",distance: "45 km", type: "RIVER", coords: [27.800,   84.400], emoji: "🏔️" },
  // EUROPE
  { id: 4001, name: "Ardèche · Gorges",        country: "FR", river: "Ardèche",  difficulty: "Intermédiaire",distance: "30 km", type: "RIVER", coords: [44.400,    4.390], emoji: "🦅" },
  { id: 4002, name: "Lac d'Annecy",            country: "FR", river: "Lac",      difficulty: "Facile",       distance: "35 km", type: "LAKE",  coords: [45.866,    6.165], emoji: "🏔️" },
  { id: 4003, name: "Soča · Slovénie",         country: "SI", river: "Soča",     difficulty: "Intermédiaire",distance: "55 km", type: "RIVER", coords: [46.240,   13.650], emoji: "💚" },
  { id: 4004, name: "Algarve · Portugal",      country: "PT", river: "Océan",    difficulty: "Facile",       distance: "25 km", type: "SEA",   coords: [37.085,   -8.668], emoji: "🌊" },
  { id: 4005, name: "Lac de Côme",             country: "IT", river: "Lac",      difficulty: "Facile",       distance: "45 km", type: "LAKE",  coords: [46.000,    9.250], emoji: "⛵" },
  { id: 4006, name: "Fjords Norvégiens",        country: "NO", river: "Fjord",    difficulty: "Intermédiaire",distance: "60 km", type: "SEA",   coords: [61.050,    6.850], emoji: "🏔️" },
  // OCÉANIE
  { id: 5001, name: "Great Barrier Reef",       country: "AU", river: "Mer",      difficulty: "Facile",       distance: "50 km", type: "SEA",   coords: [-18.286, 147.699], emoji: "🐢" },
  { id: 5002, name: "Milford Sound",            country: "NZ", river: "Fjord",    difficulty: "Intermédiaire",distance: "30 km", type: "SEA",   coords: [-44.700, 167.900], emoji: "🥝" },
  { id: 5003, name: "Fidji · Îles",             country: "FJ", river: "Océan",    difficulty: "Facile",       distance: "40 km", type: "SEA",   coords: [-17.713, 178.065], emoji: "🌴" },
].map(_enrich);

// ─── COMMISSION MANAGER ───────────────────────────────────────────────────────
export class CommissionManager {
  constructor() {
    this.history = [];
  }

  calculate(booking) {
    const rate = (ALL_COUNTRIES[booking.country]?.commission ?? 15) / 100;
    const amount = +(booking.totalPrice * rate).toFixed(2);
    const entry = { ...booking, commissionRate: rate * 100, commissionAmount: amount, date: Date.now() };
    this.history.push(entry);
    return entry;
  }

  getDashboard() {
    const total = this.history.reduce((s, e) => s + e.commissionAmount, 0);
    const byContinent = {};
    this.history.forEach(e => {
      const cont = ALL_COUNTRIES[e.country]?.continent ?? '??';
      byContinent[cont] = (byContinent[cont] || 0) + e.commissionAmount;
    });
    return { total: +total.toFixed(2), count: this.history.length, byContinent };
  }

  // Payout stubbed — nécessite Stripe Connect côté backend
  async payout(partnerId, amount) {
    console.warn('[CommissionManager] payout stubbed — configure /api/payout endpoint', { partnerId, amount });
    return { success: false, reason: 'Backend endpoint required' };
  }
}

// ─── STATISTIQUES MONDIALES ───────────────────────────────────────────────────
export const GlobalStats = {
  totalCountries: Object.keys(ALL_COUNTRIES).length,
  totalPartners:  GLOBAL_PARTNERS.length,
  totalSpots:     WORLD_ROUTES.length + 40 + GLOBAL_SPOTS_FLAT.length,
  avgCommission:  +(Object.values(ALL_COUNTRIES).reduce((s, c) => s + c.commission, 0) / Object.keys(ALL_COUNTRIES).length).toFixed(1),
  continents: {
    AF: { name: "Afrique",    emoji: "🌍", count: Object.values(ALL_COUNTRIES).filter(c => c.continent === "AF").length },
    AM: { name: "Amériques",  emoji: "🌎", count: Object.values(ALL_COUNTRIES).filter(c => c.continent === "AM").length },
    AS: { name: "Asie",       emoji: "🌏", count: Object.values(ALL_COUNTRIES).filter(c => c.continent === "AS").length },
    EU: { name: "Europe",     emoji: "🇪🇺", count: Object.values(ALL_COUNTRIES).filter(c => c.continent === "EU").length },
    OC: { name: "Océanie",    emoji: "🌊", count: Object.values(ALL_COUNTRIES).filter(c => c.continent === "OC").length },
  },
};
