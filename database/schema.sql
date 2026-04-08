-- Tabel Users (menyimpan user yang terdaftar)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jid TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabel Sewa (menyimpan data sewa user)
CREATE TABLE IF NOT EXISTS sewa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jid TEXT NOT NULL UNIQUE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabel Sholat Log (menyimpan rekap sholat harian per user)
CREATE TABLE IF NOT EXISTS sholat_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jid TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  subuh TEXT NOT NULL DEFAULT 'pending',
  dzuhur TEXT NOT NULL DEFAULT 'pending',
  ashar TEXT NOT NULL DEFAULT 'pending',
  maghrib TEXT NOT NULL DEFAULT 'pending',
  isya TEXT NOT NULL DEFAULT 'pending',
  UNIQUE(jid, tanggal)
);

-- Tabel Jadwal Sholat (cache API)
CREATE TABLE IF NOT EXISTS jadwal_sholat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL UNIQUE,
  fajr TEXT,
  sunrise TEXT,
  dhuhr TEXT,
  asr TEXT,
  maghrib TEXT,
  isha TEXT,
  imsak TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
