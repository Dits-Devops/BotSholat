const { addSewa } = require('../../database/db');
const { normalizeJid } = require('../../utils/validator');

module.exports = {
  name: 'addsewa',
  description: 'Tambah sewa user (owner only)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    if (!args[0] || !args[1]) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\n\nContoh: *addsewa 628xxxxxx@c.us 5*',
      });
    }

    const jid = normalizeJid(args[0]);
    if (!jid) {
      return sock.sendMessage(from, { text: '❌ Nomor tidak valid!' });
    }

    const days = parseInt(args[1]);
    if (isNaN(days) || days <= 0) {
      return sock.sendMessage(from, { text: '❌ Jumlah hari tidak valid!' });
    }

    addSewa(jid, days);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    const endStr = endDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    });

    return sock.sendMessage(from, {
      text:
        `✅ *Sewa berhasil ditambahkan!*\n\n` +
        `👤 User: ${jid}\n` +
        `📅 Durasi: ${days} hari\n` +
        `📆 Berakhir: ${endStr}`,
    });
  },
};
