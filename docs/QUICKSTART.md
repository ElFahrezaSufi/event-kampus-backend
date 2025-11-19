# 🚀 Quick Start Guide - Event Kampus Backend

## Setup dalam 5 Menit

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Setup Environment Variables

Buat file `.env` di root directory:

```bash
cp .env.example .env
```

Edit `.env` dengan PostgreSQL credentials Anda:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_kampus
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 3️⃣ Initialize Database

```bash
npm run db:init
```

Ini akan:

- Membuat database `event_kampus`
- Membuat ENUM types (user_role, event_category, registration_status)
- Membuat tables (users, events, registrations)
- Membuat indexes untuk performa

### 4️⃣ (Opsional) Migrasi Data dari JSON

Jika Anda memiliki data lama di file JSON:

```bash
npm run db:migrate
```

### 5️⃣ Test Database Connection

```bash
npm run db:test
```

### 6️⃣ Start Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

---

## 📋 NPM Scripts Available

| Command              | Description                                 |
| -------------------- | ------------------------------------------- |
| `npm start`          | Start production server                     |
| `npm run dev`        | Start development server dengan auto-reload |
| `npm run db:create`  | Buat database baru                          |
| `npm run db:setup`   | Setup schema (tables, ENUMs, indexes)       |
| `npm run db:test`    | Test koneksi dan verifikasi schema          |
| `npm run db:migrate` | Migrasi data dari JSON ke PostgreSQL        |
| `npm run db:init`    | Initialize database (create + setup)        |

---

## 🧪 Test API Endpoints

### 1. Register Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"nama\":\"Admin User\",\"email\":\"admin@test.com\",\"password\":\"admin123\",\"role\":\"admin\"}"
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@test.com\",\"password\":\"admin123\"}"
```

Simpan token dari response untuk request selanjutnya.

### 3. Create Event (dengan JWT token)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"name\":\"Workshop Web Dev\",\"date\":\"2025-12-01\",\"time\":\"14:00:00\",\"location\":\"Gedung A\",\"category\":\"workshop\",\"description\":\"Belajar web development\"}"
```

### 4. Get All Events

```bash
curl http://localhost:3000/api/events
```

### 5. Register for Event

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 6. Get My Registrations

```bash
curl http://localhost:3000/api/registrations/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🔧 Troubleshooting

### Error: "database does not exist"

```bash
npm run db:create
npm run db:setup
```

### Error: "relation does not exist"

```bash
npm run db:setup
```

### Error: "password authentication failed"

Periksa credentials di file `.env`

### Error: "invalid input value for enum"

Pastikan value sesuai dengan ENUM definition:

- **category**: 'workshop', 'seminar', 'lomba', 'pelatihan', 'lainnya'
- **role**: 'admin', 'user'
- **status**: 'registered', 'cancelled'

---

## 📚 Documentation

- **[README.md](./README.md)** - Full documentation
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Detailed migration guide
- **[.env.example](./.env.example)** - Environment variables template

---

## 🎉 You're Ready!

Backend sudah siap digunakan dengan PostgreSQL, JWT authentication, dan bcrypt password hashing.

Happy coding! 🚀
