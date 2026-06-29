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
    icon: [
      { url: "/logo-icon.png?v=3", sizes: "32x32" },
      { url: "/logo-icon.png?v=3", sizes: "192x192" },
    ],
    apple: "/logo-icon.png?v=3",
    shortcut: "/logo-icon.png?v=3",
  },
};

export const viewport = {
  themeColor: "#e11d2a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import DataLoader from "@/components/DataLoader";
import { Toaster } from "react-hot-toast";

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
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#151921',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              fontWeight: 600,
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' }, duration: 6000 },
          }}
        />
      </body>
    </html>
  );
}
