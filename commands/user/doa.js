const DOAS = [
  {
    judul: 'Doa Pagi Hari',
    arab: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    latin: 'Allahumma bika ashbahnaa wa bika amsaynaa wa bika nahyaa wa bika namuutu wa ilaykan nusyuur.',
    arti: 'Ya Allah, dengan-Mu kami memasuki pagi, dengan-Mu kami memasuki sore, dengan-Mu kami hidup dan mati, dan kepada-Mu lah kami kembali.',
  },
  {
    judul: 'Doa Sebelum Tidur',
    arab: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    latin: 'Bismikallaahumma amuutu wa ahyaa.',
    arti: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.',
  },
  {
    judul: 'Doa Setelah Sholat',
    arab: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    latin: 'Allaahumma antas salaam wa minkas salaam tabaarakta yaa dzal jalaali wal ikraam.',
    arti: 'Ya Allah, Engkau adalah As-Salaam dan dari-Mu keselamatan. Maha Suci Engkau wahai Dzat yang memiliki keagungan dan kemuliaan.',
  },
  {
    judul: 'Doa Memohon Kemudahan',
    arab: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
    latin: 'Allaahumma laa sahla illaa maa ja\'altahu sahlaa, wa anta taj\'alul hazna idzaa syi\'ta sahlaa.',
    arti: 'Ya Allah, tidak ada kemudahan kecuali yang Engkau jadikan mudah. Dan Engkau menjadikan kesedihan itu mudah jika Engkau kehendaki.',
  },
  {
    judul: 'Doa Perlindungan',
    arab: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    latin: 'Bismillahilladzi laa yadurru ma\'asmihi syai\'un fil ardhi wa laa fis samaa\'i wa huwas samii\'ul \'aliim.',
    arti: 'Dengan nama Allah yang tidak akan membahayakan sesuatu pun di bumi dan langit jika disebut nama-Nya. Dia Maha Mendengar lagi Maha Mengetahui.',
  },
];

module.exports = {
  name: 'doa',
  description: 'Kirim doa harian random',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const doa = DOAS[Math.floor(Math.random() * DOAS.length)];
    return sock.sendMessage(from, {
      text:
        `🤲 *${doa.judul}*\n\n` +
        `${doa.arab}\n\n` +
        `_${doa.latin}_\n\n` +
        `📖 Artinya:\n"${doa.arti}"\n\n` +
        `Semoga Allah mengabulkan doa kita semua. Aamiin 🤍`,
    });
  },
};
