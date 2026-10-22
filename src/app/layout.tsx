
import type { Metadata } from "next";
import { Poppins, Caveat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sistem Bimbingan Konseling SMAN 26",
  description:
    "Portal layanan Bimbingan Konseling digital terpadu SMA Negeri 26 Kabupaten Tangerang.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${poppins.variable} ${caveat.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased text-[#0f2847] selection:bg-[#185bc3] selection:text-white">
        {children}
      </body>
    </html>
  );
}
