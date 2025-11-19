require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../src/config/db");

/**
 * Script untuk migrasi data dari JSON files ke PostgreSQL
 *
 * Usage:
 * node migrate-data.js
 */

async function migrateUsers() {
  const usersFile = path.join(__dirname, "data", "users.json");

  if (!fs.existsSync(usersFile)) {
    console.log("⚠️  users.json tidak ditemukan, skip migrasi users");
    return;
  }

  const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

  if (!users || users.length === 0) {
    console.log("⚠️  users.json kosong");
    return;
  }

  console.log(`📦 Migrasi ${users.length} users...`);

  let success = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Hash password jika belum di-hash (plain text dari JSON)
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const result = await pool.query(
        `INSERT INTO users (id, nama, email, password, role, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [
          user.id,
          user.nama,
          user.email,
          hashedPassword,
          user.role || "user",
          user.createdAt || new Date().toISOString(),
        ]
      );

      if (result.rows.length > 0) {
        success++;
        console.log(`  ✅ User migrated: ${user.email}`);
      } else {
        skipped++;
        console.log(`  ⏭️  User skipped (already exists): ${user.email}`);
      }
    } catch (err) {
      console.error(`  ❌ Error migrating user ${user.email}:`, err.message);
    }
  }

  console.log(
    `✅ Users migration complete: ${success} inserted, ${skipped} skipped\n`
  );
}

async function migrateEvents() {
  const eventsFile = path.join(__dirname, "data", "events.json");

  if (!fs.existsSync(eventsFile)) {
    console.log("⚠️  events.json tidak ditemukan, skip migrasi events");
    return;
  }

  const events = JSON.parse(fs.readFileSync(eventsFile, "utf-8"));

  if (!events || events.length === 0) {
    console.log("⚠️  events.json kosong");
    return;
  }

  console.log(`📦 Migrasi ${events.length} events...`);

  let success = 0;
  let skipped = 0;

  for (const event of events) {
    try {
      const result = await pool.query(
        `INSERT INTO events (id, name, date, time, location, category, description, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [
          event.id,
          event.name,
          event.date,
          event.time || null,
          event.location,
          event.category,
          event.description || null,
          event.createdAt || new Date().toISOString(),
          event.updatedAt || null,
        ]
      );

      if (result.rows.length > 0) {
        success++;
        console.log(`  ✅ Event migrated: ${event.name}`);
      } else {
        skipped++;
        console.log(`  ⏭️  Event skipped (already exists): ${event.name}`);
      }
    } catch (err) {
      console.error(`  ❌ Error migrating event ${event.name}:`, err.message);
    }
  }

  console.log(
    `✅ Events migration complete: ${success} inserted, ${skipped} skipped\n`
  );
}

async function migrateRegistrations() {
  const regsFile = path.join(__dirname, "data", "registrations.json");

  if (!fs.existsSync(regsFile)) {
    console.log(
      "⚠️  registrations.json tidak ditemukan, skip migrasi registrations"
    );
    return;
  }

  const registrations = JSON.parse(fs.readFileSync(regsFile, "utf-8"));

  if (!registrations || registrations.length === 0) {
    console.log("⚠️  registrations.json kosong");
    return;
  }

  console.log(`📦 Migrasi ${registrations.length} registrations...`);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const reg of registrations) {
    try {
      const result = await pool.query(
        `INSERT INTO registrations (id, event_id, user_id, registered_at, status) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (event_id, user_id) DO NOTHING
         RETURNING id`,
        [
          reg.id,
          reg.eventId,
          reg.userId,
          reg.registeredAt || new Date().toISOString(),
          reg.status || "registered",
        ]
      );

      if (result.rows.length > 0) {
        success++;
        console.log(`  ✅ Registration migrated: ${reg.id}`);
      } else {
        skipped++;
        console.log(`  ⏭️  Registration skipped (already exists): ${reg.id}`);
      }
    } catch (err) {
      errors++;
      console.error(
        `  ❌ Error migrating registration ${reg.id}:`,
        err.message
      );
      console.error(`     (event_id: ${reg.eventId}, user_id: ${reg.userId})`);
    }
  }

  console.log(
    `✅ Registrations migration complete: ${success} inserted, ${skipped} skipped, ${errors} errors\n`
  );
}

async function main() {
  console.log("🚀 Starting data migration from JSON to PostgreSQL...\n");

  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Migrate in order (users first, then events, then registrations)
    await migrateUsers();
    await migrateEvents();
    await migrateRegistrations();

    console.log("🎉 Migration complete!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
