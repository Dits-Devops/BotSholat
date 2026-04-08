# 🕌 BotSholat — WhatsApp Bot Pengingat Sholat

Bot WhatsApp berbasis **Baileys** untuk pengingat sholat otomatis, tracking ibadah harian, rekap bulanan, dan sistem sewa berbasis **Node.js + SQLite**.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| 🕌 Pengingat Sholat | Kirim notifikasi saat waktu sholat tiba ke semua user aktif |
| 📊 Tracking Harian | Rekap status sholat hari ini per user |
| 📅 Rekap Bulanan | Hitung total sholat bolong per bulan |
| 🕰️ Jadwal Sholat | Jadwal real-time via Aladhan API |
| 👑 Sistem Sewa | Owner bisa tambah/hapus/lihat sewa user |
| ⏰ Notifikasi Tambahan | Imsak, berbuka, berkah subuh |
| 💬 Perintah Islami | Motivasi & doa harian random |

---

## 📁 Struktur Proyek

```
BotSholat/
├── config/config.js          # Konfigurasi utama
├── database/
│   ├── db.js                 # SQLite queries
│   └── schema.sql            # Skema database
├── commands/
│   ├── handlers.js           # Router perintah
│   ├── owner/                # Perintah khusus owner
│   └── user/                 # Perintah user
├── services/
│   ├── sholat-api.js         # Integrasi Aladhan API
│   ├── scheduler.js          # Cron jobs
│   └── notification.js       # Kirim notifikasi
├── utils/
│   ├── logger.js             # Logging
│   ├── message-formatter.js  # Format pesan
│   └── validator.js          # Validasi input
├── .env.example
├── index.js                  # Entry point
└── package.json
```

---

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env: isi OWNER_NUMBER dengan nomor WhatsApp kamu (contoh: 628123456789)
```

### 3. Jalankan Bot
```bash
npm start
```
Scan QR code yang muncul di terminal dengan WhatsApp.

### 4. Deploy ke VPS (Production)
```bash
npm install -g pm2
pm2 start index.js --name BotSholat
pm2 save
pm2 startup
```

---

## 📋 Perintah Bot

### 👑 Owner Commands
| Perintah | Keterangan |
|---|---|
| `addsewa 628xxx@c.us 5` | Tambah sewa user 5 hari |
| `delsewa 1` | Hapus sewa nomor urut 1 |
| `listsewa` | Lihat semua sewa + sisa hari |

### 🙋 User Commands
| Perintah | Keterangan |
|---|---|
| `listsholat` | Rekap sholat hari ini |
| `rekapbulan` | Rekap sholat bulan ini |
| `waktusholat` | Jadwal sholat hari ini |
| `status` | Status sholat hari ini (ringkas) |
| `resetsholat` | Reset data sholat hari ini |
| `motivasi` | Quotes islami random |
| `doa` | Doa harian random |
| `ceksewa` | Cek sisa hari sewa |

---

## ⚙️ Konfigurasi `.env`

| Variable | Keterangan | Default |
|---|---|---|
| `OWNER_NUMBER` | Nomor WhatsApp owner | `628xxxxxxxxxx` |
| `GROUP_PENGELOLA` | JID group pengelola | `120363423664469094@g.us` |
| `CITY` | Kota untuk jadwal sholat | `Tajurhalang` |
| `COUNTRY` | Negara | `Indonesia` |
| `METHOD` | Metode perhitungan sholat (Aladhan) | `11` (Singapore — cocok untuk Indonesia) |
| `TIMEZONE` | Timezone | `Asia/Jakarta` |

---

## 📦 Tech Stack

- [Baileys](https://github.com/WhiskeySockets/Baileys) — WhatsApp Web API
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — SQLite database
- [node-cron](https://github.com/node-cron/node-cron) — Cron scheduler
- [axios](https://github.com/axios/axios) — HTTP client
- [pino](https://github.com/pinojs/pino) — Logger
- [Aladhan API](https://aladhan.com/prayer-times-api) — Jadwal sholat

---

## 🔔 Cara Kerja Pengingat Sholat

1. Bot mengambil jadwal sholat dari Aladhan API setiap hari
2. Cron scheduler menjadwalkan notifikasi sesuai waktu sholat
3. Saat waktu sholat tiba, bot kirim pesan ke semua user aktif (yang sewanya masih berlaku)
4. User menjawab `sudah [nama sholat]` atau `belum`
5. Jika tidak menjawab sampai waktu sholat berikutnya, otomatis ditandai ❌

---

## 📄 Lisensi

MIT
