const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DATA_FILE = path.join(__dirname, "..", "data", "registrations.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function create({ eventId, userId, userName, userEmail }) {
  const data = await readData();
  // prevent duplicate registration for same event & user
  const exists = data.find(
    (r) =>
      r.eventId === eventId && r.userId === userId && r.status === "registered"
  );
  if (exists) return exists;

  const item = {
    id: uuidv4(),
    eventId,
    userId,
    userName: userName || null,
    userEmail: userEmail || null,
    registeredAt: new Date().toISOString(),
    status: "registered",
  };
  data.push(item);
  await writeData(data);
  return item;
}

async function getByEventId(eventId) {
  const data = await readData();
  return data.filter((r) => r.eventId === eventId);
}

async function getByUserId(userId) {
  const data = await readData();
  return data.filter((r) => r.userId === userId);
}

async function getById(id) {
  const data = await readData();
  return data.find((r) => r.id === id) || null;
}

async function removeById(id) {
  const data = await readData();
  const idx = data.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const [removed] = data.splice(idx, 1);
  await writeData(data);
  return removed;
}

async function removeByEventAndUser(eventId, userId) {
  const data = await readData();
  const idx = data.findIndex(
    (r) =>
      r.eventId === eventId && r.userId === userId && r.status === "registered"
  );
  if (idx === -1) return null;
  const [removed] = data.splice(idx, 1);
  await writeData(data);
  return removed;
}

module.exports = {
  create,
  getByEventId,
  getByUserId,
  getById,
  removeById,
  removeByEventAndUser,
};
