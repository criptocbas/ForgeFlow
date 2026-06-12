import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { WalletContextProvider } from "./providers/WalletContextProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForgeFlow | Real-time Perps on FlashTrade + MagicBlock ER",
  description: "Automated strategies & copy trading for FlashTrade perps. Built with MagicBlock Ephemeral Rollups for sub-50ms execution. Solana Blitz v5.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#ededed]">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
