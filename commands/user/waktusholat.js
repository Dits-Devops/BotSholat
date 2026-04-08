const { getJadwalHariIni } = require('../../services/sholat-api');
const { formatJadwalSholat } = require('../../utils/message-formatter');
const config = require('../../config/config');

module.exports = {
  name: 'waktusholat',
  description: 'Tampilkan jadwal sholat hari ini',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const row = await getJadwalHariIni();
    const text = formatJadwalSholat(row, config.sholat.city);
    return sock.sendMessage(from, { text });
  },
};
