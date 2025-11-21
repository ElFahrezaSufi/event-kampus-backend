const http = require("http");
const app = require("./app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Test database connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  } else {
    console.log("✅ Database connected successfully at", res.rows[0].now);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
