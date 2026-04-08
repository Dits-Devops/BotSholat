const { listSewa } = require('../../database/db');
const { sisaHari } = require('../../utils/message-formatter');

module.exports = {
  name: 'listsewa',
  description: 'Lihat daftar sewa user (owner only)',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const rows = listSewa();

    if (!rows.length) {
      return sock.sendMessage(from, {
        text: '📋 Belum ada data sewa.',
      });
    }

    const lines = rows.map((row, i) => {
      const sisa = sisaHari(row.end_date);
      const sisaText = sisa > 0 ? `Sisa: ${sisa} hari` : 'Sisa: *Habis*';
      return `*${i + 1}.* ${row.jid.replace('@s.whatsapp.net', '')}\n   ${sisaText}`;
    });

    return sock.sendMessage(from, {
      text: `📋 *DATA SEWA BOT SHOLAT*\n\n${lines.join('\n\n')}`,
    });
  },
};
