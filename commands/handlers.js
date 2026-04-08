const { isOwner, isPrivateChat } = require('../utils/validator');
const { getSewa } = require('../database/db');
const { upsertSholatLog } = require('../database/db');
const { getPending, clearPending } = require('../services/notification');
const logger = require('../utils/logger');

// Owner commands
const addsewa = require('./owner/addsewa');
const delsewa = require('./owner/delsewa');
const listsewa = require('./owner/listsewa');

// User commands
const listsholat = require('./user/listsholat');
const rekapbulan = require('./user/rekapbulan');
const waktusholat = require('./user/waktusholat');
const status = require('./user/status');
const resetsholat = require('./user/resetsholat');
const motivasi = require('./user/motivasi');
const doa = require('./user/doa');
const ceksewa = require('./user/ceksewa');

const OWNER_COMMANDS = { addsewa, delsewa, listsewa };
const USER_COMMANDS = { listsholat, rekapbulan, waktusholat, status, resetsholat, motivasi, doa, ceksewa };

async function handleMessage(sock, msg) {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      '';

    if (!body) return;

    const lowerBody = body.trim().toLowerCase();
    const [cmd, ...args] = body.trim().split(/\s+/);
    const cmdLower = cmd.toLowerCase();

    // ─── Cek jawaban sholat (sudah/belum) ────────────────────────────────────
    const pending = getPending(sender);
    if (pending && isPrivateChat(from)) {
      const isSudah = /^sudah\s+\w+/.test(lowerBody);
      const isBelum = /^belum/.test(lowerBody);

      if (isSudah) {
        upsertSholatLog(sender, pending.tanggal, pending.prayer, 'sudah');
        clearPending(sender);
        return sock.sendMessage(from, {
          text:
            'MasyaAllah 🤍\n\n' +
            'Semoga Allah menerima sholatmu dan melapangkan rezekimu hari ini.\n' +
            'Tetap istiqomah ya!',
        });
      }

      if (isBelum) {
        upsertSholatLog(sender, pending.tanggal, pending.prayer, 'belum');
        clearPending(sender);
        return sock.sendMessage(from, {
          text:
            'Yuk segera sholat 🙏\n\n' +
            'Sholat itu penenang hati.\n' +
            'Allah sedang menunggumu menghadap-Nya 🤍',
        });
      }
    }

    // ─── Owner Commands ───────────────────────────────────────────────────────
    if (OWNER_COMMANDS[cmdLower]) {
      if (!isOwner(sender)) {
        return sock.sendMessage(from, {
          text: '❌ Perintah ini hanya untuk owner bot.',
        });
      }
      return OWNER_COMMANDS[cmdLower].execute(sock, msg, args);
    }

    // ─── User Commands ────────────────────────────────────────────────────────
    if (USER_COMMANDS[cmdLower]) {
      // Cek apakah user punya sewa aktif (kecuali waktusholat, motivasi, doa)
      const publicCmds = ['waktusholat', 'motivasi', 'doa'];
      if (!publicCmds.includes(cmdLower) && !isOwner(sender)) {
        const sewa = getSewa(sender);
        if (!sewa) {
          return sock.sendMessage(from, {
            text:
              '❌ Kamu belum terdaftar sebagai pengguna bot ini.\n\n' +
              'Hubungi admin untuk mendaftar. 🙏',
          });
        }
        const today = new Date().toISOString().split('T')[0];
        if (sewa.end_date < today) {
          return sock.sendMessage(from, {
            text:
              '⚠️ *Masa sewa kamu telah habis.*\n\n' +
              'Hubungi admin untuk memperpanjang. 🙏',
          });
        }
      }
      return USER_COMMANDS[cmdLower].execute(sock, msg, args);
    }
  } catch (err) {
    logger.error({ err }, 'Error handleMessage');
  }
}

module.exports = { handleMessage };
