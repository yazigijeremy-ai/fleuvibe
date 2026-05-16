"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search, X, Star, Clock, Ruler, Users, Zap, Wind,
  Droplets, Thermometer, ChevronRight, ArrowLeft, Filter,
  SlidersHorizontal, MapPin, Calendar, Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────
type Difficulty = "Beginner" | "Intermediate" | "Expert";
type Activity   = "Kayak" | "Canoe" | "Rafting" | "Paddle";

interface Conditions {
  flow:  string;
  wind:  string;
  temp:  string;
  level: "Optimal" | "Good" | "Strong" | "Calm" | "Moderate";
}

interface Route {
  id:               string;
  name:             string;
  region:           string;
  country:          string;
  flag:             string;
  difficulty:       Difficulty;
  activity:         Activity;
  distanceKm:       number;
  duration:         string;
  rating:           number;
  reviewCount:      number;
  priceFrom:        number;
  guidesAvailable:  number;
  description:      string;
  tags:             string[];
  /** Map center for flyTo */
  center:           [number, number];
  /** GeoJSON LineString coordinates [lng, lat][] */
  path:             [number, number][];
  conditions:       Conditions;
}

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const ROUTES: Route[] = [
  {
    id: "ardeche-gorges",
    name: "Ardèche Gorges",
    region: "Ardèche", country: "France", flag: "🇫🇷",
    difficulty: "Intermediate", activity: "Kayak",
    distanceKm: 32, duration: "2 days",
    rating: 4.9, reviewCount: 847, priceFrom: 45, guidesAvailable: 5,
    description: "The crown jewel of French river paddling. Dramatic limestone gorges, hidden caves, sandy beaches for wild camping, and some of Europe's clearest river water.",
    tags: ["Multi-day", "Wild camping", "Scenic gorges"],
    center: [4.25, 44.27],
    path: [[4.0,44.30],[4.1,44.28],[4.2,44.26],[4.35,44.24],[4.45,44.22],[4.55,44.21]],
    conditions: { flow: "Optimal", wind: "8 km/h", temp: "19°C", level: "Optimal" },
  },
  {
    id: "dordogne-family",
    name: "Dordogne Family Float",
    region: "Dordogne", country: "France", flag: "🇫🇷",
    difficulty: "Beginner", activity: "Canoe",
    distanceKm: 18, duration: "Half-day",
    rating: 4.7, reviewCount: 532, priceFrom: 29, guidesAvailable: 8,
    description: "Gentle current through golden countryside dotted with medieval châteaux. Perfect for families with children or complete beginners. Multiple beach stops along the way.",
    tags: ["Family", "Castles", "Picnic beaches"],
    center: [1.20, 44.82],
    path: [[1.05,44.85],[1.12,44.83],[1.20,44.82],[1.28,44.80],[1.36,44.79]],
    conditions: { flow: "Calm", wind: "5 km/h", temp: "22°C", level: "Calm" },
  },
  {
    id: "inn-rapids",
    name: "Inn River Rapids",
    region: "Tyrol", country: "Austria", flag: "🇦🇹",
    difficulty: "Expert", activity: "Rafting",
    distanceKm: 24, duration: "Full day",
    rating: 4.8, reviewCount: 314, priceFrom: 65, guidesAvailable: 3,
    description: "Alpine whitewater at its finest. Class IV rapids cut through a dramatic glacial valley. Snow-capped peaks frame every bend. Mandatory guide — no solo runs.",
    tags: ["Whitewater Class IV", "Alpine", "Adrenaline"],
    center: [12.18, 47.24],
    path: [[12.04,47.26],[12.10,47.25],[12.18,47.24],[12.26,47.22],[12.34,47.21]],
    conditions: { flow: "Strong", wind: "12 km/h", temp: "11°C", level: "Strong" },
  },
  {
    id: "loue-canyon",
    name: "Loue Secret Canyon",
    region: "Franche-Comté", country: "France", flag: "🇫🇷",
    difficulty: "Intermediate", activity: "Kayak",
    distanceKm: 15, duration: "Half-day",
    rating: 4.9, reviewCount: 127, priceFrom: 38, guidesAvailable: 2,
    description: "A hidden gem in the Jura. Impossibly turquoise water in a narrow limestone canyon — one of France's best-kept secrets. Arrive early to beat the heat.",
    tags: ["Hidden gem", "Canyon", "Photography"],
    center: [6.12, 47.00],
    path: [[6.02,47.03],[6.08,47.01],[6.14,46.99],[6.20,46.97]],
    conditions: { flow: "Optimal", wind: "3 km/h", temp: "17°C", level: "Optimal" },
  },
  {
    id: "rhone-switzerland",
    name: "Rhône Valley Paddle",
    region: "Valais", country: "Switzerland", flag: "🇨🇭",
    difficulty: "Intermediate", activity: "Paddle",
    distanceKm: 28, duration: "Full day",
    rating: 4.6, reviewCount: 218, priceFrom: 55, guidesAvailable: 4,
    description: "Stand-up paddle through the iconic Swiss Rhône with panoramic views of the Valais Alps. A classic European river experience with impeccable organisation.",
    tags: ["Alpine views", "SUP", "Scenic"],
    center: [7.50, 46.18],
    path: [[7.30,46.22],[7.40,46.20],[7.50,46.18],[7.62,46.16],[7.74,46.14]],
    conditions: { flow: "Moderate", wind: "10 km/h", temp: "16°C", level: "Moderate" },
  },
  {
    id: "soca-emerald",
    name: "Soča Emerald River",
    region: "Triglav", country: "Slovenia", flag: "🇸🇮",
    difficulty: "Intermediate", activity: "Kayak",
    distanceKm: 21, duration: "Full day",
    rating: 5.0, reviewCount: 489, priceFrom: 49, guidesAvailable: 6,
    description: "The Soča is arguably Europe's most beautiful river. Unreal emerald-green water, Triglav National Park backdrop, and playful Class II–III whitewater.",
    tags: ["Bucket list", "Emerald water", "National Park"],
    center: [13.68, 46.18],
    path: [[13.56,46.22],[13.62,46.20],[13.68,46.18],[13.75,46.16],[13.82,46.14]],
    conditions: { flow: "Good", wind: "6 km/h", temp: "14°C", level: "Good" },
  },
];

// ─────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────
const DIFF: Record<Difficulty, { label: string; color: string; bg: string; border: string; mapColor: string }> = {
  Beginner:     { label: "✓ Beginner",     color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", mapColor: "#10b981" },
  Intermediate: { label: "⚡ Intermediate", color: "text-amber-400",   bg: "bg-amber-500/15",   border: "border-amber-500/30",   mapColor: "#f59e0b" },
  Expert:       { label: "⚠ Expert",       color: "text-red-400",     bg: "bg-red-500/15",     border: "border-red-500/30",     mapColor: "#ef4444" },
};

const FLOW_DOT: Record<string, string> = {
  Optimal:  "bg-emerald-400",
  Good:     "bg-teal-400",
  Calm:     "bg-blue-400",
  Moderate: "bg-amber-400",
  Strong:   "bg-red-400",
};

// ─────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────
function DiffBadge({ difficulty }: { difficulty: Difficulty }) {
  const d = DIFF[difficulty];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${d.color} ${d.bg} ${d.border}`}>
      {d.label}
    </span>
  );
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="font-semibold text-white">{rating.toFixed(1)}</span>
      <span>({count.toLocaleString()})</span>
    </span>
  );
}

function ConditionPill({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" aria-hidden="true" />
      <div>
        <div className="text-[11px] font-bold text-white leading-none">{value}</div>
        <div className="text-[9px] text-slate-500 leading-none mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ROUTE CARD (sidebar)
// ─────────────────────────────────────────────────────────
function RouteCard({
  route,
  selected,
  onClick,
}: {
  route: Route;
  selected: boolean;
  onClick: () => void;
}) {
  const d = DIFF[route.difficulty];
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={selected}
      aria-label={`${route.name}, ${route.difficulty}, ${route.distanceKm} km`}
      className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
        selected
          ? "border-teal-500/60 bg-teal-500/8 shadow-lg shadow-teal-500/10"
          : "border-white/[0.07] bg-slate-800/40 hover:border-white/15 hover:bg-slate-800/70"
      }`}
    >
      {/* Header row */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
            {route.flag} {route.region}, {route.country}
          </p>
          <h3 className="text-sm font-bold text-white truncate">{route.name}</h3>
        </div>
        <DiffBadge difficulty={route.difficulty} />
      </div>

      {/* Stats row */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating rating={route.rating} count={route.reviewCount} />
        <span className="text-xs text-slate-500">·</span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Ruler className="h-3 w-3" aria-hidden="true" />
          {route.distanceKm} km
        </span>
        <span className="text-xs text-slate-500">·</span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {route.duration}
        </span>
      </div>

      {/* Conditions strip */}
      <div className="mb-3 flex items-center gap-4 rounded-lg border border-white/[0.05] bg-slate-900/50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${FLOW_DOT[route.conditions.level] ?? "bg-slate-400"}`} aria-hidden="true" />
          <span className="text-[11px] font-semibold text-white">{route.conditions.flow}</span>
          <span className="text-[10px] text-slate-500">flow</span>
        </div>
        <ConditionPill icon={Wind}        value={route.conditions.wind} label="Wind" />
        <ConditionPill icon={Thermometer} value={route.conditions.temp} label="Temp" />
      </div>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {route.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/[0.07] bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500">From </span>
          <span className="text-sm font-bold text-white">€{route.priceFrom}</span>
          <span className="text-[10px] text-slate-500">/person</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-teal-400">
            {route.guidesAvailable} guide{route.guidesAvailable !== 1 ? "s" : ""} available
          </span>
          <ChevronRight
            className={`h-4 w-4 transition-all ${selected ? "text-teal-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"}`}
            aria-hidden="true"
          />
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────
// ROUTE DETAIL PANEL
// ─────────────────────────────────────────────────────────
function RouteDetail({ route, onClose }: { route: Route; onClose: () => void }) {
  const d = DIFF[route.difficulty];
  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Header */}
      <div className="border-b border-white/[0.06] p-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Back to route list"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All routes
          </button>
          <DiffBadge difficulty={route.difficulty} />
        </div>
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {route.flag} {route.region}, {route.country}
        </p>
        <h2 className="text-xl font-black text-white">{route.name}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StarRating rating={route.rating} count={route.reviewCount} />
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs font-medium text-teal-400">{route.activity}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Ruler,    val: `${route.distanceKm} km`,     label: "Distance" },
            { icon: Clock,    val: route.duration,                label: "Duration" },
            { icon: Users,    val: `${route.guidesAvailable}`,    label: "Guides avail." },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-slate-800/50 p-3 text-center">
              <Icon className="mx-auto mb-1.5 h-4 w-4 text-teal-400" aria-hidden="true" />
              <div className="text-sm font-bold text-white">{val}</div>
              <div className="text-[10px] text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Live conditions */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Live Conditions</h3>
          <div className="rounded-xl border border-white/[0.06] bg-slate-800/50 p-4 space-y-3">
            {[
              { icon: Droplets,    label: "Water flow",  val: route.conditions.flow, highlight: true },
              { icon: Wind,        label: "Wind speed",  val: route.conditions.wind, highlight: false },
              { icon: Thermometer, label: "Temperature", val: route.conditions.temp, highlight: false },
            ].map(({ icon: Icon, label, val, highlight }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-teal-400" aria-hidden="true" />
                  <span className="text-sm text-slate-400">{label}</span>
                </div>
                <span className={`text-sm font-bold ${highlight ? `${d.color}` : "text-white"}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">About this route</h3>
          <p className="text-sm leading-relaxed text-slate-300">{route.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {route.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-500/8 px-3 py-1 text-xs font-medium text-teal-400">
              <Check className="h-3 w-3" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Sticky booking footer */}
      <div className="border-t border-white/[0.06] bg-slate-900 p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-500">From </span>
            <span className="text-2xl font-black text-white">€{route.priceFrom}</span>
            <span className="text-xs text-slate-500"> /person</span>
          </div>
          <span className="text-xs text-teal-400">
            {route.guidesAvailable} available today
          </span>
        </div>
        <button
          className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:-translate-y-px active:translate-y-0"
          aria-label={`Book ${route.name}`}
        >
          <Calendar className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Book this experience
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-600">
          Free cancellation up to 24h before
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function ExplorePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<mapboxgl.Map | null>(null);
  const markersRef      = useRef<Record<string, mapboxgl.Marker>>({});

  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [showDetail, setShowDetail]       = useState(false);
  const [search, setSearch]               = useState("");
  const [filterDiff, setFilterDiff]       = useState<Difficulty | "All">("All");
  const [filterActivity, setFilterActivity] = useState<Activity | "All">("All");
  const [mobileView, setMobileView]       = useState<"list" | "map">("list");

  const selectedRoute = ROUTES.find((r) => r.id === selectedId) ?? null;

  // ── Filtered routes ──────────────────────────────────
  const filtered = ROUTES.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.region.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.activity.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));
    const matchDiff     = filterDiff     === "All" || r.difficulty === filterDiff;
    const matchActivity = filterActivity === "All" || r.activity   === filterActivity;
    return matchSearch && matchDiff && matchActivity;
  });

  // ── Map initialisation ───────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Missing NEXT_PUBLIC_MAPBOX_TOKEN — map will not render.");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container:   mapContainerRef.current,
      style:       "mapbox://styles/mapbox/navigation-night-v1",
      center:      [6, 46.5],
      zoom:        5,
      minZoom:     3,
      maxZoom:     16,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // Add route lines as GeoJSON
      ROUTES.forEach((route) => {
        const sourceId = `route-${route.id}`;
        const layerId  = `layer-${route.id}`;
        const hitId    = `hit-${route.id}`;  // wider invisible hit area

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: { id: route.id, difficulty: route.difficulty },
            geometry: { type: "LineString", coordinates: route.path },
          },
        });

        // Hit area (wide transparent line for easier clicking)
        map.addLayer({
          id: hitId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "transparent", "line-width": 20 },
        });

        // Visible route line
        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color":   DIFF[route.difficulty].mapColor,
            "line-width":   ["case", ["boolean", ["feature-state", "selected"], false], 6, 3],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0.7],
          },
        });

        // Click handler on hit area
        map.on("click", hitId, () => handleSelectRoute(route.id));
        map.on("mouseenter", hitId, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", hitId, () => { map.getCanvas().style.cursor = ""; });
      });

      // Add start markers
      ROUTES.forEach((route) => {
        const el = document.createElement("div");
        el.className = "fv-marker";
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", `${route.name} start point`);
        el.innerHTML = `
          <div style="
            width:28px;height:28px;border-radius:50%;
            background:${DIFF[route.difficulty].mapColor};
            border:2.5px solid rgba(255,255,255,0.9);
            box-shadow:0 4px 16px rgba(0,0,0,0.5);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;transition:transform 0.15s ease;
          ">
            <div style="width:8px;height:8px;border-radius:50%;background:white;opacity:0.9"></div>
          </div>
        `;
        el.addEventListener("mouseenter", () => { el.querySelector("div")!.style.transform = "scale(1.15)"; });
        el.addEventListener("mouseleave", () => { el.querySelector("div")!.style.transform = "scale(1)"; });

        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat(route.path[0])
          .addTo(map);

        marker.getElement().addEventListener("click", () => handleSelectRoute(route.id));
        markersRef.current[route.id] = marker;
      });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select route ─────────────────────────────────────
  const handleSelectRoute = useCallback((id: string) => {
    const map = mapRef.current;
    if (!map) return;

    setSelectedId(id);
    setShowDetail(true);
    setMobileView("list");

    const route = ROUTES.find((r) => r.id === id);
    if (!route) return;

    // Fly to route center
    map.flyTo({ center: route.center, zoom: 9, duration: 1200, essential: true });

    // Update marker scales
    Object.entries(markersRef.current).forEach(([rid, marker]) => {
      const inner = marker.getElement().querySelector<HTMLElement>("div");
      if (inner) inner.style.transform = rid === id ? "scale(1.25)" : "scale(1)";
    });
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    setShowDetail(false);
    Object.values(markersRef.current).forEach((m) => {
      const inner = m.getElement().querySelector<HTMLElement>("div");
      if (inner) inner.style.transform = "scale(1)";
    });
    mapRef.current?.flyTo({ center: [6, 46.5], zoom: 5, duration: 1200 });
  }, []);

  const difficulties: (Difficulty | "All")[] = ["All", "Beginner", "Intermediate", "Expert"];
  const activities:   (Activity   | "All")[] = ["All", "Kayak", "Canoe", "Rafting", "Paddle"];

  // ── RENDER ───────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 font-sans text-white">

      {/* ── TOP BAR ─────────────────────────────────── */}
      <header className="z-20 flex h-14 items-center gap-4 border-b border-white/[0.06] bg-slate-950/90 px-4 backdrop-blur-md flex-shrink-0">
        <a href="/" className="flex items-center gap-2 flex-shrink-0" aria-label="FleuVibe home">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12c0 0 2-4 7-4s7 4 7 4-2 4-7 4-7-4-7-4z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-white">FleuVibe</span>
        </a>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="explore-search" className="sr-only">Search routes, regions, or activities</label>
          <input
            id="explore-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Route, region, activity…"
            className="w-full rounded-xl border border-white/[0.08] bg-slate-800/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-teal-500/50 focus:outline-none focus:ring-1 focus:ring-teal-500/30 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white" aria-label="Clear search">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Difficulty filter (desktop) */}
        <div className="hidden items-center gap-1.5 md:flex" role="group" aria-label="Filter by difficulty">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filterDiff === d
                  ? "bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-pressed={filterDiff === d}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Activity filter (desktop) */}
        <div className="hidden items-center gap-1.5 lg:flex" role="group" aria-label="Filter by activity">
          {activities.map((a) => (
            <button
              key={a}
              onClick={() => setFilterActivity(a)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                filterActivity === a
                  ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-pressed={filterActivity === a}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="ml-auto hidden flex-shrink-0 items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{filtered.length} route{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Mobile toggle */}
        <div className="ml-auto flex md:hidden rounded-xl border border-white/[0.07] bg-slate-800 p-0.5">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${mobileView === v ? "bg-teal-500 text-white" : "text-slate-400"}`}
              aria-pressed={mobileView === v}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {/* ── MAIN LAYOUT ─────────────────────────────── */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ─────────────────────────────────── */}
        <aside
          className={`z-10 flex w-full flex-col overflow-hidden border-r border-white/[0.06] bg-slate-950 md:w-[360px] md:flex-shrink-0 ${mobileView === "map" ? "hidden md:flex" : "flex"}`}
          aria-label="Route list"
        >
          {showDetail && selectedRoute ? (
            <RouteDetail route={selectedRoute} onClose={handleDeselect} />
          ) : (
            <>
              {/* Filter chips (mobile) */}
              <div className="border-b border-white/[0.06] px-4 py-3 md:hidden overflow-x-auto">
                <div className="flex gap-2">
                  {difficulties.map((d) => (
                    <button key={d} onClick={() => setFilterDiff(d)}
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-all ${filterDiff === d ? "bg-teal-500/20 text-teal-400 ring-1 ring-teal-500/40" : "border border-white/[0.07] text-slate-500"}`}
                      aria-pressed={filterDiff === d}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route count */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <span className="text-xs font-semibold text-slate-400">
                  {filtered.length} route{filtered.length !== 1 ? "s" : ""}
                  {(filterDiff !== "All" || filterActivity !== "All" || search) && " (filtered)"}
                </span>
                {(filterDiff !== "All" || filterActivity !== "All" || search) && (
                  <button
                    onClick={() => { setSearch(""); setFilterDiff("All"); setFilterActivity("All"); }}
                    className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <X className="h-3 w-3" aria-hidden="true" /> Clear filters
                  </button>
                )}
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5" role="list" aria-label="Available routes">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="mb-3 h-8 w-8 text-slate-600" aria-hidden="true" />
                    <p className="text-sm font-semibold text-slate-400">No routes found</p>
                    <p className="mt-1 text-xs text-slate-600">Try adjusting your filters</p>
                  </div>
                ) : (
                  filtered.map((route) => (
                    <div key={route.id} role="listitem">
                      <RouteCard
                        route={route}
                        selected={selectedId === route.id}
                        onClick={() =>
                          selectedId === route.id && showDetail
                            ? handleDeselect()
                            : handleSelectRoute(route.id)
                        }
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Bottom CTA */}
              <div className="border-t border-white/[0.06] p-4">
                <a
                  href="/"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  ← Back to home
                </a>
              </div>
            </>
          )}
        </aside>

        {/* ── MAP ─────────────────────────────────────── */}
        <div
          className={`relative flex-1 ${mobileView === "list" ? "hidden md:block" : "block"}`}
          aria-label="Interactive route map"
        >
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* No token warning */}
          {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
              <div className="max-w-sm rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                <p className="mb-1 text-sm font-bold text-amber-400">Mapbox token missing</p>
                <p className="text-xs text-slate-400">
                  Add <code className="rounded bg-slate-800 px-1.5 py-0.5 text-teal-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-300">.env.local</code> to enable the map.
                </p>
              </div>
            </div>
          )}

          {/* Map legend */}
          <div className="pointer-events-none absolute bottom-10 left-4 hidden rounded-xl border border-white/[0.07] bg-slate-900/80 p-3 backdrop-blur-md md:block" aria-label="Map legend">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Difficulty</p>
            <div className="space-y-1.5">
              {(["Beginner", "Intermediate", "Expert"] as Difficulty[]).map((d) => (
                <div key={d} className="flex items-center gap-2">
                  <div className="h-2 w-6 rounded-full" style={{ background: DIFF[d].mapColor }} aria-hidden="true" />
                  <span className="text-[10px] text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: selected route mini-card */}
          {mobileView === "map" && selectedRoute && (
            <div className="absolute bottom-6 inset-x-4 z-10">
              <div
                className="cursor-pointer rounded-2xl border border-teal-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md"
                onClick={() => setMobileView("list")}
                role="button"
                aria-label={`View details for ${selectedRoute.name}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{selectedRoute.name}</h3>
                  <DiffBadge difficulty={selectedRoute.difficulty} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{selectedRoute.distanceKm} km</span>
                    <span>·</span>
                    <span>{selectedRoute.duration}</span>
                    <span>·</span>
                    <span className="font-semibold text-white">From €{selectedRoute.priceFrom}</span>
                  </div>
                  <span className="text-xs font-semibold text-teal-400">View details →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
