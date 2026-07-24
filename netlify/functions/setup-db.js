const { neon } = require('@netlify/neon')

const sql = neon()

exports.handler = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        prenom TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id SERIAL PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS navigations (
        id SERIAL PRIMARY KEY,
        view_id TEXT UNIQUE NOT NULL,
        editor_account_id INTEGER NOT NULL REFERENCES accounts(id),
        chef_de_bord_prenom TEXT NOT NULL,
        chef_de_bord_nom TEXT NOT NULL,
        chef_de_bord_account_id INTEGER REFERENCES accounts(id),
        crew JSONB NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'active',
        closed_by TEXT,
        weather_grid JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        closed_at TIMESTAMPTZ,
        reminder_1_sent BOOLEAN NOT NULL DEFAULT FALSE,
        reminder_2_sent BOOLEAN NOT NULL DEFAULT FALSE,
        admin_alert_sent BOOLEAN NOT NULL DEFAULT FALSE
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        navigation_id INTEGER NOT NULL REFERENCES navigations(id) ON DELETE CASCADE,
        logged_at TIMESTAMPTZ NOT NULL,
        lat DOUBLE PRECISION NOT NULL,
        lon DOUBLE PRECISION NOT NULL,
        cog DOUBLE PRECISION,
        sog DOUBLE PRECISION,
        twd_deg DOUBLE PRECISION,
        twa_deg DOUBLE PRECISION,
        weather_snapshot JSONB,
        sail_config TEXT,
        comment TEXT,
        created_by TEXT,
        edited_by TEXT,
        edited_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_navigations_view_id ON navigations(view_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_navigations_status ON navigations(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_logs_navigation_id ON logs(navigation_id)`

    // Vérification : lister les tables créées
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tables créées avec succès', tables }, null, 2),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }, null, 2),
    }
  }
}
