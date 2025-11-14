# Event Kampus Backend

Backend untuk aplikasi Event Kampus yang dibangun dengan Node.js, Express, dan JSON Server.

## Fitur

- Autentikasi Pengguna (Login/Register)
- Manajemen Event (CRUD)
- Pendaftaran Event
- Manajemen Pengguna
- API RESTful

## Teknologi yang Digunakan

- Node.js
- Express.js
- JSON Server (untuk penyimpanan data sementara)
- JWT (JSON Web Tokens) untuk autentikasi
- CORS (Cross-Origin Resource Sharing)
- Dotenv (untuk environment variables)

## Cara Instalasi

1. Clone repository ini:
   ```bash
   git clone https://github.com/ElFahrezaSufi/event-kampus-backend.git
   cd event-kampus-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env` di root direktori dan isi dengan konfigurasi berikut:
   ```
   PORT=3001
   JWT_SECRET=your_jwt_secret_key
   ```

4. Jalankan server pengembangan:
   ```bash
   npm start
   ```
   Server akan berjalan di http://localhost:3001

## API Endpoints

### Autentikasi
- `POST /api/auth/register` - Mendaftarkan pengguna baru
- `POST /api/auth/login` - Login pengguna

### Event
- `GET /api/events` - Mendapatkan semua event
- `GET /api/events/:id` - Mendapatkan detail event
- `POST /api/events` - Membuat event baru (memerlukan autentikasi)
- `PUT /api/events/:id` - Memperbarui event (memerlukan autentikasi)
- `DELETE /api/events/:id` - Menghapus event (memerlukan autentikasi)

### Pendaftaran
- `GET /api/registrations` - Mendapatkan semua pendaftaran (admin only)
- `GET /api/registrations/user` - Mendapatkan pendaftaran user yang login
- `POST /api/registrations` - Mendaftar ke sebuah event
- `DELETE /api/registrations/:id` - Membatalkan pendaftaran

## Struktur Proyek

```
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
