const config = require('../config/config');

function isOwner(jid) {
  const cleaned = jid.replace('@s.whatsapp.net', '').replace('@c.us', '');
  const ownerCleaned = config.owner.number.replace('@s.whatsapp.net', '').replace('@c.us', '');
  return cleaned === ownerCleaned;
}

function isPrivateChat(jid) {
  return jid.endsWith('@s.whatsapp.net');
}

function normalizeJid(input) {
  if (!input) return null;
  // Accept format: 628xxx, 628xxx@c.us, 628xxx@s.whatsapp.net
  const num = input.replace('@c.us', '').replace('@s.whatsapp.net', '').replace(/\D/g, '');
  if (!num) return null;
  return `${num}@s.whatsapp.net`;
}

module.exports = { isOwner, isPrivateChat, normalizeJid };
