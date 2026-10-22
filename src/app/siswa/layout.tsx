import { SiswaLayoutShell } from "@/components/layout/SiswaLayoutShell";

export const metadata = {
  title: "Sistem Bimbingan Konseling SMAN 26 Kabupaten Tangerang",
  description: "Ringkasan tes, jadwal bimbingan konseling, asesmen, dan kedisiplinan siswa SMAN 26 Kabupaten Tangerang.",
};

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiswaLayoutShell>{children}</SiswaLayoutShell>;
}
