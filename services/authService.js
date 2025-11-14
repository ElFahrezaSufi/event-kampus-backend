const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

async function readUsers() {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeUsers(users) {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

async function login(email, password) {
  const users = await readUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  // generate token and save to user
  const token = uuidv4();
  const updated = { ...user, token };
  const idx = users.findIndex((u) => u.id === user.id);
  users[idx] = updated;
  await writeUsers(users);
  const { password: pw, ...rest } = updated;
  return { token, user: rest };
}

async function register(payload) {
  const users = await readUsers();
  if (users.find((u) => u.email === payload.email)) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }
  const newUser = {
    id: uuidv4(),
    nama: payload.nama || payload.name || payload.username || "User",
    email: payload.email,
    password: payload.password,
    role: payload.role || "user",
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeUsers(users);
  const { password: pw, ...rest } = newUser;
  return rest;
}

async function findByToken(token) {
  const users = await readUsers();
  return users.find((u) => u.token === token) || null;
}

module.exports = { login, register, findByToken };
