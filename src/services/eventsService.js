const pool = require("../config/db");

// Helper untuk format event object (convert DATE ke string YYYY-MM-DD)
function formatEvent(event) {
  if (!event) return null;
  return {
    ...event,
    tanggal: event.tanggal ? event.tanggal.toISOString().split("T")[0] : null,
    waktu: event.waktu || null,
  };
}

async function getAll({
  filters = {},
  pagination = { page: 1, limit: 10 },
} = {}) {
  let query = "SELECT * FROM events WHERE 1=1";
  const params = [];
  let paramCount = 1;

  if (filters.location) {
    query += ` AND LOWER(location) = LOWER($${paramCount})`;
    params.push(filters.location);
    paramCount++;
  }

  if (filters.category) {
    query += ` AND category = $${paramCount}`;
    params.push(filters.category);
    paramCount++;
  }

  // Get total count
  const countResult = await pool.query(
    query.replace("SELECT *", "SELECT COUNT(*)"),
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Add pagination
  query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${
    paramCount + 1
  }`;
  const offset = (pagination.page - 1) * pagination.limit;
  params.push(pagination.limit, offset);

  const result = await pool.query(query, params);

  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    items: result.rows.map(formatEvent),
  };
}

async function getById(id) {
  const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
  return formatEvent(result.rows[0]);
}

async function create(payload) {
  const result = await pool.query(
    `INSERT INTO events (name, tanggal, waktu, location, category, description)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      payload.name,
      payload.tanggal || payload.date,
      payload.waktu || payload.time || null,
      payload.location,
      payload.category,
      payload.description || null,
    ]
  );
  return formatEvent(result.rows[0]);
}

async function update(id, payload) {
  const result = await pool.query(
    `UPDATE events 
     SET name = COALESCE($1, name),
         tanggal = COALESCE($2, tanggal),
         waktu = COALESCE($3, waktu),
         location = COALESCE($4, location),
         category = COALESCE($5, category),
         description = COALESCE($6, description),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [
      payload.name,
      payload.tanggal || payload.date,
      payload.waktu || payload.time,
      payload.location,
      payload.category,
      payload.description,
      id,
    ]
  );
  return formatEvent(result.rows[0]);
}

async function remove(id) {
  const result = await pool.query(
    "DELETE FROM events WHERE id = $1 RETURNING *",
    [id]
  );
  return formatEvent(result.rows[0]);
}

async function searchByName(q = "", pagination = { page: 1, limit: 10 }) {
  const searchPattern = `%${q}%`;

  // Get total count
  const countResult = await pool.query(
    "SELECT COUNT(*) FROM events WHERE name ILIKE $1",
    [searchPattern]
  );
  const total = parseInt(countResult.rows[0].count);

  // Get paginated results
  const offset = (pagination.page - 1) * pagination.limit;
  const result = await pool.query(
    `SELECT * FROM events 
     WHERE name ILIKE $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [searchPattern, pagination.limit, offset]
  );

  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    items: result.rows.map(formatEvent),
  };
}

module.exports = { getAll, getById, create, update, remove, searchByName };
