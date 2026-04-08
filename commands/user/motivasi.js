const MOTIVASI = [
  'Sholat adalah tiang agama. Barangsiapa mendirikannya, maka ia telah menegakkan agama. (HR. Baihaqi) 🕌',
  'Sesungguhnya sholat itu mencegah dari perbuatan keji dan munkar. (QS. Al-Ankabut: 45) ✨',
  'Orang yang paling dicintai Allah adalah yang paling bermanfaat bagi manusia. (HR. Thabrani) 🤍',
  'Jika kamu bersyukur, pasti Aku akan menambah nikmat kepadamu. (QS. Ibrahim: 7) 🌟',
  'Sesungguhnya bersama kesulitan ada kemudahan. (QS. Al-Insyirah: 6) 💪',
  'Rezeki tidak akan datang karena kamu malas, tapi Allah Maha Tahu apa yang kamu butuhkan. 🤲',
  'Jangan pernah tinggalkan sholat, karena itu adalah doa terbaikmu kepada Allah. 🙏',
  'Hati yang tenang hanya bisa ditemukan dalam dzikir kepada Allah. (QS. Ar-Ra\'d: 28) 💖',
  'Setiap kesulitan yang kamu lalui, Allah sedang mempersiapkan sesuatu yang lebih baik untukmu. 🌈',
  'Mulailah harimu dengan Bismillah, akhiri dengan Alhamdulillah, dan isi dengan amal kebaikan. ☀️',
  'Doa adalah senjata orang mukmin. Jangan pernah berhenti berdoa! 🤲',
  'Bersabarlah, sesungguhnya Allah bersama orang-orang yang sabar. (QS. Al-Baqarah: 153) 💙',
];

module.exports = {
  name: 'motivasi',
  description: 'Kirim quotes islami random',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const quote = MOTIVASI[Math.floor(Math.random() * MOTIVASI.length)];
    return sock.sendMessage(from, {
      text: `💫 *MOTIVASI ISLAMI*\n\n_"${quote}"_\n\nSemoga bermanfaat dan membawa berkah! 🤍`,
    });
  },
};
