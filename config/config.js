require('dotenv').config();

const config = {
  owner: {
    number: process.env.OWNER_NUMBER || '628xxxxxxxxxx',
    groupPengelola: process.env.GROUP_PENGELOLA || '120363423664469094@g.us',
  },
  sholat: {
    city: process.env.CITY || 'Tajurhalang',
    country: process.env.COUNTRY || 'Indonesia',
    latitude: parseFloat(process.env.LATITUDE || '-6.4167'),
    longitude: parseFloat(process.env.LONGITUDE || '106.7833'),
    method: parseInt(process.env.METHOD || '11'),
    timezone: process.env.TIMEZONE || 'Asia/Jakarta',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },
  prayers: ['Subuh', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya'],
  prayerKeys: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
};

module.exports = config;
