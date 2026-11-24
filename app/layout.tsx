import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Turnkey Pre-Engineered Steel Buildings | Contour Steel",
  description:
    "Contour Steel engineers turnkey Pre-Engineered Buildings (PEB), industrial refineries, factories and high-performance steel buildings across India.",
  other: {
    "codex-preview": "development",
  },
  keywords: [
    "pre-engineered buildings India",
    "PEB manufacturer Hyderabad",
    "turnkey steel buildings",
    "industrial steel structures",
    "industrial refinery steel buildings",
    "pre-engineered factory buildings",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
