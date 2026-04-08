const cron = require('node-cron');
const { getJadwalHariIni, updateJadwalHariIni } = require('./sholat-api');
const {
  sendPrayerReminder,
  markUnansweredAsMissed,
  sendImsak,
  sendBukaReminder,
  sendSubuhBerkah,
  sendSewaExpiredNotification,
} = require('./notification');
const { getExpiredSewa, deleteSewa } = require('../database/db');
const logger = require('../utils/logger');
const config = require('../config/config');

// Konversi "HH:MM" ke { hour, minute }
function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h, minute: m };
}

// Buat cron expression "minute hour * * *"
function toCron(hour, minute) {
  return `${minute} ${hour} * * *`;
}

// Kurangi 1 menit
function subOneMinute(hour, minute) {
  if (minute === 0) return { hour: hour - 1, minute: 59 };
  return { hour, minute: minute - 1 };
}

let scheduledTasks = [];

async function startScheduler(sock) {
  // Update jadwal sholat setiap hari pukul 00:05
  cron.schedule('5 0 * * *', async () => {
    logger.info('Update jadwal sholat harian...');
    await updateJadwalHariIni();
    await rescheduleToday(sock);
  }, { timezone: config.sholat.timezone });

  // Cek masa sewa setiap hari pukul 07:00
  cron.schedule('0 7 * * *', async () => {
    logger.info('Cek masa sewa...');
    const expired = getExpiredSewa();
    for (const row of expired) {
      await sendSewaExpiredNotification(sock, row.jid);
    }
  }, { timezone: config.sholat.timezone });

  // Jadwalkan notifikasi berdasarkan jadwal hari ini
  await rescheduleToday(sock);

  logger.info('Scheduler berhasil dijalankan');
}

async function rescheduleToday(sock) {
  // Hentikan task lama
  for (const t of scheduledTasks) {
    t.stop();
  }
  scheduledTasks = [];

  const row = await getJadwalHariIni();
  if (!row) {
    logger.warn('Jadwal sholat hari ini tidak tersedia, scheduler tidak dijadwalkan');
    return;
  }

  const PRAYERS = [
    { name: 'Subuh', key: 'subuh', timeField: 'fajr' },
    { name: 'Dzuhur', key: 'dzuhur', timeField: 'dhuhr' },
    { name: 'Ashar', key: 'ashar', timeField: 'asr' },
    { name: 'Maghrib', key: 'maghrib', timeField: 'maghrib' },
    { name: 'Isya', key: 'isya', timeField: 'isha' },
  ];

  const tz = config.sholat.timezone;

  for (let i = 0; i < PRAYERS.length; i++) {
    const prayer = PRAYERS[i];
    const nextPrayer = PRAYERS[i + 1];
    const rawTime = row[prayer.timeField];
    if (!rawTime) continue;

    const { hour, minute } = parseTime(rawTime.split(' ')[0]);

    // Kirim notifikasi saat waktu sholat tiba
    const reminderTask = cron.schedule(
      toCron(hour, minute),
      async () => {
        // Auto tandai sholat sebelumnya sebagai belum jika belum dijawab
        if (i > 0) {
          await markUnansweredAsMissed(PRAYERS[i - 1].key);
        }
        await sendPrayerReminder(sock, prayer.name);
      },
      { timezone: tz }
    );
    scheduledTasks.push(reminderTask);
    logger.info(`Dijadwalkan notifikasi ${prayer.name} pada ${hour}:${String(minute).padStart(2,'0')}`);
  }

  // Imsak: 1 menit sebelum Fajr
  if (row.imsak) {
    const { hour: fh, minute: fm } = parseTime(row.imsak.split(' ')[0]);
    const { hour: ih, minute: im } = subOneMinute(fh, fm);
    const imsakTask = cron.schedule(toCron(ih, im), async () => {
      await sendImsak(sock);
    }, { timezone: tz });
    scheduledTasks.push(imsakTask);
  }

  // 5 menit setelah Maghrib: notifikasi berbuka
  if (row.maghrib) {
    const { hour: mh, minute: mm } = parseTime(row.maghrib.split(' ')[0]);
    const afterMin = (mm + 5) % 60;
    const afterHour = mh + Math.floor((mm + 5) / 60);
    const bukaTask = cron.schedule(toCron(afterHour, afterMin), async () => {
      await sendBukaReminder(sock);
    }, { timezone: tz });
    scheduledTasks.push(bukaTask);
  }

  // 10 menit setelah Fajr: notifikasi berkah
  if (row.fajr) {
    const { hour: sh, minute: sm } = parseTime(row.fajr.split(' ')[0]);
    const afterMin = (sm + 10) % 60;
    const afterHour = sh + Math.floor((sm + 10) / 60);
    const berkahTask = cron.schedule(toCron(afterHour, afterMin), async () => {
      await sendSubuhBerkah(sock);
    }, { timezone: tz });
    scheduledTasks.push(berkahTask);
  }

  // Auto tandai Isya belum jika tidak dijawab - tengah malam
  const midnightTask = cron.schedule('59 23 * * *', async () => {
    await markUnansweredAsMissed('isya');
  }, { timezone: tz });
  scheduledTasks.push(midnightTask);
}

module.exports = { startScheduler };
