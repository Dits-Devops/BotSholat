const { getSewa } = require('../../database/db');
const { sisaHari } = require('../../utils/message-formatter');

module.exports = {
  name: 'ceksewa',
  description: 'Cek sisa hari sewa',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;

    const row = getSewa(sender);
    if (!row) {
      return sock.sendMessage(from, {
        text:
          '❌ Kamu belum terdaftar sebagai pengguna bot ini.\n\n' +
          'Silakan hubungi admin untuk mendaftar. 🙏',
      });
    }

    const sisa = sisaHari(row.end_date);
    if (sisa <= 0) {
      return sock.sendMessage(from, {
        text:
          '⚠️ *Masa sewa kamu telah habis.*\n\n' +
          'Silakan hubungi admin untuk memperpanjang. 🙏',
      });
    }

    const endStr = new Date(row.end_date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    return sock.sendMessage(from, {
      text:
        `🗓️ *INFO SEWA KAMU*\n\n` +
        `📅 Berakhir: ${endStr}\n` +
        `⏳ Sisa: *${sisa} hari* lagi\n\n` +
        `Semangat ibadahnya ya! 🤍`,
    });
  },
};
