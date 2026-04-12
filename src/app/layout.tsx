import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import GlobalNavbar from "@/components/GlobalNavbar";
import PWAAux from "@/components/PWAAux";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800","900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AutoServis Pro — Boshqaruv Tizimi",
  description: "Professional avtoservis boshqaruv tizimi",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} h-full`}>
      <body style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Global navbar — always visible on every page */}
          <GlobalNavbar />
          {/* Page content */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
        <PWAAux />
      </body>
    </html>
  );
}
