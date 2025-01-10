import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Steam Suggester",
  description: "TwitchとSteamを組み合わせたゲーム提案を可視化するウェブサイト。最適なゲーム体験を見つけよう！",
  keywords: ["Steam", "Twitch", "Game Network", "Game Recommendations", "Visualization"],
  openGraph: {
    type: "website",
    title: "Steam Suggester",
    description: "TwitchとSteamを組み合わせたゲーム提案を可視化するウェブサイト。最適なゲーム体験を見つけよう！",
    url: process.env.NEXT_PUBLIC_CURRENT_URL,
    siteName: "Steam Suggester",
    locale: "ja_JP",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_CURRENT_URL}/ogp.png`,
        alt: "Steam Suggester OGP Image",
      },
    ],
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
