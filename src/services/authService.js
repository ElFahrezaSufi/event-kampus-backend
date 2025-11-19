const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

async function login(email, password) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];
  if (!user) return null;

  // Verify password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const { password: pw, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

async function register(payload) {
  // Check if email already exists
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [payload.email]
  );

  if (existingUser.rows.length > 0) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Insert new user
  const result = await pool.query(
    `INSERT INTO users (nama, email, password, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, nama, email, role, created_at`,
    [
      payload.nama || payload.name || payload.username || "User",
      payload.email,
      hashedPassword,
      payload.role || "user",
    ]
  );

  return result.rows[0];
}

async function findByToken(token) {
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const result = await pool.query(
      "SELECT id, nama, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    return result.rows[0] || null;
  } catch (err) {
    return null;
  }
}

module.exports = { login, register, findByToken };
