const { getMonthlyLog } = require('../../database/db');
const { formatMonthlyRecap } = require('../../utils/message-formatter');

module.exports = {
  name: 'rekapbulan',
  description: 'Tampilkan rekap sholat bulanan',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const rows = getMonthlyLog(sender, year, month);
    const recap = formatMonthlyRecap(rows);

    const monthName = now.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    return sock.sendMessage(from, {
      text: `📅 *REKAP SHOLAT BULAN ${monthName.toUpperCase()}*\n\n${recap}`,
    });
  },
};
