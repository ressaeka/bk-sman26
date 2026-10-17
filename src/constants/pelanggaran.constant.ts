export interface JenisPelanggaranItem {
  kode: string;
  kategori: string;
  deskripsi: string;
  poin: number;
}

export interface KriteriaRemisiItem {
  id: number;
  tipe: 'PERSENTASE' | 'NOMINAL';
  nilai: number; // 10 untuk 10%, atau angka nominal poin
  keterangan: string;
}

export interface TingkatSanksiDSS {
  minPoin: number;
  maxPoin: number;
  tahap: string;
  tindakan: string[];
  pihakTerlibat: string[];
  statusKritis: boolean;
}

// 1. AMBANG BATAS SANKSI TATA TERTIB (PASAL 8)
export const TINGKAT_SANKSI_PELANGGARAN: TingkatSanksiDSS[] = [
  {
    minPoin: 25,
    maxPoin: 49,
    tahap: 'Peringatan 1 (25 Poin)',
    tindakan: [
      'Panggilan terhadap siswa yang bersangkutan',
      'Pembinaan awal oleh wali kelas',
      'Pencatatan dan pelaporan ke guru BK/konselor',
    ],
    pihakTerlibat: ['Wali Kelas', 'Siswa', 'Guru BK'],
    statusKritis: false,
  },
  {
    minPoin: 50,
    maxPoin: 74,
    tahap: 'Peringatan 2 (50 Poin)',
    tindakan: [
      'Pemanggilan orang tua/wali untuk pertama kali',
      'Pembinaan oleh guru BK/konselor dengan pendampingan wali kelas',
      'Pelaporan hasil pembinaan kepada Wakil Kepala Sekolah Bidang Kesiswaan',
    ],
    pihakTerlibat: ['Orang Tua/Wali', 'Guru BK', 'Wali Kelas', 'Wakasek Kesiswaan'],
    statusKritis: false,
  },
  {
    minPoin: 75,
    maxPoin: 99,
    tahap: 'Peringatan Terakhir (75 Poin)',
    tindakan: [
      'Pemanggilan orang tua/wali untuk kedua kali',
      'Pembinaan oleh Wakasek Kesiswaan bersama guru BK/konselor dan wali kelas',
      'Wajib membuat surat pernyataan bermaterai tidak mengulangi pelanggaran',
      'Pelaporan hasil pembinaan kepada Kepala Sekolah',
    ],
    pihakTerlibat: ['Orang Tua/Wali', 'Wakasek Kesiswaan', 'Guru BK', 'Wali Kelas', 'Kepala Sekolah'],
    statusKritis: true,
  },
  {
    minPoin: 100,
    maxPoin: 9999,
    tahap: 'Sanksi Maksimal (100 Poin)',
    tindakan: [
      'Pemanggilan orang tua/wali untuk ketiga kali',
      'Pertemuan langsung dengan Kepala Sekolah didampingi Wakasek Kesiswaan, wali kelas, dan guru BK',
      'Siswa dikembalikan kepada orang tua/wali (Dinyatakan tidak dapat dibina di sekolah)',
    ],
    pihakTerlibat: ['Kepala Sekolah', 'Wakasek Kesiswaan', 'Wali Kelas', 'Guru BK', 'Orang Tua/Wali'],
    statusKritis: true,
  },
];

// 2. DAFTAR MASTER PELANGGARAN & BOBOT POIN RESMI
export const MASTER_PELANGGARAN: JenisPelanggaranItem[] = [
  // 1. KEHADIRAN SISWA
  { kode: '1.1', kategori: 'Kehadiran Siswa', deskripsi: 'Terlambat masuk sekolah', poin: 5 },
  { kode: '1.2', kategori: 'Kehadiran Siswa', deskripsi: 'Terlambat kembali ke sekolah setelah izin keluar tanpa alasan yang dapat dipertanggungjawabkan', poin: 5 },
  { kode: '1.3', kategori: 'Kehadiran Siswa', deskripsi: 'Membolos, meninggalkan sekolah tanpa izin saat KBM berlangsung', poin: 20 },
  { kode: '1.4', kategori: 'Kehadiran Siswa', deskripsi: 'Berkeliaran/Keluar dari proses belajar mengajar berlangsung dan tidak kembali tetapi masih di lingkungan sekolah', poin: 5 },
  { kode: '1.5', kategori: 'Kehadiran Siswa', deskripsi: 'Terlambat masuk kelas setelah istirahat lebih dari 10 menit', poin: 3 },
  { kode: '1.6', kategori: 'Kehadiran Siswa', deskripsi: 'Tidak hadir ke sekolah tanpa keterangan (alpa)', poin: 10 },

  // 2. PAKAIAN
  { kode: '2.1', kategori: 'Pakaian', deskripsi: 'Tidak menggunakan baju olahraga pada saat olahraga', poin: 3 },
  { kode: '2.2', kategori: 'Pakaian', deskripsi: 'Tidak menggunakan sepatu yang sudah ditentukan sekolah', poin: 2 },
  { kode: '2.3', kategori: 'Pakaian', deskripsi: 'Salah/tidak menggunakan kaos kaki', poin: 2 },
  { kode: '2.4', kategori: 'Pakaian', deskripsi: 'Memakai kaos selain kaos singlet atau kaos olahraga SMAN 26 Kabupaten Tangerang', poin: 2 },
  { kode: '2.5', kategori: 'Pakaian', deskripsi: 'Memakai topi atau dasi yang bukan topi atau dasi SMAN 26 Kabupaten Tangerang', poin: 3 },
  { kode: '2.6', kategori: 'Pakaian', deskripsi: 'Tidak menggunakan atribut lengkap: logo SMAN 26 Kabupaten Tangerang, Badge osis, merah putih, nama dan kelas', poin: 3 },
  { kode: '2.7', kategori: 'Pakaian', deskripsi: 'Memakai seragam sekolah lain, model junkis atau berpakaian tidak rapi, celana sempit/model pensil, serta rok ketat tidak sesuai model yang ditentukan', poin: 5 },
  { kode: '2.8', kategori: 'Pakaian', deskripsi: 'Memakai jaket selain jaket almamater pada saat upacara', poin: 3 },

  // 3. UPACARA BENDERA / APEL PAGI & KEAGAMAAN
  { kode: '3.1.1', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak mengikuti upacara bendera/apel pagi', poin: 3 },
  { kode: '3.1.2', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak memakai seragam upacara lengkap', poin: 3 },
  { kode: '3.1.3', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak tertib dalam mengikuti upacara bendera/apel pagi', poin: 3 },
  { kode: '3.2.1', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak mengikuti kegiatan tadarus (siswa beragama islam)', poin: 3 },
  { kode: '3.3.1', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak mengikuti kegiatan Senam Anak Indonesia Hebat', poin: 3 },
  { kode: '3.4.1', kategori: 'Upacara / Pembiasaan', deskripsi: 'Tidak mengikuti kegiatan Jum\'at Bersih', poin: 3 },

  // 4. PERILAKU
  { kode: '4.1', kategori: 'Perilaku', deskripsi: 'Siswa putri berhias atau memakai perhiasan secara berlebihan, memakai cat kuku dan mengecat rambut atau memakai lipstik', poin: 3 },
  { kode: '4.2', kategori: 'Perilaku', deskripsi: 'Siswa putra memakai perhiasan kalung, anting-anting, gelang', poin: 3 },
  { kode: '4.3', kategori: 'Perilaku', deskripsi: 'Siswa putra berambut panjang melebihi standar di cukur tidak rapih atau dicat rambut', poin: 3 },
  { kode: '4.4', kategori: 'Perilaku', deskripsi: 'Bertato dan atau bertindik yang tidak sesuai peruntukannya', poin: 20 },
  { kode: '4.5', kategori: 'Perilaku', deskripsi: 'Melompat pagar sekolah dan merusak taman dan fasilitas sekolah', poin: 25 },
  { kode: '4.6', kategori: 'Perilaku', deskripsi: 'Mencuri uang atau barang milik orang lain, berjudi memakai uang, merampas/pemaksaan atas barang/uang orang lain', poin: 75 },
  { kode: '4.7', kategori: 'Perilaku', deskripsi: 'Tidak mengikuti kegiatan tadarus atau kegiatan pembinaan keagamaan yang lain', poin: 3 },
  { kode: '4.8', kategori: 'Perilaku', deskripsi: 'Berbicara kurang sopan (mengumpat) kepada guru, pegawai dan atau warga sekolah', poin: 10 },
  { kode: '4.9', kategori: 'Perilaku', deskripsi: 'Mengambil buah-buahan di sekolah, tanpa izin waka Sarpras dan atau waka humas', poin: 20 },

  // 5. KETERTIBAN
  { kode: '5.1', kategori: 'Ketertiban', deskripsi: 'Mengotori/mencoret-coret meja, kursi, dinding sekolah serta membuang sampah sembarangan', poin: 15 },
  { kode: '5.2', kategori: 'Ketertiban', deskripsi: 'Merusak fasilitas sekolah atau menghilangkan barang milik sekolah atau orang lain', poin: 20 },
  { kode: '5.3', kategori: 'Ketertiban', deskripsi: 'Berlaku tidak sopan kepada kepala sekolah, guru, staff TU, orangtua, masyarakat, dan sesama pelajar dalam dan luar sekolah', poin: 15 },
  { kode: '5.4', kategori: 'Ketertiban', deskripsi: 'Membuat onar yang dapat menimbulkan kerawanan sekolah', poin: 50 },
  { kode: '5.5', kategori: 'Ketertiban', deskripsi: 'Membuat keributan, kegaduhan dan keonaran dalam kelas seperti bercanda melebihi batas yang dapat mengganggu kelas lain', poin: 15 },
  { kode: '5.6', kategori: 'Ketertiban', deskripsi: 'Membawa benda-benda yang tidak sesuai dengan kebutuhan proses belajar mengajar', poin: 10 },
  { kode: '5.7', kategori: 'Ketertiban', deskripsi: 'Menerima tamu tidak seijin guru atau piket', poin: 10 },
  { kode: '5.8', kategori: 'Ketertiban', deskripsi: 'Melakukan kegiatan yang bukan pada tempatnya atau melakukan kegiatan yang mengatasnamakan sekolah tanpa sepengetahuan pihak sekolah', poin: 30 },
  { kode: '5.9', kategori: 'Ketertiban', deskripsi: 'Berjudi atau hal-hal yang bisa diindikasikan perjudian di sekolah', poin: 20 },
  { kode: '5.10', kategori: 'Ketertiban', deskripsi: 'Mengambil barang milik sekolah dan atau milik warga sekolah dengan maksud menguasainya', poin: 50 },
  { kode: '5.11', kategori: 'Ketertiban', deskripsi: 'Melakukan pemerasan atau sejenisnya yang bersifat atau diindikasikan Premanisme', poin: 50 },

  // 6. ROKOK
  { kode: '6.1', kategori: 'Rokok', deskripsi: 'Membawa rokok dan sejenisnya', poin: 25 },
  { kode: '6.2', kategori: 'Rokok', deskripsi: 'Menghisap rokok di lingkungan sekolah atau sekitar sekolah', poin: 25 },
  { kode: '6.3', kategori: 'Rokok', deskripsi: 'Membawa korek api', poin: 10 },

  // 7. BUKU, MAJALAH, FOTO, VIDEO ATAU KASET/FLASHDISK TERLARANG
  { kode: '7.1', kategori: 'Pornografi & Radikalisme', deskripsi: 'Membawa buku, majalah, foto, video, kaset/flashdisk porno/radikal', poin: 100 },
  { kode: '7.2', kategori: 'Pornografi & Radikalisme', deskripsi: 'Menjual belikan buku, majalah, foto, video, kaset/flashdisk porno/radikal', poin: 100 },
  { kode: '7.3', kategori: 'Pornografi & Radikalisme', deskripsi: 'Melakukan rekayasa gambar untuk mencemarkan nama baik seseorang', poin: 100 },
  { kode: '7.4', kategori: 'Pornografi & Radikalisme', deskripsi: 'Membuat dan atau menyebarkan Pornografi dan atau Pornoaksi di media sosial', poin: 100 },

  // 8. SENJATA
  { kode: '8.1', kategori: 'Senjata', deskripsi: 'Membawa senjata api dan atau senjata tajam di sekolah serta melanggar undang-undang darurat No 12 Tahun 1951 Pasal 2 ayat 1, diancam pidana 10 Tahun Penjara', poin: 100 },

  // 9. OBAT / MINUMAN TERLARANG
  { kode: '9.1', kategori: 'Narkotika & Miras', deskripsi: 'Membawa obat narkotika/minuman terlarang', poin: 100 },
  { kode: '9.2', kategori: 'Narkotika & Miras', deskripsi: 'Menggunakan obat narkotika/minuman terlarang di dalam atau di luar sekolah', poin: 100 },
  { kode: '9.3', kategori: 'Narkotika & Miras', deskripsi: 'Memperjualbelikan/mengedarkan obat narkotika/minuman terlarang di dalam dan di luar sekolah', poin: 100 },
  { kode: '9.4', kategori: 'Narkotika & Miras', deskripsi: 'Penyalahgunaan obat/oplosan', poin: 50 },

  // 10. PERKELAHIAN
  { kode: '10.1', kategori: 'Perkelahian', deskripsi: 'Perkelahian disebabkan oleh siswa dalam satu sekolah', poin: 50 },
  { kode: '10.2', kategori: 'Perkelahian', deskripsi: 'Perkelahian disebabkan oleh siswa sekolah lain', poin: 100 },
  { kode: '10.3', kategori: 'Perkelahian', deskripsi: 'Provokator atau penghasut yang menyebabkan perkelahian', poin: 100 },

  // 11. KEGIATAN BELAJAR MENGAJAR (KBM)
  { kode: '11.1', kategori: 'Kegiatan Belajar Mengajar', deskripsi: 'Tidak mengembalikan buku pinjaman ke perpustakaan', poin: 20 },
  { kode: '11.2', kategori: 'Kegiatan Belajar Mengajar', deskripsi: 'Memakai HP saat KBM', poin: 10 },
  { kode: '11.3', kategori: 'Kegiatan Belajar Mengajar', deskripsi: 'Tidur pada saat KBM', poin: 10 },
  { kode: '11.4', kategori: 'Kegiatan Belajar Mengajar', deskripsi: 'Mencontek pada saat ulangan', poin: 20 },

  // 12. LAIN-LAIN
  { kode: '12.1', kategori: 'Lain-lain', deskripsi: 'Penganiayaan/pemukulan terhadap teman', poin: 50 },
  { kode: '12.2', kategori: 'Lain-lain', deskripsi: 'Penganiayaan/pemukulan terhadap guru, karyawan atau masyarakat', poin: 100 },
  { kode: '12.3', kategori: 'Lain-lain', deskripsi: 'Melakukan tindakan asusila, penghinaan terhadap siswa, guru, karyawan, masyarakat dan bullying', poin: 50 },
  { kode: '12.4', kategori: 'Lain-lain', deskripsi: 'Hamil, mengahamili atau menikah', poin: 100 },
  { kode: '12.5', kategori: 'Lain-lain', deskripsi: 'Terlibat dalam kegiatan geng motor, tawuran dan atau tindakan kriminal yang dapat mengancam keselamatan diri sendiri dan atau orang lain', poin: 100 },
  { kode: '12.6', kategori: 'Lain-lain', deskripsi: 'Tidak masuk sekolah dengan jumlah secara kumulatif sebanyak 10 alpa dalam 1 tahun berjalan', poin: 100 },
  { kode: '12.7', kategori: 'Lain-lain', deskripsi: 'Tidak masuk dijumlah secara kumulatif sebanyak 96 kali karena sakit berat, depresi dengan nilai rata-rata semester yang ditunjukan minimal 75', poin: 100 },
  { kode: '12.8', kategori: 'Lain-lain', deskripsi: 'Nongkrong di luar sekolah tidak segera pulang setelah jam pelajaran selesai', poin: 10 },
  { kode: '12.9', kategori: 'Lain-lain', deskripsi: 'Tidak segera pulang berada di sekolah melebihi jam 18.00 tanpa izin dari guru atau piket', poin: 5 },
];

// 3. DAFTAR MASTER REMISI / PENGURANGAN POIN
export const MASTER_REMISI: KriteriaRemisiItem[] = [
  { id: 1, tipe: 'PERSENTASE', nilai: 10, keterangan: 'Tidak melanggar tata tertib sekolah dalam kurun waktu satu bulan (Remisi 10% dari total poin)' },
  { id: 2, tipe: 'NOMINAL', nilai: 5, keterangan: 'Melaksanakan kebersihan sekolah, sesuai arahan Wakasek dan atau Guru Piket (-5 Poin)' },
  { id: 3, tipe: 'NOMINAL', nilai: 10, keterangan: 'Mendapatkan kejuaraan lomba pelajar Tingkat Kabupaten dibuktikan dengan sertifikat (-10 Poin)' },
  { id: 4, tipe: 'NOMINAL', nilai: 15, keterangan: 'Mendapatkan kejuaraan lomba pelajar Tingkat Provinsi dibuktikan dengan sertifikat (-15 Poin)' },
  { id: 5, tipe: 'NOMINAL', nilai: 20, keterangan: 'Mendapatkan kejuaraan lomba pelajar Tingkat Nasional dibuktikan dengan sertifikat (-20 Poin)' },
  { id: 6, tipe: 'NOMINAL', nilai: 25, keterangan: 'Mendapatkan kejuaraan lomba pelajar Tingkat Internasional dibuktikan dengan sertifikat (-25 Poin)' },
];

/**
 * DSS Kedisiplinan: Mengembalikan sanksi dan instruksi tindak lanjut
 * berdasarkan akumulasi total poin siswa.
 */
export function evaluasiSanksiSiswa(totalPoin: number): TingkatSanksiDSS | null {
  if (totalPoin < 25) {
    return null;
  }

  for (const sanksi of TINGKAT_SANKSI_PELANGGARAN) {
    if (totalPoin >= sanksi.minPoin && totalPoin <= sanksi.maxPoin) {
      return sanksi;
    }
  }

  return TINGKAT_SANKSI_PELANGGARAN[TINGKAT_SANKSI_PELANGGARAN.length - 1];
}