import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto KOL Hub — Web3's Gateway from Türkiye to the World",
  description:
    "Crypto KOL Hub is Web3's gateway from Türkiye to the world — connecting Turkish and global Web3 creators, KOLs, events and communities under one transparent platform.",
  keywords: [
    "crypto KOL", "Web3 creators", "crypto events", "KOL network",
    "Web3 community", "Turkey crypto", "Türkiye Web3", "Turkish crypto KOL",
    "Istanbul blockchain", "crypto community Turkey", "creator network", "Web3 events",
    "IBW", "Istanbul Blockchain Week",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Crypto KOL Hub — Web3's Gateway from Türkiye to the World",
    description:
      "Web3's gateway from Türkiye to the world — connecting creators, KOLs and events through a transparent community-first network.",
    url: "https://cryptokolhub.com",
    siteName: "Crypto KOL Hub",
    type: "website",
    images: [{ url: "/logo.png", width: 1080, height: 1080, alt: "Crypto KOL Hub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto KOL Hub — Web3's Gateway from Türkiye to the World",
    description:
      "Web3's gateway from Türkiye to the world. Connecting creators, KOLs and events globally.",
    site: "@cryptokolhub",
    creator: "@cryptokolhub",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://cryptokolhub.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
