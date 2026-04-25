import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PWAAux from "@/components/PWAAux";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800","900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AsiaAutoService — Boshqaruv Tizimi",
  description: "Professional avtoservis boshqaruv tizimi",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import DataLoader from "@/components/DataLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} h-full`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
        <DataLoader />
        {children}
        <PWAAux />
      </body>
    </html>
  );
}
