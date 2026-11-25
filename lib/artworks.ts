// Artworks in the LIFE+ art auction (from "PTFoundation Pameran Seni Visual Peserta 2026").
// Only pieces not yet sold are listed. To mark one sold later, use Admin → Art auction.
// `price` is the listed price in RM and is used as the starting bid.

export interface Artwork {
  id: string; title: string; artist: string; size: string; price: number; statement: string; img: string;
}

const A = (id: string, title: string, artist: string, size: string, price: number, statement: string): Artwork =>
  ({ id, title, artist, size, price, statement, img: `/auction/${id}.jpg` });

export const ARTWORKS: Artwork[] = [
  A('a-shared-canvas', 'A Shared Canvas', 'Saffi, K-NEX BOYZ, Ridwanyusoff, Yuwen, Arif, Sky, Syazman, Fendi, Daddy Reez, Chew & Adric', '99 × 79 cm', 2700,
    'No single hand created this story. Each sketch began as an individual expression: a thought, a feeling, a memory, or a moment of imagination. Across four panels, these fragments found new relationships, creating a colourful world that none of us could have created alone. Art opens hearts. Care changes lives. Everyone deserves care, dignity and a place to belong.'),
  A('diamond', 'Diamond', 'Haz', '29.5 × 39.5 cm', 350,
    'Berlian (diamond) membawa maksud keabadian, kekuatan yang tidak tergoyahkan, kesucian dan kejayaan. Melambangkan komitmen yang abadi, setia dan tidak akan hancur oleh masa.'),
  A('mekar-di-ketenangan', 'Mekar di Ketenangan', 'K-NEX BOYZ', '29.5 × 39.5 cm', 350,
    'Keindahan sekuntum bunga teratai merah jambu di atas hamparan air biru yang damai, dengan teknik tekstur tebal (impasto). Karya ini membawa mesej tentang ketabahan, kedamaian dan keupayaan untuk melahirkan keindahan di tengah-tengah ruang yang tenang.'),
  A('aura-di-senja-ungu', 'Aura di Senja Ungu', 'Fendi', '29.5 × 39.5 cm', 350,
    'Diilhamkan dari pengalaman sendiri, membawa maksud "walau kamu sudah tiada, aura mu masih terasa": kebaikan yang telah meninggalkan kesan kepada mereka yang telah dibantu.'),
  A('gejolak-jiwa', 'Gejolak Jiwa', 'Zarulreez', '29.5 × 39.5 cm', 300,
    'Gabungan warna kontras tinggi antara warna hangat dan sejuk, melambangkan keghairahan hidup serta gejolak jiwa yang harmoni.'),
  A('tarantula', 'Tarantula', 'Wan', '29.5 × 39.5 cm', 300,
    'Created to express my fascination with the mysterious and unique beauty of spiders, and to encourage others to appreciate creatures that are often feared or misunderstood.'),
  A('dont-tell-my-mother', "Don't Tell My Mother", 'Arif', '29.5 × 39.5 cm', 300,
    'A playful expression of individuality, freedom and the secrets we keep while discovering ourselves: the desire to explore, experiment and live authentically.'),
  A('mekar', 'Mekar', 'Mr. W', '29.5 × 39.5 cm', 350,
    'Sekuntum bunga yang tetap mekar di tengah suasana yang suram, melambangkan kekuatan untuk bertahan walaupun berhadapan kesukaran dan ketidakpastian hidup.'),
  A('seed', 'Seed', 'Tom', '39.5 × 29.5 cm', 350,
    'Melambangkan permulaan kehidupan dan kekuatan untuk terus tumbuh. Walaupun bermula daripada sesuatu yang kecil, setiap kehidupan mempunyai potensi untuk berkembang menjadi sesuatu yang indah.'),
  A('ancaman', 'Ancaman', 'Haz', '29.5 × 39.5 cm', 350,
    'Secara kiasan menggambarkan kehidupan yang suci yang sedang diancam oleh anasir luar yang halus tetapi berbahaya.'),
  A('infinity-flows', 'Infinity Flows', 'Saffi', '39.5 × 29.5 cm', 350,
    'Explores the fire inside that flows like a current, a reflection on the interconnectedness of life’s moments.'),
  A('pahlawan', 'Pahlawan', 'Syazman', '29.5 × 39.5 cm', 300,
    'The river symbolises life’s winding challenges and the hill the obstacles we overcome. The light of the full moon is family, friends and loved ones who give us hope and strength to keep going.'),
  A('akar', 'Akar', 'Mr. Y', '29.5 × 39.5 cm', 450,
    'Pohon ini melambangkan perjalanan hidup manusia. "Kita mungkin terluka dan kehilangan sesuatu, tetapi selagi berakar, kita masih mampu tumbuh."'),
  A('orbit-kehidupan', 'Orbit Kehidupan', 'Mr. X', '29.5 × 39.5 cm', 450,
    'Kehidupan sebagai satu alam semesta. Kita mungkin berada dalam dunia yang sama, tetapi setiap daripada kita mempunyai orbit kehidupan yang berbeza.'),
  A('fractured-ping', 'Fractured Ping', 'Sa-Mo-Ne', '29.5 × 39.5 cm', 450,
    'Explores the web and the connection between reality and fantasy. The intricate geometric pattern represents the complex structure of our emotional being.'),
  A('jantung', 'Jantung', 'Mona & Sky', '29.5 × 39.5 cm', 450,
    'Jantung sebagai simbol kehidupan, emosi dan kekuatan. Api kuning di dalamnya melambangkan semangat yang terus menyala walaupun dibebani luka.'),
  A('keindahan-dalam-kerapuhan', 'Keindahan dalam Kerapuhan', 'UV', '29.5 × 39.5 cm', 300,
    'Seekor angsa berenang dalam kegelapan, melambangkan perjalanan mencari ketenangan. Cahaya keemasan di tubuhnya menggambarkan harapan yang masih tersimpan.'),
  A('thin-black-line', 'A Thin Black Line of Sanity', 'Arif', '29.5 × 39.5 cm', 300,
    'The shifting emotions within me, where darkness and light, anger and hope coexist, and my ongoing journey towards understanding and accepting myself.'),
  A('verdant-reflection', 'Verdant Reflection', 'Saffi', '39.5 × 29.5 cm', 350,
    'A mixed-media piece exploring resilience and our intricate emotional being, seeking peace and spiritual awakening.'),
  A('di-dalam-jiwa', 'Di Dalam Jiwa', "K-NEX BOYZ & Ridwanyusoff", '29.5 × 39.5 cm', 550,
    'Kelopak kantan yang berlapis mencerminkan kelembutan jiwa, kedalaman emosi dan keberanian merangkul kerentanan diri, serta kekuatan untuk terus mekar dengan keindahan tersendiri.'),
  A('pusaran-resah', 'Pusaran Resah', 'Zarulreez', '29.5 × 39.5 cm', 300,
    'Cerminan perasaan gelisah dalam putaran emosi, namun percikan cahaya membawa sinar harapan dan keinginan kuat untuk bebas dari kegelapan.'),
  A('titik-titik-kekuatan', 'Titik-Titik Kekuatan', 'Haz & Chew', '29.5 × 39.5 cm', 350,
    'Corak titik-titik menyerupai seni batik. Setiap titik hitam bukan kegelapan, tetapi cabaran yang membentuk siapa kita: seperti bintang di langit malam, cabaran menjadikan kita lebih bersinar.'),
  A('space', 'Space', 'Adric', '29.5 × 39.5 cm', 450,
    '"Di sebalik kekacauan yang tidak terlihat, ada jiwa yang sedang berjuang untuk mencari ketenangan."'),
  A('goldfish', 'Goldfish', 'Wan', '29.5 × 39.5 cm', 300,
    'An appreciation of the beauty and peacefulness of aquatic life: fish swimming freely, in vibrant orange against a deep blue.'),
  A('infinity-peace', 'Infinity Peace', 'Saffi', '29.5 × 39.5 cm', 450,
    'Explores the cyclical nature of giving and receiving, inviting the viewer to get lost in the flow.'),
  A('damai', 'Damai di Sebalik Kegelapan', 'Diana', '29.5 × 39.5 cm', 350,
    'Burung merpati membawa ranting zaitun: simbol keinginan manusia untuk mencari perdamaian walaupun dunia dipenuhi konflik.'),
  A('reminder-to-flow', 'A Reminder to Flow with Life', 'Syazman', '29.5 × 39.5 cm', 350, 'Find beauty in every moment.'),
  A('dari-selirat', 'Dari Selirat ke Mekar Bercahaya', 'Wan', '29.5 × 39.5 cm', 350,
    'Akar kantan berselirat menyimpan kisah perjuangan, memekarkan manfaat dan harapan bersama.'),
  A('tribute-to-origins', 'A Tribute to Our Origins', 'Syazman', '29.5 × 39.5 cm', 350,
    'A symbol of heritage and identity, where tradition meets spirituality.'),
];

export const MIN_STEP = 10; // each new bid must beat the current highest by at least RM 10
export const artworkById = (id: string) => ARTWORKS.find((a) => a.id === id);
