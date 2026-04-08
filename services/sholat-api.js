const axios = require('axios');
const config = require('../config/config');
const { saveJadwal, getJadwal } = require('../database/db');
const logger = require('../utils/logger');

const BASE_URL = 'https://api.aladhan.com/v1/timingsByCity';

async function fetchAndCacheJadwal(tanggal) {
  try {
    const [year, month, day] = tanggal.split('-');
    const response = await axios.get(BASE_URL, {
      params: {
        city: config.sholat.city,
        country: config.sholat.country,
        method: config.sholat.method,
        date: `${day}-${month}-${year}`,
      },
      timeout: 10000,
    });

    const timings = response.data.data.timings;
    saveJadwal(tanggal, timings);
    logger.info(`Jadwal sholat ${tanggal} berhasil diupdate`);
    return getJadwal(tanggal);
  } catch (err) {
    logger.error({ err }, 'Gagal fetch jadwal sholat dari API');
    return null;
  }
}

async function getJadwalHariIni() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: config.sholat.timezone });
  let row = getJadwal(today);
  if (!row) {
    row = await fetchAndCacheJadwal(today);
  }
  return row;
}

async function updateJadwalHariIni() {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: config.sholat.timezone });
  return fetchAndCacheJadwal(today);
}

module.exports = { getJadwalHariIni, updateJadwalHariIni, fetchAndCacheJadwal };
