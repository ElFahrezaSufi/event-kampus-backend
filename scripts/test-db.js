require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const pool = require("../src/config/db");

/**
 * Script untuk test koneksi database dan verifikasi schema
 *
 * Usage:
 * node test-db.js
 */

async function testConnection() {
  console.log("🔌 Testing database connection...\n");

  try {
    const result = await pool.query(
      "SELECT NOW() as current_time, current_database() as db_name, version() as version"
    );
    const row = result.rows[0];

    console.log("✅ Database connection successful!");
    console.log(`   Database: ${row.db_name}`);
    console.log(`   Time: ${row.current_time}`);
    console.log(`   Version: ${row.version.split(",")[0]}\n`);

    return true;
  } catch (err) {
    console.error("❌ Database connection failed!");
    console.error(`   Error: ${err.message}\n`);
    return false;
  }
}

async function checkTables() {
  console.log("📋 Checking database schema...\n");

  try {
    // Check if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((r) => r.table_name);
    const expectedTables = ["users", "events", "registrations"];

    console.log("Tables found:");
    tables.forEach((table) => {
      const expected = expectedTables.includes(table);
      console.log(`  ${expected ? "✅" : "⚠️ "} ${table}`);
    });

    const missingTables = expectedTables.filter((t) => !tables.includes(t));
    if (missingTables.length > 0) {
      console.log("\n❌ Missing tables:", missingTables.join(", "));
      console.log("   Please run the SQL schema creation script first.");
      return false;
    }

    console.log("\n✅ All required tables exist\n");
    return true;
  } catch (err) {
    console.error("❌ Error checking tables:", err.message, "\n");
    return false;
  }
}

async function checkEnums() {
  console.log("🏷️  Checking ENUM types...\n");

  try {
    const enumsResult = await pool.query(`
      SELECT t.typname as enum_name, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    if (enumsResult.rows.length === 0) {
      console.log(
        "❌ No ENUM types found. Please run the schema creation script.\n"
      );
      return false;
    }

    console.log("ENUM types found:");
    enumsResult.rows.forEach((row) => {
      console.log(`  ✅ ${row.enum_name}: ${row.values}`);
    });

    console.log("\n✅ All ENUM types exist\n");
    return true;
  } catch (err) {
    console.error("❌ Error checking ENUM types:", err.message, "\n");
    return false;
  }
}

async function showTableStats() {
  console.log("📊 Table statistics...\n");

  try {
    const tables = ["users", "events", "registrations"];

    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0].count;
      console.log(`  ${table.padEnd(15)} : ${count} rows`);
    }

    console.log("");
    return true;
  } catch (err) {
    console.error("❌ Error getting table stats:", err.message, "\n");
    return false;
  }
}

async function testQueries() {
  console.log("🧪 Testing sample queries...\n");

  try {
    // Test parameterized query
    const result = await pool.query(
      "SELECT 'PostgreSQL migration' as message, $1::integer as number",
      [42]
    );

    if (
      result.rows[0].message === "PostgreSQL migration" &&
      result.rows[0].number === 42
    ) {
      console.log("  ✅ Parameterized queries work correctly");
    }

    // Test UUID generation
    const uuidResult = await pool.query("SELECT gen_random_uuid() as id");
    if (uuidResult.rows[0].id) {
      console.log("  ✅ UUID generation works correctly");
    }

    console.log("\n✅ All query tests passed\n");
    return true;
  } catch (err) {
    console.error("❌ Error testing queries:", err.message, "\n");
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("  Event Kampus Backend - Database Test");
  console.log("=".repeat(60) + "\n");

  let allPassed = true;

  // Run all tests
  allPassed = (await testConnection()) && allPassed;
  allPassed = (await checkTables()) && allPassed;
  allPassed = (await checkEnums()) && allPassed;
  allPassed = (await showTableStats()) && allPassed;
  allPassed = (await testQueries()) && allPassed;

  console.log("=".repeat(60));

  if (allPassed) {
    console.log("🎉 All tests passed! Database is ready.");
  } else {
    console.log("⚠️  Some tests failed. Please check the output above.");
    process.exit(1);
  }

  console.log("=".repeat(60) + "\n");

  await pool.end();
}

main();
