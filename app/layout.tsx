import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getPublishedSeoSettings } from "@/lib/cms/queries";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPublishedSeoSettings();
  const keywordList = seo.keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title: seo.site_title,
    description: seo.meta_description,
    keywords: keywordList,
    alternates: seo.canonical_url
      ? { canonical: seo.canonical_url }
      : undefined,
    icons: seo.favicon_url ? { icon: seo.favicon_url } : undefined,
    openGraph: {
      title: seo.og_title || seo.site_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image_url ? [{ url: seo.og_image_url }] : undefined,
    },
    other: {
      "codex-preview": "development",
    },
  };
}

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
