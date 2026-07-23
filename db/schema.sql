-- Schéma Ohé Sailing - Livre de bord numérique
-- À exécuter une seule fois sur la base Netlify Database (Postgres/Neon)

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS navigations (
  id SERIAL PRIMARY KEY,
  view_id TEXT UNIQUE NOT NULL,           -- identifiant public, aléatoire, non devinable

  editor_account_id INTEGER NOT NULL REFERENCES accounts(id),
  chef_de_bord_prenom TEXT NOT NULL,
  chef_de_bord_nom TEXT NOT NULL,
  chef_de_bord_account_id INTEGER REFERENCES accounts(id),

  crew JSONB NOT NULL DEFAULT '[]',       -- [{prenom, nom}, ...]

  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'cloturee'
  closed_by TEXT,                          -- 'renter' | 'admin'

  weather_grid JSONB,                      -- grille météo mise en cache (vent + houle)

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,

  reminder_1_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_2_sent BOOLEAN NOT NULL DEFAULT FALSE,
  admin_alert_sent BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  navigation_id INTEGER NOT NULL REFERENCES navigations(id) ON DELETE CASCADE,

  logged_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  cog DOUBLE PRECISION,                    -- cap sur le fond, calculé depuis la rafale GPS
  sog DOUBLE PRECISION,                    -- vitesse sur le fond

  twd_deg DOUBLE PRECISION,                -- direction du vent réel (depuis GRIB)
  twa_deg DOUBLE PRECISION,                -- angle au vent, calculé (TWD - COG)

  weather_snapshot JSONB,                  -- { wind, sky, visibility_m, sea }

  sail_config TEXT,
  comment TEXT,

  created_by TEXT,                         -- 'renter' | 'admin'
  edited_by TEXT,
  edited_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_navigations_view_id ON navigations(view_id);
CREATE INDEX IF NOT EXISTS idx_navigations_status ON navigations(status);
CREATE INDEX IF NOT EXISTS idx_logs_navigation_id ON logs(navigation_id);
