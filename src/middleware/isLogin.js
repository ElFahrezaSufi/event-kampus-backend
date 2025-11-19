const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

module.exports = async (req, res, next) => {
  try {
    const auth = req.header("Authorization");
    if (!auth) {
      return res
        .status(401)
        .json({ status: "error", message: "Authorization header missing" });
    }

    if (!auth.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid authorization format" });
    }

    const token = auth.slice(7).trim();
    if (!token)
      return res
        .status(401)
        .json({ status: "error", message: "Token missing" });

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database to ensure user still exists
    const result = await pool.query(
      "SELECT id, nama, email, role FROM users WHERE id = $1",
      [decoded.id]
    );

    const user = result.rows[0];
    if (!user)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid token" });

    req.user = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid or expired token" });
    }
    next(err);
  }
};
