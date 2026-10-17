// src/constants/gaya-belajar.constant.ts

export interface SoalGayaBelajar {
  id: number;
  pertanyaan: string;
  opsi: {
    A: string; // Visual
    B: string; // Auditori
    C: string; // Kinestetik
  };
}

export type GayaBelajarMode = "VISUAL" | "AUDITORI" | "KINESTETIK";

export const GAYA_BELAJAR_DETAILS: Record<GayaBelajarMode, {
  karakteristik: string;
  strategiBelajar: string[];
}> = {
  VISUAL: {
    karakteristik: "Siswa lebih mudah menyerap materi melalui gambar, diagram, grafik, video, dan ringkasan berwarna.",
    strategiBelajar: [
      "Gunakan mind mapping dan diagram alur",
      "Gunakan spidol/stabilo aneka warna untuk kata kunci",
      "Tulis ulang materi menjadi poin-poin visual",
    ],
  },
  AUDITORI: {
    karakteristik: "Siswa lebih cepat memahami materi lewat mendengarkan penjelasan lisan, diskusi, dan rekaman suara.",
    strategiBelajar: [
      "Dengarkan penjelasan guru secara seksama atau putar rekaman materi",
      "Belajar bersama dalam kelompok diskusi",
      "Ulangi materi pelajaran dengan bersuara keras mandiri",
    ],
  },
  KINESTETIK: {
    karakteristik: "Siswa belajar paling efektif melalui praktik langsung, eksperimen, peragaan, dan aktivitas fisik.",
    strategiBelajar: [
      "Praktikkan langsung konsep yang dipelajari (lab/simulasi)",
      "Belajar dengan jeda gerak ringan atau sambil berjalan",
      "Gunakan alat peraga fisik atau kartu flashcards",
    ],
  },
};

export const BANK_SOAL_VAK: SoalGayaBelajar[] = [
  {
    id: 1,
    pertanyaan: "Ketika saya mengoperasikan peralatan baru, pada umumnya saya:",
    opsi: {
      A: "membaca instruksinya lebih dulu.",
      B: "mendengarkan penjelasan dari seseorang yang pernah menggunakan peralatan tersebut.",
      C: "menggunakan peralatan tersebut, saya akan mampu mengetahuinya selagi menggunakannya.",
    },
  },
  {
    id: 2,
    pertanyaan: "Ketika saya perlu petunjuk untuk bepergian, saya biasanya:",
    opsi: {
      A: "melihat peta.",
      B: "bertanya denah/arah ke orang lain.",
      C: "mengikuti naluri dan mungkin menggunakan kompas.",
    },
  },
  {
    id: 3,
    pertanyaan: "Ketika saya memasak masakan baru, saya biasanya melakukan:",
    opsi: {
      A: "mengikuti petunjuk resep tertulis.",
      B: "menelepon seorang teman untuk mendapatkan penjelasan.",
      C: "mengikuti naluri, mencoba seperti biasanya saya memasak.",
    },
  },
  {
    id: 4,
    pertanyaan: "Jika saya mengajar seseorang tentang sesuatu yang baru, saya cenderung untuk:",
    opsi: {
      A: "menulis instruksi bagi mereka.",
      B: "memberi penjelasan secara lisan kepada mereka.",
      C: "mendemonstrasikan terlebih dahulu dan kemudian membiarkan mereka berlanjut.",
    },
  },
  {
    id: 5,
    pertanyaan: "Saya cenderung mengatakan:",
    opsi: {
      A: "lihat bagaimana saya melakukannya.",
      B: "dengarkan saya menjelaskan.",
      C: "lakukanlah sendiri.",
    },
  },
  {
    id: 6,
    pertanyaan: "Selama waktu senggang, saya paling menikmati saat:",
    opsi: {
      A: "pergi ke museum dan galeri.",
      B: "mendengarkan musik dan bincang-bincang dengan teman-teman saya.",
      C: "bermain olahraga atau melakukan hal yang bisa saya lakukan.",
    },
  },
  {
    id: 7,
    pertanyaan: "Ketika saya pergi berbelanja pakaian, saya cenderung untuk:",
    opsi: {
      A: "membayangkan apakah pakaian tersebut sesuai bagi saya.",
      B: "mendiskusikannya dengan karyawan toko.",
      C: "mencoba pakaian dan melihat kesesuaiannya.",
    },
  },
  {
    id: 8,
    pertanyaan: "Bila saya memilih liburan, saya biasanya:",
    opsi: {
      A: "membaca banyak brosur.",
      B: "meminta rekomendasi dari teman-teman.",
      C: "membayangkan akan seperti apa jika berada di sana.",
    },
  },
  {
    id: 9,
    pertanyaan: "Jika saya membeli mobil baru, saya akan:",
    opsi: {
      A: "membaca ulasan di koran dan majalah.",
      B: "membahas apa yang saya butuhkan dengan teman-teman.",
      C: "melakukan test-drive banyak jenis.",
    },
  },
  {
    id: 10,
    pertanyaan: "Ketika saya sedang belajar keterampilan baru, saya paling nyaman:",
    opsi: {
      A: "melihat apa yang pengajar lakukan.",
      B: "menanyakan ke pengajar tentang apa yang seharusnya saya lakukan.",
      C: "mencobanya dan menemukan sendiri ketika saya mempelajarinya.",
    },
  },
  {
    id: 11,
    pertanyaan: "Jika saya memilih makanan pada daftar menu, saya cenderung untuk:",
    opsi: {
      A: "membayangkan makanan akan seperti apa.",
      B: "memikirkannya sendiri atau membicarakannya dengan pasangan saya.",
      C: "membayangkan makanan akan terasa seperti apa.",
    },
  },
  {
    id: 12,
    pertanyaan: "Ketika saya mendengarkan pertunjukan sebuah band, saya tidak bisa:",
    opsi: {
      A: "melihat anggota band dan orang lain di antara para penonton.",
      B: "mendengarkan lirik dan nada.",
      C: "terbawa dalam suasana dan musik.",
    },
  },
  {
    id: 13,
    pertanyaan: "Ketika saya berkonsentrasi, saya paling sering:",
    opsi: {
      A: "fokus pada kata-kata atau gambar-gambar di depan saya.",
      B: "membahas masalah dan memikirkan solusi yang mungkin dapat dilakukan.",
      C: "banyak melihat hal di sekitar, mencatat yang diperlukan.",
    },
  },
  {
    id: 14,
    pertanyaan: "Saya memilih peralatan rumah tangga karena saya suka:",
    opsi: {
      A: "warnanya dan bagaimana penampilannya.",
      B: "paparan dari pramuniaga.",
      C: "tekstur peralatan tersebut dan bagaimana rasanya menyentuhnya.",
    },
  },
  {
    id: 15,
    pertanyaan: "Memori pertama saya terbentuk ketika ...",
    opsi: {
      A: "melihat sesuatu.",
      B: "sedang membicarakannya.",
      C: "melakukan sesuatu.",
    },
  },
  {
    id: 16,
    pertanyaan: "Ketika saya cemas, saya:",
    opsi: {
      A: "membayangkan skenario terburuk.",
      B: "memikirkan apa yang paling mengkhawatirkan saya.",
      C: "tidak dapat duduk tenang, mondar-mandir.",
    },
  },
  {
    id: 17,
    pertanyaan: "Saya dapat mengingat orang lain, karena:",
    opsi: {
      A: "penampilan mereka.",
      B: "apa yang mereka katakan kepada saya.",
      C: "bagaimana mereka membuat saya mampu mengingatkan saya tentang mereka.",
    },
  },
  {
    id: 18,
    pertanyaan: "Ketika saya harus merevisi untuk ujian, saya biasanya:",
    opsi: {
      A: "menulis banyak catatan revisi dan diagram.",
      B: "menekuni catatan saya sendiri, atau membahasnya dengan orang lain.",
      C: "membayangkan membuat kemajuan belajar atau menciptakan rumus/cara yang tepat.",
    },
  },
  {
    id: 19,
    pertanyaan: "Jika saya menjelaskan kepada seseorang, saya cenderung:",
    opsi: {
      A: "menunjukkan kepada mereka apa yang saya maksud.",
      B: "menjelaskan kepada mereka dengan cara yang memungkinkan sampai mereka paham.",
      C: "memotivasi mereka untuk mencoba dan menyampaikan ide saya selagi mereka melakukan kegiatan.",
    },
  },
  {
    id: 20,
    pertanyaan: "Saya benar-benar suka:",
    opsi: {
      A: "menonton film, fotografi, melihat seni atau mengamati orang-orang sekitar.",
      B: "mendengarkan musik, radio atau bincang-bincang dengan teman-teman.",
      C: "berperan serta dalam kegiatan olahraga, atau menikmati makanan yang disajikan.",
    },
  },
  {
    id: 21,
    pertanyaan: "Sebagian besar waktu luang, saya habiskan:",
    opsi: {
      A: "menonton televisi.",
      B: "berbincang-bincang dengan teman-teman.",
      C: "melakukan aktivitas fisik atau membuat sesuatu.",
    },
  },
  {
    id: 22,
    pertanyaan: "Ketika pertama kali saya bertemu seseorang yang baru, saya biasanya:",
    opsi: {
      A: "mengatur pertemuan bersama.",
      B: "berbicara dengan mereka melalui telepon.",
      C: "mencoba melakukan sesuatu bersama-sama, misalnya suatu kegiatan atau makan bersama.",
    },
  },
  {
    id: 23,
    pertanyaan: "Saya memperhatikan orang melalui:",
    opsi: {
      A: "tampilannya dan pakaiannya.",
      B: "suara dan cara berbicaranya.",
      C: "caranya berdiri dan bergerak.",
    },
  },
  {
    id: 24,
    pertanyaan: "Jika saya marah, saya cenderung untuk:",
    opsi: {
      A: "terus mengingat dan mencari tahu hal yang membuat saya marah.",
      B: "menyampaikan ke orang-orang sekitar tentang perasaan saya.",
      C: "membanting pintu atau menunjukkan kemarahan saya dengan cara lainnya.",
    },
  },
  {
    id: 25,
    pertanyaan: "Saya merasa lebih mudah untuk mengingat:",
    opsi: {
      A: "wajah.",
      B: "nama.",
      C: "hal-hal yang telah saya lakukan.",
    },
  },
  {
    id: 26,
    pertanyaan: "Saya pikir bahwa saya dapat mengetahui apakah seseorang berbohong jika:",
    opsi: {
      A: "mereka menghindari melihat Anda.",
      B: "perubahan suara mereka.",
      C: "mereka menunjukkan hal aneh.",
    },
  },
  {
    id: 27,
    pertanyaan: "Ketika saya bertemu dengan seorang teman lama:",
    opsi: {
      A: "Saya berkata \"Senang bertemu denganmu!\"",
      B: "Saya berkata \"Senang mendengar kabar tentangmu!\"",
      C: "Saya memberi mereka pelukan atau jabat tangan.",
    },
  },
  {
    id: 28,
    pertanyaan: "Saya mengingat hal-hal yang terbaik dengan cara:",
    opsi: {
      A: "menulis catatan atau menyimpan rincian materi print-out.",
      B: "mengatakan dengan suara keras atau mengulang-ulang kata-kata penting dan menghafal kata-kata kunci.",
      C: "melakukan dan mempraktikkan kegiatan atau membayangkan bagaimana suatu hal dilakukan.",
    },
  },
  {
    id: 29,
    pertanyaan: "Jika saya mengeluh tentang barang rusak yang sudah dibeli, saya paling nyaman:",
    opsi: {
      A: "menulis surat.",
      B: "mengontak melalui telepon.",
      C: "mengembalikan ke toko atau menyampaikannya ke kepala kantor.",
    },
  },
  {
    id: 30,
    pertanyaan: "Saya cenderung mengatakan:",
    opsi: {
      A: "Saya paham apa yang Anda maksud.",
      B: "Saya mendengar apa yang Anda katakan.",
      C: "Saya tahu bagaimana Anda merasakannya.",
    },
  },
];