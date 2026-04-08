require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const path = require('path');
const logger = require('./utils/logger');
const { handleMessage } = require('./commands/handlers');
const { startScheduler } = require('./services/scheduler');
const { getDb } = require('./database/db');

const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

async function connectToWhatsApp() {
  // Initialize DB on start
  getDb();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`Baileys version: ${version.join('.')} (latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: require('pino')({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, require('pino')({ level: 'silent' })),
    },
    printQRInTerminal: false,
    markOnlineOnConnect: true,
  });

  // QR Code
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info('Scan QR code berikut untuk menghubungkan bot:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn(`Koneksi terputus (kode: ${code}), reconnect: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 5000);
      } else {
        logger.error('Sesi logout. Hapus folder auth_info_baileys dan scan ulang QR.');
        process.exit(1);
      }
    }

    if (connection === 'open') {
      logger.info('✅ Bot berhasil terhubung ke WhatsApp!');
      await startScheduler(sock);
    }
  });

  // Simpan credential saat update
  sock.ev.on('creds.update', saveCreds);

  // Handle pesan masuk
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (!msg.message) continue;
      await handleMessage(sock, msg);
    }
  });

  return sock;
}

connectToWhatsApp().catch((err) => {
  logger.error({ err }, 'Fatal error saat memulai bot');
  process.exit(1);
});
