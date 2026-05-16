# 🌊 FleuVibe — Exploration nautique mondiale

[![Version](https://img.shields.io/badge/version-5.0-blue.svg)](https://github.com/yazigijeremy-ai/fleuvibe)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-black.svg)](https://fleuvibe-8am5.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen.svg)](https://fleuvibe-8am5.vercel.app)

## 🚀 Aperçu

FleuVibe est la plateforme de découverte de spots nautiques mondiaux. Que tu sois kayakiste, paddleboardeur ou amateur de rafting, explore les meilleures rivières, lacs et côtes pour ta prochaine aventure.

**Site live** → https://fleuvibe-8am5.vercel.app

## ✨ Fonctionnalités

| Feature | Détail |
|---|---|
| 🗺️ **Carte interactive** | 40 spots sur carte Leaflet mondiale, filtres par type |
| 🤖 **IA GPT-4o mini** | Recherche sémantique, descriptions, conseils météo, recommandations |
| 🌤️ **Météo temps réel** | OpenWeatherMap sur chaque spot |
| 👥 **Communauté** | Groupes d'expédition, soumission de spots, avis |
| 🏆 **Gamification** | XP, niveaux (Moussaillon → Légende), badges, challenges |
| 💳 **Stripe** | Abonnement Premium (4,99€/mois · 39,99€/an) via Payment Links |
| 📱 **PWA** | Installable sur mobile et desktop, mode offline IndexedDB |
| 🔒 **Sécurité** | Zod validation, rate limiting, sanitization XSS, CSP headers |
| 🌍 **Multi-langues** | Traduction IA (FR/EN/ES/DE) |
| 🎨 **Thèmes** | Ocean, Sunset, Forest, Aurora, Midnight |

## 🛠️ Stack technique

- **Frontend** : React 18 + Vite 4
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth (JWT)
- **IA** : OpenAI GPT-4o mini
- **Météo** : OpenWeatherMap API
- **Paiements** : Stripe Payment Links
- **Carte** : Leaflet.js (CDN)
- **Validation** : Zod
- **PWA** : Service Worker + Web App Manifest
- **Déploiement** : Vercel

## 📦 Installation

```bash
git clone https://github.com/yazigijeremy-ai/fleuvibe.git
cd fleuvibe
npm install
```

Crée un fichier `.env.local` :
```env
VITE_OPENAI_KEY=sk-...
VITE_STRIPE_MONTHLY_URL=https://buy.stripe.com/...
VITE_STRIPE_ANNUAL_URL=https://buy.stripe.com/...
```

```bash
npm run dev      # http://localhost:3000
npm run build    # Build production
npm run preview  # Prévisualiser le build
```

## 🔧 Scripts utilitaires

```bash
npm run health   # Vérifie Supabase + Météo + clés API
npm run backup   # Sauvegarde profiles + reviews → /backups/
```

## 🚀 Déploiement

Le déploiement est automatique via Vercel à chaque push sur `main`.

Variables d'environnement à configurer dans Vercel :
| Variable | Description |
|---|---|
| `VITE_OPENAI_KEY` | Clé OpenAI (GPT-4o mini) |
| `VITE_STRIPE_MONTHLY_URL` | Lien Stripe mensuel (4,99€) |
| `VITE_STRIPE_ANNUAL_URL` | Lien Stripe annuel (39,99€) |
| `VITE_UNSPLASH_ACCESS_KEY` | Clé Unsplash API — [unsplash.com/developers](https://unsplash.com/developers) |

Les variables Supabase et Weather sont déjà dans le code (clés publiques).

## 🗄️ Base de données

| Table | Colonnes principales |
|---|---|
| `profiles` | id, username, full_name, avatar_url, favorites (JSON) |
| `reviews` | id, route_id, user_id, rating, comment, user_name, created_at |

RLS activé sur `reviews`. Auth via Supabase JWT.

## 📊 Données

- **40** spots nautiques mondiaux (rivières, lacs, mers)
- **40+** pays couverts
- **3** pépites cachées (spots secrets)
- **5** prestataires partenaires
- **5** destinations sponsorisées

## 🏗️ Architecture

```
fleuvibe/
├── src/
│   ├── App.jsx          # Application React complète (~1700 lignes)
│   └── main.jsx         # Point d'entrée
├── public/
│   ├── sw.js            # Service Worker PWA
│   ├── manifest.json    # Web App Manifest
│   └── robots.txt       # SEO
├── scripts/
│   ├── backup.js        # Backup Supabase → JSON
│   └── health-check.js  # Vérification des services
├── index.html           # CSP + Leaflet + GA + SW registration
├── vite.config.js       # Code splitting, sourcemaps
└── vercel.json          # Headers sécurité + SPA rewrite
```

## 🔒 Sécurité

- **CSP** configuré dans `index.html`
- **Headers HTTP** (X-Frame-Options, X-XSS-Protection, etc.) dans `vercel.json`
- **Zod** : validation stricte des formulaires
- **sanitizeHTML / sanitizeInput** : protection XSS
- **RateLimiter** : 20 appels IA/min, 10 auth/min
- **DistributedCache** : cache TTL automatique pour les appels IA

## 📄 Licence

MIT © FleuVibe

---

*Fait avec 🌊 par l'équipe FleuVibe*
