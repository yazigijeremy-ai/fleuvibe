-- ─── SPONSORED REGIONS ────────────────────────────────────────────────────────
CREATE TABLE sponsored_regions (
  id         SERIAL       PRIMARY KEY,
  name       TEXT         NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── SPOTS ────────────────────────────────────────────────────────────────────
CREATE TABLE spots (
  id                  INTEGER      PRIMARY KEY,
  name                TEXT         NOT NULL,
  river               TEXT,
  region              TEXT,
  country             CHAR(2)      NOT NULL,
  continent           CHAR(2),
  type                TEXT         NOT NULL CHECK (type IN ('RIVER','LAKE','SEA')),
  distance            TEXT,
  duration            TEXT,
  difficulty          TEXT         NOT NULL CHECK (difficulty IN ('Facile','Intermédiaire','Sportif')),
  activities          TEXT[]       NOT NULL DEFAULT '{}',
  description         TEXT,
  coords              POINT,
  path                JSONB,
  emoji               TEXT,
  color               TEXT,
  open                BOOLEAN      NOT NULL DEFAULT TRUE,
  sponsored_region_id INTEGER      REFERENCES sponsored_regions(id),
  popular             BOOLEAN      NOT NULL DEFAULT FALSE,
  camping             BOOLEAN      NOT NULL DEFAULT FALSE,
  water_points        BOOLEAN      NOT NULL DEFAULT TRUE,
  unsplash_id         TEXT,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX spots_type_idx       ON spots (type);
CREATE INDEX spots_difficulty_idx ON spots (difficulty);
CREATE INDEX spots_country_idx    ON spots (country);
CREATE INDEX spots_continent_idx  ON spots (continent);
CREATE INDEX spots_open_idx       ON spots (open);
CREATE INDEX spots_name_trgm_idx  ON spots USING gin (to_tsvector('french', name));

-- ─── ROW-LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE spots             ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "spots_public_read"          ON spots             FOR SELECT USING (true);
CREATE POLICY "spots_auth_insert"          ON spots             FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "spots_auth_delete"          ON spots             FOR DELETE  USING (auth.role() = 'authenticated');
CREATE POLICY "sponsored_regions_public"   ON sponsored_regions FOR SELECT USING (true);
