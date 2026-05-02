# 🏛️ SIPLA — Sistem Informasi Pusat Layanan dan Aspirasi Masyarakat

> Platform digital pelayanan publik berbasis web untuk **Kelurahan Serua Indah**, Kecamatan Ciputat, Kota Tangerang Selatan.

---

## 🚀 Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Go + Gin Framework + GORM |
| **Frontend** | React.js + Vite + Tailwind CSS |
| **Database** | MySQL |
| **Auth** | JWT (JSON Web Token) |
| **Peta** | React-Leaflet + OpenStreetMap |

---

## ✨ Fitur Utama

- 🌐 **Landing Page** — Portal informasi Kelurahan Serua Indah dengan statistik penduduk, profil, visi & misi
- 🔐 **Autentikasi** — Login & registrasi dengan 3 level role: `masyarakat`, `petugas`, `admin`
- 📢 **Aspirasi Masyarakat** — Sampaikan aspirasi/pengaduan lengkap dengan pin lokasi di peta interaktif dan upload foto
- 📄 **Permohonan Layanan** — Ajukan 6 jenis surat keterangan dengan upload dokumen (KTP, KK, file pendukung)
- 🗺️ **Peta Wilayah** — Polygon batas wilayah Serua Indah di dashboard admin, klik untuk info kelurahan
- 📎 **Upload Bukti** — Petugas dapat upload file bukti (PDF/JPG/PNG) saat merespons aspirasi
- 📊 **Export Data** — Download daftar aspirasi & permohonan ke **Excel** dan **PDF**
- 🏛️ **Dashboard Admin** — Statistik real-time + peta + aspirasi terbaru

---

## 📁 Struktur Proyek

```
sipla/
├── backend/                  # Go REST API
│   ├── main.go
│   ├── .env
│   ├── go.mod
│   ├── config/
│   │   └── database.go       # Koneksi MySQL
│   ├── middleware/
│   │   └── auth.go           # JWT middleware & role guard
│   ├── models/
│   │   └── models.go         # Semua struct model DB
│   ├── controllers/
│   │   ├── auth.go           # Login, register, me
│   │   ├── pengaduan.go      # CRUD aspirasi + koordinat peta
│   │   ├── tanggapan.go      # Tanggapan + upload file bukti
│   │   ├── permohonan.go     # CRUD permohonan layanan
│   │   ├── kelurahan.go      # Info kelurahan
│   │   └── wilayah.go        # Provinsi, kab, kec, desa
│   ├── routes/
│   │   └── routes.go         # Definisi semua endpoint
│   └── assets/               # File upload (dibuat manual)
│       ├── pengaduan/
│       ├── permohonan/
│       ├── bukti/
│       └── hasil/
│
└── frontend/                 # React SPA
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx            # Routing utama
        ├── main.jsx
        ├── index.css          # Tailwind base
        ├── services/
        │   └── api.js         # Axios instance + interceptor
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── components/
        │   ├── AdminLayout.jsx # Sidebar layout admin
        │   └── UserLayout.jsx  # Navbar layout user
        └── pages/
            ├── Landing.jsx     # Halaman portal publik
            ├── Login.jsx       # Halaman login
            ├── Register.jsx    # Halaman registrasi
            ├── admin/
            │   ├── Dashboard.jsx   # Statistik + peta
            │   ├── Aspirasi.jsx    # Kelola aspirasi + export
            │   ├── Permohonan.jsx  # Kelola permohonan + export
            │   └── Masyarakat.jsx  # Data masyarakat
            └── user/
                ├── Aspirasi.jsx    # Buat & pantau aspirasi
                └── Permohonan.jsx  # Ajukan permohonan layanan
```

---

## 🗄️ Struktur Database

```
masyarakat          — Data akun pengguna (NIK sebagai PK)
petugas             — Data akun petugas & admin
pengaduan           — Aspirasi/pengaduan masyarakat (+ lat/lng)
tanggapan           — Respons petugas + file bukti
permohonan          — Permohonan layanan administrasi
jenis_layanan       — Master jenis layanan (6 jenis)
kelurahan_info      — Profil, visi, misi kelurahan
provinces           — Data provinsi
regencies           — Data kabupaten/kota
districts           — Data kecamatan
villages            — Data desa/kelurahan
```

---

## ⚙️ Cara Menjalankan

### Prasyarat
- Go 1.21+
- Node.js 18+
- MySQL / XAMPP

### 1. Setup Database
```bash
# Buat database
CREATE DATABASE pengaduan_masyarakat3;

# Import file utama
mysql -u root pengaduan_masyarakat3 < pengaduan_masyarakat3.sql

# Import migration tambahan (tabel baru v2)
mysql -u root pengaduan_masyarakat3 < migration_v2.sql
```

### 2. Backend
```bash
cd backend

# Salin dan sesuaikan konfigurasi
cp .env.example .env

# Buat folder untuk upload file
mkdir -p assets/pengaduan assets/permohonan assets/bukti assets/hasil

# Install dependencies & jalankan
go mod tidy
go run main.go
# → Server berjalan di http://localhost:8080
```

### 3. Frontend
```bash
cd frontend

npm install
npm run dev
# → Aplikasi berjalan di http://localhost:5173
```

---

## 🔑 Konfigurasi `.env`

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=pengaduan_masyarakat3

JWT_SECRET=ganti_dengan_secret_key_anda

PORT=8080
```

---

## 🌐 API Endpoints

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login masyarakat / petugas |
| POST | `/api/auth/register` | Public | Registrasi masyarakat |
| GET | `/api/kelurahan` | Public | Info kelurahan |
| GET | `/api/layanan` | Public | Daftar jenis layanan |
| GET | `/api/aspirasi` | Auth | List aspirasi |
| POST | `/api/aspirasi` | Masyarakat | Buat aspirasi baru |
| PUT | `/api/aspirasi/:id` | Auth | Update aspirasi |
| DELETE | `/api/aspirasi/:id` | Auth | Hapus aspirasi |
| GET | `/api/permohonan` | Auth | List permohonan |
| POST | `/api/permohonan` | Masyarakat | Buat permohonan |
| PUT | `/api/permohonan/:id/proses` | Admin/Petugas | Proses permohonan |
| POST | `/api/tanggapan` | Admin/Petugas | Kirim tanggapan + bukti |
| GET | `/api/dashboard` | Admin/Petugas | Statistik dashboard |

---

## 👤 Role & Akses

| Role | Akses |
|---|---|
| `masyarakat` | Buat & pantau aspirasi, ajukan permohonan layanan |
| `petugas` | Kelola aspirasi & permohonan, kirim tanggapan + upload bukti |
| `admin` | Semua akses petugas + kelola data masyarakat & info kelurahan |

---

## 📦 Jenis Layanan Tersedia

1. Surat Keterangan Domisili
2. Surat Keterangan Tidak Mampu (SKTM)
3. Surat Pengantar KTP / Kartu Keluarga
4. Surat Keterangan Usaha
5. Surat Keterangan Kelahiran
6. Surat Keterangan Kematian

---

## 📌 Catatan

- File upload disimpan di folder `backend/assets/`
- Export Excel menghasilkan file `.csv` (kompatibel dengan Microsoft Excel & Google Sheets)
- Export PDF menggunakan fitur print browser (tidak memerlukan library tambahan)
- Peta menggunakan tile OpenStreetMap (tidak memerlukan API key)
