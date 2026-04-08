const { deleteSewa, listSewa } = require('../../database/db');

module.exports = {
  name: 'delsewa',
  description: 'Hapus sewa user berdasarkan nomor urut (owner only)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!args[0]) {
      return sock.sendMessage(from, {
        text: '❌ Format salah!\n\nContoh: *delsewa 1*',
      });
    }

    const id = parseInt(args[0]);
    if (isNaN(id) || id <= 0) {
      return sock.sendMessage(from, { text: '❌ Nomor tidak valid!' });
    }

    // Dapatkan list dulu untuk cari ID berdasarkan urutan tampilan
    const rows = listSewa();
    if (id > rows.length) {
      return sock.sendMessage(from, {
        text: `❌ Tidak ada sewa dengan nomor *${id}*.\nGunakan *listsewa* untuk melihat daftar.`,
      });
    }

    const target = rows[id - 1];
    const result = deleteSewa(target.id);

    if (result.changes === 0) {
      return sock.sendMessage(from, { text: '❌ Gagal menghapus sewa.' });
    }

    return sock.sendMessage(from, {
      text: `✅ Sewa nomor *${id}* (${target.jid}) berhasil dihapus.`,
    });
  },
};
