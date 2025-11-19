# Event Kampus Backend

Backend untuk aplikasi Event Kampus yang dibangun dengan Node.js, Express, dan PostgreSQL.

## 🎉 Update: Migrasi ke PostgreSQL

Backend ini telah **berhasil dimigrasikan dari JSON storage ke PostgreSQL** dengan fitur-fitur modern:

- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ PostgreSQL Database
- ✅ Connection Pooling
- ✅ Production-ready schema dengan ENUM types dan foreign keys
- ✅ Clean & Organized folder structure

📖 **[Lihat Panduan Migrasi Lengkap](./docs/MIGRATION_GUIDE.md)**

## 📁 Struktur Folder

```text
event-kampus-backend/
├── src/                      # Source code utama
│   ├── config/              # Database configuration
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Custom middleware
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── app.js               # Express app setup
├── scripts/                 # Utility scripts
│   ├── create-database.js   # Database creation
│   ├── setup-schema.js      # Schema setup
│   ├── migrate-data.js      # Data migration
│   ├── test-db.js           # Database testing
│   └── test-api.js          # API testing
├── docs/                    # Documentation
│   ├── MIGRATION_GUIDE.md
│   ├── QUICKSTART.md
│   └── CHECKLIST.md
├── .env                     # Environment variables
├── index.js                 # Entry point
└── package.json
```

## Fitur

- Autentikasi Pengguna (Login/Register) dengan JWT
- Password Hashing dengan bcrypt
- Manajemen Event (CRUD)
- Pendaftaran Event dengan relasi database
- Manajemen Pengguna
- API RESTful
- PostgreSQL Database dengan connection pooling

## Teknologi yang Digunakan

- Node.js
- Express.js
- **PostgreSQL** (Database)
- **pg** (PostgreSQL client)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT authentication)
- CORS (Cross-Origin Resource Sharing)
- Dotenv (Environment variables)

## Cara Instalasi

### 1. Prerequisites

- Node.js v14 atau lebih tinggi
- PostgreSQL v12 atau lebih tinggi

### 2. Clone Repository

```bash
git clone https://github.com/ElFahrezaSufi/event-kampus-backend.git
cd event-kampus-backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Setup Database

**Cara Otomatis (Recommended):**

```bash
# 1. Buat database
node scripts/create-database.js

# 2. Setup schema (tables, indexes, ENUMs)
node scripts/setup-schema.js

# 3. (Opsional) Migrate data dari JSON ke PostgreSQL
node scripts/migrate-data.js
```

**Cara Manual:**

Lihat dokumentasi lengkap di [docs/QUICKSTART.md](./docs/QUICKSTART.md)
CREATE TYPE registration_status AS ENUM ('registered', 'cancelled');

-- Users Table
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
nama VARCHAR(100) NOT NULL,
email VARCHAR(150) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role user_role NOT NULL DEFAULT 'user',
created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255) NOT NULL,
date DATE NOT NULL,
time TIME,
location VARCHAR(255) NOT NULL,
category event_category NOT NULL,
description TEXT,
created_at TIMESTAMP NOT NULL DEFAULT NOW(),
updated_at TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
status registration_status NOT NULL DEFAULT 'registered',
UNIQUE (event_id, user_id)
);

````text

### 5. Setup Environment VariablesBuat file `.env` di root directory:

```bash
cp .env.example .env
````

Edit `.env` dengan credentials PostgreSQL Anda:

```env
PORT=3000

# PostgreSQL Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_kampus
DB_PASSWORD=your_password
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

### 6. (Opsional) Migrasi Data dari JSON

Jika Anda memiliki data lama di file JSON (`data/users.json`, `data/events.json`, `data/registrations.json`):

```bash
node migrate-data.js
```

### 7. Jalankan Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

Jika berhasil terhubung ke database, Anda akan melihat:

```text
✅ Database connected successfully at 2025-11-19T...
🚀 Server berjalan di port 3000
```

## API Endpoints

### Autentikasi

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "nama": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Events

#### Get All Events (with filters & pagination)

```http
GET /api/events?location=Gedung A&category=workshop&page=1&limit=10
```

#### Get Event by ID

```http
GET /api/events/:id
```

#### Search Events

```http
GET /api/events/search?q=workshop&page=1&limit=10
```

#### Create Event (Admin only)

```http
POST /api/events
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Workshop Web Development",
  "date": "2025-12-01",
  "time": "14:00:00",
  "location": "Gedung A",
  "category": "workshop",
  "description": "Belajar web development dari dasar"
}
```

#### Update Event (Admin only)

```http
PUT /api/events/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Event Name",
  "location": "Gedung B"
}
```

#### Delete Event (Admin only)

```http
DELETE /api/events/:id
Authorization: Bearer <JWT_TOKEN>
```

#### Get Event Registrations

```http
GET /api/events/:id/registrations
```

#### Register for Event

```http
POST /api/events/:id/register
Authorization: Bearer <JWT_TOKEN>
```

#### Cancel Registration (Current User)

```http
DELETE /api/events/:id/registrations
Authorization: Bearer <JWT_TOKEN>
```

#### Cancel Registration by ID (Admin or Owner)

```http
DELETE /api/events/:id/registrations/:regId
Authorization: Bearer <JWT_TOKEN>
```

### Registrations

#### Get My Registrations

```http
GET /api/registrations/me
Authorization: Bearer <JWT_TOKEN>
```

#### Get User Registrations (Admin)

```http
GET /api/registrations/user/:userId
Authorization: Bearer <JWT_TOKEN>
```

## Struktur Proyek

```text
event-kampus-backend/
├── controllers/     # Logic untuk menangani request
├── data/           # File JSON untuk penyimpanan data
├── middleware/     # Middleware untuk autentikasi dan validasi
├── routes/         # Definisi route API
├── services/       # Business logic
├── .env            # Environment variables
├── .gitignore
├── app.js          # Konfigurasi Express
├── index.js        # Entry point aplikasi
└── package.json
```

## Kontribusi

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan Anda (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
