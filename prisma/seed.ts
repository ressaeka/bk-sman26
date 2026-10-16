import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';

async function main() {
  console.log('🌱 Memulai proses seeding database BK-26...');

  // ==========================================
  // 1. SEED ROLES (SISWA & BK)
  // ==========================================
  console.log('📌 Menyinkronkan data roles...');
  const roleSiswa = await prisma.role.upsert({
    where: { nama_role: 'SISWA' },
    update: {},
    create: { nama_role: 'SISWA' },
  });

  const roleBK = await prisma.role.upsert({
    where: { nama_role: 'BK' },
    update: {},
    create: { nama_role: 'BK' },
  });

  console.log(`✅ Roles siap: SISWA (ID: ${roleSiswa.id}), BK (ID: ${roleBK.id})`);

  // ==========================================
  // 2. SEED 2 AKUN GURU BK (COUNSELOR)
  // ==========================================
  console.log('📌 Menyinkronkan akun 2 Guru BK...');
  const counselorsData = [
    {
      nip: '197508152000031001',
      nama_counselor: 'Dra. Hj. Siti Nurjanah, M.Pd.',
    },
    {
      nip: '198811202011012003',
      nama_counselor: 'Ahmad Fauzi, S.Pd., Kons.',
    },
  ];

  for (const item of counselorsData) {
    const counselor = await prisma.counselor.upsert({
      where: { nip: item.nip },
      update: { nama_counselor: item.nama_counselor },
      create: {
        nip: item.nip,
        nama_counselor: item.nama_counselor,
      },
    });

    const defaultPassword = `${item.nip}#sman26`;
    const passwordHash = await argon2.hash(defaultPassword);

    await prisma.user.upsert({
      where: { username: item.nip },
      update: {
        roleId: roleBK.id,
        counselorId: counselor.id,
        isActive: true,
      },
      create: {
        username: item.nip,
        passwordHash,
        roleId: roleBK.id,
        counselorId: counselor.id,
        isActive: true,
        mustChangePassword: true,
      },
    });

    console.log(`   👤 Guru BK: ${item.nama_counselor} (NIP / Username: ${item.nip})`);
  }

  // ==========================================
  // 3. SEED DATA SISWA SAMPEL & USER AKUN
  // ==========================================
  console.log('📌 Menyinkronkan data siswa sampel...');
  const sampleStudents = [
    {
      nisn: '0081234561',
      nipd: '242510001',
      nama_siswa: 'Muhammad Rizky Pratama',
      jenis_kelamin: 'L',
      rombel: 'X-1',
      tanggal_lahir: new Date('2009-04-12'),
      agama: 'Islam',
      alamat: 'Jl. Raya Cisauk No. 12, Tangerang',
      totalPoin: 0,
    },
    {
      nisn: '0081234562',
      nipd: '242510002',
      nama_siswa: 'Anindya Putri Maharani',
      jenis_kelamin: 'P',
      rombel: 'X-2',
      tanggal_lahir: new Date('2009-08-25'),
      agama: 'Islam',
      alamat: 'Perum Serpong Garden Blok B3/15, Tangerang',
      totalPoin: 0,
    },
    {
      nisn: '0071234563',
      nipd: '232411003',
      nama_siswa: 'Budi Santoso',
      jenis_kelamin: 'L',
      rombel: 'XI MIPA 1',
      tanggal_lahir: new Date('2008-01-19'),
      agama: 'Islam',
      alamat: 'Kp. Melayu Timur No. 45, Tangerang',
      totalPoin: 15,
    },
    {
      nisn: '0071234564',
      nipd: '232411004',
      nama_siswa: 'Clarissa Aurelia',
      jenis_kelamin: 'P',
      rombel: 'XI IPS 2',
      tanggal_lahir: new Date('2008-11-05'),
      agama: 'Kristen',
      alamat: 'Jl. Flamboyan Indah No. 8, Tangerang',
      totalPoin: 0,
    },
    {
      nisn: '0061234565',
      nipd: '222312005',
      nama_siswa: 'Dimas Wahyu Nugroho',
      jenis_kelamin: 'L',
      rombel: 'XII MIPA 2',
      tanggal_lahir: new Date('2007-06-30'),
      agama: 'Islam',
      alamat: 'Jl. Merak Putih No. 21, Pasar Kemis, Tangerang',
      totalPoin: 55, // Ambang batas SP_1 untuk pengujian evaluasi DSS
    },
  ];

  for (const item of sampleStudents) {
    const student = await prisma.siswa.upsert({
      where: { nisn: item.nisn },
      update: {
        nipd: item.nipd,
        nama_siswa: item.nama_siswa,
        jenis_kelamin: item.jenis_kelamin,
        rombel: item.rombel,
        tanggal_lahir: item.tanggal_lahir,
        agama: item.agama,
        alamat: item.alamat,
        totalPoin: item.totalPoin,
      },
      create: {
        nisn: item.nisn,
        nipd: item.nipd,
        nama_siswa: item.nama_siswa,
        jenis_kelamin: item.jenis_kelamin,
        rombel: item.rombel,
        tanggal_lahir: item.tanggal_lahir,
        agama: item.agama,
        alamat: item.alamat,
        totalPoin: item.totalPoin,
      },
    });

    const defaultPassword = `${item.nisn}#sman26`;
    const passwordHash = await argon2.hash(defaultPassword);

    await prisma.user.upsert({
      where: { username: item.nisn },
      update: {
        roleId: roleSiswa.id,
        siswaId: student.id,
        isActive: true,
      },
      create: {
        username: item.nisn,
        passwordHash,
        roleId: roleSiswa.id,
        siswaId: student.id,
        isActive: true,
        mustChangePassword: true,
      },
    });

    console.log(
      `   🎓 Siswa: ${item.nama_siswa} (${item.rombel}) - NISN / Username: ${item.nisn}`
    );
  }

  console.log('\n🎉 Seeding selesai dengan sukses!');
  console.log('----------------------------------------------------');
  console.log('Kredensial Default Login:');
  console.log('• Siswa   : Username = NISN, Password = ${NISN}#sman26');
  console.log('• Guru BK : Username = NIP,  Password = ${NIP}#sman26');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
