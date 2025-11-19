# 🛠️ Utility Scripts

Folder ini berisi utility scripts untuk database management dan testing.

## 📋 Daftar Scripts

### 1. `create-database.js`

**Fungsi:** Membuat database PostgreSQL baru

**Usage:**

```bash
node scripts/create-database.js
```

**What it does:**

- Connect ke PostgreSQL server (default database: `postgres`)
- Create database `event_kampus` jika belum ada
- Menampilkan konfirmasi sukses

---

### 2. `setup-schema.js`

**Fungsi:** Setup schema database (ENUM types, tables, indexes)

**Usage:**

```bash
node scripts/setup-schema.js
```

**What it does:**

- Membuat 3 ENUM types: `user_role`, `event_category`, `registration_status`
- Membuat 3 tables: `users`, `events`, `registrations`
- Membuat 6 indexes untuk performance optimization
- Setup foreign key constraints

**⚠️ Note:** Harus dijalankan setelah `create-database.js`

---

### 3. `migrate-data.js`

**Fungsi:** Migrate data dari JSON files ke PostgreSQL

**Usage:**

```bash
node scripts/migrate-data.js
```

**What it does:**

- Membaca data dari `data/users.json`, `data/events.json`, `data/registrations.json`
- Hash password dengan bcrypt untuk users
- Insert data ke PostgreSQL dengan proper validation
- Menampilkan summary hasil migration

**⚠️ Note:**

- Harus dijalankan setelah `setup-schema.js`
- Folder `data/` sudah dihapus karena sudah menggunakan PostgreSQL

---

### 4. `test-db.js`

**Fungsi:** Test database connection dan basic queries

**Usage:**

```bash
node scripts/test-db.js
```

**What it does:**

- Test connection ke PostgreSQL
- Verify schema (tables, ENUM types, indexes)
- Test basic queries (SELECT, INSERT, UPDATE, DELETE)
- Menampilkan hasil test dengan color-coded output

**Perfect for:**

- Debugging connection issues
- Verifying schema setelah migration
- Quick health check

---

### 5. `test-api.js`

**Fungsi:** Test API functionality secara programmatik

**Usage:**

```bash
node scripts/test-api.js
```

**What it does:**

- Test authentication (register, login, JWT validation)
- Test events CRUD operations
- Test registrations dengan JOIN queries
- Test error handling dan edge cases
- Menampilkan comprehensive test report

**Perfect for:**

- Pre-deployment testing
- Regression testing setelah perubahan
- API documentation validation

---

## 🚀 Quick Start Sequence

Untuk setup project dari awal:

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env dengan database credentials

# 2. Install dependencies
npm install

# 3. Database setup
node scripts/create-database.js
node scripts/setup-schema.js

# 4. (Optional) Migrate old data
node scripts/migrate-data.js

# 5. Test everything
node scripts/test-db.js
node scripts/test-api.js

# 6. Start server
npm start
```

---

## 💡 Tips

1. **Always run in order:** create-database → setup-schema → migrate-data → test
2. **Environment variables:** Pastikan `.env` sudah dikonfigurasi sebelum run scripts
3. **Error handling:** Semua scripts memiliki error handling yang jelas
4. **Idempotent:** Scripts dirancang agar safe untuk dijalankan multiple times
5. **Production ready:** Scripts mengikuti best practices untuk production deployment

---

## 🔧 Troubleshooting

**Database connection error:**

```text
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Solution: Pastikan PostgreSQL service running
- Check: `pg_ctl status` atau restart PostgreSQL service

**Permission denied:**

```text
Error: permission denied for database
```

- Solution: Grant privileges: `GRANT ALL PRIVILEGES ON DATABASE event_kampus TO your_user;`

**Schema already exists:**

```text
Error: type "user_role" already exists
```

- This is OK! Scripts menggunakan `IF NOT EXISTS` / `DO $$ BEGIN ... EXCEPTION` pattern

---

## 📚 Related Documentation

- [QUICKSTART.md](../docs/QUICKSTART.md) - Setup guide untuk production
- [MIGRATION_GUIDE.md](../docs/MIGRATION_GUIDE.md) - Detailed migration documentation
- [CHECKLIST.md](../docs/CHECKLIST.md) - Pre-deployment checklist

---

**Need help?** Check main [README.md](../README.md) atau contact maintainer.
