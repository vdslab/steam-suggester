import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Steam Suggester",
  description:
    "ネットワークグラフ上でゲームの類似度を可視化し、ユーザーが直感的に新しいゲームを探索できるシステムです。",
  keywords: [
    "Steam",
    "Twitch",
    "Game Network",
    "Game Recommendations",
    "Visualization",
  ],
  openGraph: {
    type: "website",
    title: "Steam Suggester",
    description:
      "ネットワークグラフ上でゲームの類似度を可視化し、ユーザーが直感的に新しいゲームを探索できるシステムです。",
    siteName: "Steam Suggester",
    locale: "ja_JP",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_CURRENT_URL}/ogp.png`,
        alt: "Steam Suggester OGP Image",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
