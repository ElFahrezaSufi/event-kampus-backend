require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Pool } = require("pg");

/**
 * Script untuk membuat database event_kampus
 *
 * Usage:
 * node create-database.js
 */

async function createDatabase() {
  // Connect to default postgres database first
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: "postgres", // Connect to default database
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  const dbName = process.env.DB_NAME || "event_kampus";

  try {
    console.log(`🔍 Checking if database '${dbName}' exists...`);

    // Check if database exists
    const checkResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Database '${dbName}' already exists!`);
    } else {
      console.log(`📦 Creating database '${dbName}'...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    }

    await pool.end();

    console.log("\n🎯 Next steps:");
    console.log(
      "   1. Run the schema SQL script to create tables and ENUM types"
    );
    console.log("   2. Run: node test-db.js to verify setup");
    console.log("   3. Run: npm run dev to start the server\n");
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    await pool.end();
    process.exit(1);
  }
}

createDatabase();
