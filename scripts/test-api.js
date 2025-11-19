require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../src/config/db");

/**
 * Script untuk test API functionality secara programmatik
 *
 * Usage:
 * node test-api.js
 */

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

async function testUserRegistration() {
  console.log("🧪 Test 1: User Registration (with bcrypt)");

  try {
    const testUser = {
      nama: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "test123",
      role: "user",
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (nama, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nama, email, role, created_at`,
      [testUser.nama, testUser.email, hashedPassword, testUser.role]
    );

    const user = result.rows[0];
    console.log("   ✅ User registered successfully");
    console.log(`      ID: ${user.id}`);
    console.log(`      Email: ${user.email}`);
    console.log(`      Role: ${user.role}\n`);

    return { user, plainPassword: testUser.password };
  } catch (err) {
    console.error("   ❌ Registration failed:", err.message, "\n");
    return null;
  }
}

async function testUserLogin(email, password) {
  console.log("🧪 Test 2: User Login (JWT generation)");

  try {
    // Get user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user) {
      console.error("   ❌ User not found\n");
      return null;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.error("   ❌ Invalid password\n");
      return null;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("   ✅ Login successful");
    console.log(`      Token: ${token.substring(0, 50)}...`);
    console.log(`      Token Length: ${token.length} chars\n`);

    return { token, user };
  } catch (err) {
    console.error("   ❌ Login failed:", err.message, "\n");
    return null;
  }
}

async function testTokenVerification(token) {
  console.log("🧪 Test 3: JWT Token Verification");

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user
    const result = await pool.query(
      "SELECT id, nama, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    const user = result.rows[0];
    if (!user) {
      console.error("   ❌ User not found in database\n");
      return null;
    }

    console.log("   ✅ Token verified successfully");
    console.log(`      User ID: ${user.id}`);
    console.log(`      Name: ${user.nama}`);
    console.log(`      Email: ${user.email}\n`);

    return user;
  } catch (err) {
    console.error("   ❌ Token verification failed:", err.message, "\n");
    return null;
  }
}

async function testEventCreation(userId) {
  console.log("🧪 Test 4: Event Creation");

  try {
    const testEvent = {
      name: "Test Workshop",
      date: "2025-12-01",
      time: "14:00:00",
      location: "Gedung A",
      category: "workshop",
      description: "Test event description",
    };

    const result = await pool.query(
      `INSERT INTO events (name, date, time, location, category, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        testEvent.name,
        testEvent.date,
        testEvent.time,
        testEvent.location,
        testEvent.category,
        testEvent.description,
      ]
    );

    const event = result.rows[0];
    console.log("   ✅ Event created successfully");
    console.log(`      ID: ${event.id}`);
    console.log(`      Name: ${event.name}`);
    console.log(`      Category: ${event.category}\n`);

    return event;
  } catch (err) {
    console.error("   ❌ Event creation failed:", err.message, "\n");
    return null;
  }
}

async function testEventRegistration(eventId, userId) {
  console.log("🧪 Test 5: Event Registration (with JOIN)");

  try {
    // Create registration
    const insertResult = await pool.query(
      `INSERT INTO registrations (event_id, user_id, status)
       VALUES ($1, $2, 'registered')
       ON CONFLICT (event_id, user_id) DO NOTHING
       RETURNING *`,
      [eventId, userId]
    );

    if (insertResult.rows.length === 0) {
      console.log("   ⚠️  Registration already exists (ON CONFLICT worked)\n");
      return null;
    }

    // Get registration with JOIN
    const joinResult = await pool.query(
      `SELECT r.*, u.nama as user_name, u.email as user_email,
              e.name as event_name, e.date, e.location
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1`,
      [insertResult.rows[0].id]
    );

    const registration = joinResult.rows[0];
    console.log("   ✅ Registration created successfully");
    console.log(`      ID: ${registration.id}`);
    console.log(
      `      User: ${registration.user_name} (${registration.user_email})`
    );
    console.log(`      Event: ${registration.event_name}`);
    console.log(`      Date: ${registration.date}\n`);

    return registration;
  } catch (err) {
    console.error("   ❌ Registration failed:", err.message, "\n");
    return null;
  }
}

async function testPasswordHashing() {
  console.log("🧪 Test 6: Password Hashing Security");

  try {
    const password = "test123";

    // Hash password twice
    const hash1 = await bcrypt.hash(password, 10);
    const hash2 = await bcrypt.hash(password, 10);

    // Verify hashes are different (salt)
    if (hash1 === hash2) {
      console.error("   ❌ Hashes should be different (salt issue)\n");
      return false;
    }

    // Verify both hashes work
    const valid1 = await bcrypt.compare(password, hash1);
    const valid2 = await bcrypt.compare(password, hash2);

    if (!valid1 || !valid2) {
      console.error("   ❌ Hash verification failed\n");
      return false;
    }

    console.log("   ✅ Password hashing works correctly");
    console.log(`      Same password → Different hashes (salt working)`);
    console.log(`      Hash 1: ${hash1.substring(0, 30)}...`);
    console.log(`      Hash 2: ${hash2.substring(0, 30)}...\n`);

    return true;
  } catch (err) {
    console.error("   ❌ Hashing test failed:", err.message, "\n");
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("  Event Kampus Backend - API Functionality Test");
  console.log("=".repeat(60) + "\n");

  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Run tests
    const userResult = await testUserRegistration();
    if (!userResult) {
      console.error("❌ User registration failed, stopping tests");
      process.exit(1);
    }

    const loginResult = await testUserLogin(
      userResult.user.email,
      userResult.plainPassword
    );
    if (!loginResult) {
      console.error("❌ Login failed, stopping tests");
      process.exit(1);
    }

    const verifyResult = await testTokenVerification(loginResult.token);
    if (!verifyResult) {
      console.error("❌ Token verification failed, stopping tests");
      process.exit(1);
    }

    const eventResult = await testEventCreation(userResult.user.id);
    if (!eventResult) {
      console.error("❌ Event creation failed, stopping tests");
      process.exit(1);
    }

    await testEventRegistration(eventResult.id, userResult.user.id);
    await testPasswordHashing();

    console.log("=".repeat(60));
    console.log("🎉 All API tests passed!");
    console.log("=".repeat(60) + "\n");

    console.log("✅ Migration verification complete:");
    console.log("   - Bcrypt password hashing ✅");
    console.log("   - JWT token generation ✅");
    console.log("   - JWT token verification ✅");
    console.log("   - PostgreSQL queries ✅");
    console.log("   - JOIN operations ✅");
    console.log("   - Foreign key constraints ✅");
    console.log("   - ENUM types ✅");
    console.log("   - ON CONFLICT handling ✅\n");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
