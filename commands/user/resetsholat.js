const { resetSholatLog } = require('../../database/db');

module.exports = {
  name: 'resetsholat',
  description: 'Reset data sholat hari ini',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    resetSholatLog(sender);
    return sock.sendMessage(from, {
      text:
        '🔄 *Data sholat hari ini berhasil direset.*\n\n' +
        'Semangat sholat ya, masih ada waktu! 🌟',
    });
  },
};
