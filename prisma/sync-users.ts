import { prisma } from '@/lib/prisma';
import argon2 from 'argon2';


async function main() {
  console.log('🔄 Memulai sinkronisasi akun ke tabel user pakai argon2...');

  // 1. Ambil role SISWA dan BK
  const roleSiswa = await prisma.role.findFirst({
    where: { nama_role: 'SISWA' },
  });

  const roleBK = await prisma.role.findFirst({
    where: { nama_role: 'BK' },
  });

  if (!roleSiswa || !roleBK) {
    throw new Error("Role 'SISWA' atau 'BK' belum ditemukan di tabel role.");
  }

  // 2. Sinkronisasi Akun Siswa (username: nisn, password: nisn#sman26)
  const siswaList = await prisma.siswa.findMany({
    where: { user: null },
  });

  console.log(`Ditemukan ${siswaList.length} siswa belum punya akun user.`);

  for (const siswa of siswaList) {
    if (!siswa.nisn) continue;

    const defaultPassword = `${siswa.nisn}#sman26`;
    const passwordHash = await argon2.hash(defaultPassword);

    await prisma.user.create({
      data: {
        username: siswa.nisn,
        passwordHash,
        roleId: roleSiswa.id,
        siswaId: siswa.id,
        isActive: true,
        mustChangePassword: true,
      },
    });

    console.log(` Akun Siswa dibuat: ${siswa.nama_siswa ?? 'Siswa'} (${siswa.nisn})`);
  }

  // 3. Sinkronisasi Akun Guru BK (username: nip, password: nip#sman26)
  const counselorList = await prisma.counselor.findMany({
    where: { user: null },
  });

  console.log(`Ditemukan ${counselorList.length} Guru BK belum punya akun user.`);

  for (const counselor of counselorList) {
    const username = counselor.nip ?? `counselor_${counselor.id}`;
    const defaultPassword = `${username}#sman26`;
    const passwordHash = await argon2.hash(defaultPassword);

    await prisma.user.create({
      data: {
        username,
        passwordHash,
        roleId: roleBK.id,
        counselorId: counselor.id,
        isActive: true,
        mustChangePassword: true,
      },
    });

    console.log(` Akun BK dibuat: ${counselor.nama_counselor} (${username})`);
  }

  console.log('🎉 Selesai! Semua akun berhasil dibuat dengan hash argon2.');
}

main()
  .catch((e) => {
    console.error('❌ Gagal sinkronisasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });