require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../src/config/db");

/**
 * Script untuk membuat schema PostgreSQL (ENUM types, tables)
 *
 * Usage:
 * node setup-schema.js
 */

const schema = `
-- ===========================================
--  ENUM DEFINITIONS (Production Standard)
-- ===========================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_category AS ENUM ('workshop', 'seminar', 'lomba', 'pelatihan', 'lainnya');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('registered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ===========================================
--  USERS TABLE (Production Grade)
-- ===========================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ===========================================
--  EVENTS TABLE (Production Grade)
-- ===========================================

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    waktu TIME,
    location VARCHAR(255) NOT NULL,
    category event_category NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);


-- ===========================================
--  REGISTRATIONS TABLE (Production Grade)
-- ===========================================

CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status registration_status NOT NULL DEFAULT 'registered',
    UNIQUE (event_id, user_id)
);


-- ===========================================
--  INDEXES (Performance Optimization)
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_events_tanggal ON events(tanggal);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
`;

async function setupSchema() {
  console.log("🚀 Setting up database schema...\n");

  try {
    // Test connection first
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Execute schema
    console.log("📝 Creating ENUM types...");
    console.log("📝 Creating tables...");
    console.log("📝 Creating indexes...\n");

    await pool.query(schema);

    console.log("✅ Schema setup complete!\n");

    // Verify tables
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log("📋 Tables created:");
    result.rows.forEach((row) => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Verify ENUMs
    const enumResult = await pool.query(`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname
    `);

    console.log("\n🏷️  ENUM types created:");
    enumResult.rows.forEach((row) => {
      console.log(`   ✅ ${row.typname}`);
    });

    console.log("\n🎉 Database is ready!");
    console.log("\n🎯 Next steps:");
    console.log(
      "   1. (Optional) Run: node migrate-data.js to import data from JSON"
    );
    console.log("   2. Run: node test-db.js to verify setup");
    console.log("   3. Run: npm run dev to start the server\n");
  } catch (err) {
    console.error("❌ Error setting up schema:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupSchema();
