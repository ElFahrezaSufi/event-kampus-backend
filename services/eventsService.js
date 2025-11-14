const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "..", "data", "events.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    // If file not found, initialize with empty array
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function getAll({
  filters = {},
  pagination = { page: 1, limit: 10 },
} = {}) {
  let data = await readData();
  if (filters.location) {
    data = data.filter(
      (e) =>
        String(e.location).toLowerCase() ===
        String(filters.location).toLowerCase()
    );
  }
  if (filters.category) {
    data = data.filter(
      (e) =>
        String(e.category).toLowerCase() ===
        String(filters.category).toLowerCase()
    );
  }

  const start = (pagination.page - 1) * pagination.limit;
  const paginated = data.slice(start, start + pagination.limit);
  return {
    total: data.length,
    page: pagination.page,
    limit: pagination.limit,
    items: paginated,
  };
}

async function getById(id) {
  const data = await readData();
  return data.find((e) => e.id === id);
}

async function create(payload) {
  const data = await readData();
  const item = {
    ...payload,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  data.push(item);
  await writeData(data);
  return item;
}

async function update(id, payload) {
  const data = await readData();
  const idx = data.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated = {
    ...data[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  data[idx] = updated;
  await writeData(data);
  return updated;
}

async function remove(id) {
  const data = await readData();
  const idx = data.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const [removed] = data.splice(idx, 1);
  await writeData(data);
  return removed;
}

async function searchByName(q = "", pagination = { page: 1, limit: 10 }) {
  const data = await readData();
  const lowered = q.toLowerCase();
  const filtered = data.filter((e) =>
    String(e.name || "")
      .toLowerCase()
      .includes(lowered)
  );
  const start = (pagination.page - 1) * pagination.limit;
  const items = filtered.slice(start, start + pagination.limit);
  return {
    total: filtered.length,
    page: pagination.page,
    limit: pagination.limit,
    items,
  };
}

module.exports = { getAll, getById, create, update, remove, searchByName };
