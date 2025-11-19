const pool = require("../config/db");

// Helper untuk format event fields dalam registration
function formatRegistration(reg) {
  if (!reg) return null;

  // Jika ada field tanggal dari join dengan events table
  if (reg.tanggal && reg.tanggal instanceof Date) {
    reg.tanggal = reg.tanggal.toISOString().split("T")[0];
  }

  return reg;
}

async function create({ eventId, userId }) {
  try {
    // Insert with ON CONFLICT to handle duplicate registrations
    const result = await pool.query(
      `INSERT INTO registrations (event_id, user_id, status)
       VALUES ($1, $2, 'registered')
       ON CONFLICT (event_id, user_id) 
       DO UPDATE SET status = 'registered', registered_at = NOW()
       RETURNING *`,
      [eventId, userId]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
}

async function getByEventId(eventId) {
  // Join with users table to get user information
  const result = await pool.query(
    `SELECT r.*, u.nama as user_name, u.email as user_email
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     WHERE r.event_id = $1
     ORDER BY r.registered_at DESC`,
    [eventId]
  );
  return result.rows;
}

async function getByUserId(userId) {
  // Join with events table to get event information
  const result = await pool.query(
    `SELECT r.*, e.name as event_name, e.tanggal, e.waktu, e.location, e.category
     FROM registrations r
     JOIN events e ON r.event_id = e.id
     WHERE r.user_id = $1
     ORDER BY r.registered_at DESC`,
    [userId]
  );
  return result.rows.map(formatRegistration);
}

async function getById(id) {
  const result = await pool.query(
    `SELECT r.*, u.nama as user_name, u.email as user_email,
            e.name as event_name
     FROM registrations r
     JOIN users u ON r.user_id = u.id
     JOIN events e ON r.event_id = e.id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function removeById(id) {
  const result = await pool.query(
    "DELETE FROM registrations WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
}

async function removeByEventAndUser(eventId, userId) {
  const result = await pool.query(
    `DELETE FROM registrations 
     WHERE event_id = $1 AND user_id = $2 AND status = 'registered'
     RETURNING *`,
    [eventId, userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  getByEventId,
  getByUserId,
  getById,
  removeById,
  removeByEventAndUser,
};
