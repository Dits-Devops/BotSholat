const { getTodayLog } = require('../../database/db');
const { formatDailySholat } = require('../../utils/message-formatter');

module.exports = {
  name: 'listsholat',
  description: 'Tampilkan status sholat hari ini',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const row = getTodayLog(sender);

    const tanggal = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    const recap = formatDailySholat(row);

    return sock.sendMessage(from, {
      text: `📊 *REKAP SHOLAT HARI INI*\n${tanggal}\n\n${recap}`,
    });
  },
};
