const { getTodayLog } = require('../../database/db');
const { formatDailySholat } = require('../../utils/message-formatter');

module.exports = {
  name: 'status',
  description: 'Cek status sholat hari ini (ringkas)',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const row = getTodayLog(sender);
    const recap = formatDailySholat(row);

    return sock.sendMessage(from, {
      text: `📌 *STATUS SHOLAT HARI INI*\n\n${recap}`,
    });
  },
};
