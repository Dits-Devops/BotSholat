const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = path.join(__dirname, 'botsholat.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    logger.info('Database initialized');
  }
  return db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

function upsertUser(jid) {
  const stmt = getDb().prepare(
    `INSERT OR IGNORE INTO users (jid) VALUES (?)`
  );
  stmt.run(jid);
}

// ─── Sewa ─────────────────────────────────────────────────────────────────────

function addSewa(jid, days) {
  const db = getDb();
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  const startStr = now.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const stmt = db.prepare(
    `INSERT INTO sewa (jid, start_date, end_date)
     VALUES (?, ?, ?)
     ON CONFLICT(jid) DO UPDATE SET start_date=excluded.start_date, end_date=excluded.end_date`
  );
  stmt.run(jid, startStr, endStr);
  upsertUser(jid);
}

function deleteSewa(id) {
  const stmt = getDb().prepare(`DELETE FROM sewa WHERE id = ?`);
  return stmt.run(id);
}

function listSewa() {
  return getDb().prepare(`SELECT * FROM sewa ORDER BY id ASC`).all();
}

function getSewa(jid) {
  return getDb().prepare(`SELECT * FROM sewa WHERE jid = ?`).get(jid);
}

function getActiveSewa() {
  const today = new Date().toISOString().split('T')[0];
  return getDb()
    .prepare(`SELECT * FROM sewa WHERE end_date >= ?`)
    .all(today);
}

function getExpiredSewa() {
  const today = new Date().toISOString().split('T')[0];
  return getDb()
    .prepare(`SELECT * FROM sewa WHERE end_date < ?`)
    .all(today);
}

// ─── Sholat Log ───────────────────────────────────────────────────────────────

function getTodayLog(jid) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  return getDb()
    .prepare(`SELECT * FROM sholat_log WHERE jid = ? AND tanggal = ?`)
    .get(jid, today);
}

function upsertSholatLog(jid, tanggal, prayer, status) {
  const db = getDb();
  db.prepare(
    `INSERT INTO sholat_log (jid, tanggal) VALUES (?, ?)
     ON CONFLICT(jid, tanggal) DO NOTHING`
  ).run(jid, tanggal);

  const validColumns = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  if (!validColumns.includes(prayer)) throw new Error('Invalid prayer name');

  db.prepare(
    `UPDATE sholat_log SET ${prayer} = ? WHERE jid = ? AND tanggal = ?`
  ).run(status, jid, tanggal);
}

function getMonthlyLog(jid, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getDb()
    .prepare(
      `SELECT * FROM sholat_log
       WHERE jid = ? AND tanggal LIKE ?
       ORDER BY tanggal ASC`
    )
    .all(jid, `${prefix}%`);
}

function resetSholatLog(jid) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  getDb()
    .prepare(`DELETE FROM sholat_log WHERE jid = ? AND tanggal = ?`)
    .run(jid, today);
}

function getAllUserJids() {
  return getDb()
    .prepare(`SELECT DISTINCT jid FROM sewa`)
    .all()
    .map((r) => r.jid);
}

// ─── Jadwal Sholat Cache ──────────────────────────────────────────────────────

function getJadwal(tanggal) {
  return getDb()
    .prepare(`SELECT * FROM jadwal_sholat WHERE tanggal = ?`)
    .get(tanggal);
}

function saveJadwal(tanggal, timings) {
  getDb()
    .prepare(
      `INSERT INTO jadwal_sholat (tanggal, fajr, sunrise, dhuhr, asr, maghrib, isha, imsak)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(tanggal) DO UPDATE SET
         fajr=excluded.fajr, sunrise=excluded.sunrise,
         dhuhr=excluded.dhuhr, asr=excluded.asr,
         maghrib=excluded.maghrib, isha=excluded.isha,
         imsak=excluded.imsak,
         updated_at=datetime('now','localtime')`
    )
    .run(
      tanggal,
      timings.Fajr,
      timings.Sunrise,
      timings.Dhuhr,
      timings.Asr,
      timings.Maghrib,
      timings.Isha,
      timings.Imsak
    );
}

module.exports = {
  getDb,
  upsertUser,
  addSewa,
  deleteSewa,
  listSewa,
  getSewa,
  getActiveSewa,
  getExpiredSewa,
  getTodayLog,
  upsertSholatLog,
  getMonthlyLog,
  resetSholatLog,
  getAllUserJids,
  getJadwal,
  saveJadwal,
};
