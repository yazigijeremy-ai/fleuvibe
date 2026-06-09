import {
  Waves, ArrowRight, Map, Activity, Users, Zap, Star,
  Calendar, Check, ChevronRight, Navigation, Shield,
  MessageSquare, TrendingUp, Globe, Award, PlayCircle,
  Mountain, Wind, Droplets, Clock,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5" aria-label="FleuVibe home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/30">
            <Waves className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">FleuVibe</span>
          <span className="hidden rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-400 sm:inline">
            Beta
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex" role="list">
          {[
            { label: 'How it Works', href: '#solution' },
            { label: 'Features',     href: '#features' },
            { label: 'Testimonials', href: '#testimonials' },
            { label: 'Pricing',      href: '#pricing' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              role="listitem"
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a href="https://fleuvibe-8am5.vercel.app" className="hidden text-sm font-medium text-slate-400 transition-colors hover:text-white md:inline">
            Sign in
          </a>
          <a
            href="https://fleuvibe-8am5.vercel.app"
            className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-all hover:shadow-teal-500/40 hover:-translate-y-px"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </header>
  )
}

// ─────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-slate-950 pt-16"
      aria-label="FleuVibe hero"
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -right-48 h-[700px] w-[700px] rounded-full bg-teal-600/[0.12] blur-[140px]" />
        <div className="absolute -bottom-48 -left-48 h-[600px] w-[600px] rounded-full bg-cyan-600/[0.08] blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-600/[0.06] blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-grid-slate" aria-hidden="true" />

      {/* Radial fade on grid */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, #020617 70%)' }} aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 lg:px-8 lg:pt-36">

        {/* Eyebrow */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-teal-500/25 bg-teal-500/8 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" aria-hidden="true" />
            <span className="text-sm font-medium text-teal-300">Now in beta · Join 2,000+ explorers</span>
          </div>
        </div>

        {/* H1 */}
        <h1 className="mx-auto max-w-4xl text-center text-5xl font-black tracking-tighter text-white sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
          Find your river.{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Know the conditions.
          </span>{' '}
          Book in seconds.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-400 sm:text-xl">
          FleuVibe is the only platform combining curated river itineraries,
          real-time difficulty conditions, and instant booking with local guides —
          so you spend less time planning and more time on the water.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#solution"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:-translate-y-0.5 sm:w-auto"
          >
            Explore Routes
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
          <a
            href="#features"
            className="group flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10 sm:w-auto"
          >
            <Calendar className="h-4 w-4 text-teal-400" aria-hidden="true" />
            Book an Experience
          </a>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { val: '2,000+', label: 'explorers' },
            { val: '150+', label: 'river routes' },
            { val: '12', label: 'countries' },
            { val: '4.9 ★', label: 'avg. rating' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-xs font-medium text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* App mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          {/* Glow halo */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-blue-500/20 blur-xl" aria-hidden="true" />

          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900 shadow-2xl shadow-black/60">
            {/* Title bar */}
            <div className="flex h-9 items-center gap-2 border-b border-white/5 bg-slate-800/70 px-4" aria-hidden="true">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md bg-slate-700/60 px-3 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span className="text-[11px] text-slate-400">app.fleuvibe.com/map</span>
              </div>
            </div>

            {/* Map area */}
            <div className="relative h-[360px] bg-slate-900 lg:h-[460px]">
              {/* Topographic pattern */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.12) 1px, transparent 1px)', backgroundSize: '36px 36px' }} aria-hidden="true" />

              {/* River SVG */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 900 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {/* Main river */}
                <path d="M 30 260 C 120 200, 210 280, 310 230 C 390 185, 460 255, 550 210 C 640 165, 720 230, 870 210"
                  fill="none" stroke="url(#rg)" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" />
                {/* Tributary */}
                <path d="M 310 230 C 330 290, 360 340, 400 360 C 430 375, 460 360, 490 370"
                  fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
                {/* Waypoints */}
                {([[160, 218], [310, 228], [550, 208], [720, 230]] as [number,number][]).map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="14" fill="#14b8a6" opacity="0.15" />
                    <circle cx={x} cy={y} r="8" fill="#14b8a6" opacity="0.85" />
                    <circle cx={x} cy={y} r="3.5" fill="white" />
                  </g>
                ))}
              </svg>

              {/* Floating info cards */}
              <div className="absolute left-4 top-4 w-48 rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Ardèche Gorges</p>
                <p className="mb-2 font-semibold text-white">La Classique</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">⚡ Intermediate</span>
                  <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300">22 km</span>
                </div>
              </div>

              <div className="absolute right-4 top-4 w-48 rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Dordogne Valley</p>
                <p className="mb-2 font-semibold text-white">Family Float</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">✓ Beginner</span>
                  <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-300">18 km</span>
                </div>
              </div>

              {/* Conditions bar */}
              <div className="absolute left-4 bottom-4 flex items-center gap-4 rounded-xl border border-white/10 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md">
                {[
                  { icon: Wind, val: '14 km/h', label: 'Wind' },
                  { icon: Droplets, val: 'Optimal', label: 'Flow' },
                  { icon: Clock, val: '4–5h', label: 'Duration' },
                ].map(({ icon: Icon, val, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
                    <div>
                      <div className="text-[11px] font-bold text-white">{val}</div>
                      <div className="text-[9px] text-slate-500">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Booking CTA floating */}
              <div className="absolute right-4 bottom-4 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2.5 backdrop-blur-md">
                <p className="text-[11px] font-semibold text-teal-300">3 guides available today</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-teal-400/70">
                  Book from €35/person <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </p>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// SOCIAL PROOF BAR
// ─────────────────────────────────────────────────────────
function ProofBar() {
  const stats = [
    { val: '2,000+', label: 'Active explorers' },
    { val: '150+',   label: 'Verified routes' },
    { val: '12',     label: 'Countries covered' },
    { val: '98%',    label: 'Satisfaction rate' },
    { val: '4.9 ★',  label: 'Average rating' },
  ]
  return (
    <div className="border-y border-white/[0.06] bg-slate-900/60 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-around gap-6">
          {stats.map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// PROBLEM SECTION
// ─────────────────────────────────────────────────────────
function ProblemSection() {
  const pains = [
    {
      icon: '🔍',
      title: 'Planning takes forever.',
      desc: 'You spend hours across forums, outdated blogs, and scattered Google Maps pins — just to plan a single river trip.',
    },
    {
      icon: '😬',
      title: 'You show up and it\'s wrong.',
      desc: 'Water levels, difficulty, access conditions — nobody told you. You drove 2 hours for nothing.',
    },
    {
      icon: '📞',
      title: 'Booking is a mess.',
      desc: 'Five different websites, unanswered emails, and zero clarity on what\'s actually included. It shouldn\'t be this hard.',
    },
  ]

  return (
    <section id="problem" className="bg-slate-950 py-24 lg:py-32" aria-labelledby="problem-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-red-400">The Problem</p>
          <h2 id="problem-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            River adventures are still{' '}
            <span className="text-red-400">needlessly hard</span> to plan.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Even experienced paddlers waste hours on research that should take minutes.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {pains.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="card-hover rounded-2xl border border-red-500/15 bg-red-950/20 p-7"
            >
              <div className="mb-4 text-3xl" aria-hidden="true">{icon}</div>
              <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// SOLUTION / HOW IT WORKS
// ─────────────────────────────────────────────────────────
function SolutionSection() {
  const steps = [
    {
      num: '01',
      icon: Map,
      title: 'Discover curated routes',
      desc: 'Browse 150+ verified river itineraries, filtered by difficulty, length, activity, and location — curated by our community of experienced paddlers.',
      badge: 'Free',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      example: '"Beginner kayak, Provence, half-day"',
    },
    {
      num: '02',
      icon: Activity,
      title: 'Check live conditions',
      desc: 'Real-time water levels, flow rate, wind speed, and difficulty score for every route. No more guessing — see exactly what you\'re getting into.',
      badge: 'Live data',
      badgeColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25',
      example: 'Flow: Optimal · Wind: 12 km/h · Temp: 18°C',
    },
    {
      num: '03',
      icon: Zap,
      title: 'Book instantly with local guides',
      desc: 'Connect directly with vetted activity providers — kayak rentals, guided tours, shuttle services. Book in under 60 seconds with transparent pricing.',
      badge: 'Instant',
      badgeColor: 'text-teal-400 bg-teal-500/15 border-teal-500/25',
      example: '3 guides available · From €35/person',
    },
  ]

  return (
    <section id="solution" className="relative overflow-hidden bg-slate-950 py-24 lg:py-32" aria-labelledby="solution-heading">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-teal-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">The Solution</p>
          <h2 id="solution-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            From idea to water in{' '}
            <span className="text-gradient">three steps.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            FleuVibe combines route intelligence, live conditions, and frictionless booking
            in one clean interface.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map(({ num, icon: Icon, title, desc, badge, badgeColor, example }) => (
            <div key={num} className="card-hover group relative rounded-2xl border border-white/[0.07] bg-slate-900/60 p-8">
              {/* Step number */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 ring-1 ring-teal-500/20">
                  <Icon className="h-5 w-5 text-teal-400" aria-hidden="true" />
                </div>
                <span className="text-5xl font-black text-white/[0.06] group-hover:text-white/[0.1] transition-colors">{num}</span>
              </div>

              {/* Badge */}
              <span className={`mb-4 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${badgeColor}`}>
                {badge}
              </span>

              <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-400">{desc}</p>

              {/* Example pill */}
              <div className="rounded-lg border border-teal-500/15 bg-teal-500/5 px-3 py-2 text-xs italic text-teal-400/80">
                {example}
              </div>

              {/* Hover border glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-teal-500/40 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// FEATURES
// ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: Navigation,
      title: 'Smart Route Discovery',
      desc: 'Search by activity, difficulty, distance, and location. Our AI recommends routes matching your exact level and preferences.',
      gradient: 'from-teal-500/20 to-cyan-500/10',
      iconColor: 'text-teal-400',
      ring: 'ring-teal-500/20',
    },
    {
      icon: Activity,
      title: 'Live Difficulty & Conditions',
      desc: 'Water level, flow rate, wind, and access — updated continuously from IoT sensors and community reports.',
      gradient: 'from-cyan-500/20 to-blue-500/10',
      iconColor: 'text-cyan-400',
      ring: 'ring-cyan-500/20',
    },
    {
      icon: MessageSquare,
      title: 'Community Reviews',
      desc: 'Honest feedback from real paddlers: recent conditions, hazards, local tips. Strava for rivers.',
      gradient: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-blue-400',
      ring: 'ring-blue-500/20',
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      desc: 'Book kayak rentals, guided tours, or shuttle services directly on the platform. Transparent pricing, zero phone calls.',
      gradient: 'from-violet-500/20 to-purple-500/10',
      iconColor: 'text-violet-400',
      ring: 'ring-violet-500/20',
    },
    {
      icon: Globe,
      title: '12 Countries & Growing',
      desc: 'From Scandinavian fjords to the Ardèche gorges. New routes added weekly by our community.',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400',
      ring: 'ring-emerald-500/20',
    },
    {
      icon: Shield,
      title: 'Verified Partners Only',
      desc: 'Every guide and rental provider is checked, insured, and rated. Your safety is non-negotiable.',
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400',
      ring: 'ring-amber-500/20',
    },
  ]

  return (
    <section id="features" className="bg-slate-900/40 py-24 lg:py-32" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Features</p>
          <h2 id="features-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything you need.{' '}
            <span className="text-gradient">Nothing you don't.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Built by paddlers, for paddlers. Every feature solves a real problem.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc, gradient, iconColor, ring }) => (
            <div
              key={title}
              className={`card-hover group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br ${gradient} p-7`}
            >
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/80 ring-1 ${ring}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Found my dream route in under 2 minutes. The live conditions feature is a game-changer — I'll never show up to a bad river again.",
      name: 'Alex M.',
      role: 'Kayaker · 6 years',
      avatar: 'AM',
      stars: 5,
      country: '🇫🇷',
    },
    {
      quote: "As a guide, I love how FleuVibe handles bookings. My clients come prepared, the payment is seamless, and I get more visibility.",
      name: 'Thomas R.',
      role: 'Certified Guide · Ardèche',
      avatar: 'TR',
      stars: 5,
      country: '🇫🇷',
    },
    {
      quote: "We planned our entire week-long paddle trip through Germany using FleuVibe. The community reviews saved us twice from wrong turns.",
      name: 'Sarah & Jan',
      role: 'Adventure couple · Berlin',
      avatar: 'SJ',
      stars: 5,
      country: '🇩🇪',
    },
  ]

  return (
    <section id="testimonials" className="bg-slate-950 py-24 lg:py-32" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Testimonials</p>
          <h2 id="testimonials-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            They found their river.
          </h2>
          <p className="mt-4 text-lg text-slate-400">Already used by 2,000+ paddlers across 12 countries.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {testimonials.map(({ quote, name, role, avatar, stars, country }) => (
            <figure key={name} className="card-hover flex flex-col gap-5 rounded-2xl border border-white/[0.07] bg-slate-900/60 p-7">
              {/* Stars */}
              <div className="flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
                {Array.from({ length: stars }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>

              <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{quote}&rdquo;
              </blockquote>

              <figcaption className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-xs font-bold text-white flex-shrink-0">
                  {avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{name}</span>
                    <span aria-hidden="true">{country}</span>
                  </div>
                  <div className="text-xs text-slate-500">{role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Aggregate rating */}
        <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-white/[0.06] bg-slate-900/40 p-5 text-center">
          <div className="mb-1 flex justify-center gap-0.5" aria-label="4.9 out of 5 stars">
            {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
          </div>
          <p className="text-sm font-semibold text-white">
            <span className="text-teal-400">4.9 / 5</span> — Based on 340+ community reviews
          </p>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Explorer',
      price: 'Free',
      period: 'forever',
      desc: 'Everything you need to discover your next river adventure.',
      features: [
        'Browse 150+ river routes',
        'Live difficulty & conditions',
        'Community reviews',
        'Save up to 5 favorites',
        'Mobile app access',
      ],
      cta: 'Start exploring',
      ctaHref: 'https://fleuvibe-8am5.vercel.app',
      ctaStyle: 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10',
      popular: false,
    },
    {
      name: 'Paddler',
      price: '€4.99',
      period: '/month',
      desc: 'For serious paddlers who want the full experience.',
      features: [
        'Everything in Explorer',
        'Unlimited favorites & lists',
        'Offline maps & route data',
        'Priority booking (no queue)',
        'Hidden & secret spots',
        'Community expedition groups',
        'Monthly new route drops',
      ],
      cta: 'Start free trial →',
      ctaHref: 'https://fleuvibe-8am5.vercel.app',
      ctaStyle: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/50',
      popular: true,
    },
    {
      name: 'Partner',
      price: 'Custom',
      period: 'per booking',
      desc: 'For guides and activity providers.',
      features: [
        'Listed on the platform',
        'Booking management dashboard',
        'Revenue analytics',
        'Priority placement in search',
        'Dedicated account manager',
      ],
      cta: 'Get in touch',
      ctaHref: 'mailto:partners@fleuvibe.com',
      ctaStyle: 'bg-slate-800 text-white hover:bg-slate-700 border border-white/10',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="bg-slate-900/50 py-24 lg:py-32" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-400">Pricing</p>
          <h2 id="pricing-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Start free.{' '}
            <span className="text-gradient">Upgrade when you're ready.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            The free plan covers 90% of needs. Go Pro for the features that matter most.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-3">
          {plans.map(({ name, price, period, desc, features, cta, ctaHref, ctaStyle, popular }) => (
            <div
              key={name}
              className={`relative rounded-2xl p-8 ${popular ? 'border-2 border-teal-500/50 bg-slate-900' : 'border border-white/[0.07] bg-slate-900/50'}`}
            >
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-teal-500/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-teal-400">{name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">{price}</span>
                  {period !== 'forever' && <span className="text-sm text-slate-400">{period}</span>}
                </div>
                {period === 'forever' && <p className="text-xs text-slate-500">forever</p>}
                <p className="mt-2 text-sm text-slate-400">{desc}</p>
              </div>

              <ul className="mb-8 space-y-3" aria-label={`${name} plan features`}>
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={ctaHref}
                className={`block w-full rounded-xl px-6 py-3.5 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${ctaStyle}`}
                aria-label={`${cta} — ${name} plan`}
              >
                {cta}
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          All plans include a 14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// FINAL CTA
// ─────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 lg:py-32" aria-labelledby="cta-heading">
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-teal-600/[0.12] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/8 px-4 py-2">
          <Mountain className="h-4 w-4 text-teal-400" aria-hidden="true" />
          <span className="text-sm font-medium text-teal-300">2026 season is open</span>
        </div>

        <h2 id="cta-heading" className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Your next river adventure<br />
          <span className="text-gradient">starts right here.</span>
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-lg text-slate-400">
          Join 2,000+ paddlers who plan smarter, paddle further, and discover rivers they never knew existed.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://fleuvibe-8am5.vercel.app"
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-4 text-base font-bold text-white shadow-2xl shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:-translate-y-0.5 sm:w-auto"
          >
            Start exploring for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </a>
          <a
            href="#solution"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-base font-medium text-slate-300 transition-all hover:border-white/25 hover:text-white sm:w-auto"
          >
            <PlayCircle className="h-4 w-4 text-teal-400" aria-hidden="true" />
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Free forever · No credit card · Cancel Premium anytime
        </p>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────
function Footer() {
  const links = {
    Product:  ['Routes', 'Experiences', 'Conditions', 'Community', 'Mobile App'],
    Company:  ['About', 'Blog', 'Careers', 'Press', 'Partners'],
    Support:  ['Help Center', 'Safety', 'Contact', 'Status'],
    Legal:    ['Privacy', 'Terms', 'Cookies'],
  }

  return (
    <footer className="border-t border-white/[0.06] bg-slate-950" role="contentinfo">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
                <Waves className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-white">FleuVibe</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
              The platform for river explorers. Discover routes, check conditions, and book experiences with local guides.
            </p>
            <div className="flex gap-3">
              {[
                { icon: '𝕏',  label: 'X (Twitter)' },
                { icon: 'in', label: 'LinkedIn' },
                { icon: 'ig', label: 'Instagram' },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-sm text-slate-400 transition-colors hover:border-white/20 hover:text-white"
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <nav key={group} aria-label={group}>
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">{group}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">© 2026 FleuVibe. All rights reserved.</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─────────────────────────────────────────────────────────
// PAGE EXPORT
// ─────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProofBar />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  )
}
