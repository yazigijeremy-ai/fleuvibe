import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") ?? "");
    const lon = parseFloat(url.searchParams.get("lon") ?? "");

    if (isNaN(lat) || isNaN(lon)) {
      return new Response(JSON.stringify({ error: "lat and lon are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Round to 2 decimal places (~1km precision) for cache key stability
    const latKey = Math.round(lat * 100) / 100;
    const lonKey = Math.round(lon * 100) / 100;
    const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: cached } = await supabase
      .from("weather_cache")
      .select("data, fetched_at")
      .eq("lat", latKey)
      .eq("lon", lonKey)
      .gte("fetched_at", cutoff)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const weatherKey = Deno.env.get("OPENWEATHERMAP_KEY");
    if (!weatherKey) throw new Error("OPENWEATHERMAP_KEY secret not set");

    const owmRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric&lang=fr`,
    );
    const d = await owmRes.json();

    if (d.cod !== 200) {
      return new Response(JSON.stringify({ error: "Weather API error", detail: d.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const windKmh = Math.round(d.wind.speed * 3.6);
    const rain = d.rain?.["1h"] ?? 0;
    const condition = d.weather[0].main;
    let navStatus = "good", navLabel = "Conditions idéales", navColor = "#1a9e6e";
    if (windKmh > 40 || rain > 5) {
      navStatus = "bad"; navLabel = "Déconseillé"; navColor = "#dc2626";
    } else if (windKmh > 25 || rain > 2 || condition === "Thunderstorm") {
      navStatus = "medium"; navLabel = "Conditions difficiles"; navColor = "#f59e0b";
    } else if (condition === "Rain" || condition === "Drizzle") {
      navStatus = "medium"; navLabel = "Navigable avec prudence"; navColor = "#f59e0b";
    }
    const iconMap: Record<string, string> = {
      Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️",
      Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
    };
    const weather = {
      temp: Math.round(d.main.temp),
      description: d.weather[0].description,
      windKmh,
      rain,
      icon: iconMap[condition] ?? "🌤️",
      navStatus,
      navLabel,
      navColor,
    };

    await supabase.from("weather_cache").upsert(
      { lat: latKey, lon: lonKey, data: weather, fetched_at: new Date().toISOString() },
      { onConflict: "lat,lon" },
    );

    return new Response(JSON.stringify(weather), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
