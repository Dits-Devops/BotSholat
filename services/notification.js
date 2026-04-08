const { getActiveSewa, upsertSholatLog } = require('../database/db');
const logger = require('../utils/logger');

const PRAYER_NAMES = {
  Subuh: 'subuh',
  Dzuhur: 'dzuhur',
  Ashar: 'ashar',
  Maghrib: 'maghrib',
  Isya: 'isya',
};

// Menyimpan state "menunggu jawaban" untuk notifikasi sholat
// Format: { jid: { prayer: 'subuh', tanggal: '2024-01-01' } }
const pendingResponses = new Map();

function setPending(jid, prayer, tanggal) {
  pendingResponses.set(jid, { prayer, tanggal });
}

function getPending(jid) {
  return pendingResponses.get(jid) || null;
}

function clearPending(jid) {
  pendingResponses.delete(jid);
}

async function sendPrayerReminder(sock, prayerName) {
  const activeUsers = getActiveSewa();
  const prayerKey = PRAYER_NAMES[prayerName];
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  const message =
    `🕌 *WAKTU SHOLAT ${prayerName.toUpperCase()} TELAH TIBA*\n\n` +
    `Apakah kamu sudah sholat?\n\n` +
    `Ketik:\n` +
    `✅ *sudah ${prayerName.toLowerCase()}*\n` +
    `❌ *belum*`;

  for (const row of activeUsers) {
    try {
      await sock.sendMessage(row.jid, { text: message });
      setPending(row.jid, prayerKey, today);
      logger.info(`Notifikasi ${prayerName} dikirim ke ${row.jid}`);
    } catch (err) {
      logger.error({ err, jid: row.jid }, `Gagal kirim notifikasi ${prayerName}`);
    }
  }
}

async function markUnansweredAsMissed(prayerKey) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  for (const [jid, pending] of pendingResponses.entries()) {
    if (pending.prayer === prayerKey && pending.tanggal === today) {
      try {
        upsertSholatLog(jid, today, prayerKey, 'belum');
        clearPending(jid);
        logger.info(`Auto tandai ${prayerKey} belum untuk ${jid}`);
      } catch (err) {
        logger.error({ err }, `Gagal auto-tandai ${prayerKey} untuk ${jid}`);
      }
    }
  }
}

async function sendImsak(sock) {
  const activeUsers = getActiveSewa();
  const msg = `⏰ *Imsak 1 menit lagi!*\nSegera selesaikan sahur ya 🤍\nJangan lupa niat puasa!`;
  for (const row of activeUsers) {
    try {
      await sock.sendMessage(row.jid, { text: msg });
    } catch (err) {
      logger.error({ err, jid: row.jid }, 'Gagal kirim notifikasi imsak');
    }
  }
}

async function sendBukaReminder(sock) {
  const activeUsers = getActiveSewa();
  const msg = `🌙 *Sudah berbuka?*\nJangan lupa sholat Maghrib ya 🤍\n\nاللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ`;
  for (const row of activeUsers) {
    try {
      await sock.sendMessage(row.jid, { text: msg });
    } catch (err) {
      logger.error({ err, jid: row.jid }, 'Gagal kirim notifikasi buka');
    }
  }
}

async function sendSubuhBerkah(sock) {
  const activeUsers = getActiveSewa();
  const msg = `🌅 *Selamat pagi!*\nSemoga harimu penuh berkah hari ini 🤍\nJangan lupa dzikir pagi ya!`;
  for (const row of activeUsers) {
    try {
      await sock.sendMessage(row.jid, { text: msg });
    } catch (err) {
      logger.error({ err, jid: row.jid }, 'Gagal kirim notifikasi subuh berkah');
    }
  }
}

async function sendSewaExpiredNotification(sock, jid) {
  try {
    await sock.sendMessage(jid, {
      text:
        '⚠️ *Masa sewa kamu telah habis.*\n\n' +
        'Bot tidak akan mengirim pengingat sholat lagi.\n' +
        'Hubungi admin untuk memperpanjang sewa. 🙏',
    });
  } catch (err) {
    logger.error({ err, jid }, 'Gagal kirim notifikasi sewa expired');
  }
}

module.exports = {
  sendPrayerReminder,
  markUnansweredAsMissed,
  sendImsak,
  sendBukaReminder,
  sendSubuhBerkah,
  sendSewaExpiredNotification,
  setPending,
  getPending,
  clearPending,
};
