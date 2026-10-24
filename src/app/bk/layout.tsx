import { BkLayoutShell } from "@/components/layout/BkLayoutShell";

export const metadata = {
  title: "Portal Guru BK - SMAN 26 Kabupaten Tangerang",
  description:
    "Dashboard administrasi bimbingan konseling, monitoring asesmen, dan evaluasi kedisiplinan siswa SMAN 26 Kabupaten Tangerang.",
};

export default function BkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BkLayoutShell>{children}</BkLayoutShell>;
}
