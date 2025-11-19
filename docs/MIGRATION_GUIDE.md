# 🔄 Panduan Migrasi dari JSON ke PostgreSQL

## ✅ Perubahan yang Telah Dilakukan

### 1. **Dependencies Baru**

- ✅ `bcryptjs` - Password hashing
- ✅ `jsonwebtoken` - JWT authentication

### 2. **Database Configuration**

- ✅ File `config/db.js` sudah dikonfigurasi dengan PostgreSQL connection pool
- ✅ Menggunakan environment variables untuk credentials

### 3. **Authentication System**

**Sebelum (JSON):**

- Token UUID disimpan di file JSON
- Password plain text
- Token lookup dari file

**Sesudah (PostgreSQL + JWT):**

- ✅ JWT token (tidak disimpan di database)
- ✅ Password di-hash dengan bcrypt (10 rounds)
- ✅ Token verification menggunakan JWT
- ✅ Token expires dalam 7 hari (configurable)

### 4. **Services Layer**

#### `authService.js`

- ✅ `login()` - Query PostgreSQL, verify bcrypt password, generate JWT
- ✅ `register()` - Insert ke PostgreSQL dengan bcrypt hashing
- ✅ `findByToken()` - Verify JWT dan query user dari PostgreSQL

#### `eventsService.js`

- ✅ `getAll()` - Query PostgreSQL dengan filters & pagination
- ✅ `getById()` - Query single event
- ✅ `create()` - INSERT event
- ✅ `update()` - UPDATE event dengan COALESCE
- ✅ `remove()` - DELETE event
- ✅ `searchByName()` - ILIKE search dengan pagination

#### `registrationsService.js`

- ✅ `create()` - INSERT dengan ON CONFLICT handling
- ✅ `getByEventId()` - JOIN dengan users table
- ✅ `getByUserId()` - JOIN dengan events table
- ✅ `getById()` - JOIN dengan users & events
- ✅ `removeById()` - DELETE registration
- ✅ `removeByEventAndUser()` - DELETE dengan composite key

### 5. **Middleware**

- ✅ `isLogin.js` - Updated untuk JWT verification

### 6. **Field Name Mapping**

| JSON (camelCase) | PostgreSQL (snake_case)   |
| ---------------- | ------------------------- |
| `createdAt`      | `created_at`              |
| `updatedAt`      | `updated_at`              |
| `registeredAt`   | `registered_at`           |
| `eventId`        | `event_id`                |
| `userId`         | `user_id`                 |
| `userName`       | ❌ Dihapus (gunakan JOIN) |
| `userEmail`      | ❌ Dihapus (gunakan JOIN) |

---

## 🚀 Cara Menjalankan

### 1. **Setup Database**

Pastikan Anda sudah menjalankan SQL schema yang telah dibuat:

```sql
-- Buat ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE event_category AS ENUM ('workshop', 'seminar', 'lomba', 'pelatihan', 'lainnya');
CREATE TYPE registration_status AS ENUM ('registered', 'cancelled');

-- Buat tables: users, events, registrations
-- (Gunakan schema yang sudah Anda buat)
```

### 2. **Setup Environment Variables**

Buat file `.env` di root backend:

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials PostgreSQL Anda:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_kampus
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=ganti-dengan-secret-key-yang-kuat
JWT_EXPIRES_IN=7d
```

### 3. **Install Dependencies**

```bash
npm install
```

### 4. **Run Server**

```bash
npm run dev
```

Jika berhasil, Anda akan melihat:

```
✅ Database connected successfully at 2025-11-19T...
🚀 Server berjalan di port 3000
```

---

## 🔐 Migrasi Data Existing (Opsional)

Jika Anda memiliki data di file JSON yang ingin dimigrasikan:

### Script Migrasi Users

```javascript
const fs = require("fs");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function migrateUsers() {
  const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pool.query(
      "INSERT INTO users (id, nama, email, password, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING",
      [user.id, user.nama, user.email, hashedPassword, user.role]
    );
  }

  console.log("✅ Users migrated");
}

migrateUsers().then(() => process.exit());
```

### Script Migrasi Events

```javascript
async function migrateEvents() {
  const events = JSON.parse(fs.readFileSync("./data/events.json", "utf-8"));

  for (const event of events) {
    await pool.query(
      "INSERT INTO events (id, name, date, time, location, category, description) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING",
      [
        event.id,
        event.name,
        event.date,
        event.time,
        event.location,
        event.category,
        event.description,
      ]
    );
  }

  console.log("✅ Events migrated");
}
```

---

## 🧪 Testing API

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Response akan berisi JWT token:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "nama": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Create Event (dengan JWT token)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Workshop Web Development",
    "date": "2025-12-01",
    "time": "14:00:00",
    "location": "Gedung A",
    "category": "workshop",
    "description": "Belajar web development dari dasar"
  }'
```

---

## 📝 Catatan Penting

### Breaking Changes

1. **Authentication token format berubah**

   - Lama: UUID string
   - Baru: JWT token (lebih panjang)
   - Frontend perlu update untuk handle JWT

2. **Response field names**

   - PostgreSQL mengembalikan `snake_case`
   - Frontend mungkin perlu disesuaikan jika expect `camelCase`
   - Contoh: `created_at` bukan `createdAt`

3. **Registrations tidak menyimpan snapshot**
   - Lama: `userName` dan `userEmail` disimpan
   - Baru: Harus JOIN untuk mendapatkan data user
   - Response structure sedikit berbeda

### Security Improvements

- ✅ Password hashing dengan bcrypt
- ✅ JWT dengan expiration
- ✅ No token storage in database
- ✅ SQL injection protection (parameterized queries)
- ✅ Foreign key constraints
- ✅ Unique constraints

### Performance Improvements

- ✅ Database indexing (UUID primary keys)
- ✅ Connection pooling
- ✅ Efficient JOIN queries
- ✅ ENUM types untuk category/status

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

- Pastikan Anda sudah menjalankan schema SQL
- Cek nama database di `.env` sesuai

### Error: "password authentication failed"

- Cek credentials di `.env`
- Pastikan PostgreSQL service running

### Error: "Invalid or expired token"

- Token JWT expired (default 7 hari)
- Login ulang untuk mendapatkan token baru

### Error: "invalid input value for enum"

- Pastikan value sesuai dengan ENUM definition
- Category: 'workshop', 'seminar', 'lomba', 'pelatihan', 'lainnya'
- Role: 'admin', 'user'
- Status: 'registered', 'cancelled'

---

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [node-postgres](https://node-postgres.com/)
