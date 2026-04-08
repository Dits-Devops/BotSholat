/**
 * Hitung sisa hari sewa dari end_date (string YYYY-MM-DD)
 */
function sisaHari(endDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * Format rekap sholat hari ini dari row sholat_log
 */
function formatDailySholat(row) {
  const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
  const LABELS = ['Subuh  ', 'Dzuhur ', 'Ashar  ', 'Maghrib', 'Isya   '];
  const ICONS = { sudah: '✅', belum: '❌', pending: '⏳' };

  const lines = PRAYERS.map((p, i) => {
    const status = row ? row[p] : 'pending';
    const icon = ICONS[status] || '⏳';
    return `${LABELS[i]} : ${icon}`;
  });

  return lines.join('\n');
}

/**
 * Format rekap bulanan dari array sholat_log rows
 */
function formatMonthlyRecap(rows) {
  if (!rows.length) return 'Belum ada data sholat bulan ini.';

  let totalBolong = 0;
  const lines = rows.map((row) => {
    const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const bolong = PRAYERS.filter((p) => row[p] === 'belum').length;
    totalBolong += bolong;
    const [, , day] = row.tanggal.split('-');
    const monthNames = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const monthNum = parseInt(row.tanggal.split('-')[1]);
    const label = `${parseInt(day)} ${monthNames[monthNum]}`;
    return bolong === 0 ? `${label} : Full ✅` : `${label} : Bolong ${bolong} 😢`;
  });

  return lines.join('\n') + `\n\nTotal bolong bulan ini: *${totalBolong} sholat*`;
}

/**
 * Format jadwal sholat dari row jadwal_sholat
 */
function formatJadwalSholat(row, city) {
  if (!row) return 'Jadwal sholat belum tersedia. Coba lagi nanti ya 🙏';
  return (
    `🕌 *JADWAL SHOLAT HARI INI*\n` +
    `Lokasi: ${city} (Jakarta Zone)\n\n` +
    `Imsak   : ${strip(row.imsak)}\n` +
    `Subuh   : ${strip(row.fajr)}\n` +
    `Dzuhur  : ${strip(row.dhuhr)}\n` +
    `Ashar   : ${strip(row.asr)}\n` +
    `Maghrib : ${strip(row.maghrib)}\n` +
    `Isya    : ${strip(row.isha)}`
  );
}

/** Buang keterangan akhir seperti " (WIB)" */
function strip(t) {
  if (!t) return '-';
  return t.split(' ')[0];
}

module.exports = { sisaHari, formatDailySholat, formatMonthlyRecap, formatJadwalSholat };
