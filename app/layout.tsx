import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto KOL Hub — Web3 Creator & Event Network",
  description:
    "Crypto KOL Hub is an independent Web3 community initiative connecting creators, KOLs, event communities and local market voices under one transparent global network.",
  keywords: [
    "crypto KOL", "Web3 creators", "crypto events", "KOL network",
    "Web3 community", "crypto community", "creator network", "Web3 events",
  ],
  openGraph: {
    title: "Crypto KOL Hub — Web3 Creator & Event Network",
    description:
      "An independent Web3 community initiative connecting creators, KOLs, event communities and ecosystem builders under one transparent network.",
    url: "https://cryptokolhub.com",
    siteName: "Crypto KOL Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto KOL Hub — Web3 Creator & Event Network",
    description:
      "Connecting Web3 creators, events and communities through a transparent global network.",
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
