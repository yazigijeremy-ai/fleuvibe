-- ═══════════════════════════════════════════════════════════════════════════
-- FleuVibe v6 — Schema complet avec RLS
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSION UUID ───────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium  BOOLEAN NOT NULL DEFAULT FALSE,
  xp          INT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── SPOTS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spots (
  id           BIGSERIAL   PRIMARY KEY,
  name         TEXT        NOT NULL,
  river        TEXT,
  region       TEXT,
  country      CHAR(2),
  continent    CHAR(2),
  type         TEXT        CHECK (type IN ('RIVER','LAKE','SEA')),
  distance     TEXT,
  duration     TEXT,
  difficulty   TEXT        CHECK (difficulty IN ('Facile','Intermédiaire','Sportif')),
  activities   TEXT[]      NOT NULL DEFAULT '{}',
  description  TEXT,
  coords       POINT,
  emoji        TEXT,
  color        TEXT,
  open         BOOLEAN     NOT NULL DEFAULT TRUE,
  popular      BOOLEAN     NOT NULL DEFAULT FALSE,
  sponsored    TEXT,
  camping      BOOLEAN     NOT NULL DEFAULT FALSE,
  water_points BOOLEAN     NOT NULL DEFAULT FALSE,
  unsplash_id  TEXT,
  image_url    TEXT,
  rating       NUMERIC(3,1),
  created_by   UUID        REFERENCES profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spots_public_read"    ON spots FOR SELECT USING (TRUE);
CREATE POLICY "spots_auth_insert"    ON spots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "spots_owner_update"   ON spots FOR UPDATE USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS spots_type_idx       ON spots (type);
CREATE INDEX IF NOT EXISTS spots_country_idx    ON spots (country);
CREATE INDEX IF NOT EXISTS spots_continent_idx  ON spots (continent);
CREATE INDEX IF NOT EXISTS spots_difficulty_idx ON spots (difficulty);
CREATE INDEX IF NOT EXISTS spots_name_idx       ON spots USING GIN (to_tsvector('french', name));

-- ─── REVIEWS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id    BIGINT      NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT        NOT NULL,
  user_name   TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read"  ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_auth_insert"  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_owner_delete" ON reviews FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS reviews_route_idx ON reviews (route_id);

-- ─── EXPEDITIONS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expeditions (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id          BIGINT      REFERENCES spots(id) ON DELETE CASCADE,
  organizer_id     UUID        NOT NULL REFERENCES profiles(id),
  name             TEXT        NOT NULL,
  date             TIMESTAMPTZ NOT NULL,
  max_participants INT         NOT NULL DEFAULT 10,
  participants     UUID[]      NOT NULL DEFAULT '{}',
  description      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expeditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expeditions_public_read"  ON expeditions FOR SELECT USING (TRUE);
CREATE POLICY "expeditions_auth_insert"  ON expeditions FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "expeditions_owner_update" ON expeditions FOR UPDATE  USING (auth.uid() = organizer_id);

-- ─── USER PROGRESS (GAMIFICATION) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
  user_id               UUID    PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  xp                    INT     NOT NULL DEFAULT 0,
  level                 INT     NOT NULL DEFAULT 1,
  badges                JSONB   NOT NULL DEFAULT '[]',
  challenges_completed  JSONB   NOT NULL DEFAULT '[]',
  total_spots_visited   INT     NOT NULL DEFAULT 0,
  countries_visited     INT     NOT NULL DEFAULT 0,
  total_reviews         INT     NOT NULL DEFAULT 0,
  spots_added           INT     NOT NULL DEFAULT 0,
  long_expeditions      INT     NOT NULL DEFAULT 0,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_select_own" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_upsert_own" ON user_progress FOR ALL   USING (auth.uid() = user_id);

-- ─── WEATHER CACHE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_cache (
  id          BIGSERIAL   PRIMARY KEY,
  lat         NUMERIC(8,5) NOT NULL,
  lon         NUMERIC(8,5) NOT NULL,
  data        JSONB        NOT NULL,
  fetched_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (lat, lon)
);

ALTER TABLE weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather_cache_public" ON weather_cache FOR SELECT USING (TRUE);

-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id      BIGINT      REFERENCES spots(id),
  user_id      UUID        NOT NULL REFERENCES profiles(id),
  provider_id  TEXT,
  date         DATE        NOT NULL,
  pax          SMALLINT    NOT NULL DEFAULT 1,
  total_price  NUMERIC(10,2),
  currency     CHAR(3)     DEFAULT 'EUR',
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  stripe_pi    TEXT,
  points_earned INT        DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_owner_all" ON bookings FOR ALL USING (auth.uid() = user_id);

-- ─── TRIGGER: auto-create profile on signup ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── TRIGGER: update updated_at on user_progress ─────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS set_progress_updated_at ON user_progress;
CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
